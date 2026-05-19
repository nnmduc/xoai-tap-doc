#!/usr/bin/env python3
"""Write one Vietnamese grade-1 story markdown file from structured JSON."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path


def slugify(value: str) -> str:
    value = value.replace("Đ", "D").replace("đ", "d")
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value.lower()).strip("-")
    return slug or "story"


def quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def require_string(data: dict, key: str) -> str:
    value = data.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Missing required string: {key}")
    return value.strip()


def require_string_list(data: dict, key: str) -> list[str]:
    value = data.get(key)
    if not isinstance(value, list) or not value:
        raise ValueError(f"Missing required non-empty list: {key}")
    items = [str(item).strip() for item in value if str(item).strip()]
    if not items:
        raise ValueError(f"List has no usable values: {key}")
    return items


def require_records(data: dict, key: str, fields: list[str]) -> list[dict[str, str]]:
    value = data.get(key)
    if not isinstance(value, list) or not value:
        raise ValueError(f"Missing required records: {key}")
    records = []
    for index, item in enumerate(value, start=1):
        if not isinstance(item, dict):
            raise ValueError(f"{key}[{index}] must be an object")
        record = {field: require_string(item, field) for field in fields}
        records.append(record)
    return records


def render_markdown(data: dict) -> str:
    title = require_string(data, "title")
    summary = require_string(data, "summary")
    reading_level = str(data.get("reading_level") or "Lớp 1").strip()
    themes = require_string_list(data, "theme")
    characters = require_records(data, "characters", ["name", "description"])
    setting = require_string(data, "setting")
    sections = require_records(data, "sections", ["setting", "content"])

    lines = [
        "---",
        f"title: {quote(title)}",
        f"summary: {quote(summary)}",
        f"reading_level: {quote(reading_level)}",
        "theme:",
    ]
    lines.extend(f"  - {quote(theme)}" for theme in themes)
    lines.append("characters:")
    for character in characters:
        lines.append(f"  - name: {quote(character['name'])}")
        lines.append(f"    description: {quote(character['description'])}")
    lines.extend(
        [
            f"setting: {quote(setting)}",
            f"paragraph_count: {len(sections)}",
            "---",
            "",
            f"# {title}",
            "",
            "## Nội dung các đoạn",
            "",
        ]
    )
    for index, section in enumerate(sections, start=1):
        lines.extend(
            [
                f"### Đoạn {index}",
                "",
                f"**Bối cảnh:** {section['setting']}",
                "",
                f"**Nội dung:** {section['content']}",
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


def load_json(input_path: str) -> dict:
    raw = sys.stdin.read() if input_path == "-" else Path(input_path).read_text(encoding="utf-8")
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise ValueError("Input JSON must be an object")
    return data


def main() -> None:
    parser = argparse.ArgumentParser(description="Write a formatted Vietnamese grade-1 story markdown file.")
    parser.add_argument("input_json", help="Story JSON file path, or - for stdin")
    parser.add_argument("--output-root", default="assets/stories", type=Path)
    parser.add_argument("--filename", help="Optional output filename")
    parser.add_argument("--force", action="store_true", help="Overwrite an existing file")
    args = parser.parse_args()

    data = load_json(args.input_json)
    title = require_string(data, "title")
    filename = args.filename or f"{slugify(title)}.md"
    if not filename.endswith(".md"):
        filename += ".md"
    output_path = args.output_root / filename
    if output_path.exists() and not args.force:
        raise SystemExit(f"Refusing to overwrite existing file: {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(render_markdown(data), encoding="utf-8")
    print(json.dumps({"output_path": str(output_path), "section_count": len(data["sections"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()

