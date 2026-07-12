# CardScroller overlap design QA

- Source visual truth: `/var/folders/sc/mrv63b7n05780tp6rgkkg9rh0000gn/T/codex-clipboard-2cb5f35d-9c7d-4fd0-87d5-50a4e54f1db5.png`
- Implementation screenshot: `.playwright-cli/card-scroller-overlap-final.png`
- Mobile screenshot: `.playwright-cli/card-scroller-mobile-final.png`
- Combined comparison: `.playwright-cli/card-scroller-overlap-comparison.png`
- Viewports: 1950 × 1071 desktop and 390 × 844 mobile
- State: light theme, Scale selected on desktop; light theme, Grow selected on mobile

## Full-view comparison evidence

The normalized side-by-side comparison shows the selected card centered above its immediate neighbors, with comparable vertical lift, edge overlap, softened siblings, and bottom-right previous/next controls. The implementation intentionally hides the scrollbar requested by the user, while the source still shows it. The selection summary and CTA below the component are showcase context rather than part of CardScroller.

## Focused region comparison evidence

The selected-card region is large enough to inspect border, scale, card spacing, neighbor overlap, arrow placement, and content legibility. No raster imagery or custom image assets are present, so a separate image-quality crop is unnecessary.

## Required fidelity surfaces

- Fonts and typography: Existing Dethink heading and body tokens preserve the source hierarchy, weight contrast, and readable line wrapping.
- Spacing and layout rhythm: Tokenized inline/block viewport padding prevents scaled cards from clipping. The selected card is centered when possible and overlaps both adjacent cards.
- Colors and visual tokens: Semantic theme tokens intentionally replace the source's amber accent with the active Dethink teal theme while preserving state contrast.
- Image quality and asset fidelity: No raster imagery, illustrations, logos, or custom assets are part of the target component.
- Copy and content: Pricing titles, descriptions, prices, features, billing note, and selection prompt match the reviewed showcase content.

## Findings

No actionable P0, P1, or P2 differences remain.

## Comparison history

1. P2 — The first 390px pass clipped the scaled selected card at the inline snap boundary.
   - Fix: Added logical scroll padding equal to the viewport's inline padding.
   - Post-fix evidence: The selected card bounds are 49.7–329.3px inside the 41–338px scroll viewport, with zero page-level horizontal overflow.
2. P2 — Selecting the third card initially left it at the trailing edge instead of between both neighbors.
   - Fix: Overlap mode now centers explicit and initial selections when space permits and closes the inter-card gap.
   - Post-fix evidence: Grow and Enterprise remain visible on either side of Scale, with 1–2px geometric overlap at the selected edges.

## Interaction verification

- Mouse dragging moved the pricing viewport from `scrollLeft: 279.5` to `0` without changing the selected Scale radio.
- The next arrow returned the viewport to `scrollLeft: 279.5` while Scale remained selected.
- Touch retains native browser scrolling; mobile uses `scroll-snap-type: x mandatory`.
- The computed scrollbar width is `none` on desktop and mobile.
- No page-level horizontal overflow is present at 390px.

## Follow-up polish

- P3 — The focused selected card shows both the selection border and focus ring. This is intentionally retained for keyboard clarity.

final result: passed
