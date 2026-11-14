# Interface Design Contract

Use this for substantial new or redesigned application surfaces. Keep the answer proportional to the task; use `N/A` with a reason rather than filling every heading mechanically. This contract records decisions and evidence; it does not prescribe a visual style.

## 1. Request and source of truth

- **Task type:** new design / redesign / critique / audit / system extension / handoff
- **Surface and route:**
- **Primary user and job:**
- **Product/source-of-truth evidence:**
- **Existing patterns/components inspected:**
- **Technical and platform constraints:**
- **Assumptions / unanswered questions:**

## 2. Product and information structure

- **Primary decision or action:**
- **Information priority:**
- **Navigation and page hierarchy:**
- **App shell ownership:** global header / app navigation / page header / content / local navigation
- **Scroll ownership:**
- **Data shape, scale, permissions and actions:**

## 3. Design thesis

- **Visual direction in one sentence:**
- **Why it fits the user, product and brand evidence:**
- **Existing system decisions to preserve:**
- **Intentional changes or signature interaction:**
- **Assets needed and source/rights status:**

## 4. State and interaction contract

| State or action | User sees/does | System response | Keyboard/focus behavior | Acceptance evidence |
| --- | --- | --- | --- | --- |
| Initial/loading | | | | |
| Empty / first use | | | | |
| Success / populated | | | | |
| Validation / partial failure | | | | |
| Error / retry | | | | |
| Permission / disabled | | | | |
| Primary action | | | | |
| Destructive or consequential action | | | | |

Add domain-specific states when relevant (offline, stale data, conflict, rate limit, expired session, partial completion). Do not add irrelevant states as decoration.

## 5. Responsive transformation

Choose test widths from actual layout failure points; 320/390/768/1024/1440 may be initial probes, not required breakpoints.

| Region/content | Wide state | Narrow state | Trigger/failure condition | Input and continuity notes |
| --- | --- | --- | --- | --- |
| App navigation | | | | |
| Header/actions | | | | |
| Main columns/content | | | | |
| Tables/data | | | | |
| Filters/forms/charts | | | | |
| Dialogs/drawers | | | | |

Name behavior as persistent, condensed, moved, grouped, disclosed, replaced, or hidden with an accessible alternative. Explain table and data transformations explicitly.

## 6. Accessibility and motion

- Semantic landmarks and heading order:
- Accessible names, status announcements and error association:
- Keyboard order, visible focus, Escape/close and focus return:
- Contrast and non-color status cues:
- Reduced-motion behavior:
- Screen-reader/manual checks still needed:

## 7. Acceptance and evidence

Separate hard gates from quality observations. Use one status per applicable check: `PASS`, `FAIL`, `NOT RUN`, `BLOCKED`, `INCONCLUSIVE`, or `NOT APPLICABLE` with a reason.

| Requirement | Check method | Environment / viewport | Evidence path or observation | Status | Limitation |
| --- | --- | --- | --- | --- | --- |
| Shell ownership and navigation | | | | | |
| Responsive rendering and overflow | | | | | |
| Content transformation | | | | | |
| Primary interaction and states | | | | | |
| Keyboard/focus | | | | | |
| Accessibility checks | | | | | |
| Existing system consistency | | | | | |

Evidence classes: **source inspection**, **static automated check**, **rendered viewport capture**, **browser interaction run**, **manual assistive-technology review**, and **user/product acceptance**. Do not claim a higher class from a lower one. Screenshots prove appearance at a captured viewport, not functioning controls. Heuristic accessibility checks do not establish WCAG conformance. A green quality score does not override a failed hard gate.

## 8. Handoff

- **Implemented / proposed:**
- **Verified:**
- **Not run / blocked:**
- **Known defects and follow-up:**
- **Design decisions to preserve:**
- **Owner / next action:**
