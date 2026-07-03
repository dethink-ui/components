# Dialog And AlertDialog PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/115.

Package target: `@dethink/components`.

## Branch Workflow

Branch names follow the repository workflow in `AGENTS.md`:

1. `feature/prd-115-dialog-alertdialog`
2. `feature/issue-116-dialog-contract-docs`
3. `feature/issue-117-dialog-primitive`
4. `feature/issue-118-alertdialog-confirmation`
5. `feature/issue-119-dialog-integration-docs`

## Problem Statement

Teams building SaaS dashboards, internal tools, B2B applications, admin
settings, CRUD flows, billing screens, permission management, and AI-native
interfaces need a reliable modal dialog layer after Select and Combobox. The
library now has forms, fields, inputs, choice controls, Select, Combobox,
DateTimePicker, provider-level theming, and registry infrastructure, but
consumers still need to assemble modal overlay behavior, focus containment,
trigger state, close buttons, accessible titles/descriptions, confirmation
semantics, destructive action affordances, provider-token styling, and tests
themselves.

## Solution

Ship a provider-themed `Dialog` and `AlertDialog` component family for
`@dethink/components` using `react-aria-components` DialogTrigger,
ModalOverlay, Modal, Dialog, Heading, Text, and Button behavior as the
accessibility substrate. The public API should feel familiar to shadcn-style
consumers while preserving Dethink prop conventions, stable slot data
attributes, controlled/uncontrolled open state, keyboard dismissal, optional
outside dismissal for non-critical dialogs, alertdialog semantics for
confirmations, provider-level theme/density/RTL context, and registry
portability.

Dialog v1 covers modal dialogs only. Non-modal popovers, tooltips, dropdown
menus, drawer/sheet behavior, command dialogs, generic portal/focus-trap
primitives, and global overlay stacking APIs remain out of scope except for the
minimal provider-aware portal/helper foundation needed to keep
`DethinkProvider` tokens working through modal portals.

## User Stories

1. As a dashboard engineer, I want a Dialog component, so that I can build create/edit/detail flows without custom modal wiring.
2. As an admin-tool engineer, I want an AlertDialog component, so that destructive and confirmation flows use consistent alertdialog semantics.
3. As a form builder, I want dialogs to contain Form and Field primitives safely, so that modal forms retain labels, descriptions, errors, validation, and submit/cancel actions.
4. As a package consumer, I want `open`, `defaultOpen`, and `onOpenChange`, so that dialog state can be controlled or uncontrolled.
5. As a package consumer, I want trigger, overlay, content, title, description, header, footer, close, cancel, and action slots, so that anatomy matches common shadcn-style usage.
6. As a package consumer, I want a close render prop or close button support, so that footer actions can close the dialog without bespoke state plumbing.
7. As a package consumer, I want optional outside dismissal for normal dialogs, so that low-risk dialogs can support light-dismiss where appropriate.
8. As a package consumer, I want AlertDialog to avoid accidental outside dismissal by default, so that destructive confirmations require an explicit user choice.
9. As a package consumer, I want Escape key behavior to be documented and configurable where React Aria supports it, so that critical workflows can opt out deliberately.
10. As a package consumer, I want dialog sizes and responsive constraints, so that short confirmations, forms, and wider content fit predictably.
11. As a package consumer, I want scroll-safe content behavior, so that long dialog bodies remain usable without losing header/footer actions.
12. As a package consumer, I want stable refs and className composition on public slots, so that product layouts can extend the component safely.
13. As a design-system lead, I want provider-level tokens to drive overlay and content styling, so that dialogs match the rest of Dethink.
14. As a design-system lead, I want modal portals to inherit provider theme, density, direction, and custom themeConfig context, so that nested provider scopes work in overlays.
15. As an RTL user, I want spacing, close placement, footer alignment, and focus order to respect provider direction.
16. As a keyboard user, I want focus to move into the dialog, remain contained while open, wrap through tabbable controls, close with Escape where allowed, and return to the trigger on close.
17. As a screen-reader user, I want dialogs to expose accessible names and descriptions through visible titles and descriptions.
18. As a screen-reader user, I want AlertDialog to use `role="alertdialog"` with labelled and described content, so that high-stakes confirmations are announced correctly.
19. As a mobile user, I want dialogs to fit small viewports and support safe scrolling, so that forms and confirmations remain reachable.
20. As a Storybook user, I want examples for base dialog, controlled dialog, modal form, scrollable content, outside dismissal, non-dismissable dialog, alert confirmation, destructive alert, theme/density/RTL, and nested provider behavior.
21. As a registry consumer, I want accurate registry metadata, so that copied dialog source installs cleanly.
22. As an SSR app developer, I want dialogs to render and hydrate without mismatch warnings.
23. As a maintainer, I want dialog tests to cover public behavior instead of private implementation details.
24. As a maintainer, I want Dialog and AlertDialog to stay separate from Drawer, Popover, Tooltip, DropdownMenu, Toast, CommandDialog, and generic OverlayManager scope.
25. As a motion-sensitive user, I want dialog entry/exit animation to respect `prefers-reduced-motion`, so that modals appear without disorienting motion.

## Implementation Decisions

- The next high-impact component group is Dialog + AlertDialog because the
  priority overlay places them immediately after Combobox.
- Use `react-aria-components` for DialogTrigger, ModalOverlay, Modal, Dialog,
  Heading, Text, close render props, modal focus behavior, outside content
  hiding, Escape behavior, and focus restoration.
- Build shadcn-compatible Dethink anatomy for Dialog and AlertDialog while
  retaining Dethink prop names and token conventions.
- Map `open`, `defaultOpen`, and `onOpenChange` to React Aria overlay trigger
  state.
- Map dismissal behavior to `isDismissable`,
  `isKeyboardDismissDisabled`, and `shouldCloseOnInteractOutside`.
- Use `role="dialog"` for Dialog and `role="alertdialog"` for AlertDialog.
- Default AlertDialog to explicit cancel/action flows with no outside dismissal.
- Default initial focus to React Aria behavior; destructive AlertDialog
  examples focus the least destructive action per the APG alertdialog pattern.
- Extract or reuse minimal provider-aware portal context sync so overlays
  inherit DethinkProvider theme, density, direction, font, and custom tokens.
  Target `UNSAFE_PortalProvider` for the shared helper because React Aria
  Components 1.19 deprecates `UNSTABLE_portalContainer`.
- Stay on React Aria's div-based modal layer in v1; native `<dialog>`,
  top-layer rendering, and declarative `closedby` light dismiss are documented
  as future platform alignment.
- Use provider-level theme tokens only; do not add a component-level theme prop.
- Use tokenized Tailwind transitions and motion-safe utilities keyed off React
  Aria `data-entering`/`data-exiting` attributes; do not add Motion/Framer
  Motion for v1.
- Size content with dynamic viewport units (`dvh`) and safe-area awareness for
  the `full` size; contain overscroll for inside-scroll bodies.

## Theming Token Plan

Required token coverage:

- Overlay/backdrop: background/foreground opacity tokens and z-index/layer
  conventions.
- Content surface: background, foreground, border, radius, shadow, and spacing.
- Title/description: foreground and muted foreground.
- Close/cancel/action controls: Button variants, ring, muted, destructive, and
  destructive foreground tokens.
- Focus-visible: ring tokens and outline-safe states.
- Density: density control and density gap tokens for header/footer/action
  spacing.
- Motion: tokenized transition durations/easings applied through motion-safe
  utilities and React Aria entering/exiting data attributes.
- Mobile: dynamic viewport sizing (`dvh`) and safe-area inset handling for
  full-size dialogs.
- RTL: logical spacing and alignment utilities.

## Testing Decisions

- Tests should assert public behavior, accessible roles/names/descriptions,
  focus behavior, dismissal behavior, provider-token inheritance, and stable
  slots rather than internal React Aria implementation details.
- Render tests should cover controlled/uncontrolled open state, trigger opening,
  close button, render-prop close, outside dismissal, non-dismissable behavior,
  Escape behavior, focus return, refs, className composition, data slots, size,
  scroll variants, and provider portal context.
- AlertDialog tests should cover alertdialog role, title/description wiring,
  cancel/action behavior, destructive styling, initial focus on the least
  destructive action in destructive examples, and absence of outside dismissal
  by default.
- Motion coverage should assert entry/exit transitions are gated behind
  motion-safe utilities and driven by entering/exiting data attributes.
- Accessibility tests should cover axe smoke for labelled Dialog,
  AlertDialog, modal form, and nested provider examples.
- Storybook interaction tests should cover open/close, controlled dialog, form
  submission/cancel, destructive confirmation, Escape, outside click where
  enabled, and focus return.
- SSR tests should cover render and hydration without mismatch warnings.
- Registry smoke should verify dependency metadata, copied source portability,
  Button/Form dependency paths, provider tokens, and package exports.

## Out Of Scope

- Drawer/Sheet, Popover, Tooltip, DropdownMenu, HoverCard, ContextMenu,
  Menubar, CommandDialog, OverlayManager, Toast, NotificationCenter, generic
  Portal, standalone FocusTrap/FocusScope, route-level modals, wizard
  orchestration, async form state, and global dirty-state protection.
- Non-modal dialog behavior and persistent floating panels.
- Heavy animation dependencies or gesture-driven drawer behavior.
- Alert/toast notifications that do not require user confirmation.
- Form library adapters, validation schema resolvers, and server action
  orchestration.

## Further Notes

- Research basis: Context7 React Aria Dialog/Modal docs, installed React Aria
  Components 1.19 type declarations, Context7 WAI-ARIA APG Dialog and
  AlertDialog patterns, and Modern Web Guidance accessibility/dialog guidance
  fetched on 2026-07-02.
- The first implementation issue should handle provider-aware modal portal
  behavior because Select and Combobox currently each carry local portal sync
  logic. The shared helper should adopt `UNSAFE_PortalProvider` (React Aria
  Components 1.19 deprecates `UNSTABLE_portalContainer`); migrating Select and
  Combobox onto the helper can follow as a separate cleanup.
