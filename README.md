# Alison Eyo · Webinar landing page

Single-page landing site for the free live webinar *Land a high paying role in a new industry* (Sat 24 Oct 2026, 8pm UK).

Plain HTML, CSS and vanilla JS with no build step. Open `index.html` or serve the folder with any static host.

- `index.html`: markup
- `styles.css`: styles (mobile < 640px, tablet 640–1099px, desktop ≥ 1100px)
- `main.js`: local event time, scroll reveal, animated hero and register backgrounds, application-kit scaling, about gallery
- `assets/`: photos (resized for web) and the signature logo

## Settings

- **Video:** set `CONFIG.videoUrl` at the top of `main.js` to a YouTube link. While it's empty, the page shows the play-button placeholder.
- **Registration form:** the Serlzo embed in the `#register` section of `index.html` (`data-serlzo-form="f9dd63874dc27eadd3"`). Edit the form's fields and confirmation message in Serlzo.
