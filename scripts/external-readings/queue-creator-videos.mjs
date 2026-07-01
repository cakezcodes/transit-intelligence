#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const OPPOSITES = {
  Aries: 'Libra',
  Taurus: 'Scorpio',
  Gemini: 'Sagittarius',
  Cancer: 'Capricorn',
  Leo: 'Aquarius',
  Virgo: 'Pisces',
  Libra: 'Aries',
  Scorpio: 'Taurus',
  Sagittarius: 'Gemini',
  Capricorn: 'Cancer',
  Aquarius: 'Leo',
  Pisces: 'Virgo',
};

const CREATOR_DEFAULTS = {
  cam: {
    creator: 'Cam White',
    creator_key: 'cam',
    default_extraction_profile: 'cam_transit_rising',
    audience_mode: 'rising_sign',
    creator_mode: 'technical_astrology',
    syd_section: 'Pisces',
    sign_basis: 'rising',
    reading_scope: 'rising_sign_forecast',
  },
  jimmy: {
    creator: 'The Tarot Sh*t with Jimmy',
    creator_key: 'jimmy',
    default_extraction_profile: 'jimmy_hybrid_sign',
    audience_mode: 'sun_moon_rising',
    creator_mode: 'hybrid_astrology_tarot',
    syd_section: 'Scorpio',
    sign_basis: 'sun_moon_rising',
    reading_scope: 'single_sign_hybrid_reading',
  },
  '303': {
    creator: '303 High Priestess',
    creator_key: '303',
    default_extraction_profile: 'three_oh_three_timed',
    audience_mode: 'sun_moon_rising_venus',
    creator_mode: 'intuitive_tarot_ritual',
    syd_section: 'Scorpio',
    sign_basis: 'sun_moon_rising_venus',
    reading_scope: 'single_sign_tarot_ritual_reading',
  },
};

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith('--')) continue;
    const key = raw.slice(2);
    const next = argv[i + 1];
    args[key] = next && !next.startsWith('--') ? argv[++i] : true;
  }
  return args;
}

function usage() {
  console.log(`Usage:
  npm run queue:creator -- --creator cam|jimmy|303 --links-file data/external-readings/links.txt
  npm run queue:creator -- --creator jimmy --links-file data/external-readings/jimmy-june-2026.txt --period "June 2026"
  npm run queue:creator -- --creator cam --urls "https://youtu.be/VIDEO1,https://youtube.com/watch?v=VIDEO2" --target-sign Pisces --period "2026"
  npm run queue:creator -- --creator jimmy --playlist-url "https://www.youtube.com/playlist?list=PLAYLIST_ID" --period "June 2026"
  npm run queue:creator -- --creator 303 --handle "@ChannelHandle" --max 25

Notes:
  - Bulk video links need no API key.
  - Playlist/channel/handle pull requires YOUTUBE_API_KEY in .env.local or your shell.
  - This queues video metadata only. Transcript fetch/parsing remains a separate reviewed step.
`);
}

function loadDotEnvLocal() {
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function creatorDefaults(key) {
  const normalized = String(key || '').toLowerCase();
  const defaults = CREATOR_DEFAULTS[normalized];
  if (!defaults) throw new Error(`Unknown creator "${key}". Use cam, jimmy, or 303.`);
  return defaults;
}

function extractYouTubeId(urlOrId) {
  const raw = String(urlOrId || '').trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || null;
    if (url.searchParams.get('v')) return url.searchParams.get('v');
    const shorts = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shorts) return shorts[1];
    const live = url.pathname.match(/\/live\/([a-zA-Z0-9_-]{11})/);
    if (live) return live[1];
  } catch {
    return null;
  }
  return null;
}

function extractPlaylistId(urlOrId) {
  const raw = String(urlOrId || '').trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{16,}$/.test(raw) && raw.startsWith('PL')) return raw;
  try {
    const url = new URL(raw);
    return url.searchParams.get('list') || null;
  } catch {
    return null;
  }
}

function readUrls(args) {
  const values = [];
  if (args.urls) values.push(...String(args.urls).split(/[\n,]+/));
  if (args['links-file']) {
    const file = path.resolve(String(args['links-file']));
    if (!fs.existsSync(file)) throw new Error(`links-file not found: ${file}`);
    values.push(...fs.readFileSync(file, 'utf8').split(/\r?\n/));
  }
  return values.map((value) => value.trim()).filter((value) => value && !value.startsWith('#'));
}

function properSign(value) {
  if (!value) return null;
  const match = SIGNS.find((sign) => sign.toLowerCase() === String(value).toLowerCase());
  return match || null;
}

function inferTargetSign(title = '') {
  const text = String(title || '').toLowerCase();
  for (const sign of SIGNS) {
    const pattern = new RegExp(`(^|[^a-z])${sign.toLowerCase()}([^a-z]|$)`);
    if (pattern.test(text)) return sign;
  }
  return null;
}

function axisForSign(sign) {
  if (!sign || !OPPOSITES[sign]) return null;
  return [sign, OPPOSITES[sign]].sort().join('-');
}

function inferPeriod(title = '', fallback = null) {
  const text = String(title || '').toLowerCase();
  if (text.includes('timeless')) return 'Timeless';
  const monthYear = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+20\d{2}\b/i);
  if (monthYear) return monthYear[0].replace(/\b\w/g, (c) => c.toUpperCase());
  const year = text.match(/\b20\d{2}\b/);
  const month = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
  if (month && fallback && /20\d{2}/.test(fallback)) return `${month[0][0].toUpperCase()}${month[0].slice(1).toLowerCase()} ${fallback.match(/20\d{2}/)[0]}`;
  if (month) return month[0][0].toUpperCase() + month[0].slice(1).toLowerCase();
  if (year) return year[0];
  return fallback;
}

function inferTimeTier(periodLabel = '', title = '') {
  const text = `${periodLabel || ''} ${title || ''}`.toLowerCase();
  if (text.includes('timeless')) return 'timeless';
  if (/\b20\d{2}\b/.test(text) && !/(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(text)) return 'yearly';
  if (/(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(text)) return 'monthly';
  if (text.includes('week') || /\b\d{1,2}\s*-\s*\d{1,2}\b/.test(text)) return 'weekly';
  return 'unknown';
}

function inferProfileFromTitle(defaults, title = '') {
  const lower = title.toLowerCase();
  if (defaults.creator_key === 'jimmy' && (lower.includes('all signs') || lower.includes('overview'))) return 'jimmy_collective_overview';
  if (defaults.creator_key === '303' && lower.includes('timeless')) return 'three_oh_three_timeless';
  return defaults.default_extraction_profile;
}

function makeQueueItem({ defaults, videoId, url, title = null, publishedAt = null, source = 'bulk_links', args = {} }) {
  const extraction_profile = args.profile && args.profile !== 'auto' ? String(args.profile) : inferProfileFromTitle(defaults, title || '');
  const explicitTargetSign = properSign(args['target-sign']);
  const inferredTargetSign = explicitTargetSign || inferTargetSign(title || '');
  const isJimmyOverview = defaults.creator_key === 'jimmy' && extraction_profile === 'jimmy_collective_overview';
  const target_sign = isJimmyOverview ? 'Collective' : inferredTargetSign;
  const period_label = inferPeriod(title || '', args.period || null);
  const opposite_sign = SIGNS.includes(target_sign) ? OPPOSITES[target_sign] : null;
  const axis = SIGNS.includes(target_sign) ? axisForSign(target_sign) : null;

  return {
    id: `${defaults.creator_key}:${videoId}`,
    creator_key: defaults.creator_key,
    creator: defaults.creator,
    video_id: videoId,
    url: url || `https://www.youtube.com/watch?v=${videoId}`,
    title,
    published_at: publishedAt,
    target_sign,
    opposite_sign,
    axis,
    period_label,
    time_tier: inferTimeTier(period_label, title || ''),
    reading_scope: isJimmyOverview ? 'collective_overview' : defaults.reading_scope,
    extraction_profile,
    audience_mode: isJimmyOverview ? 'all_signs_general' : defaults.audience_mode,
    creator_mode: isJimmyOverview ? 'collective_astrology_overview' : defaults.creator_mode,
    syd_section: isJimmyOverview ? 'Collective' : defaults.syd_section,
    sign_basis: isJimmyOverview ? 'collective' : defaults.sign_basis,
    status: 'queued',
    source,
    transcript_path: null,
    review_json_path: null,
    notes: target_sign ? null : 'Target sign not inferred from title. Add --target-sign or edit videos.json after queueing.',
    queued_at: new Date().toISOString(),
  };
}

async function youtubeGet(endpoint, params) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY is required for playlist/channel/handle pulls. Add it to .env.local or your shell.');
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries({ ...params, key })) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${endpoint} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function resolveUploadsPlaylist({ channelId, handle }) {
  const params = { part: 'contentDetails,snippet', maxResults: 1 };
  if (channelId) params.id = channelId;
  else if (handle) params.forHandle = handle;
  else throw new Error('channel-id or handle is required for channel pull.');

  const data = await youtubeGet('channels', params);
  const item = data.items?.[0];
  if (!item) throw new Error(`No YouTube channel found for ${channelId || handle}`);
  return {
    channel_id: item.id,
    channel_title: item.snippet?.title || null,
    uploads_playlist_id: item.contentDetails?.relatedPlaylists?.uploads,
  };
}

async function fetchPlaylistItems({ playlistId, max }) {
  const out = [];
  let pageToken = '';
  while (out.length < max) {
    const data = await youtubeGet('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: Math.min(50, max - out.length),
      pageToken,
    });
    for (const item of data.items || []) {
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      if (!videoId) continue;
      out.push({
        videoId,
        title: item.snippet?.title || null,
        publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || null,
      });
    }
    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }
  return out;
}

function loadExistingQueue(queuePath) {
  if (!fs.existsSync(queuePath)) return { videos: [] };
  const raw = fs.readFileSync(queuePath, 'utf8').trim();
  if (!raw) return { videos: [] };
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { videos: parsed };
  return { videos: Array.isArray(parsed.videos) ? parsed.videos : [] };
}

function saveQueue(queuePath, queue) {
  fs.mkdirSync(path.dirname(queuePath), { recursive: true });
  const payload = {
    schema_version: '0.2.0',
    updated_at: new Date().toISOString(),
    videos: queue.videos,
  };
  fs.writeFileSync(queuePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function mergeVideos(existing, incoming) {
  const byId = new Map(existing.map((item) => [item.id, item]));
  let added = 0;
  let updated = 0;
  for (const item of incoming) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
      added += 1;
      continue;
    }
    const old = byId.get(item.id);
    byId.set(item.id, {
      ...old,
      ...Object.fromEntries(Object.entries(item).filter(([, v]) => v !== null && v !== undefined)),
      status: old.status || item.status,
      transcript_path: old.transcript_path || item.transcript_path,
      review_json_path: old.review_json_path || item.review_json_path,
      notes: old.notes || item.notes,
    });
    updated += 1;
  }
  return { videos: [...byId.values()], added, updated };
}

function summarizeCoverage(videos) {
  const bySign = Object.fromEntries([...SIGNS, 'Collective', 'Unknown'].map((sign) => [sign, 0]));
  for (const video of videos) {
    const sign = video.target_sign || 'Unknown';
    bySign[bySign[sign] === undefined ? 'Unknown' : sign] += 1;
  }
  return bySign;
}

async function main() {
  loadDotEnvLocal();
  const args = parseArgs(process.argv);
  if (!args.creator) {
    usage();
    process.exit(1);
  }

  const defaults = creatorDefaults(args.creator);
  const queuePath = path.resolve(String(args.queue || 'data/external-readings/videos.json'));
  const max = Math.max(1, Number(args.max || 50));
  const incoming = [];

  const urls = readUrls(args);
  for (const rawUrl of urls) {
    const playlistId = extractPlaylistId(rawUrl);
    const videoId = extractYouTubeId(rawUrl);
    if (playlistId && !videoId) {
      const playlistItems = await fetchPlaylistItems({ playlistId, max });
      for (const video of playlistItems) {
        incoming.push(makeQueueItem({ defaults, videoId: video.videoId, title: video.title, publishedAt: video.publishedAt, source: 'youtube_playlist_from_links_file', args }));
      }
      continue;
    }
    if (!videoId) continue;
    incoming.push(makeQueueItem({ defaults, videoId, url: rawUrl, source: 'bulk_links', args }));
  }

  if (args['playlist-url'] || args['playlist-id']) {
    const playlistId = args['playlist-id'] || extractPlaylistId(args['playlist-url']);
    if (!playlistId) throw new Error('Could not read playlist id from --playlist-url/--playlist-id.');
    const playlistItems = await fetchPlaylistItems({ playlistId, max });
    for (const video of playlistItems) {
      incoming.push(makeQueueItem({ defaults, videoId: video.videoId, title: video.title, publishedAt: video.publishedAt, source: 'youtube_playlist', args }));
    }
  }

  if (args['channel-id'] || args.handle) {
    const channel = await resolveUploadsPlaylist({ channelId: args['channel-id'], handle: args.handle });
    if (!channel.uploads_playlist_id) throw new Error(`No uploads playlist found for ${channel.channel_title || channel.channel_id}`);
    const uploads = await fetchPlaylistItems({ playlistId: channel.uploads_playlist_id, max });
    for (const video of uploads) {
      incoming.push(makeQueueItem({ defaults, videoId: video.videoId, title: video.title, publishedAt: video.publishedAt, source: args.handle ? 'youtube_handle_uploads' : 'youtube_channel_uploads', args }));
    }
  }

  if (!incoming.length) {
    console.error('No videos found. Provide --links-file, --urls, --playlist-url, --playlist-id, --channel-id, or --handle.');
    process.exit(1);
  }

  const existing = loadExistingQueue(queuePath);
  const merged = mergeVideos(existing.videos, incoming);
  saveQueue(queuePath, { videos: merged.videos });

  console.log(JSON.stringify({
    ok: true,
    queuePath,
    incoming: incoming.length,
    added: merged.added,
    updated: merged.updated,
    total: merged.videos.length,
    creator: defaults.creator,
    period: args.period || null,
    coverage_for_incoming: summarizeCoverage(incoming),
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
