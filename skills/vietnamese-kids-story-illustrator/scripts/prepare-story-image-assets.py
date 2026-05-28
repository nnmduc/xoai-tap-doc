#!/usr/bin/env python3
"""Prepare image-generation prompts for one Vietnamese kid story markdown file."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path


DEFAULT_STYLE = (
    "Vietnamese children's picture book illustration for grade-1 readers, "
    "warm natural colors, soft watercolor and colored-pencil texture, gentle "
    "expressions, simple readable composition, safe everyday Vietnamese "
    "environments, no scary mood, no text in image."
)

PROMPT_LANGUAGE_RULE = (
    "Prompt language: English only. Translate every Vietnamese story detail into "
    "natural English before using it in the image request. Preserve Vietnamese "
    "character names only as proper nouns, and do not render any text in the image."
)


@dataclass
class Character:
    name: str
    description: str


@dataclass
class Section:
    number: int
    setting: str
    content: str


def slugify(value: str) -> str:
    value = value.replace("Đ", "D").replace("đ", "d")
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value.lower()).strip("-")
    return slug or "story"


def extract_frontmatter(markdown: str) -> tuple[str, str]:
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n", markdown, re.DOTALL)
    if not match:
        raise ValueError("Story file must start with YAML frontmatter delimited by ---")
    return match.group(1), markdown[match.end() :]


def parse_scalar(line: str) -> tuple[str, str] | None:
    match = re.match(r"^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$", line)
    if not match:
        return None
    value = match.group(2).strip()
    if len(value) >= 2 and value[0] == value[-1] == '"':
        value = value[1:-1]
    return match.group(1), value


def parse_frontmatter(frontmatter: str) -> dict:
    data: dict[str, object] = {}
    lines = frontmatter.splitlines()
    index = 0
    while index < len(lines):
        line = lines[index]
        parsed = parse_scalar(line)
        if not parsed:
            index += 1
            continue
        key, value = parsed
        if value:
            data[key] = value
            index += 1
            continue
        if key == "theme":
            items: list[str] = []
            index += 1
            while index < len(lines) and lines[index].startswith("  - "):
                item = lines[index][4:].strip().strip('"')
                items.append(item)
                index += 1
            data[key] = items
            continue
        if key == "characters":
            characters: list[dict[str, str]] = []
            index += 1
            current: dict[str, str] | None = None
            while index < len(lines) and (lines[index].startswith("  - ") or lines[index].startswith("    ")):
                item_line = lines[index]
                if item_line.startswith("  - "):
                    if current:
                        characters.append(current)
                    current = {}
                    item_line = "    " + item_line[4:]
                if current is not None:
                    stripped = item_line.strip()
                    field = parse_scalar(stripped)
                    if field:
                        current[field[0]] = field[1]
                index += 1
            if current:
                characters.append(current)
            data[key] = characters
            continue
        data[key] = value
        index += 1
    return data


def parse_sections(body: str) -> list[Section]:
    sections: list[Section] = []
    pattern = re.compile(r"^###\s+Đoạn\s+(\d+)\s*$([\s\S]*?)(?=^###\s+Đoạn\s+\d+\s*$|\Z)", re.MULTILINE)
    for match in pattern.finditer(body):
        number = int(match.group(1))
        block = match.group(2)
        setting_match = re.search(r"\*\*Bối cảnh:\*\*\s*(.+)", block)
        content_match = re.search(r"\*\*Nội dung:\*\*\s*(.+)", block)
        if not setting_match or not content_match:
            raise ValueError(f"Đoạn {number} must include Bối cảnh and Nội dung")
        sections.append(
            Section(
                number=number,
                setting=setting_match.group(1).strip(),
                content=content_match.group(1).strip(),
            )
        )
    if not sections:
        raise ValueError("No story sections found. Expected headings like: ### Đoạn 1")
    return sections


def get_grade_info(reading_level: str) -> dict[str, str]:
    normalized = reading_level.strip().lower()
    if "mầm non" in normalized or "mam non" in normalized:
        return {
            "grade_en": "kindergarten",
            "class_en": "kindergarten",
            "age_desc": "preschool-age child (around 4-5 years old)"
        }
    
    # Try to find a digit
    match = re.search(r'\d+', normalized)
    if match:
        grade_num = match.group(0)
        age = 5 + int(grade_num) # grade 1 is 6, grade 5 is 10
        return {
            "grade_en": f"grade-{grade_num}",
            "class_en": f"class-{grade_num}",
            "age_desc": f"primary-school-age child (around {age} years old)"
        }
    
    # Fallback to Grade 1
    return {
        "grade_en": "grade-1",
        "class_en": "class-1",
        "age_desc": "primary-school-age child (around 6 years old)"
    }


def is_child_character(character_description: str) -> bool:
    desc = character_description.lower()
    adult_keywords = [
        "mẹ", "bố", "cha", "bà", "ông", "thầy", "cô", "bác", "chú", "dì", "cậu", "mợ",
        "người lớn", "adult", "parent", "teacher", "elder", "old man", "old woman"
    ]
    if any(keyword in desc for keyword in adult_keywords):
        return False
    child_keywords = [
        "bé", "bạn nhỏ", "em bé", "em nhỏ", "con nít", "trẻ em", "child", "kid",
        "little girl", "little boy", "son", "daughter"
    ]
    if any(keyword in desc for keyword in child_keywords):
        return True
    return True


def character_prompt(title: str, character: Character, style: str, grade_info: dict[str, str]) -> str:
    if is_child_character(character.description):
        age_desc = f"Vietnamese {grade_info['age_desc']}"
    else:
        age_desc = "Vietnamese adult"

    return f"""Character Reference Sheet for a Vietnamese children's book.

{PROMPT_LANGUAGE_RULE}

Subject: A single character named {character.name}. {character.description}.
Appearance: {age_desc}.
Composition: Full-body or three-quarter view, standing, facing the viewer, clean and clear depiction.
Setting: Isolated on a plain, simple, solid light background.
Style: {style}
Format: A clean, high-quality, professional character design reference sheet. No text, letters, labels, speech bubbles, page numbers, or watermarks in the image.
"""


def cover_prompt(
    title: str,
    summary: str,
    story_setting: str,
    themes: list[str],
    all_character_refs: list[dict[str, str]],
    style: str,
    grade_info: dict[str, str],
) -> str:
    character_details = "\n".join(
        f"- {ref['name']}: {ref['description']}"
        for ref in all_character_refs
    )
    theme_text = ", ".join(themes) if themes else "gentle discovery"
    return f"""Book Cover Illustration for a Vietnamese children's book.

{PROMPT_LANGUAGE_RULE}

Story Title: {title}
Story Theme & Mood: {theme_text}. {summary}
Setting: {story_setting}
Characters to Include:
{character_details}

Composition: A portrait orientation cover illustration capturing the essence and mood of the story. Leave some plain, uncluttered open space near the top of the image for the title text to be added later by layout.
Style: {style}
Format: A clean, textless, first-page book cover illustration. No written title, letters, captions, speech bubbles, page numbers, or watermarks.
"""


def detect_characters(section: Section, characters: list[Character]) -> list[str]:
    text = f"{section.setting} {section.content}".lower()
    present = []
    for character in characters:
        if character.name.lower() in text:
            present.append(character.name)
    child_names = [
        character.name
        for character in characters
        if any(keyword in character.description.lower() for keyword in ["bạn nhỏ", "em trai", "em gái"])
    ]
    if "hai bạn" in text and len(child_names) >= 2:
        present.extend(child_names[:2])
    if "ba người" in text and len(characters) == 3:
        present.extend(character.name for character in characters)
    if "ba mẹ con" in text and len(characters) == 3:
        present.extend(character.name for character in characters)
    present = list(dict.fromkeys(present))
    return present


def scene_prompt(
    title: str,
    section: Section,
    detected_refs: list[dict[str, str]],
    all_character_refs: list[dict[str, str]],
    style: str,
    grade_info: dict[str, str],
) -> str:
    detected_details = "\n".join(
        f"- {ref['name']}: {ref['description']}"
        for ref in detected_refs
    )
    if not detected_details:
        detected_details = "- Only characters clearly implied by the section context."

    all_details = "\n".join(
        f"- {ref['name']}: {ref['description']}"
        for ref in all_character_refs
    )

    return f"""Scene Illustration for a Vietnamese children's book.

{PROMPT_LANGUAGE_RULE}

Story Title: {title}
Scene Environment: {section.setting}
Scene Action and Story Content: {section.content}
Characters Present in this Scene:
{detected_details}

All Characters in the Story (for visual reference if implied by the scene):
{all_details}

Composition: A landscape orientation scene illustration showing the characters engaged in the action described. The composition should be clear, simple, and easy to read for young readers.
Style: {style}
Format: A clean, textless book page illustration. No letters, words, captions, speech bubbles, page numbers, or watermarks.
"""


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def build_manifest(story_path: Path, output_root: Path, style: str) -> dict:
    markdown = story_path.read_text(encoding="utf-8")
    frontmatter, body = extract_frontmatter(markdown)
    metadata = parse_frontmatter(frontmatter)
    title = str(metadata.get("title") or story_path.stem)
    summary = str(metadata.get("summary") or "")
    story_setting = str(metadata.get("setting") or "")
    themes = metadata.get("theme") if isinstance(metadata.get("theme"), list) else []
    reading_level = str(metadata.get("reading_level") or "Lớp 1").strip()
    grade_info = get_grade_info(reading_level)

    # Dynamically adjust style if it contains "grade-1"
    style = style.replace("grade-1", grade_info["grade_en"])

    story_slug = slugify(title)
    story_dir = output_root / story_slug

    raw_characters = metadata.get("characters")
    if not isinstance(raw_characters, list) or not raw_characters:
        raise ValueError("Frontmatter must include at least one character")
    characters = [
        Character(name=str(item.get("name", "")).strip(), description=str(item.get("description", "")).strip())
        for item in raw_characters
        if isinstance(item, dict) and item.get("name")
    ]
    sections = parse_sections(body)

    manifest = {
        "story_path": str(story_path),
        "title": title,
        "story_slug": story_slug,
        "reading_level": reading_level,
        "style": style,
        "output_dir": str(story_dir),
        "characters": [],
        "scenes": [],
    }

    character_outputs: dict[str, dict[str, str]] = {}
    for index, character in enumerate(characters, start=1):
        character_slug = slugify(character.name)
        output_path = story_dir / "characters" / f"{index:02d}-{character_slug}.png"
        prompt_path = story_dir / "characters" / "prompts" / f"{index:02d}-{character_slug}.md"
        write_text(prompt_path, character_prompt(title, character, style, grade_info))
        record = {
            "index": index,
            "name": character.name,
            "description": character.description,
            "prompt_path": str(prompt_path),
            "output_path": str(output_path),
        }
        manifest["characters"].append(record)
        character_outputs[character.name] = record

    cover_output_path = story_dir / "cover" / "cover.png"
    cover_prompt_path = story_dir / "cover" / "prompts" / "cover.md"
    write_text(
        cover_prompt_path,
        cover_prompt(title, summary, story_setting, [str(theme) for theme in themes], list(character_outputs.values()), style, grade_info),
    )
    manifest["cover"] = {
        "prompt_path": str(cover_prompt_path),
        "output_path": str(cover_output_path),
    }

    for section in sections:
        present_names = detect_characters(section, characters)
        refs = [character_outputs[name] for name in present_names]
        output_path = story_dir / "scenes" / f"{section.number:02d}-doan-{section.number}.png"
        prompt_path = story_dir / "scenes" / "prompts" / f"{section.number:02d}-doan-{section.number}.md"
        write_text(prompt_path, scene_prompt(title, section, refs, list(character_outputs.values()), style, grade_info))
        manifest["scenes"].append(
            {
                "index": section.number,
                "setting": section.setting,
                "content": section.content,
                "characters_present": present_names,
                "prompt_path": str(prompt_path),
                "output_path": str(output_path),
            }
        )

    story_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = story_dir / "story-image-manifest.json"
    manifest["manifest_path"] = str(manifest_path)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare image prompts for a Vietnamese kid story markdown file.")
    parser.add_argument("story_file", type=Path, help="Path to one story markdown file")
    parser.add_argument("--output-root", type=Path, default=Path("assets/generated-story-images"))
    parser.add_argument("--style", default=DEFAULT_STYLE)
    args = parser.parse_args()

    if not args.story_file.exists():
        raise SystemExit(f"Story file not found: {args.story_file}")
    manifest = build_manifest(args.story_file, args.output_root, args.style)
    print(json.dumps({
        "manifest_path": manifest["manifest_path"],
        "cover_path": manifest["cover"]["output_path"],
        "character_count": len(manifest["characters"]),
        "scene_count": len(manifest["scenes"]),
        "output_dir": manifest["output_dir"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
