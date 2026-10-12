/**
 * features/app/body.html is injected with innerHTML, so an unbalanced tag doesn't
 * fail loudly — it silently re-parents the tab bar/sheets out of #ti-root and
 * breaks hydration. Count open/close tags for the block elements we use.
 */
import { readFileSync } from 'node:fs';

const html = readFileSync('features/app/body.html', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
let ok = true;
for (const tag of ['div', 'section', 'main', 'nav', 'button', 'span', 'label', 'svg', 'a']) {
  const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
  const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
  if (open !== close) {
    ok = false;
    console.error(`❌ <${tag}> ${open} open vs ${close} close`);
  }
}
if (!ok) process.exit(1);
console.log('✅ app markup tags balance');
