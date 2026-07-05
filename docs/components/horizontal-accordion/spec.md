# HorizontalAccordion Component Spec

Status: Published to GitHub issue tracker.

Parent PRD: https://github.com/parveshh/dethink-components/issues/220

Implementation issue: https://github.com/parveshh/dethink-components/issues/221

Package target: `@dethink/components`.

## Purpose

HorizontalAccordion presents a small set of rich content sections in a
fixed-height horizontal band where exactly one section is expanded at a time.
Every section stays visible as a compact vertical Blade while the active
section's Panel expands to fill the remaining width. It is distinct from the
planned vertical Accordion (stacked disclosure) and from Tabs (collapsed
sections fully hidden): HorizontalAccordion's defining behavior is spatial,
always-visible section selectors with Motion-powered active-blade choreography.

The component follows the tabs interaction pattern: Blades form a tab list,
Panels are tab panels, and a single item is active at a time.

## Component Family

The v1 family includes:

- `HorizontalAccordion`: root state coordinator, geometry, layout detection,
  and Motion configuration boundary.
- `HorizontalAccordionItem`: item container binding one Blade and one Panel to
  a stable `value`.
- `HorizontalAccordionBlade`: the always-visible interactive selector button.
- `HorizontalAccordionBladeIcon`: optional supporting visual marker inside a
  Blade.
- `HorizontalAccordionBladeLabel`: optional primary identity inside a Blade,
  owning rotated/vertical text behavior. Content may be text or an image.
- `HorizontalAccordionPanel`: the expanding content region for an item.

All parts are exposed both as static properties on the root
(`HorizontalAccordion.Item`, `HorizontalAccordion.Blade`, ...) and as named
exports. Blade content is composition-based: text-only, icon-only, image-only,
and mixed arrangements are all supported through children.

## Dependencies

- Existing Dethink primitives and utilities: provider tokens, density and
  direction attributes, the shared class-name merge helper, Storybook/showcase
  patterns, registry conventions, the a11y test harness, and SSR test patterns.
- `motion` / `motion/react` is a required runtime dependency for the shared
  active-blade layout element and panel content choreography, consistent with
  the NavDock precedent for Motion-required components.
- No Radix, Floating UI, or new styling runtime.

## Public API Direction

Root-level props:

- `value`, `defaultValue`, and `onValueChange` for the active item, where
  `undefined` means no Active Item.
- `collapsible`: default `true`. When `false`, clicking the active Blade does
  not close it.
- `activationMode`: `manual` (default) or `automatic` focus activation.
- `bladeWidth`: number of pixels, default `72`.
- `height`: number of pixels, default `420`.
- `compactBreakpoint`: number of pixels of container width, default `640`.
- `animation`: `{ duration?: number; easing?: string; content?: boolean }`,
  defaults `260` / standard easing / `true`.
- `unmountInactivePanels`: default `false`; opts inactive Panel children out of
  staying mounted.
- `className`, `style`, and native div attributes.

Item props: stable required `value`, `className`, native div attributes.

Blade props: native button attributes, `disabled`, and
`iconPosition`: `start` (default) or `end`, with `top`/`bottom` accepted as
aliases.

BladeLabel props: `orientation`: `rotated` (default) or `vertical`;
`direction`: `bottom-to-top` (default) or `top-to-bottom`.

Every part accepts `className` merged through the shared class-merge helper so
consumer Tailwind utilities win. There is no `classNames` slot object. Each
part exports a `*ClassNames` recipe helper and its `*Props` type.

## State Model

- Single-active-item state: controlled via `value` + `onValueChange`,
  uncontrolled via `defaultValue`. Controlled mode is detected by the presence
  of the `value` prop.
- Clicking or pressing Enter/Space on an inactive Blade activates it.
- Activating the active Blade with `collapsible` true closes it and calls
  `onValueChange(undefined)`.
- With `activationMode="automatic"`, moving focus to an inactive Blade
  activates it.
- Item order follows JSX order only.
- Development builds throw for duplicate Item values and for Items that do not
  contain exactly one Blade and one Panel. Production builds skip validation.
- Inactive Panels stay mounted by default; `unmountInactivePanels` unmounts
  inactive Panel children.

## Compact Layout

- Compact Layout activates from component container width (ResizeObserver),
  not viewport width, when the container is at or below `compactBreakpoint`.
- In Compact Layout the active Panel renders above the Blade Tray, a
  horizontal row of compact selectors sharing the container width equally.
- Blade labels flatten to horizontal writing in Compact Layout.
- All parts expose `data-layout="default" | "compact"`.
- Layout detection is SSR-safe: no window or observer access during render,
  and the default layout renders on the server.

## Semantics And Accessibility

- Root renders `role="tablist"` with `aria-orientation="horizontal"`.
- Blades render as real `button` elements with `role="tab"`,
  `aria-controls` to their Panel, and `aria-expanded`/`aria-selected` state.
- Panels render `role="tabpanel"` with `aria-labelledby` to their Blade and
  `hidden` when inactive.
- Roving tabindex: exactly one Blade is tabbable — the focused Blade, else the
  active Blade, else the first enabled Blade. Disabled Blades are excluded.
- Keyboard: `ArrowLeft`/`ArrowRight` move focus between enabled Blades with
  direction resolved from the effective text direction (RTL flips), `Home` and
  `End` jump to the first/last enabled Blade, `Enter` and `Space` activate.
- Icon-only and image-only Blades accept an accessible name via `aria-label`
  or equivalent.
- Focus-visible treatment uses the ring tokens.

## Motion Contract

- The active-blade highlight is a Motion layout element with a shared
  `layoutId` scoped per instance (LayoutGroup keyed by `useId`), so the
  highlight glides between Blades and multiple instances never share state.
- Panel content entrance/exit is choreographed with `AnimatePresence` using
  opacity and translate only, delayed to start after the structural expansion
  begins.
- Structural expand/collapse (flex-basis) uses a tokenized CSS transition
  synchronized with Motion timings through component-scoped CSS custom
  properties, per the repo motion policy for simple static state changes.
- The `animation` prop tunes duration, easing, and whether panel content
  animates. `content: false` disables content choreography.
- Reduced motion: `MotionConfig reducedMotion="user"` for Motion-driven
  animation plus a `prefers-reduced-motion` fallback for CSS transitions.
  No state is communicated by animation alone.

## Styling And Tokens

- Tailwind-first implementation against Dethink semantic tokens: muted blade
  surface, primary active surface, border, ring, and foreground tokens. No
  hard-coded brand colors.
- Geometry (`bladeWidth`, `height`, `compactBreakpoint`) and animation timing
  surface as component-scoped CSS custom properties so Tailwind overrides
  remain possible.
- Data attributes are the public styling contract:
  - `data-slot` on every part
    (`horizontal-accordion`, `horizontal-accordion-item`,
    `horizontal-accordion-blade`, `horizontal-accordion-blade-icon`,
    `horizontal-accordion-blade-label`, `horizontal-accordion-panel`).
  - `data-state="active" | "inactive"` on Item, Blade, BladeIcon, BladeLabel,
    and Panel.
  - `data-layout="default" | "compact"` on all parts.
  - `data-icon-position` on Blade; `data-orientation` and `data-direction` on
    BladeLabel.
- Density and theme flow from the provider tokens; roundedness and panel
  alignment are controlled by consumer Tailwind classes.

## Registry Requirements

- `registry:ui` item named `horizontal-accordion` with the Motion runtime
  dependency, `dethink-base` registry dependency, and the real component,
  barrel, and class-merge helper files.
- Registry metadata must pass the registry validation script.

## Testing Seams

- Behavior tests (colocated component test file): controlled/uncontrolled
  state, collapsible behavior, activation modes, keyboard navigation including
  RTL, disabled-blade skipping and roving tabindex, composition validation,
  `unmountInactivePanels`, and Compact Layout with a mocked ResizeObserver.
- Accessibility automation with jest-axe covering representative compositions
  including icon-only Blades.
- SSR smoke test server-rendering the component.
- Storybook play tests for click activation, collapse, and keyboard flows;
  matrix stories for blade content mixes, density, dark theme, RTL, compact
  layout, and reduced motion.
- Registry validation, playground smoke render, package typecheck/test/build.

## Out Of Scope

- Multiple simultaneously open panels.
- Hover-to-open activation.
- Vertical-orientation variant (covered by the planned Accordion).
- Standalone npm package distribution.
- Drag-to-resize blades or persisted user sizing.
- Router/deep-link integration for the active item.
- Advanced screen-reader QA beyond the tabs pattern and axe automation.
