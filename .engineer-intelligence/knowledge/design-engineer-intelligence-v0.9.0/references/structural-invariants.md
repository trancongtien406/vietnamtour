# Structural invariants

Structural invariants are hard quality gates. They constrain behavior, not aesthetics.

## Every application surface must answer

- What owns global navigation?
- What owns page-local navigation?
- What owns the page title and page actions?
- What owns vertical scrolling?
- What owns horizontal overflow?
- Which regions are sticky/fixed/static and why?
- What happens when width, height, pointer precision or input method changes?
- What remains reachable by keyboard and assistive technology?

## Fail conditions

- Navigation becomes inaccessible at any supported viewport.
- Main content is permanently obscured by a fixed shell region.
- The whole page gains accidental horizontal scrolling.
- Multiple nested vertical scroll regions appear without a product reason.
- Mobile is achieved only by shrinking or hiding desktop UI without an alternative behavior.
- Focus can escape an open modal/drawer where trapping is required.
- State changes cause content jumps or invalid shell geometry.
