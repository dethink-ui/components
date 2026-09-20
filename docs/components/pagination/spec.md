# Pagination Component Spec

Status: Published to GitHub issue tracker.

Tracker PRD: https://github.com/parveshh/dethink-components/issues/190

Implementation issues:

- Core model and callback controls: https://github.com/parveshh/dethink-components/issues/252
- Link, unbounded, compact, and RTL modes: https://github.com/parveshh/dethink-components/issues/253
- Docs, Storybook, registry, and smoke coverage: https://github.com/parveshh/dethink-components/issues/254

## Purpose

Pagination is the standalone navigation primitive for paged data sets, search results, audit logs, inboxes, cards, and table footers. It should be reusable outside DataTable while composing cleanly with DataTable, page-size controls, filters, and route state.

## Public API

The primary component is `Pagination`.

Core props:

- `page: number`
- `pageCount?: number`
- `hasNextPage?: boolean`
- `onPageChange?: (page: number) => void`
- `hrefForPage?: (page: number) => string | undefined`
- `siblingCount?: number`
- `boundaryCount?: number`
- `compact?: boolean`
- `showFirstLast?: boolean`
- `hideDisabledControls?: boolean`
- `size?: "sm" | "md" | "lg"`
- `status?: ReactNode | false`
- `labels?: PaginationLabels`

Exported anatomy:

- `Pagination`
- `PaginationList`
- `PaginationItem`
- `PaginationPage`
- `PaginationControl`
- `PaginationEllipsis`
- `PaginationStatus`
- `getPaginationRenderItems`

## Behavior

- Bounded mode uses `page` and `pageCount`.
- Unbounded mode omits `pageCount` and uses `hasNextPage` for next-page availability.
- Link mode renders anchors when `hrefForPage` returns a URL.
- If `hrefForPage` returns `undefined` for a generated target, the control falls back to `onPageChange` when supplied and otherwise renders disabled.
- Callback mode renders buttons and calls `onPageChange`.
- The generated layout adapts to the Pagination container width. Small-phone non-compact hosts collapse the generated window to a single row with status at inline-start and grouped Back/Next controls at inline-end, so RTL places status on the right and controls on the left. Larger containers render the normal page window. Compact mode keeps its dense page window for card and footer layouts.
- Current page exposes `aria-current="page"` and `data-current="true"`.
- Disabled boundary controls render disabled by default and never call `onPageChange`.
- `hideDisabledControls` removes disabled previous/first or next/last controls at boundaries.
- Ellipsis items are non-interactive and include screen-reader text.
- Controls use stable dimensions so changing page windows does not shift layout.
- Bounded windows fill the same number of page/ellipsis slots near both boundaries. The default large window always has seven slots; compact windows have five. Small totals show every page.
- Pagination itself keeps framework-neutral anchors. The showcase reads the current page from `useSearchParams` and uses Next.js native history integration for local URL state, preserving scroll, unrelated query parameters, and Back/Forward. Modified clicks retain native navigation. Consumers loading server data should use their router instead of shallow history updates.
- RTL layouts rotate directional control icons through Tailwind RTL variants.

## Accessibility

- Root renders a labelled `nav` landmark.
- Page controls use native anchors or native buttons.
- Icon-only controls have explicit accessible labels.
- Current page is programmatically exposed with `aria-current="page"`.
- Disabled controls use native `disabled` buttons.
- Ellipses do not receive focus.
- Motion is limited to color, box-shadow, and small press affordances, with `motion-reduce` disabling transitions.

## Out Of Scope

- Data fetching, cursor storage, cache invalidation, and URL parsing.
- Page-size select implementation.
- Infinite scrolling or virtualization.
- Jump-to-page input.
- Direct DataTable internals integration beyond composition examples.

## Verification

- Unit tests for deterministic page-window generation.
- Rendered tests for callback, link, partial href fallback, bounded, unbounded, compact, hidden boundary, disabled boundary, custom labels, and RTL behavior.
- Axe tests for bounded, unbounded compact, and disabled-boundary states.
- SSR tests for callback and link modes.
- Storybook examples for bounded, link, unbounded, compact card, DataTable footer, dark mode, density, RTL, and narrow responsive hosts.
- Showcase examples for bounded callback mode, route-backed links, narrow RTL layout, and table footer composition.
- Registry validation for `registry/items/pagination.json`.
