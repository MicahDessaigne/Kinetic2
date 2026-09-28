# LifeOS — Offline Habit, Task & Prayer Tracker (PWA)

LifeOS is a fully offline, installable Progressive Web App for tracking **habits**,
**tasks**, **prayers** and **notes**. It has **no backend and no server** — every byte of
your data lives on your device in the browser's IndexedDB. It builds to a static `dist/`
folder you can host for free on Cloudflare Pages, Vercel or Netlify.

Design language: **Dark Kinetic Minimalism / Liquid Glass** (dark by default, with light &
system themes).

## Features

- **Today** — greeting, a daily quote (120+ built-in, tap to shuffle), a circular progress
  ring, today's habits, due tasks, prayer focus and a quick-note bar.
- **Habits** — boolean (✓), quantity (stepper) and timer types, per-weekday scheduling,
  a streak engine that skips non-scheduled days, and full backfilling.
- **Tasks** — Today / Scheduled / All / Done views, subtasks, priorities, due date + time,
  and repeating tasks that auto-generate their next instance on completion.
- **Calendar** — month & week grids with activity dots, plus a Day Inspector for full
  retroactive editing of any date (future dates are read-only for habits/prayers).
- **Prayer List** — Active / Answered sections, days-prayed history, and an answered
  reflection prompt.
- **Notes** — auto-saving scratchpad with search and pinning.
- **Notifications** — local reminders (morning motivation, evening habit nudge, task due)
  scheduled by the service worker. No push server required.
- **Security** — optional 4–6 digit PIN lock (SHA-256 hashed, stored locally).
- **Backup** — export/import all data as JSON.

## Tech stack

Vite • React • TypeScript • Tailwind CSS • Dexie (IndexedDB) • Zustand • React Router
(hash routing) • Framer Motion • vite-plugin-pwa (Workbox).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs static site to ./dist
npm run preview  # preview the production build locally
```

The `dist/` folder is a self-contained static site. Deploy it anywhere.

---

## Deploy for free

### Option 1 — Cloudflare Pages

**Via dashboard (Git):**
1. Push this project to a GitHub/GitLab repo.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build command: `npm run build` — Build output directory: `dist`.
4. Save & Deploy. `wrangler.toml` and `public/_redirects` are already configured.

**Via CLI:**
```bash
npm run build
npx wrangler pages deploy dist --project-name lifeos
```

### Option 2 — Vercel

**Via dashboard:** Import the repo — Vercel detects Vite automatically. `vercel.json`
sets the build command, output dir and SPA rewrites.

**Via CLI:**
```bash
npm i -g vercel
npm run build
vercel deploy --prebuilt   # or simply: vercel
```

### Option 3 — Netlify

**Via dashboard:** New site from Git → build command `npm run build`, publish directory
`dist`. `netlify.toml` already contains this plus SPA redirects.

**Via CLI:**
```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Static hosting notes
- The app uses **hash-based routing** (`/#/...`) so it works even without SPA rewrites,
  but the provided configs add proper fallbacks anyway.
- `base` is set to `./` in `vite.config.ts`, so the build also works from a subpath
  (e.g. GitHub Pages project sites).

## Install to your device

Open the deployed URL, then:
- **iOS (Safari):** Share → *Add to Home Screen*. Required for notifications (iOS 16.4+).
- **Android (Chrome):** menu → *Install app* / *Add to Home Screen*.
- **Desktop (Chrome/Edge):** install icon in the address bar.

## Privacy

100% local. No accounts, no analytics, no trackers, no network calls. Use **Backup →
Export** regularly, because clearing your browser data will erase everything.

## About notifications

Because there is no server, reminders are scheduled locally by the service worker and are
delivered best-effort while the OS permits. On iOS the app must be installed to the Home
Screen (iOS 16.4+) and the system may delay or batch notifications to save battery.
