# Dialog And AlertDialog Issue Breakdown

Status: Published to GitHub issue tracker.

This uses the `to-issues` tracer-bullet format.

Package target: `@dethink/components`.

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/115
- AFK Dialog and AlertDialog contract and local planning docs: https://github.com/parveshh/dethink-components/issues/116
- AFK Dialog primitive source, tests, registry, and base stories: https://github.com/parveshh/dethink-components/issues/117
- AFK AlertDialog confirmation semantics and destructive flows: https://github.com/parveshh/dethink-components/issues/118
- AFK Dialog provider theming, docs, recipes, and final verification: https://github.com/parveshh/dethink-components/issues/119

## Branch Stack

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

## Proposed Breakdown

1. **Title**: Dialog and AlertDialog contract and local planning docs (#116)
   **Type**: AFK
   **Blocked by**: #115
   **User stories covered**: 1-24

2. **Title**: Dialog primitive source, tests, registry, and base stories (#117)
   **Type**: AFK
   **Blocked by**: #116
   **User stories covered**: 1, 3-7, 9-17, 19-24

3. **Title**: AlertDialog confirmation semantics and destructive flows (#118)
   **Type**: AFK
   **Blocked by**: #117
   **User stories covered**: 2, 5-9, 12-18, 20-24

4. **Title**: Dialog provider theming, docs, recipes, and final verification (#119)
   **Type**: AFK
   **Blocked by**: #118
   **User stories covered**: 1-24

## Published Issue #116

## What to build

Create the local contract and planning documents for the Dialog + AlertDialog
PRD. The docs should define modal dialog and alertdialog scope, public anatomy,
prop contracts, React Aria behavior substrate, provider-level theming, portal
inheritance, accessibility invariants, testing seams, out-of-scope boundaries,
and stacked branch mapping.

This slice should not implement runtime component source beyond documentation
examples needed to clarify the contract.

## Acceptance criteria

- [ ] Local Dialog + AlertDialog specification, PRD mirror, and issue breakdown documents exist.
- [ ] The docs identify Dialog + AlertDialog as the next high-impact component group after Combobox.
- [ ] The docs define planned anatomy for Dialog and AlertDialog.
- [ ] The docs define open-state props with `open`, `defaultOpen`, and `onOpenChange`.
- [ ] The docs define dismissal props and defaults for normal Dialog versus AlertDialog.
- [ ] The docs define accessible name and description requirements, roles, focus containment, focus restore, background inertness/hidden outside content, and keyboard acceptance criteria.
- [ ] The docs define provider-level theme, density, direction, and custom token inheritance through modal portals.
- [ ] The docs list token usage and out-of-scope boundaries.
- [ ] The docs list render, interaction, accessibility, SSR, Storybook, registry, and playground smoke testing seams.

## Blocked by

- #115

## Published Issue #117

## What to build

Build the core Dialog primitive path for modal dialogs. The completed slice
should provide the Dialog root/anatomy components backed by React Aria
DialogTrigger, ModalOverlay, Modal, Dialog, Heading, Text, and close behavior;
support controlled and uncontrolled open state; expose stable slots; inherit
DethinkProvider theme context through modal portals; and include focused tests,
Storybook examples, registry metadata, and package exports for the base dialog
path.

## Acceptance criteria

- [ ] Dialog components are exported with public prop/data types and class-name helpers.
- [ ] Dialog supports `open`, `defaultOpen`, `onOpenChange`, trigger composition, content, title, description, close, header, footer, size, className composition, and refs.
- [ ] Dialog maps Dethink open-state props to React Aria overlay trigger state.
- [ ] Dialog exposes stable slot/state data attributes.
- [ ] Dialog uses `role="dialog"` with visible title and description wiring in examples.
- [ ] Dialog supports Escape close where allowed, explicit close button behavior, render-prop close behavior, focus movement, focus containment, and focus restoration.
- [ ] Dialog modal portal hosts inherit provider theme, density, direction, font, and custom token context.
- [ ] Dialog styles overlay, content, close affordance, title, description, footer actions, focus-visible, size, scroll, density, dark mode, and RTL states using provider-level tokens only.
- [ ] Registry metadata declares React Aria runtime dependency and accurate Dethink registry dependencies.
- [ ] Render, accessibility, SSR, Storybook, and playground smoke coverage verify the base path.

## Blocked by

- #116

## Published Issue #118

## What to build

Add AlertDialog as the confirmation-specific modal path. The completed slice
should provide alertdialog anatomy and defaults for high-stakes confirmations,
including cancel/action components, destructive styling, explicit action flows,
no outside dismissal by default, accessible alertdialog naming/description,
focus behavior, Storybook examples, and tests.

## Acceptance criteria

- [ ] AlertDialog components are exported with public prop/data types and class-name helpers.
- [ ] AlertDialog supports controlled/uncontrolled open state through the same public open contract as Dialog.
- [ ] AlertDialog content uses `role="alertdialog"` and requires labelled/described examples.
- [ ] AlertDialog exposes trigger, content, header, footer, title, description, cancel, action, and close slots with stable data attributes.
- [ ] AlertDialog defaults prevent accidental outside dismissal while preserving documented keyboard and explicit cancel/action behavior.
- [ ] AlertDialogCancel and AlertDialogAction compose Dethink Button semantics and variants.
- [ ] Focus behavior sends users to a sensible initial control and restores focus to the trigger after close where React Aria supports it.
- [ ] Tests, Storybook, accessibility, and SSR coverage verify alertdialog semantics and destructive flows.

## Blocked by

- #117

## Published Issue #119

## What to build

Finish Dialog + AlertDialog as documented, installable, provider-themed
components. This slice should complete theme/density/RTL examples, nested
provider coverage, custom themeConfig coverage, docs, recipes, interaction
tests, registry/playground smoke checks, and final verification for the modal
component family.

## Acceptance criteria

- [ ] Documentation covers overview, installation, anatomy, API, controlled/uncontrolled state, dismissal modes, accessibility, keyboard behavior, focus management, theming tokens, density, RTL, recipes, testing, migration notes, and out-of-scope boundaries.
- [ ] Recipes cover create/edit form dialog, settings dialog, scrollable content dialog, destructive delete alert, unsaved-change confirmation, and admin row action confirmation.
- [ ] Provider-level theme stories cover light, dark, system, compact, default, comfortable, nested provider scope, custom `themeConfig` tokens, and RTL direction.
- [ ] Storybook interaction tests cover open/close, controlled open state, Escape, outside dismissal where enabled, outside dismissal prevention for AlertDialog, cancel/action flows, focus return, form cancel/submit, and provider-themed modal portal context.
- [ ] Accessibility tests cover labelled Dialog, labelled AlertDialog, modal form, destructive confirmation, and no missing accessible names.
- [ ] SSR tests cover Dialog and AlertDialog render/hydration without mismatch warnings.
- [ ] Registry validation and registry smoke verify copied source portability, dependency metadata, aliases, style imports, CSS variable reliance, package exports, Button/Form dependency paths, and provider-aware portal behavior.
- [ ] Playground smoke coverage exercises Dialog and AlertDialog through package exports and provider theme path.
- [ ] Final verification commands pass or are documented with specific blockers.

## Blocked by

- #118

## Post-Publication Amendments (2026-07-02)

The local spec and PRD were enhanced after issues #115-#119 were published.
Implementers should treat these as part of the acceptance criteria, and the
GitHub issues should get a sync comment referencing this section:

- The shared provider-aware portal helper targets `UNSAFE_PortalProvider`
  because React Aria Components 1.19 deprecates `UNSTABLE_portalContainer`
  (affects #117; Select/Combobox migration is follow-up cleanup).
- Content owns the backdrop overlay and exposes it through `overlayClassName`,
  an exported overlay class-name helper, and
  `data-slot="dialog-overlay"` / `data-slot="alert-dialog-overlay"`
  (affects #117 and #118).
- Entry/exit animation keys off React Aria `data-entering`/`data-exiting`
  with tokenized `motion-safe:` transitions, and must respect
  `prefers-reduced-motion` (new user story 25; affects #117 and #119).
- Destructive AlertDialog examples move initial focus to the least
  destructive action per the APG alertdialog pattern (affects #118).
- A visually hidden title is required whenever design hides the visible title
  (affects #117 and #118).
- Content max-height and the `full` size use `dvh` with safe-area insets;
  inside-scroll bodies use `overscroll-behavior: contain` (affects #117).
- v1 stays on React Aria's div-based modal layer; native `<dialog>`,
  top-layer rendering, and `closedby` light dismiss are out of scope and
  documented as future platform alignment (affects #116 and #119).
- Nested/stacked dialog orchestration beyond default React Aria behavior is
  explicitly out of scope for v1.
