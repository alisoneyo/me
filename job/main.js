/* Alison Eyo · Webinar landing page */

const CONFIG = {
  // Paste a YouTube link (watch, youtu.be, shorts or embed URL) to replace
  // the placeholder with the video.
  videoUrl: ''
};

const EVENT_START = new Date(Date.UTC(2026, 9, 24, 19, 0)); // 8pm BST
const LONDON = 'Europe/London';

const SERLZO_EMBED = 'https://xxx-v3.serlzo.com/forms/embed.js';

// w = width of the -lg file, used for the responsive srcset
const GALLERY = {
  undergrad: { file: 'era-undergrad',  w: 900,  pos: '50% 0%',  alt: 'Alison as a biochemistry undergraduate', caption: 'B.Sc Biochemistry' },
  ioc:       { file: 'era-oilgas',     w: 1040, pos: '6% 50%',  alt: 'Alison during her oil and gas internship', caption: 'Product chemist intern at an international oil company' },
  fintech:   { file: 'era-fintech',    w: 1040, pos: '50% 55%', alt: 'Alison during her years in fintech', caption: 'Led design for payments at a fintech unicorn for 4 years' },
  ai:        { file: 'era-creativeai', w: 683,  pos: '52% 35%', alt: 'Alison in her creative AI era', caption: '' },
  now:       { file: 'alison-eyo',     w: 1013, pos: '50% 30%', alt: 'Alison Eyo today', caption: 'Senior Product Designer at Picsart' }
};
const ASSETS = '/job/assets/';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const conn = navigator.connection || {};
// Data saver or a very slow connection: draw the backgrounds once instead of animating them.
const lowData = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
const mobileQuery = window.matchMedia('(max-width: 639.98px)');
const EASE = 'cubic-bezier(.2,.8,.2,1)';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const setText = (sel, text) => $$(sel).forEach(el => { el.textContent = text; });

/* ---------- Local time ---------- */

function initTimes() {
  let tz = LONDON;
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; } catch (e) {}
  const isUK = tz === LONDON;
  const parts = opts => {
    try {
      return Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, ...opts }).formatToParts(EVENT_START).map(p => [p.type, p.value]));
    } catch (e) { return null; }
  };
  const t = parts({ hour: 'numeric', minute: '2-digit', hour12: true });
  const d = parts({ weekday: 'short', day: 'numeric', month: 'short' });
  if (!t || !d) return; // keep the UK defaults in the markup
  const tzName = (parts({ timeZoneName: 'short' }) || {}).timeZoneName || '';
  const time = t.hour + (t.minute !== '00' ? ':' + t.minute : '') + (t.dayPeriod || '').toLowerCase().replace(/[\s.]/g, '');

  setText('[data-nav-date]', `${d.day} ${d.month}`);
  setText('[data-nav-time]', isUK ? `${time} UK` : `${time} ${tzName}`);
  setText('[data-big-date]', `${d.weekday} ${d.day} ${d.month}`);
  setText('[data-big-time]', isUK ? `${time} UK` : time);

  const note = $('[data-london-note]');
  if (note && !isUK) {
    note.textContent = `Your local time (${tzName}). That’s 8pm in London.`;
    note.hidden = false;
  }
}

/* ---------- Video ---------- */

// The YouTube player (~1MB) only loads when someone presses play.
function initVideo() {
  const url = (CONFIG.videoUrl || '').trim();
  if (!url) return;
  const id = (url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/) || [])[1];
  const src = id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&autoplay=1` : url;
  const box = $('.video');
  const play = $('.video-play', box);
  play.disabled = false;
  play.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = 'A word from Alison';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    box.replaceChildren(iframe);
  }, { once: true });
}

/* ---------- Registration form (Serlzo) ---------- */

// Load the form embed only as the visitor gets near the register section.
function initSignup() {
  const target = $('.signup-embed');
  if (!target) return;
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    const script = document.createElement('script');
    script.src = SERLZO_EMBED;
    script.async = true;
    document.body.appendChild(script);
  };
  if (!('IntersectionObserver' in window)) return load();
  const io = new IntersectionObserver(es => {
    if (es.some(e => e.isIntersecting)) { io.disconnect(); load(); }
  }, { rootMargin: '1200px 0px' });
  io.observe(target);
  // Anchor links to #register jump straight there; start loading at once.
  $$('a[href="#register"]').forEach(a => a.addEventListener('click', load, { once: true }));
}

/* ---------- Sticky CTA (mobile) ---------- */

// Pin the button to the bottom of the screen once the hero button has scrolled away,
// and take it down as soon as the register section comes into view.
function initStickyCta() {
  const bar = $('.sticky-cta');
  const link = $('a', bar);
  const heroCta = $('.hero-copy .btn-dark');
  const register = $('#register');
  if (!bar || !heroCta || !register || !('IntersectionObserver' in window)) return;
  const seen = new Map([[heroCta, true], [register, false]]);
  const update = () => {
    const show = mobileQuery.matches && !seen.get(heroCta) && !seen.get(register)
      && heroCta.getBoundingClientRect().bottom < 0; // only after scrolling past it, not before
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', String(!show));
    link.tabIndex = show ? 0 : -1;
  };
  const io = new IntersectionObserver(es => { es.forEach(e => seen.set(e.target, e.isIntersecting)); update(); });
  io.observe(heroCta);
  io.observe(register);
  mobileQuery.addEventListener('change', update);
}

/* ---------- Scroll reveal ---------- */

function initReveal() {
  const els = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }
  const show = (el, transition) => {
    el.style.transition = transition;
    el.classList.add('is-in');
  };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const d = +e.target.dataset.delay || 0;
    show(e.target, `opacity .8s ${EASE} ${d}ms, transform .9s ${EASE} ${d}ms`);
  }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  els.forEach(el => io.observe(el));

  // Anything scrolled past too quickly for the observer (e.g. an anchor jump) still appears.
  const onScroll = () => {
    let pending = 0;
    els.forEach(el => {
      if (el.classList.contains('is-in')) return;
      if (el.getBoundingClientRect().top < window.innerHeight) { io.unobserve(el); show(el, `opacity .8s ${EASE}, transform .9s ${EASE}`); }
      else pending++;
    });
    if (!pending) window.removeEventListener('scroll', onScroll);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Hero + register backgrounds ---------- */

function initBackgrounds() {
  const heroCanvas = $('.hero-canvas');
  const ctaCanvas = $('.cta-canvas');
  const blindsA = $('.blinds-a');
  const blindsB = $('.blinds-b');

  const heroPal = [[250, 248, 243], [238, 233, 225], [214, 206, 194], [150, 140, 128], [228, 222, 212]];
  const ctaPal = [[20, 16, 18], [44, 40, 38], [84, 78, 72], [150, 140, 128], [60, 56, 52]];
  const heroBias = (u, v) => mobileQuery.matches
    ? .8 - ((u - 1.15) ** 2 * 2.4 + (v - .15) ** 2 * 3.2)
    : .95 - ((u - .8) ** 2 * 2.4 + (v - .55) ** 2 * 3.2);
  const ctaBias = (u, v) => .95 - ((u - .85) ** 2 * 2.2 + (v - .45) ** 2 * 2.6);

  const mouse = { x: .75, y: .35, tx: .75, ty: .35 };
  window.addEventListener('pointermove', e => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = e.clientY / window.innerHeight;
  }, { passive: true });

  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const draw = (canvas, t, opts) => {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height, pal = opts.pal;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = x / (W - 1), v = y / (H - 1);
      const dx = u - mouse.x, dy = (v - mouse.y) * .7;
      const hot = Math.exp(-(dx * dx + dy * dy) * 9);
      let w = opts.bias(u, v) + .22 * Math.sin(u * 5 + t * .6) * Math.cos(v * 4 - t * .45) + hot * .35;
      w = Math.max(0, Math.min(1, w));
      let c = w < .33 ? mix(pal[0], pal[1], w / .33) : w < .66 ? mix(pal[1], pal[2], (w - .33) / .33) : mix(pal[2], pal[3], (w - .66) / .34);
      c = mix(c, pal[4], .18 * Math.max(0, Math.sin(v * 3 + t * .3)));
      const chk = ((x + y) & 1) ? 1 : opts.chk;
      ctx.fillStyle = `rgb(${c[0] * chk | 0},${c[1] * chk | 0},${c[2] * chk | 0})`;
      ctx.fillRect(x, y, 1, 1);
    }
  };

  // Skip work for whichever section is off screen.
  const visible = new Map([[heroCanvas, true], [ctaCanvas, true]]);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => visible.set(e.target, e.isIntersecting)));
    io.observe(heroCanvas);
    io.observe(ctaCanvas);
  }

  let last = 0;
  const loop = ts => {
    if (ts - last > 33) {
      last = ts;
      mouse.x += (mouse.tx - mouse.x) * .06;
      mouse.y += (mouse.ty - mouse.y) * .06;
      const t = ts / 1000;
      if (visible.get(heroCanvas)) {
        draw(heroCanvas, t, { bias: heroBias, chk: .8, pal: heroPal });
        // Window-blind shadows swaying in the wind
        const g = Math.sin(t * 1.1) * .6 + Math.sin(t * 2.6 + 1) * .25 + Math.sin(t * .37 + 2) * .5;
        const f = Math.sin(t * 4.2) * .18 + Math.sin(t * 7.1 + .5) * .09;
        blindsA.style.transform = `rotate(${-9 + g * 3}deg) translateY(${g * 36 + f * 10}px) skewX(${g * 10 + f * 6}deg) scaleY(${1 + (g + f) * .09})`;
        blindsA.style.opacity = .7 + g * .25 + f * .4;
        blindsB.style.transform = `rotate(${-9 + g * 4}deg) translateY(${-g * 24 + f * 22}px) skewX(${g * 13}deg) scaleY(${1 - g * .06})`;
        blindsB.style.opacity = .65 - g * .3;
      }
      if (visible.get(ctaCanvas)) draw(ctaCanvas, t * .8, { bias: ctaBias, chk: .72, pal: ctaPal });
    }
    if (!reduceMotion && !lowData) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // With motion off, still repaint the static frame if the layout switches between mobile and desktop.
  if (reduceMotion || lowData) mobileQuery.addEventListener('change', () => { last = 0; requestAnimationFrame(loop); });
}

/* ---------- Application kit stage ---------- */

function initKit() {
  const kit = $('.kit');
  const fit = () => kit.style.setProperty('--kit-scale', kit.clientWidth / 1100);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(kit);
  else window.addEventListener('resize', fit, { passive: true });
  fit();
}

/* ---------- About gallery ---------- */

function initGallery() {
  const main = $('.gallery-main');
  const mainImgWrap = $('.gallery-main-img');
  const mainImg = $('img', mainImgWrap);
  const mainSource = $('source', mainImgWrap);
  const tip = $('.gallery-tip');
  const tipText = $('.gallery-tip-text');
  const thumbs = $$('.thumb');
  let active = 'now';
  let hovering = false;

  const apply = key => {
    const g = GALLERY[key];
    if (mainSource) mainSource.srcset = `${ASSETS}${g.file}-600.webp 600w, ${ASSETS}${g.file}-lg.webp ${g.w}w`;
    mainImg.src = `${ASSETS}${g.file}-lg.jpg`;
    mainImg.alt = g.alt;
    mainImg.style.objectPosition = g.pos;
    tipText.textContent = g.caption;
    if (hovering) tip.style.opacity = g.caption ? 1 : 0;
    thumbs.forEach(b => {
      const on = b.dataset.key === key;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
    });
  };

  const pick = key => {
    if (key === active) return;
    active = key;
    if (reduceMotion) return apply(key);
    mainImgWrap.style.opacity = 0;
    mainImgWrap.style.transform = 'scale(1.04)';
    setTimeout(() => {
      apply(key);
      requestAnimationFrame(() => { mainImgWrap.style.opacity = 1; mainImgWrap.style.transform = 'scale(1)'; });
    }, 200);
  };

  thumbs.forEach(b => b.addEventListener('click', () => pick(b.dataset.key)));
  apply(active);

  // Frosted caption that follows the cursor, plus a gentle tilt of the frame.
  let tipT = null, tipP = null, tiltT = { rx: 0, ry: 0 }, tiltK = { rx: 0, ry: 0 }, raf = null;
  const step = () => {
    const p = tipP, t = tipT;
    if (!p || !t) { raf = null; return; }
    p.x += (t.x - p.x) * .14; p.y += (t.y - p.y) * .14; p.s += ((hovering ? 1 : .94) - p.s) * .12;
    tip.style.transform = `translate3d(${p.x}px,${p.y}px,0) scale(${p.s})`;
    const tt = hovering ? tiltT : { rx: 0, ry: 0 };
    tiltK.rx += (tt.rx - tiltK.rx) * .1; tiltK.ry += (tt.ry - tiltK.ry) * .1;
    main.style.transform = `perspective(1200px) rotateX(${tiltK.rx}deg) rotateY(${tiltK.ry}deg) scale(${1 + (p.s - .94) * .15})`;
    const settled = !hovering && Math.abs(tiltK.rx) < .01 && Math.abs(tiltK.ry) < .01 && Math.abs(p.s - .94) < .002;
    if (settled) { raf = null; tipP = null; return; }
    raf = requestAnimationFrame(step);
  };
  const move = e => {
    const r = main.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    tipT = { x: Math.min(Math.max(12, x + 18), r.width - tw - 12), y: Math.min(Math.max(12, y + 22), r.height - th - 12) };
    if (!tipP) tipP = { ...tipT, s: .94 };
    tiltT = { rx: ((y / r.height) - .5) * -3, ry: ((x / r.width) - .5) * 3 };
    if (reduceMotion) { tip.style.transform = `translate3d(${tipT.x}px,${tipT.y}px,0)`; return; }
    if (!raf) raf = requestAnimationFrame(step);
  };

  main.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse') return;
    hovering = true;
    move(e);
    tip.style.opacity = GALLERY[active].caption ? 1 : 0;
  });
  main.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') move(e); });
  main.addEventListener('pointerleave', () => {
    hovering = false;
    tip.style.opacity = 0;
  });
}

initTimes();
initVideo();
initSignup();
initStickyCta();
initReveal();
initBackgrounds();
initKit();
initGallery();
