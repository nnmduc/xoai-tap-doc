# CLAUDE.md

Project-specific instructions for Claude Code and compatible coding agents.

## Required Context

Before implementation, read:

1. `README.md`
2. `AGENTS.md`
3. Relevant `skills/*/SKILL.md`

If `README.md` is missing in a future checkout, inspect the repository structure before writing it.

## Development Principles

- Keep changes small and direct.
- Prefer KISS, YAGNI, and DRY.
- Preserve existing story and asset paths.
- Do not create duplicate "enhanced" versions of existing files.
- Use kebab-case for new filenames.
- Keep code scripts focused and dependency-light.

## Main Workflow

For story-package work:

1. Inspect pipeline status.
2. Choose the next action from the reported state.
3. Modify only the files needed for that state.
4. Validate with the status inspector.
5. Report final state and paths.

Status command:

```bash
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --slug <story-slug>
```

All-story status command:

```bash
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --all
```

## Story Standards

Stories must be suitable for Vietnamese `Lớp 1` readers:

- short concrete sentences
- kind and safe situations
- simple visual scenes
- 2-3 named characters by default
- no scary, violent, sarcastic, abstract, or adult topics

Each story section must keep `Bối cảnh` drawable and `Nội dung` aligned to one image.

## Image Standards

- Character references: one character per image.
- Cover: portrait, text-free, captures whole story.
- Scenes: one image per `Đoạn`, text-free, no extra named characters.
- Keep character appearance consistent across cover and scenes.
- Generate only missing images unless the user asks for regeneration.

## HTML Book Standards

Rendered books live at:

```text
assets/generated-story-books/<story-slug>/index.html
```

Requirements:

- cover first when present
- one page visible at a time
- original story text preserved exactly
- tap/click/scroll/selection/context menu blocked
- horizontal swipe is the only page-changing interaction
- images use contain-style fitting, not cropping

## Validation

After changing scripts:

```bash
python3 -m py_compile $(find skills -path '*/scripts/*.py' -type f)
```

After changing story pipeline behavior:

```bash
python3 skills/vietnamese-kids-story-orchestrator/scripts/inspect-story-pipeline-status.py --all
```

After rendering a book, open the generated `index.html` and verify the page flow manually.

## Documentation

Update root guidance files when workflow, commands, layout, or output expectations change:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`

Use concise reports. Put unresolved questions at the end, if any.

