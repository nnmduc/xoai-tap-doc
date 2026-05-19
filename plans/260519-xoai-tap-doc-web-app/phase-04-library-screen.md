---
phase: 4
title: "Library Screen"
status: pending
priority: P1
effort: "1h"
dependencies: [3]
---

# Phase 4: Library Screen

## Overview
Build the `LibraryScreen` component: gradient header, responsive book card grid with Framer Motion stagger entrance, claymorphism card style, hover/press animations. Reference wireframe: `docs/wireframe/library-screen.html`.

## Requirements
- Functional: Displays all stories from manifest; clicking a card navigates to reader
- Non-functional: Stagger entrance animation; responsive 2→3→4 col grid; min 56px touch targets; `prefers-reduced-motion` respected

## Architecture
```
src/
├── components/
│   ├── library/
│   │   ├── LibraryScreen.tsx       ← main screen component
│   │   ├── LibraryHeader.tsx       ← gradient header with title + badge
│   │   └── BookCard.tsx            ← individual book card with clay animations
│   └── shared/
│       └── BookCoverImage.tsx      ← img with onerror placeholder fallback
```

### Component Props
```ts
// LibraryScreen
interface LibraryScreenProps {
  stories: StoryEntry[]
  onSelectStory: (story: StoryEntry) => void
}

// BookCard
interface BookCardProps {
  story: StoryEntry
  onClick: () => void
  index: number  // for stagger delay
}
```

### Animation Spec (Framer Motion)
```ts
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
}
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.90 },
  show:   { opacity: 1, y: 0,  scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 } }
}
```

## Related Code Files
- Create: `web-app/src/components/library/LibraryScreen.tsx`
- Create: `web-app/src/components/library/LibraryHeader.tsx`
- Create: `web-app/src/components/library/BookCard.tsx`
- Create: `web-app/src/components/shared/BookCoverImage.tsx`

## Implementation Steps

1. **`BookCoverImage.tsx`** — img with inline placeholder fallback (no separate component needed):
   ```tsx
   interface Props { src: string; alt: string; className?: string }
   export function BookCoverImage({ src, alt, className }: Props) {
     const [error, setError] = useState(false)
     if (error) {
       return (
         <div className="w-full h-full flex flex-col items-center justify-center gap-2
                         bg-gradient-to-br from-blue-100 to-blue-200">
           <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
             <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
           </svg>
           <span className="font-heading text-[11px] font-semibold text-blue-400">
             Đang tải...
           </span>
         </div>
       )
     }
     return (
       <img src={src} alt={alt} className={className} onError={() => setError(true)} />
     )
   }
   ```

2. **`LibraryHeader.tsx`** — gradient blue header:
   - Background: `bg-gradient-to-br from-[#4A90D9] to-[#67B8F5]`
   - `rounded-b-[28px]`, `shadow-lg`
   - Title: "Thư Viện Sách" in `font-heading font-extrabold text-white text-[28px]`
   - Subtitle: "Chọn một cuốn sách để đọc nhé!" in `font-body text-white/90 text-sm`
   - Badge: story count pill with book icon, `bg-white/20 rounded-full px-3 py-1`
   - Decorative cloud divs: `bg-white/20 rounded-full` absolutely positioned

3. **`BookCard.tsx`** — claymorphism card with Framer Motion:
   ```tsx
   import { motion } from 'framer-motion'

   export function BookCard({ story, onClick, index }: BookCardProps) {
     return (
       <motion.div
         variants={cardVariants}
         whileHover={{ y: -6, scale: 1.03 }}
         whileTap={{ scale: 0.96 }}
         onClick={onClick}
         role="button"
         tabIndex={0}
         aria-label={`Đọc truyện ${story.title}`}
         onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
         className="bg-white rounded-card border-[3px] border-brand-border shadow-clay
                    cursor-pointer overflow-hidden flex flex-col select-none"
         transition={{ type: 'spring', stiffness: 300, damping: 20 }}
       >
         <div className="relative aspect-[3/4] overflow-hidden bg-blue-50">
           <BookCoverImage
             src={story.coverPath}
             alt={`Bìa sách: ${story.title}`}
             className="w-full h-full object-cover"
           />
           {/* "Đọc ngay!" overlay on hover — use group-hover via parent group class */}
           {!story.hasHtmlBook && (
             <span className="absolute top-2 right-2 bg-brand-accent/90 text-white
                              text-[10px] font-heading font-bold px-2 py-0.5 rounded-full
                              border-2 border-white/50">
               Sắp có
             </span>
           )}
         </div>
         <div className="px-3 pb-3 pt-2 border-t-2 border-brand-border">
           <p className="font-heading font-bold text-[15px] text-brand-text leading-snug
                         line-clamp-2 mb-1">
             {story.title}
           </p>
           <span className="inline-flex items-center gap-1 bg-brand-primary/10
                            border border-brand-primary/20 rounded-full px-2 py-0.5
                            font-body text-[11px] font-bold text-brand-primary-dark">
             ★ Lớp 1
           </span>
         </div>
       </motion.div>
     )
   }
   ```

4. **`LibraryScreen.tsx`** — grid with Framer Motion container:
   ```tsx
   import { motion } from 'framer-motion'

   export function LibraryScreen({ stories, onSelectStory }: LibraryScreenProps) {
     const prefersReducedMotion = useReducedMotion()  // framer-motion hook
     return (
       <div className="flex flex-col min-h-screen bg-brand-bg">
         <LibraryHeader storyCount={stories.length} />
         <main className="flex-1 overflow-y-auto px-4 pt-5 pb-8">
           <p className="text-[13px] font-heading font-bold text-brand-muted
                         uppercase tracking-wide mb-3 pl-0.5">
             Tất cả sách
           </p>
           <motion.div
             className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
             variants={containerVariants}
             initial={prefersReducedMotion ? false : 'hidden'}
             animate="show"
           >
             {stories.map((story, i) => (
               <BookCard
                 key={story.slug}
                 story={story}
                 index={i}
                 onClick={() => onSelectStory(story)}
               />
             ))}
           </motion.div>
         </main>
       </div>
     )
   }
   ```

5. **Verify** hover/press animations and stagger in browser.

## Success Criteria
- [ ] 3 book cards render with correct covers from `assets/`
- [ ] Cards stagger-animate on load (60ms apart)
- [ ] Hover: card lifts, shadow deepens (no layout shift)
- [ ] Press/tap: card scales down to 0.96
- [ ] "Sắp có" badge shows on `ban-do-trong-san-truong`
- [ ] Grid is 2-col on mobile, 3-col at 640px, 4-col at 1024px
- [ ] `prefers-reduced-motion`: no animation, cards render instantly
- [ ] Keyboard: Tab focuses cards, Enter/Space triggers onClick

## Risk Assessment
- `whileHover` + `transition` conflict: define spring config on the motion.div `transition` prop, not inside `whileHover`
- Cover image 404 at `/`: must confirm Phase 1 publicDir is working before this phase
