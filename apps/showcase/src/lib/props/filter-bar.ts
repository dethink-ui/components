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
    prop: "data",
    type: "TData[]",
    defaultValue: "—",
    description:
      "Rows to count against on the client. Enables facet counts in option and yes/no pickers, an announced result count and the empty-result Relax suggestion.",
  },
  {
    prop: "showImpact",
    type: "boolean",
    defaultValue: "false",
    description:
      "Shows how many rows each chip removes (−42) or, in an OR group, adds (+3), with a screen-reader description. Needs data.",
  },
  {
    prop: "rescue",
    type: "boolean",
    defaultValue: "true",
    description:
      "When nothing matches, names the most restrictive chip and offers Relax, which removes it as one undo step.",
  },
  {
    prop: "evaluateOptions",
    type: "{ now?, timeZone?, weekStartsOn? }",
    defaultValue: "mount time, UTC, Monday",
    description:
      "How relative dates resolve. Pass now for server-rendered pages so counts match on the client.",
  },
  {
    prop: "locale",
    type: "string",
    defaultValue: '"en-US"',
    description:
      "Locale for numbers, dates and calendars in chips and editors.",
  },
  {
    prop: "maxDepth",
    type: "number",
    defaultValue: "3",
    description:
      "Group levels allowed, counting the root as 1. Enforced the same way when adding, wrapping and validating.",
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
    type: '"text" | "number" | "date" | "boolean" | "option" | "multiOption" | FilterFieldTypeDefinition',
    defaultValue: "—",
    description:
      "Picks the operators, value text and editor. Dates compare calendar days; relative dates stay relative. Pass defineFilterFieldType(...) for your own type with its own operators and editor.",
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
    prop: "trueLabel / falseLabel / numberFormat",
    type: "string / string / Intl.NumberFormatOptions",
    defaultValue: '"Yes" / "No" / —',
    description: "Value text for boolean and number fields.",
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

export const filterGroupEditorProps: PropRow[] = [
  {
    prop: "groupId",
    type: "string",
    defaultValue: "root",
    description:
      "Group to edit. Group chips open the editor for their group; FilterBarAdvanced opens it for the whole filter.",
  },
  {
    prop: "useFilterState commands",
    type: "wrapInGroup · unwrapGroup · moveNode · shiftNode · setNegated · setCombinator",
    defaultValue: "—",
    description:
      "The same group operations for your own UI. Each is a single undo step.",
  },
];
