# Design Guidelines — Xoai Tap Doc (Vietnamese Kids Story App)

## Overview

A cute, warm, child-safe story library for Vietnamese Lớp 1 readers (age 6–7).  
Style: **Claymorphism** — soft 3D, chunky, toy-like, bubbly. Energetic and safe.

---

## Color System

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#FFF8EE` | App background (warm cream) |
| `--color-surface` | `#FFFFFF` | Card surfaces |
| `--color-primary` | `#4A90D9` | Primary brand blue (Vietnamese kids preference) |
| `--color-primary-dark` | `#2C6FAB` | Hover/pressed primary |
| `--color-accent` | `#F97316` | CTA orange-red (Vietnamese warmth/energy) |
| `--color-accent-dark` | `#D95F0A` | Hover accent |
| `--color-success` | `#34C759` | Completion states |
| `--color-text-primary` | `#2D2416` | Headings — warm dark brown |
| `--color-text-body` | `#5C4B32` | Body text — warm brown |
| `--color-text-muted` | `#9C8468` | Labels, captions |
| `--color-border` | `#E8D5B0` | Card borders — warm tan |
| `--color-frame-wood` | `#8B5E3C` | Reader wooden frame border |
| `--color-frame-wood-light` | `#C4874A` | Reader frame highlight |
| `--color-shadow-warm` | `rgba(74, 144, 217, 0.25)` | Clay blue shadow |
| `--color-shadow-accent` | `rgba(249, 115, 22, 0.20)` | Clay orange shadow |

---

## Typography

| Token | Value | Usage |
|---|---|---|
| Font Heading | `Baloo 2` | Titles, headings (weights 600–800) |
| Font Body | `Comic Neue` | Story text, labels (weights 400–700) |
| Font UI | `Baloo 2` | Buttons, nav labels (weight 600) |

### Scale

| Name | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `--text-hero` | `32px` | 800 | 1.2 | App title |
| `--text-h1` | `24px` | 700 | 1.3 | Section heading |
| `--text-h2` | `20px` | 700 | 1.4 | Card title |
| `--text-body` | `16px` | 400 | 1.6 | Body / story text |
| `--text-label` | `14px` | 600 | 1.4 | Buttons, tags |
| `--text-caption` | `12px` | 400 | 1.5 | Metadata |

> Body minimum: 16px (avoids iOS auto-zoom). Vietnamese diacritics need sufficient line-height (1.5+).

---

## Spacing System

8dp grid:

| Token | Value | Use |
|---|---|---|
| `--space-1` | `4px` | Micro gap |
| `--space-2` | `8px` | Tight gap |
| `--space-3` | `12px` | Component gap |
| `--space-4` | `16px` | Section padding |
| `--space-5` | `24px` | Card padding |
| `--space-6` | `32px` | Section gap |
| `--space-8` | `48px` | Large section |
| `--space-10` | `64px` | Hero spacing |

---

## Claymorphism Effects

### Card Shadow (double clay shadow)
```css
box-shadow:
  inset -2px -2px 6px rgba(0,0,0,0.08),
  inset 1px 1px 4px rgba(255,255,255,0.6),
  4px 6px 16px rgba(74, 144, 217, 0.25),
  0 2px 4px rgba(0,0,0,0.08);
```

### Card Hover Shadow
```css
box-shadow:
  inset -2px -2px 8px rgba(0,0,0,0.10),
  inset 1px 1px 4px rgba(255,255,255,0.7),
  6px 10px 24px rgba(74, 144, 217, 0.35),
  0 4px 8px rgba(0,0,0,0.12);
```

### Border Radius

| Element | Radius |
|---|---|
| App container | `24px` |
| Book card | `20px` |
| Buttons | `16px` |
| Tags / chips | `100px` (pill) |
| Reader frame | `16px` |
| Icons | `12px` |

### Border
- Cards: `3px solid var(--color-border)` — warm tan
- Buttons: `3px solid var(--color-primary-dark)`
- Reader frame: `8px solid var(--color-frame-wood)`

---

## Touch Targets

- All interactive elements: **min 56×56px** (exceeds 44pt Apple HIG; safe for age 6–7 motor skills)
- Book card tap area: **full card** — no isolated small tap zones
- Back button: **56×56px** minimum hit area
- Spacing between interactive elements: ≥ 12px

---

## Animation Tokens

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | `150ms` | Micro feedback (press) |
| `--duration-normal` | `300ms` | Hover, state transitions |
| `--duration-slow` | `500ms` | Screen transitions |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Card entrance, button press |
| `--ease-out` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Slide-up transitions |
| `--stagger-delay` | `60ms` | Per-card entrance stagger |

### Framer Motion Specs
- Library card entrance: `{ opacity: 0→1, y: 30→0, scale: 0.9→1 }`, spring `{ stiffness: 300, damping: 24 }`
- Card hover: `{ scale: 1.04, y: -4 }`, `200ms ease-out`
- Card press: `{ scale: 0.96 }`, `150ms ease-out`
- Library → Reader: slide-up `{ y: '100%'→0 }`, `500ms ease-out`
- Reader back: slide-down `{ y: 0→'100%' }`, `400ms ease-in`

---

## Component Specs

### BookCard

```
┌─────────────────────┐
│                     │  ← cover image (aspect-ratio: 3/4)
│     [Cover.png]     │     object-fit: cover
│                     │     border-radius: 20px 20px 0 0
│                     │
├─────────────────────┤  ← 3px border bottom of image
│  Tên Truyện         │  ← Baloo 2 600 18px, 2 lines max, ellipsis
│  📚 Lớp 1           │  ← Comic Neue 400 13px, muted
└─────────────────────┘

Size: 100% width, 2-col grid (calc((100% - 16px) / 2))
Max card width: 200px (desktop)
Padding: 12px bottom, 10px sides
Clay shadow + 3px tan border
On hover: scale 1.04, y -4px, deeper shadow
On press: scale 0.96
Cursor: pointer
Transition: 200ms ease-out
```

### LibraryHeader

```
┌──────────────────────────────────────────────┐
│  ☀  Thư Viện Sách  ☀                        │
│     Chọn một cuốn sách để đọc nhé!           │
└──────────────────────────────────────────────┘

Background: linear-gradient(135deg, #4A90D9 0%, #5BA3E8 100%)
Text: white, Baloo 2
Subtitle: Comic Neue 400 14px, rgba(255,255,255,0.85)
Height: 120px
Border-radius: 0 0 24px 24px
```

### ReaderFrame

```
┌─ [←] Thư Viện   Tên Truyện ──────────────┐
│  ┌─────────────────────────────────────┐  │
│  │  [Wooden frame border 8px]          │  │
│  │  ┌───────────────────────────────┐  │  │
│  │  │                               │  │  │
│  │  │    <iframe src="...">         │  │  │
│  │  │                               │  │  │
│  │  └───────────────────────────────┘  │  │
│  └─────────────────────────────────────┘  │
└────────────────────────────────────────────┘

Top bar: 56px, background white, shadow subtle
Back button: 48×48px, border-radius 12px, clay shadow
Frame: border 8px solid #8B5E3C, border-radius 16px
Frame inner glow: box-shadow inset 0 0 16px rgba(139,94,60,0.2)
iframe: width 100%, height 100%, border none
```

### BackButton

```
┌────┐
│ ←  │  ← Lucide ArrowLeft icon, 24px
└────┘

Width: 48px, Height: 48px
Background: white
Border: 3px solid #E8D5B0
Border-radius: 12px
Clay shadow: 3px 4px 10px rgba(74, 144, 217, 0.2)
On hover: background #F0F7FF, border-color #4A90D9
On press: scale 0.94
```

---

## Screen Layouts

### Library Screen
```
[Header — gradient blue, 120px]
[Scroll area — padding 16px]
  [2-col book grid — gap 16px]
    [BookCard] [BookCard]
    [BookCard] [BookCard]
    ...
[Footer decoration — stars, 40px]
Background: #FFF8EE with subtle dot/cloud pattern
```

### Reader Screen (fullscreen overlay)
```
[Top bar — 56px white]
  [← Back]  [Book Title]
[Frame area — flex 1, padding 12px, bg #FFF8EE]
  [Wooden frame border]
    [iframe 100%x100%]
```

---

## Background Decoration

Library background: `#FFF8EE` with subtle SVG pattern — small clouds and stars at `opacity: 0.12`, `#4A90D9`.  
No heavy gradients that compete with covers.

---

## Accessibility

- All covers: `alt="Bìa sách: {title}"` 
- Back button: `aria-label="Quay lại thư viện"`
- Cards: `role="button"`, `tabIndex={0}`, `onKeyDown Enter/Space`
- Color contrast: all text pairs ≥ 4.5:1 against their backgrounds
- `prefers-reduced-motion`: disable stagger + spring, use `opacity` fade only
- Vietnamese language: `lang="vi"` on `<html>`

---

## Icons

Library: Lucide React (`BookOpen`, `Star`, `ArrowLeft`, `ChevronRight`)  
No emojis as structural icons. Decorative SVG clouds/stars inline only.

---

## Responsive

| Breakpoint | Grid cols | Card max-width | Header height |
|---|---|---|---|
| `< 480px` | 2 | 160px | 100px |
| `480–768px` | 2 | 200px | 120px |
| `768–1024px` | 3 | 220px | 140px |
| `> 1024px` | 4 | 200px | 160px |
