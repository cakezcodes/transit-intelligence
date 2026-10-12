/**
 * Guard for the classic-script prototype bundle.
 *
 * /prototype/img.js and /prototype/app.js load as separate classic scripts that
 * share one global scope, so a top-level `const` declared in both (the IMG bug
 * that froze the splash) only fails in the browser. Concatenating them and
 * parsing once reproduces that failure in CI.
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const files = ['public/prototype/img.js', 'public/prototype/app.js'];
const source = files.map((f) => readFileSync(f, 'utf8')).join('\n;\n');

try {
  new vm.Script(source, { filename: 'prototype-bundle.js' });
  console.log(`✅ prototype scripts parse together (${files.join(' + ')})`);
} catch (e) {
  console.error(`❌ prototype scripts fail to parse together: ${e.message}`);
  process.exit(1);
}
