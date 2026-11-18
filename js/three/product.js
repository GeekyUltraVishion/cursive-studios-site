// Cursive Studios: 3D Websites page demo. A serum bottle you can turn by dragging (or with the arrow keys).
// Loaded only on /3d-websites, only when the demo scrolls near the screen, and only with WebGL.

import * as THREE from '../vendor/three.module.min.js';
import { tokenRGB, reducedMotion } from './support.js';

const col = (name, fb) => new THREE.Color(...tokenRGB(name, fb));

function labelTexture(ink, paper) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = `#${paper.getHexString()}`; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = `#${ink.getHexString()}`;
  const face = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() || 'sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `300 86px ${face}`; g.fillText('Your product', 512, 112);
  g.font = `400 34px ${face}`; g.fillText('in 3D', 512, 188);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function bottle(lite, colours) {
  const group = new THREE.Group();
  const seg = lite ? 48 : 96;
  // Body: a rounded shoulder bottle, drawn as a profile and spun around (lathe)
  const profile = [[0, -1.3], [0.62, -1.3], [0.7, -1.22], [0.72, -1.0], [0.72, 0.55], [0.68, 0.78], [0.52, 0.95], [0.26, 1.06], [0.24, 1.16], [0, 1.16]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, seg),
    new THREE.MeshPhysicalMaterial({ color: colours.glass, roughness: 0.16, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }));
  group.add(body);
  // Label wrapped round the body
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.725, 0.725, 0.9, seg, 1, true, -Math.PI * 0.55, Math.PI * 1.1),
    new THREE.MeshStandardMaterial({ map: labelTexture(colours.labelInk, colours.label), roughness: 0.7 }));
  label.position.y = -0.2;
  group.add(label);
  // Cap and dropper bulb
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, seg), new THREE.MeshStandardMaterial({ color: colours.cap, roughness: 0.35, metalness: 0.6 }));
  cap.position.y = 1.4;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, seg / 2, seg / 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 2.2, 1),
    new THREE.MeshStandardMaterial({ color: colours.cap, roughness: 0.6 }));
  bulb.position.y = 1.64;
  group.add(cap, bulb);
  return group;
}

export function mount(el, { tier = 'full' } = {}) {
  const lite = tier === 'lite';
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  const canvas = renderer.domElement;
  canvas.className = 'demo__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  el.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.4, 8.4);
  camera.lookAt(0, 0.2, 0);

  const ink = col('--color-ink', [0.95, 0.93, 0.89]);
  const accent = col('--color-accent', [0.89, 0.56, 0.33]);
  const paper = col('--color-paper', [0.07, 0.05, 0.04]);
  scene.add(new THREE.HemisphereLight(ink, paper, 0.55));
  const key = new THREE.DirectionalLight(ink, 2.2); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(accent, 3); rim.position.set(4, 2, -4); scene.add(rim);

  const product = bottle(lite, {
    glass: col('--color-accent-2', [0.62, 0.36, 0.2]).multiplyScalar(0.7),
    label: ink, labelInk: paper,
    cap: col('--color-paper-3', [0.16, 0.13, 0.11]),
  });
  product.rotation.set(0.12, -0.15, 0);
  scene.add(product);

  const fit = () => {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    need();
  };

  // Turning: drag, inertia, arrow keys, and a slow idle spin when motion is allowed
  let vel = 0, dragging = false, lastX = 0, lastY = 0, idleAt = 0, paused = false, visible = true, raf = 0, last = 0;
  const spinning = () => !paused && !reducedMotion() && !dragging && performance.now() > idleAt;
  const frame = (now) => {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!dragging) {
      product.rotation.y += vel;
      vel *= reducedMotion() ? 0 : 0.92;
      if (Math.abs(vel) < 0.0002) vel = 0;
      if (spinning()) product.rotation.y += dt * 0.35;
      product.rotation.x += (0.12 - product.rotation.x) * 0.06;
    }
    renderer.render(scene, camera);
    if (visible && !document.hidden && (dragging || vel || spinning() || Math.abs(product.rotation.x - 0.12) > 0.002 || performance.now() <= idleAt)) need();
  };
  function need() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  canvas.style.touchAction = 'pan-y'; // vertical swipes still scroll the page
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; vel = 0; canvas.setPointerCapture(e.pointerId); el.classList.add('is-dragging'); need(); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    product.rotation.y += dx * 0.012; vel = dx * 0.012;
    product.rotation.x = Math.max(-0.45, Math.min(0.55, product.rotation.x + dy * 0.006));
    hint?.setAttribute('hidden', '');
    need();
  });
  const end = () => { if (!dragging) return; dragging = false; idleAt = performance.now() + 2500; el.classList.remove('is-dragging'); need(); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  el.tabIndex = 0;
  el.setAttribute('role', 'group');
  el.setAttribute('aria-roledescription', '3D viewer');
  el.setAttribute('aria-label', '3D serum bottle. Drag, or use the left and right arrow keys, to turn it.');
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    product.rotation.y += e.key === 'ArrowLeft' ? -0.3 : 0.3;
    idleAt = performance.now() + 2500; need();
  });

  const hint = el.querySelector('[data-demo-hint]');
  if (hint) hint.hidden = false;
  const btn = el.querySelector('[data-motion-toggle]');
  if (btn && !reducedMotion()) {
    btn.hidden = false;
    btn.addEventListener('click', () => { paused = !paused; btn.textContent = paused ? 'Spin' : 'Pause'; btn.setAttribute('aria-pressed', String(paused)); need(); });
  }

  new ResizeObserver(fit).observe(el);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) need(); }).observe(el);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) need(); });
  fit();
  requestAnimationFrame(() => el.classList.add('is-live'));
}
