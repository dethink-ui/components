import type { PropRow } from "@/components/props-table";

export const avatarGroupProps: PropRow[] = [
  {
    prop: "members",
    type: "readonly AvatarGroupMember[]",
    description:
      "People, systems, or teams to render. Each member accepts the Avatar identity props plus metadata.",
  },
  {
    prop: "label",
    type: "string",
    defaultValue: '"Avatar group"',
    description: "Accessible group label and basis for overflow copy.",
  },
  {
    prop: "max",
    type: "number",
    defaultValue: "5",
    description:
      "Maximum visible members before an overflow avatar summarizes the hidden members.",
  },
  {
    prop: "overlap",
    type: '"none" | "sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Amount each avatar overlaps the previous one.",
  },
  {
    prop: "overflowLabel",
    type: "string | (context) => string",
    description: "Custom accessible and visible label for the overflow avatar.",
  },
  {
    prop: "reveal",
    type: '"none" | "spread" | "names"',
    defaultValue: '"none"',
    description:
      "Optional member-name reveal behavior for pointer and keyboard focus.",
  },
  {
    prop: "revealLabelVisibility",
    type: '"hover" | "always"',
    defaultValue: '"hover"',
    description:
      "Controls whether reveal labels are interaction-driven or persistent.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl"',
    defaultValue: '"md"',
    description: "Shared Avatar size for members unless a member overrides it.",
  },
  {
    prop: "shape",
    type: '"circle" | "rounded" | "square"',
    defaultValue: '"circle"',
    description:
      "Shared Avatar shape for members unless a member overrides it.",
  },
  {
    prop: "ring",
    type: '"none" | "border" | "ring"',
    defaultValue: '"border"',
    description: "Shared Avatar ring for members unless a member overrides it.",
  },
  {
    prop: "motion",
    type: '"none" | "subtle" | "standard"',
    defaultValue: '"standard"',
    description:
      "Reveal and zoom motion, reduced automatically for users who prefer less motion.",
  },
];
