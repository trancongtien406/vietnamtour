# Game Production Assets

## Prime distinction

Concept art is not production art.

A game-ready asset needs runtime constraints.

## Sprite specification

Before generation define:

- identity;
- logical canvas;
- target runtime size;
- frame count;
- direction;
- animation action;
- anchor/pivot;
- baseline;
- loop behavior;
- FPS target;
- transparency;
- palette/style source.

## Animation workflow

```text
approved base asset
→ animation spec
→ coherent strip/set
→ extract frames
→ normalize scale
→ normalize anchor
→ preview loop
→ in-engine test
```

Avoid generating each animation frame independently when consistency matters.

## QA

Check identity drift, scale drift, baseline jump, accidental camera motion,
silhouette readability, loop pop, edge artifacts, palette drift, and actual
runtime readability.

## Sheet semantics

Do not confuse a concept asset board with a production sprite sheet.

A production sprite sheet contains frames/variants with explicit runtime meaning, cell geometry, anchor/baseline rules, and extraction metadata.

A mixed board containing UI, props, characters and labels is not a sprite sheet.
