#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const PLANETS_AND_POINTS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Chiron',
  'North Node',
  'South Node',
  'Juno',
  'Ceres',
  'Eris',
];

const ASPECT_WORDS = [
  'conjunct',
  'conjunction',
  'opposite',
  'opposition',
  'square',
  'trine',
  'sextile',
  'retrograde',
  'direct',
  'station',
  'cazimi',
  'ingress',
  'eclipse',
  'new moon',
  'full moon',
];

const TAROT_CARDS = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World',
  ...['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'].flatMap((rank) =>
    ['Wands','Cups','Swords','Pentacles'].map((suit) => `${rank} of ${suit}`)
  ),
];

const ORACLE_WORDS = [
  'angel number',
  'magic',
  'chopped wood',
  'grounded',
  'observer',
  'trust the darkness',
  'dead end',
  'bankrupt',
];

const RITUAL_WORDS = [
  'ritual',
  'money jar',
  'petition',
  'sigil',
  'candle',
  'herbs',
  'crystals',
  'spell',
  'oil',
  'cinnamon',
  'sugar',
  'coins',
  'jar',
  'moon phase',
  'new moon',
  'full moon',
];

const THEME_WORDS = [
  'career',
  'fame',
  'visibility',
  'home',
  'family',
  'relationship',
  'relationships',
  'marriage',
  'partnership',
  'money',
  'wealth',
  'inheritance',
  'investments',
  'work',
  'routine',
  'health',
  'children',
  'romance',
  'spiritual',
  'intuition',
  'awakening',
  'communication',
  'technology',
  'legacy',
  'protection',
  'release',
  'confidence',
];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    args[key] = value;
  }
  return args;
}

function usage() {
  console.log(`Usage:
  npm run extract:reading -- --file "path/to/transcript.txt" --creator "cam|jimmy|303" [--profile "auto"] [--period "July 2026"]

Examples:
  npm run extract:reading -- --file "data/external-readings/raw/Cam jupiter.txt" --creator cam --period "Jupiter in Leo"
  npm run extract:reading -- --file "data/external-readings/raw/Scorpio year jimmy.txt" --creator jimmy --period "2026"
  npm run extract:reading -- --file "data/external-readings/raw/Timeless Scorpio.txt" --creator 303 --profile three_oh_three_timeless --period "Timeless"
`);
}

function inferProfile({ creator, text, file }) {
  const normalizedCreator = creator.toLowerCase();
  const lower = `${file}\n${text}`.toLowerCase();

  if (normalizedCreator.includes('cam')) {
    return {
      creator: 'Cam White',
      reading_type: 'transit',
      time_tier: lower.includes('jupiter') ? 'yearly' : 'unknown',
      audience_mode: 'rising_sign',
      creator_mode: 'technical_astrology',
      extraction_profile: 'cam_transit_rising',
      section_for_syd: 'Pisces',
      sign_basis_for_syd: 'rising',
      calendar_import: true,
    };
  }

  if (normalizedCreator.includes('jimmy') || lower.includes('tarot sh')) {
    const isOverview = lower.includes('all signs') || lower.includes('overview') || lower.includes('preface');
    return {
      creator: 'The Tarot Sh*t with Jimmy',
      reading_type: isOverview ? 'collective_overview' : 'hybrid',
      time_tier: lower.includes('year') || lower.includes('2026') ? 'yearly' : lower.includes('week') ? 'weekly' : 'monthly',
      audience_mode: isOverview ? 'all_signs_general' : 'sun_moon_rising',
      creator_mode: isOverview ? 'collective_astrology_overview' : 'hybrid_astrology_tarot',
      extraction_profile: isOverview ? 'jimmy_collective_overview' : 'jimmy_hybrid_sign',
      section_for_syd: isOverview ? 'Collective' : 'Scorpio',
      sign_basis_for_syd: isOverview ? 'collective' : 'sun',
      calendar_import: true,
    };
  }

  if (normalizedCreator.includes('303') || normalizedCreator.includes('high') || lower.includes('money jar')) {
    const timeless = lower.includes('timeless') || path.basename(file).toLowerCase().includes('timeless');
    return {
      creator: '303 High Priestess',
      reading_type: 'tarot_ritual',
      time_tier: timeless ? 'timeless' : lower.includes('week') ? 'weekly' : 'monthly',
      audience_mode: 'sun_moon_rising_venus',
      creator_mode: 'intuitive_tarot_ritual',
      extraction_profile: timeless ? 'three_oh_three_timeless' : 'three_oh_three_timed',
      section_for_syd: 'Scorpio',
      sign_basis_for_syd: 'resonance',
      calendar_import: !timeless,
    };
  }

  return {
    creator,
    reading_type: 'unknown',
    time_tier: 'unknown',
    audience_mode: 'unknown',
    creator_mode: 'unknown',
    extraction_profile: 'generic',
    section_for_syd: 'Unknown',
    sign_basis_for_syd: 'unknown',
    calendar_import: true,
  };
}

function normalizeLine(line) {
  return line.replace(/\s+/g, ' ').trim();
}

function extractTimestamp(line) {
  const match = line.match(/(?:(\d+):)?(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  return hours * 3600 + minutes * 60 + seconds;
}

function sentenceChunks(text) {
  return text
    .replace(/\r/g, '')
    .split(/(?<=[.!?])\s+|\n+/)
    .map(normalizeLine)
    .filter(Boolean);
}

function nearbyText(chunks, index, span = 1) {
  const start = Math.max(0, index - span);
  const end = Math.min(chunks.length, index + span + 1);
  return chunks.slice(start, end).join(' ');
}

function findMatches(chunks, patterns) {
  const found = [];
  const seen = new Set();
  chunks.forEach((chunk, index) => {
    const lower = chunk.toLowerCase();
    for (const pattern of patterns) {
      const patternLower = pattern.toLowerCase();
      if (!lower.includes(patternLower)) continue;
      const key = `${patternLower}:${index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      found.push({
        name: pattern,
        context: nearbyText(chunks, index),
        timestamp_seconds: extractTimestamp(chunk),
        confidence: 'draft',
      });
    }
  });
  return found;
}

function extractDates(chunks) {
  const datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\b|\b\d{1,2}\/\d{1,2}\b/gi;
  const degreePattern = /\b\d{1,2}\s?(?:°|degrees?)\b/gi;
  const results = [];
  chunks.forEach((chunk, index) => {
    const dates = chunk.match(datePattern) || [];
    const degrees = chunk.match(degreePattern) || [];
    const lower = chunk.toLowerCase();
    const hasAspect = ASPECT_WORDS.some((word) => lower.includes(word));
    if (!dates.length && !degrees.length && !hasAspect) return;
    if (!dates.length && !degrees.length && !PLANETS_AND_POINTS.some((p) => lower.includes(p.toLowerCase()))) return;
    results.push({
      stated_date_or_marker: dates[0] || null,
      stated_degrees: degrees,
      claim_text: nearbyText(chunks, index),
      planets_or_points: PLANETS_AND_POINTS.filter((planet) => lower.includes(planet.toLowerCase())),
      aspect_words: ASPECT_WORDS.filter((word) => lower.includes(word)),
      needs_celestine_verification: true,
      confidence: 'draft',
    });
  });
  return dedupeByText(results, 'claim_text').slice(0, 40);
}

function extractThemes(chunks) {
  const counts = new Map();
  const contexts = new Map();
  for (const theme of THEME_WORDS) {
    const themeLower = theme.toLowerCase();
    chunks.forEach((chunk, index) => {
      if (!chunk.toLowerCase().includes(themeLower)) return;
      counts.set(theme, (counts.get(theme) || 0) + 1);
      if (!contexts.has(theme)) contexts.set(theme, nearbyText(chunks, index));
    });
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([theme, count]) => ({ theme, count, example_context: contexts.get(theme) }));
}

function extractHouses(chunks) {
  const housePattern = /\b(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\s+house\b/gi;
  return dedupeByText(
    chunks.flatMap((chunk, index) => {
      const matches = chunk.match(housePattern) || [];
      return matches.map((house) => ({
        house_claim: house,
        context: nearbyText(chunks, index),
        needs_celestine_verification: true,
        confidence: 'draft',
      }));
    }),
    'context'
  ).slice(0, 30);
}

function extractCards(chunks) {
  return dedupeByText(
    findMatches(chunks, TAROT_CARDS).map((card, index) => ({
      card_name_raw: card.name,
      position: null,
      position_order: index + 1,
      is_reversed: /reversed/i.test(card.context),
      creator_interpretation_context: card.context,
      needs_card_review: true,
      confidence: card.confidence,
    })),
    'card_name_raw'
  );
}

function extractOracle(chunks) {
  return dedupeByText(
    findMatches(chunks, ORACLE_WORDS).map((item) => ({
      name_raw: item.name,
      context: item.context,
      confidence: 'draft',
    })),
    'name_raw'
  );
}

function extractRitual(chunks) {
  const ritualMentions = findMatches(chunks, RITUAL_WORDS);
  const ingredients = RITUAL_WORDS.filter((word) => ritualMentions.some((mention) => mention.name.toLowerCase() === word.toLowerCase()));
  return {
    detected: ritualMentions.length > 0,
    ingredients_or_tools: [...new Set(ingredients)],
    steps_or_context: dedupeByText(
      ritualMentions.map((mention) => ({
        trigger: mention.name,
        context: mention.context,
        confidence: 'draft',
      })),
      'context'
    ).slice(0, 20),
    needs_human_review: ritualMentions.length > 0,
  };
}

function dedupeByText(items, key) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const value = String(item[key] || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(item);
  }
  return out;
}

function buildReview({ file, text, inferred, period }) {
  const chunks = sentenceChunks(text);
  const transcriptStats = {
    characters: text.length,
    chunks: chunks.length,
    has_timestamps: /\b\d{1,2}:\d{2}\b/.test(text),
  };

  const astrology_claims = extractDates(chunks);
  const house_claims = extractHouses(chunks);
  const cards = inferred.extraction_profile.includes('cam_') ? [] : extractCards(chunks);
  const oracle = inferred.extraction_profile.includes('cam_') ? [] : extractOracle(chunks);
  const ritual = inferred.extraction_profile.includes('three_oh_three') ? extractRitual(chunks) : { detected: false, ingredients_or_tools: [], steps_or_context: [], needs_human_review: false };
  const themes = extractThemes(chunks);

  const section_kind =
    inferred.extraction_profile === 'cam_transit_rising'
      ? 'rising_sign_section'
      : inferred.extraction_profile === 'jimmy_collective_overview'
        ? 'collective_overview'
        : inferred.extraction_profile.includes('three_oh_three')
          ? 'theme_segment'
          : 'sign_section';

  return {
    review_version: '0.1.0-rule-based-starter',
    warning:
      'Draft extraction only. This is a review scaffold, not final truth. Celestine must verify astrology facts; a human must review cards, oracle, and ritual details.',
    source: {
      source_title: path.basename(file),
      source_type: 'transcript',
      creator: inferred.creator,
      reading_type: inferred.reading_type,
      time_tier: inferred.time_tier,
      period_label: period || null,
      audience_mode: inferred.audience_mode,
      creator_mode: inferred.creator_mode,
      extraction_profile: inferred.extraction_profile,
      calendar_import: inferred.calendar_import,
      transcript_status: 'extracted',
      transcript_stats: transcriptStats,
    },
    syd_match: {
      section_for_syd: inferred.section_for_syd,
      sign_basis: inferred.sign_basis_for_syd,
      note:
        inferred.extraction_profile === 'cam_transit_rising'
          ? 'Cam-style technical astrology is read by rising sign, so Syd uses Pisces rising.'
          : inferred.extraction_profile.includes('three_oh_three')
            ? '303-style Scorpio readings are stored as Scorpio resonance/sign-cluster material, with timeless readings excluded from automatic calendar import.'
            : 'Jimmy-style Scorpio readings are stored as Scorpio sun/moon/rising resonance unless the source is a collective overview.',
    },
    section: {
      sign: inferred.section_for_syd,
      sign_basis: inferred.sign_basis_for_syd,
      audience_mode: inferred.audience_mode,
      section_kind,
      calendar_import: inferred.calendar_import,
      summary: null,
      themes,
      astrology_claims,
      house_claims,
      tarot_cards: cards,
      oracle_or_angel_numbers: oracle,
      ritual,
    },
    possible_meaning_enrichments: buildEnrichmentCandidates({ inferred, themes, astrology_claims, cards, oracle, ritual }),
    review_checklist: [
      'Confirm the creator and source title are correct.',
      'Confirm the correct sign basis was used for Syd.',
      'Confirm dates, degrees, and house claims before saving as verified.',
      'Confirm tarot/oracle card names before linking to tarot_cards.',
      'Do not save creator wording verbatim as a meaning enrichment; save only distilled notes.',
      'For timeless 303 readings, keep calendar_import false unless a dated ritual/timing marker is explicitly present.',
    ],
  };
}

function buildEnrichmentCandidates({ inferred, themes, astrology_claims, cards, oracle, ritual }) {
  const candidates = [];

  themes.slice(0, 8).forEach((theme) => {
    candidates.push({
      target_type: inferred.extraction_profile === 'cam_transit_rising' ? 'transit_event_type' : 'sign',
      target_key: inferred.extraction_profile === 'cam_transit_rising' ? theme.theme : inferred.section_for_syd,
      source_type: 'external_reading',
      layer_type: 'theme',
      title: `${inferred.creator}: ${theme.theme}`,
      distilled_text: null,
      source_context: theme.example_context,
      confidence: 'draft',
      verified: false,
      needs_approval: true,
    });
  });

  astrology_claims.slice(0, 8).forEach((claim) => {
    candidates.push({
      target_type: 'calendar_event',
      target_key: claim.stated_date_or_marker || claim.planets_or_points.join('-') || 'astrology-claim',
      source_type: 'external_reading',
      layer_type: 'timing',
      title: `${inferred.creator}: timing claim`,
      distilled_text: null,
      source_context: claim.claim_text,
      confidence: 'draft',
      verified: false,
      needs_celestine_verification: true,
      needs_approval: true,
    });
  });

  cards.slice(0, 8).forEach((card) => {
    candidates.push({
      target_type: 'tarot_card',
      target_key: card.card_name_raw,
      source_type: 'external_reading',
      layer_type: 'interpretation',
      title: `${inferred.creator}: ${card.card_name_raw}`,
      distilled_text: null,
      source_context: card.creator_interpretation_context,
      confidence: 'draft',
      verified: false,
      needs_card_review: true,
      needs_approval: true,
    });
  });

  oracle.slice(0, 8).forEach((item) => {
    candidates.push({
      target_type: 'sign',
      target_key: inferred.section_for_syd,
      source_type: 'external_reading',
      layer_type: 'theme',
      title: `${inferred.creator}: ${item.name_raw}`,
      distilled_text: null,
      source_context: item.context,
      confidence: 'draft',
      verified: false,
      needs_approval: true,
    });
  });

  if (ritual.detected) {
    candidates.push({
      target_type: 'sign',
      target_key: inferred.section_for_syd,
      source_type: 'external_reading',
      layer_type: 'ritual',
      title: `${inferred.creator}: ritual practice`,
      distilled_text: null,
      source_context: ritual.steps_or_context.map((step) => step.context).join(' '),
      confidence: 'draft',
      verified: false,
      needs_ritual_review: true,
      needs_approval: true,
    });
  }

  return candidates;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.file || !args.creator) {
    usage();
    process.exit(1);
  }

  const file = path.resolve(String(args.file));
  if (!fs.existsSync(file)) {
    console.error(`Transcript file not found: ${file}`);
    process.exit(1);
  }

  const text = fs.readFileSync(file, 'utf8');
  const inferred = inferProfile({ creator: String(args.creator), text, file });
  if (args.profile && args.profile !== 'auto') {
    inferred.extraction_profile = String(args.profile);
    if (args.profile === 'three_oh_three_timeless') {
      inferred.time_tier = 'timeless';
      inferred.calendar_import = false;
    }
  }

  const review = buildReview({ file, text, inferred, period: args.period ? String(args.period) : null });
  console.log(JSON.stringify(review, null, 2));
}

main();
