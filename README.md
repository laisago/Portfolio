# Isabela Gómez Núñez · Bilingual Portfolio

Complete Spanish/English static website. No build step is required.

## GitHub Pages

Extract this ZIP and copy its contents to the repository root. Replace existing files and include all three JavaScript files (`translations.js`, `language.js`, `app.js`). Keep `.nojekyll`. Publish from Settings → Pages → Deploy from a branch → main → /(root).

## Languages

The top-menu Español / English buttons translate all page text and accessibility labels without reloading. Spanish is the default; the selected language is remembered on the visitor’s device. Original project images, the YouTube video and linked PDF downloads remain in their source language.

- `index.html`: Spanish content and page structure.
- `translations.js`: English translations.
- `language.js`: switching, saved preference, page language and accessibility updates.
- `app.js`: navigation, motion, counters and interactions.
- `platform.css`: final shared styling and responsive language controls.
- `assets/`: local imagery, icons and fonts.

Preview locally with `python -m http.server 8000` (or `py -m http.server 8000` on Windows), then open http://localhost:8000.

The mobile language switch uses compact ES/EN buttons beside Contact. The Lujos typography and colour-palette image switches between the Spanish original and the English localisation.

`mobile-menu.js` controls the animated mobile dropdown. Include this file when updating GitHub. Desktop navigation remains visible.
