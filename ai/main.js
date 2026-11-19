/* Alison Eyo · The AI Productivity Workshop */

const CONFIG = {
  // Workshop start, for the countdown. The date shown on the page (SAT, 5 DEC / 8PM UK) is in index.html.
  // Leave empty ('') to hide the date and the countdown.
  eventStart: '2026-12-05T20:00:00Z' // Sat 5 Dec, 8pm UK (GMT)
};
// Sign-ups go through the Serlzo form embedded in the dialog (index.html).
// After submitting, Serlzo sends the visitor to /ai/?registered=1, which opens the "You're in" view.

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
  let opener = null;

  const show = view => {
    formView.hidden = view !== 'form';
    done.hidden = view !== 'done';
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => (view === 'done' ? done : $('.reg-close', dialog)).focus(), 50);
  };
  const open = e => {
    opener = e.currentTarget;
    show('form');
    // Serlzo's script makes the form frame lazy, which can leave it blank inside a dialog. Load it now.
    const frame = $('.reg-embed iframe', dialog);
    if (frame && frame.loading === 'lazy') frame.loading = 'eager';
    pixel('RegisterOpen', { location: opener.dataset.register || 'hero' }, true);
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

  // Back from Serlzo after signing up: confirm, count the lead once, and tidy the URL.
  const params = new URLSearchParams(location.search);
  if (params.get('registered') === '1') {
    show('done');
    const details = { content_name: 'The AI Productivity Workshop', content_category: 'Workshop' };
    pixel('Lead', details);
    pixel('CompleteRegistration', { ...details, status: true });
    params.delete('registered');
    const qs = params.toString();
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
  }
}

/* ---------- Sticky CTA (mobile) ---------- */

// Pin the button to the bottom once the hero button has scrolled away,
// and take it down when the final section comes into view.
function initStickyCta() {
  const bar = $('.sticky-cta');
  const btn = $('.btn-dark', bar);
  const heroBtn = $('[data-register="hero"]');
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
