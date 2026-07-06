# CommandPalette Issue Breakdown

Status: Published to GitHub issue tracker.

This uses the `to-issues` tracer-bullet format.

Package target: `@dethink/components`.

## Parent PRD

- Parent PRD: https://github.com/parveshh/dethink-components/issues/187

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/187
- AFK CommandPalette contract, shadcn differentiation, and local planning docs: https://github.com/parveshh/dethink-components/issues/235
- AFK CommandPalette core inline command model, filtering, and package surface: https://github.com/parveshh/dethink-components/issues/236
- AFK CommandPalette dialog mode, portal focus, and app-shell trigger: https://github.com/parveshh/dethink-components/issues/237
- AFK CommandPalette async sources, recents, suggestions, and announcements: https://github.com/parveshh/dethink-components/issues/238
- AFK CommandPalette nested page stack and command workflows: https://github.com/parveshh/dethink-components/issues/239
- AFK CommandPalette premium motion and reduced-motion behavior: https://github.com/parveshh/dethink-components/issues/240
- AFK CommandPalette registry, Storybook, showcase, a11y, SSR, and final verification: https://github.com/parveshh/dethink-components/issues/241

## Branch Stack

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

## Proposed Breakdown

1. **Title**: CommandPalette contract, shadcn differentiation, and local planning docs (#235)
   **Type**: AFK
   **Blocked by**: #187
   **User stories covered**: 1-44

2. **Title**: CommandPalette core inline command model, filtering, and package surface (#236)
   **Type**: AFK
   **Blocked by**: #235
   **User stories covered**: 1-5, 10, 12-17, 22-27, 35, 37-39, 42, 44

3. **Title**: CommandPalette dialog mode, portal focus, and app-shell trigger (#237)
   **Type**: AFK
   **Blocked by**: #236
   **User stories covered**: 5-11, 22, 23, 27, 34-36, 41-44

4. **Title**: CommandPalette async sources, recents, suggestions, and announcements (#238)
   **Type**: AFK
   **Blocked by**: #236
   **User stories covered**: 7, 8, 12, 18-23, 35, 37, 39, 41, 42, 44

5. **Title**: CommandPalette nested page stack and command workflows (#239)
   **Type**: AFK
   **Blocked by**: #236, #237
   **User stories covered**: 5, 8, 13, 22, 23, 28, 29, 32, 34, 35, 40-44

6. **Title**: CommandPalette premium motion and reduced-motion behavior (#240)
   **Type**: AFK
   **Blocked by**: #237, #238, #239
   **User stories covered**: 30-35, 42, 44

7. **Title**: CommandPalette registry, Storybook, showcase, a11y, SSR, and final verification (#241)
   **Type**: AFK
   **Blocked by**: #236, #237, #238, #239, #240
   **User stories covered**: 1-44

## Published Issue #235

## Parent

- #187

## What to build

Create the local CommandPalette contract and planning documents from the
amended PRD. The docs should define CommandPalette as a production command
workflow layer rather than a thin shadcn/cmdk wrapper, capture the public
component family, typed command model, data-driven and children-driven APIs,
inline and dialog mode boundaries, command source states, nested page stack
behavior, live announcements, motion and reduced-motion contract, app-shell
composition boundaries, testing seams, out-of-scope boundaries, and stacked
branch mapping.

This slice should not implement runtime component source beyond documentation
examples needed to clarify the contract.

## Acceptance criteria

- [ ] Local CommandPalette specification and issue breakdown documents exist and link back to the parent PRD.
- [ ] The docs explain the developer value compared with shadcn/ui Command: typed command schema, async sources, recents/suggestions, page stack, live announcements, app-shell recipes, motion presets, registry metadata, and test coverage.
- [ ] The docs define `CommandPaletteDialog` as anatomy/mode inside CommandPalette and remove any implication that `CommandDialog` is a separate roadmap component.
- [ ] The docs define public anatomy for root/provider, trigger, dialog, content, input, list, group, item, item icon, item label, item description, item shortcut, separator, empty, loading, error/retry, footer, live announcer, page stack, page header, and page back parts.
- [ ] The docs define the typed command model, including action commands, link commands, nested page commands, recent commands, suggested commands, disabled reasons, destructive state, shortcuts, source metadata, and stable keys.
- [ ] The docs define data-driven and children-driven usage, link/action semantics, command execution lifecycle, filtering and sorting contracts, manual filtering, result limits, and no fuzzy-search runtime dependency in v1.
- [ ] The docs define async source states, recents/suggestions ownership, nested page stack behavior, Escape close/back behavior, live announcement expectations, motion presets, and reduced-motion fallback behavior.
- [ ] The docs list unit, render, keyboard, accessibility, live-region, SSR, Storybook, showcase, registry, package export, and verification seams.
- [ ] The branch stack and child issue dependency order are documented locally.

## Blocked by

- #187

## Published Issue #236

## Parent

- #187

## What to build

Build the first runtime CommandPalette slice as an inline command surface. The
completed slice should provide the core CommandPalette family for
root/provider, input, list, group, separator, item anatomy, typed command
records, data-driven rendering, children composition, deterministic filtering,
custom/manual filtering, sorting, result limits, selected item state, keyboard
navigation, action commands, link commands, disabled reasons, destructive
styling, shortcuts display, tokenized classes, package exports, initial
registry metadata, focused tests, and base Storybook examples.

This slice should make CommandPalette usable as a scoped inline command menu
without dialog mode, async source orchestration, nested pages, or advanced
motion choreography.

## Acceptance criteria

- [ ] CommandPalette core inline components are exported with public prop/data types and helper class-name maps.
- [ ] Data-driven and children-driven usage both render stable command markup with grouped results and separators.
- [ ] The typed command model supports stable keys, label/text value, aliases, keywords, icons, descriptions, shortcuts, source metadata, disabled state, disabled reasons, destructive state, action commands, and link commands.
- [ ] Link commands render real anchors or router-composable link slots, while action commands render buttons and call app-provided callbacks.
- [ ] Disabled commands remain visible by default, skip activation, expose disabled semantics, and can display disabled reasons.
- [ ] Destructive commands use token-backed styling across idle, focused, selected, hovered, disabled, and RTL states.
- [ ] Built-in filtering covers text value, label text, aliases, keywords, group labels, and approved metadata fields without adding a fuzzy-search runtime dependency.
- [ ] Custom filtering, custom sorting, manual filtering, and result limits are supported and documented through public props.
- [ ] Keyboard behavior covers arrow navigation, Home/End where supported, Enter activation, disabled skipping, and focus-visible state.
- [ ] Inline mode exposes stable data-slot and state attributes for root, input, list, group, item, selected, active, disabled, destructive, source, and empty states.
- [ ] Render, unit, keyboard, and accessibility tests cover the public inline behavior, filtering contracts, command execution, link/action semantics, disabled reasons, destructive styling, shortcuts, className composition, data attributes, dark mode, density, and RTL.
- [ ] Base Storybook examples cover inline command search, grouped commands, action commands, link commands, shortcuts, disabled/destructive states, custom filtering, manual filtering, dark mode, density, and RTL.
- [ ] Package exports and initial registry metadata are present for the inline CommandPalette path.

## Blocked by

- #235

## Published Issue #237

## Parent

- #187

## What to build

Extend CommandPalette with dialog mode. The completed slice should add the
CommandPalette dialog anatomy, trigger composition, controlled and uncontrolled
open state, provider-aware portal behavior, accessible labelling, focus
movement into the palette, focus containment while open, focus restoration to
the trigger, Escape-to-close at the root page, close-on-run behavior,
responsive dialog sizing, app-shell trigger examples, and tests/stories for
global command menu usage.

This slice should reuse the existing Dialog and provider portal behavior where
practical and should keep global shortcut registration app-owned.

## Acceptance criteria

- [ ] CommandPalette dialog-mode components are exported with public prop/data types and helper class-name maps.
- [ ] Dialog mode supports controlled `open`, uncontrolled `defaultOpen`, `onOpenChange`, trigger composition, accessible title/label handling, and optional visible or visually hidden titles.
- [ ] Dialog mode reuses existing Dialog/provider portal behavior where practical so theme, density, direction, font, and custom tokens survive portal rendering.
- [ ] Focus moves into the dialog on open, remains contained while open, and returns to the trigger or documented fallback on close.
- [ ] Escape closes the palette at the root page, while later nested-page work can intercept Escape for back navigation.
- [ ] Command execution can close the dialog through documented close-on-run behavior without forcing every command to close.
- [ ] Dialog content supports responsive sizing, safe-area/dynamic viewport constraints, scroll containment, dark mode, density, RTL, and reduced-motion-safe open/close transitions.
- [ ] Shortcuts are display-only; no global key listener or Hotkeys dependency is introduced.
- [ ] Render, keyboard, focus, and accessibility tests cover trigger opening, controlled state, Escape close, Tab containment, focus restoration, labelled dialog, provider portal context, command activation, close-on-run, responsive classes, and no missing accessible names.
- [ ] Storybook examples cover global command menu, app-shell trigger, controlled open state, visual hidden title, close-on-run variants, dark mode, density, RTL, and reduced motion.

## Blocked by

- #236

## Published Issue #238

## Parent

- #187

## What to build

Add the async and feedback layer for CommandPalette. The completed slice should
support base commands, recent commands, suggested commands, async result
commands, loading states, stale result presentation where practical, empty
states, error/retry states, minimum-query messaging, consumer-owned recents
callbacks, command execution announcements, result count announcements,
selected command announcements, and tests/stories for server-backed command
search.

This slice should not own persistence, analytics, fetch clients, or server
loading infrastructure. Apps should remain responsible for storage and network
orchestration.

## Acceptance criteria

- [ ] CommandPalette supports separate command sources for base commands, recent commands, suggested commands, and async results with stable source data attributes.
- [ ] Recents and suggestions can render before query input and can be controlled by the consumer.
- [ ] Command run callbacks provide enough context for apps to update recents, analytics, and close behavior without the component owning persistence.
- [ ] Async states cover loading, empty, error/retry, minimum-query messaging, and stale results where implemented.
- [ ] Retry affordances are accessible, token-backed, keyboard reachable, and app-owned through callbacks.
- [ ] Loading, empty, error, retry, recents, suggestions, and async results work in inline mode and remain compatible with dialog mode.
- [ ] Live announcements cover result counts, selected command changes, loading state, empty state, error state, retry availability, command execution, and source/page context where relevant.
- [ ] Async state styling uses provider tokens, density, dark mode, RTL-safe layout, and reduced-motion-safe transitions.
- [ ] Unit and render tests cover source merging, source ordering, recents/suggestions before query, loading-to-results, loading-to-empty, loading-to-error, retry rendering, minimum-query messaging, stale results where implemented, and command run callbacks.
- [ ] Accessibility and live-region tests cover announced result counts, selected command announcements, loading/empty/error announcements, retry semantics, disabled async commands, and no missing accessible names.
- [ ] Storybook examples cover async search, server-backed resources, recents, suggestions, minimum query, loading, empty, error/retry, stale results where implemented, and command-run announcements.

## Blocked by

- #236

## Published Issue #239

## Parent

- #187

## What to build

Add first-class nested command flows to CommandPalette. The completed slice
should support page stack state, nested page commands, page titles, page
headers, back controls, page-specific command groups, page-specific
empty/loading/error states, Escape-to-back behavior, directional data
attributes, controlled page callbacks, command lifecycle behavior across pages,
and examples for project/resource drill-down flows.

This slice should make drill-down command flows predictable without turning
CommandPalette into a router adapter or wizard framework.

## Acceptance criteria

- [ ] CommandPalette supports a page stack with root page, nested pages, active page id, page depth, and controlled/uncontrolled page callbacks.
- [ ] Commands can navigate to nested pages without running an action command prematurely.
- [ ] Page headers support accessible titles and optional back controls.
- [ ] Escape steps back from nested pages and closes the palette only at the root page where close is allowed.
- [ ] Back controls are keyboard reachable, labelled, and return to the previous page without losing command semantics.
- [ ] Page-specific command groups, empty states, loading states, error/retry states, and source labels are supported.
- [ ] Page transitions expose stable direction/page-depth data attributes for later motion work.
- [ ] Command lifecycle callbacks include enough page/source context for app-owned analytics, recents, and close behavior.
- [ ] Nested pages work in inline and dialog modes without breaking focus containment, focus visibility, RTL, dark mode, density, or reduced-motion-safe state changes.
- [ ] Unit, render, keyboard, and accessibility tests cover page push/pop, controlled active page, nested page commands, page titles, back controls, Escape back/close behavior, page-specific empty/loading/error states, disabled nested page commands, command execution context, and focus behavior.
- [ ] Storybook examples cover project switcher drill-down, resource search drill-down, command category pages, nested empty/loading/error states, controlled page stack, dark mode, density, RTL, and keyboard usage.

## Blocked by

- #236
- #237

## Published Issue #240

## Parent

- #187

## What to build

Add the premium motion layer for CommandPalette. The completed slice should
provide dialog enter/exit polish, selected-row indicator movement, result
enter/exit choreography, group reveal, nested page directional transitions,
optional recent/suggested command stagger, motion presets, and reduced-motion
behavior that preserves every visual state without requiring movement.

This slice should use Motion only where CSS cannot express the interaction
cleanly. Simple color, focus, hover, opacity, and static state transitions
should remain tokenized CSS where practical.

## Acceptance criteria

- [ ] CommandPalette exposes motion presets such as `none`, `subtle`, `standard`, and `expressive` with documented behavior.
- [ ] Dialog overlay/content transitions are polished and remain compatible with existing Dialog/provider portal behavior.
- [ ] Selected-row movement is animated without causing layout shift and remains visible when motion is disabled.
- [ ] Result enter/exit, filtering changes, group reveal, and optional recents/suggestions stagger are available through documented motion paths.
- [ ] Nested page transitions use directional movement based on push/pop/back state and expose stable motion direction data attributes.
- [ ] Reduced-motion mode disables transform-heavy movement, layout morphs, and stagger while preserving non-motion selected/focused/active/disabled/destructive/loading/empty/error visual states.
- [ ] Motion implementation avoids non-performant properties except where fixed dimensions or layout animation are explicitly justified and verified.
- [ ] Registry metadata reflects Motion dependency usage accurately and basic components outside CommandPalette do not gain new Motion requirements because of this slice.
- [ ] Tests or stories verify motion preset data attributes, reduced-motion class/path behavior, stable selected state without animation, page motion direction, result transition hooks, and no animation-only state communication.
- [ ] Storybook examples demonstrate selected-row motion, result choreography, group reveal, nested page direction, recents/suggestions stagger, motion presets, reduced motion, dark mode, density, and RTL.

## Blocked by

- #237
- #238
- #239

## Published Issue #241

## Parent

- #187

## What to build

Finish CommandPalette as a documented, installable, provider-themed component
surface. This slice should complete registry metadata, package exports,
Storybook coverage, showcase recipes, accessibility automation, live-region
coverage, SSR smoke coverage, registry validation, package build coverage,
documentation, and final verification for the full CommandPalette v1
experience.

The completed component should be installable through the registry and should
give consumers realistic examples for global app launchers, inline Sidebar
command search, dashboard action runners, project/resource switchers, AI
command menus, async search, recents/suggestions, nested pages,
disabled/destructive commands, motion presets, dark mode, density, RTL, and
reduced motion.

## Acceptance criteria

- [ ] Registry metadata exists for CommandPalette and includes accurate files, runtime dependencies, dev dependencies, registry dependencies, Motion dependency usage, and CSS variable expectations.
- [ ] Package exports include CommandPalette components, helper class maps, and public prop/data types.
- [ ] Storybook examples cover inline mode, dialog mode, grouped commands, action commands, link commands, shortcuts, disabled reasons, destructive commands, controlled state, custom filtering, manual filtering, result limits, async search, recents, suggestions, loading, empty, error/retry, nested pages, page stack controls, selected-row motion, result choreography, motion presets, dark mode, density, RTL, reduced motion, and custom theme overrides.
- [ ] Showcase recipes cover global app launcher, Sidebar inline command search, dashboard action runner, project/resource switcher, NavigationMenu handoff, and AI command menu using realistic SaaS/internal-tool content.
- [ ] Accessibility tests cover labelled inline mode, labelled dialog mode, focus containment, focus restoration, grouped results, disabled commands, destructive commands, loading/empty/error/retry states, live announcements, nested pages, Escape back/close behavior, and no missing accessible names.
- [ ] SSR tests cover inline mode, closed dialog mode, grouped commands, async idle states, recents/suggestions, and nested-page initial rendering without hydration mismatch warnings.
- [ ] Registry validation and registry smoke verify copied source portability, dependency metadata, aliases, style imports, tokenized classes, CSS variable reliance, Motion dependency metadata, and package exports.
- [ ] Documentation covers overview, installation, anatomy, API, command schema, filtering and sorting, async sources, recents/suggestions, nested pages, command execution lifecycle, accessibility, keyboard behavior, live announcements, theming, motion, reduced motion, app-shell recipes, testing, migration notes, shadcn/cmdk comparison, and out-of-scope boundaries.
- [ ] Final verification commands pass or are documented with specific blockers: typecheck, tests, a11y tests, package build, Storybook build, registry validation, and registry smoke where available.

## Blocked by

- #236
- #237
- #238
- #239
- #240
