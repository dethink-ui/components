# Relay AI research landing

Relay is the selected landing-page direction from the 2026-09-19 imagegen exploration. It adds a centred editorial hero, a wide research document, source-linked findings, an evidence section, FAQ, and a closing invitation to try a sample workspace.

- PRD: [#455](https://github.com/parveshh/dethink-components/issues/455)
- Page and evidence journey: [#456](https://github.com/parveshh/dethink-components/issues/456)
- Topic exploration and guided sample: [#457](https://github.com/parveshh/dethink-components/issues/457)
- Gallery and accessibility acceptance: [#458](https://github.com/parveshh/dethink-components/issues/458)
- [Approved mockup](approved-mockup.png)
- Route: `/recipes/relay-landing`

## Try the recipe

1. Follow **Explore a sample** to the research canvas.
2. Switch between Customer feedback, Market signals, and Product decisions. The question, answer, findings, recommendation, and source set change together.
3. Search source titles. Clear an empty search, or switch topics to reset the filter. Inline citations still open their sources when those sources are filtered out.
4. Open any source, inline citation, **View evidence**, or **Inspect this source**. Read the highlighted passage and close the dialog; focus returns to its trigger.
5. Choose **Try the workspace**, name a sample workspace, and complete the flow. The canvas reflects the saved name. Cancelled edits are discarded; refresh resets the demonstration.

The three research sets are authored, fictional examples. The page does not invoke an AI model, upload documents, create an account, persist data, or send messages.

## Composition and portability

The recipe uses existing Tabs, Card, Badge, Button, Dialog, Field, Input, and Accordion primitives. It adds no package dependency, public component API, or registry block.

The source shown on the recipe page is the exact rendering module. When copying it into another project, copy `relay-landing.css` beside it, use the documented Dethink base CSS, and replace the showcase-only presentation type with the same local `embedded | full-page` type if needed. The local stylesheet supplies Relay's semantic cobalt/ink/paper tokens and their dark counterparts. Dethink controls continue to use standard semantic utilities; colours are not hard-coded into individual controls. The Relay brand stays cobalt while the surrounding showcase can change brand.

Overlay classes carry the same token scope into portalled dialogs. A recipe-local selector gives the existing dialog panel a layout box so it can receive initial focus; no shared Dialog implementation is changed. Citation containers use a `div` because Dialog's layout wrapper is a `div`, which cannot be placed inside an HTML paragraph.

Topic and workspace-name state is local. The selected topic determines all related content directly; no effects copy derived state. Each source has a stable identifier and a matching finding. Search is reset in the topic-change handler.

## Responsive and accessible behaviour

- One primary heading within the product surface, semantic navigation, a named research region, and a clear heading hierarchy.
- Tab arrow-key navigation, labelled source search, visible citation names, focus-trapped dialogs, Escape dismissal, and focus restoration.
- The mobile answer precedes the source list. Topic tabs scroll inside their own strip; the page itself does not overflow. Product navigation remains visible.
- Workspace naming uses a visible label, native required validation, a meaningful trimmed-name check, an associated error, and a polite completion status.
- Light/dark styling, a visible selected-tab outline in forced colours, and reduced-motion handling. The page adds no animation runtime; tabs and FAQ use their static presets.
- The production recipe respects the existing fluid, maximum-1200px full-page canvas. Details and source remain below the product.

## Verification

The dedicated Playwright suite covers gallery discovery and source disclosure; the real 1200×675 thumbnail; hydration; topic/source consistency; search recovery/reset; keyboard and focus restoration; workspace naming, cancel and refresh; 390px, 768px, 1440px and 1920px reflow; source-row clipping; light/dark axe checks including evidence dialogs; forced colours; reduced motion; and FAQ operation.

Run against the standard showcase seam:

```sh
pnpm exec playwright test e2e/showcase-relay-landing.spec.ts
pnpm --filter @dethink/showcase typecheck
pnpm --filter @dethink/showcase build
```

Capture the gallery image from a running production server:

```sh
SHOWCASE_BASE_URL=http://127.0.0.1:3026 pnpm capture:recipes relay-landing
```

The gallery capture is an actual production screenshot. The imagegen mockup is approval reference material only. Automated axe and keyboard checks do not substitute for testing with an actual screen reader.

The implementation was developed and verified in an isolated checkout from main at `5260a2a`. It covers the three linked implementation issues and excludes unrelated uncommitted chat, recipe, and component-polish work from the primary checkout.

## Verification result — 2026-09-19

All 12 dedicated Chromium checks passed against the isolated production server on port 3026. The showcase production build, TypeScript check, scoped ESLint, Prettier, and diff whitespace checks passed. Desktop and mobile captures were visually reviewed after correcting inline-dialog HTML nesting and source-row height. The three captured views reported no runtime page errors; the longest permitted workspace name was also checked on mobile.

- [Desktop, light](captures/desktop-light.png)
- [Mobile, light](captures/mobile-light.png)
- [Mobile, dark](captures/mobile-dark.png)

The older committed baseline has a missing Hush & Hearth thumbnail (already present among unrelated uncommitted work in the primary checkout). That existing gallery request is outside this change. Relay's thumbnail and gallery-to-source journey both pass. Verification here is scoped to Relay and does not claim the legacy, hard-coded catalog-wide test inventory is current.
