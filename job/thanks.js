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
  const isoTime = t => t.replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/, '$1-$2-$3T$4:$5:$6Z');
  const outlookUrl = 'https://outlook.live.com/calendar/0/deeplink/compose?' + new URLSearchParams({
    path: '/calendar/action/compose', rru: 'addevent', subject: THANKS.title,
    startdt: isoTime(THANKS.start), enddt: isoTime(THANKS.end), body: details, location: THANKS.liveUrl
  });
  const yahooUrl = 'https://calendar.yahoo.com/?' + new URLSearchParams({
    v: 60, title: THANKS.title, st: THANKS.start, et: THANKS.end, desc: details, in_loc: THANKS.liveUrl
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
    // Break at phrases: keep "with your joining link" and "a little note from me." whole,
    // and give "Keep an eye out for it." its own line.
    const span = (cls, text) => { const el = document.createElement('span'); el.className = cls; el.textContent = text; return el; };
    sub.append('I just sent an email to ', span(mail ? 'ty-email' : 'ty-email ty-keep', mail || 'your inbox'), ' ',
      span('ty-keep', 'with your joining link'), ' and ', span('ty-keep', 'a little note from me.'),
      span('ty-sub-last', 'Keep an eye out for it.'));

    form.hidden = true;
    form.replaceChildren(); // drop the Serlzo iframe
    form.before(ty);

    // Add to calendar: pick the calendar from the email's provider when we know it,
    // otherwise from the device (Apple devices → Apple Calendar, everyone else → Google).
    const cal = ty.querySelector('.ty-cal');
    const domain = (mail.split('@')[1] || '').toLowerCase();
    const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
    let target;
    if (/^(gmail|googlemail)\.com$/.test(domain)) target = 'google';
    else if (/^(outlook|hotmail|live|msn)\./.test(domain)) target = 'outlook';
    else if (/^(icloud|me|mac)\.com$/.test(domain)) target = 'apple';
    else if (/^(yahoo|ymail|rocketmail)\./.test(domain)) target = 'yahoo';
    else target = isApple ? 'apple' : 'google';

    if (target === 'apple') {
      cal.href = icsUrl;
      cal.setAttribute('download', 'alison-eyo-webinar.ics');
    } else {
      // For Gmail, open the event in the Google account they registered with.
      cal.href = target === 'outlook' ? outlookUrl
        : target === 'yahoo' ? yahooUrl
        : googleUrl + (/^(gmail|googlemail)\.com$/.test(domain) ? '&' + new URLSearchParams({ authuser: mail }) : '');
      cal.target = '_blank';
    }
    cal.dataset.calendar = target;

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
