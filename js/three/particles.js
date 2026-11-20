// Cursive Studios: homepage hero. Thousands of points of light that gather into the letter C, then
// re-form, one after another, into a sign for each service: a vertical video ad, a building, a website
// and a turning cube. The pointer pushes the points aside. Loaded only on the homepage, only after the
// page is idle, only with WebGL and without "reduce motion".

import * as THREE from '../vendor/three.module.min.js';
import { reducedMotion, tokenRGB } from './support.js';

const PX = 512, UNIT = 200; // shapes are drawn on a 512px canvas; 200px = 1 unit in the scene

// Draw a shape on a canvas and return n points sampled from its lit pixels.
function sample(draw, n, W = PX, H = PX) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = ctx.strokeStyle = '#fff'; ctx.lineJoin = ctx.lineCap = 'round';
  draw(ctx, W, H);
  const data = ctx.getImageData(0, 0, W, H).data, lit = [];
  for (let i = 0; i < W * H; i++) if (data[i * 4 + 3] > 128) lit.push(i);
  const out = new Float32Array(n * 3);
  for (let k = 0; k < n; k++) {
    const i = lit[(Math.random() * lit.length) | 0] ?? 0;
    out[k * 3] = ((i % W) + Math.random() - W / 2) / UNIT;
    out[k * 3 + 1] = -(((i / W) | 0) + Math.random() - H / 2) / UNIT;
    out[k * 3 + 2] = (Math.random() - 0.5) * 0.08;
  }
  return out;
}

const roundRect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };

// The opening: a big C with the name "Cursive Studios" written beside it (wide frames)
// or under it (narrow frames), in the site's display face, centred on the canvas.
function lockup(row) {
  const W = row ? 1500 : 1000, H = row ? 640 : 800;
  const draw = (part) => (ctx) => {
    const face = (px) => `500 ${px}px "Mona Sans", system-ui, sans-serif`;
    const box = (text, px) => { ctx.font = face(px); const m = ctx.measureText(text); return { w: m.actualBoundingBoxRight + m.actualBoundingBoxLeft, up: m.actualBoundingBoxAscent, down: m.actualBoundingBoxDescent, left: m.actualBoundingBoxLeft }; };
    const cPx = row ? 400 : 280, cBox = box('C', cPx);
    const maxText = row ? 1150 - cBox.w - 60 : 760;
    let tPx = 120, tBox = box('Cursive Studios', tPx);
    tPx = Math.min(tPx, (tPx * maxText) / tBox.w); tBox = box('Cursive Studios', tPx);
    ctx.textBaseline = 'alphabetic';
    if (row) {
      const total = cBox.w + 60 + tBox.w, x0 = (W - total) / 2, cy = H / 2;
      ctx.font = face(cPx); if (part === 'c') ctx.fillText('C', x0 + cBox.left, cy + (cBox.up - cBox.down) / 2);
      ctx.font = face(tPx); if (part === 't') ctx.fillText('Cursive Studios', x0 + cBox.w + 60 + tBox.left, cy + (tBox.up - tBox.down) / 2);
    } else {
      const gap = 40, total = cBox.up + cBox.down + gap + tBox.up + tBox.down, y0 = (H - total) / 2 - 45; // a little high, clear of the Pause button
      ctx.font = face(cPx); if (part === 'c') ctx.fillText('C', (W - cBox.w) / 2 + cBox.left, y0 + cBox.up);
      ctx.font = face(tPx); if (part === 't') ctx.fillText('Cursive Studios', (W - tBox.w) / 2 + tBox.left, y0 + cBox.up + cBox.down + gap + tBox.up);
    }
  };
  // the C and the name are sampled apart, so the thin letters get as many points as the big C
  return (n) => {
    const nc = Math.round(n * (row ? 0.42 : 0.5));
    const out = new Float32Array(n * 3);
    out.set(sample(draw('c'), nc, W, H));
    out.set(sample(draw('t'), n - nc, W, H), nc * 3);
    return out;
  };
}

const shapes = {
  // AI UGC ads: a vertical video with a play button
  video: (ctx) => {
    ctx.lineWidth = 12; roundRect(ctx, 166, 46, 180, 420, 34); ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(232, 76); ctx.lineTo(280, 76); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(226, 206); ctx.lineTo(302, 256); ctx.lineTo(226, 306); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(196, 420); ctx.lineTo(316, 420); ctx.stroke();
  },
  // Motion graphics: a tower with lit windows
  building: (ctx) => {
    ctx.lineWidth = 10;
    ctx.strokeRect(176, 70, 160, 400);
    ctx.strokeRect(116, 250, 60, 220); ctx.strokeRect(336, 300, 70, 170);
    ctx.beginPath(); ctx.moveTo(90, 470); ctx.lineTo(430, 470); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(256, 70); ctx.lineTo(256, 30); ctx.stroke();
    for (let r = 0; r < 9; r++) for (let col = 0; col < 3; col++) if ((r * 3 + col) % 4) ctx.fillRect(196 + col * 44, 92 + r * 40, 30, 22);
  },
  // Website design: a browser window with a page inside
  browser: (ctx) => {
    ctx.lineWidth = 10; roundRect(ctx, 46, 96, 420, 320, 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(46, 144); ctx.lineTo(466, 144); ctx.stroke();
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(76 + i * 26, 120, 7, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillRect(80, 176, 210, 26); ctx.fillRect(80, 214, 150, 26);
    ctx.lineWidth = 8; roundRect(ctx, 80, 262, 96, 34, 6); ctx.stroke();
    roundRect(ctx, 318, 176, 114, 120, 10); ctx.fill();
    ctx.fillRect(80, 330, 352, 8); ctx.fillRect(80, 352, 300, 8); ctx.fillRect(80, 374, 330, 8);
  },
};

// 3D websites: a real cube in 3D, its edges traced in light
function cube(n) {
  const s = 0.62, v = [];
  for (const x of [-s, s]) for (const y of [-s, s]) for (const z of [-s, s]) v.push(new THREE.Vector3(x, y, z));
  const edges = [];
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) if (v[a].distanceTo(v[b]) < 2 * s + 1e-3) edges.push([v[a], v[b]]);
  const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.55, 0.72, 0));
  const out = new Float32Array(n * 3), p = new THREE.Vector3();
  for (let k = 0; k < n; k++) {
    const [a, b] = edges[(Math.random() * edges.length) | 0];
    p.lerpVectors(a, b, Math.random()).add(new THREE.Vector3((Math.random() - 0.5) * 0.035, (Math.random() - 0.5) * 0.035, (Math.random() - 0.5) * 0.035)).applyMatrix4(rot);
    out.set([p.x, p.y, p.z], k * 3);
  }
  return out;
}

// A loose cloud, where the points start and where they scatter on the way between shapes
function cloud(n, w, h, d) {
  const out = new Float32Array(n * 3);
  for (let k = 0; k < n; k++) out.set([(Math.random() - 0.5) * w, (Math.random() - 0.5) * h, (Math.random() - 0.5) * d], k * 3);
  return out;
}

const vertex = /* glsl */`
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec4 aRand;
  uniform float uMix, uTime, uSize, uScatter;
  uniform vec3 uPointer;
  varying float vGlow;
  void main() {
    // each point leaves a little later than the one to its left, so the change sweeps across
    float delay = 0.35 * clamp(0.5 + 0.22 * aTo.x + 0.3 * aRand.x - 0.15, 0.0, 1.0);
    float p = clamp((uMix - delay) / 0.65, 0.0, 1.0);
    p = p * p * p * (p * (p * 6.0 - 15.0) + 10.0);
    vec3 pos = mix(aFrom, aTo, p);
    // on the way, swing out along a curve
    float arc = sin(3.14159 * p);
    pos += uScatter * arc * vec3(sin(aRand.y * 6.283 + uTime * 0.7), cos(aRand.z * 6.283), sin(aRand.w * 6.283)) * (0.25 + aRand.x * 0.5);
    // a slow shimmer while it holds
    pos += 0.012 * vec3(sin(uTime * (0.8 + aRand.y) + aRand.z * 6.283), cos(uTime * (0.7 + aRand.z) + aRand.w * 6.283), 0.0);
    // the pointer pushes points aside
    vec2 d = pos.xy - uPointer.xy;
    float f = uPointer.z * smoothstep(0.42, 0.0, length(d));
    pos.xy += normalize(d + 1e-4) * f * 0.2;
    pos.z += f * 0.3;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.w * 0.9) * (1.0 + 0.8 * arc + f) / -mv.z;
    vGlow = (0.6 + 0.6 * aRand.x) * (1.0 + 0.6 * f);
  }`;

const fragment = /* glsl */`
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vGlow;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, r);
    gl_FragColor = vec4(uColor * vGlow, a * a * uAlpha);
  }`;

export async function mount(el, { tier = 'full', start = 0 } = {}) {
  const lite = tier === 'lite';
  const N = lite ? 4200 : 9000, DUST = lite ? 260 : 600;
  try { await document.fonts.load('500 100px "Mona Sans"', 'C'); } catch { /* fall back to the system face */ }

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  const ratio = Math.min(devicePixelRatio || 1, lite ? 1.5 : 2);
  renderer.setPixelRatio(ratio);
  const canvas = renderer.domElement;
  canvas.className = 'hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  el.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 2.39, 0.1, 50);

  // The order the points play through, and the words shown under each
  const steps = [
    { name: '', logo: true, pts: lockup(el.clientWidth / Math.max(1, el.clientHeight) >= 1.9)(N) }, // the name is written in points, so no caption
    { name: 'AI UGC ads', pts: sample(shapes.video, N) },
    { name: 'Motion graphics', pts: sample(shapes.building, N) },
    { name: 'Website design', pts: sample(shapes.browser, N) },
    { name: '3D websites', pts: cube(N) },
    { name: '', all: true, pts: null }, // last: all four services together, laid out to suit the frame
  ];
  const services = steps.slice(1, 5);

  // All four signs at once: side by side on a wide frame, two by two on a narrow one.
  // Each point takes its place from one of the four shapes, so every sign keeps a quarter of the points.
  const layout = () => {
    const row = camera.aspect >= 1.9;
    const scale = row ? 0.5 : 0.36;
    const spots = row ? [[-2.25, 0.12], [-0.75, 0.12], [0.75, 0.12], [2.25, 0.12]] : [[-0.7, 0.66], [0.7, 0.66], [-0.7, -0.58], [0.7, -0.58]];
    const pts = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const k = i % 4, [ox, oy] = spots[k], src = services[k].pts;
      pts[i * 3] = src[i * 3] * scale + ox;
      pts[i * 3 + 1] = src[i * 3 + 1] * scale + oy;
      pts[i * 3 + 2] = src[i * 3 + 2] * scale;
    }
    return { pts, labels: spots.map(([x, y]) => new THREE.Vector3(x, y - 1.18 * scale, 0)) };
  };

  const ink = new THREE.Color().setRGB(...tokenRGB('--color-ink', [0.95, 0.95, 0.95]), THREE.SRGBColorSpace);
  const rand = new Float32Array(N * 4).map(() => Math.random());
  const geometry = new THREE.BufferGeometry();
  const from = new THREE.BufferAttribute(cloud(N, 6, 2.6, 2), 3);
  const to = new THREE.BufferAttribute(steps[0].pts.slice(), 3);
  geometry.setAttribute('position', to);
  geometry.setAttribute('aFrom', from);
  geometry.setAttribute('aTo', to);
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);

  const uniforms = {
    uMix: { value: 0 }, uTime: { value: 0 }, uScatter: { value: 0.5 },
    uSize: { value: (lite ? 19 : 16) * ratio }, uPointer: { value: new THREE.Vector3(9, 9, 0) },
    uColor: { value: ink }, uAlpha: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const group = new THREE.Group();
  group.add(new THREE.Points(geometry, material));
  scene.add(group);

  // faint dust across the whole frame, so the wide stage never looks empty
  const dust = cloud(DUST, 9, 3.2, 2.5);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dust, 3));
  dustGeo.setAttribute('aFrom', new THREE.BufferAttribute(dust, 3));
  dustGeo.setAttribute('aTo', new THREE.BufferAttribute(dust, 3));
  dustGeo.setAttribute('aRand', new THREE.BufferAttribute(new Float32Array(DUST * 4).map(() => Math.random()), 4));
  const dustMat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...uniforms, uMix: { value: 1 }, uScatter: { value: 0 }, uAlpha: { value: 0.35 }, uPointer: { value: new THREE.Vector3(9, 9, 0) } } });
  scene.add(new THREE.Points(dustGeo, dustMat));

  // The words under each shape
  const caption = document.createElement('p');
  caption.className = 'hero__caption';
  caption.setAttribute('aria-hidden', 'true');
  caption.textContent = steps[0].name;
  el.append(caption);

  // ...and the four names under the signs in the last scene, placed by projecting each sign's foot onto the frame
  const tags = document.createElement('div');
  tags.className = 'hero__tags';
  tags.setAttribute('aria-hidden', 'true');
  const tagEls = services.map((sv) => { const t = document.createElement('span'); t.textContent = sv.name; tags.append(t); return t; });
  tags.hidden = true;
  el.append(tags);
  let tagSpots = null;
  const v = new THREE.Vector3();
  const placeTags = () => {
    if (!tagSpots) return;
    tagSpots.forEach((p, i) => {
      v.copy(p).applyMatrix4(group.matrixWorld).project(camera);
      tagEls[i].style.left = `${((v.x + 1) / 2) * 100}%`;
      tagEls[i].style.top = `${((1 - v.y) / 2) * 100}%`;
    });
  };

  // Size to the frame: the shapes fill about three quarters of the frame's height
  const fit = () => {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const tall = 2.4 / Math.tan(fov / 2) / 2 / 0.76;
    const wide = tall / Math.min(1, camera.aspect / 1.1);
    camera.position.set(0, 0, Math.max(tall, wide));
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(fit).observe(el);
  fit();

  // Pointer, in scene units on the z = 0 plane
  const target = { x: 0, y: 0 }, ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  let pointerOn = 0;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -((e.clientY - r.top) / r.height) * 2 + 1;
    target.x = nx * 0.25; target.y = ny * 0.12;
    ray.setFromCamera({ x: nx, y: ny }, camera);
    if (ray.ray.intersectPlane(plane, hit)) { uniforms.uPointer.value.x = hit.x; uniforms.uPointer.value.y = hit.y; }
    pointerOn = 1;
  });
  el.addEventListener('pointerleave', () => { pointerOn = 0; target.x = target.y = 0; });

  // Timeline: form, hold, then re-form into the next shape
  const MORPH = 0.55, HOLD = 0.75, HOLD_LOGO = 1.3, HOLD_ALL = 2.2;
  let step = 0, clock = 0;
  const next = () => {
    from.array.set(to.array);
    step = (step + 1) % steps.length;
    if (steps[step].logo) steps[step].pts = lockup(camera.aspect >= 1.9)(N);
    if (steps[step].all) { const l = layout(); to.array.set(l.pts); tagSpots = l.labels; tags.hidden = false; } else { to.array.set(steps[step].pts); tagSpots = null; tags.hidden = true; }
    from.needsUpdate = to.needsUpdate = true;
    clock = 0;
    uniforms.uScatter.value = 0.35 + Math.random() * 0.3;
    caption.classList.remove('is-shown');
    tags.classList.remove('is-shown');
  };

  for (let i = 0; i < start; i++) next(); // start partway through (for re-capturing stills)
  let visible = true, paused = false, raf = 0, last = performance.now(), t = 0, skip = false;
  const pose = (dt) => {
    clock += dt;
    const all = steps[step].all;
    if (clock > MORPH + (all ? HOLD_ALL : steps[step].logo ? HOLD_LOGO : HOLD)) next();
    uniforms.uMix.value = Math.min(clock / MORPH, 1);
    if (clock > MORPH * 0.7) {
      if (all) tags.classList.add('is-shown');
      else if (!caption.classList.contains('is-shown')) { caption.textContent = steps[step].name; caption.classList.add('is-shown'); }
    }
    uniforms.uTime.value = t;
    uniforms.uPointer.value.z += (pointerOn - uniforms.uPointer.value.z) * 0.08;
    const sway = all ? 0.25 : 1; // hold the row nearly still so the names stay under their signs
    group.rotation.y += ((Math.sin(t * 0.3) * 0.22 + target.x) * sway - group.rotation.y) * 0.04;
    group.rotation.x += ((Math.sin(t * 0.23) * 0.06 - target.y) * sway - group.rotation.x) * 0.04;
    group.updateMatrixWorld();
    placeTags();
  };
  const frame = (now) => {
    raf = 0;
    if (lite && (skip = !skip)) { loop(); return; } // phones: draw every other frame (about 30 fps)
    const dt = Math.min((now - last) / 1000, 0.05); last = now; t += dt;
    pose(dt);
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

  pose(0);
  renderer.render(scene, camera);
  requestAnimationFrame(() => el.classList.add('is-live')); // fade the canvas in over the still
  loop();
}
