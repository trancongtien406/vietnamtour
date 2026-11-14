# Design Engineering delivery contract v1.0

Design Engineering moves beyond a skill mention only when the task has a material interface decision. Keep changes under the established hierarchy `Senior → Frontend → Design → Visual Experience`. Frontend owns implementation; Design owns product-interface reasoning and quality; Visual Experience owns original visual assets and storytelling.

## Activation and scope

- Explicit UI/UX, redesign, interface, screen, layout, responsive, dashboard/admin, design system, accessibility behavior, navigation or interaction requests activate Design.
- An explicit `website/**` or `mobile/**` scope provides the platform boundary. A named dashboard/admin surface without a path is treated as web UI unless the task clearly names a mobile platform. Strong API/backend vocabulary still activates its own boundary; combined product work may need both.
- A plain implementation bug with no user-facing design decision stays on the normal Frontend route.
- Critique and audit requests return findings; they do not trigger an unrequested redesign.

## Minimum artifacts by task size

| Size | Required output |
| --- | --- |
| Small, local visual fix | Targeted change + affected state and viewport check; no full design brief |
| One screen / substantial modification | Context evidence, design thesis, state and responsive decisions, test/evidence note |
| Admin shell / multi-screen / design system | Completed `senior/frontend/design/templates/interface-design-contract.md`, shell ownership, route/role state, data/content transformation, component/tokens impact, and acceptance evidence plan |
| Critique or audit only | Findings ordered by severity, affected user/task, evidence and suggested correction; preserve scope |

## Hard gates before a design is called complete

1. Product truth and source boundaries are understood; assumptions are labeled.
2. Header, app navigation, page navigation/actions, main content, and scroll ownership have clear owners where present.
3. Required loading, empty, success, error, permission and consequential-action states are covered.
4. Responsive behavior describes region and content transformations; it is not only a list of breakpoints.
5. Navigation, focus, keyboard access and close/return behavior remain usable across supported states.
6. No known accidental content obstruction or horizontal page overflow at tested viewports.
7. Evidence claims match what was run. `NOT RUN` and `BLOCKED` are valid outcomes; they are not PASS.

Hard gates are pass/fail/unverified. A visual quality score is a separate diagnostic and cannot offset a failed gate.

## Evidence boundary

Record method, version/commit, environment, viewport(s), artifact path, outcome, and limitation. Keep these distinctions:

- Source/code inspection can establish declared rules and presence, not rendered behavior.
- Static checks can establish only the predicates they implement.
- Rendered captures establish appearance at their recorded viewport and build.
- Browser interaction tests establish only the flows and states they execute.
- Accessibility heuristics are not a conformance audit; assistive-technology/manual checks need their own evidence.
- Product acceptance is a human decision, not an automatic consequence of tests passing.

For website source/build evidence, call the existing EI C4 capabilities and respect their release status. A local or fixture C4 PASS is not a real Vite build or production release approval. The exact evidence limitations are listed in the corresponding Phase C report.

## Quality review after gates

When the user asks for a quality comparison or when design directions materially differ, score explicit dimensions on a declared scale: product relevance, hierarchy, clarity, interaction affordance, consistency, responsive content adaptation, accessibility evidence, originality and implementation feasibility. Cite observations, state who assigned the score, and report missing evidence. Never invent a design score and attribute it to EI.
