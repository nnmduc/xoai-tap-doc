---
name: vietnamese-first-grade-story-writer
description: Create Vietnamese grade-1 kid story markdown files in assets/stories using the existing story format with YAML metadata, characters, and Đoạn sections.
user-invocable: true
when_to_use: "Invoke to create a new Vietnamese Lớp 1 story markdown file in assets/stories."
category: content
keywords: [vietnamese, story, writing, grade-1, lop-1, markdown, kids]
argument-hint: "[story topic, title, or theme]"
allowed-tools: [Bash, Read, Write]
metadata:
  short-description: Write Vietnamese class-1 story markdown
---

# Vietnamese First-Grade Story Writer

Use this skill when the user wants to create a new Vietnamese story file for class-1 reading practice in `assets/stories`.

## Required Format

Every story must match the current structure:

```markdown
---
title: "..."
summary: "..."
reading_level: "Lớp 1"
theme:
  - "..."
characters:
  - name: "..."
    description: "..."
setting: "..."
paragraph_count: 7
---

# ...

## Nội dung các đoạn

### Đoạn 1

**Bối cảnh:** ...

**Nội dung:** ...
```

Default paragraph count is 7 unless the user asks otherwise.

## Ask Before Writing

If missing, ask concise questions before generating:

- Main topic/theme or lesson.
- Main character names, or permission to invent them.
- Main setting.
- Desired paragraph count if not 7.
- Any words/sounds/letters the child should practice.

Do not ask if the user already gave enough direction. Make reasonable defaults for minor details.

## Story Rules

- Write in Vietnamese for `Lớp 1`.
- Use short concrete sentences. Prefer 1-2 sentences per section.
- Keep vocabulary simple, kind, safe, and easy to visualize.
- Use 2-3 named characters by default.
- Mention only characters listed in metadata, unless a generic crowd is needed.
- Keep each `Bối cảnh` short, concrete, and drawable.
- Keep each `Nội dung` aligned to one scene image later.
- Avoid scary, violent, sarcastic, abstract, or adult topics.
- Avoid long dialogue. Short quoted lines are okay.
- No markdown outside the established format.

## Workflow

1. Read existing files in `assets/stories` if needed to match tone and structure.
2. Ask the missing questions from **Ask Before Writing**.
3. Draft the story as structured JSON:

```json
{
  "title": "Tên Truyện",
  "summary": "Một câu tóm tắt ngắn.",
  "reading_level": "Lớp 1",
  "theme": ["phiêu lưu", "khám phá"],
  "characters": [
    {"name": "An", "description": "Bạn nhỏ tò mò."}
  ],
  "setting": "Sân trường buổi sáng.",
  "sections": [
    {"setting": "Cổng trường.", "content": "An thấy một chiếc lá vàng."}
  ]
}
```

4. Write the markdown with the formatter:

```bash
python3 -B skills/vietnamese-first-grade-story-writer/scripts/write-story-markdown.py /path/to/story.json
```

Use `-` as the input path to read JSON from stdin.

5. Save to `assets/stories/<story-slug>.md` unless the user gives a specific filename.
6. Read the saved file once and verify:
   - YAML frontmatter exists.
   - `paragraph_count` equals the number of sections.
   - Headings and labels match the existing format.
   - Story stays class-1 appropriate.

## Filename Rules

- Use kebab-case slug from the Vietnamese title.
- Convert `Đ/đ` to `d`.
- Example: `Đường Sao Trên Sân Thượng` -> `duong-sao-tren-san-thuong.md`.

## Final Report

Report the saved file path and summarize title, character count, and section count. End with unresolved questions, if any.

