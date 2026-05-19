---
phase: 3
title: "Design System"
status: pending
priority: P1
effort: "30m"
dependencies: [1]
---

# Phase 3: Design System

## Overview
Set up CSS design tokens, Tailwind extensions, Google Fonts, and claymorphism utility classes. All components in later phases import from this layer. Reference: `docs/design-guidelines.md`.

## Requirements
- Functional: All design tokens available as CSS vars + Tailwind utilities
- Non-functional: Single source of truth in `src/styles/globals.css` and `tailwind.config.ts`

## Architecture
```
web-app/src/styles/
└── globals.css          ← CSS custom properties + @layer utilities for clay shadows

web-app/tailwind.config.ts
  ↳ extend.colors        ← semantic color tokens
  ↳ extend.fontFamily    ← Baloo 2, Comic Neue
  ↳ extend.boxShadow     ← clay-card, clay-card-hover, clay-btn
  ↳ extend.borderRadius  ← card, btn, chip, frame
  ↳ extend.animation     ← bounce-in
  ↳ extend.keyframes     ← bounce-in

web-app/index.html
  ↳ Google Fonts link (Baloo 2 + Comic Neue)
```

## Related Code Files
- Create: `web-app/src/styles/globals.css`
- Modify: `web-app/tailwind.config.ts`
- Modify: `web-app/index.html` (add Google Fonts)
- Create: `web-app/src/types/story.ts` (TypeScript interfaces)

## Implementation Steps

1. **`web-app/index.html`** — add Google Fonts in `<head>`:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet" />
   ```

2. **`web-app/src/styles/globals.css`** — CSS vars + base only (shadows moved to tailwind.config):
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   :root {
     --color-bg:           #FFF8EE;
     --color-surface:      #FFFFFF;
     --color-primary:      #4A90D9;
     --color-primary-dark: #2C6FAB;
     --color-accent:       #F97316;
     --color-accent-dark:  #D95F0A;
     --color-text-primary: #2D2416;
     --color-text-body:    #5C4B32;
     --color-text-muted:   #9C8468;
     --color-border:       #E8D5B0;
     --color-frame-wood:   #8B5E3C;
   }

   html { background: var(--color-bg); }
   body { font-family: 'Comic Neue', sans-serif; color: var(--color-text-primary); }
   ```

3. **`web-app/tailwind.config.ts`** — extend theme:

   > **Shadow strategy**: define shadows in `extend.boxShadow` (NOT only in `@layer utilities`).
   > Tailwind's build-time purge scans class names like `shadow-clay` in JSX files; if the class
   > is defined only in CSS `@layer utilities`, the purger still removes it unless the CSS file
   > itself is in the `content` array. Defining in `extend.boxShadow` is the reliable pattern.

   ```ts
   theme: {
     extend: {
       fontFamily: {
         heading: ['"Baloo 2"', 'sans-serif'],
         body:    ['"Comic Neue"', 'sans-serif'],
       },
       colors: {
         brand: {
           bg:            '#FFF8EE',
           surface:       '#FFFFFF',
           primary:       '#4A90D9',
           'primary-dark':'#2C6FAB',
           accent:        '#F97316',
           'accent-dark': '#D95F0A',
           border:        '#E8D5B0',
           text:          '#2D2416',
           muted:         '#9C8468',
           wood:          '#8B5E3C',
         },
       },
       borderRadius: {
         card:  '20px',
         btn:   '16px',
         chip:  '100px',
         frame: '18px',
       },
       boxShadow: {
         'clay':      'inset -2px -2px 6px rgba(0,0,0,.06), inset 1px 1px 4px rgba(255,255,255,.7), 4px 6px 18px rgba(74,144,217,.22), 0 2px 4px rgba(0,0,0,.07)',
         'clay-hover':'inset -2px -2px 8px rgba(0,0,0,.08), inset 1px 1px 4px rgba(255,255,255,.8), 6px 12px 28px rgba(74,144,217,.32), 0 4px 10px rgba(0,0,0,.10)',
         'clay-btn':  '3px 4px 12px rgba(74,144,217,.28), inset 1px 1px 3px rgba(255,255,255,.6)',
         'wood-frame':'inset 0 0 0 3px #C4874A, inset 0 0 0 5px #7A5234, 0 6px 24px rgba(139,94,60,.35), 0 2px 6px rgba(0,0,0,.15)',
       },
     },
   }
   ```

4. **`web-app/src/types/story.ts`** — TypeScript interfaces:
   ```ts
   export interface StoryEntry {
     slug:        string
     title:       string
     summary?:    string
     themes:      string[]
     coverPath:   string
     hasHtmlBook: boolean
   }

   export interface StoriesManifest {
     generatedAt: string
     stories:     StoryEntry[]
   }
   ```

5. **Import globals.css in `src/main.tsx`**:
   ```ts
   import './styles/globals.css'
   ```

6. **Verify**: Run `npm run dev`, open browser, confirm cream background + fonts load.

## Success Criteria
- [ ] `var(--color-primary)` resolves to `#4A90D9` in browser DevTools
- [ ] Baloo 2 and Comic Neue fonts load (check Network tab)
- [ ] `shadow-clay` utility class exists and renders double shadow
- [ ] `StoryEntry` type exports without TypeScript error
- [ ] `npm run build` still clean

## Risk Assessment
- Google Fonts offline: fonts load from CDN; no offline fallback needed for wireframe phase
- Tailwind purge: content paths must include `./src/**/*.{ts,tsx}` to prevent purging utility classes
