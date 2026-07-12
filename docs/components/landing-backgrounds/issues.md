# Landing-Backgrounds Implementation Issues

PRD: [#420](https://github.com/parveshh/dethink-components/issues/420) — Landing-page animated background components (technical/geometric set).

Tracer-bullet vertical slices, in dependency order. Branches stack: `feature/prd-420-landing-backgrounds` off `main`, then each issue branch off the previous.

| # | Issue | Slice | Type | Blocked by |
|---|---|---|---|---|
| 1 | [#421](https://github.com/parveshh/dethink-components/issues/421) | GridBeamsBackground + shared foundation (seeded-random util, shared contract/anatomy, Effects category, HeroTextAnimation move) | HITL | — |
| 2 | [#422](https://github.com/parveshh/dethink-components/issues/422) | ScanGridBackground (direction variant) | AFK | #421 |
| 3 | [#423](https://github.com/parveshh/dethink-components/issues/423) | DotMatrixBackground (masked ripple overlays) | AFK | #422 |
| 4 | [#424](https://github.com/parveshh/dethink-components/issues/424) | LightStreaksBackground (rotated sweep rails) | AFK | #423 |
| 5 | [#425](https://github.com/parveshh/dethink-components/issues/425) | StarfieldBackground (SVG layers, pointer parallax) + final stacked PR into the PRD branch | AFK | #424 |

Every slice is end-to-end: component + four test flavors, registry item, showcase page/examples/props, Storybook stories, playground import, package exports, catalog entry, changeset, and green `pnpm check` / `registry:validate` / `build`.
