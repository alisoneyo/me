/* Alison Eyo · "You're in" card
   Replaces the Serlzo form in the register panel once someone has registered.
   The date and time above it stay as they are. */

const THANKS = {
  start: new Date(Date.UTC(2026, 9, 24, 19, 0)), // Sat 24 Oct 2026, 8pm UK (BST)
  durationMin: 60,                               // 1-hour YouTube Live
  pageUrl: 'https://www.thealisoneyo.com/job/',
  shareText: 'I’m joining Alison Eyo’s free live webinar on landing a better paying role in a new industry. Join me:'
};

window.mountThanks = root => {
  const end = THANKS.start.getTime() + THANKS.durationMin * 60000;
  const share = encodeURIComponent(THANKS.pageUrl);
  const shareMsg = encodeURIComponent(`${THANKS.shareText} ${THANKS.pageUrl}`);
  const icon = {
    whatsapp: '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" fill="currentColor"/>',
    linkedin: '<path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zM7.1 20.5H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z" fill="currentColor"/>',
    x: '<path d="M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.8 2.3h7l4.8 6.4 5.6-6.4zm-1.2 17.9h1.9L7 4.2H5l12 16z" fill="currentColor"/>',
    link: '<path d="M10 13.5a4.5 4.5 0 0 0 6.4.4l2.9-2.9a4.5 4.5 0 0 0-6.4-6.4l-1.6 1.6M14 10.5a4.5 4.5 0 0 0-6.4-.4l-2.9 2.9a4.5 4.5 0 0 0 6.4 6.4l1.6-1.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  };
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${icon[k]}</svg>`;

  root.innerHTML = `
    <div class="thanks-tag"><span class="thanks-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>You’re in</div>
    <h3 class="thanks-title" tabindex="-1">Your seat is saved. See you there!</h3>
    <p class="thanks-text">It’s a 1-hour live session on YouTube. We’ve emailed you a confirmation with a calendar invite that has the YouTube Live link in it.</p>
    <p class="thanks-small">Can’t find the email? Check your spam or promotions folder.</p>

    <div class="countdown">
      <p class="countdown-label">Starts in</p>
      <div class="countdown-cells">
        <div class="countdown-cell"><span data-cd="d">0</span><small>days</small></div>
        <div class="countdown-cell"><span data-cd="h">00</span><small>hours</small></div>
        <div class="countdown-cell"><span data-cd="m">00</span><small>mins</small></div>
        <div class="countdown-cell"><span data-cd="s">00</span><small>secs</small></div>
      </div>
      <p class="countdown-status" hidden></p>
    </div>

    <div class="thanks-share">
      <p>Know someone who needs this? Spread the word.</p>
      <div class="thanks-share-row">
        <a class="share-btn" href="https://wa.me/?text=${shareMsg}" target="_blank" rel="noopener">${svg('whatsapp')}WhatsApp</a>
        <a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" target="_blank" rel="noopener">${svg('linkedin')}LinkedIn</a>
        <a class="share-btn" href="https://x.com/intent/post?text=${shareMsg}" target="_blank" rel="noopener">${svg('x')}X</a>
        <button class="share-btn" type="button" data-copy>${svg('link')}<span>Copy link</span></button>
      </div>
    </div>`;
  root.classList.add('thanks');

  const copy = root.querySelector('[data-copy]');
  copy.addEventListener('click', async () => {
    const label = copy.querySelector('span');
    try { await navigator.clipboard.writeText(THANKS.pageUrl); label.textContent = 'Link copied'; }
    catch (e) { window.prompt('Copy this link:', THANKS.pageUrl); }
    setTimeout(() => { label.textContent = 'Copy link'; }, 2200);
  });

  const cell = k => root.querySelector(`[data-cd="${k}"]`);
  const cells = { d: cell('d'), h: cell('h'), m: cell('m'), s: cell('s') };
  const label = root.querySelector('.countdown-label');
  const wrap = root.querySelector('.countdown-cells');
  const status = root.querySelector('.countdown-status');
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const now = Date.now();
    const left = THANKS.start.getTime() - now;
    if (left <= 0) {
      label.hidden = true; wrap.hidden = true; status.hidden = false;
      status.textContent = now < end ? 'We’re live on YouTube now. Open the link in your email to join.' : 'This webinar has ended. Thank you for joining!';
      return false;
    }
    const s = Math.floor(left / 1000);
    cells.d.textContent = Math.floor(s / 86400);
    cells.h.textContent = pad(Math.floor(s / 3600) % 24);
    cells.m.textContent = pad(Math.floor(s / 60) % 60);
    cells.s.textContent = pad(s % 60);
    return true;
  };
  if (tick()) { const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000); }
};
