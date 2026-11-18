// Cursive Studios: shared checks for the 3D pieces. Tiny, and imports nothing,
// so a page can decide whether to load Three.js (js/vendor/three.module.min.js) at all.

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

// 'none': keep the still image (data saver, very slow connection, or no WebGL)
// 'lite': phones and modest devices: fewer polygons, lower resolution
// 'full': everything else
export function tier() {
  const conn = navigator.connection || {};
  if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '') || !webglOK()) return 'none';
  const lowMem = navigator.deviceMemory && navigator.deviceMemory <= 4;
  const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
  const touch = matchMedia('(pointer: coarse)').matches;
  return lowMem || fewCores || touch || innerWidth < 760 ? 'lite' : 'full';
}

// Run when the browser is idle, after the page has loaded, so 3D never delays first paint.
export function whenIdle(fn) {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 600));
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}

// Run once the element is near the viewport.
export function whenNear(el, fn, margin = '300px') {
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin });
  io.observe(el);
}

// Read a colour token from css/settings.css as [r, g, b] in 0..1 (sRGB), so the 3D follows the site palette.
export function tokenRGB(name, fallback = [0.85, 0.55, 0.3]) {
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!value) return fallback;
    const c = document.createElement('canvas'); c.width = c.height = 1;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  } catch { return fallback; }
}
