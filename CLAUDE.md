# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static study-notes site (plain HTML + CSS + vanilla JS) published to GitHub Pages by a GitHub Action. Each note is a self-contained HTML summary for an exam in a course ("ramo"). Friends are repo collaborators who push notes directly to `main` (often via GitHub's web upload), so the site must tolerate imperfect contributions. UI text, identifiers and commit messages are in Spanish; keep that convention.

## Commands

```bash
python scripts/indice.py          # generate apuntes.json (gitignored) from apuntes/
python scripts/indice.py --check  # validate only; exit 1 on problems
python -m http.server             # serve locally; file:// no longer works (fetch of apuntes.json)
```

No tests, linter or package manager.

## Architecture

- `apuntes/<ramo>/<evaluación>/<archivo>.html` — the content. `<ramo>` is the lowercase course code, `<evaluación>` is `c1`/`c2`/`control1`… (rendered as "Certamen N"/"Control N" by `nombreEvaluacion` in `js/script.js`). Notes are generated externally and fully self-contained (own CSS, MathJax, theme toggle, scroll-spy); treat them as content, not site code. Never rename files inside a folder: numbered series (e.g. `inf246/c2`, `inf276/c1`) link to each other by filename.
- `ramos.json` — course code → display name. Unknown codes still render, using the code as name.
- `scripts/indice.py` — walks `apuntes/` and emits `apuntes.json` (`ramos[].evaluaciones[].apuntes[]` with `id` = filename stem, `titulo` from `<title>`, `autor` from `<meta name="author">` falling back to git, `fecha` = date of the commit that added the file, `ruta`). Natural sort by filename. `--check` reports HTML outside the structure, unknown ramos, missing author meta and broken relative links.
- `.github/workflows/publicar.yml` — on push to `main`: job `validar` runs `--check` (fails visibly but doesn't block); job `publicar` generates the index and deploys `_site/` (index.html, css, js, apuntes, apuntes.json) to Pages. Needs full history (`fetch-depth: 0`) for authors/dates. Anything new the site needs at runtime must be added to the `cp` line there.
- `index.html` + `js/script.js` — single page. Hash routing `#ramo/evaluación/apunte` (`mostrarRuta`) fills missing segments with the first evaluation/note via `history.replaceState`. The note loads in `<iframe id="visor-html">` (same origin), which lets the shell (a) push its theme into the note by setting `data-theme` on the iframe's `<html>` (all themed notes use `:root[data-theme]`), and (b) sync the URL when the user follows links between notes inside the iframe. Data from notes (titles, authors) is inserted with `textContent` only — keep it that way, contributors are not trusted to produce safe HTML.
- `css/style.css` — shell only; light/dark tokens on `:root` / `:root[data-theme="dark"]`. The initial theme is set by an inline script in `<head>` (localStorage `apuntes-tema`, else system preference). Mobile breakpoint 860px turns the sidebar into an off-canvas panel.

Contributor workflow (folder rules, author meta, web upload steps) is documented in `CONTRIBUTING.md`; keep it in sync when changing structure or validation.
