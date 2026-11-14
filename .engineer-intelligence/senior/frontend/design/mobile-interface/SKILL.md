# Mobile Interface Design

**EI-native specialization:** Design Engineering v1.1.0  
**Parent:** `Senior → Frontend → Design`  
**Partner:** `Senior → Frontend → Mobile`

Use this skill when a native mobile task changes a screen, user flow, information hierarchy, navigation, interaction, accessibility behavior or visual system. Pair it with Mobile Engineering for Flutter, iOS or Android implementation. A code-only crash, data, networking or performance fix does not activate this skill unless the task also changes user-facing behavior.

This module connects mobile implementation context to the existing Design Engineer knowledge corpus. It does not replace the upstream design skills, the project's component system, product requirements or platform conventions.

## Choose the work path

- **New screen or flow:** establish the user goal, entry/exit points, platform, data and permission constraints; map the primary and recovery paths before styling.
- **Redesign:** inspect the existing implementation and tokens, preserve valid behavior, then state the design change and why it helps the user.
- **Critique or audit:** report evidence-backed issues and severity without silently rewriting the screen.
- **Small correction:** load only the affected invariant and verify neighboring states.

## Mobile design workflow

1. **Inspect the real app.** Read the Mobile boundary instructions, framework/version, navigation/state patterns, design tokens, reusable widgets and source-of-truth product flows. Confirm supported OS versions, device classes, orientation and accessibility settings from repository evidence.
2. **Model the screen in its native environment.** Account for status/navigation bars, safe areas, keyboard/IME, system back, app navigation, sheets, permission prompts, lifecycle interruption and restoration. Use the project's established Material, Cupertino or custom conventions; do not mix paradigms casually.
3. **Set the content hierarchy.** State the user's primary action, supporting information, secondary actions and recovery path. Design for narrow widths and touch first; treat tablets, foldables and landscape as separate compositions when they are supported.
4. **Specify states and transitions.** Include relevant loading, empty, success, validation, offline, error, permission-denied, disabled and destructive states. Explain whether data persists after navigation, app backgrounding or retry.
5. **Specify touch and input behavior.** Make controls discoverable and reachable, avoid gesture-only actions, define keyboard/IME effects on layout and focus, and prevent duplicate submission or accidental destructive actions. Preserve state across rotation or navigation when the product requires it.
6. **Apply accessibility and motion.** Provide semantic names and reading order, support text scaling and contrast, keep focus visible, and honor reduced-motion or platform animation preferences. Include non-visual feedback for important state changes.
7. **Implement or hand off.** Reuse existing widgets and tokens; keep platform/API decisions with Mobile Engineering. Mark assumptions and any asset work that must be supplied separately.
8. **Verify the evidence that is available.** Separate source review, widget tests, integration tests, emulator/device captures and human usability/accessibility review. A responsive web screenshot or a passing widget test does not prove the complete native experience.

## Hard gates for substantial mobile work

- User goal, navigation entry/exit and app/back behavior are explicit.
- Relevant system insets, keyboard, permissions and lifecycle interruptions are addressed.
- Main, loading, empty, error/retry, disabled and permission states are covered where applicable.
- Touch targets and text scaling do not obscure the primary task.
- Gestures have discoverable alternatives; destructive actions have clear confirmation or undo behavior appropriate to the product.
- State continuity across navigation, background/foreground and supported orientation changes is defined.
- The report names tested OS/device sizes and records `NOT RUN`, `BLOCKED` or `INCONCLUSIVE` where evidence is absent.

## Progressive knowledge

Load only the relevant references from `.engineer-intelligence/knowledge/design-engineer-intelligence-v0.9.0/skills/`:

- `navigation-behavior/SKILL.md` for app navigation and transitions.
- `accessibility/SKILL.md` for semantics and inclusive interaction.
- `responsive-transformation/SKILL.md` and `content-adaptation/SKILL.md` for supported width/orientation changes.
- `design-system/SKILL.md`, `component-anatomy/SKILL.md` and `interface-review/SKILL.md` for reusable patterns and critique.

These references are cross-platform design guidance. Native OS behavior and framework details must still be checked against the app and its official platform documentation when correctness depends on a specific version.
