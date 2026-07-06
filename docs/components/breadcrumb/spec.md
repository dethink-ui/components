# Breadcrumb Component Spec

Status: Draft local planning document for published GitHub PRD.

Tracker issue: https://github.com/parveshh/dethink-components/issues/186

Source: `react_component_library_prd.docx`, `docs/high-impact-component-priority.md`, the published Breadcrumb PRD, Context7 React Aria breadcrumb docs, WAI-ARIA APG Breadcrumb pattern, and MDN breadcrumb accessibility guidance.

Package target: `@dethink/components`.

## Purpose

Breadcrumb is the location-navigation primitive for SaaS dashboards, admin detail pages, settings sections, and drill-in workflows. It communicates hierarchy, exposes parent-page navigation, and marks the current page without becoming a full page-header, Sidebar, NavigationMenu, Pagination, or CommandPalette.

## Priority

P0 navigation-set follow-up.

The broader navigation set has published PRDs for Breadcrumb, CommandPalette, NavigationMenu, Sidebar, and Pagination. NavigationMenu and Sidebar are implemented locally; Breadcrumb is the smallest remaining navigation primitive and should be built before the heavier CommandPalette surface.

## Dependencies

- Foundation tokens for color, focus, radius, motion, density, and RTL.
- Tailwind CSS v4 utilities with static class maps.
- Shared `cn` class name utility.
- Existing Link, NavigationMenu, Popover, DropdownMenu, and Sidebar semantics as local prior art.
- Existing `Popover` for optional overflow content when hidden breadcrumb ancestors must remain reachable as real links or buttons.
- Registry base setup under `registry/items/base.json`.

## Research Notes

- WAI-ARIA APG defines breadcrumbs as a labelled navigation landmark containing parent-page links in hierarchical order. If the current page is a link, it should use `aria-current="page"`; if the current page is non-link text, `aria-current` is optional.
- React Aria exposes `useBreadcrumbs` and `useBreadcrumbItem` for the nav and item behavior. Its examples use a `nav`, an ordered list, non-interactive current item behavior, disabled breadcrumbs, and separators hidden from assistive technology.
- MDN's breadcrumb layout guidance reinforces `aria-label`, `aria-current`, inline list layout, and warns that generated separator content can be exposed to assistive technologies unless it is deliberately silenced.

## Public API

```tsx
type BreadcrumbSize = "sm" | "md" | "lg";
type BreadcrumbSeparatorVariant = "chevron" | "slash" | "dot" | "none";
type BreadcrumbCollapseFrom = "start" | "middle" | "end";

type BreadcrumbItemData = {
  key: string;
  label: React.ReactNode;
  textValue?: string;
  href?: string;
  current?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onAction?: () => void;
};

type BreadcrumbProps = React.HTMLAttributes<HTMLElement> & {
  "aria-label"?: string;
  items?: BreadcrumbItemData[];
  size?: BreadcrumbSize;
  separator?: BreadcrumbSeparatorVariant | React.ReactNode;
  maxItems?: number;
  collapseFrom?: BreadcrumbCollapseFrom;
  preserveRoot?: boolean;
  preserveCurrent?: boolean;
  overflowLabel?: string;
  children?: React.ReactNode;
};
```

Component family:

- `Breadcrumb`
- `BreadcrumbList`
- `BreadcrumbItem`
- `BreadcrumbLink`
- `BreadcrumbPage`
- `BreadcrumbSeparator`
- `BreadcrumbEllipsis`
- `BreadcrumbOverflow`

Export helper class maps for each public part.

## Behavior

- `Breadcrumb` renders a `nav` landmark with `aria-label="Breadcrumb"` by default.
- `BreadcrumbList` renders an ordered list.
- `BreadcrumbItem` renders a list item and owns item-level data attributes.
- `BreadcrumbLink` renders a real anchor when `href` is provided and a button when `onAction` is provided without `href`.
- `BreadcrumbLink` supports `asChild` for framework router links, following the existing Link component's clone-and-compose pattern.
- `BreadcrumbPage` renders non-interactive current-page text by default.
- A current interactive link receives `aria-current="page"` unless the consumer overrides `aria-current`.
- A current non-link page may expose `aria-current="page"` for consistency, but it must not become keyboard focusable.
- Disabled items expose disabled state, avoid activation, and remain visually distinct without relying only on opacity.
- Separators are decorative and hidden from assistive technology.
- Icon slots are decorative by default unless the consumer provides labelled content.
- `items` data and explicit children composition are both supported. Data-driven usage should cover the common route/detail-page path; children composition should support custom router links, custom overflow, and unusual separators.
- `maxItems` collapses long paths while preserving root and current items by default.
- Collapsed hidden ancestors remain reachable through `BreadcrumbOverflow`.
- Overflow should compose the existing Popover surface by default so hidden ancestors can remain real links or buttons. DropdownMenu can be documented as a custom action-menu recipe, but Breadcrumb should not create a separate overlay stack.
- Motion stays CSS-only in v1: color, opacity, separator, current-item, and overflow-trigger transitions. No Motion dependency is required.
- Component render must be SSR-safe and must not inspect browser route APIs during render.

## Defaults

- `aria-label="Breadcrumb"`
- `size="md"`
- `separator="chevron"`
- `collapseFrom="middle"`
- `preserveRoot={true}`
- `preserveCurrent={true}`
- `overflowLabel="Show breadcrumb path"`

## Variants

Sizes:

- `sm`: compact toolbars, card headers, table drill-ins.
- `md`: normal page headers and app shell slots.
- `lg`: spacious marketing/admin page headers where labels can be longer.

Separators:

- `chevron`: default dashboard/app hierarchy.
- `slash`: compact filesystem or settings paths.
- `dot`: metadata-adjacent trails.
- `none`: custom visual grouping where item spacing is enough.
- Custom `ReactNode`: consumer-supplied separator, still wrapped with `aria-hidden`.

## Accessibility

- Use `nav` plus an accessible label for the landmark.
- Use an ordered list to preserve hierarchy.
- Use real links for navigation and buttons for local actions.
- Use `aria-current="page"` on the current link. Mark only one item as current.
- Do not use `aria-selected`; current location is not selection state.
- Keep separators out of the accessibility tree.
- Keep focus-visible styles token-backed and visible in light, dark, high-contrast, and density contexts.
- Overflow trigger must have an accessible label and keyboard-reachable content.
- Overflow content must preserve link/action semantics for hidden ancestors.
- Manual keyboard criteria: Tab reaches interactive links, action buttons, and overflow trigger in document order; Enter/Space activates buttons; Escape closes overflow and returns focus to the trigger through the composed Popover behavior.

## Theming

- Use semantic Tailwind utilities and CSS variables only.
- Use explicit size, separator, current, disabled, and overflow class maps so Tailwind can statically detect classes.
- Support light, dark, density, RTL, high contrast, and token override contexts.
- Use stable dimensions for ellipsis/overflow controls so collapsed and expanded states do not shift surrounding headers.
- Consumer `className` and part-level class names must compose predictably.

## Registry Requirements

- Add a `breadcrumb` registry item with component source, index export, and `cn` utility.
- Depend on `dethink-base`.
- Add `popover` as a registry dependency only if the built-in overflow surface imports it.
- Add no Motion dependency for v1.
- Keep metadata compatible with the existing registry validation and smoke scripts.

## Documentation Requirements

- Overview and semantic boundary: Breadcrumb for location hierarchy, not top navigation, pagination, command search, or page-header layout.
- Installation through registry and package import.
- Anatomy and stable data attributes.
- Data-driven and children-driven examples.
- Current page as link and non-link text.
- Separators, sizes, long labels, icons, disabled items, and overflow collapse.
- Router composition through `asChild`.
- Page header, object detail, data-table drill-in, settings section, and compact toolbar recipes.
- Accessibility, theming, SSR, testing, reduced-motion, and out-of-scope guidance.

## Testing Requirements

- Unit tests for collapse/window generation: no collapse, middle collapse, start/end collapse, preserve root/current, small item counts, disabled/current hidden-item edge cases, and invalid `maxItems` handling.
- Render tests for nav landmark label, ordered list, href links, action buttons, router `asChild`, current link semantics, current text semantics, disabled items, icon slots, separators hidden from assistive technology, class merging, and data attributes.
- Overflow tests for trigger labelling, hidden item rendering, keyboard reachability, focus return, and link/action preservation.
- Axe tests for normal, collapsed, icon, current-link, current-text, disabled, and overflow states.
- SSR smoke tests for default, data-driven, children-driven, and collapsed breadcrumbs.
- Storybook coverage for separators, sizes, long labels, max-item collapse, overflow, icons, dark mode, density, RTL, custom theme, and reduced motion.
- Showcase coverage for page header, object detail, data-table drill-in, settings section, and compact toolbar recipes.
- Registry validation and registry smoke.

## Out Of Scope

- Router adapters and route-file path generation.
- Full page-header or app-shell layout.
- Sidebar, NavigationMenu, Pagination, CommandPalette, or Dashboard Shell behavior.
- Global analytics tracking.
- Browser-history integration.
- Motion layout animation.
- Jump menus or search inside collapsed overflow.

## Definition Of Done

- Public types and component exports exist.
- Styling uses token-backed Tailwind utility maps and stable `data-*` selectors.
- Current-page semantics, decorative separators, and overflow accessibility are verified.
- Docs, Storybook, showcase examples, tests, SSR, a11y, registry metadata, package export, and registry smoke are updated.
- Verification passes: `pnpm typecheck`, `pnpm test`, `pnpm test:a11y`, `pnpm build`, `pnpm storybook:build`, `pnpm registry:validate`, and registry smoke.
