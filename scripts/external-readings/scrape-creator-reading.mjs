#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','North Node','South Node','Juno','Ceres','Eris'];
const ASPECT_WORDS = ['conjunct','conjunction','opposite','opposition','square','trine','sextile','retrograde','direct','station','cazimi','ingress','eclipse','new moon','full moon','shadow'];
const THEME_WORDS = ['career','visibility','fame','home','family','relationship','relationships','marriage','partnership','money','wealth','work','routine','health','children','romance','creative','spiritual','intuition','awakening','communication','technology','legacy','protection','release','confidence','truth','secrets','shadow','healing','debt','court','case','divorce','travel','education'];
const ORACLE_WORDS = ['angel number','magic','chopped wood','grounded','observer','trust the darkness','dead end','bankrupt','hand of god','message in a bottle','milk and honey','serendipity'];
const RITUAL_WORDS = ['ritual','money jar','petition','sigil','candle','herbs','crystals','spell','oil','cinnamon','sugar','coins','jar','moon phase','new moon','full moon','bay leaf','mason jar','green candle','white candle','brown sugar','intention'];
const TAROT_CARDS = [
  'The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','Judgment','The World',
  ...['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'].flatMap((rank) => ['Wands','Cups','Swords','Pentacles'].map((suit) => `${rank} of ${suit}`)),
];

const CREATOR_PROFILES = {
  cam: {
    label: 'Cam White',
    aliases: ['cam', 'cam white'],
    creator_mode: 'technical_astrology',
    default_reading_type: 'transit',
    default_audience_mode: 'rising_sign',
    default_extraction_profile: 'cam_transit_rising',
    syd_section: 'Pisces',
    syd_sign_basis: 'rising',
    section_kind: 'rising_sign_section',
    calendar_import: true,
    allowed_extractors: ['technical_transits','house_claims','dates','degrees','dignity','rising_sign_section'],
    disabled_extractors: ['tarot','oracle','ritual'],
    review_title: 'Technical Transit / Rising Sign Review',
  },
  jimmy: {
    label: 'The Tarot Sh*t with Jimmy',
    aliases: ['jimmy', 'tarot shit', 'tarot sh*t'],
    creator_mode: 'hybrid_astrology_tarot',
    default_reading_type: 'hybrid',
    default_audience_mode: 'sun_moon_rising',
    default_extraction_profile: 'jimmy_hybrid_sign',
    syd_section: 'Scorpio',
    syd_sign_basis: 'sun',
    section_kind: 'sign_section',
    calendar_import: true,
    allowed_extractors: ['technical_transits','house_claims','dates','degrees','tarot','themes','collective_overview'],
    disabled_extractors: ['ritual'],
    review_title: 'Hybrid Astrology + Tarot Review',
  },
  '303': {
    label: '303 High Priestess',
    aliases: ['303', 'high priestess'],
    creator_mode: 'intuitive_tarot_ritual',
    default_reading_type: 'tarot_ritual',
    default_audience_mode: 'sun_moon_rising_venus',
    default_extraction_profile: 'three_oh_three_timed',
    syd_section: 'Scorpio',
    syd_sign_basis: 'resonance',
    section_kind: 'theme_segment',
    calendar_import: true,
    allowed_extractors: ['tarot','oracle','ritual','themes','dates'],
    disabled_extractors: ['technical_dignity'],
    review_title: 'Intuitive Tarot + Ritual Review',
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
  npm run scrape:creator -- --creator cam|jimmy|303 --file "path/to/transcript.txt" [--url "source url"] [--title "Video title"] [--period "July 2026"] [--profile auto|three_oh_three_timeless|jimmy_collective_overview] [--out-dir data/external-readings/reviews]

Examples:
  npm run scrape:creator -- --creator cam --file "data/external-readings/raw/Cam jupirer.txt" --period "Jupiter in Leo"
  npm run scrape:creator -- --creator jimmy --file "data/external-readings/raw/Scorpio year jimmy.txt" --period "2026"
  npm run scrape:creator -- --creator 303 --file "data/external-readings/raw/Timeless Scorpio.txt" --profile three_oh_three_timeless --period "Timeless"
`);
}

function getProfile(creator) {
  const key = String(creator || '').toLowerCase();
  return CREATOR_PROFILES[key] || Object.values(CREATOR_PROFILES).find((profile) => profile.aliases.some((alias) => key.includes(alias)));
}

function normalizeText(text) {
  return text.replace(/\r/g, '').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"');
}

function chunks(text) {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function slugify(value) {
  return String(value || 'creator-reading')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90);
}

function extractTimestamp(line) {
  const match = line.match(/(?:(\d+):)?(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return (match[1] ? Number(match[1]) * 3600 : 0) + Number(match[2]) * 60 + Number(match[3]);
}

function context(lines, index, span = 1) {
  return lines.slice(Math.max(0, index - span), Math.min(lines.length, index + span + 1)).join(' ');
}

function uniqueBy(items, fn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = String(fn(item) || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function inferTimeTier({ text, period, profileName }) {
  const lower = `${period || ''}\n${text}`.toLowerCase();
  if (profileName === 'three_oh_three_timeless' || lower.includes('timeless')) return 'timeless';
  if (lower.includes('2026') || lower.includes('year') || lower.includes('annual')) return 'yearly';
  if (lower.includes('week') || /\b\d{1,2}\s*-\s*\d{1,2}\b/.test(lower)) return 'weekly';
  if (lower.includes('month') || /(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(lower)) return 'monthly';
  return 'unknown';
}

function inferProfileOverride({ base, text, explicitProfile }) {
  const lower = text.toLowerCase();
  const out = { ...base };
  if (explicitProfile && explicitProfile !== 'auto') out.default_extraction_profile = explicitProfile;
  if (out.default_extraction_profile === 'three_oh_three_timeless' || lower.includes('timeless')) {
    out.default_extraction_profile = 'three_oh_three_timeless';
    out.calendar_import = false;
  }
  if (out.label.includes('Jimmy') && (lower.includes('all signs') || lower.includes('overview') || lower.includes('preface'))) {
    out.default_extraction_profile = 'jimmy_collective_overview';
    out.creator_mode = 'collective_astrology_overview';
    out.default_reading_type = 'collective_overview';
    out.default_audience_mode = 'all_signs_general';
    out.syd_section = 'Collective';
    out.syd_sign_basis = 'collective';
    out.section_kind = 'collective_overview';
  }
  return out;
}

function findSignMarkers(lines) {
  const markers = [];
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    for (const sign of SIGNS) {
      const signLower = sign.toLowerCase();
      const looksLikeHeader = lower === signLower || lower.includes(`${signLower} rising`) || lower.includes(`for ${signLower}`) || lower.includes(`${signLower} sun`) || lower.includes(`${signLower},`);
      if (!looksLikeHeader) continue;
      markers.push({ sign, index, timestamp_seconds: extractTimestamp(line), line });
    }
  });
  return uniqueBy(markers, (m) => `${m.sign}:${m.index}`);
}

function sliceTargetSection(lines, targetSign) {
  if (!targetSign || ['Collective','Unknown'].includes(targetSign)) {
    return { mode: 'whole_transcript', lines, markers: [] };
  }
  const markers = findSignMarkers(lines);
  const marker = markers.find((m) => m.sign === targetSign);
  if (!marker) return { mode: 'whole_transcript_target_marker_not_found', lines, markers };
  const laterMarkers = markers.filter((m) => m.index > marker.index).sort((a, b) => a.index - b.index);
  const end = laterMarkers[0]?.index || lines.length;
  return { mode: 'detected_target_section', lines: lines.slice(marker.index, end), markers };
}

function extractAstrologyClaims(lines) {
  const datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\b|\b\d{1,2}\/\d{1,2}\b/gi;
  const degreePattern = /\b\d{1,2}\s?(?:°|degrees?)\b/gi;
  const claims = [];
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    const dates = line.match(datePattern) || [];
    const degrees = line.match(degreePattern) || [];
    const planets = PLANETS.filter((planet) => lower.includes(planet.toLowerCase()));
    const aspect_words = ASPECT_WORDS.filter((word) => lower.includes(word));
    if (!dates.length && !degrees.length && !aspect_words.length) return;
    if (!planets.length && !dates.length && !degrees.length) return;
    claims.push({
      stated_date_or_marker: dates[0] || null,
      stated_degrees: degrees,
      planets_or_points: planets,
      aspect_words,
      claim_text: context(lines, index),
      timestamp_seconds: extractTimestamp(line),
      needs_celestine_verification: true,
      confidence: 'draft',
    });
  });
  return uniqueBy(claims, (claim) => claim.claim_text).slice(0, 60);
}

function extractHouseClaims(lines) {
  const pattern = /\b(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\s+house\b/gi;
  const claims = [];
  lines.forEach((line, index) => {
    const matches = line.match(pattern) || [];
    matches.forEach((house_claim) => claims.push({
      house_claim,
      context: context(lines, index),
      timestamp_seconds: extractTimestamp(line),
      needs_celestine_verification: true,
      confidence: 'draft',
    }));
  });
  return uniqueBy(claims, (claim) => claim.context).slice(0, 40);
}

function extractCards(lines) {
  const found = [];
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    TAROT_CARDS.forEach((card) => {
      if (!lower.includes(card.toLowerCase())) return;
      found.push({
        card_name_raw: card === 'Judgment' ? 'Judgement' : card,
        position: null,
        position_order: found.length + 1,
        is_reversed: /reversed|reverse/i.test(context(lines, index)),
        creator_interpretation_context: context(lines, index, 2),
        timestamp_seconds: extractTimestamp(line),
        needs_card_review: true,
        confidence: 'draft',
      });
    });
  });
  return uniqueBy(found, (card) => card.card_name_raw);
}

function extractKeywordContexts(lines, words, label) {
  const found = [];
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    words.forEach((word) => {
      if (!lower.includes(word.toLowerCase())) return;
      found.push({
        [label]: word,
        context: context(lines, index),
        timestamp_seconds: extractTimestamp(line),
        confidence: 'draft',
      });
    });
  });
  return uniqueBy(found, (item) => `${item[label]}:${item.context}`).slice(0, 40);
}

function extractThemes(lines) {
  const matches = extractKeywordContexts(lines, THEME_WORDS, 'theme');
  const counts = new Map();
  const firstContext = new Map();
  matches.forEach((match) => {
    counts.set(match.theme, (counts.get(match.theme) || 0) + 1);
    if (!firstContext.has(match.theme)) firstContext.set(match.theme, match.context);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([theme, count]) => ({ theme, count, example_context: firstContext.get(theme) }));
}

function extractRitual(lines) {
  const steps = extractKeywordContexts(lines, RITUAL_WORDS, 'trigger');
  return {
    detected: steps.length > 0,
    ingredients_or_tools: [...new Set(steps.map((step) => step.trigger))],
    steps_or_context: steps.slice(0, 30),
    needs_human_review: steps.length > 0,
  };
}

function buildCreatorSpecificReview({ profile, section, allLines }) {
  if (profile.default_extraction_profile === 'cam_transit_rising') {
    return {
      review_title: profile.review_title,
      parser_expectations: [
        'Read by rising sign, not Sun sign.',
        'For Syd, target section is Pisces rising.',
        'Extract dates, degrees, stations, cazimis, aspects, dignity notes, and house claims.',
        'Do not extract tarot, oracle, or ritual fields for Cam.',
      ],
      no_tarot_expected: true,
      section_detection: section.mode,
    };
  }
  if (profile.default_extraction_profile === 'jimmy_collective_overview') {
    return {
      review_title: 'Jimmy Collective Overview Review',
      parser_expectations: [
        'Treat as collective/all-signs context, not Scorpio-specific.',
        'Extract date waves, outer-planet configurations, collective language, and calendar relevance.',
        'Tarot may be absent; do not force cards.',
      ],
      section_detection: section.mode,
    };
  }
  if (profile.default_extraction_profile === 'jimmy_hybrid_sign') {
    return {
      review_title: profile.review_title,
      parser_expectations: [
        'Treat as Scorpio sun/moon/rising resonance for Syd unless the source states another basis.',
        'Extract both astrology claims and tarot card pulls.',
        'Flag house claims for Celestine verification.',
      ],
      section_detection: section.mode,
    };
  }
  if (profile.default_extraction_profile.includes('three_oh_three')) {
    return {
      review_title: profile.review_title,
      parser_expectations: [
        'Treat as Scorpio resonance/sign-cluster material.',
        'Extract tarot, oracle, angel numbers, rituals, ingredients, practical action steps, and themes.',
        'Timed readings may calendar-import; timeless readings should not auto-import unless dated timing is explicit.',
      ],
      section_detection: section.mode,
    };
  }
  return { review_title: 'Generic Creator Review', parser_expectations: [], section_detection: section.mode };
}

function buildReview({ args, sourceText, file }) {
  const base = getProfile(args.creator);
  if (!base) throw new Error(`Unknown creator: ${args.creator}. Use cam, jimmy, or 303.`);
  const allLines = chunks(sourceText);
  const profile = inferProfileOverride({ base, text: sourceText, explicitProfile: args.profile });
  const time_tier = inferTimeTier({ text: sourceText, period: args.period, profileName: profile.default_extraction_profile });
  const section = sliceTargetSection(allLines, profile.syd_section);
  const targetLines = section.lines;

  const includeTarot = !profile.disabled_extractors.includes('tarot') && !profile.default_extraction_profile.includes('cam_');
  const includeOracle = !profile.default_extraction_profile.includes('cam_');
  const includeRitual = profile.allowed_extractors.includes('ritual') || profile.default_extraction_profile.includes('three_oh_three');

  const astrology_claims = extractAstrologyClaims(targetLines);
  const house_claims = extractHouseClaims(targetLines);
  const tarot_cards = includeTarot ? extractCards(targetLines) : [];
  const oracle_or_angel_numbers = includeOracle ? extractKeywordContexts(targetLines, ORACLE_WORDS, 'name_raw') : [];
  const ritual = includeRitual ? extractRitual(targetLines) : { detected: false, ingredients_or_tools: [], steps_or_context: [], needs_human_review: false };
  const themes = extractThemes(targetLines);

  return {
    review_version: '0.2.0-creator-scraper-scaffold',
    warning: 'Draft creator scrape/review only. This does not load Supabase. Verify astrology with Celestine and review card/ritual extraction before saving.',
    source: {
      creator: profile.label,
      source_title: args.title || path.basename(file || 'manual-transcript'),
      source_url: args.url || null,
      source_type: 'transcript',
      reading_type: profile.default_reading_type,
      time_tier,
      period_label: args.period || null,
      audience_mode: profile.default_audience_mode,
      creator_mode: profile.creator_mode,
      extraction_profile: profile.default_extraction_profile,
      calendar_import: profile.default_extraction_profile === 'three_oh_three_timeless' ? false : profile.calendar_import,
      transcript_status: 'scraped_to_review_json',
      transcript_hash: sha256(sourceText),
      transcript_stats: {
        characters: sourceText.length,
        chunks: allLines.length,
        target_section_chunks: targetLines.length,
        has_timestamps: /\b\d{1,2}:\d{2}\b/.test(sourceText),
      },
    },
    syd_match: {
      section_for_syd: profile.syd_section,
      sign_basis: profile.syd_sign_basis,
      section_kind: profile.section_kind,
      audience_mode: profile.default_audience_mode,
    },
    creator_specific_review: buildCreatorSpecificReview({ profile, section, allLines }),
    section: {
      sign: profile.syd_section,
      sign_basis: profile.syd_sign_basis,
      audience_mode: profile.default_audience_mode,
      section_kind: profile.section_kind,
      calendar_import: profile.default_extraction_profile === 'three_oh_three_timeless' ? false : profile.calendar_import,
      section_detection_mode: section.mode,
      sign_markers_seen: section.markers?.map((m) => ({ sign: m.sign, index: m.index, timestamp_seconds: m.timestamp_seconds, line: m.line })).slice(0, 30) || [],
      themes,
      astrology_claims,
      house_claims,
      tarot_cards,
      oracle_or_angel_numbers,
      ritual,
    },
    loader_preview: {
      reading_sources_fields: ['creator','source_url','source_type','reading_type','time_tier','period_label','source_title','raw_transcript','transcript_status','audience_mode','creator_mode','extraction_profile','calendar_import'],
      reading_source_sections_fields: ['source_id','sign','section_order','starts_at_seconds','ends_at_seconds','summary','themes','transits','key_dates','ritual','creator_notes','audience_mode','sign_basis','section_kind','calendar_import'],
      reading_section_cards_fields: ['section_id','card_name_raw','position','position_order','is_reversed','creator_astro_note','interpretation_note','extraction_confidence'],
      next_step: 'After human review, a loader script can insert this JSON into Supabase tables.',
    },
    review_checklist: [
      'Confirm creator profile and extraction_profile.',
      'Confirm Syd sign basis: Cam=Pisces rising; Jimmy=Scorpio unless collective; 303=Scorpio resonance.',
      'Confirm target section detection. If the transcript has chapters and this says whole_transcript, add timestamps or split manually.',
      'Confirm tarot/oracle names before linking to tarot_cards.',
      'Confirm dates, degrees, aspects, and house claims with Celestine before marking verified.',
      'Do not store long creator prose as meaning text; save distilled notes only.',
    ],
  };
}

function writeOutput({ review, outDir }) {
  fs.mkdirSync(outDir, { recursive: true });
  const base = slugify(`${review.source.creator}-${review.source.period_label || review.source.source_title}-${review.source.extraction_profile}`);
  const outPath = path.join(outDir, `${base}.review.json`);
  fs.writeFileSync(outPath, JSON.stringify(review, null, 2));
  return outPath;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.creator || !args.file) {
    usage();
    process.exit(1);
  }
  const file = path.resolve(String(args.file));
  if (!fs.existsSync(file)) {
    console.error(`Transcript file not found: ${file}`);
    process.exit(1);
  }
  const sourceText = fs.readFileSync(file, 'utf8');
  const review = buildReview({ args, sourceText, file });
  const outDir = path.resolve(String(args['out-dir'] || 'data/external-readings/reviews'));
  const outPath = writeOutput({ review, outDir });
  console.log(JSON.stringify({ ok: true, outPath, creator: review.source.creator, extraction_profile: review.source.extraction_profile, section_detection_mode: review.section.section_detection_mode, counts: { astrology_claims: review.section.astrology_claims.length, house_claims: review.section.house_claims.length, tarot_cards: review.section.tarot_cards.length, oracle_or_angel_numbers: review.section.oracle_or_angel_numbers.length, ritual_steps: review.section.ritual.steps_or_context.length, themes: review.section.themes.length } }, null, 2));
}

main();
