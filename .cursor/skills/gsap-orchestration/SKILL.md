---
name: gsap-orchestration
description: Implements advanced GSAP animation in React/Next.js after motion direction is defined. Use for timelines, ScrollTrigger, pinning, scrub, complex text/image sequences, and cinematic orchestration.
---

# GSAP Orchestration

This skill is about implementation, not art direction.

## React / Next.js

Prefer the official `@gsap/react` `useGSAP()` pattern when available.
Scope selectors to a container.
Keep animation inside client-capable boundaries.
Clean up timelines, contexts, triggers, and delayed callbacks.
Avoid duplicate setup on route remount.

## Timeline discipline

Use one timeline to express a coordinated sequence instead of many unrelated delays.
Use labels for meaningful phases.
Do not use magic timing values without motion-system rationale.

## ScrollTrigger

Use only for actual scroll-linked behavior.
Avoid dozens of independent triggers when a section timeline can coordinate them.
Handle responsive variants.
Refresh after material layout changes.

## Performance

Prefer transform and opacity.
Avoid frequent layout-property animation.
Profile large clip/filter effects.
Do not globally apply `will-change`.

If deeper GSAP API guidance is installed, prefer the official GreenSock skills for API-specific implementation.
