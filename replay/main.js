/* Alison Eyo · Webinar replay page */

const CONFIG = {
  // Paste the YouTube link here when the replay is ready. Until then the placeholder shows.
  videoUrl: '',
  checkoutUrl: 'https://thealisoneyo.com/os',
  launchSpots: 50,
  // Last known number of launch spots sold. Shown if the live count can't be fetched.
  claimed: 20,
  // Endpoint returning JSON like { "claimed": 23 }. Leave empty to use `claimed` above.
  countUrl: '',
  // One currency per visitor, picked from their time zone. Prices are shown as written here.
  prices: {
    GBP: { now: '£19', was: '£39' },
    USD: { now: '$25', was: '$49' },
    NGN: { now: '₦30K', was: '₦60K' }
  }
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const setText = (sel, text) => $$(sel).forEach(el => { el.textContent = text; });
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = 'cubic-bezier(.2,.8,.2,1)';
// Meta Pixel events. Does nothing if the pixel is blocked, e.g. by an ad blocker.
const pixel = (event, params = {}) => {
  try { if (window.fbq) window.fbq('trackCustom', event, params); } catch (e) {}
};

/* ---------- Price and launch spots ---------- */

function currency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Africa/Lagos') return 'NGN';
    if (tz.startsWith('Europe/')) return 'GBP';
  } catch (e) {}
  return 'USD';
}

function initOffer() {
  const price = CONFIG.prices[currency()] || CONFIG.prices.GBP;
  const total = Math.max(1, CONFIG.launchSpots);
  const ticks = $('[data-ticks]');
  ticks.style.setProperty('--spots', total);
  ticks.replaceChildren(...Array.from({ length: total }, () => document.createElement('span')));

  const render = claimedCount => {
    const claimed = Math.max(0, Math.min(total, claimedCount));
    const left = total - claimed;
    const soldOut = left <= 0;
    document.documentElement.classList.toggle('is-sold-out', soldOut);
    setText('[data-price]', soldOut ? price.was : price.now);
    setText('[data-was]', price.was);
    setText('[data-spots-headline]', soldOut ? 'Launch price has ended' : `Launch price for the first ${total} people`);
    setText('[data-bar-long]', soldOut ? 'Launch spots are gone. Full price now.' : `Launch price for the first ${total} people · ${left} spots left`);
    setText('[data-bar-short]', soldOut ? 'Launch spots are gone. Full price now.' : `${left} of ${total} launch spots left`);
    $$('span', ticks).forEach((t, i) => t.classList.toggle('is-claimed', i < claimed));
    $('[data-progress]').style.width = (claimed / total * 100) + '%';
  };

  let lastKnown = CONFIG.claimed;
  render(lastKnown);

  const url = (CONFIG.countUrl || '').trim();
  if (url) {
    // On failure, keep showing the last known number. Never a made-up one.
    const pull = () => fetch(url, { cache: 'no-store' })
      .then(r => r.json())
      .then(j => {
        const n = +(j.claimed ?? j.count ?? j.sold);
        if (Number.isFinite(n) && n !== lastKnown) { lastKnown = n; render(n); }
      })
      .catch(() => {});
    pull();
    setInterval(pull, 30000);
  }
}

/* ---------- Checkout links ---------- */

function initCheckout() {
  $$('[data-checkout]').forEach(a => {
    a.href = CONFIG.checkoutUrl;
    a.addEventListener('click', () => pixel('CheckoutClick', { location: a.dataset.checkout }));
  });
}

/* ---------- Replay video ---------- */

function youtubeId(url) {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/live\/|\/shorts\/)([\w-]{11})/);
  return m ? m[1] : '';
}

function initVideo() {
  const id = youtubeId((CONFIG.videoUrl || '').trim());
  if (!id) return;
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
  frame.title = 'Webinar replay';
  frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  frame.allowFullscreen = true;
  $('.video-placeholder').replaceWith(frame);
}

/* ---------- Floating offer bar ---------- */

function initBar() {
  const bar = $('.offer-bar');
  const cta = $('.offer-bar-cta');
  let shown = false;
  const update = () => {
    const s = window.scrollY > Math.min(520, window.innerHeight * .6);
    if (s === shown) return;
    shown = s;
    bar.classList.toggle('is-shown', s);
    bar.setAttribute('aria-hidden', s ? 'false' : 'true');
    cta.tabIndex = s ? 0 : -1;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- Logo stroke and scroll reveal ---------- */

function initMotion() {
  $$('[data-draw]').forEach(p => {
    const L = p.getTotalLength();
    p.style.strokeDasharray = L;
    p.style.strokeDashoffset = reduceMotion ? 0 : L;
    if (reduceMotion) return;
    setTimeout(() => {
      p.style.transition = `stroke-dashoffset ${+p.dataset.dur || 900}ms ${ease}`;
      p.style.strokeDashoffset = 0;
    }, +p.dataset.delay || 0);
  });

  const els = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }
  const show = (el, d = 0) => {
    io.unobserve(el);
    el.style.transition = `opacity 1s ${ease} ${d}ms, transform 1.1s ${ease} ${d}ms`;
    el.classList.add('is-in');
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) show(e.target, +e.target.dataset.delay || 0);
  }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  els.forEach(el => io.observe(el));
  const hidden = () => els.filter(el => !el.classList.contains('is-in'));
  // Anything already on screen reveals straight away
  requestAnimationFrame(() => hidden().forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) show(el, +el.dataset.delay || 0);
  }));
  window.addEventListener('scroll', () => hidden().forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) show(el);
  }), { passive: true });
  // Safety net if the observer is slow to fire
  setTimeout(() => hidden().forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 1.5) show(el);
  }), 1200);
}

/* ---------- Hero background ---------- */

function initHeroBackground() {
  const canvas = $('.hero-canvas');
  const A = $('.blinds-a'), B = $('.blinds-b');
  const mouse = { x: .75, y: .3, tx: .75, ty: .3 };
  window.addEventListener('pointermove', e => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = e.clientY / window.innerHeight;
  }, { passive: true });
  const isMobile = () => window.innerWidth < 640;
  const pal = [[250, 248, 243], [238, 233, 225], [214, 206, 194], [150, 140, 128], [228, 222, 212]];
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const bias = (u, v) => isMobile() ? .8 - ((u - 1.15) ** 2 * 2.4 + (v - .1) ** 2 * 3.2) : .95 - ((u - .8) ** 2 * 2.4 + (v - .3) ** 2 * 3.2);
  const draw = t => {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = x / (W - 1), v = y / (H - 1);
      const dx = u - mouse.x, dy = (v - mouse.y) * .7;
      const hot = Math.exp(-(dx * dx + dy * dy) * 9);
      let w = bias(u, v) + .22 * Math.sin(u * 5 + t * .6) * Math.cos(v * 4 - t * .45) + hot * .35;
      w = Math.max(0, Math.min(1, w));
      let c = w < .33 ? mix(pal[0], pal[1], w / .33) : w < .66 ? mix(pal[1], pal[2], (w - .33) / .33) : mix(pal[2], pal[3], (w - .66) / .34);
      c = mix(c, pal[4], .18 * Math.max(0, Math.sin(v * 3 + t * .3)));
      const chk = ((x + y) & 1) ? 1 : .8;
      ctx.fillStyle = `rgb(${c[0] * chk | 0},${c[1] * chk | 0},${c[2] * chk | 0})`;
      ctx.fillRect(x, y, 1, 1);
    }
  };
  let last = 0;
  const loop = ts => {
    if (ts - last > 33) {
      last = ts;
      mouse.x += (mouse.tx - mouse.x) * .06;
      mouse.y += (mouse.ty - mouse.y) * .06;
      const t = ts / 1000;
      draw(t);
      const g = Math.sin(t * 1.1) * .6 + Math.sin(t * 2.6 + 1) * .25 + Math.sin(t * .37 + 2) * .5;
      const f = Math.sin(t * 4.2) * .18 + Math.sin(t * 7.1 + .5) * .09;
      A.style.transform = `rotate(${-9 + g * 3}deg) translateY(${g * 36 + f * 10}px) skewX(${g * 10 + f * 6}deg) scaleY(${1 + (g + f) * .09})`;
      A.style.opacity = .7 + g * .25 + f * .4;
      B.style.transform = `rotate(${-9 + g * 4}deg) translateY(${-g * 24 + f * 22}px) skewX(${g * 13}deg) scaleY(${1 - g * .06})`;
      B.style.opacity = .65 - g * .3;
    }
    if (!reduceMotion) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

initOffer();
initCheckout();
initVideo();
initBar();
initMotion();
initHeroBackground();
