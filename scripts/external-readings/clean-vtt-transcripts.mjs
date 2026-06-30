#!/usr/bin/env node
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const rawRoot = join(repoRoot, 'data', 'external-readings', 'raw');
const cleanRoot = join(repoRoot, 'data', 'external-readings', 'clean');

function walk(dir) {
  let files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(path));
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.vtt')) files.push(path);
  }
  return files;
}

function cleanVtt(text) {
  const seen = new Set();
  const lines = text
    .replace(/^WEBVTT.*$/m, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.includes('-->'))
    .filter((line) => !/^NOTE\b/.test(line))
    .filter((line) => !/^STYLE\b/.test(line))
    .filter((line) => !/^REGION\b/.test(line))
    .filter((line) => !/^Kind:/i.test(line))
    .filter((line) => !/^Language:/i.test(line))
    .map((line) => line.replace(/<[^>]+>/g, ''))
    .map((line) => line.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"'))
    .filter((line) => {
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return lines.join(' ').replace(/\s+/g, ' ').trim() + '\n';
}

mkdirSync(cleanRoot, { recursive: true });

let files = [];
try {
  files = walk(rawRoot);
} catch {
  console.error('No raw transcript folder found. Run npm run fetch:transcripts first.');
  process.exit(1);
}

console.log(`Found VTT files: ${files.length}`);

for (const file of files) {
  const rel = relative(rawRoot, file);
  const outDir = join(cleanRoot, dirname(rel));
  const outPath = join(outDir, basename(file, extname(file)) + '.txt');
  mkdirSync(outDir, { recursive: true });

  const cleaned = cleanVtt(readFileSync(file, 'utf8'));
  writeFileSync(outPath, cleaned, 'utf8');
  console.log(`Cleaned: ${rel} -> ${relative(cleanRoot, outPath)}`);
}

console.log('\nDone. Clean transcripts are under data/external-readings/clean/.');
