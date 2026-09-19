import type { PropRow } from "@/components/props-table";
export const chatProps: PropRow[] = [
  {
    prop: "conversationId / messages",
    type: "string / readonly ChatMessageData[]",
    defaultValue: "Required",
    description:
      "Stable conversation identity and a controlled transcript of named text, citation, attachment, and custom parts.",
  },
  {
    prop: "run",
    type: "ChatRun",
    defaultValue: "undefined",
    description:
      "Host-supplied submitted, running, stopping, completed, stopped, or error state. No transport runs inside Chat.",
  },
  {
    prop: "activity",
    type: "{ items, onApproval?, renderResult? }",
    defaultValue: "undefined",
    description:
      "Ordered public activity events, explicit tool decisions, and trusted custom results.",
  },
  {
    prop: "prompt",
    type: "PromptInputProps",
    defaultValue: "undefined",
    description:
      "Draft ownership, send/stop callbacks, file validation and upload state, model selection, actions, and helper content.",
  },
  {
    prop: "renderPart",
    type: "ChatPartRenderer",
    defaultValue: "Plain text",
    description:
      "Optional rich renderer. Return undefined for the built-in part renderer. Markdown uses a separate optional package entry.",
  },
  {
    prop: "messageActions",
    type: "ChatMessageActionHandlers",
    defaultValue: "undefined",
    description:
      "Copy, feedback, edit, retry, regenerate, and version-change callbacks. Unsupported actions remain hidden.",
  },
  {
    prop: "history",
    type: "MessageListProps",
    defaultValue: "Full transcript",
    description:
      "Older-history loading/error states and optional measured windowing with overscan and focused-row retention.",
  },
  {
    prop: "scroll",
    type: "MessageScrollerProps",
    defaultValue: "Follow latest",
    description:
      "Per-conversation initialPosition/onPositionChange and scroll-region labels. Reading older messages detaches following.",
  },
  {
    prop: "header / emptyState / composer",
    type: "ReactNode",
    defaultValue: "undefined",
    description:
      "Compose your workspace header, first-use suggestions, or a fully custom composer.",
  },
];
