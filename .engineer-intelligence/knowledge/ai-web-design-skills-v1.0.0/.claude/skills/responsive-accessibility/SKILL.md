---
name: responsive-accessibility
description: Adapts sophisticated web layouts and animation to desktop, tablet, mobile, keyboard, touch, reduced-motion, and lower-performance contexts. Use for production website implementation and review.
---

# Responsive + Accessibility

## Responsive design

Do not simply stack desktop columns.

For each major section decide:

- what remains dominant
- what order changes
- whether media becomes inline
- whether sticky/pinned behavior should disappear
- whether horizontal narrative becomes vertical
- whether large typography must recompose rather than only shrink

## Motion

- touch cannot depend on hover
- cursor follower is decorative only
- pinned horizontal stories usually need a mobile vertical fallback
- reduce blur/parallax/continuous loops on weaker contexts
- preserve content meaning with motion removed

## Accessibility

- semantic landmarks
- logical heading order
- visible focus
- keyboard-operable controls
- accessible names
- sufficient text readability
- do not hide essential content behind animated canvases
- respect reduced motion

## Reduced motion

Prefer:

- instant state change
- simple opacity
- no parallax
- no scrub
- no large spatial movement
- no continuous decorative loops

The reduced-motion version must still feel designed.
