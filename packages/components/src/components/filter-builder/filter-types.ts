/**
 * Filter AST and field schema shared by every filter surface (chips, text
 * query, group editor, AI proposals, URL state and saved views).
 *
 * The AST is plain serializable JSON: no functions, dates or class instances.
 */

export type FilterCombinator = "and" | "or";

/** Values a condition can hold. Arrays hold option values. */
export type FilterValue = string | number | boolean | string[];

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

export type FilterFieldType = "text" | "option" | "multiOption";

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

/** How many values an operator takes. */
export type FilterOperatorArity = "none" | "single" | "multiple";

export interface FilterOperatorDefinition {
  id: string;
  /** Label used in operator menus and chips, e.g. "is any of". */
  label: string;
  /** Label used when exactly one value is selected, e.g. "is". */
  singleLabel?: string;
  arity: FilterOperatorArity;
  /** Returns whether a row value matches the condition value. */
  evaluate: (rowValue: unknown, value: FilterValue | undefined) => boolean;
}

export type FilterIssueCode =
  | "unknown-field"
  | "unknown-operator"
  | "missing-value"
  | "invalid-value"
  | "unknown-option";

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
