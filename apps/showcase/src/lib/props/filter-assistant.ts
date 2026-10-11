import type { PropRow } from "@/components/props-table";

export const useFilterAssistantProps: PropRow[] = [
  {
    prop: "fields / state",
    type: "FilterField[] / FilterState",
    defaultValue: "—",
    description:
      "The field schema (the allowlist) and the filter state proposals apply to.",
  },
  {
    prop: "resolve",
    type: "(request) => Promise<FilterAssistantResult | false>",
    defaultValue: "—",
    description:
      "Sends { prompt, current, schema, fields, answers, now, timeZone, signal } to your model and returns its answer. Return false to decline.",
  },
  {
    prop: "evaluateOptions",
    type: "{ now?, timeZone? }",
    defaultValue: "now, UTC",
    description: "Time context for relative dates like “last week”.",
  },
  {
    prop: "onPreviewCount",
    type: "(filter, signal) => Promise<number>",
    defaultValue: "—",
    description:
      "Counts rows for the filter the accepted changes would give, shown next to Apply.",
  },
  {
    prop: "onError",
    type: "(error) => void",
    defaultValue: "—",
    description:
      "Receives errors thrown by resolve. People only see a generic message.",
  },
  {
    prop: "returns",
    type: "FilterAssistantState",
    defaultValue: "—",
    description:
      "prompt, status, proposal, decisions and submit, abort, answer, setDecision, apply({ all }), discard.",
  },
];

export const filterAssistantProps: PropRow[] = [
  {
    prop: "assistant",
    type: "FilterAssistantState",
    defaultValue: "—",
    description: "State from useFilterAssistant.",
  },
  {
    prop: "actions",
    type: "ReactNode",
    defaultValue: "—",
    description:
      "Controls beside the prompt, such as a VoiceInput whose transcript you pass to assistant.submit.",
  },
  {
    prop: "showProposal",
    type: "boolean",
    defaultValue: "true",
    description:
      "Renders FilterProposal under the prompt. Set false to place FilterProposal yourself.",
  },
  {
    prop: "labels",
    type: "Partial<FilterAssistantLabels>",
    defaultValue: "English",
    description:
      "Every visible and accessible string, shared with FilterProposal.",
  },
];
