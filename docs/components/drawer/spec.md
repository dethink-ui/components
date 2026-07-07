# Drawer Spec

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/271

Package target: `@dethink/components`.

## Branch Workflow

Branch names follow the repository workflow in `CLAUDE.md`:

1. `feature/prd-271-drawer-sheet`
2. `feature/issue-272-drawer-contract-docs`
3. `feature/issue-273-drawer-core-primitive`
4. `feature/issue-274-drawer-drag-snap-handle`
5. `feature/issue-275-drawer-background-scale-edge-swipe`
6. `feature/issue-276-drawer-nested-shared-element`
7. `feature/issue-277-drawer-registry-docs-verification`

Create the PRD branch from the current integration base. Create Issue 1
(#272) from the PRD branch, then stack each later issue branch from the
previous issue branch unless the GitHub issue dependency graph says
otherwise. #275 and #276 are both blocked only by #274 (not by each other),
so they branch as siblings from `feature/issue-274-drawer-drag-snap-handle`.
#277 is blocked by both #275 and #276: branch it from
`feature/issue-276-drawer-nested-shared-element` and merge
`feature/issue-275-drawer-background-scale-edge-swipe` into it before
starting #277's own work. The final implementation PR should target the PRD
branch, not the repository default branch, unless explicitly requested.

## Purpose

Drawer provides the side/bottom/top overlay panel layer for mobile
navigation, filter sheets, persistent inspector rails, CRUD row-detail
flows, and scheduler event editors — the gesture-driven, edge-anchored
surface Dialog v1 explicitly excludes. It should make drag-to-dismiss,
snap points, and non-modal "push" layout accessible by default while
preserving the Dethink provider-token styling contract, shadcn-compatible
anatomy, controlled open-state patterns, Storybook/docs coverage, registry
portability, and SSR safety.

Drawer is one unified component family covering all four edges through a
`direction` prop, rather than shadcn's split `Sheet` (side-anchored,
CSS-only) and `Drawer` (vaul, bottom-sheet-only) primitives.

## Public API

The planned component family is:

- `Drawer`
- `DrawerTrigger`
- `DrawerContent`
- `DrawerHeader`
- `DrawerFooter`
- `DrawerTitle`
- `DrawerDescription`
- `DrawerClose`
- `DrawerHandle`

Exports should include class-name helpers and public prop/data types for
each public slot, following Dialog's `dialogContentClassNames`-style
pattern (hand-written exported functions composing `cn`, not `cva`).

`DrawerContent` owns the modal backdrop overlay in modal mode. The overlay
is exposed for styling through `overlayClassName`, an exported overlay
class-name helper, and a stable `data-slot="drawer-overlay"` attribute,
matching Dialog's `overlayClassName` / `data-slot="dialog-overlay"`
convention.

## Prop Contract

Use Dethink public prop names while mapping to React Aria internals in
modal mode:

| Prop | Purpose |
| --- | --- |
| `direction` | Anchor edge: `top`, `bottom`, `left`, or `right`. |
| `modal` | Defaults to `true`. `false` renders non-modal "push" layout. |
| `size` | Named direction-aware size: `sm`, `md`, `lg`, `xl`, or `full`. In `top`/`bottom` drawers it maps to height; in `left`/`right` drawers it maps to width. |
| `fullSize` | Explicit full-edge shortcut. Equivalent to `size="full"` unless `dimension` is supplied. |
| `dimension` | Custom direction-aware size. Accepts CSS lengths/expressions or a number (treated as px). In `top`/`bottom` drawers it maps to height; in `left`/`right` drawers it maps to width. |
| `open` | Controlled open state. Maps to React Aria `isOpen` in modal mode. |
| `defaultOpen` | Uncontrolled initial open state. |
| `onOpenChange` | Called when the drawer opens or closes. |
| `dismissible` | Allows outside interaction to close in modal mode. Maps to `isDismissable`. |
| `keyboardDismissDisabled` | Disables Escape/platform close requests as a group. Requires a visible close affordance. Maps to `isKeyboardDismissDisabled`. |
| `snapPoints` | Array of fractions in `(0, 1]` of the drawer's open size the drawer can rest at. `1` is the maximum reachable open position; it is not implicitly added if omitted. |
| `activeSnapPoint` | Controlled active snap point. |
| `defaultSnapPoint` | Uncontrolled initial snap point. |
| `onActiveSnapPointChange` | Called when the active snap point changes (drag or programmatic). |
| `closeThreshold` | Fraction of content size that triggers a distance-based dismiss. |
| `velocityThreshold` | px/s flick velocity that triggers a dismiss below `closeThreshold`. |
| `dragHandleOnly` | Defaults to `true`. Restricts drag initiation to `DrawerHandle`/header region. |
| `backgroundScale` | Enables the iOS-style background push/scale wrapper convention while modal. |
| `edgeSwipeToOpen` | Defaults to `false`. Opt-in edge-swipe gesture to open the drawer. |
| `edgeSwipeHitRegionSize` | Width/height in pixels of the edge-swipe hit-region, along the drawer's drag axis. Defaults to `24`. |
| `layoutId` | Passthrough to the underlying `motion.div` for optional shared-element entrance from a trigger. |
| `motionPreset` | `none` \| `subtle` \| `standard` \| `expressive`, matching CommandPalette's contract. |
| `reducedMotion` | Explicit override that forces the CSS-only fallback regardless of `prefers-reduced-motion`, matching CommandPalette's `reducedMotion` prop contract (`propValue ?? prefersReducedMotion`). |
| `className` | Consumer class composition for the public slot. |
| `overlayClassName` | Consumer class composition for the backdrop overlay slot rendered by content (modal mode only). |
| `children` | React node or render function where React Aria provides a close callback (modal mode). |

## Public Contract

- Open state supports controlled `open`, uncontrolled `defaultOpen`, and
  `onOpenChange` for both directions of change (trigger, close affordances,
  close requests, drag-to-dismiss, and outside dismissal where enabled),
  identical to Dialog's contract.
- `direction` supports `top`, `bottom`, `left`, `right`, each with correct
  anchor, sizing, and enter/exit transform direction. Direction values are
  physical anchors and do not reposition based on provider `dir` — this
  matches Dialog's own RTL convention (logical spacing only, no
  repositioning) and avoids surprising a consumer who explicitly requested
  a literal edge. RTL affects internal logical alignment and spacing
  (handle, close button, header/footer padding) via `ps-`/`pe-`/`start-`/
  `end-` utilities, and, starting with issue #275, the default
  `edgeSwipeToOpen` hit-region uses the reading-direction-appropriate edge
  unless a consumer overrides it explicitly.
- `modal` (default `true`) reuses Dialog's React Aria ModalOverlay/Modal
  substrate and shared provider-aware portal helper for focus containment,
  Escape, outside-dismissal filtering, and background inertness.
  `modal={false}` renders inline through a documented `DrawerPushContainer`
  that shifts sibling layout and manages focus without trapping it, per the
  WAI-ARIA non-modal dialog pattern. This is the one behavioral fork between
  modal and push mode; every other prop (direction, snap points, drag,
  motion presets) behaves identically in both modes.
- Snap points, drag-to-dismiss, background scale, edge-swipe, nested
  drawers, and shared-element morph are all Motion-driven polish on top of
  a required `motion/react` runtime dependency. Every one of them has a
  working non-drag/non-gesture equivalent (trigger, close button,
  `dismissible` outside click, Escape where allowed) and collapses cleanly to
  the CSS-only core primitive under `prefers-reduced-motion`,
  `reducedMotion`, or `motionPreset="none"`.
- A drawer opened from inside another drawer automatically recedes its
  parent (`DrawerNestedRoot`-equivalent context), reusing the same spring
  primitives as the base drag layer. The recommended maximum nested-drawer
  stack depth is **2** (a parent and one nested child); a deeper stack
  should collapse into a single drawer with in-place drill-down navigation
  instead of a third physically-stacked layer. A nested `Drawer` portals
  into its parent's *same* portal container rather than creating its own
  — otherwise React Aria's per-modal background-inertness (`ariaHideOutside`)
  can hide the nested drawer's own dialog from assistive tech the moment
  it opens, since two `ModalOverlay` instances in two separate top-level
  containers do not reliably exempt each other.
- Every public part forwards refs and composes `className` via `cn`.
- Stable slot attributes follow the existing `data-slot` convention:
  `drawer-overlay`, `drawer-content`, `drawer-panel`, `drawer-header`,
  `drawer-footer`, `drawer-title`, `drawer-description`, `drawer-close`,
  `drawer-handle`, `drawer-trigger`. Portal hosts use
  `data-slot="drawer-portal-container"`. Push-mode containers use
  `data-slot="drawer-push-container"`.
- State is exposed through data attributes rather than classes:
  `data-direction`, `data-modal`, React Aria `data-entering`/`data-exiting`
  on overlay and content for the CSS-fallback animation path, `data-motion`
  (active motion preset) and `data-reduced-motion` matching CommandPalette's
  convention, plus a `data-snap-point` reflecting the resolved active snap
  point where snap points are configured.

## Implementation Substrate

- Modal mode: use `react-aria-components` `ModalOverlay`, `Modal`,
  `Dialog`-equivalent render surface, and the shared provider-aware portal
  helper at `packages/components/src/utils/provider-portal.tsx`
  (`useProviderPortalRoot`, `DethinkPortalProvider`, targeting
  `UNSAFE_PortalProvider`) — the same substrate Dialog uses, with
  `portalSlot: "drawer-portal-container"`.
- Push mode: no `ModalOverlay`. Render inline in a `DrawerPushContainer`
  that shifts sibling layout via normal document flow (not a portal), and
  manage focus without trapping it (no focus-scope wrap, no background
  inertness), per the WAI-ARIA non-modal dialog pattern.
- Motion (`motion/react`) is isolated into a dedicated `drawer-motion.tsx`
  module — mirroring SlotPlanner's convention that only its motion module
  imports `motion/react` — covering: `drag` with `dragElastic`/
  `dragMomentum`, velocity-aware `onDragEnd` dismiss decisions (`info.
  velocity`, `info.offset`), spring interpolation between snap points,
  `layoutId`-driven background push/scale and shared-element entrance, and
  `AnimatePresence` for enter/exit choreography. Every exported motion
  component takes a `motionEnabled: boolean` (or equivalent reduced-motion/
  preset gate) prop with a plain-DOM-element fallback when disabled,
  matching SlotPlanner's gating pattern.
- No prior art exists in this repository for drag-to-dismiss, velocity
  thresholds, or spring-interpolated snap points (verified: SlotPlanner has
  no `drag`/`dragElastic`/`dragMomentum`/`onDragEnd` usage). Issue #274 must
  build this against current Motion API docs — fetch via Context7 before
  implementing per `CLAUDE.md`'s documentation-freshness rule.
- Keep public prop names stable even where React Aria or Motion prop names
  differ.
- Do not introduce Radix UI, Floating UI, vaul, or a standalone overlay
  manager for Drawer.
- Do not hand-roll ARIA role, focus containment, hidden outside content,
  Escape dismissal, or focus restore when React Aria already provides it in
  modal mode.

## Accessibility

- Drawer content must have an accessible name. Examples should use visible
  `DrawerTitle`. When design hides the title, a visually hidden title
  element must still be rendered so the accessible name survives, matching
  Dialog's convention.
- `DrawerDescription` should be wired through visibly where applicable.
- Modal-mode Drawer uses `role="dialog"`. Push-mode Drawer follows the
  WAI-ARIA non-modal dialog pattern (no focus trap, background remains
  interactive and not `aria-hidden`).
- Modal mode: focus moves into the drawer on open, remains contained while
  open, wraps through tabbable controls, and returns to the trigger on
  close — identical to Dialog.
- Push mode: focus moves into the drawer without trapping it; background
  content and controls remain reachable via Tab.
- Escape closes a modal drawer where allowed. If keyboard dismiss is
  disabled, there must be an obvious visible close path.
- Drag-to-dismiss must never be the only way to close a drawer: trigger,
  close button, `dismissible` outside click (modal), and Escape (modal) must
  all work regardless of `dragHandleOnly`, drag state, reduced-motion state,
  or `motionPreset`.
- Entry/exit, drag, snap interpolation, background scale, and shared-element
  morph must all respect `prefers-reduced-motion` through motion-safe
  utilities and the `motionEnabled`/preset gate in `drawer-motion.tsx`.
- Background content must be inert/hidden from assistive technologies in
  modal mode through the React Aria modal overlay behavior; push mode must
  not apply this inertness.
- RTL is inherited from provider `dir` for logical spacing/alignment
  (never hard-coded left/right utilities internally). `direction` itself
  stays a physical anchor and is not repositioned by `dir`; edge-swipe
  hit-regions (issue #275) default to the reading-direction-appropriate
  edge.

## Styling And Theming

Drawer is themed through `DethinkProvider` and `dethink-base`. It must not
accept a component-level `theme` prop.

Use provider-level tokens for:

- `--dt-color-background`
- `--dt-color-foreground`
- `--dt-color-muted`
- `--dt-color-muted-foreground`
- `--dt-color-border`
- `--dt-color-ring`
- `--dt-space-*`
- `--dt-radius-sm`
- `--dt-radius-md`
- `--dt-radius-lg`
- `--dt-shadow-*`
- `--dt-density-control`
- `--dt-density-gap`
- A dedicated handle token (background/foreground) distinct from
  border/muted tokens, so the drag affordance stays visible in light, dark,
  and high-contrast states.

The implementation should support light, dark, system, compact, default,
comfortable, nested provider scope, custom `themeConfig`, and RTL examples,
across every `direction` and both modal and push mode.

Additional styling requirements:

- Motion entry/exit: when Motion is enabled, the same spring translation
  primitive used for drag and snap drives the drawer from its closed edge to
  the active snap point on open, and back toward the closed edge on close.
  React Aria `data-entering`/`data-exiting` classes with tokenized
  `motion-safe:` Tailwind transitions remain the reduced-motion and
  `motionPreset="none"` fallback path.
- Motion (Motion-driven polish): drag, snap interpolation, entry/exit
  translation, background scale, and shared-element morph use Motion spring
  configuration constants documented alongside the component, gated by
  `motionPreset` and `prefers-reduced-motion`.
- Mobile viewports: full-size directions use dynamic viewport units
  (`dvh`) and respect safe-area insets, matching Dialog's `full` size.
- Scroll: inside-scroll bodies use `overscroll-behavior: contain`.
- Background scale wrapper: a documented convention (parallel to vaul's
  `data-vaul-drawer-wrapper`) applies scale-down plus dim to page content
  while a modal Drawer with `backgroundScale` is open. Reduced motion drops
  the scale transform and keeps only the dim/opacity transition. Consumers
  mark their app-root wrapper with `data-drawer-background-wrapper` and the
  exported `drawerBackgroundWrapperClassNames()` helper; Drawer toggles a
  `data-drawer-background-scale="scaled" | "dimmed"` attribute on that
  element (reference-counted across concurrently open `backgroundScale`
  drawers) rather than mutating inline styles.

## Out Of Scope

- Dialog and AlertDialog centered-modal behavior (separate component
  family).
- Popover, Tooltip, DropdownMenu, HoverCard, ContextMenu, Menubar,
  CommandPalette, and generic OverlayManager stacking scope.
- Sidebar's persistent primary-navigation shell; Drawer's non-modal push
  mode may inform a future Sidebar cleanup but does not modify Sidebar in
  this PRD.
- Toasts, notifications, and notification-center behavior.
- Bespoke shared-element orchestration across unrelated components beyond
  the consumer-supplied `layoutId` passthrough.
- Virtualization of drawer body content.
- Native `<dialog>` element, browser top-layer rendering, and declarative
  `closedby` light dismiss, consistent with Dialog's v1 scope.
- Router adapters, global keyboard-shortcut registration, and permissions
  engines.

## Verification Requirements

- Rendered component tests for every `direction`, modal versus push mode,
  controlled/uncontrolled open state, dismissal (`dismissible`,
  `keyboardDismissDisabled`, Escape, `dismissible` outside click), refs, className
  composition, and data-slot/data-state attributes.
- Unit tests for snap-point resolution/clamping, drag distance/velocity
  dismiss-decision logic, and nested-drawer stack bookkeeping.
- Keyboard/focus tests for modal focus containment and return-to-trigger,
  non-modal push-mode focus movement without trapping, and Escape
  behavior, reusing Dialog's focus-test patterns.
- Motion/reduced-motion tests for motion-preset data attributes, reduced-
  motion fallback (no drag, no background scale, no morph, CSS-only
  open/close), drag-to-dismiss threshold/velocity behavior, background
  push/scale, and nested-drawer recede/enter choreography, reusing
  CommandPalette's motion-preset test pattern (`data-motion`,
  `data-reduced-motion`).
- Accessibility tests with axe for labelled modal Drawer, labelled push-mode
  Drawer, every direction, and reduced-motion state.
- SSR render/hydration smoke tests for both modal and push mode.
- Storybook interaction tests for open/close per direction, modal versus
  push mode, snap points with handle drag, drag-to-dismiss (low/high
  velocity), background scale, edge-swipe-to-open (LTR/RTL), nested
  drawers, `layoutId` morph, motion presets, reduced motion, dark mode,
  density, and RTL.
- Registry validation and registry smoke tests for dependency metadata
  (Motion declared as a required runtime dependency from issue #274 onward,
  with reduced-motion and `motionPreset="none"` covering the CSS-only
  behavior), copied-source portability, aliases, CSS variable reliance,
  package exports, and provider-aware portal behavior.

## Research Sources

- Context7 `/emilkowalski/vaul` documentation, fetched 2026-07-07, for the
  current shadcn-ecosystem drawer feature set: snap points, draggable
  handle, `NestedRoot` nested drawers, `shouldScaleBackground` background
  scaling, and the `direction` prop.
- Modern Web Guidance `navigation-drawer` guide, fetched 2026-07-07, for
  baseline-safe mechanics and progressive-enhancement fallbacks this spec's
  CSS-fallback path stays compatible with in spirit.
- Repository prior art: `packages/components/src/components/dialog/
  dialog.tsx` and `packages/components/src/utils/provider-portal.tsx`
  (portal helper and ModalOverlay/Modal substrate); `packages/components/
  src/components/command-palette/command-palette.tsx` (motion-preset type,
  `data-motion`/`data-reduced-motion` convention, `useReducedMotion` gating
  from `motion/react`); SlotPlanner's motion-module isolation,
  `AnimatePresence`, and `layoutId` conventions (no drag-physics prior art
  found there — verified by repository-wide grep during planning).
