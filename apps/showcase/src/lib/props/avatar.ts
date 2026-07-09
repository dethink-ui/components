import type { PropRow } from "@/components/props-table";

export const avatarProps: PropRow[] = [
  {
    prop: "name",
    type: "string",
    description:
      "Accessible label and source for generated initials when explicit initials are not provided.",
  },
  {
    prop: "src",
    type: "string",
    description:
      "Image URL rendered inside the avatar until it fails, then fallback content is shown.",
  },
  {
    prop: "initials",
    type: "string",
    description:
      "Explicit fallback initials, normalized to at most three uppercase characters.",
  },
  {
    prop: "fallbackIcon",
    type: "ReactNode",
    description:
      "Icon rendered when no image or initials are available, useful for teams and systems.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl"',
    defaultValue: '"md"',
    description: "Density-aware avatar size.",
  },
  {
    prop: "shape",
    type: '"circle" | "rounded" | "square"',
    defaultValue: '"circle"',
    description: "Avatar clipping shape.",
  },
  {
    prop: "tone",
    type: '"neutral" | "primary" | "success" | "warning" | "destructive" | "info"',
    defaultValue: '"neutral"',
    description: "Fallback background and foreground tone.",
  },
  {
    prop: "ring",
    type: '"none" | "border" | "ring"',
    defaultValue: '"none"',
    description: "Optional edge treatment for separation on busy surfaces.",
  },
  {
    prop: "motion",
    type: '"none" | "subtle" | "standard"',
    defaultValue: '"standard"',
    description:
      "Hover and focus feedback, reduced automatically for users who prefer less motion.",
  },
  {
    prop: "decorative",
    type: "boolean",
    defaultValue: "false",
    description:
      "Marks the avatar as presentation-only when surrounding text already provides the identity.",
  },
  {
    prop: "imageProps",
    type: "AvatarImageProps",
    description:
      "Safe pass-through props for the internal image, excluding layout and accessibility props owned by Avatar.",
  },
];
