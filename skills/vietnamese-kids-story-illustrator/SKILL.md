---
name: vietnamese-kids-story-illustrator
description: Generate cover art, character reference images, and section-by-section scene illustrations from one Vietnamese grade-1 kid story markdown file. Use for assets/stories/*.md files with YAML metadata characters and sections containing Bối cảnh/Nội dung.
user-invocable: true
when_to_use: "Invoke to generate cover, character reference, and scene images for a Vietnamese kids story markdown file."
category: content
keywords: [vietnamese, story, illustration, images, cover, characters, scenes, grade-1]
argument-hint: "[story-slug or path to story markdown]"
allowed-tools: [Bash, Read, Write]
metadata:
  short-description: Illustrate Vietnamese grade-1 story markdown
---

# Vietnamese Kids Story Illustrator

Use this skill when the user gives one story markdown file, usually from `assets/stories/`, and wants image assets for early-reader Vietnamese stories.

## Inputs

- One `.md` story file with YAML frontmatter.
- Expected metadata: `title`, `summary`, `reading_level`, `theme`, `characters`, `setting`, `paragraph_count`.
- Expected body sections: `### Đoạn N` with `**Bối cảnh:** ...` and `**Nội dung:** ...`.

## Output Layout

Default output root:

```text
assets/generated-story-images/<story-slug>/
├── story-image-manifest.json
├── cover/
│   ├── cover.png
│   └── prompts/
│       └── cover.md
├── characters/
│   ├── 01-<character-slug>.png
│   └── prompts/
│       └── 01-<character-slug>.md
└── scenes/
    ├── 01-doan-1.png
    └── prompts/
        └── 01-doan-1.md
```

Keep one separated folder per story. Never mix generated assets from different stories.

## Image Generation by Agent

Steps 3–5 below require image generation. The method differs by agent:

**On Codex (OpenAI):** Use the native image generation tool directly. Pass the full prompt text from each `.md` prompt file and save to the exact `output_path` from `story-image-manifest.json`.

**On Claude Code:** Claude cannot generate images natively. For every image in steps 3–5:
1. Read the prompt file content (e.g. `characters/prompts/01-an.md`).
2. Activate the `ai-multimodal` skill, passing the full prompt text and the exact `output_path` from `story-image-manifest.json` as the save location.
3. If `ai-multimodal` is unavailable, activate the `ai-artist` skill with `--skip` to bypass the validation interview, again saving to the exact `output_path`.
4. Never skip an image silently — report it as missing and stop if generation fails.

## Workflow

1. Read the story file to understand title, setting, characters, and all sections.
2. Prepare folders and prompt files:

```bash
python3 skills/vietnamese-kids-story-illustrator/scripts/prepare-story-image-assets.py assets/stories/<story>.md
```

Optional flags:

```bash
python3 skills/vietnamese-kids-story-illustrator/scripts/prepare-story-image-assets.py <story.md> --output-root assets/generated-story-images --style "warm watercolor picture book"
```

3. Generate character images first, one image per prompt in `characters/prompts/`.
   - Save each image to the exact `output_path` shown in `story-image-manifest.json`.
   - Each character image must contain exactly one character.
   - Use a simple clean background, no text, no labels, no extra people.
   - Make the character reusable for scenes: clear face, hair, outfit, colors, proportions.
   - **Claude Code:** follow "Image Generation by Agent" above for each character image.

4. Generate the cover image after all character images exist.
   - Save it to the exact `cover.output_path` shown in `story-image-manifest.json`.
   - Use all character reference images as visual references unless the prompt says otherwise.
   - Make it a first-page / cover illustration that captures the story title, summary, setting, and mood.
   - Keep it text-free: no rendered title, captions, speech bubbles, page numbers, watermarks, or labels. Add title text later in layout if needed.
   - **Claude Code:** follow "Image Generation by Agent" above for the cover image.

5. Generate scene images after the cover image exists.
   - One `### Đoạn N` section becomes one image.
   - Use the corresponding character image files as visual references whenever the scene prompt lists `characters_present`.
   - Preserve referenced characters as-is: same face, hairstyle, outfit, colors, age, and body shape.
   - If the image tool cannot accept image references, explicitly reuse the character prompt details and report that exact visual locking was limited.
   - Do not add Vietnamese text, captions, speech bubbles, page numbers, watermarks, or random extra characters.
   - **Claude Code:** follow "Image Generation by Agent" above for each scene image.

6. Verify outputs.
   - Confirm the cover output path exists.
   - Confirm every character output path exists.
   - Confirm every scene output path exists.
   - Check the cover reflects the whole story without adding text.
   - Check scenes roughly match `Bối cảnh` and `Nội dung`.
   - Regenerate any image with missing/extra characters, text artifacts, or character drift.

7. Final report.
   - List generated cover, character folder, and scene folder.
   - Mention any skipped/regenerated images.
   - End with unresolved questions, if any.

## Illustration Defaults

Use this default unless the user specifies another style:

```text
Vietnamese children's picture book illustration for grade-1 readers, warm natural colors,
soft watercolor and colored-pencil texture, gentle expressions, simple readable composition,
safe everyday Vietnamese environments, no scary mood, no text in image.
```

Cover format should be portrait by default. Scene format should be landscape by default. Character references can be square or portrait.

## Quality Rules

- Character prompts come only from story metadata plus conservative visual invention.
- Do not invent new named characters unless the story section clearly requires a background crowd.
- When a character description is sparse, create a stable appearance and keep it consistent across all scenes.
- For teachers or parents, make them visibly adult; for children, make them visibly grade-school age.
- Keep images suitable for Vietnamese class-1 reading material: calm, clear, concrete, and easy to understand.
- Avoid complex symbolism. The picture should help a child decode the paragraph.
