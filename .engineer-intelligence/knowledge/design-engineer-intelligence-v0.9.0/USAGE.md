# Quick usage

## 1. Link local CLI

```bash
cd design-engineer-intelligence-v0.9.0
npm link
```

## 2. Install into project

```bash
design-engineer install /path/to/project --client both
design-engineer init /path/to/project
design-engineer doctor /path/to/project
```

## 3. Use in agent

```text
/design <brief>
/redesign <existing screen/task>
/critique <screen or implementation>
/research-ui <topic/problem>
/design-system <audit|document|extend ...>
/audit-ui <screen/project>
/handoff <feature/screen>
```

You can also speak naturally. Skills are written to auto-trigger when their domain is relevant.

## 4. Recommended admin-dashboard prompt

```text
/design Design and implement this admin dashboard. Before coding, define the app-shell ownership and responsive state model. Desktop sidebar must distinguish expanded/collapsed state; mobile must use a separate accessible drawer state. Define header vs page-header responsibilities, scroll ownership and content transformations. Then choose a product-specific visual direction rather than a generic SaaS template. Run /audit-ui before finishing.
```

## 5. Update from local master

```bash
design-engineer update /path/to/project --client both
```

## 6. Validate / inspect

```bash
design-engineer validate
design-engineer inspect /path/to/project
design-engineer eval
```
