#!/usr/bin/env node
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const queuePath = process.argv[2] || join(repoRoot, 'data', 'external-readings', 'videos.json');
const rawRoot = join(repoRoot, 'data', 'external-readings', 'raw');

function slugify(value) {
  return String(value || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'unknown';
}

function readQueue(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read queue file at ${path}. Copy data/external-readings/videos.example.json to videos.json first. ${error.message}`);
  }
}

function assertYtDlp() {
  const check = spawnSync('yt-dlp', ['--version'], { encoding: 'utf8' });
  if (check.error || check.status !== 0) {
    throw new Error('yt-dlp was not found. Install it first, then rerun this script. On Windows: winget install yt-dlp.yt-dlp');
  }
  return check.stdout.trim();
}

const queue = readQueue(queuePath).filter((item) => item.status !== 'done');
const version = assertYtDlp();
console.log(`yt-dlp version: ${version}`);
console.log(`Queued videos: ${queue.length}`);

mkdirSync(rawRoot, { recursive: true });

for (const item of queue) {
  if (!item.source_url) {
    console.warn('Skipping item without source_url:', item);
    continue;
  }

  const creatorSlug = slugify(item.creator);
  const creatorDir = join(rawRoot, creatorSlug);
  mkdirSync(creatorDir, { recursive: true });

  const outputTemplate = join(creatorDir, '%(upload_date)s-%(title).120B-%(id)s.%(ext)s');
  const args = [
    '--skip-download',
    '--write-subs',
    '--write-auto-subs',
    '--sub-langs', 'en.*,en',
    '--sub-format', 'vtt',
    '--convert-subs', 'vtt',
    '-o', outputTemplate,
    item.source_url,
  ];

  console.log(`\nFetching captions: ${item.creator || 'Unknown creator'}`);
  console.log(item.source_url);

  const result = spawnSync('yt-dlp', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error(`Failed to run yt-dlp for ${item.source_url}:`, result.error.message);
    continue;
  }

  if (result.status !== 0) {
    console.error(`yt-dlp exited with status ${result.status} for ${item.source_url}`);
    continue;
  }
}

console.log('\nDone. Raw VTT captions are under data/external-readings/raw/.');
console.log('Next: npm run clean:transcripts');
