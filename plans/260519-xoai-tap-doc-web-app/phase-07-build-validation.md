---
phase: 7
title: "Build Validation"
status: pending
priority: P1
effort: "20m"
dependencies: [6]
---

# Phase 7: Build Validation

## Overview
Validate the complete app in both dev and production build modes. Verify all assets load correctly, animations work, iframe books are accessible, and the static build is self-contained.

## Requirements
- Functional: All 3 cards render with covers; 2 books open in iframe reader; fallback shows for incomplete book
- Non-functional: Build completes without TypeScript errors; `dist/` is self-contained; no console errors in browser

## Implementation Steps

1. **Re-run manifest generator** (in case assets changed):
   ```bash
   python3 web-app/scripts/generate-stories-manifest.py
   ```

2. **Dev server smoke test** (`npm run dev` in `web-app/`):
   - [ ] Open `http://localhost:5173/`
   - [ ] Library loads with 3 covers
   - [ ] Click "Cánh Cửa Trong Tủ Sách" → reader opens, iframe shows swipe book
   - [ ] Swipe left/right inside iframe works
   - [ ] Click back → library animates back in
   - [ ] Click "Bản Đồ Trong Sân Trường" → reader opens with "Sắp có" fallback
   - [ ] Refresh on `#reader/duong-sao-tren-san-thuong` → reader opens directly

3. **TypeScript compile check**:
   ```bash
   cd web-app && npx tsc --noEmit
   ```
   Zero errors required.

4. **Production build**:
   ```bash
   cd web-app && npm run build
   ```
   Verify `dist/` contains:
   - `index.html`
   - `assets/` (JS/CSS bundles)
   - `generated-story-images/` (covers)
   - `generated-story-books/` (HTML books)
   - `stories-manifest.json`

5. **Preview build**:
   ```bash
   cd web-app && npm run preview
   ```
   Repeat smoke test at `http://localhost:4173/`.

6. **Python syntax check** (regression guard):
   ```bash
   python3 -m py_compile web-app/scripts/generate-stories-manifest.py
   ```

7. **Pipeline status check** (ensure no story regressions):
   ```bash
   python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --all
   ```

8. **Update `README.md`** — add "Web App" section documenting:
   - `cd web-app && npm install`
   - `python3 web-app/scripts/generate-stories-manifest.py`
   - `npm run dev`

## Success Criteria
- [ ] `tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] `dist/` is self-contained (covers + books + manifest present)
- [ ] Dev + preview smoke test passes all 8 checks above
- [ ] Python syntax check passes
- [ ] Pipeline status unchanged (no regressions to existing stories)
- [ ] README updated with web app dev instructions

## Risk Assessment
- `dist/` missing `generated-story-books/`: happens if `publicDir` path is wrong — check `vite.config.ts` before build
- iOS Safari iframe swipe: swipe events inside sandboxed iframe work if `allow-same-origin` set — functional in both dev and build as both are `localhost`
