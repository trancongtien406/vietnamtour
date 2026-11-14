---
name: page-transitions
description: Designs and implements route/page transitions using masks, shared elements, image expansion, curtains, or restrained fades. Use when navigation should feel spatially continuous and branded.
---

# Page Transitions

Choose transition based on information architecture.

## Good patterns

- listing thumbnail → detail hero
- project preview → fullscreen project
- chapter wipe for editorial story
- image mask reveal
- restrained directional fade for utility routes

## Production rules

- route works if transition fails
- no artificial wait for a loader
- frequent transitions stay short
- scroll restoration is intentional
- back navigation remains coherent
- reduced motion becomes instant or a simple fade
- large filter/clip effects are profiled on mobile

For detailed recipes see `references/RECIPES.md`.
