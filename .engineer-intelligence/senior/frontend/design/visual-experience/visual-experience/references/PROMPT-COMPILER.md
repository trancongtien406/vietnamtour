# Prompt Compiler

## Principle

Do not maintain one universal "good image prompt".

Compile generation/edit instructions from:

```text
PROJECT STYLE
+ ASSET ROLE
+ ASSET SPEC
+ DISPLAY CONTEXT
+ REFERENCES
+ OUTPUT CONSTRAINTS
```

## Useful fields

- ROLE;
- GRANULARITY (single asset / family sheet / sprite sheet / concept board);
- PURPOSE;
- SUBJECT;
- DISPLAY CONTEXT;
- REAL DISPLAY SIZE;
- STYLE SOURCE;
- IDENTITY REFERENCE;
- COMPOSITION;
- PERSPECTIVE;
- LIGHTING;
- PALETTE;
- MATERIAL;
- BACKGROUND;
- OUTPUT;
- CONSTRAINTS;
- AVOID.

For edits:

```text
KEEP:
- identity
- composition
- camera
- palette
- lighting
- style

CHANGE:
- one targeted delta
```

Structured reasoning does not require bloated final prompts.

## Production prompt requirement

For production assets, explicitly state what must **not** be included.

Typical exclusions:

```text
no UI card
no labels
no buttons
no extra objects
no scenery
no baked text
no decorative frame
```

unless those are intentionally part of the asset itself.
