/* Alison Eyo · The AI Productivity Workshop */

const CONFIG = {
  // Workshop start, for the countdown. The date shown on the page (SAT, 5 DEC / 8PM UK) is in index.html.
  // Leave empty ('') to hide the date and the countdown.
  eventStart: '2026-12-05T20:00:00Z' // Sat 5 Dec, 8pm UK (GMT)
};
// Sign-ups go through the Serlzo form embedded in the dialog (index.html).
// After submitting, the pop-up closes and a "You're in" card (thanks.js) shows in the closing section.

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
  let opener = null;
  let registered = false;

  const open = e => {
    opener = e.currentTarget;
    if (registered) { scrollToThanks(); return; } // already signed up: show the "You're in" card again
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => $('.reg-close', dialog).focus(), 50);
    // Serlzo's script makes the form frame lazy, which can leave it blank inside a dialog. Load it now.
    const frame = $('.reg-embed iframe', dialog);
    if (frame && frame.loading === 'lazy') frame.loading = 'eager';
    pixel('RegisterOpen', { location: opener.dataset.register || 'hero' }, true);
  };
  const close = () => { if (dialog.open) dialog.close(); };
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    if (opener && !registered) opener.focus();
  });
  $$('[data-register]').forEach(b => b.addEventListener('click', open));
  $$('[data-close]', dialog).forEach(b => b.addEventListener('click', close));
  // Click on the backdrop closes it
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });

  const scrollToThanks = () => {
    const ty = $('.final .ty');
    if (ty) ty.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  };

  // Signed up: close the pop-up and show the "You're in" card in the closing section (as on /job)
  const success = ({ name = '', email = '' } = {}) => {
    // Serlzo's redirect can open inside the form frame: hand over to the full page instead
    if (window.top !== window) {
      const qs = new URLSearchParams({ registered: '1' });
      const first = String(name).trim().split(/\s+/)[0].slice(0, 40);
      if (first) qs.set('name', first);
      try { window.top.location.replace('/ai/?' + qs); return; } catch (e) { /* fall through */ }
    }
    if (registered) return;
    registered = true;
    close();
    if (window.showThanks) window.showThanks({ name, email });
    let counted = false;
    try { counted = sessionStorage.getItem('ai-registered') === '1'; sessionStorage.setItem('ai-registered', '1'); } catch (e) { /* ignore */ }
    if (!counted) {
      const details = { content_name: 'The AI Productivity Workshop', content_category: 'Workshop' };
      pixel('Lead', details);
      pixel('CompleteRegistration', { ...details, status: true });
    }
    setTimeout(scrollToThanks, 120);
  };

  // Route 1: Serlzo redirects to /ai/?registered=1 with the answers as URL parameters.
  // Read the name and email, then clear them from the address bar.
  const params = new URLSearchParams(location.search);
  const clean = v => (v && !/[{}<>]/.test(v) ? v.trim() : '');
  const findParam = (preferred, pattern) => {
    for (const k of preferred) if (clean(params.get(k))) return clean(params.get(k));
    for (const [k, v] of params) if (pattern.test(k) && !/last|sur/i.test(k) && clean(v)) return clean(v);
    return '';
  };
  const regEmail = findParam(['email', 'field_email', 'email_address'], /e-?mail/i);
  if (params.get('registered') === '1' || /@/.test(regEmail)) {
    const regName = findParam(['first_name', 'firstName', 'name', 'full_name', 'fullName', 'field_full_name'], /name/i);
    history.replaceState(null, '', location.pathname + location.hash);
    // wait for the page to lay out before scrolling to the card
    if (document.readyState === 'complete') success({ name: regName, email: regEmail });
    else window.addEventListener('load', () => success({ name: regName, email: regEmail }), { once: true });
  }

  // Route 2: Serlzo's embed posts a message when the form is submitted (as on /job)
  const formId = $('.reg-embed', dialog)?.getAttribute('data-serlzo-form');
  const pick = (obj, keys) => {
    for (const src of [obj, obj.data, obj.fields, obj.values, obj.answers, obj.submission, obj.submission && obj.submission.answers]) {
      if (!src || typeof src !== 'object') continue;
      for (const k of keys) if (typeof src[k] === 'string' && src[k]) return src[k];
    }
    return '';
  };
  window.addEventListener('message', e => {
    const data = e.data || {};
    let host = '';
    try { host = new URL(e.origin).hostname; } catch (err) { return; }
    if (!/(^|\.)serlzo\.(com|site)$/.test(host) || data.type !== 'serlzo-form-submitted') return;
    if (formId && data.publicId && data.publicId !== formId) return;
    success({
      name: pick(data, ['first_name', 'firstName', 'name', 'full_name', 'fullName', 'field_full_name']),
      email: pick(data, ['email', 'field_email', 'email_address'])
    });
  });
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
