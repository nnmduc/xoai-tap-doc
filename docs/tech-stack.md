# Tech Stack

## Web App

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Component-based, fast dev server, ESM tree-shaking |
| Language | TypeScript | Type safety for story manifest shapes |
| Styling | Tailwind CSS v3 | Rapid utility-first, responsive grid |
| Animation | Framer Motion | Spring physics, kid-friendly micro-interactions |
| Fonts | Baloo 2 (Google Fonts) | Round, friendly, full Vietnamese diacritic support |
| Assets | Vite publicDir: assets | Serves images and HTML books at `/` |

## Reader Strategy

Existing swipe-only HTML books (`assets/generated-story-books/<slug>/index.html`) are embedded via `<iframe>`. No reader logic re-implementation needed.

## Story Index

A `public/stories-manifest.json` file is generated from the existing per-story `story-image-manifest.json` files. A Python helper script regenerates it when new stories are added.

## Project Location

New web app lives at `web-app/` in the project root. Assets folder is symlinked or referenced via Vite `publicDir`.
