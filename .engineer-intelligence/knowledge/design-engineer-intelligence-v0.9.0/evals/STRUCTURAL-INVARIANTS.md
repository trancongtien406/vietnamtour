# Structural invariant gate

A substantial application UI fails when any blocker is present:

- [ ] navigation inaccessible at a supported viewport/input mode
- [ ] fixed/sticky shell obscures primary content
- [ ] desktop sidebar collapse and mobile drawer semantics are incorrectly conflated
- [ ] mobile drawer lacks valid close/focus/keyboard behavior
- [ ] accidental whole-page horizontal overflow
- [ ] no deliberate vertical scroll owner
- [ ] content only shrinks instead of adapting where the task becomes unusable
- [ ] critical action disappears without an alternative
- [ ] invalid keyboard/focus order
- [ ] reduced-motion or zoom/reflow causes loss of function

Non-blocking quality checks:

- [ ] global header and page header responsibilities are coherent
- [ ] state survives route/resize transitions sensibly
- [ ] long/empty/error/loading data states remain usable
- [ ] density is appropriate to task frequency and expertise
