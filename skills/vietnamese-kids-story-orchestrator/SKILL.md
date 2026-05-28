---
name: vietnamese-kids-story-orchestrator
description: Single entrypoint for generating a complete Vietnamese kid story package. Use when the agent should inspect whether a story is new, story-only, media-partial, media-complete, or fully rendered, then coordinate story writing, cover/character/scene image generation, and optionally swipe-only HTML book rendering.
user-invocable: true
when_to_use: "Invoke for end-to-end Vietnamese kids story generation — inspect pipeline status, write story, generate images, optionally render swipe-only HTML book."
category: content
keywords: [vietnamese, story, kids, orchestrator, pipeline, images, html, book]
argument-hint: "[story-slug or story title]"
allowed-tools: [Bash, Read, Write, Edit]
metadata:
  short-description: Orchestrate full Vietnamese story pipeline
---

# Vietnamese Kids Story Orchestrator

Use this skill as the first stop for end-to-end story generation. It coordinates:

- `vietnamese-first-grade-story-writer`
- `vietnamese-kids-story-illustrator`
- `vietnamese-kids-story-audio-reader` *(optional — skipped if edge-tts is unavailable)*
- `kid-story-book-html-template` *(optional — ask the user if not explicitly requested)*

## Generated Prompt Language

Whenever this workflow creates or consumes image-generation prompts, the prompt text must be English only. Translate Vietnamese story details into natural English inside prompt files, preserve Vietnamese character names only as proper nouns, and rewrite any generated prompt that still contains Vietnamese source text before sending it to an image tool.

## Status First

Always inspect status before generating or regenerating anything:

```bash
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --story assets/stories/<story>.md
```

Other useful forms:

```bash
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --slug <story-slug>
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --all
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --slug <story-slug> --json
```

## States

- `new`: no story markdown found yet.
- `story_incomplete`: story file exists but its frontmatter/sections are incomplete or inconsistent.
- `story_ready`: story markdown is ready; image manifest is missing.
- `prompts_ready`: manifest exists; no generated media found yet.
- `media_partial`: some cover/character/scene images exist, but at least one expected image is missing.
- `media_complete`: all expected media exists; final HTML book is missing.
- `complete`: story, media, and HTML book exist.

Audio is tracked separately (`audio.exists`, `audio.count`) and does not affect pipeline state — it is always optional.

HTML rendering is **optional**. `media_complete` is an acceptable final state when the user has not requested HTML.

## Orchestration Workflow

**CRITICAL: Run the pipeline loop until the target state is reached. Each sub-skill invocation is one step — completing a sub-skill means continue to the next step immediately, not finish.**

### Step 0 — Determine HTML intent (once, before the loop)

Before starting, check whether the user explicitly requested HTML output:

- **Explicit yes** (user said "generate HTML", "render book", "with HTML", etc.) → set `render_html = true`
- **Explicit no** (user said "no HTML", "skip HTML", "just the story/images") → set `render_html = false`
- **Not mentioned** → **ask the user** before proceeding:

  > "Do you want me to also render an HTML swipe-book after generating the story and images?"

  Wait for the answer, then set `render_html` accordingly. Continue the loop with the target state:
  - `render_html = true` → loop until `complete`
  - `render_html = false` → loop until `media_complete`

### Main Loop

Run until the target state is reached:

1. **Inspect status** with the script. Note the current state.
2. **If `new`**: invoke `vietnamese-first-grade-story-writer` to create `assets/stories/<story-slug>.md`. Then re-inspect status and continue.
3. **If `story_incomplete`**: fix the existing story file directly. Then re-inspect status and continue.
4. **If `story_ready`**: invoke `vietnamese-kids-story-illustrator` to prepare manifest and prompts. After it finishes, re-inspect status and continue — **do not stop here**.
5. **If `prompts_ready` or `media_partial`**: generate only missing media using the `vietnamese-kids-story-illustrator` image-generation protocol:
   - character images first (one per `characters[*].prompt_path` → `characters[*].output_path`)
   - then cover image (`cover.prompt_path` → `cover.output_path`)
   - then scene images (one per `scenes[*].prompt_path` → `scenes[*].output_path`)
   - Before generation, verify each prompt file is English only; if not, rewrite it in English first.
   - On Codex/OpenAI, use the native image generation tool from the prompt files and copy generated files into the exact output paths.
   - On Claude Code, use an AI image-generation provider such as `ai-multimodal` or `ai-artist`.
   - Do not create final story media with hand-written rendering code, Pillow, SVG, canvas, HTML/CSS screenshots, or placeholders. If no AI image-generation tool/provider is available, stop and report the missing setup.
   After all images are generated, re-inspect status and continue — **do not stop here**.
5a. **Audio generation (optional)**: after all media is generated, attempt to invoke `vietnamese-kids-story-audio-reader`:
   ```bash
   python3 skills/vietnamese-kids-story-audio-reader/scripts/generate-story-audio.py <slug>
   ```
   - If `edge-tts` is not installed or the command fails, skip silently and continue — audio is optional.
   - If successful, audio files are written to `assets/generated-story-audio/<slug>/`.
   - Do not block pipeline progress on audio generation failure.
6. **If `media_complete` and `render_html = true`**: invoke `kid-story-book-html-template` to render the final HTML. The render script automatically embeds audio paths for any MP3 files that exist. After it finishes, re-inspect status and continue — **do not stop here**.
7. **If `media_complete` and `render_html = false`**: the pipeline target is reached. Report final state and output paths — **HTML is intentionally skipped**.
8. **If `complete`**: the pipeline is done. Report final state and output paths.

**Never stop between steps.** After each sub-skill returns, immediately re-inspect the pipeline status and proceed to the next required step.

## Regeneration Rules

- Do not overwrite existing story, media, or HTML unless the user asks.
- If only some media is missing, generate only missing files.
- If story content changes after media exists, tell the user the media may be stale before regenerating.
- Cover images are required when the manifest contains `cover.output_path`.
- HTML rendering should preserve each section's original `Nội dung`; do not shorten story text for layout.

## Expected Outputs

```text
assets/stories/<story-slug>.md
assets/generated-story-images/<story-slug>/story-image-manifest.json
assets/generated-story-images/<story-slug>/cover/cover.png
assets/generated-story-images/<story-slug>/characters/*.png
assets/generated-story-images/<story-slug>/scenes/*.png
assets/generated-story-audio/<story-slug>/page-NN.mp3        ← optional
assets/generated-story-books/<story-slug>/index.html         ← optional (ask user if not requested)
```

## Status Script Output

The status script prints:

- detected title, slug, and paths
- current state
- story validation issues
- missing media files
- book HTML status
- recommended next actions

Use `--write-status` to save:

```text
assets/story-pipeline-status/<story-slug>.json
```

## Final Report

Report the previous state, actions taken, final state, output paths, and unresolved questions at the end if any.
