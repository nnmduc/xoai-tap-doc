# AGENTS.md

Guidance for coding agents working in this repository.

## Start Here

1. Read `README.md`.
2. Read `CLAUDE.md`.
3. Inspect the relevant skill file under `skills/*/SKILL.md`.
4. Inspect current pipeline status before generating or regenerating assets.

## Project Purpose

This repo is a Vietnamese grade-1 story production workspace. It stores:

- source story markdown in `assets/stories/`
- generated image prompts, manifests, and PNGs in `assets/generated-story-images/`
- rendered swipe-only HTML books in `assets/generated-story-books/`
- local Codex skills in `skills/`
- a React web app for browsing and reading the books in `web-app/`

## Web App

`web-app/` is a standalone React + Vite + TypeScript app ("Xoài Tập Đọc"). See [`web-app/README.md`](web-app/README.md) for setup and architecture.

Key rules when touching the web app:
- Regenerate the manifest after adding stories: `python3 web-app/scripts/generate-stories-manifest.py`
- `web-app/dist/` and `web-app/node_modules/` are gitignored — never commit them.
- `vite.config.ts` uses `publicDir: '../assets'`; the assets folder is shared with the pipeline — do not move or rename it.

## Skill Routing

Use the smallest skill that covers the task:

- End-to-end story package: `vietnamese-kids-story-orchestrator`
- New or repaired story markdown: `vietnamese-first-grade-story-writer`
- Prompt/manifest/image asset workflow: `vietnamese-kids-story-illustrator`
- HTML book rendering: `kid-story-book-html-template`

For a full story request, start with the orchestrator and follow its state-specific next action.

## Pipeline Rules

Always inspect status first:

```bash
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --slug <story-slug>
```

Use `--all` before broad maintenance work.

State handling:

- `new`: create `assets/stories/<story-slug>.md`
- `story_incomplete`: fix the existing story directly
- `story_ready`: prepare image manifest and prompts
- `prompts_ready` or `media_partial`: generate only missing media with an AI image-generation tool from the prepared prompt files
- `media_complete`: render HTML book
- `complete`: report outputs; do not regenerate unless asked

## Editing Rules

- Prefer updating existing files over creating parallel replacements.
- Use kebab-case for new filenames.
- Keep generated assets separated by story slug.
- Do not mix assets from different stories.
- Do not shorten, paraphrase, or rewrite story `Nội dung` when rendering books.
- Do not add rendered text, labels, watermarks, speech bubbles, or page numbers inside images.
- Generated image prompt files must be English only. Translate Vietnamese story details into natural English before sending prompts to image-generation tools; preserve Vietnamese names only as proper nouns.
- Do not create final story images with hand-written rendering code, Pillow, SVG, canvas, HTML/CSS screenshots, or placeholders. Missing media must come from an AI image-generation tool/provider or an explicitly user-provided image.
- If story content changes after media exists, mention that existing media may be stale before regenerating.

## Python Rules

Scripts are plain Python and should remain dependency-light.

Run syntax checks after changing Python:

```bash
python3 -m py_compile $(find skills -path '*/scripts/*.py' -type f)
```

Run pipeline status after workflow changes:

```bash
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --all
```

## Output Expectations

For completed work, report:

- previous pipeline state, if relevant
- actions taken
- final state
- important output paths
- unresolved questions at the end, if any

Keep reports concise.
