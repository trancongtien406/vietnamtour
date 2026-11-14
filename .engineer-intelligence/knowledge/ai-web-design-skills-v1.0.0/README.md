# AI Web Design Skills — Production Edition

A production-oriented Agent Skills library for Claude Code and Cursor that turns a coding agent into a disciplined **web art director + UX designer + motion director + frontend motion engineer**.

The system is intentionally layered:

1. **Business / industry context**
2. **Art direction**
3. **Page narrative**
4. **Motion language**
5. **Implementation routing**
6. **Responsive + accessibility**
7. **Quality gates**

It does **not** treat GSAP, Motion, Three.js, gradients, bento grids, or any other technique as a design direction.

## Install

### Claude Code (project scope)

Copy `.claude/skills/` into the target repository.

### Cursor

Cursor can discover compatible `.claude/skills/` skills. You may also run:

```bash
bash scripts/install.sh --target /path/to/project --mode cursor
```

which mirrors the skills into `.cursor/skills/`.

### Validate

```bash
python3 scripts/validate_skills.py
```

## Recommended use

Prompt the agent with the actual business objective, not an animation shopping list.

Good:
> Design and implement a premium website for a boutique architecture studio targeting luxury homeowners. It should feel editorial and spatial, use sophisticated motion only where it improves the story, and be production-ready.

Less useful:
> Make a cool GSAP website with lots of animations.

The orchestrator should choose the industry skill, art direction, motion grammar, and implementation tools.

## Production doctrine

- Business intent before visual style.
- Visual idea before animation.
- Motion has a communicative role.
- One signature interaction beats twenty random effects.
- Mobile is a composition, not a collapsed desktop.
- Reduced motion is a first-class experience.
- The site must remain usable before/without animation initialization.
- Real product behavior beats abstract decorative SaaS visuals.
- If a design could belong unchanged to five unrelated industries, it is not sufficiently art-directed.
