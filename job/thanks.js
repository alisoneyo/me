/* Alison Eyo · "You're in" state
   Replaces the Serlzo form in the register panel after someone registers.
   The label, date heading, London-time note and footer stay as they are.
   main.js calls window.showThanks() on Serlzo's submit message, or on load with
   ?registered=1&name=…&email=… (Serlzo redirect). */

const THANKS = {
  title: 'Webinar: Land a high paying role in a new industry (with Alison Eyo)',
  start: '20261024T190000Z',
  end: '20261024T200000Z',
  liveUrl: 'https://youtube.com/live/tn0ukvNtW6Q',
  shareText: 'I’m joining Alison Eyo’s free webinar on landing a high paying role in a new industry. Sat 24 Oct, 8pm UK. Come with me:'
};

(() => {
  const pageUrl = (document.querySelector('link[rel="canonical"]') || {}).href || (location.origin + location.pathname);
  const details = `Join on YouTube Live: ${THANKS.liveUrl}\n\nWebinar page: ${pageUrl}`;
  const googleUrl = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE', text: THANKS.title, dates: `${THANKS.start}/${THANKS.end}`, details, location: THANKS.liveUrl
  });
  const icsEscape = s => s.replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Alison Eyo//Webinar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:webinar-20261024@thealisoneyo.com',
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${THANKS.start}`, `DTEND:${THANKS.end}`,
    `SUMMARY:${icsEscape(THANKS.title)}`,
    `DESCRIPTION:${icsEscape(details)}`,
    `LOCATION:${icsEscape(THANKS.liveUrl)}`, `URL:${THANKS.liveUrl}`,
    'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Webinar starts in 30 minutes', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const icsUrl = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);

  const calIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const linkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13.5a4.5 4.5 0 0 0 6.4.4l2.9-2.9a4.5 4.5 0 0 0-6.4-6.4l-1.6 1.6M14 10.5a4.5 4.5 0 0 0-6.4-.4l-2.9 2.9a4.5 4.5 0 0 0 6.4 6.4l1.6-1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  const template = `
    <h3 class="ty-title"></h3>
    <p class="ty-sub"></p>
    <div class="ty-actions">
      <a class="ty-pill ty-cal" href="#" rel="noopener">Add to calendar<span class="ty-pill-icon">${calIcon}</span></a>
      <button class="ty-pill ty-share" type="button"><span class="ty-share-label">Share</span><span class="ty-pill-icon">${linkIcon}</span></button>
      <div class="ty-note" aria-hidden="true">
        <svg class="ty-arrow ty-arrow--wide" viewBox="0 0 120 120"><g fill="none" stroke="#FF3D82" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path class="ty-draw" pathLength="1" d="M88 6 C 84 44, 62 82, 14 104"/><path class="ty-draw ty-draw-head" pathLength="1" d="M34 100 L 14 104 L 24 86"/></g></svg>
        <svg class="ty-arrow ty-arrow--narrow" viewBox="0 0 70 56"><g fill="none" stroke="#FF3D82" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path class="ty-draw" pathLength="1" d="M48 52 C 52 34, 42 16, 20 8"/><path class="ty-draw ty-draw-head" pathLength="1" d="M33 4 L 20 8 L 28 19"/></g></svg>
        <p>send to someone who needs this</p>
      </div>
    </div>`;

  // Shows the "You're in" state in place of the Serlzo form. Name and email are optional.
  window.showThanks = ({ name, email } = {}) => {
    const form = document.querySelector('.signup-embed');
    if (!form || document.querySelector('.ty')) return;
    const firstName = String(name || '').trim().split(/\s+/)[0].slice(0, 40);
    const mail = String(email || '').trim().slice(0, 120);

    const ty = document.createElement('div');
    ty.className = 'ty';
    ty.setAttribute('role', 'status');
    ty.innerHTML = template;

    // Visitor-supplied values go in as text, never as HTML.
    const title = ty.querySelector('.ty-title');
    if (firstName) {
      title.append('You’re in, ');
      const pink = document.createElement('span');
      pink.textContent = `${firstName}!`;
      title.append(pink);
    } else {
      title.textContent = 'You’re in!';
    }
    const sub = ty.querySelector('.ty-sub');
    sub.append('Your joining link has been sent to ');
    const strong = document.createElement('span');
    strong.className = 'ty-email';
    strong.textContent = mail || 'your inbox';
    sub.append(strong, '.');

    form.hidden = true;
    form.replaceChildren(); // drop the Serlzo iframe
    form.before(ty);

    // Add to calendar: Apple devices get the .ics file (opens in Apple Calendar), everyone else Google Calendar.
    const cal = ty.querySelector('.ty-cal');
    if (/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
      cal.href = icsUrl;
      cal.setAttribute('download', 'alison-eyo-webinar.ics');
    } else {
      cal.href = googleUrl;
      cal.target = '_blank';
    }

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
