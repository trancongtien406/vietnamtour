# Asset Manifest

## Purpose

The manifest is the contract between Design and Implementation.

Do not scatter fragile file paths across product code.

Prefer stable semantic keys:

```text
inventory.lavender_shampoo
courier.fast
icon.delivery.risk
pet.corgi.walk.right
environment.street_lamp.green
```

Possible metadata:

- file;
- type;
- role;
- dimensions;
- display size;
- variants;
- frames;
- anchor;
- source;
- license;
- style family;
- runtime notes.

Asset metadata belongs upstream rather than being inferred from arbitrary
filenames at runtime.

## Source granularity

Each manifest entry should point to a production asset or intentional production sheet.

Do not register arbitrary crop coordinates into a style board merely to reuse pieces of a mixed concept image.

If an asset originates from a family sheet, record that relationship explicitly and export a stable production file when practical.
