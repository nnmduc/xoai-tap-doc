---
name: vietnamese-first-grade-story-writer
description: Create Vietnamese kid story markdown files in assets/stories for multiple reading levels — Mầm non, Lớp 1, or Lớp 2.
user-invocable: true
when_to_use: "Invoke to create a new Vietnamese story markdown file in assets/stories for a chosen grade level."
category: content
keywords: [vietnamese, story, writing, grade, mam-non, lop-1, lop-2, markdown, kids]
argument-hint: "[story topic, title, or theme]"
allowed-tools: [Bash, Read, Write]
metadata:
  short-description: Write Vietnamese kids story markdown (multi-level)
---

# Vietnamese Kids Story Writer

Use this skill when the user wants to create a new Vietnamese story file in `assets/stories`.

## Grade Level Specs

| Khối lớp | `reading_level` value | Sections | Words per `Nội dung` |
|-----------|----------------------|----------|----------------------|
| Mầm non   | `"Mầm non"`          | 4 – 6    | 1 – 2 words only     |
| Lớp 1     | `"Lớp 1"`            | 6 – 8    | < 20 words           |
| Lớp 2     | `"Lớp 2"`            | 10 – 12  | 20 – 30 words        |

Default level is **Lớp 1** unless the user specifies otherwise.

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

## Ask Before Writing

If missing, ask concise questions before generating:

- Grade level (Mầm non / Lớp 1 / Lớp 2), or confirm default Lớp 1.
- Main topic/theme or lesson.
- Main character names, or permission to invent them.
- Main setting.
- Any words/sounds/letters the child should practice (Lớp 1/2 only).

Do not ask if the user already gave enough direction. Make reasonable defaults for minor details.

## Story Rules — All Levels

- Write in Vietnamese.
- Keep vocabulary simple, kind, safe, and easy to visualize.
- Use 2-3 named characters by default.
- Mention only characters listed in metadata, unless a generic crowd is needed.
- Keep each `Bối cảnh` short, concrete, and drawable (one scene image).
- Avoid scary, violent, sarcastic, abstract, or adult topics.
- No markdown outside the established format.

## Per-Level Story Rules

### Mầm non
- Each `Nội dung` is **1–2 words only** (e.g. `"Con mèo."` or `"Nhảy lên!"`)
- No sentences — single noun phrases or exclamations.
- 4–6 sections total.

### Lớp 1
- Each `Nội dung` is **fewer than 20 words**.
- Prefer 1–2 short concrete sentences per section.
- 6–8 sections total.
- Avoid long dialogue. Short quoted lines are okay.

### Lớp 2
- Each `Nội dung` is **20–30 words**.
- 3–5 sentences per section; slightly more varied vocabulary allowed.
- 10–12 sections total.
- Short dialogue lines are okay.

## Workflow

1. Read existing files in `assets/stories` if needed to match tone and structure.
2. Ask the missing questions from **Ask Before Writing**.
3. Draft the story as structured JSON using the chosen grade level:

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
   - YAML frontmatter exists with correct `reading_level`.
   - `paragraph_count` equals the number of sections.
   - Section count matches the level spec.
   - Word count per `Nội dung` matches the level spec.
   - Headings and labels match the existing format.

## Filename Rules

- Use kebab-case slug from the Vietnamese title.
- Convert `Đ/đ` to `d`.
- Example: `Đường Sao Trên Sân Thượng` -> `duong-sao-tren-san-thuong.md`.

## Final Report

Report the saved file path and summarize title, grade level, character count, and section count. End with unresolved questions, if any.
