# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static study-notes site (plain HTML + CSS + vanilla JS) deployed on GitHub Pages from the `main` branch root. Each note is a self-contained HTML summary prepared for an exam in a specific course ("ramo"). No build step, no package manager, no tests, no linter — what is committed is what gets served. UI text, identifiers and commit messages are in Spanish; keep that convention.

## Running locally

Open `index.html` directly in a browser (`file://` works because notes load through an `<iframe>`, not `fetch`), or serve it:

```bash
python -m http.server
```

## Architecture

- `js/ramos.js` — the `RAMOS` array (`{ id, codigo, nombre, apuntes: [{ nombre, ruta }] }`), the single source of truth for courses and notes. It must load before `script.js`.
- `js/script.js` — builds the sidebar `<li>`s (`#lista-ramos`) and home cards (`#grid-ramos`) from `RAMOS`, then binds clicks on every `[data-ramo]` element to `cargarRamo(id)`, which creates one button per note and auto-loads the first into `<iframe id="visor-html">`.
- `index.html` — shell with two views (`#home-view`, `#apuntes-view`) toggled by the `.active` class on `.view-section`; the lists are empty containers filled by JS.
- `css/style.css` — shell styles only; it does not style the notes.
- `apuntes/<ramo>/*.html` — fully self-contained note documents (own `<head>`, inline CSS, MathJax from CDN, theme toggle, scroll-spy nav, inline SVG diagrams). They are generated externally and rendered isolated in the iframe; treat them as content, not site code. Their similar inline CSS/JS is intentional so each file also works when opened on its own.

Adding a course or note = drop the HTML into `apuntes/<ramo>/` (lowercase-kebab filename) and add/extend its entry in `js/ramos.js`. `ruta` is relative to `index.html`.

Notes are generated outside this repo and may contain relative links to files that don't exist here (e.g. `../Certamenes .../*.pdf`); check for and fix those when adding a note.
