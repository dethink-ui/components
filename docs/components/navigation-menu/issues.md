# NavigationMenu Issue Breakdown

Status: Published to GitHub issue tracker.

This uses the `to-issues` tracer-bullet format.

Package target: `@dethink/components`.

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/188
- AFK NavigationMenu contract and local planning docs: https://github.com/parveshh/dethink-components/issues/191
- AFK NavigationMenu simple link bar, active state, and package surface: https://github.com/parveshh/dethink-components/issues/192
- AFK NavigationMenu disclosure flyouts, viewport, and rich panels: https://github.com/parveshh/dethink-components/issues/193
- AFK NavigationMenu premium motion and reduced-motion behavior: https://github.com/parveshh/dethink-components/issues/194
- AFK NavigationMenu responsive composition and mobile collapse recipes: https://github.com/parveshh/dethink-components/issues/195
- AFK NavigationMenu registry, Storybook, showcase, a11y, SSR, and final verification: https://github.com/parveshh/dethink-components/issues/196

## Branch Stack

1. `feature/prd-188-navigation-menu`
2. `feature/issue-191-navigation-menu-contract-docs`
3. `feature/issue-192-navigation-menu-simple-link-bar`
4. `feature/issue-193-navigation-menu-flyouts-viewport`
5. `feature/issue-194-navigation-menu-premium-motion`
6. `feature/issue-195-navigation-menu-responsive-composition`
7. `feature/issue-196-navigation-menu-registry-storybook`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise. The final
implementation PR should target the PRD branch, not the repository default
branch, unless explicitly requested.

## Proposed Breakdown

1. **Title**: NavigationMenu contract and local planning docs (#191)
   **Type**: AFK
   **Blocked by**: #188
   **User stories covered**: 1-24

2. **Title**: NavigationMenu simple link bar, active state, and package surface (#192)
   **Type**: AFK
   **Blocked by**: #191
   **User stories covered**: 1, 5, 7, 10, 15, 18, 19, 21, 23

3. **Title**: NavigationMenu disclosure flyouts, viewport, and rich panels (#193)
   **Type**: AFK
   **Blocked by**: #192
   **User stories covered**: 2-4, 6, 9, 11, 12, 14-16, 20-22

4. **Title**: NavigationMenu premium motion and reduced-motion behavior (#194)
   **Type**: AFK
   **Blocked by**: #193
   **User stories covered**: 8-10, 17, 23

5. **Title**: NavigationMenu responsive composition and mobile collapse recipes (#195)
   **Type**: AFK
   **Blocked by**: #193, #194
   **User stories covered**: 13, 20, 22, 24

6. **Title**: NavigationMenu registry, Storybook, showcase, a11y, SSR, and final verification (#196)
   **Type**: AFK
   **Blocked by**: #192, #193, #194, #195
   **User stories covered**: 1-24

## Published Issue #191

## What to build

Create the local contract and planning documents for the NavigationMenu PRD.
The docs should define NavigationMenu as a site/app navigation primitive rather
than an action menu, capture the public anatomy, prop contracts, semantic
link/disclosure model, controlled and uncontrolled open state, activation
modes, active/current route state, rich flyout panel boundaries, animation
strategy, reduced-motion requirements, responsive composition boundaries,
accessibility invariants, testing seams, out-of-scope boundaries, and stacked
branch mapping.

This slice should not implement runtime component source beyond documentation
examples needed to clarify the contract.

## Acceptance criteria

- [ ] Local specification and issue breakdown documents exist for NavigationMenu and link back to the parent PRD.
- [ ] The docs define NavigationMenu as persistent site/app navigation and clearly separate it from DropdownMenu action menus, Sidebar, CommandPalette, and full Dashboard Shell blocks.
- [ ] The docs define public anatomy for root, list, item, link, trigger, content, viewport, indicator, featured item, section, label, description, and separator parts.
- [ ] The docs define controlled and uncontrolled active/open state, activation modes, current-link semantics, disabled/external states, rich-panel composition, and responsive composition boundaries.
- [ ] The docs define the motion contract: active indicator movement, viewport morphing, directional panel transitions, content enter/exit, staggered reveal where appropriate, and reduced-motion fallback behavior.
- [ ] The docs define accessibility expectations for link semantics, disclosure triggers, focus movement, keyboard behavior, Escape/outside dismissal where applicable, current-page state, and no default ARIA menu roles for ordinary navigation.
- [ ] The docs list render, interaction, accessibility, SSR, Storybook, showcase, registry, package export, and verification seams.
- [ ] The branch stack and child issue dependency order are documented locally.

## Blocked by

- #188

## Published Issue #192

## What to build

Build the first runtime NavigationMenu slice as a simple persistent navigation
bar. The completed slice should provide the core NavigationMenu family for
root, list, item, link, active/current state, disabled/external states,
tokenized variants, class/data hooks, package exports, registry metadata draft,
focused tests, and base Storybook examples.

This slice should make NavigationMenu usable for simple top navigation without
flyout panels, animated viewport choreography, or mobile collapse behavior.

## Acceptance criteria

- [ ] NavigationMenu core components are exported with public prop/data types and class-name helpers.
- [ ] Simple link navigation renders semantic navigation markup and real links by default, with `asChild` composition where appropriate.
- [ ] Current links expose `aria-current="page"` or `aria-current="location"` as documented and expose stable current/active data attributes.
- [ ] Disabled and external link states are supported and styled with token-backed classes.
- [ ] Root/list/item/link parts expose stable `data-slot` attributes and className composition.
- [ ] Visual variants, sizes, density, dark mode, focus-visible state, and RTL-safe alignment are represented with explicit Tailwind class maps.
- [ ] Render and interaction tests cover simple links, current state, disabled state, external state, className composition, data attributes, and absence of ARIA menu roles by default.
- [ ] Base Storybook examples cover simple product navigation, dashboard top navigation, current state, disabled/external links, dark mode, density, and RTL.
- [ ] Package exports and initial registry metadata are present for the simple NavigationMenu path.

## Blocked by

- #191

## Published Issue #193

## What to build

Extend NavigationMenu from a simple link bar into a rich navigation flyout
surface. The completed slice should add trigger/content anatomy, controlled and
uncontrolled open item state, activation modes, disclosure semantics, rich panel
slots, grouped links, featured cards, descriptions, icons, viewport behavior,
outside/Escape dismissal where applicable, focus behavior, and tests/stories
for flyout navigation.

This slice should preserve link-first navigation semantics and avoid turning
ordinary site navigation into an ARIA application menu.

## Acceptance criteria

- [ ] NavigationMenu supports trigger, content, viewport, featured item, section, label, description, separator, and grouped link anatomy.
- [ ] Flyout triggers expose expanded/collapsed state through accessible disclosure semantics and stable data attributes.
- [ ] Controlled and uncontrolled open item state is supported with change callbacks.
- [ ] Activation modes are supported and documented: click, hover with intent delay, focus, and manual, with an accessible default.
- [ ] Rich panels support columns, featured cards, descriptions, icons, disabled links, and external links without bespoke consumer CSS.
- [ ] Escape/outside dismissal and focus behavior follow the documented contract where panels behave like overlays.
- [ ] Panel behavior reuses existing Popover/positioning/provider patterns where panels leave normal document flow and preserves focus order for inline viewport rendering.
- [ ] Render, keyboard, and accessibility tests cover opening/closing panels, controlled state, trigger semantics, disabled links, rich panels, focus behavior, Escape dismissal, and no default ARIA menu role misuse.
- [ ] Storybook examples cover product flyout, documentation flyout, rich panel layout, featured items, controlled state, dark mode, density, RTL, and keyboard usage.

## Blocked by

- #192

## Published Issue #194

## What to build

Add the premium motion layer for NavigationMenu. The completed slice should
make NavigationMenu feel distinctive through animated active indicators,
viewport width/height morphing, directional flyout panel transitions, content
enter/exit, optional staggered link reveal, hover/focus micro-interactions, and
documented reduced-motion behavior.

This slice should introduce Motion only if the implementation needs layout or
exit choreography that CSS cannot express cleanly. Simple hover, focus, color,
and opacity states should remain CSS transitions.

## Acceptance criteria

- [ ] The implementation has a documented Motion dependency decision and registry metadata reflects it accurately if Motion is imported.
- [ ] Active/current item indicator movement is animated without causing layout shift and remains visually clear with motion disabled.
- [ ] Flyout panels support directional enter/exit transitions based on previous and next item order.
- [ ] Viewport size changes are animated for different panel dimensions without janky layout shifts.
- [ ] Content enter/exit and optional staggered reveal are available through documented motion presets.
- [ ] Motion presets such as `none`, `subtle`, `standard`, and `expressive` are documented or represented in the public contract if exposed.
- [ ] Reduced-motion mode disables transform-heavy movement and layout morphs while preserving non-motion visual state changes.
- [ ] Tests or stories verify reduced-motion class/path behavior, stable state without animation, and data attributes for motion direction where applicable.
- [ ] Storybook examples demonstrate active indicator movement, viewport morphing, directional transitions, reduced motion, dark mode, density, and RTL.
- [ ] Animation avoids non-performant properties except where fixed dimensions or layout animation are explicitly justified and verified.

## Blocked by

- #193

## Published Issue #195

## What to build

Complete NavigationMenu's responsive composition story. The completed slice
should define and implement the handoff patterns for smaller screens, including
compact top navigation, overflow/collapse examples, composition with Dialog or
Sidebar patterns where appropriate, and docs/stories showing how NavigationMenu
remains a navigation primitive rather than a full mobile sidebar.

This slice should provide production-ready responsive examples and any small API
additions needed for responsive composition, but it should not implement the
Sidebar component or a full Dashboard Shell block.

## Acceptance criteria

- [ ] NavigationMenu supports responsive layout states or composition hooks needed for compact top navigation without bespoke consumer CSS.
- [ ] Mobile and narrow-screen examples show a clear handoff to Dialog or future Sidebar composition without duplicating Sidebar behavior.
- [ ] Responsive examples preserve semantic links, current state, focus visibility, keyboard behavior, and reduced-motion requirements.
- [ ] Overflow or collapse recipes are documented for top navigation with many items.
- [ ] Storybook covers desktop product nav, compact app topbar, mobile-composed navigation, reduced motion, dark mode, density, and RTL.
- [ ] Showcase recipes cover product navigation, app topbar, documentation hub, and dashboard composition.
- [ ] Tests cover responsive class/state hooks, current state in compact layouts, and any mobile-composition trigger behavior introduced by this slice.
- [ ] Docs clearly state that full Sidebar, Dashboard Shell, auth/account menus, and notification menus remain out of scope.

## Blocked by

- #193
- #194

## Published Issue #196

## What to build

Finish NavigationMenu as a documented, installable, provider-themed component
surface. This slice should complete registry metadata, package exports,
Storybook coverage, showcase recipes, accessibility automation, SSR smoke
coverage, registry validation, package build coverage, and final verification
for the full NavigationMenu v1 experience.

The completed component should be installable through the registry and should
give consumers realistic examples for simple nav bars, product flyouts,
documentation flyouts, animated indicators, viewport morphing, directional
transitions, responsive composition, dark mode, density, RTL, and reduced
motion.

## Acceptance criteria

- [ ] Registry metadata exists for NavigationMenu and includes accurate files, runtime dependencies, dev dependencies, registry dependencies, and CSS variable expectations.
- [ ] Package exports include NavigationMenu components, helper class maps, and public prop/data types.
- [ ] Storybook examples cover simple nav, product flyout, docs flyout, rich panel, active/current state, disabled/external links, controlled state, animated indicator, viewport morph, directional transitions, responsive composition, dark mode, density, RTL, reduced motion, and custom theme overrides.
- [ ] Showcase examples cover product navigation, app topbar, documentation hub, and dashboard composition recipes using realistic SaaS/internal-tool content.
- [ ] Accessibility tests cover simple link nav, flyout nav, rich panel, current link, disabled item, keyboard behavior, disclosure semantics, and absence of default ARIA menu role misuse.
- [ ] SSR tests cover simple and flyout NavigationMenu rendering/hydration without mismatch warnings.
- [ ] Registry validation and registry smoke verify copied source portability, dependency metadata, aliases, style imports, tokenized classes, CSS variable reliance, and package exports.
- [ ] Documentation covers overview, installation, anatomy, API, semantics, keyboard behavior, focus behavior, theming, animation, reduced motion, responsive composition, recipes, testing, migration notes, and out-of-scope boundaries.
- [ ] Final verification commands pass or are documented with specific blockers: typecheck, tests, a11y tests, package build, Storybook build, registry validation, and registry smoke where available.

## Blocked by

- #192
- #193
- #194
- #195
