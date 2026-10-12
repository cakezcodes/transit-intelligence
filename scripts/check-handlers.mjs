/**
 * Every inline handler (onclick/oninput/onchange) in the app markup and the
 * prototype's templates must call a function that exists — a dead button
 * (like the old "+ add to the calendar" → openAdd) fails here instead of in
 * someone's hand.
 */
import { readFileSync } from 'node:fs';

const app = readFileSync('public/prototype/app.js', 'utf8');
const html = readFileSync('features/app/body.html', 'utf8');
const defined = new Set([
  ...[...app.matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]),
  ...[...app.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)].map((m) => m[1]),
]);
const builtins = new Set(['event', 'document', 'window', 'setTimeout', 'String', 'JSON', 'Math', 'history', 'this', 'if', 'return', 'Object', 'Number', 'Boolean']);
const handlers = [...(html + app).matchAll(/on(?:click|input|change)="([^"]*)"/g)].map((m) => m[1]);
const missing = new Map();
for (const h of handlers) {
  const code = h.replace(/'[^']*'|`[^`]*`/g, "''");
  for (const m of code.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) {
    const fn = m[1];
    if (!defined.has(fn) && !builtins.has(fn)) missing.set(fn, h.slice(0, 80));
  }
}
if (missing.size) {
  for (const [fn, h] of missing) console.error(`❌ ${fn}() is called but never defined — ${h}`);
  process.exit(1);
}
console.log(`✅ ${handlers.length} inline handlers all resolve`);
