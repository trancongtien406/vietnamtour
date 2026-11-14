---
name: scroll-ownership
description: Determine scroll containers, sticky regions and overflow behavior. Trigger when fixed headers/sidebars, data tables, nested panels or viewport-height app shells are present.
---

# Scroll Ownership

Name the owner of vertical scrolling and every intentional nested scroll region.

Avoid accidental combinations of body scroll + main scroll + panel scroll. Use horizontal overflow only at the smallest region that needs it, such as a data grid, not the entire page.

Check sticky/fixed regions against focus, zoom, small-height viewports and mobile browser chrome.
