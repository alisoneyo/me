# Alison Eyo · Webinar replay page

Live at **https://www.thealisoneyo.com/replay/**. The replay of *Land a high paying role in a new industry*, selling My Career OS.

Plain HTML, CSS and vanilla JS with no build step, served at `/replay/`. Fonts (Geist, Caveat), the favicon and the social preview image are shared with `/job/`. The TOP SECRET stamp loads only its letters of Alfa Slab One from Google Fonts.

- `index.html`: markup and meta tags
- `styles.css`: styles (mobile < 640px; the Career OS section stacks below 960px)
- `main.js`: settings, pricing, launch spots, video, the sticky button on mobile, reveals and the hero background
- `assets/`: QR code to thealisoneyo.com/os and the small avatar

## Settings (`CONFIG` at the top of `main.js`)

- **videoUrl:** paste the YouTube link and the placeholder is replaced by the player.
- **checkoutUrl:** every buy button, the QR frame and the link pill go here (`https://thealisoneyo.com/os`).
- **launchSpots / claimed:** launch spots and the last known number sold. Update `claimed` as sales come in.
- **countUrl:** optional endpoint returning `{ "claimed": 23 }`. Polled every 30s; on failure the page keeps the last known number.
- **prices:** one currency per visitor from their time zone: `Africa/Lagos` → NGN, `Europe/*` → GBP, anywhere else → USD. When all spots are claimed the page shows the full price only.

## Analytics

Vercel Web Analytics and the Meta Pixel (`PageView`, plus custom `CheckoutClick` with `location`: hero / offer / qr / link / sticky).
