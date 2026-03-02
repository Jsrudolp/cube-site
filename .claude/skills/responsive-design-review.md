# Responsive Design Review — cube-site

You are reviewing and fixing responsive design for Jake Rudolph's cube site.

## Stack
- **Next.js** with Tailwind CSS v4
- **Tailwind breakpoints**: `sm` = 640px, `md` = 768px, `lg` = 1024px, `xl` = 1280px
- Existing convention: `sm:` prefix used for desktop-up, base styles are mobile-first

## Site context
- The 3D cube is desktop-only (hidden in iframes, works on touch but designed for mouse)
- Face pages are full-screen content pages that need to work on mobile
- The building page (`/building`) has complex interactive sections — treat carefully
- Max content width is typically `max-w-[52rem]` on face pages

## Workflow

When asked to review or fix responsiveness:

1. **Read the target file(s)** in full before suggesting anything
2. **Mentally render at three sizes**: 375px (iPhone), 768px (iPad), 1440px (MacBook)
3. **Identify issues** across these categories:
   - Text too large or too small at any size
   - Padding/margin that collapses or overwhelms on mobile
   - Fixed widths that break layout
   - Images or media overflowing their containers
   - Horizontal scroll caused by wide elements
   - Touch targets smaller than 44px on interactive elements
   - Content hidden on mobile that matters
   - Two-column layouts that need to stack on mobile
4. **Fix with Tailwind**, using mobile-first base + `sm:`/`md:`/`lg:` overrides
5. **Preserve existing responsive classes** — don't remove `sm:` overrides already in place

## Tailwind responsive patterns for this codebase

```
// Text scaling
text-[14px] sm:text-[18px]

// Padding
px-5 sm:px-7

// Two-col → stacked
flex flex-col md:flex-row

// Show/hide
hidden md:flex   (desktop only)
md:hidden        (mobile only)

// Clamped max-width with centering
mx-auto max-w-[52rem]
```

## Common issues to check on this site

1. **Section padding** — does it feel cramped on 375px or excessive on 1440px?
2. **Font sizes** — face pages use `text-[15px] sm:text-[18px]`, check headings too
3. **Image widths** — `building` page has many images, verify they don't overflow
4. **Line length** — long text lines on wide screens (should stay under ~75 chars)
5. **The FaceNav bar** — fixed top bar, verify it doesn't overlap content on small screens
6. **Mosaic/collage components** — rotated/positioned images may overflow on narrow screens

## Output format

For each issue found:
- **Where**: file + approximate line
- **Problem**: what breaks and at what width
- **Fix**: exact Tailwind class change

Then apply the fixes directly unless told otherwise.
