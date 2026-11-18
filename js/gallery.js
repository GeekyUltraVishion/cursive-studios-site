// Cursive Studios: style gallery for the service pages.
// Reads the page's data file (data-source on [data-gallery]) and content/data.json for the Instagram handle.
// Data file shape (see content/README.md):
//   { "styles": [{ "id": "product", "name": "Product" }],
//     "samples": [{ "style": "product", "title": "", "description": "", "thumb": "", "video": "", "image": "", "alt": "", "url": "", "placeholder": true, "credit": {} }] }

(() => {
  const root = document.querySelector('[data-gallery]');
  if (!root) return;

  const tabsEl = root.querySelector('[data-gallery-tabs]');
  const grid = root.querySelector('[data-gallery-grid]');
  const frame = root.dataset.frame === 'browser';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let dmHref = 'https://ig.me/m/yourhandle';
  let samples = [];
  let styleNames = {};

  // Viewer (one dialog per page)
  const viewer = document.querySelector('[data-viewer]');
  const vMedia = viewer?.querySelector('[data-viewer-media]');
  const vTitle = viewer?.querySelector('[data-viewer-title]');
  const vDesc = viewer?.querySelector('[data-viewer-desc]');
  const vStyle = viewer?.querySelector('[data-viewer-style]');
  const vRequest = viewer?.querySelector('[data-viewer-request]');
  let lastOpener = null;

  const mediaThumb = (s) => {
    const pos = s.focus ? ` style="object-position: ${esc(s.focus)}"` : '';
    const slot = s.placeholder ? ' data-slot' : '';
    const inner = s.video
      ? `<video muted loop playsinline preload="none" controlslist="nodownload" disablepictureinpicture${s.thumb ? ` poster="${esc(s.thumb)}"` : ''} aria-hidden="true"><source src="${esc(s.video)}" type="video/mp4"></video>`
      : `<img src="${esc(s.thumb)}" alt="${esc(s.alt)}" loading="lazy"${pos}>`;
    const shot = `<span class="card__shot"${slot}>${inner}</span>`;
    if (!frame) return `<span class="card__media">${shot}</span>`;
    return `<span class="card__media card__media--browser"><span class="browser__bar">${esc(s.url || 'yoursite.com')}</span>${shot}</span>`;
  };

  const card = (s, i) => `
    <li class="card" data-style="${esc(s.style)}">
      <button class="card__open" type="button" aria-haspopup="dialog" data-index="${i}">
        ${mediaThumb(s)}
        <span class="card__title">${esc(s.title)}</span>
      </button>
      <p class="card__desc">${esc(s.description)}</p>
      <div class="card__foot">
        ${styleNames[s.style] ? `<span class="card__style">${esc(styleNames[s.style])}</span>` : '<span></span>'}
        ${tabsEl ? `<a class="btn btn--small" href="${esc(dmHref)}" data-request>Request this style</a>` : ''}
      </div>
    </li>`;

  const render = () => {
    grid.innerHTML = samples.map(card).join('');
    grid.querySelectorAll('[data-slot] img').forEach((img) => img.addEventListener('error', () => img.remove(), { once: true }));
    grid.querySelectorAll('.card__open').forEach((btn) => {
      const v = btn.querySelector('video');
      btn.addEventListener('click', () => open(Number(btn.dataset.index), btn));
      if (v) {
        const play = () => { if (!reduce.matches) v.play().catch(() => {}); };
        const stop = () => { v.pause(); };
        btn.addEventListener('pointerenter', play); btn.addEventListener('focus', play);
        btn.addEventListener('pointerleave', stop); btn.addEventListener('blur', stop);
      }
    });
  };

  const filter = (id) => {
    tabsEl?.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === id)));
    grid.querySelectorAll('.card').forEach((c) => { c.hidden = id !== 'all' && c.dataset.style !== id; });
    const shown = grid.querySelectorAll('.card:not([hidden])').length;
    const status = root.querySelector('[data-gallery-status]');
    if (status) status.textContent = shown ? '' : 'No samples in this style yet. Ask us for one on Instagram.';
  };

  const renderTabs = (styles) => {
    if (!tabsEl) return;
    if (!styles.length) { tabsEl.hidden = true; return; }
    tabsEl.innerHTML = [{ id: 'all', name: 'All' }, ...styles].map((s) => `<button type="button" class="tab" data-filter="${esc(s.id)}" aria-pressed="${s.id === 'all'}">${esc(s.name)}</button>`).join('');
    tabsEl.addEventListener('click', (e) => { const b = e.target.closest('button[data-filter]'); if (b) filter(b.dataset.filter); });
  };

  function open(i, opener) {
    const s = samples[i];
    if (!viewer || !s) return;
    lastOpener = opener;
    vTitle.textContent = s.title;
    vDesc.textContent = s.description;
    if (vStyle) vStyle.textContent = styleNames[s.style] || '';
    if (vRequest) { vRequest.href = dmHref; vRequest.hidden = !tabsEl; }
    const full = s.image || s.thumb;
    vMedia.className = 'viewer__media' + (s.placeholder && !s.video ? ' is-standin' : '');
    vMedia.innerHTML = s.video
      ? `<video controls controlslist="nodownload" disablepictureinpicture playsinline ${reduce.matches ? '' : 'autoplay muted'} ${s.thumb ? `poster="${esc(s.thumb)}"` : ''}><source src="${esc(s.video)}" type="video/mp4"></video>`
      : `<img src="${esc(full)}" alt="${esc(s.alt)}">`;
    if (frame && !s.video) vMedia.insertAdjacentHTML('afterbegin', `<span class="browser__bar">${esc(s.url || 'yoursite.com')}</span>`);
    viewer.showModal();
  }

  viewer?.addEventListener('close', () => {
    vMedia.querySelectorAll('video').forEach((v) => v.pause());
    vMedia.innerHTML = '';
    lastOpener?.focus();
  });
  viewer?.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
  viewer?.querySelector('[data-viewer-close]')?.addEventListener('click', () => viewer.close());

  const setCredits = () => {
    const credits = samples.filter((s) => s.placeholder && s.credit).map((s) => s.credit);
    const seen = new Set();
    const uniq = credits.filter((c) => !seen.has(c.url) && seen.add(c.url));
    const line = document.querySelector('[data-credits]');
    if (!line) return;
    line.hidden = uniq.length === 0;
    line.innerHTML = 'Photographs: ' + uniq.map((c) => `<a href="${esc(c.url)}">${esc(c.name)}</a> (${esc(c.licence)})`).join(', ') + ', via Wikimedia Commons.';
  };

  Promise.all([
    fetch(root.dataset.source, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    fetch('content/data.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
  ]).then(([data, site]) => {
    const handle = site.contact?.instagram?.replace(/^@/, '');
    if (handle) dmHref = `https://ig.me/m/${handle}`;
    const styles = Array.isArray(data.styles) ? data.styles : [];
    styleNames = Object.fromEntries(styles.map((s) => [s.id, s.name]));
    samples = Array.isArray(data.samples) ? data.samples : [];
    renderTabs(styles);
    render();
    if (tabsEl && styles.length) filter('all');
    setCredits();
  }).catch(() => {
    grid.innerHTML = '';
    const status = root.querySelector('[data-gallery-status]');
    if (status) status.textContent = 'The samples did not load. See them on our Instagram instead.';
  });
})();
