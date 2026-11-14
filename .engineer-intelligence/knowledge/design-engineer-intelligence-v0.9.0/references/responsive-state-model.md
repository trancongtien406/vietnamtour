# Responsive state model

Responsive design is a transformation system driven by available space, content priority, input capability and task continuity.

## Do not treat breakpoints as product doctrine

Choose breakpoints where composition or interaction begins to fail. Device-category numbers can be initial test points, not immutable rules.

## Required transformations

For each major region define:

- persistent / condensed / moved / grouped / disclosed / replaced / hidden-with-alternative;
- pointer vs touch behavior;
- keyboard behavior;
- reduced-motion behavior;
- safe-area behavior where relevant.

## State continuity

Do not leak invalid state across modes. Example: a collapsed desktop sidebar becoming a permanently open mobile drawer is invalid. Preserve user preference only when the preference has meaning in the destination mode.

## Content adaptation

Consider transformations such as:

- multi-column → fewer columns → linear flow;
- data table → priority columns / horizontal region / record cards / drill-in list;
- persistent filters → filter sheet/drawer;
- toolbar → grouped overflow actions;
- side-by-side editor → tabs/steps/stacked regions.

Select based on task, not on a universal recipe.
