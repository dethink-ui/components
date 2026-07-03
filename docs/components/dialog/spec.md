# Dialog And AlertDialog Spec

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/115

Package target: `@dethink/components`.

## Branch Workflow

Branch names follow the repository workflow in `AGENTS.md`:

1. `feature/prd-115-dialog-alertdialog`
2. `feature/issue-116-dialog-contract-docs`
3. `feature/issue-117-dialog-primitive`
4. `feature/issue-118-alertdialog-confirmation`
5. `feature/issue-119-dialog-integration-docs`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch, not the repository default
branch, unless explicitly requested.

## Purpose

Dialog and AlertDialog provide the modal overlay layer for create/edit forms,
settings, details, confirmations, destructive actions, and admin workflows.
They should make modal behavior accessible by default while preserving the
Dethink provider-token styling contract, shadcn-compatible anatomy, controlled
open-state patterns, Storybook/docs coverage, registry portability, and SSR
safety.

Dialog is for ordinary modal content. AlertDialog is for high-stakes
confirmation flows that need `role="alertdialog"`, explicit cancel/action
choices, and safer dismissal defaults.

## Public API

The planned component family is:

- `Dialog`
- `DialogTrigger`
- `DialogContent`
- `DialogHeader`
- `DialogFooter`
- `DialogTitle`
- `DialogDescription`
- `DialogClose`
- `AlertDialog`
- `AlertDialogTrigger`
- `AlertDialogContent`
- `AlertDialogHeader`
- `AlertDialogFooter`
- `AlertDialogTitle`
- `AlertDialogDescription`
- `AlertDialogCancel`
- `AlertDialogAction`

Exports should include class-name helpers and public prop/data types for each
public slot where the implementation exposes a typed component.

`DialogContent` and `AlertDialogContent` own the modal backdrop overlay. The
overlay is not a separately mounted component; it is exposed for styling
through `overlayClassName`, an exported overlay class-name helper, and stable
`data-slot="dialog-overlay"` / `data-slot="alert-dialog-overlay"` attributes.

## Prop Contract

Use Dethink public prop names while mapping to React Aria internals:

| Prop | Purpose |
| --- | --- |
| `open` | Controlled open state. Maps to React Aria `isOpen`. |
| `defaultOpen` | Uncontrolled initial open state. |
| `onOpenChange` | Called when the modal opens or closes. |
| `dismissible` | Allows outside interaction to close normal Dialog where appropriate. Maps to `isDismissable`. |
| `keyboardDismissDisabled` | Disables close requests (Escape and, where the platform supports them, back/dismiss gestures) as a group. Requires a visible close or cancel affordance. Maps to `isKeyboardDismissDisabled`. |
| `shouldCloseOnInteractOutside` | Optional predicate for outside interaction filtering. |
| `size` | Dialog content width preset, initially `sm`, `md`, `lg`, `xl`, or `full`. |
| `scrollBehavior` | Long-content behavior, initially `inside` or `outside`. |
| `className` | Consumer class composition for the public slot. |
| `overlayClassName` | Consumer class composition for the backdrop overlay slot rendered by content. |
| `children` | React node or render function where React Aria provides a close callback. |

AlertDialog should share the open-state contract but use safer defaults:

- `dismissible` defaults to false.
- `role` is fixed to `alertdialog` for alert content.
- Cancel and action slots should be explicit and easy to find in examples.
- Destructive examples move initial focus to the least destructive action
  (typically Cancel) per the WAI-ARIA APG alertdialog pattern.

## Public Contract

- Open state supports controlled `open`, uncontrolled `defaultOpen`, and
  `onOpenChange` for both directions of change (trigger, close affordances,
  close requests, and outside dismissal where enabled).
- Confirm-before-close flows (for example dirty modal forms) use controlled
  `open` plus `shouldCloseOnInteractOutside`; the wrapper does not add its own
  dirty-state layer.
- Every public slot forwards refs and composes `className` via `cn`.
- Stable slot attributes follow the existing `data-slot` convention:
  `dialog-overlay`, `dialog-content`, `dialog-header`, `dialog-footer`,
  `dialog-title`, `dialog-description`, `dialog-close`, and the
  `alert-dialog-*` equivalents plus `alert-dialog-cancel` and
  `alert-dialog-action`. Portal hosts follow the Select convention with
  `data-slot="dialog-portal-container"`.
- State is exposed through data attributes rather than classes: React Aria
  `data-entering`/`data-exiting` on overlay and content for animation, plus
  `data-size` and `data-scroll-behavior` reflecting resolved props.
- A dialog is always modal in v1: background content is inert/hidden and body
  scroll is locked while open.

## Implementation Substrate

- Use `react-aria-components` for `DialogTrigger`, `ModalOverlay`, `Modal`,
  `Dialog`, `Heading`, `Text`, and close render props.
- Use the installed React Aria Components 1.19 prop surface:
  `isOpen`, `defaultOpen`, `onOpenChange`, `isDismissable`,
  `isKeyboardDismissDisabled`, `shouldCloseOnInteractOutside`, dialog `role`,
  and the ModalOverlay/Modal `isEntering`/`isExiting` +
  `data-entering`/`data-exiting` animation surface.
- Keep public prop names stable even when React Aria prop names differ.
- Extract or reuse a minimal provider-aware portal helper so modal portals
  inherit `DethinkProvider` theme, density, direction, font, and custom token
  context. React Aria Components 1.19 deprecates `UNSTABLE_portalContainer`
  in favor of `UNSAFE_PortalProvider` (exported from `react-aria`), so the
  shared helper should target `UNSAFE_PortalProvider`; Select and Combobox can
  migrate to the shared helper in a follow-up.
- Render the modal layer with React Aria's div-based ModalOverlay rather than
  the native `<dialog>` element or the browser top layer in v1, and document
  the z-index layering convention (same layer tokens as the Select/Combobox
  popover, currently `z-50`) since portal order, not the top layer, resolves
  stacking.
- Do not introduce Radix UI, Floating UI, cmdk, Motion, or a standalone overlay
  manager for Dialog v1.
- Do not hand-roll ARIA role, focus containment, hidden outside content, Escape
  dismissal, or focus restore when React Aria already provides it.

## Accessibility

- Dialog content must have an accessible name. Examples should use visible
  `DialogTitle` / `AlertDialogTitle`. When design hides the title, a visually
  hidden title element must still be rendered so the accessible name survives.
- Dialog descriptions should be wired through visible
  `DialogDescription` / `AlertDialogDescription` where applicable.
- Standard Dialog content uses `role="dialog"`.
- AlertDialog content uses `role="alertdialog"` and should include a concise
  description of the consequence or decision.
- Focus should move into the dialog on open, remain contained while open, wrap
  through tabbable controls, and return to the trigger on close.
- Initial focus follows React Aria defaults; examples may opt a preferred
  control in with `autoFocus`. Destructive AlertDialog examples must focus the
  least destructive action (typically Cancel) per the APG alertdialog pattern.
- Escape should close where allowed. Escape is one form of "close request";
  platform dismiss controls (hardware back gesture, assistive-technology
  dismiss) should behave the same way where supported. If close requests are
  disabled, there must be an obvious visible close/cancel path.
- Entry/exit animation must respect `prefers-reduced-motion` through
  motion-safe utilities.
- AlertDialog should avoid outside dismissal by default.
- Background content must be inert or hidden from assistive technologies through
  the React Aria modal overlay behavior.
- RTL should be inherited from provider `dir` and avoid left/right hard-coding.

## Styling And Theming

Dialog and AlertDialog are themed through `DethinkProvider` and `dethink-base`.
They must not accept a component-level `theme` prop.

Use provider-level tokens for:

- `--dt-color-background`
- `--dt-color-foreground`
- `--dt-color-muted`
- `--dt-color-muted-foreground`
- `--dt-color-border`
- `--dt-color-ring`
- `--dt-color-destructive`
- `--dt-color-destructive-foreground`
- `--dt-space-*`
- `--dt-radius-sm`
- `--dt-radius-md`
- `--dt-radius-lg`
- `--dt-shadow-*`
- `--dt-density-control`
- `--dt-density-gap`

The implementation should support light, dark, system, compact, default,
comfortable, nested provider scope, custom `themeConfig`, and RTL examples.

Additional styling requirements:

- Motion: entry/exit styling keys off React Aria `data-entering` /
  `data-exiting` attributes with tokenized `motion-safe:` Tailwind
  transitions, matching the Select/Combobox popover convention.
- Mobile viewports: content max-height and the `full` size use dynamic
  viewport units (`dvh`) rather than `vh`, and the `full` size respects
  safe-area insets.
- Scroll: `scrollBehavior="inside"` bodies use `overscroll-behavior: contain`
  so inner scrolling does not chain to the page. React Aria's scroll lock
  handles body scroll and scrollbar-width compensation while open.

## Out Of Scope

- Drawer/Sheet, Popover, Tooltip, DropdownMenu, HoverCard, ContextMenu,
  Menubar, CommandDialog, OverlayManager, Toast, NotificationCenter, generic
  Portal, standalone FocusTrap/FocusScope, route-level modals, global dirty
  state protection, and wizard orchestration.
- Non-modal dialogs and persistent floating panels.
- Gesture-driven drawer behavior and heavy animation dependencies.
- Nested/stacked dialog orchestration beyond default React Aria behavior.
- Native `<dialog>` element and browser top-layer rendering (including
  declarative `closedby` light dismiss), which remain a future
  platform-alignment enhancement.
- Form library adapters, validation schema resolvers, and server action
  orchestration.

## Verification Requirements

- Rendered component tests for open-state props, trigger opening, close/cancel
  actions, Escape behavior, outside dismissal, focus return, refs, className,
  data slots, provider portal context, size, scroll behavior, and disabled
  dismissal states.
- AlertDialog tests for `alertdialog` role, title/description relationships,
  cancel/action behavior, destructive action callbacks, initial focus on the
  least destructive action in destructive examples, and outside-dismiss
  prevention.
- Motion checks that entry/exit transitions are gated behind motion-safe
  utilities and that state is driven by `data-entering`/`data-exiting`.
- Accessibility automation with axe for labelled Dialog, labelled AlertDialog,
  modal forms, and destructive confirmations.
- Storybook stories and play tests for base, controlled, form, scrollable,
  dismissible, non-dismissable, alert confirmation, destructive alert, theme,
  density, RTL, and nested provider examples.
- SSR render/hydration smoke tests.
- Registry validation and registry smoke tests for dependency metadata,
  provider-token reliance, package exports, and copied source portability.

## Research Sources

- Context7 React Aria Components Dialog/Modal docs, fetched 2026-07-02.
- Installed React Aria Components 1.19 and React Aria/React Stately type
  declarations.
- Context7 WAI-ARIA Authoring Practices Dialog and AlertDialog patterns,
  fetched 2026-07-02.
- Modern Web Guidance accessibility and dialog guidance, fetched 2026-07-02.
