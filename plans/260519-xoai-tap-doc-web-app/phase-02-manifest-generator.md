---
phase: 2
title: "Manifest Generator"
status: pending
priority: P1
effort: "20m"
dependencies: [1]
---

# Phase 2: Manifest Generator

## Overview
Python script that reads all existing `story-image-manifest.json` files and writes `web-app/public/stories-manifest.json`. Run once before `npm run dev` or `npm run build`. Dependency-free stdlib only.

## Requirements
- Functional: Reads all slugs from `assets/generated-story-images/*/story-image-manifest.json`; checks if rendered HTML book exists; writes consolidated manifest
- Non-functional: stdlib only (glob, json, pathlib); run from project root; idempotent

## Architecture
```
web-app/scripts/generate-stories-manifest.py
  ↓ reads
assets/generated-story-images/<slug>/story-image-manifest.json  (n files)
  ↓ checks
assets/generated-story-books/<slug>/index.html  (may or may not exist)
  ↓ writes
assets/stories-manifest.json   ← inside publicDir, served at /stories-manifest.json
```

> **Why `assets/` not `web-app/public/`**: Vite's `publicDir: "../assets"` replaces the default `public/`
> entirely — it does NOT merge. So `web-app/public/` is never served. The manifest must live
> inside `assets/` to be reachable at `/stories-manifest.json`.

Output schema:
```json
{
  "generatedAt": "2026-05-19T06:00:00Z",
  "stories": [
    {
      "slug": "canh-cua-trong-tu-sach",
      "title": "Cánh Cửa Trong Tủ Sách",
      "summary": "Sách mở ra những chuyến phiêu lưu trong trí tưởng tượng.",
      "themes": ["phiêu lưu", "khám phá"],
      "coverPath": "/generated-story-images/canh-cua-trong-tu-sach/cover/cover.png",
      "hasHtmlBook": true
    }
  ]
}
```

## Related Code Files
- Create: `web-app/scripts/generate-stories-manifest.py`
- Create: `assets/stories-manifest.json` (generated output — inside publicDir)

## Implementation Steps

1. **Create `web-app/scripts/` directory**.

2. **Write `web-app/scripts/generate-stories-manifest.py`**:

   > **Simplified design**: reads only from `story-image-manifest.json` (no markdown parsing).
   > Avoids fragile regex YAML parsing that incorrectly appends character names to themes.
   > `summary` and `themes` are optional UI-only fields — left empty here.

   ```python
   #!/usr/bin/env python3
   """Generate assets/stories-manifest.json from pipeline image manifests.
   Run from project root: python3 web-app/scripts/generate-stories-manifest.py
   Output: assets/stories-manifest.json (inside Vite publicDir → served at /stories-manifest.json)
   """
   import json, sys
   from pathlib import Path
   from datetime import datetime, timezone

   ROOT      = Path(__file__).parent.parent.parent  # project root
   IMAGE_DIR = ROOT / "assets" / "generated-story-images"
   BOOKS_DIR = ROOT / "assets" / "generated-story-books"
   OUT_PATH  = ROOT / "assets" / "stories-manifest.json"

   def load_json(path: Path) -> dict | None:
       try:
           return json.loads(path.read_text(encoding="utf-8"))
       except (OSError, json.JSONDecodeError) as e:
           print(f"  WARN: skipping {path}: {e}", file=sys.stderr)
           return None

   def main():
       manifests = sorted(IMAGE_DIR.glob("*/story-image-manifest.json"))
       if not manifests:
           print("No story manifests found in", IMAGE_DIR, file=sys.stderr)
           sys.exit(1)

       stories = []
       for path in manifests:
           data = load_json(path)
           if not data:
               continue
           slug  = data.get("story_slug", "")
           title = data.get("title", slug)
           if not slug:
               continue
           has_book = (BOOKS_DIR / slug / "index.html").exists()
           stories.append({
               "slug":        slug,
               "title":       title,
               "summary":     "",      # optional — extend later if needed
               "themes":      [],      # optional — extend later if needed
               "coverPath":   f"/generated-story-images/{slug}/cover/cover.png",
               "hasHtmlBook": has_book,
           })
           print(f"  {'✅' if has_book else '⏳'} {slug}: {title}")

       OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
       output = {"generatedAt": datetime.now(timezone.utc).isoformat(), "stories": stories}
       OUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
       print(f"\nWrote {len(stories)} stories → {OUT_PATH.relative_to(ROOT)}")

   if __name__ == "__main__":
       main()
   ```

3. **Run the script** from project root:
   ```bash
   python3 web-app/scripts/generate-stories-manifest.py
   ```

4. **Verify output**: `assets/stories-manifest.json` contains 3 stories, `hasHtmlBook: true` for 2 of them.

5. **Add to project CLAUDE.md / README** — document that this script must be re-run when new stories are added.

## Success Criteria
- [ ] Script runs without error from project root
- [ ] `assets/stories-manifest.json` exists with 3 story entries
- [ ] `canh-cua-trong-tu-sach` and `duong-sao-tren-san-thuong` have `hasHtmlBook: true`
- [ ] `ban-do-trong-san-truong` has `hasHtmlBook: false`
- [ ] `title` fields contain correct Vietnamese text with diacritics
- [ ] Script is idempotent (run twice produces same output)

## Risk Assessment
- Missing story markdown: script handles gracefully with empty `summary`/`themes`
- Unicode: `ensure_ascii=False` preserves Vietnamese characters in output
