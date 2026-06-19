# D&K Services — Website

The complete, deploy-ready website for **D&K Services Co.** (Waco, GA — diesel & gas vehicle repair).
This is a **static site**: no build step, no server, no database. Just upload these files to Netlify and it's live.

---

## What's in this folder

```
dk-services-site/
├── index.html          ← the entire website (one page)
├── tweaks-panel.jsx    ← required helper script (leave it here)
├── netlify.toml        ← Netlify settings (caching + headers)
├── robots.txt          ← search-engine instructions
├── README.md           ← this file
└── uploads/            ← all photos & brand logos
```

Everything the site needs is in this folder. The page also loads three things
from the internet at runtime (standard practice — no action needed from you):
fonts from Google Fonts, the React/Babel libraries from a CDN, and the embedded
Google Map. A visitor just needs a normal internet connection.

---

## Deploy to Netlify — Option A: Drag & Drop (easiest, ~2 minutes)

1. Go to **https://app.netlify.com/drop**
2. Drag the **`dk-services-site` folder** onto that page.
3. Netlify uploads it and gives you a live URL (e.g. `random-name-123.netlify.app`).
4. Done. To update later, drag the folder again.

## Deploy to Netlify — Option B: Connect a Git repo (best for ongoing edits)

1. Put this folder in a GitHub/GitLab repository.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
3. Build settings: leave **Build command** blank, set **Publish directory** to the
   folder that contains `index.html` (`/` if the repo root is this folder).
4. Deploy. Every push to your main branch redeploys automatically.

---

## Custom domain (e.g. dkservicesco.com)

1. In your site on Netlify: **Domain management → Add a domain**.
2. Enter your domain and follow the DNS steps (point it at Netlify, or use
   Netlify DNS). HTTPS is turned on automatically and is free.

---

## Editing the site

- **Text & layout** live in `index.html`.
- **Photos & logos** live in `uploads/`. To swap a photo, replace the file in
  `uploads/` with one of the **same name**, or add a new file and update its
  reference in `index.html` (search for the old filename).
- The phone numbers, address, hours, and email are all in `index.html`
  (search for `404.430.7991`, `Buncombe-Waco`, etc.).

### About the "Tweaks" panel
`tweaks-panel.jsx` powers an in-editor controls panel used during design. It is
**hidden from the public** automatically — visitors never see it. Keep the file
in place; the page expects it to load.

---

## Notes

- This is a single-page site. The top navigation links jump to sections on the
  same page (Services, Gallery, About, Fleet, Contact).
- The contact form is currently front-end only (it validates and shows a success
  message but does not send an email yet). To make it actually deliver messages,
  enable **Netlify Forms** (add `netlify` to the `<form>` tag) or wire it to a
  service like Formspree — happy to set this up on request.
