import type { PropRow } from "@/components/props-table";

export const filterBarProps: PropRow[] = [
  {
    prop: "fields",
    type: "FilterField[]",
    defaultValue: "—",
    description:
      "The fields people can filter by: key, label, type (text, option or multiOption), options, and an optional accessor.",
  },
  {
    prop: "value / defaultValue",
    type: "Filter",
    defaultValue: "empty group",
    description:
      "The filter tree. The root is always a group of conditions and nested groups, as plain JSON.",
  },
  {
    prop: "onValueChange",
    type: "(filter: Filter) => void",
    defaultValue: "—",
    description: "Called with the next filter after every change.",
  },
  {
    prop: "state",
    type: "FilterState",
    defaultValue: "—",
    description:
      "State from useFilterState, when you also need the filter outside the bar (for a table predicate, the URL or a count). Takes precedence over value props.",
  },
  {
    prop: "resultCount",
    type: "number",
    defaultValue: "—",
    description: "Number of matching rows, announced politely when it changes.",
  },
  {
    prop: "addShortcut",
    type: "string | false",
    defaultValue: "false",
    description:
      'A single key that opens the add menu when focus is not in a text field, for example "f".',
  },
  {
    prop: "collapseAfter",
    type: "number",
    defaultValue: "2",
    description:
      "On narrow containers, chips after this many collapse behind a +N more button.",
  },
  {
    prop: "size",
    type: '"sm" | "md"',
    defaultValue: '"md"',
    description: "Chip and action height.",
  },
  {
    prop: "labels",
    type: "Partial<FilterBarLabels>",
    defaultValue: "English",
    description:
      "Every visible and announced string, including operator labels, for localization.",
  },
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "chips + actions",
    description:
      "Compose FilterBarChips, FilterAddMenu, FilterBarClear and FilterBarUndo yourself.",
  },
];

export const filterFieldProps: PropRow[] = [
  {
    prop: "key / label",
    type: "string",
    defaultValue: "—",
    description:
      "Unique key (also the default row property) and display label.",
  },
  {
    prop: "type",
    type: '"text" | "option" | "multiOption"',
    defaultValue: "—",
    description:
      "Picks the operators and value editor. multiOption fields hold arrays on each row.",
  },
  {
    prop: "options",
    type: "{ value, label, keywords? }[]",
    defaultValue: "—",
    description: "Values for option fields. keywords add search synonyms.",
  },
  {
    prop: "operators / defaultOperator",
    type: "string[] / string",
    defaultValue: "all for the type",
    description:
      "Restrict and order the operators, and pick the one new chips start with.",
  },
  {
    prop: "accessor",
    type: "(row) => unknown",
    defaultValue: "row[key]",
    description: "Reads the value from a row for client-side evaluation.",
  },
  {
    prop: "description / examples",
    type: "string / string[]",
    defaultValue: "—",
    description:
      "Context for people and for the upcoming AI assistant, which uses it to resolve plain-language requests.",
  },
];

export const filterCoreProps: PropRow[] = [
  {
    prop: "createFilterPredicate(filter, fields)",
    type: "(row) => boolean",
    defaultValue: "—",
    description:
      "Compiles a filter for client-side filtering. Pass it to DataTable rowFilter. Incomplete chips are skipped.",
  },
  {
    prop: "describeFilter(filter, fields)",
    type: "string",
    defaultValue: "—",
    description:
      'One readable sentence, e.g. "Status is any of Open, Blocked, and Title contains "api"".',
  },
  {
    prop: "validateFilter(filter, fields)",
    type: "FilterIssue[]",
    defaultValue: "—",
    description:
      "Unknown fields, unavailable operators, missing or wrong-shaped values, and unknown options, with node ids.",
  },
  {
    prop: "diffFilter(before, after)",
    type: "{ added, removed, changed }",
    defaultValue: "—",
    description: "Node-level changes matched by id.",
  },
  {
    prop: "useFilterState(options)",
    type: "FilterState",
    defaultValue: "—",
    description:
      "Controlled or uncontrolled state with addNode, updateCondition, removeNode, setCombinator, clear, undo and redo.",
  },
];
