---
name: vietnamese-kids-story-audio-reader
description: Generate per-page Vietnamese MP3 narration files for rendered kid story books using Microsoft Edge neural TTS.
user-invocable: true
when_to_use: "Invoke to generate per-page Vietnamese MP3 audio files for a story, using Microsoft Edge neural TTS via edge-tts. Run after vietnamese-kids-story-illustrator so the manifest exists. Audio is optional — books work without it."
category: content
keywords: [vietnamese, story, audio, tts, mp3, reader, kids, edge-tts]
argument-hint: "[story-slug]"
allowed-tools: [Bash, Read, Write]
metadata:
  short-description: Generate Vietnamese TTS audio for story pages
---

# Vietnamese Kids Story Audio Reader

Generates one MP3 file per story page using Microsoft Edge neural TTS (`edge-tts`). Audio is optional in the pipeline — all books work normally without it. The HTML book only renders a speaker button when an audio file exists for that page.

## Prerequisites

```bash
pip install edge-tts
```

Requires internet at generation time. Playback of generated files is fully offline.

## Usage

```bash
# Generate audio for a story (skips existing files)
python3 skills/vietnamese-kids-story-audio-reader/scripts/generate-story-audio.py <story-slug>

# Overwrite existing files
python3 skills/vietnamese-kids-story-audio-reader/scripts/generate-story-audio.py <story-slug> --force

# Generate for all stories found in assets/generated-story-images/
python3 skills/vietnamese-kids-story-audio-reader/scripts/generate-story-audio.py --all
```

## Output Layout

```text
assets/generated-story-audio/<story-slug>/
├── page-00.mp3   ← cover (story title)
├── page-01.mp3   ← scene 1
├── page-02.mp3   ← scene 2
└── ...
```

Page index matches the page order in the rendered HTML book (cover = 0, scenes = 1-N).

## Voice Settings

- Voice: `vi-VN-HoaiMyNeural` — Microsoft Edge neural TTS, Vietnamese female
- Rate: `-10%` — slightly slower for grade-1 readers

## Pipeline Position

```
story-writer → illustrator → [audio-reader] → html-template
```

Audio reader runs **after** `vietnamese-kids-story-illustrator` (manifest must exist for scene texts) and **before** or **after** `kid-story-book-html-template`. If audio files exist when the HTML book is rendered, the render script embeds their paths into each page's data and the template shows a speaker button. If audio is generated after the book is rendered, re-run the HTML renderer to pick them up.

## After Generating Audio

Re-render the HTML book so audio paths are embedded:

```bash
python3 skills/kid-story-book-html-template/scripts/render-story-book-html.py \
  assets/generated-story-images/<story-slug>/story-image-manifest.json
```

Then refresh the stories manifest:

```bash
python3 web-app/scripts/generate-stories-manifest.py
```

## Notes

- Idempotent by default — skips pages whose MP3 already exists.
- If `edge-tts` is not installed, skip this step and continue the pipeline without audio.
- Cover page audio reads the story title aloud.
- Scene audio reads the exact `content` field from the image manifest.
