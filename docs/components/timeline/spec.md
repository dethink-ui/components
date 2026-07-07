# Timeline Component Spec

Status: Draft local spec.

Package target: `@dethink/components`.

## Summary

Timeline is a P1 data-display component moved forward from the normal build order. It shows ordered events, editorial stories, or progress milestones with heading, description, optional image, date/time, status marker, selection, and an optional pannable/zoomable DOM viewport.

The v1 "canvas" is a semantic DOM viewport, not a literal `<canvas>`. Timeline content remains selectable, readable by assistive technology, responsive, themeable, and compatible with shadcn-style registry installation.

## Use Cases

- Product or company history with dates, rich descriptions, and images.
- Workflow or onboarding progress with completed, current, upcoming, warning, or error milestones.
- Incident, audit, project, or release timelines where users need to zoom into a section or pan across a larger sequence.
- Read-only dashboard timelines that need source-code ownership and token-backed styling.

## Public API

Timeline exports:

- `Timeline`
- `TimelineItem`
- `TimelineViewport`
- `TimelineControls`
- `TimelineItemData`
- `TimelineProps`
- `TimelineStatus`
- `TimelineMode`
- `TimelineOrientation`
- `TimelineLayout`
- `TimelineScale`
- `TimelineOrder`
- `TimelineViewportOptions`
- `TimelineItemPayload`
- `TimelineItemRenderer`

```ts
export type TimelineItemPayload = Record<string, unknown>;

export type TimelineItemData<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> = {
  id: string;
  datetime?: string | Date;
  dateLabel?: React.ReactNode;
  status?: "neutral" | "complete" | "current" | "upcoming" | "warning" | "error";
  marker?: React.ReactNode;
  disabled?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  image?: { src: string; alt: string; width?: number; height?: number };
  data?: TPayload;
};
```

```ts
export type TimelineProps<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> = {
  items: TimelineItemData<TPayload>[];
  mode?: "events" | "progress" | "story";
  orientation?: "horizontal" | "vertical";
  layout?: "rail" | "alternating" | "stacked" | "story";
  scale?: "auto" | "time" | "sequence";
  order?: "asc" | "desc";
  interactive?: boolean;
  viewport?: {
    defaultZoom?: number;
    minZoom?: number;
    maxZoom?: number;
    controls?: boolean;
    controlsVisibility?: "always" | "hover";
    chrome?: "none" | "subtle" | "panel";
    wheelZoom?: "modifier" | "always" | false;
  };
  selectedId?: string;
  defaultSelectedId?: string;
  onSelectedIdChange?: (id: string | null) => void;
  renderItem?: (item: TimelineItemData<TPayload>) => React.ReactNode;
};
```

Timeline keeps structural fields at the top level and reserves `data` for product-specific payloads. The default renderer uses `title`, `description`, and `image`; custom `renderItem` templates can ignore those fields and render from `data` instead.

## Behavior

- `mode="events"` renders date/time content with a machine-readable `<time datetime="...">` when `datetime` is available.
- `mode="progress"` allows items without dates and relies on `status` to communicate milestone state.
- `mode="story"` renders a static, vertical, publication-style ordered list with an unframed content column, tokenized rail, custom `marker?: React.ReactNode` support, and larger default date/title/description typography. It defaults to `orientation="vertical"`, `layout="story"`, `scale="sequence"`, and `interactive={false}`.
- Story mode also supports `layout="alternating"` as a normal component layout. It keeps a single-column document flow on narrow viewports and alternates content around the centered rail at larger breakpoints.
- `data` is preserved through normalization and passed to `renderItem` without interpretation by Timeline.
- If no `renderItem` is provided and `title` is missing, the default renderer falls back to the item `id` for its heading and accessible name.
- `scale="auto"` uses time-based spacing when every item has a valid `datetime`; otherwise it uses sequence spacing.
- `order="asc"` is chronological for valid event timelines and input order for progress timelines; `order="desc"` reverses the resolved order.
- Disabled items remain visible but are not selectable through pointer or keyboard navigation.
- Selection can be uncontrolled with `defaultSelectedId` or controlled with `selectedId` and `onSelectedIdChange`.
- `viewport.chrome` controls whether the viewport is borderless, subtly tinted, or framed as a panel. Pan, zoom, and controls apply to the event/progress viewport renderer, while story mode uses normal document flow.
- `viewport.controlsVisibility="hover"` keeps controls visually hidden until the viewport is hovered or receives keyboard focus.
- V1 is read-only. Drag editing, creation, removal, range resizing, grouping lanes, virtualization, and scheduler behavior are intentionally out of scope.

## Accessibility

- Root content uses semantic landmarks and list structure.
- Timeline events render as an ordered list with one `<li>` per event.
- Cards use headings, descriptive text, real `<img>` elements with required `alt`, and `<time>` when dates are present.
- Interactive items are keyboard-focusable and activatable with Enter or Space.
- Arrow keys move selection to previous/next enabled item; Home/End move to first/last enabled item.
- Zoom controls are native buttons with accessible labels when the pannable viewport is used.
- Visual status is not color-only: status is exposed with text for assistive technology and `aria-current` for the current milestone.

## Styling And Theming

- Use Tailwind CSS v4 utilities and semantic CSS variables from the base stylesheet.
- Use `cn` for class merging and static class maps for variants, layout, orientation, and status.
- Use `data-*` attributes for state: `data-mode`, `data-orientation`, `data-layout`, `data-scale`, `data-status`, `data-selected`, `data-disabled`, and `data-interactive`.
- Avoid CSS-in-JS, runtime-generated Tailwind class fragments, and hard-coded brand colors.
- Use Timeline-specific semantic tokens for the visual rail and event-card borders so dark mode remains readable without brightening every global border.
- Support light, dark, density, RTL, responsive, and high-contrast-friendly states through existing tokens and structural classes.

## Registry

Timeline receives a `registry:ui` item under `registry/items/timeline.json`.

The registry item depends on `dethink-base`, declares no new runtime dependencies, and includes Timeline source files plus the shared `cn` helper.

## Test Requirements

- Unit tests cover item normalization, sorting, scale selection, zoom clamping, fit/reset math, and selection navigation.
- Render tests cover titles, descriptions, images, dates, statuses, ordering, orientation, layout variants, custom markers, and custom item rendering.
- Interaction tests cover pointer selection, keyboard selection, zoom controls, reset, fit, pointer pan, and wheel zoom rules.
- Accessibility tests cover axe, list semantics, valid `time[datetime]`, image alt handling, focus behavior, disabled items, and keyboard operation.
- SSR tests verify server rendering and hydration without browser-only render access.
