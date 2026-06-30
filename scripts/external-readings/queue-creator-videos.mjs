#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const CREATOR_DEFAULTS = {
  cam: {
    creator: 'Cam White',
    creator_key: 'cam',
    default_extraction_profile: 'cam_transit_rising',
    audience_mode: 'rising_sign',
    creator_mode: 'technical_astrology',
    syd_section: 'Pisces',
    sign_basis: 'rising',
  },
  jimmy: {
    creator: 'The Tarot Sh*t with Jimmy',
    creator_key: 'jimmy',
    default_extraction_profile: 'jimmy_hybrid_sign',
    audience_mode: 'sun_moon_rising',
    creator_mode: 'hybrid_astrology_tarot',
    syd_section: 'Scorpio',
    sign_basis: 'sun',
  },
  '303': {
    creator: '303 High Priestess',
    creator_key: '303',
    default_extraction_profile: 'three_oh_three_timed',
    audience_mode: 'sun_moon_rising_venus',
    creator_mode: 'intuitive_tarot_ritual',
    syd_section: 'Scorpio',
    sign_basis: 'resonance',
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
  npm run queue:creator -- --creator cam --urls "https://youtu.be/VIDEO1,https://youtube.com/watch?v=VIDEO2"
  npm run queue:creator -- --creator jimmy --handle "@ChannelHandle" --max 25
  npm run queue:creator -- --creator 303 --channel-id "UCxxxxxxxx" --max 25

Notes:
  - Bulk links need no API key.
  - Channel/handle pull requires YOUTUBE_API_KEY in .env.local or your shell.
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

function readUrls(args) {
  const values = [];
  if (args.urls) values.push(...String(args.urls).split(/[\n,]+/));
  if (args['links-file']) {
    const file = path.resolve(String(args['links-file']));
    if (!fs.existsSync(file)) throw new Error(`links-file not found: ${file}`);
    values.push(...fs.readFileSync(file, 'utf8').split(/\r?\n/));
  }
  return values.map((value) => value.trim()).filter(Boolean);
}

function inferPeriod(title = '') {
  const text = title.toLowerCase();
  if (text.includes('timeless')) return 'Timeless';
  const year = text.match(/\b20\d{2}\b/);
  if (year) return year[0];
  const month = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
  if (month) return month[0][0].toUpperCase() + month[0].slice(1).toLowerCase();
  return null;
}

function inferProfileFromTitle(defaults, title = '') {
  const lower = title.toLowerCase();
  if (defaults.creator_key === 'jimmy' && (lower.includes('all signs') || lower.includes('overview'))) return 'jimmy_collective_overview';
  if (defaults.creator_key === '303' && lower.includes('timeless')) return 'three_oh_three_timeless';
  return defaults.default_extraction_profile;
}

function makeQueueItem({ defaults, videoId, url, title = null, publishedAt = null, source = 'bulk_links' }) {
  const extraction_profile = inferProfileFromTitle(defaults, title || '');
  return {
    id: `${defaults.creator_key}:${videoId}`,
    creator_key: defaults.creator_key,
    creator: defaults.creator,
    video_id: videoId,
    url: url || `https://www.youtube.com/watch?v=${videoId}`,
    title,
    published_at: publishedAt,
    period_label: inferPeriod(title || ''),
    extraction_profile,
    audience_mode: defaults.creator_key === 'jimmy' && extraction_profile === 'jimmy_collective_overview' ? 'all_signs_general' : defaults.audience_mode,
    creator_mode: defaults.creator_key === 'jimmy' && extraction_profile === 'jimmy_collective_overview' ? 'collective_astrology_overview' : defaults.creator_mode,
    syd_section: defaults.creator_key === 'jimmy' && extraction_profile === 'jimmy_collective_overview' ? 'Collective' : defaults.syd_section,
    sign_basis: defaults.creator_key === 'jimmy' && extraction_profile === 'jimmy_collective_overview' ? 'collective' : defaults.sign_basis,
    status: 'queued',
    source,
    transcript_path: null,
    review_json_path: null,
    notes: null,
    queued_at: new Date().toISOString(),
  };
}

async function youtubeGet(endpoint, params) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY is required for channel/handle pulls. Add it to .env.local or your shell.');
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

async function fetchUploads({ uploadsPlaylistId, max }) {
  const out = [];
  let pageToken = '';
  while (out.length < max) {
    const data = await youtubeGet('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
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
    schema_version: '0.1.0',
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
    byId.set(item.id, { ...old, ...Object.fromEntries(Object.entries(item).filter(([, v]) => v !== null && v !== undefined)), status: old.status || item.status, transcript_path: old.transcript_path || item.transcript_path, review_json_path: old.review_json_path || item.review_json_path, notes: old.notes || item.notes });
    updated += 1;
  }
  return { videos: [...byId.values()], added, updated };
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
  const max = Math.max(1, Number(args.max || 25));
  const incoming = [];

  const urls = readUrls(args);
  for (const rawUrl of urls) {
    const videoId = extractYouTubeId(rawUrl);
    if (!videoId) continue;
    incoming.push(makeQueueItem({ defaults, videoId, url: rawUrl, source: 'bulk_links' }));
  }

  if (args['channel-id'] || args.handle) {
    const channel = await resolveUploadsPlaylist({ channelId: args['channel-id'], handle: args.handle });
    if (!channel.uploads_playlist_id) throw new Error(`No uploads playlist found for ${channel.channel_title || channel.channel_id}`);
    const uploads = await fetchUploads({ uploadsPlaylistId: channel.uploads_playlist_id, max });
    for (const video of uploads) {
      incoming.push(makeQueueItem({ defaults, videoId: video.videoId, title: video.title, publishedAt: video.publishedAt, source: args.handle ? 'youtube_handle_uploads' : 'youtube_channel_uploads' }));
    }
  }

  if (!incoming.length) {
    console.error('No videos found. Provide --links-file, --urls, --channel-id, or --handle.');
    process.exit(1);
  }

  const existing = loadExistingQueue(queuePath);
  const merged = mergeVideos(existing.videos, incoming);
  saveQueue(queuePath, { videos: merged.videos });

  console.log(JSON.stringify({ ok: true, queuePath, incoming: incoming.length, added: merged.added, updated: merged.updated, total: merged.videos.length, creator: defaults.creator }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
