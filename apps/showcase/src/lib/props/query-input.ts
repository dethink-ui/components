import type { PropRow } from "@/components/props-table";

export const queryInputProps: PropRow[] = [
  {
    prop: "fields",
    type: "FilterField[]",
    defaultValue: "—",
    description:
      "The same field schema as FilterBar. Field keys are what people type before the colon.",
  },
  {
    prop: "state",
    type: "FilterState",
    defaultValue: "—",
    description:
      "State from useFilterState. Pass the same state to a FilterBar to keep the text and the chips in sync.",
  },
  {
    prop: "value / defaultValue / onValueChange",
    type: "Filter",
    defaultValue: "empty group",
    description:
      "Controlled or uncontrolled filter when you don't pass state. onValueChange runs once per commit.",
  },
  {
    prop: "defaultField",
    type: "string",
    defaultValue: "first text field",
    description:
      "Field that plain words and quoted phrases search, with its default operator.",
  },
  {
    prop: "maxDepth",
    type: "number",
    defaultValue: "3",
    description:
      "Group levels allowed, counting the root as 1. Deeper parentheses are an error.",
  },
  {
    prop: "labels",
    type: "Partial<QueryInputLabels>",
    defaultValue: "English",
    description:
      "Accessible names, placeholder, suggestion kinds and an error formatter that receives the error code and range.",
  },
  {
    prop: "onQueryError",
    type: "(error: FilterQueryError) => void",
    defaultValue: "—",
    description:
      "Called when a commit fails, with { code, message, start, end }.",
  },
  {
    prop: "controlSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    description: "Matches the Input sizes.",
  },
];

export const filterQueryCoreProps: PropRow[] = [
  {
    prop: "parseFilterQuery(text, fields, options?)",
    type: "{ ok: true; filter } | { ok: false; error }",
    defaultValue: "—",
    description:
      "Parses text into a normalized filter. Errors carry a code, a message and the exact character range.",
  },
  {
    prop: "printFilterQuery(filter, fields, options?)",
    type: "string",
    defaultValue: "—",
    description:
      "Canonical text for a filter. Parsing it gives back normalizeFilter(filter). Incomplete conditions are left out.",
  },
  {
    prop: "getFilterQuerySuggestions(text, caret, fields)",
    type: "FilterQuerySuggestion[]",
    defaultValue: "—",
    description:
      "Field, operator and value completions at the caret, each with the range it replaces.",
  },
  {
    prop: "getFilterQuerySegments(text, fields)",
    type: "FilterQuerySegment[]",
    defaultValue: "—",
    description: "Highlight ranges for your own query UI.",
  },
  {
    prop: "reconcileFilterIds(next, previous)",
    type: "Filter",
    defaultValue: "—",
    description:
      "Reuses ids of unchanged nodes so a rebuilt filter keeps chip identity.",
  },
];

export const filterQuerySyntax: { syntax: string; meaning: string }[] = [
  { syntax: "status:open,blocked", meaning: "Status is any of Open, Blocked" },
  { syntax: "-status:done", meaning: "Not (Status is Done)" },
  { syntax: "status:!done", meaning: "Status is none of Done" },
  { syntax: "labels:&bug,api", meaning: "Labels include all of Bug, API" },
  {
    syntax: "estimate:>=5  estimate:!=3",
    meaning: "Comparisons: > >= < <= !=",
  },
  { syntax: "estimate:3..8", meaning: "Between 3 and 8, inclusive" },
  { syntax: "created:>-7d", meaning: "Created after 7 days ago" },
  { syntax: "created:2026-09-01..today", meaning: "Created between two days" },
  { syntax: "created:last:30d", meaning: "Created in the last 30 days" },
  { syntax: "created:in:0w", meaning: "Created this week (-1m is last month)" },
  { syntax: "customer:yes", meaning: "Yes/No fields take yes or no" },
  { syntax: 'title:^api  title:="exact title"', meaning: "Starts with, is" },
  {
    syntax: "assignee:empty  assignee:!empty",
    meaning: "Is empty, is not empty",
  },
  {
    syntax: 'login "rate limit"',
    meaning: "Plain words search the default field",
  },
  { syntax: "a b OR c", meaning: "(a AND b) OR c: AND binds tighter" },
  { syntax: "a (b OR c)", meaning: "Parentheses group, up to 3 levels" },
  { syntax: "estimate:gte:5", meaning: "Any operator by id, for custom ones" },
];
