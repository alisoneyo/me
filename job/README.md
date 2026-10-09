# Alison Eyo · Webinar landing page

Live at **https://www.thealisoneyo.com/job/**. This is the landing page for the free live webinar *Land a high paying role in a new industry* (Sat 24 Oct 2026, 8pm UK).

Plain HTML, CSS and vanilla JS with no build step. The site root must be the repository root, so this folder is served at `/job/`. All asset paths are absolute (`/job/...`), so both `/job` and `/job/` work.

- `index.html`: markup, SEO meta tags and Event/Person structured data
- `styles.css`: styles (mobile < 640px, tablet 640–1099px, desktop ≥ 1100px)
- `main.js`: local event time, scroll reveal, animated backgrounds, application-kit scaling, about gallery, lazy video and form loading
- `assets/`: WebP photos at three sizes (`-thumb`, `-600`, `-lg`) with JPEG fallbacks, icons, and the social preview image
- `fonts/`: Geist (latin, variable weight) and Caveat Bold (latin subset, for the handwritten note), served from the site itself
- `/robots.txt` and `/sitemap.xml` live at the repository root

## Settings

- **Video:** the intro video (a YouTube Short, set in `CONFIG.videoUrl` at the top of `main.js`) sits in a phone frame under the quote, with its cover image in `assets/video-cover-*`. It starts muted when the phone is mostly on screen, pauses when scrolled away, and starts with sound if someone presses play first. With reduced motion, data saver or 2G it waits for a press. The handwritten note ("give me 76s to tell you how") is in `index.html`.
- **Registration form:** the Serlzo embed in the `#register` section (`data-serlzo-form="f9dd63874dc27eadd3"`). Its script URL is `SERLZO_EMBED` in `main.js`, and it loads as the visitor scrolls near the form. Edit fields and the confirmation message in Serlzo.

## Built for slow connections

- The first screen loads in 4 requests and about 80KB, all from this site.
- Photos are WebP and sized to where they appear. Below-the-fold images lazy-load.
- The font is a 29KB variable file served from this site and preloaded. A size-matched fallback stops the text jumping when it arrives.
- The YouTube player and the Serlzo form load only when needed.
- With data saver on or on 2G, the backgrounds are drawn once instead of animated.
