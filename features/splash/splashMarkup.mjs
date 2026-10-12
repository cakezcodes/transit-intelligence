/* the splash — one markup, two hosts (/welcome and /app), so sign-in hands off to
   the app without a visual seam. styles: app/astrocake.css (.ti-splash). */
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"/></svg>';

// a fixed constellation (deterministic so server and client markup match)
const FIELD = [
  [12, 14, 9, 0.0], [82, 11, 7, 0.4], [70, 24, 5, 1.1], [18, 33, 6, 1.6], [88, 41, 10, 0.8],
  [8, 58, 8, 2.0], [78, 63, 6, 1.3], [26, 72, 5, 0.2], [64, 79, 9, 1.8], [44, 18, 4, 2.3],
  [52, 86, 5, 0.6], [33, 52, 4, 1.0], [92, 82, 6, 2.1], [6, 86, 7, 1.5],
];

export function splashMarkup(id = '') {
  const field = FIELD.map(
    ([x, y, s, d]) => `<i style="--x:${x}%;--y:${y}%;--s:${s}px;--d:${d}s">${STAR}</i>`,
  ).join('');
  return `<div ${id ? `id="${id}" ` : ''}class="ti-splash" role="img" aria-label="transit intelligence, the sky translated — an astrocake app">
  <div class="tsp-frame"></div>
  <div class="tsp-field" style="position:absolute;inset:0">${field}</div>
  <div class="tsp-core">
    <svg class="tsp-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"/></svg>
    <div class="tsp-eb">welcome to</div>
    <div class="tsp-wm">transit intelligence</div>
    <div class="tsp-rule"></div>
    <div class="tsp-sub">the sky, translated</div>
  </div>
  <div class="tsp-foot">an <span class="tsp-by">astrocake</span> app</div>
</div>`;
}
