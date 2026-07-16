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
- `TimelinePresentation`
- `TimelineRevealMode`
- `TimelineRevealOptions`
- `TimelineRevealTrigger`

```ts
export type TimelineItemPayload = Record<string, unknown>;

export type TimelineItemData<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> = {
  id: string;
  datetime?: string | Date;
  dateLabel?: React.ReactNode;
  status?:
    "neutral" | "complete" | "current" | "upcoming" | "warning" | "error";
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
  presentation?: "canvas" | "flow";
  reveal?: "none" | "stagger" | "all";
  revealOptions?: {
    trigger?: "mount" | "in-view" | "manual";
    interval?: number;
    duration?: number;
    initialDelay?: number;
  };
  revealCount?: number;
  onItemReveal?: (id: string, index: number) => void;
  onRevealComplete?: () => void;
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

### Presentation

- `presentation` selects the renderer. It defaults to `"canvas"` for `events`/`progress` and `"flow"` for `story`, so existing usage is unchanged.
- `presentation="canvas"` is the pannable/zoomable absolutely-positioned plane with viewport controls.
- `presentation="flow"` renders `events`/`progress` timelines (with `layout="rail"` or `"alternating"`) in normal document flow: markers, a tokenized rail, and the compact card styling, with no pointer/drag/zoom handlers and no viewport controls. Keyboard prev/next/home/end navigation still works exactly as it does in story mode (gated by `interactive`). Flow event/progress timelines default `interactive` to `true`; story styling defaults it to `false`.
- `presentation="canvas"` is not supported for story-styled timelines (`mode="story"` or `layout="story"`); those always render in flow and the prop is ignored for them.
- The active renderer is reflected on the root and viewport via `data-presentation="canvas" | "flow"`.

### Reveal

- `reveal` animates the entrance of items. It defaults to `"none"`, which applies no reveal attributes and no animation (zero behavior change when unset).
- Reveal applies only to the flow presentation (story and the new events/progress flow). If `reveal` is set with the canvas presentation it is ignored gracefully.
- `reveal="stagger"` animates items in sequentially (fade + a small translate along the main axis, transform/opacity only) while the rail grows alongside (`scale` on the rail, timed to the stagger). `reveal="all"` animates every item in as one group with a single `initialDelay`.
- `revealOptions.trigger` selects when reveal happens: `"mount"` (default), `"in-view"` (a single IntersectionObserver reveals items as they scroll into view; once revealed they stay revealed), or `"manual"` (visibility is driven entirely by `revealCount`; items with index < `revealCount` are revealed).
- `revealOptions.interval` (default 200ms), `duration` (default 500ms), and `initialDelay` (default 0ms) control timing; negative values are clamped to 0.
- Streaming appends: when the `items` array grows, only the new items animate in, with delays relative to their own batch. Existing items are not re-animated.
- `onItemReveal(id, index)` fires per item as it becomes revealed. `onRevealComplete()` fires once after the last item's animation ends (via `animationend` on the last item, with a timer fallback).
- Reveal progression is driven by React state, not animation events. Under `prefers-reduced-motion` every item is visible immediately with no motion, and the reveal callbacks still fire.

## Accessibility

- Root content uses semantic landmarks and list structure.
- Timeline events render as an ordered list with one `<li>` per event.
- Cards use headings, descriptive text, real `<img>` elements with required `alt`, and `<time>` when dates are present.
- Interactive items are keyboard-focusable and activatable with Enter or Space.
- Arrow keys move selection to previous/next enabled item; Home/End move to first/last enabled item.
- Zoom controls are native buttons with accessible labels when the pannable viewport is used.
- Visual status is not color-only: status is exposed with text for assistive technology and `aria-current` for the current milestone.
- Reveal never removes content from the DOM or accessibility tree. Pre-reveal items are hidden with opacity/transform only (never `display:none` or conditional rendering), so screen readers get the full list immediately. The initial server render matches the initial client render; the hidden state and animation are applied via CSS keyed on `data-reveal`/`data-revealed` and run only after hydration.
- All reveal motion is gated behind `motion-safe`. Under `prefers-reduced-motion` items are shown immediately with no motion, and reveal state (and callbacks) still progresses. Reveal never communicates state through animation alone.

## Styling And Theming

- Use Tailwind CSS v4 utilities and semantic CSS variables from the base stylesheet.
- Use `cn` for class merging and static class maps for variants, layout, orientation, and status.
- Use `data-*` attributes for state: `data-mode`, `data-orientation`, `data-layout`, `data-scale`, `data-status`, `data-selected`, `data-disabled`, `data-interactive`, `data-presentation`, `data-reveal`, and `data-revealed`.
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
