# SidebarShell Component PRD

Status: Published; approved for implementation.

GitHub PRD: https://github.com/parveshh/dethink-components/issues/364

Package target: `@dethink/components`.

## Problem Statement

Teams building production SaaS dashboards, internal tools, B2B applications,
and AI-native workspaces already have Dethink's Sidebar family for navigation,
but they still repeat the surrounding application layout: viewport sizing,
topbar placement, main-content landmarks, sticky and scrolling behavior,
responsive drawer handoff, skip-link targeting, compact-state persistence, and
safe-area handling.

`SidebarProvider` plus `SidebarInset` intentionally provides only a lightweight
navigation/content relationship. Turning that pair into a full application
shell in every consumer creates subtle accessibility, hydration, responsive,
and scroll bugs. It also makes Dethink examples look like unrelated dashboard
templates instead of one coherent component system.

Existing component libraries cover this space in two unsatisfying ways. Some
provide geometry-only app shells tied to viewport breakpoints. Others provide
opinionated dashboard frameworks that own routing, navigation data, branding,
accounts, or page services. Dethink needs a smaller open-code primitive that is
router-neutral, composes the existing Sidebar family, works in both viewport
and contained contexts, and establishes a distinctive but token-driven design
direction.

## Solution

Ship SidebarShell as a composable P1 layout family around the existing Sidebar
navigation primitive. SidebarShell provides semantic header, main, footer, and
skip-link regions; full-viewport and contained layout modes; explicit document
versus internal-content scrolling; container-aware, viewport-aware, and manual
responsive policies; mobile drawer composition; controlled and uncontrolled
shell state; and opt-in persistence for the desktop expanded/compact
preference.

The default visual direction is **Bounded Workbench**. A vertical workspace
spine contains navigation and a compact brand cap, while the contextual command
deck begins above the main work stage. The main region is an inset, calm canvas
rather than a generic page pushed beside a sidebar. Expanded, compact,
contained, and mobile postures remain visually related. A plain treatment is
also available for consumers that want neutral geometry.

SidebarShell stays smaller than a Dashboard Shell block. It does not own
navigation records, routing, breadcrumbs, search, notifications, account
menus, auth, inspectors, or page tools. Consumers compose those features into
the shell's regions.

## User Stories

1. As a SaaS engineer, I want a reusable SidebarShell, so that I do not rebuild application chrome for every dashboard.
2. As an internal-tool engineer, I want SidebarShell to compose the existing Sidebar family, so that navigation behavior remains consistent across Dethink.
3. As a design-system maintainer, I want Sidebar and SidebarShell to have separate responsibilities, so that navigation semantics do not become coupled to page layout.
4. As a product engineer, I want a semantic topbar region, so that workspace context and page actions have a predictable home.
5. As a product engineer, I want a semantic main region, so that primary page content has a stable landmark and skip-link target.
6. As a product engineer, I want an optional shell footer region, so that persistent status or legal information can be placed without bespoke layout CSS.
7. As a keyboard user, I want a focus-visible skip link before repeated shell navigation, so that I can reach main content quickly.
8. As a screen-reader user, I want one main landmark by default, so that region navigation is predictable.
9. As a screen-reader user, I want repeated landmarks to support accessible names, so that multiple headers, navigation regions, or footers are distinguishable.
10. As a speech-input user, I want visible labels and programmatic names to agree, so that I can target shell controls and landmarks reliably.
11. As a dashboard engineer, I want a viewport layout mode, so that the shell can fill the application window.
12. As an embedded-product engineer, I want a contained layout mode, so that the shell can live inside a split pane, preview, desktop shell, or bounded work area.
13. As a Storybook author, I want contained mode, so that realistic shell behavior can be demonstrated without pretending the story iframe is the whole product.
14. As a product engineer, I want contained mode to respond to its own available width, so that nested layouts do not depend on unrelated viewport dimensions.
15. As a product engineer, I want a viewport-responsive policy, so that conventional full-page applications can use browser breakpoints.
16. As a product engineer, I want a manual responsive policy, so that an application can own the desktop/mobile handoff when its layout rules are domain specific.
17. As a mobile user, I want navigation to use the existing accessible Sidebar mobile drawer, so that narrow layouts do not crush main content.
18. As a keyboard user, I want mobile navigation focus containment, Escape dismissal, and focus return, so that opening the shell drawer does not strand me.
19. As a product engineer, I want mobile drawer state to remain separate from desktop compact state, so that resizing does not produce surprising navigation state.
20. As a desktop user, I want the shell to preserve my expanded or compact navigation preference, so that workspace density remains stable across visits.
21. As a privacy-conscious application author, I want persistence to be opt-in, so that the component does not write browser storage unexpectedly.
22. As an SSR application author, I want an explicit server fallback for persisted state, so that the shell renders predictably before client storage is available.
23. As an SSR application author, I want hydration without warnings, so that a persisted preference does not corrupt the shell tree.
24. As a user, I want restored compact state to avoid first-paint collapse animation, so that loading the app does not create distracting movement.
25. As an application author, I want controlled collapsed state to override built-in persistence, so that account or server preferences remain authoritative.
26. As an application author, I want invalid or unavailable storage to fail safely, so that privacy settings and storage exceptions do not break rendering.
27. As a product engineer, I want document-scroll mode, so that pages can retain normal browser scrolling and history behavior.
28. As a product engineer, I want internal-content-scroll mode, so that persistent chrome can remain stable around dense application workspaces.
29. As a keyboard user, I want sticky shell regions not to obscure focused content, so that tab navigation remains visible.
30. As a touch user, I want overscroll contained only where the shell owns scrolling, so that nested scrolling does not leak or block normal page gestures.
31. As a mobile browser user, I want viewport mode to use dynamic viewport sizing, so that browser chrome does not clip the shell.
32. As a device user with display cutouts, I want viewport-adjacent chrome to respect safe-area insets, so that controls remain reachable.
33. As an RTL user, I want the workspace spine and navigation side to support left and right placement without unexpected inversion, so that the shell fits localized products.
34. As a compact-density user, I want shell spacing to integrate with provider density, so that the chrome matches dense internal tools.
35. As a theme author, I want shell colors, borders, radii, shadows, spacing, and dimensions to use semantic tokens, so that Bounded Workbench is brandable.
36. As a design-system consumer, I want a plain shell treatment, so that I can use the behavioral contract without adopting the reference chrome treatment.
37. As a design-system consumer, I want stable data attributes and class-name helpers, so that I can theme or test shell regions without relying on internal markup accidents.
38. As a motion-sensitive user, I want shell transitions to respect reduced motion, so that chrome changes remain comfortable.
39. As a registry consumer, I want SidebarShell to declare every file and dependency it needs, so that copied installs behave like package imports.
40. As a package consumer, I want public prop and state types, so that controlled composition is discoverable in TypeScript.
41. As a docs reader, I want examples for expanded, compact, contained, viewport, mobile, scroll, persistence, RTL, density, and dark-mode states, so that I can copy the correct pattern.
42. As a maintainer, I want SidebarShell tested at rendered public seams, so that responsive and persistence refactors do not regress behavior.
43. As a maintainer, I want SidebarShell to reuse Drawer, Container, provider, and Sidebar patterns where appropriate, so that it does not create parallel infrastructure.
44. As a maintainer, I want the shell to stay router neutral, so that it works with Next.js, React Router, Remix, TanStack Router, and custom runtimes.
45. As a maintainer, I want the shell to stay smaller than Dashboard Shell, so that product blocks can compose it without fighting built-in application opinions.
46. As a maintainer, I want contained responsiveness to use an existing guarded ResizeObserver seam, so that the behavior remains SSR safe and testable.
47. As a design-system consumer, I want coordinated shell choreography, so that expanded and compact workspace postures feel spatially connected.
48. As a pointer or keyboard user, I want restrained hover, tap, and focus micro-interactions, so that shell controls feel responsive and refreshing to use.
49. As a product engineer, I want named shell motion presets, so that I can tune expressive character or disable animation without rewriting transitions.
50. As a maintainer, I want every SidebarShell animation primitive to use Motion, so that choreography, gestures, layout changes, and reduced-motion behavior share one runtime contract.

## Implementation Decisions

- Build a SidebarShell family rather than a single monolithic page template. The public anatomy includes SidebarShell, SidebarShellNavigation, SidebarShellHeader, SidebarShellMain, SidebarShellFooter, and SidebarShellSkipLink, plus exported types and state helpers where they improve controlled usage. The explicit navigation region lets applications extract their Sidebar composition without relying on child-type introspection.
- SidebarShell is the provider-aware root for shell compositions. It accepts the existing Sidebar desktop collapse, mobile drawer, side, motion, and variant inputs so consumers do not need two competing state roots. SidebarProvider remains supported for navigation-only compositions.
- Existing Sidebar, SidebarRail, SidebarMobile, SidebarMobileTrigger, navigation groups, menu items, current-route behavior, and drawer focus behavior are reused rather than duplicated or renamed.
- The shell exposes `viewport` and `contained` layout modes. Viewport mode fills the dynamic viewport. Contained mode fills its parent and must work inside bounded layouts with `min-width: 0` and `min-height: 0` behavior.
- Responsive policy supports container-aware, viewport-aware, and manual modes. Container-aware behavior is the default differentiator for contained shells. Manual mode exposes state without automatic handoff.
- Container-aware layout changes use a guarded ResizeObserver pattern consistent with existing repository prior art. CSS container queries remain preferred for purely visual adaptations that do not need to change mounted interactive behavior.
- Desktop compact state and mobile drawer state remain separate channels. Responsive handoff must not persist or reinterpret mobile open state as the desktop preference.
- The shell exposes explicit content-scroll and document-scroll modes. Content-scroll mode owns a bounded main scroller and may keep the header stable. Document-scroll mode leaves page scrolling native and makes sticky behavior explicit.
- Viewport mode uses dynamic viewport units. Safe-area behavior uses logical padding and preserves at least the declared shell gutter.
- The shell provides an opt-in persisted-collapse configuration with an explicit key and a documented server fallback. It persists only desktop expanded/compact preference.
- Controlled collapsed state takes precedence over persistence. Storage is never read or written when controlled state is supplied unless the consumer explicitly coordinates it.
- The built-in browser-storage path validates stored values, handles unavailable or throwing storage, resolves only on the client, and disables collapse-width motion until restoration completes. Consumers that require a zero-shift first paint can provide controlled server state from cookies or another server-readable preference.
- Mobile drawer open state, responsive posture, scroll position, header visibility, and arbitrary application state are not persisted by SidebarShell.
- The default chrome treatment is Bounded Workbench: a token-backed workspace spine, compact brand cap, contextual command deck aligned to the main work stage, inset content surface, and existing Sidebar rail seam control.
- A plain treatment provides neutral layout and semantics without the Bounded Workbench surface relationship.
- Chrome treatment is separate from Sidebar visual variant so consumers can combine shell and navigation treatments without overloaded prop meaning.
- The shell uses Tailwind CSS v4 utilities, explicit static class maps, CSS variables, semantic tokens, logical properties, stable data attributes, the shared class-name merge helper, and provider density/theming contracts.
- Shell-specific data attributes include stable slots for the root, header, main, footer, and skip link, plus resolved layout, responsive, scroll, chrome, side, collapsed, mobile, and persistence readiness states.
- SidebarShell renders one main landmark by default. Semantic overrides remain controlled and documented so consumers do not accidentally create duplicate main landmarks.
- SidebarShellSkipLink targets SidebarShellMain by a stable explicit or generated identifier and becomes visible on focus.
- Sticky/fixed shell regions must not obscure focus, anchors, or skip-link destinations. Logical scroll padding or equivalent documented composition is part of the public behavior.
- The shell introduces no router adapter, navigation data schema, route matcher, auth/session provider, account menu, theme switcher, breadcrumbs renderer, notifications service, command service, or data-fetching behavior.
- The shell does not absorb secondary tools panels, inspector drawers, split panels, or resizable panes. Those compose through Drawer and future Splitter/Resizable components.
- Motion is a required direct SidebarShell dependency. Every shell animation primitive uses `motion/react`; Tailwind classes provide static state styling but do not implement a second CSS-transition choreography.
- SidebarShell uses shared variants and MotionConfig to expose `none`, `subtle`, `standard`, and `expressive` motion presets aligned with the existing Sidebar vocabulary.
- Built-in choreography covers workspace-spine and work-stage layout changes, command-deck and footer entrance/state changes, compact/expanded coordination, and restrained hover, tap, and focus micro-interactions on shell-owned controls and surfaces.
- Prefer transform and opacity for micro-interactions. Use scoped Motion layout animation for region geometry changes, avoid global layout groups, and avoid animating large descendant trees unnecessarily.
- Initial server/client rendering uses `initial={false}` or an equivalent stable Motion state so shell chrome does not replay entrance choreography during hydration or persisted-state restoration.
- The provider `animate={false}`, `motion="none"`, and Motion's `useReducedMotion` preference all resolve non-essential movement to immediate state changes while preserving clear expanded, compact, mobile, sticky, current, hover, pressed, and focus states.
- Registry metadata depends on `dethink-base` and `sidebar`, plus any directly copied Dethink primitives actually used. It must not duplicate Sidebar's transitive dependency declarations unnecessarily.

## Testing Decisions

- Tests verify public behavior and semantic output rather than implementation details or private state shape.
- Rendered component tests cover public anatomy, default semantics, semantic overrides, region order, class merging, refs, data attributes, Bounded Workbench and plain chrome, viewport and contained modes, left/right placement, density, and RTL.
- State tests cover controlled and uncontrolled desktop collapse, separate mobile drawer state, responsive handoff, and application-owned manual mode.
- Persistence tests cover opt-in behavior, remount restoration, controlled-state precedence, custom keys, invalid values, unavailable storage, throwing storage, server fallback, readiness data, and suppression of first-restoration collapse motion.
- Responsive tests use the existing mocked ResizeObserver seam for contained mode and verify viewport and manual policies independently.
- Scroll tests cover content and document modes, long header/main/footer content, sticky header behavior, focus visibility, skip-link landing position, overscroll containment, dynamic viewport classes, and safe-area classes.
- Mobile integration tests reuse Sidebar's public seams for open/close, Escape, outside dismissal, explicit close, focus entry, focus return, side placement, and RTL.
- Accessibility tests use axe for expanded, compact, contained, viewport, mobile drawer, left/right, dark, density, and RTL states. Explicit assertions cover one main landmark, labelled repeated landmarks, logical DOM order, skip-link target, hidden/focusable content, and no ARIA menu-role misuse.
- SSR tests cover default expanded, default compact, viewport, contained, persistence disabled, persistence configured with server fallback, and mobile-capable markup. Hydration smoke must not emit warnings.
- Storybook interaction tests cover collapse, external control, persisted remount, container resize across postures, viewport handoff, manual policy, mobile drawer focus/dismissal, scroll modes, and reduced motion.
- Motion tests cover resolved preset transitions, `animate={false}`, reduced-motion resolution, stable initial render, hover/tap/focus variants, compact/expanded layout coordination, and absence of animation-only state communication.
- Visual stories cover Bounded Workbench and plain treatments in expanded, compact, contained, viewport, mobile, light/dark, provider density, RTL, long navigation, long content, safe-area, and sticky-header states.
- Showcase includes at least one realistic Bounded Workbench recipe and one contained shell embedded in a larger product surface.
- Registry validation and clean-install smoke verify copied files, aliases, registry dependencies, CSS variables, provider setup, Sidebar integration, package exports, and Vite consumer behavior.
- Package typecheck/build, component tests, accessibility tests, Storybook build, registry validation, registry smoke, and playground build are required before completion.
- Existing Sidebar tests are prior art for collapse/mobile/focus behavior, Container tests for safe-area and layout class maps, HorizontalAccordion tests for guarded ResizeObserver behavior, DethinkProvider tests for defensive storage behavior, and Drawer tests for dynamic viewport and scroll containment.

## Out of Scope

- Dashboard Shell product-block composition.
- Navigation item models, route matching, router adapters, redirects, or URL synchronization.
- Breadcrumb, command palette, search, notification, account, auth, workspace switcher, and theme-switcher implementations.
- Permissions, feature flags, server-driven navigation, analytics, telemetry, or data fetching.
- Secondary inspector/tools rails, split panels, pane resizing, or arbitrary multi-column workspace builders.
- Persisting mobile drawer state, responsive posture, scroll position, header visibility, route state, or arbitrary consumer data.
- Cross-device preference synchronization or backend preference APIs.
- Automatic cookie writing or server-session integration.
- Drag-to-resize navigation width. Sidebar's compact rail remains a binary collapse control, not a resize handle.
- Multiple simultaneous primary sidebars.
- Micro-frontend orchestration or cross-application global shell services.
- Hard-coded Bounded Workbench colors, logos, branding, navigation data, or dashboard content.
- Router-specific layout files or framework-specific server component boundaries.
- Replacing SidebarInset for simple navigation/content compositions that do not need a shell.
- Replacing generic PageLayout, Container, Splitter, or Dashboard Shell with one all-purpose layout API.

## Further Notes

- The source product PRD lists SidebarShell as a P1 reusable app-shell pattern with Sidebar, rail, topbar, content, mobile drawer, persisted collapse, skip link, and landmark roles.
- The existing Sidebar PRD explicitly excludes full Dashboard Shell composition and persistent local-storage preferences unless introduced by a later app-shell block.
- Mantine AppShell establishes responsive section configuration and separate desktop/mobile collapsed state.
- MUI Toolpad demonstrates the convenience and coupling risk of a provider-owned dashboard framework with navigation, branding, routing, account, and theme behavior.
- PatternFly Page demonstrates masthead/sidebar/page-region anatomy and managed or controlled sidebar visibility.
- Carbon UI Shell demonstrates a strong persistent product shell, skip-to-content placement, and mobile hamburger handoff, but its brand and global-product hierarchy are intentionally prescriptive.
- Cloudscape AppLayout demonstrates rich navigation, tools, drawer, and split-panel orchestration; SidebarShell deliberately stops before that scope.
- Primer PageLayout provides the closest semantic layout precedent, including full-height and contained regions, sticky/resizable sidebars, persistence, mobile fullscreen behavior, and explicit landmark/skip-link guidance.
- Modern Web Guidance supports logical properties, dynamic viewport units, CSS container queries for size-aware visual adaptation, guarded JavaScript only when interactive behavior must change, focus-visible treatment, 24 CSS-pixel minimum targets, safe defaults, and reduced-motion handling.
- Current Motion documentation supports `motion/react`, shared MotionConfig transitions, layout animation, gesture variants, `initial={false}`, and `useReducedMotion`; SidebarShell applies those APIs as one coherent animation contract.
- The Bounded Workbench reference board is a design input, not a product asset. Final implementation remains React, Tailwind CSS, semantic tokens, registry metadata, and accessible DOM.
