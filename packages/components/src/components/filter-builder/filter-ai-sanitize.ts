import { DEFAULT_FILTER_MAX_DEPTH } from "./filter-commands";
import {
  createFilter,
  createFilterCondition,
  getFilterOperator,
  isFilterValueUsable,
} from "./filter-model";
import type {
  Filter,
  FilterField,
  FilterFields,
  FilterNode,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

/**
 * The model's answer is untrusted input. Nothing from it is used as-is: the
 * filter is rebuilt from scratch against the field allowlist, text is
 * stripped of control characters and clamped, and counts are capped.
 */

/** What a `resolve` callback returns; every property is re-validated. */
export interface FilterAssistantResult {
  /** The complete filter the model proposes (see `toFilterJsonSchema`). */
  filter?: unknown;
  clarifications?: unknown;
  unresolved?: unknown;
  message?: unknown;
}

export interface FilterClarification {
  id: string;
  question: string;
  choices: { id: string; label: string }[];
}

export type FilterUnresolvedReason =
  | "unknown-field"
  | "unknown-operator"
  | "unknown-value"
  | "max-depth"
  | "too-many-conditions"
  | "model";

export interface FilterUnresolved {
  text: string;
  reason: FilterUnresolvedReason;
}

export interface SanitizedFilterAssistantResult {
  /** The rebuilt filter, with fresh ids. Undefined when none was given. */
  filter?: Filter;
  /** Ids of conditions whose value is missing or couldn't be used. */
  needsInput: string[];
  clarifications: FilterClarification[];
  unresolved: FilterUnresolved[];
  message?: string;
}

export interface SanitizeFilterAssistantOptions {
  maxDepth?: number;
  /** Conditions kept from one answer. Defaults to 40. */
  maxConditions?: number;
  /** Characters kept from any model string. Defaults to 200. */
  maxText?: number;
}

const MAX_CLARIFICATIONS = 3;
const MAX_CHOICES = 6;
const MAX_UNRESOLVED = 10;
const MAX_CHILDREN = 40;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Own data properties only: never prototype keys, and never getters, which
 * could run code or throw.
 */
function read(record: Record<string, unknown>, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(record, key);

  return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

/** Text for a primitive; empty for anything else (no toString calls). */
function textOf(value: unknown) {
  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
    ? String(value)
    : "";
}

/** A single line of plain text: no control characters, clamped. */
export function sanitizeFilterText(value: unknown, maxText = 200) {
  if (typeof value !== "string") {
    return "";
  }

  // eslint-disable-next-line no-control-regex -- Stripping control characters.
  const clean = value.replace(/[\u0000-\u001f\u007f-\u009f]+/g, " ").trim();

  return clean.length > maxText ? `${clean.slice(0, maxText - 1)}…` : clean;
}

function findField(fields: FilterFields, raw: unknown) {
  if (typeof raw !== "string") {
    return undefined;
  }

  const lower = raw.toLowerCase();

  return (
    fields.find((field) => field.key === raw) ??
    fields.find(
      (field) =>
        field.key.toLowerCase() === lower ||
        field.label.toLowerCase() === lower,
    )
  );
}

/** Plain JSON data, depth-limited; anything else is dropped. */
function toPlain(value: unknown, maxText: number, depth = 0): unknown {
  if (depth > 4) {
    return undefined;
  }

  if (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeFilterText(value, maxText);
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_CHILDREN)
      .map((item) => toPlain(item, maxText, depth + 1));
  }

  if (isRecord(value)) {
    const plain: Record<string, unknown> = {};

    for (const key of Object.keys(value)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }

      plain[key] = toPlain(read(value, key), maxText, depth + 1);
    }

    return plain;
  }

  return undefined;
}

interface Context {
  fields: FilterFields;
  maxText: number;
  maxConditions: number;
  conditions: number;
  needsInput: string[];
  unresolved: FilterUnresolved[];
}

function note(context: Context, text: string, reason: FilterUnresolvedReason) {
  const clean = sanitizeFilterText(text, context.maxText);

  if (
    clean &&
    context.unresolved.length < MAX_UNRESOLVED &&
    !context.unresolved.some(
      (item) => item.text === clean && item.reason === reason,
    )
  ) {
    context.unresolved.push({ text: clean, reason });
  }
}

function listValue(
  raw: unknown,
  field: FilterField,
  context: Context,
): string[] | undefined {
  const items = (Array.isArray(raw) ? raw : [raw]).slice(0, MAX_CHILDREN);
  const values: string[] = [];

  for (const item of items) {
    if (typeof item !== "string" && typeof item !== "number") {
      continue;
    }

    const text = sanitizeFilterText(textOf(item), context.maxText);

    if (!text) {
      continue;
    }

    if (!field.options?.length) {
      values.push(text);
      continue;
    }

    const lower = text.toLowerCase();
    const option =
      field.options.find((candidate) => candidate.value === text) ??
      field.options.find(
        (candidate) =>
          candidate.value.toLowerCase() === lower ||
          candidate.label.toLowerCase() === lower,
      );

    if (option) {
      if (!values.includes(option.value)) {
        values.push(option.value);
      }
    } else {
      note(context, `${field.label}: ${text}`, "unknown-value");
    }
  }

  return values.length > 0 ? values : undefined;
}

function conditionValue(
  raw: unknown,
  field: FilterField,
  operator: FilterOperatorDefinition,
  context: Context,
): FilterValue | undefined {
  if (operator.arity === "none") {
    return undefined;
  }

  if (operator.valueKind === "list") {
    return listValue(raw, field, context);
  }

  const value = toPlain(raw, context.maxText);

  return value !== undefined &&
    isFilterValueUsable(operator, value as FilterValue)
    ? (value as FilterValue)
    : undefined;
}

function sanitizeCondition(
  raw: Record<string, unknown>,
  context: Context,
): FilterNode | undefined {
  const field = findField(context.fields, read(raw, "field"));

  if (!field) {
    note(context, textOf(read(raw, "field")), "unknown-field");
    return undefined;
  }

  const operatorId = read(raw, "operator");
  const operator =
    typeof operatorId === "string"
      ? getFilterOperator(field, operatorId)
      : undefined;

  if (!operator) {
    note(context, `${field.label} ${textOf(operatorId)}`, "unknown-operator");
    return undefined;
  }

  if (context.conditions >= context.maxConditions) {
    note(context, field.label, "too-many-conditions");
    return undefined;
  }

  context.conditions += 1;

  const value = conditionValue(read(raw, "value"), field, operator, context);
  const condition = createFilterCondition({
    field: field.key,
    operator: operator.id,
    value,
    not: read(raw, "not") === true,
  });

  if (!isFilterValueUsable(operator, value)) {
    context.needsInput.push(condition.id);
  }

  return condition;
}

function sanitizeNode(
  raw: unknown,
  depth: number,
  maxDepth: number,
  context: Context,
): FilterNode | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }

  if (read(raw, "type") !== "group" && !Array.isArray(read(raw, "children"))) {
    return sanitizeCondition(raw, context);
  }

  if (depth > maxDepth) {
    note(context, "A nested group", "max-depth");
    return undefined;
  }

  const children = read(raw, "children");
  const nodes = (Array.isArray(children) ? children : [])
    .slice(0, MAX_CHILDREN)
    .flatMap((child) => {
      const node = sanitizeNode(child, depth + 1, maxDepth, context);

      return node ? [node] : [];
    });

  return createFilter({
    combinator: read(raw, "combinator") === "or" ? "or" : "and",
    not: read(raw, "not") === true,
    children: nodes,
  });
}

/**
 * Validates and rebuilds a model's answer against the field allowlist.
 * Unknown fields and operators are dropped into `unresolved`; option values
 * that match nothing are dropped too, and a condition left without a usable
 * value is kept as "needs input" so the person can fill it in.
 */
export function sanitizeFilterAssistantResult<TData>(
  raw: unknown,
  fields: FilterFields<TData>,
  {
    maxConditions = 40,
    maxDepth = DEFAULT_FILTER_MAX_DEPTH,
    maxText = 200,
  }: SanitizeFilterAssistantOptions = {},
): SanitizedFilterAssistantResult {
  const context: Context = {
    fields: fields as FilterFields,
    maxText,
    maxConditions,
    conditions: 0,
    needsInput: [],
    unresolved: [],
  };
  const result = isRecord(raw) ? raw : {};
  const rawFilter = read(result, "filter");
  let filter: Filter | undefined;

  if (isRecord(rawFilter)) {
    const node = sanitizeNode(rawFilter, 1, maxDepth, context);

    filter =
      node?.type === "group"
        ? node
        : createFilter({ children: node ? [node] : [] });
  }

  const rawUnresolved = read(result, "unresolved");

  for (const item of Array.isArray(rawUnresolved) ? rawUnresolved : []) {
    note(
      context,
      isRecord(item) ? textOf(read(item, "text")) : textOf(item),
      "model",
    );
  }

  const rawClarifications = read(result, "clarifications");
  const clarifications = (
    Array.isArray(rawClarifications) ? rawClarifications : []
  )
    .slice(0, MAX_CLARIFICATIONS)
    .flatMap((item, index): FilterClarification[] => {
      if (!isRecord(item)) {
        return [];
      }

      const question = sanitizeFilterText(read(item, "question"), maxText);
      const rawChoices = read(item, "choices");
      const choices = (Array.isArray(rawChoices) ? rawChoices : [])
        .slice(0, MAX_CHOICES)
        .flatMap((choice, choiceIndex) => {
          const label = sanitizeFilterText(
            isRecord(choice) ? read(choice, "label") : choice,
            maxText,
          );
          // Ids come from position, never from the model: they end up in
          // DOM ids and keys, so they must be unique and safe.
          return label ? [{ id: `choice-${choiceIndex + 1}`, label }] : [];
        });

      return question && choices.length >= 2
        ? [
            {
              id: `clarification-${index + 1}`,
              question,
              choices,
            },
          ]
        : [];
    });

  const message = sanitizeFilterText(read(result, "message"), maxText);

  return {
    ...(filter ? { filter } : {}),
    needsInput: context.needsInput,
    clarifications,
    unresolved: context.unresolved,
    ...(message ? { message } : {}),
  };
}
