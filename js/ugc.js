// Cursive Studios: AI UGC Ads video gallery.
// Reads content/ugc/videos.json (format in content/ugc/README.md) and content/data.json for the Instagram handle.
// Cards preview muted on hover (desktop) or on first tap (touch); clicking, or a second tap, opens the full-screen player with sound.

(() => {
  const DATA = 'content/ugc/videos.json';
  const grid = document.querySelector('[data-ads]');
  const strip = document.querySelector('[data-latest]');
  if (!grid) return;

  const tabsEl = document.querySelector('[data-ad-tabs]');
  const orderEl = document.querySelector('[data-ad-order]');
  const statusEl = document.querySelector('[data-ads-status]');
  const player = document.querySelector('[data-player]');
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isUrl = (s) => /^https?:\/\//.test(s || '');
  const videoUrl = (v) => (isUrl(v.file) ? v.file : `content/ugc/videos/${v.file}`);
  const thumbUrl = (v) => (!v.thumb ? '' : isUrl(v.thumb) ? v.thumb : `content/ugc/thumbs/${v.thumb}`);
  const fmtDate = (d) => { const t = new Date(`${d}T12:00:00`); return Number.isNaN(+t) ? d : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };

  let dmHref = 'https://ig.me/m/yourhandle';
  let igHref = 'https://www.instagram.com/yourhandle/';
  let videos = [];
  let cats = {};
  let filter = 'all';
  let order = 'newest';
  let current = null;   // card currently previewing
  let listIndex = [];   // order of videos in the grid, for next and previous in the player

  // ---- cards
  const cardHtml = (v, i, { cta = true } = {}) => `
    <li class="ad" data-i="${i}" data-category="${esc(v.category)}">
      <div class="ad__frame">
        ${v.thumb ? `<img src="${esc(thumbUrl(v))}" alt="" loading="lazy">` : ''}
        <button class="ad__open" type="button" aria-haspopup="dialog" aria-label="Play ${esc(v.title)} with sound"></button>
        <span class="ad__hint" aria-hidden="true">Tap again for sound</span>
      </div>
      ${cta ? `<h3 class="ad__title">${esc(v.title)}</h3>
      <p class="ad__meta">${cats[v.category] ? `<span class="tag">${esc(cats[v.category])}</span>` : ''}<time datetime="${esc(v.date)}">${esc(fmtDate(v.date))}</time></p>
      <a class="btn btn--small" href="${esc(dmHref)}">Get a concept like this</a>` : ''}
    </li>`;

  const stopPreview = (card) => {
    if (!card) return;
    card.classList.remove('is-playing');
    const vid = card.querySelector('video');
    if (vid) vid.pause();
    if (current === card) current = null;
  };

  const startPreview = (card, touch) => {
    if (reduce.matches) return false;
    if (current && current !== card) stopPreview(current);
    const v = videos[Number(card.dataset.i)];
    let vid = card.querySelector('video');
    if (!vid) { // lazy: the video element and its file are only created on first preview
      vid = document.createElement('video');
      Object.assign(vid, { muted: true, loop: true, playsInline: true, preload: 'auto' });
      vid.setAttribute('muted', ''); vid.setAttribute('playsinline', ''); vid.setAttribute('aria-hidden', 'true');
      vid.src = videoUrl(v);
      card.querySelector('.ad__frame').prepend(vid);
    }
    card.classList.toggle('is-touch', !!touch);
    card.classList.add('is-playing');
    current = card;
    vid.play().catch(() => {});
    return true;
  };

  const offscreen = new IntersectionObserver((entries) => entries.forEach((e) => { if (!e.isIntersecting) stopPreview(e.target); }), { threshold: 0.2 });

  const wire = (root) => {
    root.querySelectorAll('.ad').forEach((card) => {
      const btn = card.querySelector('.ad__open');
      offscreen.observe(card);
      btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && canHover.matches) startPreview(card, false); });
      btn.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') stopPreview(card); });
      btn.addEventListener('focus', () => { if (canHover.matches) startPreview(card, false); });
      btn.addEventListener('blur', () => stopPreview(card));
      btn.addEventListener('click', (e) => {
        const touchLike = !canHover.matches || e.pointerType === 'touch' || e.pointerType === 'pen';
        if (touchLike && !card.classList.contains('is-playing') && startPreview(card, true)) return; // first tap previews
        openPlayer(Number(card.dataset.i));
      });
    });
  };

  // ---- grid, filters, order
  const sorted = () => videos.map((v, i) => i)
    .filter((i) => filter === 'all' || videos[i].category === filter)
    .sort((a, b) => (order === 'newest' ? -1 : 1) * String(videos[a].date).localeCompare(String(videos[b].date)));

  const renderGrid = () => {
    stopPreview(current);
    listIndex = sorted();
    grid.innerHTML = listIndex.map((i) => cardHtml(videos[i], i)).join('');
    wire(grid);
    statusEl.textContent = listIndex.length ? '' : 'No ads in this category yet. Ask us for one on Instagram.';
  };

  const renderTabs = (categories) => {
    tabsEl.innerHTML = [{ id: 'all', name: 'All' }, ...categories].map((c) => `<button type="button" class="tab" data-filter="${esc(c.id)}" aria-pressed="${c.id === 'all'}">${esc(c.name)}</button>`).join('');
    tabsEl.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-filter]');
      if (!b) return;
      filter = b.dataset.filter;
      tabsEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      renderGrid();
    });
  };

  // ---- full-screen player
  const pVideo = player?.querySelector('[data-player-video]');
  const pTitle = player?.querySelector('[data-player-title]');
  const pMeta = player?.querySelector('[data-player-meta]');
  const pCaption = player?.querySelector('[data-player-caption]');
  const pCta = player?.querySelector('[data-player-cta]');
  const pIg = player?.querySelector('[data-player-ig]');
  let playing = -1;
  let opener = null;

  function openPlayer(i) {
    if (!player) return;
    stopPreview(current);
    if (!player.open) { opener = document.activeElement; player.showModal(); }
    playing = i;
    const v = videos[i];
    pVideo.poster = thumbUrl(v);
    pVideo.src = videoUrl(v);
    pVideo.muted = false;
    pTitle.textContent = v.title;
    pMeta.innerHTML = `${cats[v.category] ? `<span class="tag">${esc(cats[v.category])}</span>` : ''}<time datetime="${esc(v.date)}">${esc(fmtDate(v.date))}</time>`;
    pCaption.textContent = v.caption || '';
    pCaption.hidden = !v.caption;
    pCta.href = dmHref;
    pIg.hidden = !v.instagram;
    if (v.instagram) pIg.href = v.instagram;
    pVideo.play().catch(() => {}); // starts with sound because the visitor clicked
  }

  const step = (d) => {
    const list = listIndex.includes(playing) ? listIndex : videos.map((_, i) => i);
    const at = list.indexOf(playing);
    openPlayer(list[(at + d + list.length) % list.length]);
  };

  if (player) {
    player.querySelector('[data-player-close]').addEventListener('click', () => player.close());
    player.querySelector('[data-player-prev]').addEventListener('click', () => step(-1));
    player.querySelector('[data-player-next]').addEventListener('click', () => step(1));
    player.addEventListener('keydown', (e) => {
      if (e.target.closest('video')) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
    player.addEventListener('close', () => { pVideo.pause(); pVideo.removeAttribute('src'); pVideo.load(); opener?.focus(); });
  }

  // ---- load
  Promise.all([
    fetch(DATA, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    fetch('content/data.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
  ]).then(([data, site]) => {
    const handle = site.contact?.instagram?.replace(/^@/, '');
    if (handle) { dmHref = `https://ig.me/m/${handle}`; igHref = `https://www.instagram.com/${handle}/`; }
    const categories = Array.isArray(data.categories) ? data.categories : [];
    cats = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    videos = (Array.isArray(data.videos) ? data.videos : []).filter((v) => v && v.file);
    renderTabs(categories);
    orderEl?.addEventListener('change', () => { order = orderEl.value; renderGrid(); });
    renderGrid();
    if (strip) {
      const newest = videos.map((v, i) => i).sort((a, b) => String(videos[b].date).localeCompare(String(videos[a].date))).slice(0, 3);
      strip.innerHTML = newest.map((i) => cardHtml(videos[i], i, { cta: false })).join('');
      wire(strip);
    }
    document.querySelectorAll('[data-instagram-follow]').forEach((a) => { a.href = igHref; });
  }).catch(() => {
    statusEl.textContent = 'The ads did not load. See them on our Instagram instead.';
  });
})();
