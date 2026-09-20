# SidebarShell Component Spec

Status: Issue #365 baseline implemented; pending human design checkpoint.

GitHub PRD: https://github.com/parveshh/dethink-components/issues/364

Implementation issue: https://github.com/parveshh/dethink-components/issues/365

Package target: `@dethink/components`.

## Purpose

SidebarShell is the provider-aware application-layout primitive that composes
the existing Sidebar family with semantic topbar, main-content, footer, and
skip-link regions. It owns application-shell geometry and Motion choreography;
Sidebar continues to own navigation semantics, current-route state, groups,
rail behavior, and mobile drawer behavior.

The baseline slice implements full-viewport shells. Contained responsiveness,
explicit scroll policies, persistence, and final recipes remain assigned to
issues #366 through #369.

## Public Anatomy

- `SidebarShell`
- `SidebarShellNavigation`
- `SidebarShellHeader`
- `SidebarShellMain`
- `SidebarShellFooter`
- `SidebarShellSkipLink`

`SidebarShellNavigation` gives extracted application-navigation components an
explicit Motion-backed workspace-spine region. The root also recognizes a
direct Sidebar child for compact compositions and keeps navigation outside the
internal header/main/footer frame. It renders a default skip link before
navigation when the consumer does not provide `SidebarShellSkipLink`
explicitly.

## Baseline Public Contract

- SidebarShell accepts the existing Sidebar provider state contract:
  controlled or uncontrolled desktop collapse, controlled or uncontrolled
  mobile drawer state, side, Sidebar variant, animation opt-out, and named
  motion preset.
- Existing Sidebar controls update the shell-owned state because SidebarShell
  supplies the Sidebar provider context.
- `chrome="workbench"` is the default structural treatment. It provides the
  token-backed workspace spine, separated work stage, and contextual command
  deck relationship shown in the Bounded Workbench direction board.
- `chrome="plain"` provides neutral application-shell geometry.
- The baseline layout is `data-layout="viewport"` and uses dynamic viewport
  height.
- Left and right Sidebar placement preserve logical DOM order while changing
  visual placement.
- The default main region uses `<main>`, the header uses `<header>`, and the
  footer uses `<footer>`. Controlled semantic overrides are available for
  compositions that already contain those landmarks.
- The default skip link targets the generated SidebarShellMain identifier.
  Root `mainId`, explicit main `id`, and skip-link `targetId` let applications
  coordinate custom identifiers intentionally.
- Public surfaces forward refs, merge consumer classes, preserve native
  attributes, and expose stable data attributes.

## Motion Contract

Motion is a required direct dependency. Every SidebarShell animation primitive
uses `motion/react`; Tailwind classes provide static state styling and do not
implement a second shell-transition system.

Named presets:

- `none`: immediate state changes and no transform micro-interactions.
- `subtle`: short, highly damped spring and half-pixel surface lift.
- `standard`: default spring with restrained surface response.
- `expressive`: longer spring, modest bounce, and stronger—but still small—
  surface response.

Sidebar's controlled structural width and mobile overlay/panel presence use
Motion directly. The work stage responds to the animated workspace-spine width
through flex layout instead of scale-animating the large content subtree.
Small header/footer surfaces use scoped position animation. The command-deck
surface has a small hover lift, while the skip link uses hover, tap, and focus
micro-interactions.

`animate={false}`, `motion="none"`, or the user's reduced-motion preference
resolves the shell to the `none` configuration. `initial={false}` prevents
mount-time entrance replay during SSR hydration.

## Accessibility

- The skip link is the first shell focus target.
- SidebarShellMain defaults to `tabIndex={-1}` so activating the skip link moves
  focus to the landmark without adding it to sequential tab order; consumers
  can override the value intentionally.
- Exactly one main landmark is rendered by the standard composition.
- Sidebar retains its labelled navigation landmark.
- Repeated landmarks must be labelled by the consumer when necessary.
- Public focus styles remain visible independently of Motion.
- Motion never carries collapsed, current, hover, pressed, or focus state by
  itself.
- Right-side and compact compositions preserve logical focus and DOM order.

## Styling

- Tailwind CSS v4 utilities and explicit static class maps.
- Semantic provider tokens only; no hard-coded Bounded Workbench palette.
- Provider density controls shell gap, padding, header height, main inset, and
  footer height; light/dark themes, high-contrast-ready borders, and RTL-safe
  logical layout remain token-backed.
- Consumer class names merge after baseline classes.
- `min-width: 0`, `min-height: 0`, and bounded overflow protect dense product
  content.

## Stable Data Attributes

- `data-slot="sidebar-shell"`
- `data-slot="sidebar-shell-frame"`
- `data-slot="sidebar-shell-navigation"`
- `data-slot="sidebar-shell-header"`
- `data-slot="sidebar-shell-main"`
- `data-slot="sidebar-shell-footer"`
- `data-slot="sidebar-shell-skip-link"`
- `data-animate`
- `data-chrome`
- `data-collapsed`
- `data-layout`
- `data-mobile-open`
- `data-motion`
- `data-reduced-motion`
- `data-side`

## Baseline Testing Seams

- Rendered anatomy, automatic and custom skip-link targeting, semantics,
  semantic overrides, controlled/uncontrolled collapse, provider control
  coordination, side placement, chrome treatments, refs, classes, and data
  attributes.
- Motion preset resolution, reduced/no-motion resolution, and absence of CSS
  transition choreography in SidebarShell class maps.
- Axe smoke for expanded, compact, left, right, plain, workbench, and no-motion
  compositions.
- SSR expanded/compact markup and hydration without mismatch warnings or
  mount-time initial transform/opacity styles.
- Storybook interaction coverage for compact/expanded control through the
  existing Sidebar rail.
- Registry validation, package typecheck/build, component tests,
  accessibility tests, and Storybook build.

## Deferred To Later Issues

- Document-scroll versus content-scroll policy and sticky/safe-area mechanics
  (#366).
- Contained mode, container-aware responsiveness, and full mobile handoff
  (#367).
- Opt-in persisted compact preference and SSR restoration policy (#368).
- Final package/registry smoke, showcase recipes, comprehensive docs, and full
  verification (#369).

## Default navigation toggle

Place one `SidebarTrigger` at the start of `SidebarShellHeader`, before the
breadcrumb or title. It stays visible when desktop navigation collapses. The
optional `SidebarRail` should not accompany it in default compositions. Mobile
uses `SidebarMobileTrigger` with its independent drawer state and close button.
Use subtle motion for routine navigation and preserve reduced-motion behavior.
