# Xoài Tập Đọc

A production workspace for generating illustrated Vietnamese picture books for grade-1 readers (Lớp 1). Give it a story idea and the agent skills handle the full pipeline: write the story → generate AI artwork → render a swipe-only HTML book.

A React web app for browsing and reading the finished books is available at [`web-app/`](web-app/README.md).

---

## Quick Start

**Requirements:** Python 3.10+, Claude Code or Codex, image generation capability.

```bash
git clone <this-repo> ~/xoai-tap-doc
cd ~/xoai-tap-doc
```

Skills in `skills/` are picked up automatically — no install step.

### Create a story

```
/vietnamese-kids-story-orchestrator con mèo và chiếc lá vàng
```

Or in plain text: *"Tạo câu chuyện về chú chó nhỏ tìm được người bạn mới ở sân trường"*

The orchestrator runs the full pipeline and stops when the book is `complete`.

### Open the book

```
assets/generated-story-books/<story-slug>/index.html
```

Swipe left/right to turn pages. Tap/click/scroll are intentionally disabled.

---

## Managing Stories

```bash
# All stories
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --all

# One story
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --slug <slug>
```

States: `new` → `story_incomplete` → `story_ready` → `prompts_ready` → `media_partial` → `media_complete` → `complete`

Re-run the orchestrator on any slug to resume from where it stopped. Nothing is overwritten unless you ask.

---

## Skills

| Skill | Purpose |
|-------|---------|
| `vietnamese-kids-story-orchestrator` | Main entrypoint — coordinates the full pipeline |
| `vietnamese-first-grade-story-writer` | Writes the story markdown |
| `vietnamese-kids-story-illustrator` | Prepares image prompts and manifests |
| `kid-story-book-html-template` | Renders the final swipe-only HTML book |

---

## Repository Layout

```
assets/
├── stories/                        # Source story markdown
├── generated-story-images/         # Prompts, manifests, PNGs
├── generated-story-books/          # Rendered HTML books
└── stories-manifest.json           # Web app manifest (auto-generated)

skills/                             # Local agent skills (see above)

web-app/                            # React reader app — see web-app/README.md
```

---

## Tips

- **Resume a partial run:** invoke the orchestrator again with the same slug — it continues from current state.
- **Regenerate images:** ask explicitly; nothing is overwritten by default.
- **Edit a story:** update `assets/stories/<slug>.md` directly, then re-run the orchestrator.
- **Update the web app manifest:** run `python3 web-app/scripts/generate-stories-manifest.py` after adding stories.
