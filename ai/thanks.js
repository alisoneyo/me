/* Alison Eyo · AI workshop · "You're in" card
   After someone signs up, the pop-up closes and this card replaces the closing section's
   heading, copy and button (as on /job). main.js calls window.showThanks({ name, email }). */

const THANKS = {
  title: 'How to Use AI to Work Smarter & Get More Done (with Alison Eyo)',
  start: '20261205T200000Z', // Sat 5 Dec, 8pm UK
  end: '20261205T210000Z',
  shareText: 'I’m joining Alison Eyo’s free workshop on using AI to work smarter & get more done. Sat 5 Dec, 8pm UK. Come with me:'
};

(() => {
  const pageUrl = (document.querySelector('link[rel="canonical"]') || {}).href || (location.origin + location.pathname);
  const details = `Free live workshop with Alison Eyo, streamed on YouTube. The link will be emailed to you before we go live.\n\nWorkshop page: ${pageUrl}`;
  const googleUrl = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE', text: THANKS.title, dates: `${THANKS.start}/${THANKS.end}`, details, location: 'YouTube Live'
  });
  const icsUrl = '/ai/assets/ai-workshop.ics';

  const calIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const linkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13.5a4.5 4.5 0 0 0 6.4.4l2.9-2.9a4.5 4.5 0 0 0-6.4-6.4l-1.6 1.6M14 10.5a4.5 4.5 0 0 0-6.4-.4l-2.9 2.9a4.5 4.5 0 0 0 6.4 6.4l1.6-1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  const template = `
    <h2 class="ty-title"></h2>
    <p class="ty-sub"></p>
    <p class="live live-dark final-when"><span class="live-label"><span class="eyebrow-dot eyebrow-dot-green"></span>Sat, 5 Dec</span><span class="live-sep">/</span><span>8pm UK</span></p>
    <div class="ty-actions">
      <div class="ty-cal">
        <button class="ty-pill ty-cal-toggle" type="button" aria-expanded="false" aria-controls="ty-cal-options">Add to calendar<span class="ty-pill-icon">${calIcon}</span></button>
        <div class="ty-cal-options" id="ty-cal-options" hidden>
          <a href="${googleUrl}" target="_blank" rel="noopener" data-cal="google">Google</a>
          <a href="${icsUrl}" download="ai-workshop.ics" data-cal="ics">Apple / Outlook</a>
        </div>
      </div>
      <button class="ty-pill ty-share" type="button"><span class="ty-share-label">Share</span><span class="ty-pill-icon">${linkIcon}</span></button>
      <div class="ty-note" aria-hidden="true">
        <svg class="ty-arrow ty-arrow--wide" viewBox="0 0 120 120"><g fill="none" stroke="#FF3D82" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path class="ty-draw" pathLength="1" d="M88 6 C 84 44, 62 82, 14 104"/><path class="ty-draw ty-draw-head" pathLength="1" d="M34 100 L 14 104 L 24 86"/></g></svg>
        <svg class="ty-arrow ty-arrow--narrow" viewBox="0 0 70 56"><g fill="none" stroke="#FF3D82" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path class="ty-draw" pathLength="1" d="M48 52 C 52 34, 42 16, 20 8"/><path class="ty-draw ty-draw-head" pathLength="1" d="M33 4 L 20 8 L 28 19"/></g></svg>
        <p>send to someone who needs this</p>
      </div>
    </div>`;

  const pixel = (event, params) => { try { if (window.fbq) window.fbq('trackCustom', event, params); } catch (e) { /* ignore */ } };

  // Shows the "You're in" card in the closing section. Name and email are optional.
  window.showThanks = ({ name, email } = {}) => {
    const main = document.querySelector('.final-main');
    if (!main) return null;
    const existing = main.querySelector('.ty');
    if (existing) return existing;
    const firstName = String(name || '').trim().split(/\s+/)[0].slice(0, 40);
    const first = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : '';
    const mail = String(email || '').trim().slice(0, 120);

    const ty = document.createElement('div');
    ty.className = 'ty';
    ty.setAttribute('role', 'status');
    ty.innerHTML = template;

    // Visitor-supplied values go in as text, never as HTML.
    const title = ty.querySelector('.ty-title');
    if (first) {
      title.append('You’re in, ');
      const pink = document.createElement('span');
      pink.textContent = `${first}!`;
      title.append(pink);
    } else {
      title.textContent = 'You’re in!';
    }
    const sub = ty.querySelector('.ty-sub');
    sub.append('Your seat is saved. I’ll email the YouTube link to ');
    const strong = document.createElement('span');
    strong.className = 'ty-email';
    strong.textContent = mail || 'your inbox';
    sub.append(strong, ' before we go live.');

    // The closing heading, copy, date and button make way for the card
    [...main.children].forEach(el => { el.hidden = true; });
    main.append(ty);

    // Add to calendar: the pill splits in place into Google | Apple / Outlook
    const toggle = ty.querySelector('.ty-cal-toggle');
    const options = ty.querySelector('.ty-cal-options');
    toggle.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.hidden = true;
      options.hidden = false;
      options.querySelector('a').focus();
    });
    options.querySelectorAll('a').forEach(a => a.addEventListener('click', () => pixel('AddToCalendar', { type: a.dataset.cal })));

    // Share: native share sheet where available, otherwise copy the link
    const share = ty.querySelector('.ty-share');
    const label = share.querySelector('.ty-share-label');
    const copyLink = async () => {
      try { await navigator.clipboard.writeText(pageUrl); }
      catch (e) { window.prompt('Copy this link:', pageUrl); return; }
      label.textContent = 'Link copied ✓';
      setTimeout(() => { label.textContent = 'Share'; }, 2200);
    };
    share.addEventListener('click', async () => {
      pixel('ShareWorkshop', {});
      if (navigator.share) {
        try { await navigator.share({ title: THANKS.title, text: THANKS.shareText, url: pageUrl }); }
        catch (e) { if (e.name !== 'AbortError') copyLink(); }
      } else {
        copyLink();
      }
    });

    return ty;
  };
})();
