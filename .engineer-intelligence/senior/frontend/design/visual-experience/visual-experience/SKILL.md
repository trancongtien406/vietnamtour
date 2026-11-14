---
name: visual-experience
description: >
  Design and production intelligence for visual assets inside user-facing
  interfaces. Use when a screen or product depends on imagery, illustration,
  custom iconography, product thumbnails, characters/mascots, game assets,
  environment art, motion graphics, brand imagery, or when a functional UI is
  becoming overly text-and-box driven.
---

# Visual Experience

## Role

You own the **visual asset and visual-support layer** of an interface.

You do not own:

- business requirements;
- the whole UX architecture;
- the entire art direction;
- frontend architecture;
- backend behavior.

Consult the existing product context and art direction first.

## Outcome

The goal is not "more pictures".

The goal is:

```text
the smallest visual system that makes the experience clearer,
more identifiable, more expressive, and more production-complete.
```

## Core loop

```text
1. Inspect existing product and assets
2. Build visual inventory
3. Identify communication / identity / feedback gaps
4. Decide whether each gap needs a visual
5. Classify visual type
6. Reuse / source / design / generate
7. Define production constraints
8. Integrate into the real interface
9. Run asset + system + context QA
10. Refine only what fails
```

## Required first questions

Before proposing assets:

- What task is the user performing?
- What must be recognized instantly?
- What is currently over-reliant on text?
- Which visual concepts already exist?
- Which visuals are semantic and which are atmospheric?
- At what real display size will each asset appear?
- Is this a static UI, responsive web surface, mobile app, or game world?
- Does the project already define an art direction or asset family?

## Decision

Read `references/ASSET-DECISION.md`.

Do not assume that "visual" means raster image.

Before generation, read `references/ASSET-GRANULARITY.md` when deciding whether the output should be one isolated asset, a family sheet, a sprite sheet, or only a concept/style board.

## Load selectively

Read only the references required by the task:

- UI / onboarding / empty states → `UI-ILLUSTRATION.md`
- icons / badges / simple semantic graphics → `ICON-VECTOR.md`
- characters / mascots / pets → `CHARACTER-MASCOT.md`
- sprite / animated game assets → `GAME-ASSETS.md`
- shops / props / map objects / world art → `ENVIRONMENT-WORLD.md`
- motion visuals → `MOTION.md`
- marketing / OpenGraph / social / app-store art → `BRAND-IMAGERY.md`
- asset granularity / concept-board vs production decisions → `ASSET-GRANULARITY.md`
- generation prompt creation → `PROMPT-COMPILER.md`
- runtime asset integration → `ASSET-MANIFEST.md`
- final review → `VISUAL-QA.md`

## Non-negotiable constraints

- Do not generate decorative assets by default.
- Do not treat a combined concept/style board as a production asset source.
- Do not crop arbitrary final assets out of a UI mockup or mixed concept board.
- Do not use an illustration where an established icon is clearer.
- Do not use a bitmap where scalable vector semantics are required.
- Do not use a static image where the actual requirement is stateful interaction.
- Do not generate isolated character variants from scratch when identity continuity matters.
- Do not generate game environment props without perspective, scale and footprint constraints.
- Do not approve generated visuals outside the actual UI/game context.
- Do not embed important text inside generated raster art when live text is possible.
- Do not change the project's style to match a generated asset.

## Production priority

```text
meaning
→ consistency
→ actual-size readability
→ integration
→ polish
```

A beautiful asset that fails at 32px is a failed 32px asset.

## Definition of done

Visual work is complete only when:

- visual roles are intentional;
- no missing asset is hidden behind a placeholder;
- asset type is appropriate;
- project style is preserved;
- real display size works;
- responsive behavior is defined;
- state variants are covered when needed;
- accessibility / reduced-motion considerations are handled;
- performance cost is acceptable;
- asset/system/context QA pass.
