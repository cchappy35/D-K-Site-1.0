# D&K Services — Website (dkservicesco.com)

Static site hosted on **Cloudflare Pages**, auto-deployed from the `main` branch of this repo. There is no build step on Cloudflare — every file in the repo is served as-is.

## Pages
| URL | File | Notes |
|---|---|---|
| `/` | `index.html` | **Generated** — do not edit by hand (see below) |
| `/fleet` | `fleet.html` | Fleet landing page, plain HTML — edit directly |
| `/privacy` | `privacy.html` | Privacy policy, plain HTML — edit directly |

Shared files: `motion.css` + `motion.js` (animations, used by `/` and `/fleet`), `uploads/` (photos and logos), `sitemap.xml`, `robots.txt`, `_headers` (Cloudflare caching/security headers).

## Editing the homepage
The homepage is written in React (JSX) and **pre-built** so it loads fast and Google can read it without running JavaScript.

- Source: `src/app.jsx` (content and components) and `src/index.template.html` (head, styles, SEO tags, schema)
- `tweaks-panel.jsx` is a Claude Design helper that the homepage still references; it shows nothing to visitors.
- After editing the source, rebuild:
  ```
  cd build
  npm install
  node build.js
  ```
  This regenerates `index.html`, `app.js`, and `vendor/` (self-hosted production React). Commit all of them.

> If the homepage is re-exported from Claude Design, the export will be the old in-browser-compiled format. Copy its `<script type="text/babel">` contents into `src/app.jsx` (ending with `window.__DK_APP__ = App;`) and rebuild instead of replacing `index.html` directly.

## Forms
Both the homepage and `/fleet` forms post to **Web3Forms**, which emails submissions to bellis@dkservicesco.com. `/fleet` submissions have "FLEET" in the subject line. Both forms include a hidden spam trap (`botcheck`).

## Tracking
- **Google Tag Manager** `GTM-TX93JH67` and **Meta Pixel** `1571459384670191` load on every page (in `src/index.template.html`, `fleet.html`, `privacy.html`).
- Meta `Lead` fires on both forms only after Web3Forms confirms the submission. The /fleet form also pushes `fleet_quote_submit` to the GTM dataLayer at the same moment.
- Meta `Contact` fires on any tap of a `tel:` link, sitewide.
- If a Meta Pixel tag is ever added inside GTM, remove the hard-coded Pixel here or PageViews will double-count.

