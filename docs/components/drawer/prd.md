# Drawer/Sheet PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/271.

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

Issues #275 and #276 both branch from #274 as sibling branches (neither is
blocked by the other). Issue #277 is blocked by both #275 and #276, so its
branch stacks on #276 and then merges #275 in before starting its own work.
See `issues.md` for the full dependency graph and branch stack notes.

## Problem Statement

Teams building SaaS dashboards, internal tools, B2B applications, mobile-web
navigation, filter panels, record inspectors, and scheduler event editors need
a side/bottom overlay layer that Dialog does not cover. The library now ships
Dialog and AlertDialog for centered modal content, but Dialog v1 explicitly
excludes gesture-driven drawer behavior, edge-anchored panels, non-modal
"push" layouts, and drag-to-close interaction. Teams needing a mobile nav
drawer, a bottom filter sheet, a persistent inspector rail, or a swipeable
record detail panel currently have to hand-roll drag physics, snap-point
math, background dimming/scaling, and focus/dismiss behavior themselves, or
reach for a third-party drawer library that does not share Dethink's token
contract, registry portability, or provider theming.

Without a Dethink Drawer/Sheet component, dashboard shells, mobile
navigation, CRUD row-detail flows, scheduler event editors, and AI-native
record inspectors remain inconsistent across keyboard, screen-reader, SSR,
theme, density, motion, mobile-viewport, and registry-installation surfaces,
and every product reimplements drag-to-dismiss and snap-point behavior from
scratch.

## Solution

Ship a single, provider-themed `Drawer` component family for
`@dethink/components` that covers side and bottom/top overlay panels in one
unified anatomy, using `react-aria-components` ModalOverlay/Modal (the same
accessibility substrate and shared provider-aware portal helper introduced
for Dialog) for focus containment, Escape handling, and background
inertness in modal mode, with Motion (`motion/react`) layered on top purely
for the gesture/spring polish: drag-to-dismiss, snap points, a draggable
handle, background push/scale, and optional shared-element entrance.

Drawer supports `direction` (`top`, `bottom`, `left`, `right`), `modal`
(default `true`) versus non-modal "push" layout for persistent panels,
snap points with a draggable handle, and a documented nested-drawer policy
where a drawer opened from inside another drawer automatically recedes its
parent. Every gesture-driven feature degrades cleanly: with `reducedMotion`,
`motionPreset="none"`, or `prefers-reduced-motion` set, Drawer still opens,
closes, and dismisses correctly through plain tokenized CSS transitions and
non-drag controls (trigger, close button, `dismissible` outside click, Escape
where allowed). Motion is a required runtime dependency, but motion is never
the only way to operate the component.

## Developer Value Compared With shadcn/ui Sheet And Drawer (vaul)

- shadcn/ui ships two separate primitives for this space: `Sheet` (Radix
  Dialog plus CSS transitions, side-anchored, no drag at all) and `Drawer`
  (wraps vaul, effectively bottom-sheet-only in practice). Dethink ships one
  `Drawer` family with a `direction` prop covering all four edges and both
  modal and non-modal layout, so consumers do not have to choose between two
  differently-behaved components for what is conceptually one pattern.
- vaul's drag physics are hand-rolled easing/velocity math on top of raw
  pointer events. Dethink Drawer uses Motion's spring physics for the drag
  release, so the transition from drag position to the resting open/closed
  state is continuous rather than a snap-back jump, and reuses the same
  drag/spring conventions already proven in this repository's SlotPlanner
  component.
- vaul's background scaling requires consumers to hand-add a
  `data-vaul-drawer-wrapper` attribute to their app shell. Dethink Drawer
  documents and ships a single `backgroundScale` wrapper convention with a
  matching reduced-motion fallback (dim-only, no scale).
- vaul has no non-modal "push" layout mode; every vaul drawer is an
  overlay. Dethink Drawer adds an explicit non-modal push mode for
  persistent inspector/filter rails in dashboard shells, matching the
  "Dashboard shell... responsive drawer" pattern already listed in this
  repository's component inventory.
- vaul's nested drawers (`Drawer.NestedRoot`) only recede the parent's scale.
  Dethink Drawer's nested policy is spring-driven and reuses the same motion
  primitives as the base drag layer, so parent-recede and child-enter
  motion stay visually consistent with the rest of the polish layer instead
  of being a separate code path.
- Neither shadcn primitive offers a documented shared-element entrance.
  Dethink Drawer exposes a `layoutId` passthrough so a trigger element (a
  table row, card, or FAB) can visually morph into the drawer panel, reusing
  the `layoutId` shared-layout pattern already established by SlotPlanner's
  day-tab indicator.
- Every polish feature (drag, snap, background scale, morph) can be dialed
  down to a plain instant/CSS-fade show-hide under reduced motion or
  `motionPreset="none"`. Drawer is the component in this family that requires
  Motion; the rest of the library stays Motion-free unless a component has a
  similarly explicit interaction reason.

## User Stories

1. As a mobile-web user, I want a navigation drawer that slides in from the side, so that I can reach app navigation without a full-screen modal.
2. As a dashboard engineer, I want a bottom sheet for mobile filter panels, so that filtering does not require a full page or a centered dialog.
3. As a dashboard engineer, I want a persistent, non-modal inspector rail, so that a record detail panel can stay open alongside page content instead of overlaying it.
4. As a CRUD-flow engineer, I want Drawer as a lighter-weight alternative to Dialog for row-detail edit and peek flows, so that quick edits do not require a full modal.
5. As a scheduler engineer, I want an event-detail drawer, so that calendar/scheduler views can edit an event without navigating away.
6. As a product engineer, I want a `direction` prop supporting `top`, `bottom`, `left`, and `right`, so that one component covers side panels, bottom sheets, and top sheets.
7. As a product engineer, I want `modal` (default `true`) versus non-modal "push" layout, so that I can choose overlay behavior or a layout-shifting persistent panel per use case.
8. As a product engineer, I want controlled and uncontrolled `open`/`defaultOpen`/`onOpenChange`, so that Drawer state matches the Dialog contract I already know.
9. As a product engineer, I want `dismissible` and `keyboardDismissDisabled` props, so that outside-click and Escape dismissal behave consistently with Dialog.
10. As a product engineer, I want snap points (`snapPoints`, `activeSnapPoint`, `defaultSnapPoint`, `onActiveSnapPointChange`), so that a bottom sheet can rest at multiple heights.
11. As a product engineer, I want a `DrawerHandle` draggable affordance, so that users have an explicit, discoverable place to drag from.
12. As a mobile user, I want spring-physics drag-to-dismiss, so that dragging the drawer feels continuous rather than snapping.
13. As a mobile user, I want a fast flick to dismiss the drawer even before crossing the full close distance, so that quick gestures feel natural.
14. As a product engineer, I want `closeThreshold` and `velocityThreshold` props, so that I can tune how easily a drawer dismisses for my product's content.
15. As a product engineer, I want drag initiation restricted to the handle/header region by default (`dragHandleOnly`), so that interactive content inside the drawer (buttons, sliders, scrollable lists) is not hijacked by drag gestures.
16. As a keyboard user, I want drag-to-close to have a non-drag equivalent (close button, Escape, `dismissible` outside click), so that dismissal never depends on pointer gestures alone.
17. As a mobile user, I want an iOS-style background push/scale effect while a modal drawer is open, so that the drawer feels spatially anchored to the page behind it.
18. As a product engineer, I want an opt-in `edgeSwipeToOpen` gesture, so that users can pull a drawer open from the screen edge where that pattern fits the product.
19. As a product engineer, I want `edgeSwipeToOpen` off by default, so that it never silently conflicts with page scrolling or the browser's native back-swipe gesture.
20. As a product engineer, I want nested/stacked drawers, so that a drill-down edit flow (drawer-within-a-drawer) automatically recedes the parent drawer.
21. As a design-system lead, I want the nested-drawer policy documented with a recommended max stack depth, so that products do not stack drawers indefinitely.
22. As a motion-sensitive user, I want `prefers-reduced-motion` to disable drag physics, background scale, and shared-element morph while preserving every open/close/dismiss path through plain CSS transitions.
23. As a product engineer, I want motion presets (`none`, `subtle`, `standard`, `expressive`), so that teams can dial polish up or down consistently with CommandPalette's motion preset contract.
24. As a package consumer, I want a `layoutId` passthrough prop, so that a trigger element can optionally morph into the drawer panel using Motion's shared-layout transitions.
25. As a keyboard user, I want focus to move into the drawer, remain contained while a modal drawer is open, and return to the trigger on close.
26. As a keyboard user, I want non-modal "push" drawers to manage focus without trapping it, so that persistent panels behave like the WAI-ARIA non-modal dialog pattern rather than a modal.
27. As a screen-reader user, I want accessible names and descriptions through visible `DrawerTitle`/`DrawerDescription`, consistent with Dialog's accessible-name contract.
28. As a screen-reader user, I want Escape to close a modal drawer where allowed, with an obvious visible close affordance when Escape is disabled.
29. As a mobile user, I want drawer sizing to respect dynamic viewport units and safe-area insets, so that content is not clipped by mobile browser chrome.
30. As an RTL user, I want internal spacing/alignment and edge-swipe affordances to respect provider direction, so that spatial behavior matches reading direction even though `direction` itself is a literal physical anchor that does not reposition under RTL (matching Dialog's logical-spacing-only RTL convention).
31. As a design-system lead, I want provider-level tokens to drive overlay, content surface, handle, and snap-indicator styling, so that Drawer matches the rest of Dethink.
32. As a design-system lead, I want modal drawer portals to inherit `DethinkProvider` theme, density, direction, and custom `themeConfig` context through the same shared portal helper Dialog uses.
33. As a package consumer, I want stable refs, className composition, and `data-slot` attributes on every public part, consistent with Dialog's contract.
34. As a registry consumer, I want registry metadata to accurately declare the Motion (`motion/react`) runtime dependency, so that copied Drawer source installs cleanly.
35. As a registry consumer, I want reduced-motion and `motionPreset="none"` paths to preserve the base open/close/dismiss behavior, so that Drawer remains operable when drag and spring polish are disabled.
36. As an SSR app developer, I want Drawer to render and hydrate without mismatch warnings in Next.js and Vite SSR contexts.
37. As a maintainer, I want Drawer tests to cover public behavior — direction, modal/push mode, dismissal, snap points, drag thresholds, and motion presets — rather than Motion or React Aria implementation details.
38. As a maintainer, I want Drawer to stay distinct from Dialog/AlertDialog (centered modal content), Sidebar (persistent primary navigation), and CommandPalette (command/action surface) so each component's scope stays clear.
39. As a Sidebar maintainer, I want Drawer's non-modal push mode and mobile-sheet behavior available for Sidebar's own mobile drawer/rail patterns in a later cleanup, so the two components do not diverge on drawer mechanics.
40. As a Storybook user, I want examples for every direction, modal and push mode, snap points with handle, drag-to-dismiss, background scale, edge-swipe-to-open, nested drawers, motion presets, reduced motion, theme/density/RTL, and mobile viewport behavior.

## Implementation Decisions

- Ship one unified `Drawer` component family — `Drawer`, `DrawerTrigger`,
  `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`,
  `DrawerDescription`, `DrawerClose`, `DrawerHandle` — rather than shadcn's
  split `Sheet`/`Drawer` primitives. `direction` (`top`/`bottom`/`left`/
  `right`) replaces the need for a separate side-panel component.
- Reuse `react-aria-components` `ModalOverlay`/`Modal` and the shared
  provider-aware portal helper introduced for Dialog (targeting
  `UNSAFE_PortalProvider`, `packages/components/src/utils/provider-portal.tsx`)
  as the accessibility substrate for modal-mode Drawer: focus containment,
  Escape handling, outside-interaction filtering, and background inertness.
  Do not hand-roll this behavior.
- Non-modal "push" mode does not use `ModalOverlay`; it renders inline
  within a documented `DrawerPushContainer`/inset region that shifts sibling
  layout, and manages focus without trapping it, per the WAI-ARIA non-modal
  dialog pattern. Document this distinction clearly since it is the one
  behavioral fork between modal and push mode.
- Use Motion (`motion/react`) exclusively for the gesture/spring polish
  layer, isolated into a dedicated `drawer-motion.tsx` module (mirroring
  SlotPlanner's "only the motion module imports Motion" convention): `drag`
  with `dragElastic`/`dragMomentum`, velocity-aware `onDragEnd` dismiss
  decisions, spring interpolation between snap points, spring-driven
  open/close translation from the drawer's closed edge, `layoutId`-driven
  background push/scale and optional shared-element entrance, and
  `AnimatePresence` for exit choreography where needed. React Aria
  `data-entering`/`data-exiting` classes with tokenized `motion-safe:`
  Tailwind transitions remain the reduced-motion and `motionPreset="none"`
  fallback path, so the primitive stays operable when drag and spring polish
  are disabled.
- Snap points: `snapPoints` (array of fractions in `(0, 1]` of the drawer's
  open size along its drag axis; `0`/closed is always an implicit stop and
  the largest configured value is the maximum reachable open position, not
  forced to `1`), `activeSnapPoint`, `defaultSnapPoint`,
  `onActiveSnapPointChange`, and a `DrawerHandle` draggable affordance,
  matching vaul's model but with spring-driven interpolation between stops
  rather than settle-on-release only. The drag mechanic translates the
  content box (already sized/positioned per issue #273) toward its closed
  edge rather than literally resizing it.
- An explicit `reducedMotion?: boolean` prop, resolved as `reducedMotion ??
  prefersReducedMotion` and exposed via `data-reduced-motion`, matching
  CommandPalette's own `reducedMotion` prop/attribute contract exactly.
- Drag/dismiss tuning: `closeThreshold` (fraction of content size) and
  `velocityThreshold` (px/s) props with documented defaults. Default drag
  initiation to the `DrawerHandle`/header region (`dragHandleOnly`, default
  `true`) so interactive content inside the drawer body is never hijacked by
  drag gestures; document the opt-out for consumers who want whole-panel
  dragging and how to keep nested scrollable regions usable in that case.
- Background push/scale: a `backgroundScale` prop applied through a
  documented wrapper convention (parallel to vaul's `data-vaul-drawer-
  wrapper`) that scales and dims page content while a modal drawer is open.
  Reduced motion drops the scale and keeps only a dim/opacity transition.
- Edge-swipe-to-open: opt-in `edgeSwipeToOpen` prop bound to a thin,
  configurable edge hit-region. Default `false`. Document the interaction
  with left-edge browser back-swipe and RTL edge flipping.
- Nested/stacked drawers: a `DrawerNestedRoot`-equivalent context so a
  drawer opened from inside another drawer automatically scales/recedes the
  parent using the same spring primitives as the base drag layer. Document a
  recommended maximum stack depth.
- Expose motion presets (`none`, `subtle`, `standard`, `expressive`) with
  documented reduced-motion behavior per preset, matching CommandPalette's
  motion preset contract (`data-motion`, `data-reduced-motion` attributes)
  for consistency across the library's Motion-based components.
- Expose a `layoutId` passthrough prop on `DrawerContent` for optional
  shared-element entrance from a trigger element, reusing the `layoutId`
  shared-layout pattern already established by SlotPlanner.
- Reuse Dialog's size and scroll-behavior conventions while adding Drawer-
  specific direction-aware sizing: `size` named scales, `fullSize` for a
  full-height top/bottom sheet or full-width left/right rail, and
  `dimension` for custom CSS lengths/numeric px values. Dynamic viewport
  units (`dvh`) and safe-area insets still apply for full-size directions,
  and `overscroll-behavior: contain` applies for inside-scroll bodies.
- Do not add a component-level `theme` prop; use provider-level tokens only,
  consistent with Dialog and the rest of the library.

## Theming Token Plan

Required token coverage:

- Overlay/backdrop: background/foreground opacity tokens and the shared
  z-index/layer convention used by Dialog and Select/Combobox popovers.
- Content surface: background, foreground, border, radius, shadow, and
  spacing, per direction.
- Handle: a dedicated handle token (background/foreground) distinct from
  border/muted tokens so the drag affordance stays visible in light, dark,
  and high-contrast states.
- Title/description: foreground and muted-foreground tokens, matching
  Dialog.
- Close controls: Button variants, ring, and muted tokens, matching Dialog.
- Focus-visible: ring tokens and outline-safe states for both modal and
  non-modal push mode.
- Density: density control and density gap tokens for header/footer
  spacing.
- Motion: tokenized transition durations/easings for the CSS fallback path,
  plus documented Motion spring configuration constants for the drag/snap
  layer.
- Mobile: dynamic viewport sizing (`dvh`) and safe-area inset handling for
  full-size directions.
- RTL: logical spacing/alignment utilities and edge-direction flipping for
  `left`/`right` and edge-swipe behavior.

## Testing Decisions

- Test public behavior at the highest practical seam — the same seams
  already established for Dialog and CommandPalette. No new test
  infrastructure is required for this component.
- Unit tests should cover snap-point resolution/clamping, drag distance/
  velocity dismiss-decision logic, and nested-drawer stack bookkeeping.
- Rendered tests should cover every `direction`, modal versus non-modal
  push mode, controlled/uncontrolled open state, dismissal (`dismissible`,
  `keyboardDismissDisabled`, Escape, `dismissible` outside click), snap-point state
  changes, `DrawerHandle` interaction, refs, className composition, and
  data-slot/data-state attributes.
- Keyboard/focus tests should cover modal focus containment and return-to-
  trigger, non-modal push-mode focus movement without trapping, and Escape
  behavior, reusing Dialog's focus-test patterns.
- Motion tests should cover motion-preset data attributes, reduced-motion
  fallback (no drag, no background scale, no morph, CSS-only open/close),
  drag-to-dismiss threshold/velocity behavior, background push/scale, and
  nested-drawer recede/enter choreography, reusing CommandPalette's motion-
  preset test pattern.
- Accessibility tests with axe should cover labelled modal Drawer, labelled
  non-modal push Drawer, every direction, and reduced-motion state.
- SSR smoke tests should cover closed-state render/hydration for both modal
  and push mode without mismatch warnings.
- Storybook interaction tests should cover open/close per direction, modal
  versus push mode, snap points with handle drag, drag-to-dismiss velocity
  behavior, background scale, edge-swipe-to-open, nested drawers, motion
  presets, reduced motion, dark mode, density, and RTL.
- Registry smoke should verify the Motion (`motion/react`) dependency is
  declared accurately, reduced-motion and `motionPreset="none"` behavior,
  copied-source portability, and provider-token reliance.
- Prior art: Dialog's focus/portal/dismissal tests, CommandPalette's motion-
  preset and reduced-motion test pattern, and SlotPlanner's
  `motion/react` drag/spring/`layoutId` usage.

## Out of Scope

- Dialog and AlertDialog centered-modal behavior, which already ships as a
  separate component family.
- Popover, Tooltip, DropdownMenu, HoverCard, ContextMenu, Menubar,
  CommandPalette, and generic OverlayManager stacking scope.
- Sidebar's persistent primary-navigation shell; Drawer's non-modal push
  mode may inform a future Sidebar cleanup, but this PRD does not modify
  Sidebar.
- Toasts, notifications, and notification-center behavior.
- Bespoke shared-element orchestration across independent, unrelated
  components beyond passing a consumer-supplied `layoutId` through to the
  underlying `motion.div`.
- Virtualization of drawer body content.
- Native `<dialog>` element, browser top-layer rendering, and declarative
  `closedby` light dismiss, which remain documented future
  platform-alignment work, consistent with Dialog's v1 scope.
- Router adapters, global keyboard-shortcut registration, and permissions
  engines.

## Further Notes

Research inputs:

- Context7 `/emilkowalski/vaul` documentation, fetched 2026-07-07, for the
  current shadcn-ecosystem drawer feature set: snap points, draggable
  handle, `NestedRoot` nested drawers, `shouldScaleBackground` background
  scaling, and the `direction` prop.
- Modern Web Guidance `navigation-drawer` guide, fetched 2026-07-07, for the
  baseline-safe mechanics (scroll snap, `IntersectionObserver`, `inert`) and
  progressive-enhancement fallbacks this PRD's CSS-fallback path should stay
  compatible with in spirit, even though the primary implementation uses
  React Aria plus Motion rather than the Popover/scroll-snap approach
  described there.
- Repository prior art: Dialog's `react-aria-components` substrate and
  shared provider-aware portal helper (`packages/components/src/utils/
  provider-portal.tsx`); CommandPalette's motion-preset and reduced-motion
  contract (`packages/components/src/components/command-palette/
  command-palette.tsx`); SlotPlanner's `motion/react` `AnimatePresence`,
  `layoutId`, and motion-module-isolation conventions
  (`slot-planner-motion.tsx`).
- Verified during planning: SlotPlanner has no existing drag-to-dismiss,
  `dragElastic`/`dragMomentum`/`onDragEnd` velocity, or spring-between-
  snap-points code — those conventions do not yet exist anywhere in this
  repository and must be built fresh in issue #274 against current Motion
  (`motion/react`) API docs (fetch via Context7 per `CLAUDE.md`'s
  documentation-freshness rule before implementing). The PRD's "reuses
  SlotPlanner's drag/spring conventions" language refers only to the
  shared-layout/`AnimatePresence`/`layoutId`/motion-module-isolation
  patterns, not existing drag-physics code.
- This repository's Dialog PRD explicitly deferred "gesture-driven drawer
  behavior" and Motion adoption to this component.
