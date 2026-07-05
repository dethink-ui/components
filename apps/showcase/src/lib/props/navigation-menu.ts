import type { PropRow } from "@/components/props-table";

export const navigationMenuProps: PropRow[] = [
  {
    prop: "variant / size / orientation",
    type: '"default" | "quiet" | "underline" / "sm" | "md" | "lg" / "horizontal" | "vertical"',
    defaultValue: '"default" / "md" / "horizontal"',
    description:
      "Token-backed presentation of the whole menu; links and triggers inherit these through context.",
  },
  {
    prop: "value / defaultValue / onValueChange",
    type: "string | null / string | null / (value) => void",
    defaultValue: "—",
    description:
      "Controlled or uncontrolled open flyout item, keyed by NavigationMenuItem value.",
  },
  {
    prop: "activationMode",
    type: '"click" | "hover" | "focus" | "manual"',
    defaultValue: '"click"',
    description:
      "How triggers open panels. Hover adds an intent delay and keeps click/keyboard activation working; manual leaves all state changes to the consumer.",
  },
  {
    prop: "delay / closeDelay",
    type: "number / number",
    defaultValue: "150 / 300",
    description: "Hover-intent timings in milliseconds for hover activation.",
  },
  {
    prop: "motion",
    type: '"none" | "subtle" | "standard" | "expressive"',
    defaultValue: '"standard"',
    description:
      "CSS motion preset for panel transitions, directional slides, and staggered reveal. All movement respects prefers-reduced-motion.",
  },
  {
    prop: "NavigationMenuLink — current",
    type: 'boolean | "page" | "location"',
    defaultValue: "—",
    description:
      'Marks the current destination with aria-current and a stable data-current attribute.',
  },
  {
    prop: "NavigationMenuLink — disabled / external / icon / asChild",
    type: "boolean / boolean / ReactNode / boolean",
    defaultValue: "—",
    description:
      "Disabled links drop their href and expose aria-disabled; external links get safe rel handling; asChild composes router links.",
  },
  {
    prop: "NavigationMenuItem — value",
    type: "string",
    defaultValue: "auto",
    description:
      "Stable identity for controlled state, indicator mapping, and directional transitions.",
  },
  {
    prop: "NavigationMenuTrigger",
    type: "button (disclosure semantics)",
    defaultValue: "—",
    description:
      "Native button exposing aria-expanded/aria-controls; never role=menu. showChevron hides the built-in caret.",
  },
  {
    prop: "NavigationMenuViewport / NavigationMenuIndicator",
    type: "optional anatomy",
    defaultValue: "—",
    description:
      "Shared morphing panel host and animated active-item marker; both are optional layers over the inline flyout behavior.",
  },
];
