import { DEFAULT_FILTER_MAX_DEPTH } from "./filter-commands";
import { resolveFilterFieldType } from "./filter-field-types";
import { getFilterOperators } from "./filter-model";
import type {
  FilterField,
  FilterFields,
  FilterOperatorDefinition,
} from "./filter-types";

/**
 * JSON Schema for AI structured output, built from the field schema. The
 * model answers with `{ filter?, clarifications?, unresolved?, message? }`;
 * the filter's conditions are constrained per field to that field's
 * operators and value shapes. Everything the model returns is still
 * validated and sanitized before it can become a proposal.
 */

export type FilterJsonSchema = Record<string, unknown>;

/** A compact, model-friendly description of one field. */
export interface FilterFieldSummary {
  key: string;
  label: string;
  type: string;
  description?: string;
  examples?: string[];
  operators: { id: string; label: string; takesValue: boolean }[];
  /** Allowed values for option fields, with their labels. */
  options?: { value: string; label: string }[];
}

const UNITS = ["day", "week", "month", "year"];

const dateSchema = {
  anyOf: [
    {
      type: "object",
      properties: {
        kind: { const: "absolute" },
        date: {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "Calendar day, YYYY-MM-DD.",
        },
      },
      required: ["kind", "date"],
      additionalProperties: false,
    },
    {
      type: "object",
      properties: {
        kind: { const: "relative" },
        amount: {
          type: "integer",
          description: "Offset from today: -7 is seven units ago, 0 is today.",
        },
        unit: { enum: UNITS },
      },
      required: ["kind", "amount", "unit"],
      additionalProperties: false,
    },
  ],
};

export function getFilterFieldSummaries<TData>(
  fields: FilterFields<TData>,
): FilterFieldSummary[] {
  return fields.map((field) => {
    const type = resolveFilterFieldType(field as FilterField);

    return {
      key: field.key,
      label: field.label,
      type: typeof field.type === "string" ? field.type : type.id,
      ...(field.description ? { description: field.description } : {}),
      ...(field.examples?.length ? { examples: [...field.examples] } : {}),
      operators: getFilterOperators(field as FilterField).map((operator) => ({
        id: operator.id,
        label: operator.label,
        takesValue: operator.arity !== "none",
      })),
      ...(field.options?.length
        ? {
            options: field.options.map(({ label, value }) => ({
              value,
              label,
            })),
          }
        : {}),
    };
  });
}

function valueSchema(
  field: FilterField,
  operator: FilterOperatorDefinition,
): Record<string, unknown> | undefined {
  if (operator.arity === "none") {
    return undefined;
  }

  const options = field.options?.map((option) => option.value);
  const optionHint = field.options?.length
    ? `One of: ${field.options
        .map((option) => `${option.value} (${option.label})`)
        .join(", ")}.`
    : undefined;

  switch (operator.valueKind) {
    case "text":
      return { type: "string" };
    case "list":
      // Strings, not an enum: a value the model can't match becomes a
      // "needs input" chip instead of a wrong guess.
      return {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        ...(optionHint ? { description: optionHint } : {}),
        ...(options?.length ? { examples: [options.slice(0, 2)] } : {}),
      };
    case "number":
      return { type: "number" };
    case "numberRange":
      return {
        type: "array",
        items: { type: "number" },
        minItems: 2,
        maxItems: 2,
      };
    case "date":
      return { $ref: "#/$defs/date" };
    case "dateRange":
      return {
        type: "array",
        items: { $ref: "#/$defs/date" },
        minItems: 2,
        maxItems: 2,
      };
    case "duration":
      return {
        type: "object",
        properties: {
          amount: { type: "integer", minimum: 1 },
          unit: { enum: UNITS },
        },
        required: ["amount", "unit"],
        additionalProperties: false,
      };
    case "period":
      return {
        type: "object",
        description: "A whole period: amount 0 is this week/month/year.",
        properties: {
          kind: { const: "relative" },
          amount: { type: "integer" },
          unit: { enum: ["week", "month", "year"] },
        },
        required: ["kind", "amount", "unit"],
        additionalProperties: false,
      };
    case "boolean":
      return { type: "boolean" };
    default:
      return operator.arity === "multiple"
        ? { type: "array", items: { type: "string" }, minItems: 1 }
        : operator.arity === "range"
          ? {
              type: "array",
              items: { type: "number" },
              minItems: 2,
              maxItems: 2,
            }
          : { type: "string" };
  }
}

function conditionSchemas(field: FilterField) {
  return getFilterOperators(field).map((operator) => {
    const value = valueSchema(field, operator);

    return {
      type: "object",
      description: `${field.label} ${operator.label}${
        field.description ? `. ${field.description}` : ""
      }`,
      properties: {
        type: { const: "condition" },
        field: { const: field.key },
        operator: { const: operator.id },
        ...(value ? { value } : {}),
        not: { type: "boolean" },
      },
      required: ["type", "field", "operator", ...(value ? ["value"] : [])],
      additionalProperties: false,
    };
  });
}

/**
 * Structured-output schema for a filter assistant's answer. Nesting is
 * unrolled to `maxDepth` group levels (default 3) so the schema has no
 * recursion, which some providers don't support.
 */
export function toFilterJsonSchema<TData>(
  fields: FilterFields<TData>,
  { maxDepth = DEFAULT_FILTER_MAX_DEPTH }: { maxDepth?: number } = {},
): FilterJsonSchema {
  const conditions = (fields as FilterFields).flatMap(conditionSchemas);
  const defs: Record<string, unknown> = {
    date: dateSchema,
    condition: { anyOf: conditions },
  };

  // group1 is the root; groupN may hold groups down to maxDepth.
  for (let level = maxDepth; level >= 1; level -= 1) {
    const items =
      level < maxDepth
        ? {
            anyOf: [
              { $ref: "#/$defs/condition" },
              { $ref: `#/$defs/group${level + 1}` },
            ],
          }
        : { $ref: "#/$defs/condition" };

    defs[`group${level}`] = {
      type: "object",
      properties: {
        type: { const: "group" },
        combinator: { enum: ["and", "or"] },
        not: { type: "boolean" },
        children: { type: "array", items },
      },
      required: ["type", "combinator", "children"],
      additionalProperties: false,
    };
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      filter: {
        $ref: "#/$defs/group1",
        description:
          "The complete filter that answers the request, replacing the current one. Omit when you need a clarification.",
      },
      clarifications: {
        type: "array",
        description:
          "Questions to ask instead of guessing, each with short choices.",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            question: { type: "string" },
            choices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                },
                required: ["id", "label"],
                additionalProperties: false,
              },
              minItems: 2,
            },
          },
          required: ["id", "question", "choices"],
          additionalProperties: false,
        },
      },
      unresolved: {
        type: "array",
        description: "Parts of the request no field or value can express.",
        items: {
          type: "object",
          properties: {
            text: { type: "string" },
            reason: { type: "string" },
          },
          required: ["text"],
          additionalProperties: false,
        },
      },
      message: {
        type: "string",
        description: "One short sentence for the user, if needed.",
      },
    },
    additionalProperties: false,
    $defs: defs,
  };
}
