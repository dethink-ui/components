/**
 * Filter AST and field schema shared by every filter surface (chips, text
 * query, group editor, AI proposals, URL state and saved views).
 *
 * The AST is plain serializable JSON: no functions, dates or class instances.
 */

import type { ReactNode } from "react";

export type FilterCombinator = "and" | "or";

export type FilterDateUnit = "day" | "week" | "month" | "year";

/**
 * A calendar day. Relative days stay relative in the AST and resolve against
 * `now` when the filter runs, so saved filters never go stale.
 */
export type FilterDate =
  | { kind: "absolute"; /** ISO calendar day, YYYY-MM-DD. */ date: string }
  | {
      kind: "relative";
      /** Offset from today: -7 is seven units ago, 0 is today. */
      amount: number;
      unit: FilterDateUnit;
    };

/** A span of calendar units, e.g. "the last 7 days". */
export interface FilterDuration {
  amount: number;
  unit: FilterDateUnit;
}

/** Values a condition can hold. All are plain JSON. */
export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | [number, number]
  | FilterDate
  | [FilterDate, FilterDate]
  | FilterDuration;

export interface FilterCondition {
  type: "condition";
  /** Stable id used for React keys, diffing and AI patches. */
  id: string;
  /** Key of a field in the filter field schema. */
  field: string;
  /** Operator id registered for the field's type. */
  operator: string;
  value?: FilterValue;
  not?: boolean;
}

export interface FilterGroup {
  type: "group";
  id: string;
  combinator: FilterCombinator;
  not?: boolean;
  children: FilterNode[];
}

export type FilterNode = FilterCondition | FilterGroup;

/** The root of a filter is always a group. */
export type Filter = FilterGroup;

export type BuiltInFilterFieldType =
  "text" | "number" | "date" | "boolean" | "option" | "multiOption";

/** 0 is Sunday, 1 is Monday … 6 is Saturday. */
export type FilterWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Options for evaluating filters. Inject `now` for SSR-stable output. */
export interface FilterEvaluateOptions {
  now?: Date | number;
  /** IANA time zone for calendar days. Defaults to UTC. */
  timeZone?: string;
  /** First day of the week for "this week". Defaults to 1 (Monday). */
  weekStartsOn?: FilterWeekday;
}

/** Resolved evaluation context passed to operators. */
export interface FilterEvaluationContext {
  now: number;
  /** Today as an ISO calendar day in `timeZone`. */
  today: string;
  timeZone: string;
  weekStartsOn: FilterWeekday;
}

export interface FilterValueEditorRenderProps {
  field: FilterField;
  operator: FilterOperatorDefinition;
  value: FilterValue | undefined;
  onValueChange: (value: FilterValue | undefined) => void;
  /** Confirms the value and closes the editor. */
  onCommit: () => void;
}

/**
 * A field type: its operators, how values read in chips and descriptions,
 * and optionally its own value editor. Built-in types are strings; custom
 * types are definitions made with `defineFilterFieldType`.
 */
export interface FilterFieldTypeDefinition {
  id: string;
  operators: FilterOperatorDefinition[];
  defaultOperator?: string;
  /** Readable value text. Return one string per listed value. */
  formatValue?: (
    value: FilterValue,
    field: FilterField,
    options: { locale: string; operator?: FilterOperatorDefinition },
  ) => string[];
  /** Value editor for the chip popover. Defaults to a text box. */
  renderEditor?: (props: FilterValueEditorRenderProps) => ReactNode;
}

export type FilterFieldType =
  BuiltInFilterFieldType | FilterFieldTypeDefinition;

export interface FilterOption {
  value: string;
  label: string;
  /** Extra words matched by option search, e.g. synonyms. */
  keywords?: string[];
}

export interface FilterField<TData = unknown> {
  /** Unique key. Also the default row property read by the evaluator. */
  key: string;
  label: string;
  type: FilterFieldType;
  /** Options for `option` and `multiOption` fields. */
  options?: FilterOption[];
  /** Labels for `boolean` values. Default "Yes" and "No". */
  trueLabel?: string;
  falseLabel?: string;
  /** Number formatting for `number` values in chips. */
  numberFormat?: Intl.NumberFormatOptions;
  /** Restricts and orders the operators offered for this field. */
  operators?: string[];
  defaultOperator?: string;
  /** Reads the field value from a row. Defaults to `row[key]`. */
  accessor?(row: TData): unknown;
  /** Describes the field for people and for AI structured output. */
  description?: string;
  /** Example values that help AI resolve natural-language requests. */
  examples?: string[];
  placeholder?: string;
}

export type FilterFields<TData = unknown> = readonly FilterField<TData>[];

/**
 * How many values an operator takes: none, one, a list, or a `[from, to]`
 * pair.
 */
export type FilterOperatorArity = "none" | "single" | "multiple" | "range";

export interface FilterOperatorDefinition {
  id: string;
  /** Label used in operator menus and chips, e.g. "is any of". */
  label: string;
  /** Label used when exactly one value is selected, e.g. "is". */
  singleLabel?: string;
  arity: FilterOperatorArity;
  /**
   * Operators with the same kind share a value shape. Switching to an
   * operator of another kind clears the value.
   */
  valueKind?: string;
  /** Checks the value's shape. Invalid values are skipped and reported. */
  isValueValid?: (value: FilterValue) => boolean;
  /** Returns whether a row value matches the condition value. */
  evaluate: (
    rowValue: unknown,
    value: FilterValue | undefined,
    context: FilterEvaluationContext,
  ) => boolean;
}

export type FilterIssueCode =
  | "unknown-field"
  | "unknown-operator"
  | "missing-value"
  | "invalid-value"
  | "unknown-option"
  | "max-depth";

export interface FilterIssue {
  nodeId: string;
  code: FilterIssueCode;
  message: string;
}

export interface FilterDiff {
  added: FilterNode[];
  removed: FilterNode[];
  changed: { before: FilterNode; after: FilterNode }[];
}
