# Sidebar Component PRD

Status: Implemented; ready for PR review.

Tracker issue: https://github.com/parveshh/dethink-components/issues/189.

Implementation PR target: `main` by user request.

Package target: `@dethink/components`.

## Problem Statement

Teams building production SaaS dashboards, internal tools, admin consoles, and AI-native workspaces need a sidebar that is more than a static vertical list. The repository already has the primitives required to compose a good app shell, but consumers still need to assemble responsive drawer behavior, collapsed icon rails, active-route state, grouped navigation, focus restoration, skip links, animation, and theme-aware styling themselves.

Without a first-class Sidebar, every dashboard example repeats brittle layout and accessibility decisions. That weakens app-shell credibility, makes responsive navigation inconsistent, and leaves a major gap before Dashboard Shell, Settings, CRUD, Analytics, and AI workspace blocks can feel production-grade.

## Solution

Ship a composable Sidebar component family for app navigation. It should support expanded, collapsed, icon-rail, floating, inset, and mobile drawer states; grouped and nested navigation; active/current route styling; optional item metadata such as badges and actions; keyboard-safe interactions; and built-in motion that makes state changes feel deliberate without making animation the only carrier of state.

Sidebar should be visually distinctive: animated active indicators, smooth width changes, icon-to-label choreography, nested group reveals, mobile drawer entrance/exit, and optional directional transitions. The animation system should respect `prefers-reduced-motion`, keep transform and opacity as the primary animated properties, and use Motion only where stateful layout or exit animation needs it.

## User Stories

1. As a dashboard engineer, I want a Sidebar component, so that app navigation has a reliable foundation.
2. As an internal-tool engineer, I want grouped sidebar sections, so that dense navigation remains scannable.
3. As a SaaS engineer, I want collapsible sidebar modes, so that users can trade label clarity for workspace width.
4. As a product engineer, I want an icon-rail mode, so that expert users can keep navigation available in a compact form.
5. As a mobile user, I want the sidebar to become a dismissible drawer, so that navigation does not crush the page content.
6. As a keyboard user, I want focus to move predictably when the mobile drawer opens and closes, so that I do not get stranded behind an overlay.
7. As a screen-reader user, I want sidebar navigation to be exposed as a labelled navigation landmark, so that I can identify it quickly.
8. As a screen-reader user, I want the current page to use `aria-current`, so that route state is announced.
9. As a keyboard user, I want a skip link option, so that I can bypass long navigation groups.
10. As a design-system consumer, I want active item indicators, so that current location is clear at a glance.
11. As a design-system consumer, I want animated active indicators, so that route changes feel spatially connected.
12. As a motion-sensitive user, I want animations reduced automatically, so that navigation remains comfortable.
13. As an app-shell author, I want the sidebar to support left and right placement, so that product-specific layouts are possible.
14. As an app-shell author, I want a main-content inset companion, so that sidebar layout does not require bespoke CSS.
15. As a product engineer, I want item badges, so that unread counts, beta flags, and status metadata fit the nav item.
16. As a product engineer, I want nested collapsible groups, so that large applications can expose hierarchy without overwhelming users.
17. As a product engineer, I want controlled and uncontrolled collapsed state, so that app preferences can own persistence.
18. As a product engineer, I want controlled and uncontrolled mobile drawer state, so that route changes can close navigation.
19. As a package consumer, I want semantic anchors by default, so that router wrappers and browser affordances still work.
20. As a package consumer, I want `asChild` composition where appropriate, so that framework links can be used.
21. As a package consumer, I want density support, so that navigation can match compact internal-tool screens.
22. As a package consumer, I want RTL support, so that sidebar placement and motion direction adapt.
23. As a theme author, I want token-backed colors, radius, spacing, and shadows, so that Sidebar matches the rest of Dethink.
24. As a docs reader, I want examples for dashboard, settings, analytics, and AI workspace navigation, so that I can copy realistic patterns.
25. As a registry user, I want Sidebar metadata to include every dependency, so that copied installs do not miss motion or overlay behavior.
26. As a maintainer, I want Sidebar to reuse existing Button, IconButton, Link, Tooltip, DropdownMenu, Dialog, Stack, Flex, Separator, and provider patterns, so that it stays consistent with shipped components.
27. As a maintainer, I want drawer behavior tested at public seams, so that focus, dismissal, and inert content do not regress.
28. As a maintainer, I want animation presets to be named and tokenized, so that examples can feel polished without hard-coded choreography.
29. As a maintainer, I want layout animation scoped, so that large nav trees do not become janky.
30. As a maintainer, I want Sidebar to stay separate from a full Dashboard Shell block, so that the primitive remains reusable.

## Implementation Decisions

- Build a Sidebar family rather than one monolithic component. Expected public anatomy includes provider/state helpers, root layout, content regions, groups, group labels, group content, menu lists, menu items, links/buttons, actions, badges, trigger, rail, mobile drawer, inset/content companion, and skip link.
- Support controlled and uncontrolled state for desktop collapse and mobile drawer visibility. Desktop collapse and mobile drawer state are separate concerns.
- Support `expanded`, `collapsed`, `icon`, and `offcanvas` behavior. Consumers should be able to disable collapse for simple apps.
- Support visual variants such as default, floating, inset, rail, and bordered. These variants should remain token-backed and compatible with light, dark, density, high-contrast, and RTL states.
- Prefer anchors for navigational items. Button-style items are allowed only for actions that do not navigate.
- Expose active/current state through props and data attributes. When an item represents the current page, apply `aria-current="page"` to the interactive element.
- Include optional item affordances: icon, label, description, badge, keyboard shortcut, trailing action, disabled state, external indicator, and nested group indicator.
- Include app-shell bypass support through a SkipLink primitive or Sidebar-specific skip slot. The skip link should become visible on focus and target the main content region.
- For mobile drawer behavior, the implementation should reuse the existing Dialog/provider/focus patterns where practical. If browser-native drawer behavior is used, follow progressive enhancement guidance for inert content, Escape, outside click, focus restore, and reduced motion.
- Animation is a first-class feature. Provide named motion presets such as `subtle`, `standard`, `expressive`, and `none`, plus an `animate` boolean opt-out. Built-in choreography should include active-pill shared movement, icon rail label reveal, group expand/collapse, mobile drawer enter/exit, and optional staggered item entrance.
- Use CSS transitions for simple color, background, opacity, and transform states. Use Motion for stateful layout animation, shared active indicators, staggered reveals, and exit animations only where it materially improves behavior.
- Respect reduced motion globally. In reduced-motion mode, preserve opacity/color feedback and remove transform-heavy movement, layout morphs, and stagger.
- Keep animations transform/opacity-first and avoid animating layout-heavy properties except through Motion layout primitives or fixed-width CSS transitions that are verified.
- Do not introduce router-specific APIs. Consumers pass `href`, `onAction`, `asChild`, or current state from their router.
- Registry metadata must declare any Motion dependency only if the component implementation imports it.

## Testing Decisions

- Tests should verify behavior users observe: collapsed state, mobile open/close, Escape dismissal, focus restore, active route state, disabled items, group expansion, item callbacks, skip link focus behavior, and RTL side behavior.
- Use rendered component tests for controlled and uncontrolled state.
- Use axe automation for expanded, collapsed, mobile drawer, grouped, and nested states.
- Add SSR smoke tests for default expanded, default collapsed, and mobile-capable markup.
- Storybook should cover visual variants, densities, dark mode, RTL, long labels, badges, actions, collapsed rail, mobile drawer, reduced motion, and animated active-route transitions.
- Showcase should include realistic dashboard, settings, analytics, and AI workspace recipes.
- Registry validation should confirm Sidebar files, dependencies, registry dependencies, and CSS variables.

## Out of Scope

- Full Dashboard Shell block composition.
- Router integration for Next.js, React Router, Remix, TanStack Router, or Expo Router.
- Auth-aware navigation, permissions engines, or server-driven route loaders.
- Toasts, notification center, account switchers, top bars, breadcrumbs, and command palette behavior beyond Sidebar composition examples.
- Drag-and-drop navigation reordering.
- Persistent local-storage preferences unless introduced by a later app-shell block.

## Further Notes

Research inputs:

- shadcn/ui positions Sidebar as a complex, central app component with collapsible icon behavior and composable theming: https://ui.shadcn.com/docs/components/radix/sidebar
- Modern Web Guidance navigation-drawer guide recommends inert content, focus movement, Escape dismissal, scroll/snap progressive enhancement, and reduced-motion-aware behavior.
- Motion docs recommend `MotionConfig reducedMotion="user"`, `AnimatePresence` for exit animation, layout animation for state changes, and transform/opacity-oriented performance: https://motion.dev/docs/react-accessibility
- Skip-link guidance supports placing the skip link before other focusable elements, showing it on focus, and targeting main content: https://bati-itao.github.io/learning/esdc-self-paced-web-accessibility-course/module3/navigation.html
