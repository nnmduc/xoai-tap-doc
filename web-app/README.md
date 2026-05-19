# Xoài Tập Đọc — Web App

Vietnamese kids story library for Lớp 1 readers (age 6–7). Claymorphism style, Framer Motion animations.

## Setup

```bash
# 1. Generate the stories manifest (run from repo root)
python3 web-app/scripts/generate-stories-manifest.py

# 2. Install dependencies
cd web-app && npm install

# 3. Start dev server
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build      # type-check + vite build → dist/
npm run preview    # preview dist/ locally
```

## Architecture

```
web-app/
├── src/
│   ├── App.tsx                      # Root: hash routing + AnimatePresence
│   ├── hooks/
│   │   ├── use-hash-route.ts        # Hash-based router (#library, #reader/<slug>)
│   │   └── use-stories-manifest.ts  # Fetches /stories-manifest.json
│   ├── components/
│   │   ├── library/                 # Library screen (book grid)
│   │   ├── reader/                  # Reader screen (wooden frame + iframe)
│   │   └── shared/                  # Loading/error screens
│   ├── types/story.ts               # StoryEntry, StoriesManifest
│   └── styles/globals.css           # Tailwind directives + CSS custom properties
├── vite.config.ts                   # publicDir → ../assets (serves covers + books)
└── tailwind.config.ts               # Brand tokens, clay shadows
```

## Data flow

1. Python script scans `assets/generated-story-images/*/story-image-manifest.json`
2. Writes `assets/stories-manifest.json` (served at `/stories-manifest.json` by Vite)
3. React app fetches manifest on mount → renders book cards
4. Clicking a card sets `#reader/<slug>` → reader screen slides up
5. Reader embeds `<iframe src="/generated-story-books/<slug>/index.html">`

## Key decisions

- **No React Router** — simple hash routing via `window.location.hash`
- **publicDir: "../assets"** — Vite serves the shared assets folder directly; no copy step
- **iframe sandbox** — `allow-scripts allow-same-origin` lets swipe books function while blocking navigation
- **Manifest over file scanning** — manifest pre-computes `hasHtmlBook` so the UI never 404s silently
