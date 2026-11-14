# Asset Granularity & Production Readiness

## Prime distinction

```text
CONCEPT BOARD ≠ PRODUCTION ASSET
```

A concept board is used to explore art direction, palette, mood, character language, icon style, environment language, and overall coherence.

It is **not** a final source file to be cropped into arbitrary production assets unless it was explicitly generated as a production sheet with known cell bounds, consistent scale, transparent separation, and export constraints.

## Production asset test

Before approving an image as production-ready, ask:

- Does it contain only the intended asset or coherent production set?
- Is the asset isolated from unrelated UI, labels, cards, backgrounds, and text?
- Is the perspective controlled?
- Is the scale intentional?
- Is the background correct for integration?
- Is the output large enough for the intended display size?
- Can the asset be independently replaced/versioned?
- Does it have a stable manifest key?
- Is it readable at the real runtime size?

If not, classify it as a concept reference, style board, composition reference, or marketing artwork — not as production art.

## Granularity decision

Choose the smallest generation unit that preserves consistency without reducing detail.

### Generate ONE ASSET when

Use one isolated asset per generation for:

- important characters / portraits;
- hero illustrations;
- item thumbnails that need high detail;
- one-off environment props;
- app-store / marketing artwork;
- high-value empty states;
- final production exports.

Benefits: maximum usable resolution, easier QA, easier transparent-background control, easier versioning, easier replacement, and fewer cross-object artifacts.

### Generate a FAMILY SHEET when

Use one coherent sheet for several related static assets when consistency matters:

- item families;
- icon families;
- expression sheets;
- pose sheets;
- closely related object variants;
- palette/style exploration.

A family sheet must define exact object count, equal visual scale where appropriate, clear spacing, no overlap, no labels unless intentional, a simple or transparent background, one object per logical cell, and a slicing/export plan.

Treat family sheets as either:

1. **style-lock/reference sheets**, then regenerate important assets individually; or
2. **production sheets**, only when cell geometry and export requirements are explicit.

### Generate a SPRITE SHEET when

Use a sprite sheet for sequential animation frames that must preserve character identity, scale, facing direction, camera, palette, and anchor/baseline.

Sprite sheets are a production format, not a generic asset-board format.

### Generate a UI MOCKUP / STYLE BOARD when

Use one combined image to validate art direction, composition, visual density, palette, product mood, and UI + asset relationship.

Never treat a style board as a substitute for the actual coded interface and separate assets.

## Detail budget

The more unrelated objects placed into one generation, the less effective detail budget each object receives.

Avoid one image containing phone UI + multiple characters + many item thumbnails + icons + pets + environment props + text when the goal is production-quality assets.

Prefer isolated generations or tightly controlled family sheets.

## Resolution strategy

Generate according to final usage:

```text
final 16–32px semantic icon
→ prefer SVG/vector

final 48–96px raster asset
→ create a substantially larger clean source, then downsample

final 120–300px illustration
→ use a high-resolution source optimized for that container

large hero/background
→ generate for target aspect ratio and crop behavior
```

Do not generate 4K merely because larger is possible. Do not generate tiny sources that will be scaled up.

## Text separation rule

Operational/interface text should remain live whenever possible.

Do not bake provider names, prices, inventory quantities, timers, button labels, descriptions, localized strings, or dynamic statuses into generated raster assets.

Generate the visual object/character only, then render text in code.

## Export rule

Final production exports should be independently addressable:

```text
courier/fast.webp
courier/normal.webp
inventory/lavender-shampoo.webp
inventory/oatmeal-shampoo.webp
empty-state/out-of-stock.webp
icons/delivery-risk.svg
```

Do not rely on runtime cropping from a concept board.
