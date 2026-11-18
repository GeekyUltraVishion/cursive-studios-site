// Cursive Studios: enquiry form on /contact.
// - The "Style you like" list comes from the same data files as the galleries, so new styles appear here too.
// - Sends to Netlify Forms or Formspree, set in content/data.json ("form"). See content/README.md.
// - Never shows "sent" unless the form service actually accepted it.

(() => {
  const form = document.querySelector('[data-enquiry]');
  if (!form) return;
  const status = form.querySelector('[data-enquiry-status]');
  const service = form.querySelector('#f-service');
  const style = form.querySelector('#f-style');
  const submit = form.querySelector('[type="submit"]');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let config = { provider: 'netlify', formspreeId: '' };
  let groups = [...style.querySelectorAll('optgroup')].map((g) => ({ name: g.label, styles: [...g.querySelectorAll('option')].map((o) => o.textContent) }));

  const say = (msg, kind = '') => { status.textContent = msg; status.className = 'field__status' + (kind ? ` is-${kind}` : ''); };

  // Style list: only the chosen service's styles (all of them when the service is unknown)
  const renderStyles = () => {
    const keep = style.value;
    const chosen = groups.filter((g) => g.name === service.value);
    const show = chosen.length ? chosen : groups;
    style.innerHTML = '<option value="Not sure yet">Not sure yet</option>' + show.map((g) =>
      `<optgroup label="${esc(g.name)}">${g.styles.map((s) => `<option value="${esc(`${g.name}: ${s}`)}">${esc(s)}</option>`).join('')}</optgroup>`).join('');
    if ([...style.options].some((o) => o.value === keep)) style.value = keep;
  };
  service.addEventListener('change', renderStyles);

  // Keep the style list in step with the gallery data files
  const sources = [
    ['AI UGC Ads', 'content/ugc/videos.json', (d) => (d.categories || []).map((c) => c.name)],
    ['Motion Graphics', 'content/motion-graphics.json', (d) => (d.styles || []).map((s) => s.name)],
    ['Website Design', 'content/website-design.json', (d) => (d.styles || []).map((s) => s.name)],
    ['3D Websites', 'content/3d-websites.json', (d) => (d.styles || []).map((s) => s.name)],
  ];
  Promise.all(sources.map(([name, url, pick]) => fetch(url).then((r) => r.json()).then((d) => ({ name, styles: pick(d) })).catch(() => null)))
    .then((list) => { if (list.every(Boolean)) { groups = list; renderStyles(); } });
  fetch('content/data.json').then((r) => r.json()).then((d) => { if (d.form) config = { ...config, ...d.form }; }).catch(() => {});

  // Validation: the browser's rules, explained in plain words beside each field
  const messages = { 'f-name': 'Add your name.', 'f-reply': 'Add an email address or an Instagram handle so we can reply.', 'f-service': 'Choose a service, or "Not sure yet".', 'f-message': 'Tell us a little about what you need.' };
  const check = () => {
    let first = null;
    form.querySelectorAll('[required]').forEach((el) => {
      const ok = el.value.trim() !== '';
      el.setAttribute('aria-invalid', String(!ok));
      let err = el.parentElement.querySelector('.field__error');
      if (!ok) {
        if (!err) { err = document.createElement('p'); err.className = 'field__error'; err.id = `${el.id}-error`; el.parentElement.append(err); }
        err.textContent = messages[el.id] || 'This is needed.';
        el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), err.id].filter((v) => v && !v.includes('-error')).concat(err.id).join(' '));
        first ??= el;
      } else if (err) err.remove();
    });
    if (first) first.focus();
    return !first;
  };
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) { e.target.setAttribute('aria-invalid', 'false'); e.target.parentElement.querySelector('.field__error')?.remove(); } });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!check()) { say('A few fields need a look.', 'error'); return; }
    if (form.querySelector('[name="company-website"]').value) return; // a bot filled the hidden field

    const fallback = 'Please DM us on Instagram or email us instead.';
    let request;
    if (config.provider === 'formspree') {
      if (!config.formspreeId) { say(`The form is not connected yet, so nothing was sent. ${fallback}`, 'error'); return; }
      request = fetch(`https://formspree.io/f/${encodeURIComponent(config.formspreeId)}`, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    } else {
      request = fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
    }

    submit.setAttribute('aria-busy', 'true'); submit.disabled = true; say('Sending...');
    try {
      const res = await request;
      if (!res.ok) throw new Error(String(res.status));
      form.reset(); renderStyles();
      say('Thanks, your enquiry is in. We will reply on Instagram or by email, whichever you left.', 'done');
    } catch {
      say(`That did not go through. ${fallback}`, 'error');
    } finally {
      submit.removeAttribute('aria-busy'); submit.disabled = false;
    }
  });
})();
