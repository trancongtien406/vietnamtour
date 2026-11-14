# Asset Decision Engine

Use this before creating any new visual asset.

## Decision tree

```text
Does the interface actually need a visual?
├─ no → keep text / structure / whitespace
└─ yes
   ↓
Does an approved project asset already solve it?
├─ yes → reuse
└─ no
   ↓
Is this a common action or established semantic concept?
├─ yes → use the existing icon system/library
└─ no
   ↓
Must it be crisp, scalable or editable as geometry?
├─ yes → vector / SVG / code-native graphic
└─ no
   ↓
Is its main job illustration, atmosphere or expressive identity?
├─ yes → raster/vector illustration depending style
└─ no
   ↓
Does it need runtime state / interaction?
├─ yes → code animation / stateful visual / sprite depending context
└─ no
   ↓
Is this part of a game/world production pipeline?
├─ yes → production asset spec + manifest
└─ no → static visual asset
```

## Asset roles

Classify by role before format.

- Semantic: status icon, risk symbol, map marker, profession symbol.
- Recognition: product thumbnail, inventory item art, avatar, media thumbnail.
- Explanatory: onboarding illustration, empty-state illustration, diagram.
- Identity: mascot, character, custom shop emblem, branded illustration.
- Atmospheric: environmental art, decorative foliage, background texture.

Atmospheric visuals require the strongest restraint.

## Decision evidence

For every non-trivial generated visual, be able to answer:

- Why is this visual needed?
- Why is this format appropriate?
- Why is reuse not enough?
- At what size/context will it be consumed?
- Which project style source governs it?

## Granularity gate

After choosing the asset type, decide the production unit:

```text
single isolated asset
family/style sheet
sprite sheet
concept/style board only
```

Use `ASSET-GRANULARITY.md` before generation. Asset type and asset granularity are separate decisions.
