/**
 * features/app/body.html is the source of the app's markup; Next imports it as
 * features/app/prototypeBody.mjs. Runs automatically before `next build` and
 * `next dev` (npm pre-scripts), so the two never drift.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('features/app/body.html', 'utf8');
writeFileSync(
  'features/app/prototypeBody.mjs',
  '// generated from features/app/body.html by scripts/build-prototype-body.mjs — edit the html, not this\n' +
    `export const prototypeBody = ${JSON.stringify(html)};\n`,
);
console.log('✓ prototypeBody.mjs ← body.html');
