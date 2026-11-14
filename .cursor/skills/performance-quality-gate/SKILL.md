---
name: performance-quality-gate
description: Audits animated frontend experiences for runtime cost, media weight, lifecycle safety, scroll performance, hydration safety, and graceful degradation. Use before production completion.
---

# Performance Quality Gate

Check:

- transform/opacity preferred for frequent animation
- no repeated layout reads/writes in animation loops
- no redundant ScrollTriggers
- listeners and timelines clean up
- route remounts do not duplicate animation
- media dimensions are known to prevent layout shift
- large images/video optimized and loaded intentionally
- continuous loops stop when offscreen or irrelevant
- mobile receives lighter effects
- page is usable before animation initializes
- server/client boundaries are correct
- reduced-motion bypasses unnecessary work

Do not add global `will-change`.
Do not optimize by guessing: profile when possible.
