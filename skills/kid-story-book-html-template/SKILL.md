---
name: kid-story-book-html-template
description: Render a self-contained HTML picture-book template for young kids. Use when a story has an optional cover plus under 10 story pages, each story page has one image and the full story text from the writer, and the output must block taps, clicks, scrolling, selection, context menus, and other interactions while allowing only left/right swipe page changes.
user-invocable: true
when_to_use: "Invoke to render a swipe-only HTML picture book from a story image manifest or pages JSON after images are generated."
category: content
keywords: [html, book, kids, story, swipe, template, render, picture-book]
argument-hint: "[story-slug]"
allowed-tools: [Bash, Read, Write]
metadata:
  short-description: Render swipe-only kids story HTML
---

# Kid Story Book HTML Template

Use this skill after a story and images already exist, especially after `vietnamese-first-grade-story-writer` and `vietnamese-kids-story-illustrator`.

## Inputs

Preferred input is either:

- `assets/generated-story-images/<story-slug>/story-image-manifest.json`
- A pages JSON file:

```json
{
  "title": "Story Title",
  "cover": {"image": "assets/generated-story-images/story/cover/cover.png"},
  "pages": [
    {"image": "assets/generated-story-images/story/scenes/01-doan-1.png", "text": "Full story text for this page"}
  ]
}
```

Keep stories to 1 optional cover plus 1-9 story pages. Preserve story text exactly from the writer; do not shorten it for layout.

## Output Layout

Default output:

```text
assets/generated-story-books/<story-slug>/
└── index.html
```

The HTML is self-contained except for image file paths. Use relative image paths when the book will stay inside this repo.

## Workflow

1. Confirm the image files exist.
2. Render the book:

```bash
python3 skills/kid-story-book-html-template/scripts/render-story-book-html.py \
  assets/generated-story-images/<story-slug>/story-image-manifest.json
```

Optional pages JSON:

```bash
python3 skills/kid-story-book-html-template/scripts/render-story-book-html.py \
  path/to/pages.json \
  --output assets/generated-story-books/<story-slug>/index.html
```

Useful flags:

```bash
--image-root assets/generated-story-images/<story-slug>/scenes
--allow-missing-images
--absolute-image-paths
```

3. Open the generated `index.html` in a browser and verify:
   - The cover appears first when the manifest includes `cover.output_path`.
   - One page is visible at a time.
   - Each page shows one full illustration and the original story text.
   - Tap/click does nothing.
   - Text cannot be selected.
   - Browser scrolling and context menu are blocked.
   - Only horizontal swipe changes page.

## Template Rules

- Do not add buttons, links, menus, audio, keyboard shortcuts, or page thumbnails.
- Keep page controls non-interactive. Dots and page count may be visual only.
- If a cover exists, show it as the first page using `cover.output_path` and the story title as layout text.
- Preserve a book-like page: image area first, story text below, warm paper surface, stable page dimensions.
- Do not put text inside images. Use the text area.
- Do not shorten, paraphrase, or rewrite `Nội dung`. The template adapts typography for longer text.
- Use `object-fit: contain` or equivalent so cover and scene images are not cropped.
- This skill should not create image prompts during normal rendering. If asked to create or repair downstream image prompt text, write generated prompts in English only while preserving the Vietnamese story text in the HTML.

## Script Behavior

`scripts/render-story-book-html.py` reads `assets/story-book-template.html`, injects JSON into `{{STORY_DATA_JSON}}`, and writes the final HTML.

For image manifests, `cover.output_path` becomes an optional first page. Scene `output_path` becomes the story page image. Scene `content` is preferred for display text and is preserved exactly. `text` and `phrase` are fallback fields for custom JSON compatibility.

The renderer checks local image dimensions and warns if scene images do not share one size or if the cover is not portrait. The HTML still contains images instead of cropping them.

## Final Report

Report the generated HTML path, page count, and any image-size warnings. End with unresolved questions, if any.
