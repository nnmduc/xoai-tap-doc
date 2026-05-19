# Xoai Tap Doc

A tool for generating illustrated Vietnamese picture books for grade-1 readers — complete with story text, AI-generated artwork, and a swipe-only HTML book you can open on any device.

## What It Creates

Give it a story idea and it will:

- Write a short, age-appropriate Vietnamese story (Lớp 1 level)
- Generate a cover image, character portraits, and one illustration per scene
- Bundle everything into a self-contained HTML picture book with swipe navigation

Stories are safe, kind, and concrete — no scary, violent, or adult content.

---

## Quick Start

### 1. Requirements

- Python 3.10 or later
- Claude Code or Codex with access to the local skills in this repo
- Image generation available to your agent:
  - Codex can use its native image generation tool
  - Claude Code can use an image-capable skill such as `ai-multimodal`

### 2. Install the Skills

Clone this repo, then open the project with Claude Code or Codex:

```bash
git clone <this-repo> ~/xoai-tap-doc
cd ~/xoai-tap-doc
```

The `skills/` folder contains four local agent skills. They are picked up automatically when you open Claude Code or Codex inside this directory — no extra install step needed.

### 3. Create Your First Story

Open Claude Code or Codex in this directory.

With Claude Code, run:

```
/vietnamese-kids-story-orchestrator con mèo và chiếc lá vàng
```

With Codex, ask for the same skill by name:

> "Use `vietnamese-kids-story-orchestrator` to create a story about con mèo và chiếc lá vàng"

In either agent, you can also describe what you want in plain text:

> "Tạo một câu chuyện về chú chó nhỏ tìm được người bạn mới ở sân trường"

The agent will handle the full pipeline: write the story → generate images → render the HTML book.

### 4. Open the Book

When the pipeline reaches `complete`, open the rendered book in any browser:

```
assets/generated-story-books/<story-slug>/index.html
```

Swipe left/right to turn pages. Tap/click/scroll are intentionally disabled — it is designed for young readers on touch screens.

---

## Managing Existing Stories

Check the status of all stories at once:

```bash
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --all
```

Check one story:

```bash
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --slug <story-slug>
```

Possible states: `new` → `story_incomplete` → `story_ready` → `prompts_ready` → `media_partial` → `media_complete` → `complete`

If a story is stuck at any state, run the orchestrator skill again and it will pick up from where it left off — it never regenerates assets that already exist unless you ask.

---

## Repository Layout

```
assets/
├── stories/                        # Source story markdown files
├── generated-story-images/         # Image prompts, manifests, generated PNGs
└── generated-story-books/          # Rendered HTML books

skills/
├── vietnamese-kids-story-orchestrator/   # Main entrypoint — coordinates the full pipeline
├── vietnamese-first-grade-story-writer/  # Writes the story markdown
├── vietnamese-kids-story-illustrator/    # Prepares image prompts and manifests
└── kid-story-book-html-template/         # Renders the final HTML book
```

---

## Tips

- **Resuming a partial run:** just invoke the orchestrator again with the same slug. It inspects the current state and continues from where it stopped.
- **Regenerating images:** ask explicitly — "regenerate the cover for `<slug>`". By default nothing is overwritten.
- **Multiple stories:** each story lives under its own slug. They never interfere with each other.
- **Editing a story:** open `assets/stories/<slug>.md` and edit it directly. Re-run the orchestrator to regenerate affected images.
