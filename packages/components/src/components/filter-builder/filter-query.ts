import { DEFAULT_FILTER_MAX_DEPTH, normalizeFilter } from "./filter-commands";
import {
  createFilter,
  createFilterCondition,
  getDefaultFilterOperator,
  getFilterField,
  getFilterOperator,
  getFilterOperators,
  isFilterValueUsable,
} from "./filter-model";
import {
  lexFilterQuery,
  splitFilterQueryTerm,
  type FilterQuerySpan,
  type FilterQueryToken,
} from "./filter-query-lexer";
import {
  parseFilterQueryValue,
  printFilterQueryValue,
  type FilterQueryError,
  type FilterQueryErrorCode,
} from "./filter-query-values";
import type {
  Filter,
  FilterCondition,
  FilterField,
  FilterFields,
  FilterNode,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

export interface FilterQueryOptions {
  /**
   * Field that plain words search, with its default operator. Defaults to
   * the first `text` field.
   */
  defaultField?: string;
  /** Group levels allowed, counting the root as 1. Defaults to 3. */
  maxDepth?: number;
}

export type FilterQueryParseResult =
  { ok: true; filter: Filter } | { ok: false; error: FilterQueryError };

class QueryError extends Error {
  constructor(readonly detail: FilterQueryError) {
    super(detail.message);
  }
}

function raise(
  code: FilterQueryErrorCode,
  message: string,
  span: FilterQuerySpan,
): never {
  throw new QueryError({ code, message, start: span.start, end: span.end });
}

/** The field plain words search. */
export function getFilterQueryDefaultField<TData>(
  fields: FilterFields<TData>,
  defaultField?: string,
) {
  return defaultField === undefined
    ? fields.find((field) => field.type === "text")
    : getFilterField(fields, defaultField);
}

/** Field for `key`, matching exactly and then ignoring case. */
export function findFilterQueryField<TData>(
  fields: FilterFields<TData>,
  key: string,
) {
  const lower = key.toLowerCase();

  return (
    getFilterField(fields, key) ??
    fields.find((field) => field.key.toLowerCase() === lower)
  );
}

/** How an operator is written after `field:`. */
export function getFilterQueryToken(operator: FilterOperatorDefinition) {
  return operator.token ?? `${operator.id}:`;
}

/**
 * Operators that could start `text`, longest token first, each followed by
 * its `id:` spelling as a fallback.
 */
export function matchFilterQueryOperators(
  field: FilterField,
  text: string,
): { operator: FilterOperatorDefinition; token: string }[] {
  const operators = getFilterOperators(field);
  const candidates = [
    ...operators.map((operator) => ({
      operator,
      token: getFilterQueryToken(operator),
    })),
    ...operators.map((operator) => ({ operator, token: `${operator.id}:` })),
  ];

  return candidates
    .filter(({ token }) => text.startsWith(token))
    .sort((a, b) => b.token.length - a.token.length);
}

function parseCondition(
  token: FilterQueryToken,
  fields: FilterFields,
  options: FilterQueryOptions,
): FilterCondition {
  const parts = splitFilterQueryTerm(token);
  let field: FilterField | undefined;
  let candidates: { operator: FilterOperatorDefinition; token: string }[];

  if (parts.field) {
    field = findFilterQueryField(fields, parts.field.text);

    if (!field) {
      raise(
        "unknown-field",
        `Unknown field "${parts.field.text}"`,
        parts.field,
      );
    }

    candidates = matchFilterQueryOperators(field, parts.rest.text);
  } else {
    field = getFilterQueryDefaultField(fields, options.defaultField);

    const operator = field ? getDefaultFilterOperator(field) : undefined;

    if (!field || !operator) {
      raise(
        "no-default-field",
        "Write field:value, there is no field for plain words",
        token,
      );
    }

    candidates = [{ operator, token: "" }];
  }

  let firstError: FilterQueryError | undefined;

  for (const candidate of candidates) {
    const text = parts.rest.text.slice(candidate.token.length);
    const result = parseFilterQueryValue(
      text,
      parts.rest.start + candidate.token.length,
      field,
      candidate.operator,
    );

    if (result.ok) {
      return createFilterCondition({
        field: field.key,
        operator: candidate.operator.id,
        value: result.value,
      });
    }

    firstError ??= result.error;
  }

  if (firstError) {
    throw new QueryError(firstError);
  }

  return raise(
    "unknown-operator",
    `Unknown operator for ${field.label}`,
    parts.rest,
  );
}

function toggleNot<TNode extends FilterNode>(node: TNode): TNode {
  const { not, ...rest } = node;

  return (not ? rest : { ...rest, not: true }) as TNode;
}

/**
 * Parses a text query into a filter. `AND` binds tighter than `OR`, and
 * terms side by side are ANDed: `a b OR c` is `(a AND b) OR c`. The result
 * is normalized (see `normalizeFilter`). Errors carry the exact character
 * range to underline; an invalid query never produces a filter.
 */
export function parseFilterQuery<TData>(
  text: string,
  fields: FilterFields<TData>,
  options: FilterQueryOptions = {},
): FilterQueryParseResult {
  const { tokens, unclosedQuote } = lexFilterQuery(text);
  const spans = new Map<string, FilterQuerySpan>();
  let index = 0;

  const peek = () => tokens[index];
  const startsOperand = (token: FilterQueryToken | undefined) =>
    token?.kind === "term" || token?.kind === "not" || token?.kind === "lparen";

  const group = (
    combinator: "and" | "or",
    children: FilterNode[],
  ): FilterNode => {
    const [only] = children;

    if (children.length === 1 && only) {
      return only;
    }

    const node = createFilter({ combinator, children });
    const first = spans.get(children[0]?.id ?? "");
    const last = spans.get(children.at(-1)?.id ?? "");

    if (first && last) {
      spans.set(node.id, { start: first.start, end: last.end });
    }

    return node;
  };

  const parseOr = (): FilterNode => {
    const children = [parseAnd()];

    while (peek()?.kind === "or") {
      const keyword = peek() as FilterQueryToken;

      index += 1;

      if (!startsOperand(peek())) {
        raise("missing-operand", "Add a filter after OR", keyword);
      }

      children.push(parseAnd());
    }

    return group("or", children);
  };

  const parseAnd = (): FilterNode => {
    const children = [parseUnary()];

    for (;;) {
      const next = peek();

      if (next?.kind === "and") {
        index += 1;

        if (!startsOperand(peek())) {
          raise("missing-operand", "Add a filter after AND", next);
        }
      } else if (!startsOperand(next)) {
        break;
      }

      children.push(parseUnary());
    }

    return group("and", children);
  };

  const parseUnary = (): FilterNode => {
    const token = peek();

    if (token?.kind === "not") {
      index += 1;

      if (!startsOperand(peek())) {
        raise("missing-operand", "Add a filter after -", token);
      }

      const node = toggleNot(parseUnary());
      const span = spans.get(node.id);

      spans.set(node.id, { start: token.start, end: span?.end ?? token.end });

      return node;
    }

    return parsePrimary();
  };

  const parsePrimary = (): FilterNode => {
    const token = peek();

    if (!token) {
      return raise("missing-operand", "Add a filter", {
        start: text.length,
        end: text.length,
      });
    }

    if (token.kind === "or" || token.kind === "and") {
      raise("missing-operand", `Add a filter before ${token.text}`, token);
    }

    if (token.kind === "rparen") {
      raise("unexpected-close", "Unexpected )", token);
    }

    index += 1;

    if (token.kind === "lparen") {
      if (peek()?.kind === "rparen") {
        raise("empty-group", "Empty parentheses", {
          start: token.start,
          end: (peek() as FilterQueryToken).end,
        });
      }

      const node = parseOr();
      const close = peek();

      if (close?.kind !== "rparen") {
        raise("unclosed-group", "Close the parenthesis", token);
      }

      index += 1;
      spans.set(node.id, { start: token.start, end: close.end });

      return node;
    }

    const condition = parseCondition(token, fields as FilterFields, options);

    spans.set(condition.id, token);

    return condition;
  };

  try {
    if (unclosedQuote !== undefined) {
      raise("unclosed-quote", "Close the quote", {
        start: unclosedQuote,
        end: text.length,
      });
    }

    let root: Filter = createFilter();

    if (tokens.length > 0) {
      const node = parseOr();
      const extra = peek();

      if (extra) {
        raise("unexpected-close", "Unexpected )", extra);
      }

      root =
        node.type === "group"
          ? node
          : createFilter({ id: root.id, children: [node] });
    }

    const filter = normalizeFilter(root);

    checkDepth(filter, options.maxDepth ?? DEFAULT_FILTER_MAX_DEPTH, spans);

    return { ok: true, filter };
  } catch (error) {
    if (error instanceof QueryError) {
      return { ok: false, error: error.detail };
    }

    throw error;
  }
}

function checkDepth(
  filter: Filter,
  maxDepth: number,
  spans: Map<string, FilterQuerySpan>,
) {
  const visit = (node: FilterNode, depth: number) => {
    if (node.type !== "group") {
      return;
    }

    if (depth > maxDepth) {
      raise(
        "max-depth",
        `Groups can nest ${maxDepth} levels deep`,
        spans.get(node.id) ?? { start: 0, end: 0 },
      );
    }

    for (const child of node.children) {
      visit(child, depth + 1);
    }
  };

  visit(filter, 1);
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null ||
    Array.isArray(a) !== Array.isArray(b)
  ) {
    return false;
  }

  const aKeys = Object.keys(a).filter(
    (key) => (a as Record<string, unknown>)[key] !== undefined,
  );
  const bKeys = Object.keys(b).filter(
    (key) => (b as Record<string, unknown>)[key] !== undefined,
  );

  return (
    aKeys.length === bKeys.length &&
    aKeys.every((key) =>
      valuesEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      ),
    )
  );
}

function printCondition(
  condition: FilterCondition,
  fields: FilterFields,
  options: FilterQueryOptions,
) {
  const field = getFilterField(fields, condition.field);
  const operator = field
    ? getFilterOperator(field, condition.operator)
    : undefined;

  if (!field || !operator || !isFilterValueUsable(operator, condition.value)) {
    return "";
  }

  const value = (quote: boolean) =>
    printFilterQueryValue(condition.value, operator, quote);
  const defaultField = getFilterQueryDefaultField(fields, options.defaultField);
  const bare =
    defaultField?.key === field.key &&
    getDefaultFilterOperator(field)?.id === operator.id;
  const tokens = [getFilterQueryToken(operator), `${operator.id}:`];
  const forms = [
    ...(bare ? [value(false), value(true)] : []),
    ...tokens.flatMap((token) => [
      `${field.key}:${token}${value(false)}`,
      `${field.key}:${token}${value(true)}`,
    ]),
  ];
  // The first spelling that reads back as the same condition. Bare words and
  // unquoted values can collide with keywords or tokens ("OR", "empty").
  const form =
    forms.find((candidate) => {
      const parsed = parseFilterQuery(candidate, fields, options);
      const [only, ...rest] = parsed.ok ? parsed.filter.children : [];

      return (
        rest.length === 0 &&
        only?.type === "condition" &&
        !only.not &&
        only.field === field.key &&
        only.operator === operator.id &&
        valuesEqual(only.value, condition.value as FilterValue)
      );
    }) ?? forms.at(-1);

  return `${condition.not ? "-" : ""}${form}`;
}

/**
 * Canonical text for a filter: `status:open,blocked created:>-7d
 * (assignee:me OR label:bug)`. The filter is normalized first and every
 * nested group is parenthesized, so
 * `parseFilterQuery(printFilterQuery(filter))` gives back
 * `normalizeFilter(filter)`. Incomplete conditions (no value yet) and
 * conditions on unknown fields are left out.
 */
export function printFilterQuery<TData>(
  filter: FilterNode,
  fields: FilterFields<TData>,
  options: FilterQueryOptions = {},
): string {
  const schema = fields as FilterFields;

  const printChildren = (group: Extract<FilterNode, { type: "group" }>) =>
    group.children
      .map(printNode)
      .filter(Boolean)
      .join(group.combinator === "or" ? " OR " : " ");

  const printNode = (node: FilterNode): string => {
    if (node.type === "condition") {
      return printCondition(node, schema, options);
    }

    const inner = printChildren(node);

    return inner ? `${node.not ? "-" : ""}(${inner})` : "";
  };

  if (filter.type === "condition") {
    return printNode(filter);
  }

  // Canonical shape first, so a lone group under the root prints without
  // parentheses and equal filters print the same text.
  const root = normalizeFilter(filter);
  const inner = printChildren(root);

  return root.not && inner ? `-(${inner})` : inner;
}
