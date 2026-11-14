# Admin / dashboard shell invariants

## Semantic regions

A common shell may contain:

- Global header: global search, account, notifications, cross-product actions.
- Primary navigation/sidebar: app-level destinations and navigation groups.
- Main region: current route/page.
- Page header: title, breadcrumb/context, page-level actions.
- Page content: task-specific interface.

These are responsibilities, not a required visual arrangement. A product may omit or rearrange regions when justified.

## Sidebar state model

Desktop navigation state:

```ts
type DesktopNavMode = "expanded" | "collapsed";
```

Mobile navigation state:

```ts
type MobileNavState = "closed" | "open";
```

Do not compress both into `sidebarOpen: boolean` when the product supports both responsive modes.

### Expanded

Navigation participates in desktop layout at full information width.

### Collapsed

Navigation remains part of the desktop shell but uses compact representation. It is not hidden.

### Mobile drawer / off-canvas

Navigation leaves normal content flow and overlays or temporarily occupies the viewport. It must provide a clear opener/closer, Escape behavior where applicable, focus handling, and an accessible name/state.

## Header rule

Distinguish app/global header from page header. Do not place every global and page-local control into a single overloaded row merely because desktop width allows it.

## Scroll rule

Choose scroll ownership deliberately. A common shell uses viewport-height containment with the main region scrolling, but this is not mandatory. Avoid body + sidebar + content + table nested vertical scrollbars unless each is justified.

## Content rule

Responsive adaptation applies to data presentation too. Tables, filters, bulk actions, charts, forms and KPI groups need explicit transformation strategies rather than uniform shrinking.
