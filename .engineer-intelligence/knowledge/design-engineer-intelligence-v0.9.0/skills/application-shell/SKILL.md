---
name: application-shell
description: Design or review application shells including global header, sidebar/navigation, page header and main content. Use for dashboards/admin/workspaces and persistent navigation products.
---

# Application Shell

Define responsibilities before dimensions.

Required questions:

- Which region owns global navigation and global actions?
- Which region owns page context/actions?
- Which region scrolls?
- What is sticky/fixed and why?
- What states exist at wide and constrained widths?

If using sidebar navigation, explicitly model desktop expanded/collapsed and mobile drawer open/closed when applicable. Never assume one boolean represents all states.

Read `../../references/admin-shell-invariants.md`.
