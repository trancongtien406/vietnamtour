# Design Engineer Intelligence v0.9.0

Adaptive Creative Intelligence + Structural & Responsive Intelligence.

Portable, local/private Agent Skills package for Claude Code, Cursor, Codex-style skill runtimes, and other clients that can read `SKILL.md` instructions.

## Doctrine

> Standardize how the AI thinks. Never standardize what the design should look like.

v0.9 separates two layers:

1. **Hard invariants** — usability, application-shell integrity, responsive behavior, navigation availability, accessibility, interaction correctness, scroll ownership, state continuity.
2. **Creative space** — visual language, composition, typography, imagery, motion, metaphor, personality, signature interaction.

A beautiful interface that fails structural invariants fails the design gate.

## Main entry points

- `/design` — new interface/product surface
- `/redesign` — redesign an existing surface while preserving product truth
- `/critique` — structured critique without redesigning by taste
- `/research-ui` — evidence/reference research and abstraction
- `/design-system` — audit/document/extend a system
- `/audit-ui` — structural, responsive, accessibility, originality and implementation audit
- `/handoff` — engineering handoff

## Local installation

This package is intentionally designed for local/private use. Do not publish it to npm.

```bash
cd design-engineer-intelligence-v0.9.0
npm link
```

Install into a project:

```bash
design-engineer install /path/to/project --client both
```

Supported client values:

```text
claude
cursor
both
```

Then initialize project memory:

```bash
design-engineer init /path/to/project
```

Check installation:

```bash
design-engineer doctor /path/to/project
design-engineer inspect /path/to/project
```

Validate the source package:

```bash
design-engineer validate
```

Show built-in eval cases:

```bash
design-engineer eval
```

Update a project after modifying the local master package:

```bash
design-engineer update /path/to/project --client both
```

## Recommended prompting

Use the product objective, constraints and real context. Do not prescribe trendy UI ingredients unless they are actual requirements.

```text
/design Create an admin dashboard for a multi-branch photobooth platform. Define the app shell and responsive state model before implementation. Desktop navigation must support expanded/collapsed modes; mobile navigation must become an accessible off-canvas drawer. Preserve clear ownership of header, sidebar, page header, content and scrolling.
```

For an existing project:

```text
/redesign Audit the existing UI first. Reuse valid design-system decisions, identify structural failures, then propose genuinely different design directions before changing implementation.
```

For final QA:

```text
/audit-ui Validate shell structure, responsive transformation, navigation availability, scroll ownership, keyboard/focus behavior, accessibility, content adaptation and originality. Fail the gate on structural errors even if visual quality is high.
```

## Project memory

`design-engineer init` creates:

```text
.design-engineer/
├── project-context.md
├── design-system.md
├── decisions.md
├── corrections.md
└── patterns.md
```

Store reasoning and corrections, not reusable page appearances. Reuse logic; do not force previous visual outcomes.

## Package anatomy

```text
commands/      explicit slash-style workflows
skills/        auto-trigger domain/procedural knowledge
references/    progressive-disclosure knowledge
agents/        critic/comparator/research roles
evals/         invariants, diversity and blind-comparison cases
templates/     project memory templates
bin/           local CLI
```

## Version

`0.9.0`
