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
  whatsappUrl: 'https://chat.whatsapp.com/BPB5DWGuPIzATY4nW34n9Y'
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
  const waIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';

  const template = `
    <h3 class="ty-title"></h3>
    <p class="ty-sub"></p>
    <div class="ty-actions">
      <a class="ty-pill ty-wa" href="${THANKS.whatsappUrl}" target="_blank" rel="noopener"><span>Get a WhatsApp reminder: <span class="ty-keep">join my channel</span></span><span class="ty-pill-icon">${waIcon}</span></a>
      <a class="ty-pill ty-cal" href="#" rel="noopener">Add to calendar<span class="ty-pill-icon">${calIcon}</span></a>
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
    // Break at phrases: keep "your joining link" and "a little note from me." whole.
    const span = (cls, text) => { const el = document.createElement('span'); el.className = cls; el.textContent = text; return el; };
    sub.append('Check your inbox. I’ve sent ', span('ty-keep', 'your joining link'), ' to ',
      span(mail ? 'ty-email' : 'ty-email ty-keep', mail || 'your inbox'), ', along with ', span('ty-keep', 'a little note from me.'));

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
    const pixel = (event, params) => { try { if (window.fbq) window.fbq('trackCustom', event, params); } catch (e) {} };
    cal.addEventListener('click', () => pixel('AddToCalendar', { calendar: target }));
    ty.querySelector('.ty-wa').addEventListener('click', () => pixel('WhatsAppJoin', {}));


    return ty;
  };
})();
