# Timeline Component PRD

Status: Draft local PRD.

Package target: `@dethink/components`.

## Problem Statement

SaaS and internal-tool teams frequently need to show ordered project, incident, audit, release, onboarding, and progress information. Basic vertical lists work for small histories, but they do not provide a strong visual connection between events, do not handle rich event cards consistently, and do not let users inspect long timelines through panning and zooming.

## Solution

Ship a read-only Timeline component that combines semantic event, story, and progress cards with a token-backed visual rail and an optional pannable/zoomable DOM viewport. It should install through the package and registry paths, preserve accessible semantics, and remain flexible enough for custom event rendering.

## User Stories

1. As a product engineer, I want to render event cards with title, description, image, date/time, and status, so that product history and operational events are easy to scan.
2. As a product engineer, I want progress timelines without dates, so that onboarding or workflow state can use the same component.
3. As a product engineer, I want a static story timeline mode with strong year, heading, and description hierarchy, so that company or product histories do not require consumer-side selector overrides.
4. As a product engineer, I want to pass a typed domain payload into each item and render it through my own template, so that Timeline can support deployment, incident, audit, or product-history cards without changing the core component.
5. As a dashboard user, I want to pan and zoom a dense timeline, so that I can inspect a whole history or a focused section.
6. As a keyboard user, I want arrow-key navigation and visible focus, so that I can operate the timeline without a pointer.
7. As a screen reader user, I want real headings, image alternatives, and machine-readable dates, so that event content is understandable outside the visual rail.
8. As a design-system lead, I want status styling to use semantic tokens, so that themes, dark mode, density, and high contrast remain consistent.
9. As a maintainer, I want the component to avoid advanced dependencies, so that a timeline registry install stays lightweight.
10. As a contributor, I want focused tests and stories, so that future pan/zoom or layout changes do not break public behavior.

## Implementation Decisions

- Timeline is implemented in `packages/components` and documented through `apps/storybook`.
- The viewport is semantic DOM content transformed with CSS, not a literal canvas.
- `Timeline` owns data normalization, ordering, selection, and keyboard behavior.
- `TimelineItemData<TPayload>` keeps core timeline mechanics at the top level and exposes optional `data?: TPayload` for domain-specific template payloads.
- `title`, `description`, and `image` are optional default-renderer fields; consumers can omit them when `renderItem` owns the card content.
- `TimelineItem` owns event card semantics, marker/status rendering, image rendering, and item activation.
- `TimelineViewport` owns pan/zoom state, pointer dragging, wheel zoom, fit/reset/zoom controls, and transform application.
- `mode="story"` uses a static flow renderer instead of the pan/zoom viewport. It owns the unframed editorial layout, tokenized rail, `ReactNode` marker treatment, and larger default typographic hierarchy.
- Story mode supports both its default one-sided editorial layout and `layout="alternating"` for histories that should alternate content around a centered rail at wider breakpoints.
- `TimelineViewport` supports optional border/background chrome through `viewport.chrome`.
- `TimelineControls` renders native icon buttons, can be used by the viewport or imported directly, and can reveal on viewport hover/focus through `viewport.controlsVisibility`.
- Timeline rail and event-card borders use component-specific semantic tokens to preserve contrast in dark mode while leaving global border tokens quiet.
- `mode="events"` sorts valid dated items chronologically by default; `mode="progress"` preserves input order; `mode="story"` preserves input order by default and can opt into time ordering with `scale="time"`.
- `scale="auto"` selects time spacing only when every item has a valid date/time; otherwise sequence spacing avoids misleading gaps.
- `interactive` defaults to enabled for the full read-only explorer experience, except `mode="story"` where it defaults to disabled for presentational histories.
- V1 does not include editing, item creation, deletion, grouping, virtualization, or scheduler/event-calendar lanes.

## Testing Decisions

- Test public behavior and utility contracts rather than class implementation details.
- Use rendered component tests for public props, DOM semantics, selection, keyboard behavior, disabled items, and controls.
- Use utility tests for pure sorting, scale, bounds, and navigation logic.
- Use axe for baseline accessibility coverage.
- Use SSR smoke tests for server rendering and hydration.
- Use Storybook stories for event, progress, image-rich, horizontal viewport, vertical layout, alternating layout, dark mode, density, RTL, and responsive examples.

## Out Of Scope

- Drag editing and resizing.
- Creating, updating, or removing items.
- Range items with start/end dates.
- Grouped lanes or resource timelines.
- Virtualization for thousands of items.
- Integration with scheduler/calendar components.
- Motion library dependency.

## Further Notes

- Timeline exists in the source PRD as a P1 data-display component.
- This component is intentionally being moved forward to validate a richer dashboard data-display pattern before several other P1 components.
