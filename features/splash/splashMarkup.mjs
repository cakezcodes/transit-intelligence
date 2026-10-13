/* the splash — one markup, two hosts (/welcome and /app), so sign-in hands off to
   the app without a visual seam. styles: app/astrocake.css (.ti-splash). */
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"/></svg>';

// sparkles falling through the frame: [x %, size px, fall seconds, delay s (negative = already mid-fall)]
// fixed values so server and client markup match
const FIELD = [
  [6, 7, 6.5, -0.4], [14, 5, 8, -3.1], [22, 9, 7, -5.2], [31, 6, 9, -1.7], [39, 8, 6.8, -4.4],
  [47, 5, 8.6, -0.9], [55, 10, 7.4, -2.6], [63, 6, 6.2, -5.8], [71, 8, 8.8, -3.5], [79, 5, 7.2, -1.2],
  [87, 9, 6.6, -4.9], [94, 6, 9.2, -2.2], [10, 6, 7.8, -6.3], [35, 7, 8.2, -6.9], [58, 5, 6.9, -7.4],
  [83, 7, 7.6, -0.2], [26, 8, 9.6, -8.1], [67, 6, 8.4, -7.7],
];

export function splashMarkup(id = '') {
  const field = FIELD.map(
    ([x, s, t, d], i) => `<i style="--x:${x}%;--s:${s}px;--t:${t}s;--d:${d}s;--dx:${i % 2 ? 14 : -14}px">${STAR}</i>`,
  ).join('');
  return `<div ${id ? `id="${id}" ` : ''}class="ti-splash" role="img" aria-label="transit intelligence, the sky translated — an astrocake app">
  <div class="tsp-frame"></div>
  <div class="tsp-field" style="position:absolute;inset:0">${field}</div>
  <div class="tsp-core">
    <svg class="tsp-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"/></svg>
    <div class="tsp-eb">welcome to</div>
    <div class="tsp-wm"><span class="tsp-l1">transit <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"/></svg></span><span class="tsp-l2">intelligence</span></div>
    <div class="tsp-rule"></div>
    <div class="tsp-sub">the sky, translated</div>
  </div>
  <div class="tsp-foot">an <span class="tsp-by">astrocake</span> app</div>
</div>`;
}
