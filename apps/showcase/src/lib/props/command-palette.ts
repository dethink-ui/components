import type { PropRow } from "@/components/props-table";

export const commandPaletteProps: PropRow[] = [
  {
    prop: "commands",
    type: "CommandPaletteCommand[]",
    defaultValue: "[]",
    description:
      "Typed action, link, page, and separator items. Commands support labels, descriptions, icons, groups, shortcuts, aliases, keywords, disabled reasons, destructive state, and metadata.",
  },
  {
    prop: "query / onQueryChange",
    type: "string / (query) => void",
    defaultValue: "uncontrolled",
    description:
      "Controls the search text for manual filtering, server search, analytics, or app-owned query persistence.",
  },
  {
    prop: "filter / sort / limit / shouldFilter",
    type: "function / function / number / boolean",
    defaultValue: "built-in / none / none / true",
    description:
      "Customize local ranking, order, result caps, or bypass internal filtering when the app already owns the result window.",
  },
  {
    prop: "recentCommands / suggestedCommands / asyncCommands",
    type: "CommandPaletteCommand[]",
    defaultValue: "[]",
    description:
      "Additional source windows merged before base commands with stable data-source attributes and default Recent, Suggested, and Results groups.",
  },
  {
    prop: "loading / error / onRetry",
    type: "boolean / ReactNode / () => void",
    defaultValue: "false / undefined / undefined",
    description:
      "Async feedback states for remote search, including stale result messaging and accessible retry controls.",
  },
  {
    prop: "pages / pageStack / onPageStackChange",
    type: "CommandPalettePageDefinition[] / string[] / (stack, context) => void",
    defaultValue: "[] / uncontrolled / undefined",
    description:
      "Nested command pages for project switchers, resource browsers, and multistep command flows with Back handling and Escape navigation.",
  },
  {
    prop: "onCommandRun / closeOnRun",
    type: "(command, context) => void / boolean",
    defaultValue: "undefined / dialog default",
    description:
      "Central execution hook with source, query, page, stack, and close helpers. Individual commands can override close behavior.",
  },
  {
    prop: "motionPreset / reducedMotion",
    type: '"none" | "subtle" | "standard" | "expressive" / boolean',
    defaultValue: '"standard" / prefers-reduced-motion',
    description:
      "Controls result, selected-row, and page-stack choreography while preserving reduced-motion behavior.",
  },
  {
    prop: "CommandPaletteDialog",
    type: "Dialog composition",
    defaultValue: "closed",
    description:
      "Wraps Dialog primitives for global launchers, focus containment, restoration, and app-shell command surfaces.",
  },
];
