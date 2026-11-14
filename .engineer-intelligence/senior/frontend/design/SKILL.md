# Design Engineering Intelligence v1.0

Design Engineering is a Frontend specialization in the hierarchy `Senior → Frontend → Design → Visual Experience`. Use it when the task changes what a user sees, understands, navigates, or does: UX/UI, information architecture, hierarchy, layout, responsive behavior, interaction, accessibility behavior, design systems, brand expression, motion, or interface critique. Do not load it for a code-only frontend fix without a design decision.

Its job is to turn product truth into an implementable interface contract, guide the visual and interaction decisions, then report what was actually verified. It must not claim to have designed, rendered, tested, or approved work that it did not observe.

## Choose the task path

Classify the request before loading more context:

| Request | Path |
| --- | --- |
| New screen or flow | `/design` → establish context and hard structure, then explore and converge |
| Existing screen needs a different direction | `/redesign` → inspect product and code evidence before proposing change |
| Feedback only | `/critique` → state findings and evidence; do not silently redesign |
| Quality/compliance review | `/audit-ui` → run hard structural gates, then score quality dimensions |
| Design tokens/components | `/design-system` → inspect current system, identify gaps, extend without accidental replacement |
| Evidence/reference study | `/research-ui` → collect permitted evidence and abstract patterns, never copy a reference wholesale |
| Handoff | `/handoff` → record decisions, states, responsive rules, assets and verification needs |
| Native mobile screen or flow | `/mobile-ui` → pair Mobile Engineering with `mobile-interface/SKILL.md`; honor platform behavior instead of shrinking a web layout |
| Small visual correction | Load only the relevant specialist and affected invariant; skip the full process |

Detailed command and skill knowledge lives in `.engineer-intelligence/knowledge/design-engineer-intelligence-v0.9.0/`. Keep that source corpus intact; use its skills and references progressively rather than loading the entire corpus for every task.

## Operating loop for substantial interface work

1. **Ground the request and locate its source.** Apply
   `references/PROJECT-SURFACE-DISCOVERY.md` to select the owning app/package
   and report its path and evidence. Clarify only when that guide's ambiguity
   threshold is met. Then identify the user, job, product constraints,
   source-of-truth docs, existing screens/components, design tokens, supported
   devices, framework and supplied references. Separate facts from assumptions
   and unresolved decisions.
2. **Route the right knowledge.** Always use `design-engineer` for substantial work. For native app screens/flows, pair Mobile Engineering with `mobile-interface/SKILL.md`; do not apply web breakpoints, browser shells or web navigation assumptions to native views. Add `structural-responsive-intelligence` for dashboards, app shells, data-heavy views or breakpoint changes. Load only the relevant skills for navigation, accessibility, states, composition, typography, design systems, motion, research or assets. Route illustration, iconography, mascots and other authored visual assets to `visual-experience/`.
3. **Write a design contract before a large implementation.** Use `templates/interface-design-contract.md`. State the user's primary task, product invariants, shell ownership, navigation/scroll model, content priority, key states, responsive transformations, keyboard/focus behavior, visual thesis and acceptance evidence. Mark unknowns; do not convert guesses into requirements.
4. **Make a design decision.** For an open-ended brief, explore meaningfully different directions. Choose one with a concise rationale tied to users and product identity. For a constrained fix, preserve unrelated valid decisions. Never optimize for resemblance to a reference screenshot or for trend ingredients alone.
5. **Specify behavior with appearance.** Describe controls, feedback, validation, loading/empty/error/success/permission states, keyboard behavior, focus, reduced motion and data/content transformation. Visual polish cannot compensate for a broken or missing state.
6. **Implement or hand off within authority.** Preserve repository patterns and app boundaries. Do not invent data, actions, permissions, APIs or brand rules. Identify manual work and assets explicitly.
7. **Verify by evidence class.** Follow `runtime/design/DESIGN-DELIVERY-CONTRACT-V1.0.md`. Run the available structural, static, rendered, interaction and accessibility checks that apply. Record `NOT RUN`, `BLOCKED`, `INCONCLUSIVE` or `NOT APPLICABLE` where evidence is absent. A CSS breakpoint is not proof of responsive rendering; a DOM heuristic is not proof that a user flow works.
8. **Report the result.** Separate implemented decisions, verified outcomes, manual checks, open issues and evidence limits. Hard-gate failures cannot be averaged away by a visual-quality score.

## Hard gates

For substantial application surfaces, explicitly resolve:

- app-level versus page-level navigation, page title/actions, main-content ownership and scroll ownership;
- loading, empty, error, success and permission/disabled states relevant to the flow;
- desktop navigation modes and mobile navigation behavior where the product uses both;
- content transformation, including tables, filters, forms, charts, bulk actions and KPI groups;
- keyboard reachability, focus order/visibility, accessible names, dialog/drawer behavior and reduced-motion preference;
- accidental horizontal overflow, obscured content and state continuity when moving between responsive modes;
- actual test evidence and its limits.

Select breakpoints from where the composition or interaction stops working. Device widths may be test points, not design doctrine. Use `.engineer-intelligence/knowledge/design-engineer-intelligence-v0.9.0/references/admin-shell-invariants.md`, `structural-invariants.md`, and `responsive-state-model.md` for the full constraints.

## Quality review

First apply structural pass/fail gates. If they pass, assess product relevance, hierarchy, clarity, coherence, usability, accessibility, responsive content adaptation, consistency with the existing system, originality and technical feasibility. Score only when a requested or useful rubric exists; label the author and evidence. Do not present a model's subjective score as a product metric or EI-generated measurement.

## Progressive references

- All substantial app surfaces: `design-engineer/SKILL.md`.
- Production web workflow and art direction: `.engineer-intelligence/knowledge/ai-web-design-skills-v1.0.0/.claude/skills/web-design-production/SKILL.md` and `art-direction/SKILL.md`.
- UI review and anti-generic gate: `.engineer-intelligence/knowledge/ai-web-design-skills-v1.0.0/.claude/skills/ui-quality-gate/SKILL.md` and `anti-generic-design/SKILL.md`.
- Motion implementation and QA: `.engineer-intelligence/knowledge/ai-web-design-skills-v1.0.0/.claude/skills/motion-direction/SKILL.md`, `interaction-motion/SKILL.md` and `motion-quality-gate/SKILL.md`.
- Industry requests: load only the matching profile under `.engineer-intelligence/knowledge/ai-web-design-skills-v1.0.0/.claude/skills/<industry>/SKILL.md` and its relevant `references/` file.
- Responsive web accessibility: `.engineer-intelligence/knowledge/ai-web-design-skills-v1.0.0/.claude/skills/responsive-accessibility/SKILL.md`; native mobile uses the EI-native `mobile-interface/SKILL.md` below.
- Research and evidence: `research-interface/SKILL.md`; abstract patterns rather than copying references.
- Visual voice and domain fit: `art-direction/SKILL.md` and `industry-taste/SKILL.md`.
- Divergent concepts: `divergent-thinking/SKILL.md`, `design-hypothesis/SKILL.md`, `metaphor-engine/SKILL.md`, then `creative-convergence/SKILL.md` when the task needs exploration.
- Long pages and flows: `page-choreography/SKILL.md`; product states and transitions: `product-state-motion/SKILL.md` and `signature-interaction/SKILL.md`.
- Responsive behavior: `responsive-transformation/SKILL.md` and `responsive-motion/SKILL.md`; native mobile also loads `mobile-interface/SKILL.md` with Mobile Engineering.
- Stress test and final critique: `break-ui/SKILL.md` and `interface-review/SKILL.md`.
- Dashboard/admin shell: `structural-responsive-intelligence/SKILL.md` plus `references/admin-shell-invariants.md`.
- Breakpoint or device behavior: `skills/responsive-transformation/SKILL.md` plus `references/responsive-state-model.md`.
- User actions/navigation: `skills/navigation-behavior/SKILL.md` and `skills/interface-review/SKILL.md`.
- Accessibility behavior: `skills/accessibility/SKILL.md`.
- New visual direction: `skills/design-hypothesis/SKILL.md`, `skills/divergent-thinking/SKILL.md`, then `skills/creative-convergence/SKILL.md`.
- Existing design system: `skills/design-system/SKILL.md`.
- Assets or visual storytelling: `visual-experience/SKILL.md` and its targeted reference.

If a named file is absent in this release, do not invent it: use the corresponding command and the closest existing reference, then record the documentation gap for correction.

When changing project-surface discovery behavior, review `evals/project-surface-discovery.json` and add cases for new workspace or framework patterns.

The Design Engineer v0.9.0 and AI Web Design Skills v1.0.0 corpora are both bundled under `.engineer-intelligence/knowledge/`. Preserve their source trees and progressively load only the specialists relevant to the task.
