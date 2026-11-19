/* Alison Eyo · AI workshop · thank-you page */

const START = new Date('2026-12-05T20:00:00Z'); // Sat 5 Dec, 8pm UK
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pixel = (event, params, custom) => {
  try { if (window.fbq) window.fbq(custom ? 'trackCustom' : 'track', event, params); } catch (e) {}
};

// Greeting by first name (read and cleared from the URL in the page head)
const welcome = window.AI_WELCOME || {};
if (welcome.name) {
  const span = $('[data-ty-name]');
  span.textContent = welcome.name;
  span.before(', '); // the comma stays black, the name is pink
}

// Record the sign-up once per visit, only when arriving from the form
if (welcome.registered) {
  let seen = false;
  try { seen = sessionStorage.getItem('ai-registered') === '1'; sessionStorage.setItem('ai-registered', '1'); } catch (e) {}
  if (!seen) {
    const details = { content_name: 'The AI Productivity Workshop', content_category: 'Workshop' };
    pixel('Lead', details);
    pixel('CompleteRegistration', { ...details, status: true });
  }
}

// Countdown
const box = $('[data-countdown]');
const pad = n => String(n).padStart(2, '0');
const tick = () => {
  const ms = START - Date.now();
  if (ms <= 0) { box.hidden = true; return false; }
  const t = Math.floor(ms / 1000);
  const v = { d: Math.floor(t / 86400), h: Math.floor(t % 86400 / 3600), m: Math.floor(t % 3600 / 60), s: t % 60 };
  for (const k in v) $(`[data-cd="${k}"]`, box).textContent = pad(v[k]);
  box.hidden = false;
  return true;
};
if (tick()) { const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000); }

// Calendar clicks
$$('[data-cal]').forEach(a => a.addEventListener('click', () => pixel('AddToCalendar', { type: a.dataset.cal }, true)));

// Copy the workshop link
$$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  const text = btn.dataset.copy;
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { ok = false; }
  const label = btn.textContent;
  btn.textContent = ok ? 'Copied!' : text;
  pixel('ShareWorkshop', { method: 'copy' }, true);
  setTimeout(() => { btn.textContent = label; }, 2200);
}));
