import type { PropRow } from "@/components/props-table";

export const timelineProps: PropRow[] = [
  {
    prop: "items",
    type: "TimelineItemData[]",
    defaultValue: "—",
    description:
      "Event data: id, title, description, datetime/dateLabel, status, optional marker and typed payload via data.",
  },
  {
    prop: "mode",
    type: '"events" | "progress"',
    defaultValue: '"events"',
    description:
      "Dated event history, or an undated step sequence for pipelines and wizards.",
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
    defaultValue: "horizontal",
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
    prop: "interactive",
    type: "boolean",
    defaultValue: "true",
    description: "Disables selection for purely presentational timelines.",
  },
  {
    prop: "viewport",
    type: "TimelineViewportOptions",
    defaultValue: "—",
    description: "Zoom and pan options for long histories (defaultZoom, limits).",
  },
  {
    prop: "renderItem",
    type: "TimelineItemRenderer",
    defaultValue: "built-in card",
    description: "Custom item rendering with access to the typed payload.",
  },
];
