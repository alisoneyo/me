/* Alison Eyo · The AI Productivity Workshop */

const CONFIG = {
  // Workshop start, for the countdown. The date shown on the page (SAT, 5 DEC / 8PM UK) is in index.html.
  // Leave empty ('') to hide the date and the countdown.
  eventStart: '2026-12-05T20:00:00Z', // Sat 5 Dec, 8pm UK (GMT)
  // Where the form sends { firstName, lastName, email, phone, marketingOptIn, source } as JSON.
  // Not connected yet: until it is, submitting shows an error instead of pretending to register.
  // Preview the states with ?preview=success or ?preview=error on the page URL.
  registerUrl: ''
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.2,.8,.2,1)';
const start = CONFIG.eventStart ? new Date(CONFIG.eventStart) : null;
// Meta Pixel events (standard or custom). Does nothing if the pixel is blocked.
const pixel = (event, params = {}, custom = false) => {
  try { if (window.fbq) window.fbq(custom ? 'trackCustom' : 'track', event, params); } catch (e) {}
};

/* ---------- Date ---------- */

// The date is fixed in the markup (SAT, 5 DEC / 8PM UK). This only starts the countdown.
function initEvent() {
  if (!start || isNaN(start)) {
    $$('.live-when, .nav-live').forEach(el => { el.hidden = true; });
    return;
  }
  initCountdown();
}

/* ---------- Countdown ---------- */

function initCountdown() {
  const box = $('[data-countdown]');
  const sticky = $('[data-sticky-when]');
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const ms = start - Date.now();
    if (ms <= 0) { // started: no countdown
      box.hidden = true;
      sticky.hidden = true;
      return false;
    }
    const s = Math.floor(ms / 1000);
    const v = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
    for (const k in v) $(`[data-cd="${k}"]`, box).textContent = pad(v[k]);
    sticky.replaceChildren(`${v.d}d ${pad(v.h)}h ${pad(v.m)}m ${pad(v.s)}s`, Object.assign(document.createElement('small'), { textContent: 'Sat, 5 Dec · 8pm UK' }));
    return true;
  };
  if (!tick()) return;
  box.hidden = false;
  sticky.hidden = false;
  const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
}

/* ---------- Registration ---------- */

function initRegistration() {
  const dialog = $('.reg');
  const formView = $('.reg-form-view', dialog);
  const done = $('.reg-done', dialog);
  const form = $('.reg-form', dialog);
  const submit = $('button[type="submit"]', form);
  const formError = $('.form-error', form);
  let source = 'hero';
  let opener = null;

  const open = e => {
    opener = e.currentTarget;
    source = opener.dataset.register || 'hero';
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
    const first = done.hidden ? $('input[name="firstName"]', form) : $('[data-close]', done);
    setTimeout(() => first.focus(), 50);
    pixel('RegisterOpen', { location: source }, true);
  };
  const close = () => { if (dialog.open) dialog.close(); };
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    if (opener) opener.focus();
  });
  $$('[data-register]').forEach(b => b.addEventListener('click', open));
  $$('[data-close]', dialog).forEach(b => b.addEventListener('click', close));
  // Click on the backdrop closes it
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });

  const fieldError = (name, show) => {
    const input = form.elements[name];
    input.setAttribute('aria-invalid', show ? 'true' : 'false');
    const msg = $(`[data-error-for="${name}"]`, form);
    msg.hidden = !show;
    if (show) { msg.id = msg.id || `err-${name}`; input.setAttribute('aria-describedby', msg.id); }
    else input.removeAttribute('aria-describedby');
  };
  const FIELDS = ['firstName', 'lastName', 'email', 'phone'];
  const checks = {
    firstName: v => v.length > 0,
    lastName: v => v.length > 0,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    phone: v => /^\+?[\d\s().-]{7,}$/.test(v) && v.replace(/\D/g, '').length >= 7
  };
  const validate = () => {
    const bad = FIELDS.filter(n => !checks[n](form.elements[n].value.trim()));
    FIELDS.forEach(n => fieldError(n, bad.includes(n)));
    if (bad.length) form.elements[bad[0]].focus();
    return bad.length === 0;
  };
  FIELDS.forEach(n => form.elements[n].addEventListener('input', () => {
    if (form.elements[n].getAttribute('aria-invalid') === 'true') fieldError(n, false);
  }));

  const setLoading = on => {
    submit.classList.toggle('is-loading', on);
    submit.disabled = on;
    $('.btn-label', submit).textContent = on ? 'Saving your seat…' : 'Save my free seat';
  };
  const showError = text => { formError.textContent = text; formError.hidden = false; };

  const send = async payload => {
    const preview = new URLSearchParams(location.search).get('preview');
    if (preview) { // design preview only
      await new Promise(r => setTimeout(r, 1200));
      if (preview === 'error') throw new Error('preview');
      return;
    }
    if (!CONFIG.registerUrl) throw new Error('not-connected');
    const res = await fetch(CONFIG.registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    formError.hidden = true;
    if (!validate()) return;
    const typed = form.elements.firstName.value.trim().slice(0, 60);
    const firstName = typed.charAt(0).toUpperCase() + typed.slice(1);
    const payload = {
      firstName,
      lastName: form.elements.lastName.value.trim().slice(0, 60),
      email: form.elements.email.value.trim().slice(0, 120),
      phone: form.elements.phone.value.trim().slice(0, 25),
      marketingOptIn: form.elements.marketing.checked, // separate from the workshop emails
      source
    };
    setLoading(true);
    try {
      await send(payload);
      $('[data-done-title]', dialog).textContent = `You’re in, ${firstName}!`;
      formView.hidden = true;
      done.hidden = false;
      done.focus();
      const details = { content_name: 'The AI Productivity Workshop', content_category: 'Workshop' };
      pixel('Lead', details);
      pixel('CompleteRegistration', { ...details, status: true });
    } catch (err) {
      showError(err.message === 'not-connected'
        ? 'Registration isn’t open just yet. Please check back soon.'
        : 'Something went wrong and your seat wasn’t saved. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  });
}

/* ---------- Sticky CTA (mobile) ---------- */

// Pin the button to the bottom once the hero button has scrolled away,
// and take it down when the final section comes into view.
function initStickyCta() {
  const bar = $('.sticky-cta');
  const btn = $('.btn-dark', bar);
  const heroBtn = $('.hero-body > .btn-dark');
  const final = $('.final');
  const mobile = window.matchMedia('(max-width: 639px)');
  let shown = false;
  const update = () => {
    const show = mobile.matches && heroBtn.getBoundingClientRect().bottom < 0
      && final.getBoundingClientRect().top > window.innerHeight * .6;
    if (show === shown) return;
    shown = show;
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', String(!show));
    btn.tabIndex = show ? 0 : -1;
  };
  window.addEventListener('scroll', update, { passive: true });
  mobile.addEventListener('change', update);
  update();
}

/* ---------- Scroll reveal ---------- */

function initReveal() {
  const els = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
  const show = (el, d = 0) => {
    io.unobserve(el);
    el.style.transition = `opacity 1s ${EASE} ${d}ms, transform 1.1s ${EASE} ${d}ms`;
    el.classList.add('is-in');
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) show(e.target, +e.target.dataset.delay || 0);
  }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  els.forEach(el => io.observe(el));
  // Safety net if the observer is slow to fire
  setTimeout(() => els.forEach(el => {
    if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight * 1.2) show(el);
  }), 1200);
}

initEvent();
initRegistration();
initStickyCta();
initReveal();
