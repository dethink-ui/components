import type { PropRow } from "@/components/props-table";

export const chatBubbleProps: PropRow[] = [
  {
    prop: "open / defaultOpen / onOpenChange",
    type: "boolean / boolean / (open: boolean) => void",
    defaultValue: "false",
    description:
      "Controlled or uncontrolled visibility. Closing preserves children and does not stop a host-owned response.",
  },
  {
    prop: "chat",
    type: "ChatProps",
    defaultValue: "—",
    description:
      "Existing Chat configuration for the default composition: conversationId, messages, prompt, run, activity, renderPart, messageActions, scroll and history.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "Default composition",
    description:
      "Replaces the default trigger and content. Compose ChatBubbleTrigger, ChatBubbleContent and ChatBubbleClose with custom content.",
  },
  {
    prop: "position",
    type: '"bottom-right" | "bottom-left"',
    defaultValue: '"bottom-right"',
    description:
      "Physical screen corner. Explicitly choose bottom-left in RTL if desired.",
  },
  {
    prop: "offset / width / height",
    type: "number | string",
    defaultValue: '"1.5rem" / "25rem" / "36rem"',
    description:
      "Pixels for numbers, CSS lengths for strings. The panel is bounded by the viewport and safe areas.",
  },
  {
    prop: "zIndex",
    type: "number",
    defaultValue: "50",
    description:
      "Widget stacking order. Coordinate with application banners and overlays.",
  },
  {
    prop: "motion",
    type: '"auto" | "none"',
    defaultValue: '"auto"',
    description: "Auto respects reduced motion. None disables the transition.",
  },
  {
    prop: "triggerProps",
    type: "ChatBubbleTriggerProps",
    defaultValue: "—",
    description:
      "Native button props, custom icon children, aria-label, unreadCount and localized unreadLabel. The host owns unread counting.",
  },
  {
    prop: "contentProps",
    type: "ChatBubbleContentProps",
    defaultValue: "—",
    description:
      "title, subtitle, avatar, header, footer, closeLabel, initialFocusRef, native div props and styles. A custom header needs its own accessible label and ChatBubbleClose.",
  },
  {
    prop: "className / style",
    type: "string / CSSProperties",
    defaultValue: "—",
    description:
      "Customize the portal's fixed wrapper; style can override --chat-bubble-offset, --chat-bubble-width and --chat-bubble-height. Use triggerProps/contentProps for surface styles.",
  },
];
