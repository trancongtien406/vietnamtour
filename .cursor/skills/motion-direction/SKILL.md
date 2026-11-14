---
name: motion-direction
description: Defines a coherent motion language and animation system for a website, then routes effects to CSS, Motion, GSAP, WebGL, or stillness. Use for animated, interactive, premium, cinematic, scroll-driven, or highly polished websites.
---

# Motion Direction

## Motion is a language, not an effect list

Define motion before implementation.

## Motion brief

Specify:

- personality: restrained / elegant / technical / energetic / playful / cinematic
- tempo: slow / medium / fast
- spatial model: flat / layered / continuous / editorial / immersive
- entrance grammar
- exit grammar
- hover grammar
- navigation grammar
- scroll grammar
- page-transition grammar
- reduced-motion equivalent

## Motion tokens

Use a small family instead of arbitrary values.

Example baseline:

- instant feedback: 120–180ms
- UI transition: 180–320ms
- component reveal: 350–650ms
- narrative transition: 650–1200ms
- cinematic sequence: only when justified

Stagger:

- tiny UI group: 20–50ms
- text/list reveal: 30–90ms
- avoid long staggers that delay information

Use easing consistently:

- UI: responsive and decelerating
- editorial reveal: smooth, confident
- cinematic: longer asymmetric easing
- playful: spring/overshoot only when brand allows

## Implementation routing

CSS:

- hover color
- small transform
- basic opacity
- focus transitions

Motion:

- presence
- layout/shared layout
- modal/menu/drawer
- gesture
- spring feedback
- small route/component transitions

GSAP:

- complex timeline
- ScrollTrigger
- pinning
- scrub
- coordinated text/image sequence
- precise cinematic transitions

WebGL:

- actual 3D/spatial/shader concept
- never merely because “premium” was requested

## Hierarchy

High emphasis: hero and one signature story.
Medium: important section transitions.
Low: normal content.
Very low: utilities/footer.

Prefer one dominant motion idea per viewport.

## Required safeguards

- no content access depends on animation
- no hover-only information
- prefers-reduced-motion
- mobile simplification
- lifecycle cleanup
- performance budget

For recipes read:

- `references/MOTION-TOKENS.md`
- `references/LIBRARY-ROUTING.md`
- `references/MOTION-ANTI-PATTERNS.md`
