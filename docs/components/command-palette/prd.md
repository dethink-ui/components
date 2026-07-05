# CommandPalette Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/187.

Package target: `@dethink/components`.

## Problem Statement

Power users of SaaS dashboards, internal tools, AI-native workspaces, and admin consoles expect fast keyboard-driven command access. The repository already has Dialog, Input, Combobox, MultiSelect, AsyncSelect, TagInput, DropdownMenu, and DataTable, but it lacks a CommandPalette that combines search, grouped commands, keyboard navigation, shortcuts, empty/loading states, and polished transitions.

Without CommandPalette, teams either wire command menus from scratch or misuse Combobox for global app actions. That leads to inconsistent keyboard behavior, weak async state handling, inaccessible dialogs, and command surfaces that do not match the rest of the library.

## Solution

Ship a CommandPalette component family for global and scoped commands. It should support dialog and inline modes, grouped results, icons, descriptions, shortcuts, recent commands, async loading, empty states, custom filtering, pages/nested command flows, actions, links, and built-in animation. It should feel premium through fast open/close transitions, command result choreography, selected-row motion, page drill-down transitions, and reduced-motion-aware behavior.

CommandPalette should borrow filtering and collection vocabulary from existing selection components, but it should not be a form field. It is an action/navigation surface that can contain links, callbacks, nested pages, and async suggestions.

## User Stories

1. As a dashboard power user, I want a command palette, so that I can jump to pages and actions without leaving the keyboard.
2. As an admin user, I want grouped commands, so that navigation, records, settings, and actions are easy to scan.
3. As an AI workspace user, I want command shortcuts, so that common flows can be invoked quickly.
4. As a keyboard user, I want arrow-key navigation through results, so that I can select commands efficiently.
5. As a keyboard user, I want Escape to close or step back predictably, so that nested command flows are safe.
6. As a screen-reader user, I want the palette dialog labelled and focus-managed, so that the search surface is understandable.
7. As a screen-reader user, I want selected result and empty/loading state semantics, so that filtering feedback is announced.
8. As a product engineer, I want dialog mode, so that global command menus can open with a shortcut.
9. As a product engineer, I want inline mode, so that command search can live in sidebars or dashboards.
10. As a product engineer, I want controlled and uncontrolled open state, so that apps can own global shortcut behavior.
11. As a product engineer, I want custom filtering, so that commands can use labels, aliases, keywords, and metadata.
12. As a product engineer, I want async loading, so that server search and recently-used actions can populate results.
13. As a product engineer, I want nested pages, so that command groups can drill into projects, teams, or command categories.
14. As a product engineer, I want recent and suggested command sections, so that the palette is useful before typing.
15. As a product engineer, I want no-results affordances, so that users know whether to refine, create, or retry.
16. As a product engineer, I want command links and command actions, so that the palette handles navigation and mutations.
17. As a product engineer, I want destructive command styling, so that dangerous actions are visually distinct.
18. As a product engineer, I want disabled commands with reasons, so that unavailable actions explain themselves.
19. As a product engineer, I want shortcuts displayed in a consistent slot, so that users can learn faster paths.
20. As a design-system consumer, I want selected-row animation, so that keyboard movement feels responsive.
21. As a design-system consumer, I want result enter/exit animation, so that filtering feels alive rather than jumpy.
22. As a design-system consumer, I want nested page directional transitions, so that drill-down command flows preserve spatial context.
23. As a motion-sensitive user, I want reduced-motion handling, so that command use remains comfortable.
24. As a package consumer, I want token-backed variants, sizes, density, and dark mode, so that CommandPalette fits every app.
25. As a maintainer, I want CommandPalette to reuse Dialog and provider portal behavior, so that focus and theming remain consistent.
26. As a maintainer, I want CommandPalette to reuse option/result modeling lessons from Combobox, MultiSelect, AsyncSelect, and TagInput, so that collection behavior is familiar.
27. As a maintainer, I want async and filtering tests, so that result order and selection remain stable.
28. As a docs reader, I want examples for global search, project switcher, action runner, AI command menu, and nested pages, so that advanced usage is clear.
29. As a registry user, I want dependencies declared accurately, so that Motion and overlay dependencies install correctly.
30. As a future app-shell author, I want CommandPalette to compose with Sidebar and NavigationMenu, so that app navigation has a complete keyboard layer.

## Implementation Decisions

- Build a CommandPalette family with root/provider, trigger, dialog, content, input, list, group, item, item icon, item label, item description, item shortcut, separator, empty, loading, footer, and page stack parts.
- Support dialog mode and inline mode. Dialog mode should reuse existing Dialog/provider portal behavior where practical.
- Support controlled and uncontrolled open state, query state, selected key, active page, and command execution.
- Support item data and explicit children composition. Item data should include key, label, textValue, aliases, keywords, icon, description, shortcut, disabled, disabledReason, destructive, href, action, group, and metadata.
- Support custom filtering and sorting. Built-in filtering should handle text value, keywords, aliases, and disabled filtering rules.
- Support async states: loading, empty, error-like retry slot, and stale results where needed. Full Alert/Toast integration remains a later feedback-suite concern.
- Support nested pages and drill-down command flows. Escape should close the palette at the root and step back from nested pages when appropriate.
- Support keyboard shortcuts display but not global shortcut registration as a hard dependency. Apps own global key listeners and pass open state or trigger props.
- Use links for navigation commands and buttons for action commands.
- Animation should be built in: dialog overlay/content enter/exit, selected-row indicator movement, result list enter/exit, group reveal, nested page directional transitions, and optional recent-command stagger.
- Use Motion for dialog/list/page-stack transitions and selected-row layout animation where needed. Respect reduced motion through Motion reduced-motion configuration and CSS media queries.
- Keep selected and focused states visible without relying on animation.
- Expose data attributes for selected, active, disabled, destructive, loading, empty, page depth, and motion direction.
- Do not turn CommandPalette into a general Combobox, Select, or form control.

## Testing Decisions

- Rendered tests should cover open/close, focus restoration, query changes, filtering, custom filtering, grouped results, disabled items, command actions, command links, shortcuts display, empty/loading states, nested pages, Escape behavior, and controlled state.
- Keyboard tests should cover arrow navigation, Home/End where supported, Enter activation, Escape close/back behavior, Tab containment in dialog mode, and focus restoration to trigger.
- Async tests should cover loading-to-results, loading-to-empty, stale result handling if implemented, and retry slot rendering.
- Axe tests should cover dialog mode, inline mode, empty, loading, grouped, disabled, destructive, and nested page states.
- SSR smoke tests should cover inline mode and closed dialog mode.
- Storybook should cover global command menu, project switcher, grouped commands, async search, nested pages, destructive actions, dark mode, density, RTL, reduced motion, and advanced animation presets.
- Showcase should include global app launcher, dashboard action runner, AI command menu, and project/resource switcher recipes.

## Out of Scope

- Global keyboard shortcut registration.
- Search indexing, fuzzy-search dependency decisions beyond the component-local filter API.
- Toasts, notifications, or mutation confirmation flows.
- Permissions engines and server-side command loading.
- Full router adapters.
- Voice command input.
- AI prompt execution UI beyond command examples.

## Further Notes

Research inputs:

- cmdk frames command menus as composable command surfaces with input, list, empty state, groups, separators, and items: https://github.com/dip/cmdk
- shadcn/ui Command examples emphasize dialog command palettes, grouped results, shortcuts, and empty state composition: https://ui.shadcn.com/docs/components/radix/command
- React Aria Autocomplete can filter collection components for command palettes and searchable menus: https://react-aria.adobe.com/Autocomplete
- WAI-ARIA dialog guidance requires modal focus containment and predictable focus movement for dialog mode: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Motion docs support `AnimatePresence`, layout animation, gestures, and reduced-motion configuration for polished but accessible result transitions: https://motion.dev/docs/react-animate-presence
