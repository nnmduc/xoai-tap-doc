"""Image path, dimension, and consistency helpers for story book rendering."""

from __future__ import annotations

import struct
from pathlib import Path


def is_web_url(value: str) -> bool:
    return value.lower().startswith(("http://", "https://", "data:"))


def local_image_path(root: Path, value: str) -> Path | None:
    if is_web_url(value):
        return None
    path = Path(value)
    return path if path.is_absolute() else root / path


def image_size(path: Path) -> tuple[int, int] | None:
    try:
        with path.open("rb") as handle:
            header = handle.read(32)
    except OSError:
        return None
    if header.startswith(b"\x89PNG\r\n\x1a\n") and len(header) >= 24:
        return struct.unpack(">II", header[16:24])
    if header[:3] != b"\xff\xd8\xff":
        return None
    with path.open("rb") as handle:
        handle.read(2)
        while True:
            marker = handle.read(2)
            if len(marker) < 2:
                return None
            while marker[0] != 0xFF:
                marker = marker[1:] + handle.read(1)
            length_bytes = handle.read(2)
            if len(length_bytes) < 2:
                return None
            length = struct.unpack(">H", length_bytes)[0]
            if 0xC0 <= marker[1] <= 0xC3:
                data = handle.read(5)
                return struct.unpack(">HH", data[1:5])[::-1]
            handle.seek(length - 2, 1)


def enrich_image_sizes(root: Path, pages: list[dict]) -> None:
    for page in pages:
        path = local_image_path(root, page["image"])
        if not path or not path.exists():
            continue
        size = image_size(path)
        if size:
            page["width"], page["height"] = size


def image_warnings(root: Path, pages: list[dict]) -> list[str]:
    warnings: list[str] = []
    for index, page in enumerate(pages, start=1):
        raw_path = local_image_path(root, page["image"])
        if raw_path and not raw_path.exists():
            label = page.get("label") or f"page {index}"
            warnings.append(f"{label}: image not found at {page['image']}")
    return warnings


def dimension_warnings(pages: list[dict], tolerance: int = 2) -> list[str]:
    scene_sizes = [
        (int(page["width"]), int(page["height"]))
        for page in pages
        if page.get("kind") != "cover" and page.get("width") and page.get("height")
    ]
    warnings: list[str] = []
    if scene_sizes:
        widths = [width for width, _ in scene_sizes]
        heights = [height for _, height in scene_sizes]
        if max(widths) - min(widths) > tolerance or max(heights) - min(heights) > tolerance:
            sizes = ", ".join(f"{width}x{height}" for width, height in sorted(set(scene_sizes)))
            warnings.append(f"scene images have inconsistent sizes: {sizes}")
    for page in pages:
        if page.get("kind") == "cover" and page.get("width") and page.get("height"):
            if int(page["width"]) >= int(page["height"]):
                warnings.append(f"cover image should be portrait, found {page['width']}x{page['height']}")
    return warnings
