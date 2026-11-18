// Cursive Studios: homepage hero. A copper ribbon writing an endless cursive loop.
// Loaded only on the homepage, only after the page is idle, only with WebGL and without "reduce motion".

import * as THREE from '../vendor/three.module.min.js';
import { tokenRGB, reducedMotion } from './support.js';

// A closed path of joined loops, like a line of cursive "l"s: it sweeps left to right in front,
// then back behind, looping as it goes (a prolate cycloid wrapped into a loop).
function cursivePath(samples) {
  const pts = [];
  for (let i = 0; i < samples; i++) {
    const u = (i / samples) * Math.PI * 2;
    const x = 3.6 * Math.sin(u) + 0.5 * Math.sin(7 * u);
    const y = 0.62 * Math.cos(7 * u) + 0.22 * Math.sin(2 * u);
    const z = 1.2 * Math.cos(u) + 0.25 * Math.sin(7 * u);
    pts.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

const vertex = /* glsl */ `
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

const fragment = /* glsl */ `
  uniform vec3 uCopper; uniform vec3 uSheen; uniform float uHead; uniform float uLen; uniform float uGhost;
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 l = normalize(vec3(-0.4, 0.8, 0.6));
    float diff = 0.35 + 0.65 * max(dot(n, l), 0.0);
    float spec = pow(max(dot(reflect(-l, n), vView), 0.0), 24.0);
    float rim = pow(1.0 - max(dot(n, vView), 0.0), 2.0);
    vec3 col = uCopper * diff + uSheen * (spec * 0.8 + rim * 0.35);
    float a;
    if (uGhost > 0.0) {
      a = uGhost;
    } else {
      float d = fract(uHead - vUv.x);            // 0 at the pen, rising along the tail
      a = d < uLen ? 1.0 - smoothstep(0.0, uLen, d) : 0.0;
      a *= smoothstep(0.0, 0.004, d + 0.004);
    }
    if (a < 0.003) discard;
    gl_FragColor = vec4(col, a);
  }`;

export function mount(el, { tier = 'full' } = {}) {
  const lite = tier === 'lite';
  const renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lite ? 1.25 : 1.75));
  const canvas = renderer.domElement;
  canvas.className = 'hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  el.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 2.39, 0.1, 50);
  camera.position.set(0, 0, 9.5);

  const curve = cursivePath(lite ? 360 : 700);
  const geometry = new THREE.TubeGeometry(curve, lite ? 900 : 1800, lite ? 0.04 : 0.034, lite ? 6 : 10, true);
  const copper = new THREE.Color(...tokenRGB('--color-accent', [0.89, 0.56, 0.33]));
  const sheen = new THREE.Color(...tokenRGB('--color-ink', [0.95, 0.93, 0.89]));
  const uniforms = { uCopper: { value: copper }, uSheen: { value: sheen }, uHead: { value: 0.12 }, uLen: { value: 0.5 }, uGhost: { value: 0 } };
  const stroke = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false });
  const ghost = new THREE.ShaderMaterial({ uniforms: { ...uniforms, uGhost: { value: 0.1 } }, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false });

  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, ghost), new THREE.Mesh(geometry, stroke));
  group.rotation.set(0.18, -0.12, 0);
  scene.add(group);

  // Size to the frame
  const fit = () => {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 1.4 ? 14 : 9; // pull back on tall, narrow frames
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(fit).observe(el);
  fit();

  // Lean toward the pointer
  const target = { x: 0, y: 0 };
  el.closest('.hero')?.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 0.25;
  });

  // Run only while visible, not paused, and motion is allowed
  let visible = true, paused = false, raf = 0, last = performance.now(), t = 0;
  const frame = (now) => {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05); last = now; t += dt;
    uniforms.uHead.value = (uniforms.uHead.value + dt * 0.055) % 1;
    group.rotation.y += (target.x - 0.12 + Math.sin(t * 0.12) * 0.12 - group.rotation.y) * 0.04;
    group.rotation.x += (0.18 + target.y - group.rotation.x) * 0.04;
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

  renderer.render(scene, camera);
  requestAnimationFrame(() => el.classList.add('is-live')); // fade the canvas in over the still
  loop();
}
