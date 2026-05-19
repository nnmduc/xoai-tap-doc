---
title: "xoai-tap-doc-web-app"
description: "React + Vite + TypeScript + Tailwind CSS web app — Vietnamese kids story library (Xoài Tập Đọc)"
status: pending
priority: P1
branch: "main"
tags: ["react", "vite", "typescript", "tailwind", "claymorphism", "kids-app"]
blockedBy: []
blocks: []
created: "2026-05-19T06:41:12.439Z"
createdBy: "ck:plan"
source: skill
---

# Xoài Tập Đọc — Web App

Cute Vietnamese Lớp 1 story library. Two screens: **Library** (book grid) and **Reader** (iframe book frame). Claymorphism design, Framer Motion animations, static data from pipeline assets.

## References
- Design: `docs/design-guidelines.md`
- Tech stack: `docs/tech-stack.md`
- Wireframes: `docs/wireframe/library-screen.html`, `docs/wireframe/reader-screen.html`

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Project Scaffold](./phase-01-project-scaffold.md) | Pending | 30m |
| 2 | [Manifest Generator](./phase-02-manifest-generator.md) | Pending | 20m |
| 3 | [Design System](./phase-03-design-system.md) | Pending | 30m |
| 4 | [Library Screen](./phase-04-library-screen.md) | Pending | 1h |
| 5 | [Reader Screen](./phase-05-reader-screen.md) | Pending | 45m |
| 6 | [App Shell and Routing](./phase-06-app-shell-and-routing.md) | Pending | 30m |
| 7 | [Build Validation](./phase-07-build-validation.md) | Pending | 20m |

## Key Decisions
- `web-app/` subdir; Vite `publicDir: "../assets"` serves covers + HTML books at `/`
- Hash routing (`#library` / `#reader/<slug>`) — no React Router needed
- `fetch('/stories-manifest.json')` at boot — manifest in `web-app/public/`
- iframe loads existing swipe-only HTML books — no reader re-implementation
- Python generator script at `web-app/scripts/generate-stories-manifest.py`

## Dependencies
None — new feature, no cross-plan conflicts.
