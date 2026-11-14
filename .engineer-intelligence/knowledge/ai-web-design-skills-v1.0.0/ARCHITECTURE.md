# Architecture

## Skill layers

### 1. Orchestration

`web-design-production` coordinates the full workflow.

### 2. Direction

- `art-direction`
- `motion-direction`
- `responsive-accessibility`
- `anti-generic-design`

### 3. Motion patterns

- `page-transitions`
- `scroll-storytelling`
- `typography-motion`
- `interaction-motion`
- `gsap-orchestration`
- `motion-react`

### 4. Industry intelligence

Industry skills contain domain-specific audience, trust, conversion, information architecture, visual directions, motion opportunities, anti-patterns, and QA.

### 5. Quality

- `ui-quality-gate`
- `motion-quality-gate`
- `performance-quality-gate`

## Orchestration pipeline

```text
USER BRIEF
    ↓
BUSINESS / AUDIENCE / CONVERSION ANALYSIS
    ↓
INDUSTRY SKILL
    ↓
ART DIRECTION
    ↓
PAGE NARRATIVE
    ↓
MOTION DIRECTION
    ↓
IMPLEMENTATION ROUTING
(CSS / Motion / GSAP / WebGL / no animation)
    ↓
RESPONSIVE + A11Y
    ↓
IMPLEMENT
    ↓
UI + MOTION + PERFORMANCE QA
    ↓
REFINE
```

## Rules vs skills

Project-wide immutable engineering conventions belong in repository rules / AGENTS.md / project instructions.

Dynamic domain knowledge belongs in skills:

- law firm design intelligence
- real-estate conversion patterns
- motion direction
- GSAP orchestration
- portfolio storytelling

This avoids loading irrelevant knowledge into every request.

## Progressive disclosure

Each complex skill has:

- `SKILL.md`: trigger + decisions + workflow
- `references/DOMAIN.md`: domain model
- `references/DIRECTIONS.md`: art-direction options
- `references/PAGE-PATTERNS.md`: page and section recipes
- `references/MOTION.md`: motion opportunities and restrictions
- `references/QA.md`: industry-specific quality gate

All references are linked directly from `SKILL.md`.
