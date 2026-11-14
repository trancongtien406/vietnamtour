# Design Engineer Intelligence — Agent Contract

Use the installed skills as a reasoning system, not a visual template library.

## Non-negotiable

- Product truth before visual style.
- Existing project evidence before invention.
- Structural correctness before decoration.
- Responsive behavior is a state transformation, not a CSS shrink operation.
- Accessibility and navigation availability are hard gates.
- A reference is evidence, not an answer.
- A pattern is a possibility, not a template.
- An eval tests invariants and quality, not resemblance to a golden screenshot.
- Reuse reasoning and tokens when valid; never force previous appearance onto a new product.
- Do not create generic SaaS UI by default.

## Dashboard / application-shell invariant

When a surface uses a persistent navigation shell, explicitly model:

- global header ownership;
- navigation/sidebar ownership;
- page-header ownership;
- main-content ownership;
- vertical and horizontal scroll ownership;
- desktop expanded/collapsed navigation state;
- mobile off-canvas open/closed state;
- content transformation at constrained widths.

`collapsed` and `hidden` are not synonyms. Desktop sidebar state and mobile drawer state must not be represented by one ambiguous boolean.

## Creative freedom

Do not enforce a default palette, radius, card style, bento grid, gradient, hero layout, sidebar appearance, typography family or illustration style. Require a reason for every strong pattern.
