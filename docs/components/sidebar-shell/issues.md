# SidebarShell Issue Breakdown

Status: Published; Issue #365 implemented and verified, pending human design checkpoint.

Package target: `@dethink/components`.

## Published Issues

- Parent PRD: https://github.com/parveshh/dethink-components/issues/364
- SidebarShell semantic baseline and Bounded Workbench checkpoint: https://github.com/parveshh/dethink-components/issues/365
- SidebarShell scroll ownership and viewport safety: https://github.com/parveshh/dethink-components/issues/366
- SidebarShell contained responsiveness and mobile handoff: https://github.com/parveshh/dethink-components/issues/367
- SidebarShell persisted compact preference and SSR behavior: https://github.com/parveshh/dethink-components/issues/368
- SidebarShell install surface, recipes, and final verification: https://github.com/parveshh/dethink-components/issues/369

## Proposed Tracer-Bullet Slices

### 1. SidebarShell semantic baseline and Bounded Workbench checkpoint (#365)

**Type**: HITL

**Blocked by**: Parent SidebarShell PRD

**User stories covered**: 1-11, 33-38, 40, 44-45, 47-50

#### What to build

Ship the first complete viewport SidebarShell path: provider-aware root,
existing Sidebar composition, semantic header/main/footer regions, focus-visible
skip link, public exports, the token-backed Bounded Workbench and plain chrome
treatments, required Motion choreography and micro-interactions, rendered
behavior tests, accessibility smoke, SSR smoke, a Storybook review story, and
initial registry metadata.

This slice ends with a human design checkpoint on the workspace spine,
contextual command deck, inset work stage, expanded/compact relationship,
public anatomy, and component boundary before responsive and persistence work
continues.

#### Acceptance criteria

- [x] SidebarShell acts as the provider-aware root for shell compositions while SidebarProvider remains usable for navigation-only compositions.
- [x] Existing Sidebar, SidebarRail, SidebarMobile, and navigation item APIs are composed rather than duplicated.
- [x] Public anatomy includes shell root, navigation, header, main, optional footer, and skip-link surfaces with exported prop types, refs, class merging, and stable data slots.
- [x] Default output uses native landmark semantics and renders exactly one main landmark unless the consumer intentionally overrides semantics.
- [x] The skip link is the first shell focus target, becomes visible on focus, and targets the shell main region.
- [x] Viewport mode provides a complete expanded and compact desktop composition with left and right placement.
- [x] Bounded Workbench and plain chrome treatments use semantic tokens, provider density, dark mode, high-contrast-ready borders, and RTL-safe physical side placement.
- [x] Bounded Workbench preserves the approved workspace-spine, command-deck, inset-stage, and seam-control relationships without hard-coded reference-board colors.
- [x] SidebarShell declares Motion directly and uses `motion/react` for every shell animation primitive; Tailwind provides static states without a parallel CSS-transition choreography.
- [x] Shared Motion presets and MotionConfig provide `none`, `subtle`, `standard`, and `expressive` behavior for workspace-spine, command-deck, work-stage, and footer choreography.
- [x] Shell-owned interactive controls and surfaces provide restrained hover, tap, and focus micro-interactions that never replace visible state or focus styling.
- [x] Transform-first gestures and scoped layout animation avoid animating large descendant trees or globally coupling unrelated layout groups.
- [x] `animate={false}`, `motion="none"`, and `useReducedMotion` resolve movement to immediate state changes, and initial render does not replay entrance animation during SSR hydration.
- [x] Rendered tests cover anatomy, semantics, refs, class/data attributes, controlled/uncontrolled collapse, side placement, chrome treatments, density, and RTL.
- [x] Axe and SSR smoke pass for expanded and compact viewport shells.
- [x] A reviewable Storybook story demonstrates the state board represented by the Bounded Workbench reference.
- [x] Initial registry metadata and package exports are valid for the baseline slice.
- [ ] Human review approves the public anatomy and visual direction before dependent slices proceed.

### 2. SidebarShell scroll ownership and viewport safety (#366)

**Type**: AFK

**Blocked by**: Slice 1

**User stories covered**: 27-32, 38, 42-43

#### What to build

Extend the baseline shell with explicit content-scroll and document-scroll
contracts. Complete viewport sizing, sticky command-deck behavior, long-content
handling, focus and anchor offsets, overscroll containment, dynamic viewport
units, and safe-area-aware edges through public behavior, stories, tests,
documentation, and registry metadata.

#### Acceptance criteria

- [ ] Content-scroll mode keeps persistent shell chrome stable while a bounded main region owns scrolling.
- [ ] Document-scroll mode leaves normal browser scrolling intact and makes sticky header behavior explicit.
- [ ] Sticky regions do not obscure keyboard focus, skip-link destinations, fragment targets, or the first line of focused content.
- [ ] Overscroll containment applies only to shell-owned scrollers and does not disable ordinary page or touch gestures.
- [ ] Viewport mode uses dynamic viewport units and avoids `100vw` overflow traps.
- [ ] Safe-area behavior preserves the configured shell gutter and uses logical inline/block edges.
- [ ] Long header, main, footer, and navigation content remain reachable at 320 CSS pixels and 200% zoom without horizontal page scrolling.
- [ ] Stable data attributes expose resolved scroll, sticky, and safe-area states.
- [ ] Tests cover both scroll modes, sticky and non-sticky headers, long content, focus visibility, skip-link landing, overscroll, dynamic viewport, safe area, RTL, and reduced motion.
- [ ] Storybook and docs show when to use document scrolling versus internal content scrolling.
- [ ] Registry metadata and package exports remain accurate for the completed slice.

### 3. SidebarShell contained responsiveness and mobile handoff (#367)

**Type**: AFK

**Blocked by**: Slices 1 and 2

**User stories covered**: 12-19, 33, 41-43, 46

#### What to build

Add the differentiating contained layout mode and responsive policies. Make the
shell adapt to its own available width, support conventional viewport and
application-owned manual policies, and hand navigation to the existing Sidebar
mobile drawer without duplicating visible landmarks or focusable hidden
content. Complete the behavior through public APIs, tests, Storybook,
documentation, registry metadata, and a contained showcase example.

#### Acceptance criteria

- [ ] Contained mode fills its parent with correct min-size behavior and works inside a bounded panel, split-like fixture, preview, and Storybook frame.
- [ ] Container-aware responsive behavior is the default for contained mode and follows the shell's own inline size rather than the browser viewport.
- [ ] Viewport-responsive and manual policies are available without changing the shell anatomy.
- [ ] Interactive container posture uses the repository's guarded and SSR-safe ResizeObserver pattern; purely visual adaptations use CSS container queries where sufficient.
- [ ] Responsive handoff keeps desktop compact state and mobile drawer state separate.
- [ ] Narrow mode composes SidebarMobile behavior for focus entry, focus containment, Escape, outside dismissal, close controls, side placement, RTL, and focus return.
- [ ] Responsive changes do not leave duplicate visible navigation landmarks, duplicate focusable controls, or visually hidden focus traps.
- [ ] Logical DOM order remains stable and understandable across expanded, compact, contained, and mobile postures.
- [ ] ResizeObserver absence falls back to a safe declared posture without throwing.
- [ ] Tests cover container resize boundaries, viewport policy, manual policy, left/right placement, RTL, mobile open/close, focus behavior, route-action close composition, and unmount cleanup.
- [ ] Storybook demonstrates expanded, compact, contained, narrow drawer, and manual-control postures with interaction tests.
- [ ] Showcase includes a shell embedded inside a larger bounded product surface.
- [ ] Registry metadata and package exports remain accurate for the completed slice.

### 4. SidebarShell persisted compact preference and SSR behavior (#368)

**Type**: AFK

**Blocked by**: Slices 1 and 3

**User stories covered**: 20-26, 38, 42-43

#### What to build

Add opt-in persistence for the desktop expanded/compact preference with an
explicit storage key, controlled-state precedence, defensive browser-storage
handling, server fallback, hydration-safe readiness, and first-restoration
motion suppression. Complete the path with public state types, tests,
Storybook remount fixtures, documentation, and registry metadata.

#### Acceptance criteria

- [ ] Persistence is opt-in and writes only the desktop expanded/compact preference.
- [ ] Mobile drawer state, responsive posture, scroll position, header visibility, and arbitrary application state are never persisted.
- [ ] Controlled collapsed state takes precedence and does not trigger implicit storage coordination.
- [ ] Uncontrolled persistence restores a valid stored preference across remounts using the declared key.
- [ ] Invalid values, unavailable storage, throwing storage, and storage-event edge cases fall back safely without breaking rendering.
- [ ] A declared server fallback renders stable SSR markup and hydration emits no warnings.
- [ ] Collapse-width animation remains disabled until persisted state resolution completes.
- [ ] Documentation explains the non-animated client correction when only local storage is available and the controlled cookie/server pattern for zero-shift first paint.
- [ ] Storage behavior supports multiple shell keys without cross-shell collisions.
- [ ] Stable data attributes expose persistence configuration and readiness without exposing stored user data.
- [ ] Tests cover default and custom keys, remount, controlled precedence, invalid/unavailable/throwing storage, SSR fallback, hydration, readiness, reduced motion, and responsive handoff.
- [ ] Storybook includes a deterministic persisted-remount interaction fixture.
- [ ] Registry metadata and package exports remain accurate for the completed slice.

### 5. SidebarShell install surface, recipes, and final verification (#369)

**Type**: AFK

**Blocked by**: Slices 2, 3, and 4

**User stories covered**: 39-43

#### What to build

Finish SidebarShell as an installable and documented component surface. Add the
complete registry payload, package exports, API and accessibility docs,
Bounded Workbench and contained showcase recipes, comprehensive Storybook
states and interactions, final a11y/SSR coverage, clean registry-install smoke,
Vite consumer smoke, and the full verification pass.

#### Acceptance criteria

- [ ] Registry metadata includes every copied file, direct dependency, registry dependency, CSS-variable expectation, and package export required by SidebarShell.
- [ ] Clean registry installation verifies aliases, provider setup, Sidebar integration, styles, persistence behavior, and copied-source portability.
- [ ] Package and registry consumption paths expose the same public anatomy and prop/state types.
- [ ] Documentation covers overview, installation, anatomy, layout modes, responsive policies, scroll modes, persistence and SSR, accessibility, theming, density, RTL, reduced motion, testing, recipes, migration, and the boundary with Sidebar and Dashboard Shell.
- [ ] Documentation records the Bounded Workbench direction as token-backed structural guidance rather than a fixed brand theme.
- [ ] Storybook covers Bounded Workbench and plain chrome across viewport, contained, expanded, compact, mobile, scroll modes, persistence, light/dark, density, RTL, long navigation, long content, safe area, and reduced motion.
- [ ] Storybook interaction tests cover collapse, external control, persisted remount, container resize, viewport handoff, manual mode, mobile drawer focus/dismissal, scroll behavior, and reduced motion.
- [ ] Storybook demonstrates shell motion presets, compact/expanded layout choreography, and hover/tap/focus micro-interactions without animation-only state communication.
- [ ] Showcase includes one realistic Bounded Workbench application recipe and one contained shell recipe.
- [ ] Axe coverage and manual keyboard criteria cover every meaningful posture, landmark structure, skip link, visible focus, mobile drawer, and sticky-region behavior.
- [ ] SSR and hydration smoke cover viewport, contained, expanded, compact, persistence-disabled, persistence-configured, and mobile-capable markup.
- [ ] Package build/typecheck, component tests, accessibility tests, Storybook build, registry validation, registry smoke, and Vite playground build pass.
- [ ] Final docs state that router integration, Dashboard Shell services, inspector/tools panels, pane resizing, and non-collapse persistence remain out of scope.

## Proposed Branch Stack

1. `feature/prd-364-sidebar-shell`
2. `feature/issue-365-sidebar-shell-baseline`
3. `feature/issue-366-sidebar-shell-scroll`
4. `feature/issue-367-sidebar-shell-responsive`
5. `feature/issue-368-sidebar-shell-persistence`
6. `feature/issue-369-sidebar-shell-release`

Create the PRD branch from the current integration base. Create the first issue
branch from the PRD branch, then stack later issue branches from the previous
issue branch in dependency order. The final stacked branch should target the
PRD branch rather than the repository default branch.
