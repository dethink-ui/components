# CommandPalette Component Spec

Status: Published to GitHub issue tracker.

Parent PRD: https://github.com/parveshh/dethink-components/issues/187

Package target: `@dethink/components`.

## Branch Workflow

Branch names follow the repository workflow in `AGENTS.md`:

1. `feature/prd-187-command-palette`
2. `feature/issue-235-command-palette-contract-docs`
3. `feature/issue-236-command-palette-core-inline`
4. `feature/issue-237-command-palette-dialog-mode`
5. `feature/issue-238-command-palette-async-sources`
6. `feature/issue-239-command-palette-page-stack`
7. `feature/issue-240-command-palette-motion`
8. `feature/issue-241-command-palette-registry-storybook`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch, not the repository default
branch, unless explicitly requested.

## Purpose

CommandPalette provides the keyboard command workflow layer for SaaS
dashboards, internal tools, AI-native workspaces, admin consoles, and app-shell
navigation. It lets users search commands, run actions, follow links, drill
into nested pages, inspect disabled reasons, recover from async states, and use
recents/suggestions without leaving the keyboard.

CommandPalette is not a form control. It borrows collection and filtering
vocabulary from Combobox, MultiSelect, AsyncSelect, and TagInput, but it
represents actions and navigation rather than submitted values.

## shadcn Difference

shadcn/ui Command is a styled cmdk composition for command search and quick
actions: input, list, empty state, groups, separators, items, shortcuts, dialog
examples, scrollable lists, and RTL. Dethink CommandPalette should add value as
a production command workflow system:

- typed command records for actions, links, nested pages, recents,
  suggestions, disabled reasons, destructive commands, shortcuts, and sources
- data-driven usage and children composition
- app-owned async source states with loading, empty, error, retry,
  minimum-query, stale-result, and result-limit guidance
- live announcements for result counts, selected command changes, async states,
  page changes, and command execution
- first-class nested page stack behavior with Escape-to-back
- app-shell recipes for Sidebar, NavigationMenu, global launchers, project
  switchers, resource switchers, dashboard action runners, and AI command menus
- provider-token theming, density, RTL, reduced motion, registry metadata,
  Storybook coverage, accessibility automation, and SSR smoke coverage

The implementation should not copy shadcn's component surface or depend on
cmdk by default. If a later runtime slice chooses cmdk, it must justify the
dependency against this Dethink command workflow contract and prove that link,
action, async, page-stack, live-announcement, registry, and reduced-motion
requirements remain first-class.

## Current Prior Art

- Dialog provides modal focus management, labelled content, provider-aware
  portal behavior, dynamic viewport sizing, focus containment, Escape close,
  and focus restoration.
- Combobox provides searchable collection state, controlled and uncontrolled
  value/query conventions, popover styling, disabled keys, and keyboard tests.
- MultiSelect, AsyncSelect, and TagInput provide prior art for selected item
  modeling, async statuses, retry actions, minimum-query messaging, and stable
  selected values across result changes.
- NavigationMenu, Sidebar, and NavDock provide app-shell semantics, current
  route language, motion presets, RTL expectations, and dashboard recipes.
- DataTable provides loading/empty/error state coverage and workflow-level
  docs/tests.

## Research Notes

Context7 documentation was fetched for current shadcn/ui Command, React Aria,
Motion, and GitHub CLI behavior during PRD and issue publication work.

Modern Web Guidance was fetched for accessibility and HTML guidance. Relevant
rules for CommandPalette:

- prefer native HTML elements and attributes before ARIA
- use anchors for navigation and buttons for actions
- keep focus order logical and visible
- avoid positive `tabindex`
- do not hide focusable controls from assistive technologies
- use polite live regions for search result feedback and avoid noisy updates
- use modal overlay behavior for dialog mode rather than hand-rolled focus
  traps
- use `dvh` and safe-area-aware sizing for fixed overlays

React Aria documentation confirms that modal overlays should handle portal
rendering, focus containment, scroll locking, and focus restoration through the
overlay system. React Aria ListBox and ComboBox APIs provide useful keyboard
and collection precedents, but CommandPalette must avoid presenting itself as a
form value picker.

Motion documentation confirms `AnimatePresence` for exit animation,
layout/shared layout animation for selected indicators, and
`MotionConfig reducedMotion="user"` or equivalent handling for reduced-motion
preferences. Motion should be limited to behavior CSS cannot express cleanly.

## Component Family

The v1 component family should include:

- `CommandPalette`
- `CommandPaletteProvider` if shared state needs a named provider
- `CommandPaletteTrigger`
- `CommandPaletteDialog`
- `CommandPaletteContent`
- `CommandPaletteInput`
- `CommandPaletteList`
- `CommandPaletteGroup`
- `CommandPaletteItem`
- `CommandPaletteItemIcon`
- `CommandPaletteItemLabel`
- `CommandPaletteItemDescription`
- `CommandPaletteItemShortcut`
- `CommandPaletteSeparator`
- `CommandPaletteEmpty`
- `CommandPaletteLoading`
- `CommandPaletteError`
- `CommandPaletteRetry`
- `CommandPaletteFooter`
- `CommandPaletteAnnouncer`
- `CommandPalettePageStack`
- `CommandPalettePage`
- `CommandPalettePageHeader`
- `CommandPalettePageBack`

Implementation slices may add helper exports for class-name maps, command
normalization, filtering, page-stack utilities, and public prop/data types when
they make the public contract clearer.

`CommandPaletteDialog` is dialog-mode anatomy inside CommandPalette. There is
no separate standalone `CommandDialog` roadmap component.

## Command Model

Command identity should use stable string keys. Commands may come from base
commands, recent commands, suggested commands, async results, page-specific
commands, or consumer-rendered children.

Command records should support:

- `key`: stable command key
- `type`: `action`, `link`, `page`, or `separator`
- `label`: visible command label
- `textValue`: plain text used for filtering and announcements
- `aliases`: alternate searchable names
- `keywords`: additional searchable words
- `description`: supporting copy
- `icon`: decorative or informative command icon slot
- `shortcut`: display-only shortcut hint
- `group`: group key or visible group label
- `source`: `base`, `recent`, `suggested`, `async`, `page`, or custom string
- `priority`: optional sort hint
- `metadata`: app-owned command metadata
- `disabled`: unavailable state
- `disabledReason`: visible or announced reason for disabled commands
- `destructive`: dangerous action state
- `href`, `target`, and `rel`: navigation command fields
- `action`: app-owned action callback
- `page`: nested page target or nested page descriptor
- `closeOnRun`: command-level close behavior override

CommandPalette should not own permissions, analytics, persistence, routing, or
network orchestration. It should pass enough command context through callbacks
for apps to own those concerns.

## Public API Direction

Root-level props should support:

- `open`, `defaultOpen`, and `onOpenChange` for dialog mode
- `query`, `defaultQuery`, and `onQueryChange`
- `selectedKey`, `defaultSelectedKey`, and `onSelectedKeyChange`
- `activePage`, `defaultActivePage`, and `onActivePageChange` where exposed
- `commands`, `recentCommands`, `suggestedCommands`, and async result commands
- `loading`, `empty`, `error`, `onRetry`, and minimum-query status controls
- `filter`, `sort`, `shouldFilter`, and `limit`
- `onCommandRun`, `onCommandSelect`, `onCommandClose`, and execution context
  callbacks
- `closeOnRun` default behavior
- `mode`: `inline` or `dialog` if a single root owns both modes
- `controlSize` or equivalent Dethink size token
- `motionPreset`: `none`, `subtle`, `standard`, or `expressive`
- `reducedMotion`: optional explicit override for the user's reduced-motion
  preference
- `className`, refs, and stable `data-slot` hooks

Command item props should support:

- stable `value` or `commandKey`
- `command` for data-driven composition
- `asChild` only where the implementation can preserve semantics and keyboard
  behavior
- `disabled`, `disabledReason`, and `destructive`
- `href`, `target`, `rel`, and action callbacks
- custom children for icon, label, description, shortcut, badges, and metadata

V1 should not add component-local theme props. Theme, density, color mode, and
direction are provider concerns.

## Data-Driven And Children-Driven Usage

CommandPalette should support:

- a data-driven API for most app command menus
- explicit children composition for custom command rows and advanced recipes
- mixed usage where data records render through a function child

Data-driven records should normalize into the same internal command shape used
by children where possible. The public contract should not require consumers to
learn an internal collection library.

## Inline Mode

Inline mode should make CommandPalette usable inside Sidebar, dashboards,
settings panels, and scoped resource pickers without a modal overlay.

Inline mode expectations:

- no portal by default
- no focus trap
- labelled search input
- predictable list semantics
- command execution through links and buttons
- recents/suggestions before query
- loading, empty, error, retry, and minimum-query states
- stable height and responsive constraints so result changes do not cause
  incoherent layout shifts

## Dialog Mode

Dialog mode should reuse existing Dialog/provider portal behavior where
practical. It should preserve provider theme, density, direction, font, and
custom token context inside the portal.

Dialog mode expectations:

- controlled and uncontrolled open state
- trigger composition
- visible or visually hidden accessible title
- focus moves into the palette on open
- focus remains contained while open
- focus returns to the trigger or documented fallback on close
- Escape closes the palette at the root page
- nested pages may intercept Escape to step back before closing
- responsive content size uses dynamic viewport units and safe-area-aware
  constraints
- body/background interaction is blocked through the Dialog substrate
- global shortcut registration remains app-owned

## Link And Action Semantics

Use one command activation surface per row.

- Link commands should render real anchors for `href` navigation or use a
  router-composable slot that preserves anchor semantics.
- Action commands should render real buttons with `type="button"`.
- Page commands should render buttons because they change CommandPalette state
  rather than navigate the browser.
- Disabled actions should use native disabled behavior where that does not hide
  necessary explanatory context. When disabled items must remain inspectable,
  use documented disabled semantics and prevent activation.
- Disabled link commands should not behave like normal links. They should
  expose disabled state visually and programmatically and avoid accidental
  navigation.
- Do not nest buttons, anchors, inputs, or menu controls inside an interactive
  command item.

The implementation may keep focus in the search input while using an active
descendant or selected-key model for arrow navigation, or it may use a roving
focus model if type-to-search remains smooth. Either approach must preserve
native link/action activation, visible focus/selection state, and screen-reader
announcements. The chosen runtime model must be documented in the issue #236
implementation.

## Keyboard Behavior

Required keyboard behavior:

- Type in the input to update `query`.
- Arrow Down moves to the next enabled result.
- Arrow Up moves to the previous enabled result.
- Home and End move to the first and last enabled result where supported.
- Enter runs the active command.
- Escape clears, steps back, or closes according to state:
  - from a nested page, Escape steps back
  - from the root page in dialog mode, Escape closes
  - from inline mode, Escape clears query or returns to an idle state where
    documented
- Tab follows normal focus order in inline mode.
- Tab remains contained by the Dialog substrate in dialog mode.
- Disabled commands are skipped by active-result navigation unless the
  implementation deliberately supports focusing disabled items to reveal
  reasons.

Shortcut display does not register global key handlers. Apps own Cmd/Ctrl+K and
other command accelerators.

## Filtering And Sorting

Built-in filtering should be deterministic and dependency-light. V1 should not
add a fuzzy-search runtime dependency.

Default filtering should consider:

- `textValue`
- string labels
- aliases
- keywords
- group labels
- selected metadata fields only if explicitly documented

Filtering API expectations:

- `filter` allows app-provided match logic.
- `sort` allows app-provided ranking.
- `shouldFilter={false}` or equivalent manual mode lets server-backed command
  sets bypass local filtering.
- `limit` caps rendered result count.
- Disabled commands remain visible by default unless a prop or custom filter
  hides them.
- Result ordering should remain stable across query updates when scores tie.

Large command sets should use async/manual filtering and result limits. V1 does
not promise virtualization or local full-text indexing.

## Async Sources, Recents, And Suggestions

Async behavior is app-owned. CommandPalette should expose rendering and state
contracts, not fetch clients or cache integrations.

Supported source states:

- recents/suggestions before query
- minimum-query messaging
- loading
- stale results where practical
- empty
- error
- retry
- ready

Recents and suggestions should be controlled by consumers. `onCommandRun` or an
equivalent callback should provide enough context for apps to update command
history, analytics, and persistence.

Retry controls should be buttons, keyboard reachable, and labelled.

Loading and result-count announcements should be polite and should avoid
spamming screen-reader users while typing.

## Nested Page Stack

Nested pages let the palette drill into projects, teams, resources, command
categories, and AI workflows without becoming a router or wizard framework.

Page stack behavior should support:

- root page
- nested page ids
- page titles
- optional page descriptions
- page back control
- page-specific commands
- page-specific empty/loading/error/retry states
- active page callbacks
- page depth data attributes
- motion direction data attributes

Escape behavior:

- nested page: step back
- root page in dialog mode: close
- root page in inline mode: clear or idle behavior as documented

Page commands should not run their final action until the user activates a
terminal action or link command.

## Live Announcements

CommandPalette should include or compose a live announcer. This may later become
a shared utility used by Toast, Combobox, DataTable, and other async
components, but CommandPalette v1 should not block on that future extraction.

Announcement expectations:

- result count after filtering, debounced politely
- active/selected command changes where useful
- loading, empty, error, retry, and minimum-query states
- page changes and back navigation
- command execution confirmation where the command does not visibly navigate
  or close

Use polite live regions for normal updates. Use assertive announcements only
for critical states that block safe continuation.

## Motion Dependency Decision

CommandPalette v1 may use Motion in the dedicated motion slice because the
planned selected-row indicator, result enter/exit, nested page direction, and
presence behavior are easier to express safely with `AnimatePresence`, layout
animation, and reduced-motion configuration.

Core inline behavior should not import Motion before issue #240. If Motion is
imported in CommandPalette, registry metadata must declare it, and basic
components outside CommandPalette must not gain additional Motion requirements.

Simple hover, focus, color, opacity, border, and static state transitions should
use tokenized CSS transitions. Motion should be reserved for:

- selected-row layout movement
- result enter/exit presence
- group reveal where CSS-only mounted/unmounted state becomes brittle
- nested page directional transitions
- optional recent/suggested stagger

## Motion Contract

Motion presets should include:

- `none`: no non-essential movement
- `subtle`: small opacity/position polish
- `standard`: default selected-row, result, and page transitions
- `expressive`: optional stagger and stronger page/list choreography

The implemented motion path should expose:

- `data-motion` on the root, dialog content, generated pages, result wrappers,
  group wrappers, and selected-row indicator
- `data-reduced-motion` when motion is forced off by preference or prop
- `data-motion-stagger` only for active stagger paths
- `data-page-direction` for nested page push/back direction
- `data-slot="command-palette-motion-group"` and
  `data-slot="command-palette-motion-result"` for list choreography hooks
- `data-slot="command-palette-selected-indicator"` for the shared selected-row
  indicator

Reduced-motion behavior:

- disable transform-heavy movement
- disable layout morphing and stagger
- preserve opacity/color/focus state where useful
- keep selected, focused, disabled, destructive, loading, empty, and error
  states visible without animation
- never make animation the only indicator of state

Performance requirements:

- prefer transform and opacity
- use stable dimensions for fixed-format rows, indicators, input, footer, and
  dialog content
- avoid animating layout properties directly unless using scoped Motion layout
  primitives and verifying no layout shift
- keep list animation bounded by result limits

## Accessibility

- Use semantic HTML and native controls first.
- Inline mode must have a visible label or documented visually hidden label.
- Dialog mode must have an accessible name through visible or visually hidden
  title.
- Placeholder text is not a label.
- Use real anchors for navigation and real buttons for actions/page changes.
- Keep focus order logical in inline and dialog modes.
- Provide visible `:focus-visible` styling on every interactive part.
- Keep decorative icons hidden from assistive technology.
- Do not hide focusable controls with `aria-hidden`.
- Do not use ARIA menu roles for ordinary command result lists.
- Disabled commands must be visibly disabled and unavailable to activation.
- Disabled reasons should be reachable visually and/or through accessible
  descriptions.
- Destructive commands should not rely on color alone.
- Result counts and async state changes should be announced politely.
- Dialog mode should rely on Dialog substrate behavior for inert background,
  scroll lock, Escape, and focus restoration.
- RTL should inherit from provider direction and avoid hard-coded left/right
  assumptions.

## Styling And Tokens

- Use Tailwind CSS v4 utilities and explicit static class maps.
- Use `cn` for class merging.
- Use semantic provider tokens for background, foreground, muted,
  muted-foreground, border, input, ring, primary, destructive, spacing, radius,
  shadow, density, and motion.
- Avoid hard-coded brand colors.
- Avoid runtime class-name generation that Tailwind cannot detect.
- Avoid CSS-in-JS, styled-components, Emotion, and component-local theme
  runtimes.
- Use logical spacing and alignment utilities.
- Support light, dark, system color mode, compact/default/comfortable density,
  high-contrast-ready states, responsive layouts, custom themeConfig, and RTL.
- Keep text from overlapping shortcuts, icons, descriptions, and footer
  controls at narrow widths.
- Use stable row, input, footer, and dialog dimensions so hover, selected,
  loading, and status changes do not shift layout unexpectedly.

## Data Attributes

CommandPalette should expose stable data attributes:

- `data-slot="command-palette"`
- `data-slot="command-palette-provider"`
- `data-slot="command-palette-trigger"`
- `data-slot="command-palette-dialog"`
- `data-slot="command-palette-content"`
- `data-slot="command-palette-input"`
- `data-slot="command-palette-list"`
- `data-slot="command-palette-group"`
- `data-slot="command-palette-item"`
- `data-slot="command-palette-item-icon"`
- `data-slot="command-palette-item-label"`
- `data-slot="command-palette-item-description"`
- `data-slot="command-palette-item-shortcut"`
- `data-slot="command-palette-separator"`
- `data-slot="command-palette-empty"`
- `data-slot="command-palette-loading"`
- `data-slot="command-palette-error"`
- `data-slot="command-palette-retry"`
- `data-slot="command-palette-footer"`
- `data-slot="command-palette-announcer"`
- `data-slot="command-palette-page-stack"`
- `data-slot="command-palette-page"`
- `data-slot="command-palette-page-header"`
- `data-slot="command-palette-page-back"`
- `data-slot="command-palette-motion-group"`
- `data-slot="command-palette-motion-result"`
- `data-slot="command-palette-selected-indicator"`
- `data-state`
- `data-open`
- `data-mode`
- `data-selected`
- `data-active`
- `data-disabled`
- `data-destructive`
- `data-loading`
- `data-empty`
- `data-error`
- `data-source`
- `data-page`
- `data-page-depth`
- `data-page-direction`
- `data-motion`
- `data-motion-stagger`
- `data-reduced-motion`

## Registry Requirements

- Add a `command-palette` registry item with source, index export, needed
  helpers, and tests where registry metadata supports them.
- Depend on `dethink-base` and any copied Dethink primitives used by the
  source.
- Declare Dialog/Input/Button/IconButton/Separator or other Dethink registry
  dependencies accurately when the source imports them.
- Declare Motion only if the CommandPalette implementation imports Motion.
- Do not declare cmdk unless a later issue explicitly chooses and justifies it.
- Keep dependency metadata accurate for provider portals, live announcers,
  icons, utilities, and registry portability.
- Registry smoke should verify copied source, dependency metadata, aliases,
  style imports, CSS variable reliance, Motion metadata, and package exports.

## Documentation Requirements

- Overview: CommandPalette is the action/navigation command workflow layer.
- Installation through registry and package import.
- Relationship to shadcn/ui Command and cmdk.
- Relationship to Combobox, Select, DropdownMenu, Dialog, Sidebar,
  NavigationMenu, and Dashboard Shell.
- Anatomy and stable data attributes.
- Command schema and command types.
- Data-driven and children-driven usage.
- Inline mode and dialog mode.
- Link commands, action commands, page commands, disabled reasons, destructive
  commands, and shortcuts.
- Filtering, sorting, manual filtering, result limits, and large-data guidance.
- Async sources, recents, suggestions, loading, empty, error, retry, and
  minimum-query states.
- Nested pages and Escape close/back behavior.
- Live announcements and screen-reader behavior.
- Motion presets and reduced-motion behavior.
- Theming, density, dark mode, custom themeConfig, responsive behavior, and RTL.
- App-shell recipes for global launcher, Sidebar command search,
  NavigationMenu handoff, project/resource switcher, dashboard action runner,
  and AI command menu.
- Testing and migration notes.

## Testing Seams

- Unit tests for command normalization, filtering, sorting, source merging,
  result limits, disabled filtering rules, page-stack utilities, and execution
  lifecycle decisions.
- Render tests for inline mode, dialog mode, grouped results, data-driven
  usage, children composition, link commands, action commands, page commands,
  shortcuts, disabled reasons, destructive commands, loading, empty,
  error/retry, recents/suggestions, nested pages, className composition, refs,
  and data attributes.
- Keyboard tests for typing, arrow navigation, Home/End, Enter activation,
  Escape close/back, disabled skipping, Tab containment in dialog mode, and
  focus restoration.
- Accessibility tests for labelled inline mode, labelled dialog mode, grouped
  results, disabled commands, destructive commands, loading/empty/error/retry
  states, live announcements, nested pages, and no missing accessible names.
- Live-region tests for result counts, selected command changes, async state
  changes, page changes, retry availability, and command execution messages.
- SSR smoke tests for inline mode, closed dialog mode, grouped commands, async
  idle states, recents/suggestions, and initial nested page rendering.
- Storybook coverage for inline, dialog, grouped commands, actions, links,
  shortcuts, disabled/destructive, custom/manual filtering, async,
  recents/suggestions, nested pages, motion presets, reduced motion, dark mode,
  density, RTL, and theme overrides.
- Showcase recipes for global launcher, Sidebar inline search, dashboard action
  runner, project/resource switcher, NavigationMenu handoff, and AI command
  menu.
- Registry validation and smoke checks for copied install behavior.

## Out Of Scope

- Global keyboard shortcut registration or a Hotkeys provider.
- Search indexing, fuzzy-search runtime dependencies, or full-text search
  engines.
- Virtualized result lists and infinite scrolling.
- Router adapters for Next.js, React Router, TanStack Router, or other
  frameworks.
- Permissions engines, auth-aware command loading, or server-driven command
  loaders.
- Fetch clients, cache integrations, or request orchestration frameworks.
- Toasts, notifications, mutation confirmation flows, undo flows, and
  AlertDialog-style destructive confirmations.
- Voice command input.
- AI prompt execution UI beyond command examples.
- General Combobox, Select, Listbox, or form-field behavior.
- A separate standalone `CommandDialog` component outside the CommandPalette
  family.
