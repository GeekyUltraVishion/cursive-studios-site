// Cursive Studios: homepage hero. A polished chrome letter C, drawn like a broad-nib pen stroke,
// turning slowly under studio light. Loaded only on the homepage, only after the page is idle,
// only with WebGL and without "reduce motion".

import * as THREE from '../vendor/three.module.min.js';
import { reducedMotion } from './support.js';

// The C as a rounded pen stroke: a ring opening to the right, thick on the lower left like a broad nib,
// tapering to fine points at both ends. Each cross-section is an oval, so the chrome catches light all round.
function letterC(steps, sides) {
  const a0 = THREE.MathUtils.degToRad(40), a1 = THREE.MathUtils.degToRad(316);
  const wMin = 0.02, wMax = 0.4;
  const pos = [], idx = [];
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    const a = a0 + (a1 - a0) * k;
    const s = Math.sin(Math.PI * k);
    const w = wMin + (wMax - wMin) * Math.pow(s, 1.6);   // width across the stroke
    const d = 0.02 + 0.13 * Math.pow(s, 0.9);             // depth front to back
    const cx = -0.12 * s, cy = -0.05 * s;                 // sits a little low and left, like a quick hand
    const ca = Math.cos(a), sa = Math.sin(a);
    for (let j = 0; j < sides; j++) {
      const f = (j / sides) * Math.PI * 2;
      const r = 1 + Math.cos(f) * w / 2;
      pos.push(cx + ca * r, cy + sa * r, Math.sin(f) * d);
    }
  }
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < sides; j++) {
      const p0 = i * sides + j, p1 = i * sides + ((j + 1) % sides), p2 = p0 + sides, p3 = p1 + sides;
      idx.push(p0, p2, p1, p1, p2, p3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// A dark studio with soft boxes, baked into an environment map for the chrome to reflect.
function studio(renderer) {
  const room = new THREE.Scene();
  const box = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: 0x060606, side: THREE.BackSide }));
  room.add(box);
  const panel = (w, h, power, x, y, z, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    m.material.color.setScalar(power);
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.lookAt(0, 0, 0);
    room.add(m);
  };
  panel(14, 1.4, 6, 0, 5.5, 3);        // long strip overhead
  panel(1.6, 8, 7, -8, 0.5, 4);        // tall strip, left
  panel(3, 3, 2.5, 7, 2, 6);           // kicker, front right
  panel(9, 4, 0.35, 0, 0, 9.5);        // dim wash behind the camera, so the front never goes flat black
  panel(8, 0.6, 1.6, 0, -4.5, 6);      // low bounce
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(room, 0.035).texture;
  pmrem.dispose();
  room.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  return env;
}

export function mount(el, { tier = 'full' } = {}) {
  const lite = tier === 'lite';
  const renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lite ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = 'hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  el.append(canvas);

  const scene = new THREE.Scene();
  scene.environment = studio(renderer);
  const camera = new THREE.PerspectiveCamera(26, 2.39, 0.1, 50);

  const geometry = letterC(lite ? 160 : 320, lite ? 24 : 48);
  geometry.center();
  const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.14, side: THREE.DoubleSide });
  const mark = new THREE.Mesh(geometry, chrome);
  const group = new THREE.Group();
  group.add(mark);
  scene.add(group);

  // Size to the frame: the C fills about two thirds of the frame's height
  const fit = () => {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const tall = 2.35 / Math.tan(fov / 2) / 2 / 0.66;       // distance for the C to fill 66% of the height
    const wide = tall / Math.min(1, camera.aspect / 1.15);   // pull back on narrow frames
    camera.position.set(0, 0, Math.max(tall, wide));
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(fit).observe(el);
  fit();

  // Lean toward the pointer
  const target = { x: 0, y: 0 };
  el.closest('.hero')?.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 0.3;
  });

  // Run only while visible, not paused, and motion is allowed
  let visible = true, paused = false, raf = 0, last = performance.now(), t = 0, skip = false;
  const pose = () => {
    // a slow sway (never far enough to show the back of the letter) while the light travels around it
    group.rotation.y += (Math.sin(t * 0.32) * 0.42 + target.x - group.rotation.y) * 0.05;
    group.rotation.x += (Math.sin(t * 0.21) * 0.08 + target.y - group.rotation.x) * 0.05;
    scene.environmentRotation.y = t * 0.18;
  };
  const frame = (now) => {
    raf = 0;
    if (lite && (skip = !skip)) { loop(); return; } // phones: draw every other frame (about 30 fps)
    const dt = Math.min((now - last) / 1000, 0.05); last = now; t += dt;
    pose();
    renderer.render(scene, camera);
    loop();
  };
  const loop = () => { if (!raf && visible && !paused && !document.hidden && !reducedMotion()) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? loop() : stop(); }).observe(el);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : loop()));
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => (e.matches ? stop() : loop()));

  // Visible pause control (anything that moves for more than 5 seconds needs one)
  const btn = el.querySelector('[data-motion-toggle]');
  if (btn) {
    btn.hidden = false;
    btn.addEventListener('click', () => {
      paused = !paused;
      btn.textContent = paused ? 'Play' : 'Pause';
      btn.setAttribute('aria-pressed', String(paused));
      paused ? stop() : loop();
    });
  }

  pose();
  renderer.render(scene, camera);
  requestAnimationFrame(() => el.classList.add('is-live')); // fade the canvas in over the still
  loop();
}
