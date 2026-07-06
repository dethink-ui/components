# CommandPalette Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/187.

Package target: `@dethink/components`.

Last amended: 2026-07-06.

## Problem Statement

Power users of SaaS dashboards, internal tools, AI-native workspaces, and admin
consoles expect fast keyboard-driven command access. The repository already has
Dialog, Input, Combobox, MultiSelect, AsyncSelect, TagInput, DropdownMenu,
Sidebar, NavigationMenu, and DataTable, but it lacks a CommandPalette that
combines search, grouped commands, keyboard navigation, shortcuts, async
command sources, nested command flows, result announcements, and polished
transitions.

Without CommandPalette, teams either wire command menus from scratch, copy a
thin shadcn/cmdk wrapper, or misuse Combobox for global app actions. That leads
to inconsistent keyboard behavior, weak async state handling, inaccessible
dialogs, duplicated recents/suggestions logic, unclear action/link semantics,
and command surfaces that do not match the rest of the library.

The component must add developer value beyond shadcn/ui Command. shadcn's
Command is a useful styled cmdk composition for input, list, empty state,
groups, separators, items, shortcuts, and dialog examples. Dethink
CommandPalette should be a production command workflow layer for dashboard and
app-shell products, not another styled command primitive.

## Solution

Ship a CommandPalette component family for global and scoped commands. It
should support dialog and inline modes, grouped results, icons, descriptions,
shortcuts, recent commands, suggested commands, async loading, empty/error/retry
states, custom filtering and sorting, pages/nested command flows, action
commands, link commands, disabled/destructive commands, live result
announcements, and built-in motion.

CommandPalette should borrow collection and filtering vocabulary from
Combobox, MultiSelect, AsyncSelect, and TagInput, but it should not be a form
field. It is an action/navigation surface that can contain links, callbacks,
nested pages, and async suggestions. `CommandPaletteDialog` is an anatomy/mode
inside this component family, not a separate standalone component on the
roadmap.

## Developer Value Compared With shadcn/ui Command

- Provide a typed command model for action, link, nested-page, recent,
  suggested, disabled, and destructive commands instead of leaving every app to
  invent item metadata.
- Provide a data-driven API and an explicit children-composition API, so teams
  can choose structured command records, custom markup, or both.
- Provide async command source states: loading, stale results where practical,
  empty, error, retry, minimum-query messaging, and consumer-owned fetch
  cancellation boundaries.
- Provide first-class recents and suggestions while keeping persistence and
  analytics app-owned.
- Provide nested page stack behavior with back navigation, Escape-to-back,
  page titles, page-specific empty/loading states, and directional motion.
- Provide command execution semantics for links versus actions, disabled
  reasons, destructive styling, and lifecycle callbacks.
- Provide accessible live announcements for result counts, selected result,
  loading, empty, error, command execution, and page changes.
- Provide Dethink app-shell recipes for Sidebar, NavigationMenu, dashboard
  action runners, project/resource switchers, and AI command menus.
- Provide provider-token theming, density, RTL, reduced-motion behavior,
  registry metadata, package exports, Storybook coverage, and automated tests
  as part of the component contract.
- Avoid promising giant local search, router adapters, or permissions engines
  in v1. Large datasets should use async/manual filtering and result limits.

## User Stories

1. As a dashboard power user, I want a command palette, so that I can jump to pages and actions without leaving the keyboard.
2. As an admin user, I want grouped commands, so that navigation, records, settings, and actions are easy to scan.
3. As an AI workspace user, I want command shortcuts, so that common flows can be invoked quickly.
4. As a keyboard user, I want arrow-key navigation through results, so that I can select commands efficiently.
5. As a keyboard user, I want Escape to close or step back predictably, so that nested command flows are safe.
6. As a screen-reader user, I want the palette dialog labelled and focus-managed, so that the search surface is understandable.
7. As a screen-reader user, I want result counts and selected result changes announced, so that filtering feedback is perceivable.
8. As a screen-reader user, I want empty, loading, error, retry, and page-change states announced, so that async command flows are understandable.
9. As a product engineer, I want dialog mode, so that global command menus can open from a trigger or app-owned shortcut.
10. As a product engineer, I want inline mode, so that command search can live in sidebars, dashboards, and scoped panels.
11. As a product engineer, I want controlled and uncontrolled open state, so that apps can own global shortcut behavior.
12. As a product engineer, I want controlled and uncontrolled query state, so that apps can synchronize command search with their own data loading.
13. As a product engineer, I want a typed command schema, so that action, link, page, disabled, destructive, recent, and suggested commands are modeled consistently.
14. As a product engineer, I want a children-composition API, so that custom command row markup is possible without abandoning the Dethink contract.
15. As a product engineer, I want custom filtering and sorting, so that commands can match labels, aliases, keywords, and metadata.
16. As a product engineer, I want manual filtering support, so that large or remote datasets can avoid unnecessary local filtering.
17. As a product engineer, I want result limits, so that command surfaces stay fast and scannable.
18. As a product engineer, I want async loading, stale, empty, error, and retry states, so that server search and generated suggestions can populate results safely.
19. As a product engineer, I want recent and suggested command sections, so that the palette is useful before typing.
20. As a product engineer, I want consumer-owned recents callbacks, so that apps can persist command history without the component owning storage.
21. As a product engineer, I want no-results affordances, so that users know whether to refine, create, or retry.
22. As a product engineer, I want command links and command actions, so that the palette handles navigation and mutations with correct semantics.
23. As a product engineer, I want command lifecycle callbacks, so that analytics, recents, closing behavior, and optimistic UI can be app-owned.
24. As a product engineer, I want destructive command styling, so that dangerous actions are visually distinct.
25. As a product engineer, I want disabled commands with reasons, so that unavailable actions explain themselves.
26. As a product engineer, I want shortcuts displayed in a consistent slot, so that users can learn faster paths.
27. As a product engineer, I want shortcuts to remain display-only, so that global key handling stays under app control.
28. As a product engineer, I want nested pages, so that command groups can drill into projects, teams, records, and command categories.
29. As a product engineer, I want page-specific titles, breadcrumbs/back controls, and empty states, so that nested command flows remain understandable.
30. As a design-system consumer, I want selected-row animation, so that keyboard movement feels responsive.
31. As a design-system consumer, I want result enter/exit animation, so that filtering feels alive rather than jumpy.
32. As a design-system consumer, I want nested page directional transitions, so that drill-down command flows preserve spatial context.
33. As a design-system consumer, I want motion presets, so that teams can choose none, subtle, standard, or expressive behavior.
34. As a motion-sensitive user, I want reduced-motion handling, so that command use remains comfortable.
35. As a package consumer, I want token-backed variants, sizes, density, dark mode, and RTL support, so that CommandPalette fits every app.
36. As a maintainer, I want CommandPalette to reuse Dialog and provider portal behavior, so that focus and theming remain consistent.
37. As a maintainer, I want CommandPalette to reuse collection modeling lessons from Combobox, MultiSelect, AsyncSelect, and TagInput, so that result behavior is familiar.
38. As a maintainer, I want CommandPalette to stay separate from Combobox and Select, so that action/navigation workflows do not become form controls.
39. As a maintainer, I want async and filtering tests, so that result order and selection remain stable.
40. As a maintainer, I want page-stack and execution tests, so that nested flows and command callbacks remain predictable.
41. As a docs reader, I want examples for global search, project switcher, action runner, AI command menu, and nested pages, so that advanced usage is clear.
42. As a registry user, I want dependencies declared accurately, so that Motion, Dialog, Input, and registry dependencies install correctly.
43. As a future app-shell author, I want CommandPalette to compose with Sidebar and NavigationMenu, so that app navigation has a complete keyboard layer.
44. As an AI coding tool user, I want realistic CommandPalette examples, so that generated dashboards use the library's command patterns instead of ad hoc cmdk copies.

## Implementation Decisions

- Build a CommandPalette family with root/provider, trigger, dialog, content,
  input, list, viewport/body where needed, group, item, item icon, item label,
  item description, item shortcut, separator, empty, loading, error/retry,
  footer, live announcer, page stack, page header, and page back parts.
- Treat `CommandPaletteDialog` as dialog-mode anatomy inside CommandPalette.
  Do not keep a separate `CommandDialog` roadmap component.
- Support dialog mode and inline mode. Dialog mode should reuse existing
  Dialog/provider portal behavior where practical.
- Support controlled and uncontrolled open state, query state, selected key,
  active page/page stack, loading state, and command execution.
- Support data-driven commands and explicit children composition. Command data
  should cover stable key, type, label, text value, aliases, keywords, icon,
  description, shortcut, disabled, disabled reason, destructive state, href,
  target, rel, action, page target, group, source, priority, and metadata.
- Link commands should render anchors or router-composable link slots. Action
  commands should render buttons and call app-provided callbacks.
- Disabled commands should remain visible by default, skip activation, expose
  disabled semantics, and optionally show disabled reasons.
- Destructive commands should use token-backed destructive styling and remain
  visually distinct in focused, selected, hovered, disabled, and reduced-motion
  states.
- Support built-in deterministic filtering over text value, label text,
  aliases, keywords, group labels, and selected metadata fields. Do not add a
  fuzzy-search runtime dependency in v1.
- Support custom filtering, custom sorting, manual filtering, and result limits
  for large or server-backed command sets.
- Support command sources for base commands, recent commands, suggested
  commands, and async results. Persistence, analytics, and fetch orchestration
  remain consumer-owned.
- Support async states: loading, stale results where practical, empty,
  error-like retry slot, minimum-query messaging, and retry actions. Full
  Alert/Toast integration remains a later feedback-suite concern.
- Support nested pages and drill-down command flows. Escape should close the
  palette at the root and step back from nested pages when appropriate.
- Page stack behavior should expose page titles, optional back controls,
  page-specific commands, page-specific status states, direction data
  attributes, and controlled callbacks.
- Support keyboard shortcuts display but not global shortcut registration as a
  hard dependency. Apps own global key listeners and pass open state or trigger
  props.
- Provide command lifecycle callbacks for run, close-on-run decisions, recents
  updates, and execution errors where needed without owning mutation
  confirmation or toast behavior.
- Animation should be built in: dialog overlay/content enter/exit,
  selected-row indicator movement, result list enter/exit, group reveal, nested
  page directional transitions, and optional recent-command stagger.
- Use Motion for list/page/selected-row choreography where CSS cannot express
  the behavior cleanly. Prefer tokenized CSS transitions for simple static
  states. Respect reduced motion through Motion configuration and CSS media
  queries.
- Expose motion presets: `none`, `subtle`, `standard`, and `expressive`, with
  stable reduced-motion behavior for each.
- Keep selected, focused, disabled, destructive, loading, empty, and active
  states visible without relying on animation.
- Expose data attributes for selected, active, disabled, destructive, loading,
  empty, error, source, page depth, page id, motion preset, and motion
  direction.
- Support provider-level light, dark, system color mode, compact/default/
  comfortable density, nested providers, custom theme config, and RTL.
- Do not turn CommandPalette into a general Combobox, Select, or form control.
  It should not submit hidden form values or own field validation.

## Testing Decisions

- Test public behavior at the highest practical seam. Avoid tests that assert
  private state shape, internal reducer names, or DOM order not exposed through
  the public contract.
- Unit tests should cover command normalization, result grouping, deterministic
  filtering, custom filtering hooks, sorting, result limits, disabled filtering
  rules, page-stack transitions, and command lifecycle decisions.
- Rendered tests should cover inline mode, dialog mode, open/close, focus
  restoration, query changes, filtering, custom/manual filtering, grouped
  results, recents, suggestions, disabled items, disabled reasons, destructive
  items, command actions, command links, shortcuts display, empty/loading/error
  states, retry slots, nested pages, Escape close/back behavior, and controlled
  state.
- Keyboard tests should cover arrow navigation, Home/End where supported, Enter
  activation, Escape close/back behavior, Tab containment in dialog mode, focus
  restoration to trigger, disabled item skipping, and RTL-safe directional
  expectations where applicable.
- Async tests should cover loading-to-results, loading-to-empty,
  loading-to-error, retry rendering, stale result behavior if implemented,
  minimum-query messaging, recents/suggestions before query, and manual
  filtering.
- Accessibility tests with axe should cover dialog mode, inline mode, labelled
  input, grouped results, recents/suggestions, disabled commands, destructive
  commands, empty/loading/error states, retry slot, nested page states, and no
  missing accessible names.
- Live-region tests should cover result count announcements, selected command
  announcements, loading/empty/error announcements, command-run announcements,
  and page-change announcements.
- SSR smoke tests should cover inline mode and closed dialog mode without
  hydration mismatches.
- Storybook should cover global command menu, inline sidebar search, project
  switcher, grouped commands, async search, recents/suggestions, nested pages,
  disabled/destructive actions, dark mode, density, RTL, reduced motion, and
  motion presets.
- Showcase should include global app launcher, dashboard action runner, AI
  command menu, Sidebar integration, NavigationMenu handoff, and
  project/resource switcher recipes.
- Registry smoke should verify dependency metadata, copied source portability,
  aliases, CSS variables, provider-token reliance, Motion dependency metadata,
  package exports, and clean consumer imports.
- Prior art should come from Dialog focus/portal tests, Combobox collection and
  keyboard tests, AsyncSelect status tests, NavigationMenu motion tests,
  Sidebar app-shell recipes, NavDock Motion usage, and DataTable async/empty
  state coverage.

## Out of Scope

- Global keyboard shortcut registration or a Hotkeys provider.
- Search indexing, fuzzy-search runtime dependencies, or full-text search
  engines.
- Virtualization and infinite scrolling in v1. Large command sets should use
  async/manual filtering and result limits.
- Router adapters for Next.js, React Router, TanStack Router, or other
  frameworks.
- Permissions engines, server-side command loading infrastructure, or API
  clients.
- Toasts, notifications, mutation confirmation flows, and undo flows.
- AlertDialog-style destructive confirmation flows inside the palette.
- Voice command input.
- AI prompt execution UI beyond command examples.
- General Combobox, Select, Listbox, or form-field behavior.
- A separate standalone `CommandDialog` component outside the CommandPalette
  family.

## Further Notes

Research inputs:

- shadcn/ui Command is a styled cmdk composition for command search and quick
  actions, with examples for basic dialog usage, shortcuts, groups, scrollable
  lists, and RTL: https://ui.shadcn.com/docs/components/base/command
- cmdk frames command menus as composable command surfaces with input, list,
  empty state, groups, separators, items, keywords, async loading slots,
  manual filtering through `shouldFilter={false}`, and no built-in global
  shortcut listener or virtualization: https://github.com/dip/cmdk
- React Aria Autocomplete can filter collection components for command
  palettes and searchable menus: https://react-aria.adobe.com/Autocomplete
- WAI-ARIA dialog guidance requires modal focus containment and predictable
  focus movement for dialog mode:
  https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Motion docs support `AnimatePresence`, layout animation, gestures, and
  reduced-motion configuration for polished but accessible result transitions:
  https://motion.dev/docs/react-animate-presence
- Repository prior art: Dialog handles modal focus/portal behavior; Combobox,
  MultiSelect, AsyncSelect, and TagInput provide collection and async-state
  precedents; NavigationMenu, Sidebar, and NavDock provide app-shell and motion
  precedents.
