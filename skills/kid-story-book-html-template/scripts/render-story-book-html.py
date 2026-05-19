#!/usr/bin/env python3
"""Render a swipe-only kids story book HTML file from a manifest or pages JSON."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

from story_book_image_checks import dimension_warnings, enrich_image_sizes, image_warnings, is_web_url


ROOT = Path(__file__).resolve().parents[3]
SKILL_DIR = Path(__file__).resolve().parents[1]
TEMPLATE_PATH = SKILL_DIR / "assets" / "story-book-template.html"
DEFAULT_OUTPUT_ROOT = ROOT / "assets" / "generated-story-books"
MAX_STORY_PAGES = 9


def slug_from_path(path: Path) -> str:
    if path.name == "story-image-manifest.json":
        return path.parent.name
    return path.stem


def safe_slug(raw_slug: str) -> str:
    candidate = raw_slug.strip()
    if not candidate or "/" in candidate or "\\" in candidate or ".." in candidate.split("/"):
        raise ValueError("Story slug must be a plain folder name, not a path.")
    slug = re.sub(r"[^A-Za-z0-9_-]+", "-", candidate).strip("-").lower()
    if not slug:
        raise ValueError("Story slug must contain at least one letter or number.")
    return slug


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"{path} must contain a JSON object.")
    return data


def to_repo_relative(path: str | Path, output_path: Path, absolute: bool) -> str:
    raw_path = Path(path)
    if not raw_path.is_absolute():
        raw_path = ROOT / raw_path
    if absolute:
        return raw_path.resolve().as_posix()
    return os.path.relpath(raw_path.resolve(), output_path.parent.resolve())


def cover_from_manifest(data: dict[str, Any], title: str) -> list[dict[str, str]]:
    cover = data.get("cover")
    if not isinstance(cover, dict):
        return []
    image = str(cover.get("output_path", "")).strip()
    text = str(cover.get("text") or cover.get("content") or cover.get("phrase") or cover.get("title") or title).strip()
    if not image:
        return []
    return [{"image": image, "text": text, "kind": "cover", "label": "cover"}]


def pages_from_manifest(data: dict[str, Any], title: str) -> list[dict[str, str]]:
    scenes = data.get("scenes")
    if not isinstance(scenes, list):
        raise ValueError("Manifest input must contain a scenes array.")

    pages = cover_from_manifest(data, title)
    for scene in scenes:
        if not isinstance(scene, dict):
            continue
        image = str(scene.get("output_path", "")).strip()
        text = str(scene.get("content") or scene.get("text") or scene.get("phrase") or "").strip()
        if image and text:
            page_index = len([page for page in pages if page.get("kind") != "cover"]) + 1
            pages.append({"image": image, "text": text, "kind": "story", "label": f"page {page_index}"})
    return pages


def normalize_page_image(image: str, image_root: str | None) -> str:
    if image_root and image and not is_web_url(image) and not Path(image).is_absolute():
        return str(Path(image_root) / image)
    return image


def pages_from_story_json(data: dict[str, Any], image_root: str | None) -> list[dict[str, str]]:
    source_pages = data.get("pages")
    if not isinstance(source_pages, list):
        raise ValueError("Pages JSON input must contain a pages array.")

    pages: list[dict[str, str]] = []
    cover = data.get("cover")
    if isinstance(cover, dict):
        cover_image = str(cover.get("image", "")).strip()
        cover_text = str(cover.get("text") or cover.get("content") or cover.get("phrase") or cover.get("title") or data.get("title") or "").strip()
        if cover_image:
            pages.append(
                {
                    "image": normalize_page_image(cover_image, image_root),
                    "text": cover_text,
                    "kind": "cover",
                    "label": "cover",
                }
            )

    for index, page in enumerate(source_pages, start=1):
        if not isinstance(page, dict):
            continue
        image = str(page.get("image", "")).strip()
        text = str(page.get("text") or page.get("content") or page.get("phrase") or "").strip()
        if image and text:
            pages.append(
                {
                    "image": normalize_page_image(image, image_root),
                    "text": text,
                    "kind": str(page.get("kind") or "story"),
                    "label": f"page {index}",
                }
            )
        else:
            raise ValueError(f"Page {index} must include image and text.")
    return pages


def render(input_path: Path, output_path: Path | None, image_root: str | None, absolute: bool, allow_missing_images: bool) -> tuple[Path, list[str]]:
    data = load_json(input_path)
    slug = safe_slug(str(data.get("story_slug") or data.get("slug") or slug_from_path(input_path)))
    final_output = output_path or DEFAULT_OUTPUT_ROOT / slug / "index.html"

    title = str(data.get("title") or "Story Book").strip()
    pages = pages_from_manifest(data, title) if "scenes" in data else pages_from_story_json(data, image_root)
    story_page_count = len([page for page in pages if page.get("kind") != "cover"])

    if not pages:
        raise ValueError("No pages found.")
    if story_page_count > MAX_STORY_PAGES:
        raise ValueError(f"Story book template supports up to {MAX_STORY_PAGES} story pages plus one cover.")

    missing_image_warnings = image_warnings(ROOT, pages)
    if missing_image_warnings and not allow_missing_images:
        raise ValueError("Image check failed: " + "; ".join(missing_image_warnings))
    enrich_image_sizes(ROOT, pages)

    for page in pages:
        if not is_web_url(page["image"]):
            page["image"] = to_repo_relative(page["image"], final_output, absolute)

    warnings = missing_image_warnings + dimension_warnings(pages)

    story_data = json.dumps({"title": title, "pages": pages}, ensure_ascii=False, indent=2)

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    html = template.replace("{{STORY_DATA_JSON}}", story_data.replace("</", "<\\/"))

    final_output.parent.mkdir(parents=True, exist_ok=True)
    final_output.write_text(html, encoding="utf-8")
    return final_output, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="Story image manifest JSON or pages JSON.")
    parser.add_argument("--output", help="Output HTML path. Defaults to assets/generated-story-books/<slug>/index.html.")
    parser.add_argument("--image-root", help="Prefix for relative image names in pages JSON.")
    parser.add_argument("--allow-long-phrases", action="store_true", help="Deprecated; full story text is always preserved.")
    parser.add_argument("--allow-missing-images", action="store_true", help="Render even if local image files are not present yet.")
    parser.add_argument("--absolute-image-paths", action="store_true", help="Use absolute image paths in HTML.")
    args = parser.parse_args()

    try:
        output, warnings = render(Path(args.input), Path(args.output) if args.output else None, args.image_root, args.absolute_image_paths, args.allow_missing_images)
    except ValueError as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    print(f"Rendered: {output}")
    if warnings:
        print("Warnings:")
        for warning in warnings:
            print(f"- {warning}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
