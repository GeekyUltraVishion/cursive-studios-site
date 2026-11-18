// Cursive Studios: homepage behaviour.
// 1. Mobile menu  2. Contact details and featured work from content/data.json  3. Footer year.
// The HTML already holds the same content, so the page works if this script or the fetch fails.

(() => {
  // 1. Mobile menu
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  if (header && toggle) {
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    header.querySelectorAll('.nav__list a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    matchMedia('(min-width: 60.0625rem)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  // 3. Footer year
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  // 2. Content from data.json (needs the site served over http, not opened as a file)
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const applyContact = (c) => {
    if (!c) return;
    if (c.instagram) {
      const handle = c.instagram.replace(/^@/, '');
      document.querySelectorAll('[data-instagram-link]').forEach((a) => { a.href = `https://www.instagram.com/${handle}/`; });
      document.querySelectorAll('[data-instagram-dm]').forEach((a) => { a.href = `https://ig.me/m/${handle}`; });
    }
    if (c.email) {
      document.querySelectorAll('[data-email]').forEach((a) => { a.href = `mailto:${c.email}`; });
      document.querySelectorAll('[data-email-text]').forEach((s) => {
        s.textContent = c.email;
        s.classList.toggle('fill', c.placeholder !== false);
      });
    }
  };

  const workItem = (w, i) => {
    const pos = w.focus ? ` style="object-position: ${esc(w.focus)}"` : '';
    let media;
    if (w.video) {
      media = `<figure class="work__media"><video controls playsinline preload="none"${w.poster ? ` poster="${esc(w.poster)}"` : ''} aria-label="${esc(w.alt || w.title)}"><source src="${esc(w.video)}" type="video/mp4"></video></figure>`;
    } else if (w.placeholder) {
      media = `<figure class="work__media" data-slot="work-${i + 1}"><img src="${esc(w.poster)}" loading="lazy" alt="${esc(w.alt)}"${pos}></figure>`;
    } else {
      media = `<figure class="work__media"><img class="real" src="${esc(w.poster)}" loading="lazy" alt="${esc(w.alt)}"${pos}></figure>`;
    }
    return `<li class="work__item">${media}<h3 class="work__title">${esc(w.title)}</h3><p class="work__meta">${esc(w.service)}</p></li>`;
  };

  const applyWork = (data) => {
    const list = document.querySelector('[data-work]');
    if (!list || !Array.isArray(data.work)) return;
    list.innerHTML = data.work.slice(0, 4).map(workItem).join('');
    list.querySelectorAll('[data-slot] img').forEach((img) => img.addEventListener('error', () => img.remove(), { once: true }));

    const credits = [data.hero?.credit, ...data.work.slice(0, 4).filter((w) => w.placeholder).map((w) => w.credit)].filter(Boolean);
    const line = document.querySelector('[data-credits]');
    if (line) {
      line.hidden = credits.length === 0;
      line.innerHTML = 'Photographs: ' + credits.map((c) => `<a href="${esc(c.url)}">${esc(c.name)}</a> (${esc(c.licence)})`).join(', ') + ', via Wikimedia Commons.';
    }
  };

  fetch('content/data.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => { applyContact(data.contact); applyWork(data); })
    .catch(() => { /* keep the content already in the HTML */ });
})();
