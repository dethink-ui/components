import type { PropRow } from "@/components/props-table";

export const buttonGroupProps: PropRow[] = [
  {
    prop: "mode",
    type: '"attached" | "separated"',
    defaultValue: '"attached"',
    description:
      "Merge adjacent borders and logical corners, or retain a density-token gap between actions.",
  },
  {
    prop: "orientation",
    type: '"horizontal" | "vertical"',
    defaultValue: '"horizontal"',
    description:
      "Set the visual flow. Each child remains in normal document Tab order in either orientation.",
  },
  {
    prop: "aria-label / aria-labelledby",
    type: "string",
    description:
      "Give the role=group container a concise accessible name that describes the relationship between its actions.",
  },
  {
    prop: "children",
    type: "ReactNode",
    description:
      "Independent Button, IconButton, native button, or compatible action elements. ButtonGroup does not clone them.",
  },
  {
    prop: "className",
    type: "string",
    description:
      "Compose placement and sizing utilities. Keep the internal axis aligned with orientation; responsive action handoff belongs to the surrounding product layout.",
  },
];

export const buttonGroupSeparatorProps: PropRow[] = [
  {
    prop: "className",
    type: "string",
    description:
      "Compose classes onto the decorative token-backed rule. Its axis is derived from the surrounding group.",
  },
];
