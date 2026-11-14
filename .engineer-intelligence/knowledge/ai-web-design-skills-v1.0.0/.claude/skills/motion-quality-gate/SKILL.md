---
name: motion-quality-gate
description: Audits a website's animation for purpose, coherence, pacing, responsiveness, reduced-motion behavior, and unnecessary effects. Use after motion implementation.
---

# Motion Quality Gate

For every meaningful animation ask:

1. What does it communicate?
2. Is it consistent with the brand motion grammar?
3. Does it delay information or navigation?
4. Does another animation compete with it?
5. Is the library choice justified?
6. What is the mobile behavior?
7. What is the reduced-motion behavior?
8. Is cleanup safe?

## Fail conditions

- animation is purely decorative and distracting
- identical fade-up everywhere
- long stagger delays reading
- scroll is hijacked
- pinned sequence traps users
- hover reveals essential information
- page transition blocks route navigation
- animation breaks when revisiting route
- motion creates layout shift

Remove motion that has no defensible role.
