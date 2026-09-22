import type { PropRow } from "@/components/props-table";

export const timelineProps: PropRow[] = [
  {
    prop: "variant",
    type: '"activity" | "cards"',
    defaultValue: '"activity"',
    description:
      "Compact activity rows or bordered cards in non-story flow layouts.",
  },
  {
    prop: "getGroup",
    type: "(item) => { id: string; label: ReactNode } | null",
    defaultValue: "—",
    description:
      "Labels contiguous groups after ordering, without reordering events. Flow only.",
  },
  {
    prop: "details / renderDetails",
    type: "ReactNode / TimelineItemRenderer",
    defaultValue: "—",
    description:
      "Item details or a typed details renderer, exposed through a separate disclosure. Flow only.",
  },
  {
    prop: "expandedIds / defaultExpandedIds / onExpandedIdsChange",
    type: "string[] / string[] / (ids) => void",
    defaultValue: "[]",
    description:
      "Controlled or uncontrolled expansion; multiple events may be open.",
  },
  {
    prop: "TimelineFeed: followLatest / viewportClassName",
    type: "boolean / string",
    defaultValue: "true / h-[28rem]",
    description:
      "Contained live feed. Following pauses away from the end; the viewport class customizes its height.",
  },
  {
    prop: "items",
    type: "TimelineItemData[]",
    defaultValue: "—",
    description:
      "Event data: id, title, description, datetime/dateLabel, status, optional marker and typed payload via data.",
  },
  {
    prop: "mode",
    type: '"events" | "progress" | "story"',
    defaultValue: '"events"',
    description:
      "Dated event history, undated progress sequence, or static editorial story timeline.",
  },
  {
    prop: "status (per item)",
    type: '"neutral" | "complete" | "current" | "upcoming" | "warning" | "error"',
    defaultValue: '"neutral"',
    description: "Health/progress tone of each item's marker and card.",
  },
  {
    prop: "orientation / layout",
    type: '"horizontal" | "vertical" / layout variants',
    defaultValue: "vertical (flow), horizontal (canvas)",
    description: "Axis of the track and how item cards stack around it.",
  },
  {
    prop: "scale / order",
    type: "time scale / chronological order",
    defaultValue: "auto",
    description:
      "How datetimes map to track distance and which direction time flows.",
  },
  {
    prop: "selectedId / defaultSelectedId / onSelectedIdChange",
    type: "string | null / string | null / (id) => void",
    defaultValue: "—",
    description:
      "Controlled or uncontrolled selection; arrow keys move between items.",
  },
  {
    prop: "presentation",
    type: '"canvas" | "flow"',
    defaultValue: '"flow"',
    description:
      "Pannable/zoomable plane, or a static document-flow list with markers, rail, and compact cards.",
  },
  {
    prop: "reveal / revealOptions",
    type: '"none" | "stagger" | "all" / trigger, interval, duration, initialDelay',
    defaultValue: '"none"',
    description:
      "Animated item entrance for the flow presentation — staggered or all at once, on mount, in view, or manually.",
  },
  {
    prop: "revealCount / onItemReveal / onRevealComplete",
    type: "number / (id, index) => void / () => void",
    defaultValue: "—",
    description:
      "Controlled reveal progression for the manual trigger, plus per-item and completion callbacks. Appended items animate in as their own batch.",
  },
  {
    prop: "interactive",
    type: "boolean",
    defaultValue: "true",
    description: "Disables selection for purely presentational timelines.",
  },
  {
    prop: "viewport",
    type: "TimelineViewportOptions",
    defaultValue: "—",
    description:
      "Zoom and pan options for long histories (defaultZoom, limits).",
  },
  {
    prop: "renderItem",
    type: "TimelineItemRenderer",
    defaultValue: "built-in card",
    description: "Custom item rendering with access to the typed payload.",
  },
];
