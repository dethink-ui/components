# Full-page Recipe Demos — Implementation Notes

## Status

- GitHub PRD: [#394 — Full-page recipe demos](https://github.com/parveshh/dethink-components/issues/394).
- Completed slices: [#395 — Recipe full-page shell and representative dashboard](https://github.com/parveshh/dethink-components/issues/395), [#396 — Roll full-page demos across the recipe catalog](https://github.com/parveshh/dethink-components/issues/396), and [#397 — Verify full-page recipe journeys and visual quality](https://github.com/parveshh/dethink-components/issues/397).

## Approved Direction

- A recipe opens with the live product, not its documentation header.
- The demo uses the full available width and at least the remaining dynamic viewport height.
- A compact sticky bar provides Back to recipes, title, Details, and Source.
- Metadata, components used, source, implementation notes, and related recipes remain below the demo.
- The canonical recipe URLs, static metadata, source mapping, themes, brand tokens, and component behavior remain unchanged.
- No iframe or parallel demo route is introduced.

## Layout Contract

- The global showcase header remains visible and occupies 3.5rem.
- The compact demo bar occupies 3.5rem and stays below the global header.
- The live product receives a minimum block size of the dynamic viewport minus both bars.
- Full width uses the containing page width rather than `100vw`, avoiding scrollbar-induced overflow.
- The outer documentation preview border, radius, maximum width, and padding do not wrap the full-page product.
- Individual recipes may opt into the `full-page` presentation contract to remove embed-only framing without changing product content.

## Motion Contract

- The product preview renders immediately and is never scaled, delayed, or hidden for entrance animation.
- Only the compact demo bar receives a 240ms transform/opacity entrance using the showcase easing `(0.2, 0, 0, 1)`.
- Reduced-motion users receive the final bar state immediately.

## Test Seams

- Playwright production-route geometry at 1440×900 and 390×844.
- Natural keyboard order across Back, Details, and Source actions.
- Details and source remain reachable below the first viewport.
- Reduced-motion demo bar behavior and document-level overflow checks.
- Existing recipe-gallery route, source, theme, and accessibility journeys remain green.

## Work Log

- 2026-07-11: Audited the existing Command-center dashboard route. The preview began around 447px into the 900px desktop viewport and around 767px into the 844px mobile viewport.
- 2026-07-11: Published PRD #394 and dependency-ordered issues #395–#397 after approval of the full-page behavior and test seams.
- 2026-07-11: Started the shared demo-first route shell with Command Center as the representative recipe.
- 2026-07-11: Completed the #395 representative shell: the Command Center product now begins at 113px on desktop and mobile, fills the remaining dynamic viewport, and replaces its fixed desktop sidebar with the package Sidebar mobile drawer below the `md` breakpoint.
- 2026-07-11: Verified the representative route with TypeScript, targeted ESLint, a successful production build, retained recipe-gallery and final-journey coverage, and three focused desktop/mobile/keyboard/reduced-motion Playwright cases.
- 2026-07-11: Completed the #396 catalog rollout. All ten recipe previews now opt into the shared `full-page` presentation contract, fill the available width and remaining dynamic viewport, and keep embed-only framing out of the canonical recipe route.
- 2026-07-11: Added a production-route contract test for every recipe at 1440×900 and 390×844, covering route identity, preview geometry, visible product surfaces, minimum viewport coverage, and horizontal overflow. The four focused full-page tests pass across all twenty route/viewport combinations.
- 2026-07-11: Visually reviewed representative marketing, security, CRUD, authentication, AI workspace, and support surfaces. Responsive navigation and stacked layouts remain legible, and product-internal borders continue to use the components' own border tokens.
- 2026-07-11: Completed #397 with nine focused full-page checks and the complete 44-test Chromium showcase suite. Verification covers every recipe at desktop and mobile widths, natural keyboard order, reduced motion, forced colors, 200%-equivalent reflow, and the full gallery-to-demo-to-details-to-source-to-gallery journey.
- 2026-07-11: Axe WCAG 2 A/AA scans pass on representative authentication, marketing, dashboard, and AI product surfaces in light and dark mode. The audit also corrected low-contrast supporting labels and status text plus a missing group role in the Command Center responder cluster.
- 2026-07-11: Added and visually accepted settled production captures for a desktop dashboard, desktop marketing page, mobile authentication flow, and mobile AI workspace. The capture script now waits for fonts and active animations before taking deterministic reduced-motion screenshots.
