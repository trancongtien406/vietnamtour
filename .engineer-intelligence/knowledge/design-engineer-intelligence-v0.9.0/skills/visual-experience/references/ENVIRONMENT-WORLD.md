# Environment & World Assets

## Prime rule

A beautiful building that violates the world's perspective and scale is a
failed production asset.

## Define world metrics first

Before generating reusable world art, define:

- projection / camera angle;
- player reference height;
- base grid/tile unit;
- doorway/window scale;
- ground contact convention;
- light direction;
- shadow direction;
- detail range;
- collision footprint assumptions;
- safe bounds.

Prefer reusable kits over isolated scenes when customization matters.

For reusable props specify perspective, physical scale, ground contact, lighting,
shadow behavior, transparency, and whether baked environment is forbidden.

Check that all assets share projection, player scale, lighting logic, and detail
density.
