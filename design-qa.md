# DropdownButton Selectable Mode Design QA

## Comparison Target

- Source visual truth:
  - `docs/components/button-group-dropdown-button/selectable-source-closed.png`
  - `docs/components/button-group-dropdown-button/selectable-source-open.png`
- Browser-rendered implementation:
  - `docs/components/button-group-dropdown-button/selectable-implementation-closed.png`
  - `docs/components/button-group-dropdown-button/selectable-implementation-open.png`
- Side-by-side comparison evidence:
  - `docs/components/button-group-dropdown-button/selectable-comparison-closed.png`
  - `docs/components/button-group-dropdown-button/selectable-comparison-open.png`
  - `docs/components/button-group-dropdown-button/selectable-size-comparison.png`
- User-reported size-regression evidence:
  - `docs/components/button-group-dropdown-button/selectable-size-source.png`
- Browser-rendered size-regression implementation:
  - `docs/components/button-group-dropdown-button/selectable-size-implementation.png`
- Storybook URLs:
  - `http://127.0.0.1:6007/iframe.html?id=components-dropdownbutton--selectable-reference-closed&viewMode=story`
  - `http://127.0.0.1:6007/iframe.html?id=components-dropdownbutton--selectable-reference-open&viewMode=story`
- Browser viewport: 1280 × 720 CSS pixels. The supplied source captures are
  Retina-scale crops; implementation evidence was normalized to the same
  approximate component scale before comparison.
- States: dark-theme closed state with `Squash and merge` selected; dark-theme
  open state with `Create a merge commit` selected and three described choices.
  The regression comparison adds the complete variants-and-sizes matrix, with
  the user capture normalized to the implementation's 1280-pixel width.

## Full-View Comparison Evidence

The side-by-side boards compare the source and implementation in one image at
matched component scale. The implementation preserves the target hierarchy:
an attached two-button seam, dominant selected primary label, compact chevron
trigger, menu aligned to the complete composite, a checked selected row, bold
action labels, supporting descriptions, and a clear open/closed relationship.

The source's GitHub blue and larger product-specific surface radius are not
copied. PRD #378 defines the source as behavioral and hierarchical rather than
branded, so the implementation intentionally uses the existing Dethink
semantic primary, surface, border, radius, focus, and typography tokens.

The size-regression board puts the user-reported broken matrix and the revised
browser render in one input. The revised `xs`, `sm`, `md`, `lg`, and `xl`
chevron segments now share the exact height of their primary segment rather
than remaining fixed at the default 40-pixel control height.

## Focused Region Comparison Evidence

The target is a single component rather than a larger screen, so the saved
implementation images are focused component crops. They retain every fidelity
detail needed for review: label weight, attached seam, chevron geometry,
selected check, item padding, description wrapping, focus treatment, surface
border, menu width, and all five size pairs. Every relevant control remains
readable in the combined boards, so no smaller secondary crop was needed.

## Required Fidelity Surfaces

- Fonts and typography: the existing Dethink system font is retained. The
  selected primary remains strong and readable; selectable item labels use a
  semibold hierarchy and descriptions use the library's readable small-body
  scale with stable wrapping.
- Spacing and layout rhythm: the closed control matches the source's practical
  CSS-scale height and attached proportions. The open surface is approximately
  25rem wide, aligns to the complete composite, and gives descriptions enough
  line length without losing menu density.
- Colors and visual tokens: semantic Dethink tokens replace GitHub branding by
  design. Selected, focused, disabled, loading, destructive, dark, and forced
  color states remain distinguishable without relying on motion.
- Image quality and asset fidelity: the target contains no raster product
  imagery. The selected check and chevron are tree-shakeable Lucide icons; no
  handwritten SVG, CSS drawing, emoji, or placeholder asset was introduced.
- Copy and content: the three merge methods and descriptions preserve the
  source's action hierarchy while remaining standalone and product-neutral.
- Responsiveness and accessibility: dedicated stories cover narrow labels,
  long descriptions, RTL, density, themes, Motion presets, and reduced motion.
  The browser-verified interaction stories expose two native Tab stops,
  `menuitemradio`/`aria-checked` selection, disabled-choice policy, Escape focus
  return, choose-without-execute behavior, and later primary execution.
- Motion continuity: a dedicated story changes from a 42-pixel short label to
  a 375-pixel long label. Browser sampling recorded intermediate viewport widths
  of approximately 103, 309, 359, and 374 pixels before settling at 375 pixels,
  while the attached button border itself was never scale-transformed.

## Findings

No actionable P0, P1, or P2 differences remain.

The remaining differences—brand color, exact font metrics, and product-specific
radius—are expected token substitutions required by the approved PRD and the
existing Dethink design system, not fidelity regressions.

## Comparison History

### Pass 1 — blocked

- [P2] The first open-state implementation used the generic menu maximum width
  and default item hierarchy. Compared at the same component scale, the menu
  was materially narrower than the source and its 12px descriptions were too
  quiet, weakening scanability.
- Fix: the reference story now permits a 25rem surface, selectable action labels
  are semibold, descriptions use the small-body scale, and line wrapping is
  verified in the narrow-container story.
- Additional polish: the inherited handcrafted chevron was replaced with the
  Lucide `ChevronDown` icon while its open-state rotation remains Motion-owned.

### Pass 2 — passed

- Post-fix evidence:
  - `docs/components/button-group-dropdown-button/selectable-comparison-closed.png`
  - `docs/components/button-group-dropdown-button/selectable-comparison-open.png`
- The revised surface matches the intended width, hierarchy, checkmark
  redundancy, description density, attached seam, and component-scale rhythm.
  No actionable P0/P1/P2 mismatch remains.

### Pass 3 — size and label-width regression blocked

- [P1] The user-reported matrix showed the chevron segment fixed at the default
  40-pixel height while `xs`, `sm`, `lg`, and `xl` primary segments used their
  correct 28, 32, 44, and 48-pixel heights. This visibly broke attached seams.
- [P2] Changing selected action labels swapped the text but snapped the
  composite width, weakening continuity between related primary actions.
- Fix: the menu trigger now inherits the public Button size and overrides only
  its square inline size. The label viewport measures intrinsic content width
  and animates that numeric width with Motion; reduced motion and the `none`
  preset resolve immediately.

### Pass 4 — passed

- Post-fix evidence:
  - `docs/components/button-group-dropdown-button/selectable-size-comparison.png`
- Computed browser geometry is exactly 28/28, 32/32, 40/40, 44/44, and 48/48
  pixels for primary/trigger height across `xs` through `xl`; every trigger is
  square. The label-width trace contains real intermediate sizes rather than an
  immediate layout jump. No actionable P0/P1/P2 mismatch remains.

## Interaction And Runtime Evidence

- Browser-verified Storybook flows: selectable choose-then-execute, controlled
  selection, animated label-width change, disabled-selected/loading/destructive
  policies, disabled-choice guard, Escape dismissal, and focus return.
- Browser console errors after the final build: none.
- Automated coverage: 102 focused component-family tests and 150 accessibility
  tests passed; SSR/hydration, typecheck, registry smoke, showcase build, and
  Storybook production build also passed.

## Implementation Checklist

- [x] Closed selected primary matches the intended attached hierarchy.
- [x] Open choice surface exposes checked selection and supporting descriptions.
- [x] Selection and execution remain separate events.
- [x] Component tokens replace source branding intentionally.
- [x] Every split/selectable size keeps equal segment heights and a square menu
      trigger.
- [x] Short/long primary labels animate numeric width through Motion without
      scaling attached borders.
- [x] Keyboard, focus return, accessibility, RTL, responsive, and reduced-motion
      coverage is present.
- [x] Final browser evidence has no console errors.

final result: passed
