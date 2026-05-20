#!/usr/bin/env python3
"""Inspect Vietnamese kids story pipeline status."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from story_pipeline_status_core import ROOT, STORIES_DIR, inspect_one, write_status


def resolve_story_path(args: argparse.Namespace) -> tuple[Path | None, str | None]:
    if args.story:
        story_path = Path(args.story)
        if not story_path.is_absolute():
            story_path = ROOT / story_path
        return story_path, None
    if args.slug:
        return STORIES_DIR / f"{args.slug}.md", args.slug
    return None, None


def print_text(report: dict) -> None:
    story = report["story"]
    media = report["media"]
    audio = report.get("audio", {})
    book = report["book"]
    print(f"State: {report['state']}")
    print(f"Title: {story.get('title') or '(unknown)'}")
    print(f"Slug: {story.get('slug') or '(unknown)'}")
    print(f"Story: {story.get('path') or '(missing)'}")
    print(f"Media manifest: {media.get('manifest_path') or '(missing)'}")
    print(f"Media: {media.get('existing_count', 0)}/{media.get('expected_count', 0)} files present")
    audio_label = f"{audio.get('count', 0)} MP3 file(s)" if audio.get("exists") else "none (optional)"
    print(f"Audio: {audio_label}")
    print(f"HTML book: {book.get('path') or '(unknown)'} ({'exists' if book.get('exists') else 'missing'})")
    if story.get("issues"):
        print("Story issues:")
        for issue in story["issues"]:
            print(f"- {issue}")
    if media.get("missing"):
        print("Missing media:")
        for item in media["missing"]:
            print(f"- {item['kind']}: {item['path']}")
    print("Next actions:")
    for action in report["next_actions"]:
        print(f"- {action}")


def inspect_all() -> list[dict]:
    return [inspect_one(path, None) for path in sorted(STORIES_DIR.glob("*.md"))]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--story", help="Story markdown path.")
    parser.add_argument("--slug", help="Story slug.")
    parser.add_argument("--all", action="store_true", help="Inspect all story markdown files.")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of text.")
    parser.add_argument("--write-status", action="store_true", help="Write status JSON under assets/story-pipeline-status.")
    args = parser.parse_args()

    reports = inspect_all() if args.all else [inspect_one(*resolve_story_path(args))]
    if args.write_status:
        for report in reports:
            report["status_path"] = str(write_status(report))

    if args.json:
        print(json.dumps(reports if args.all else reports[0], ensure_ascii=False, indent=2))
        return 0

    for index, report in enumerate(reports):
        if index:
            print("")
        print_text(report)
        if report.get("status_path"):
            print(f"Status file: {report['status_path']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
