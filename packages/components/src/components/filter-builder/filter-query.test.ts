import { describe, expect, it } from "vitest";
import {
  createFilter,
  createFilterCondition,
  parseFilterQuery,
  printFilterQuery,
  type FilterQueryError,
} from ".";
import { queryFields, stripIds } from "./filter-query.fixtures";

function parse(text: string) {
  const result = parseFilterQuery(text, queryFields);

  if (!result.ok) {
    throw new Error(`${result.error.message} at ${result.error.start}`);
  }

  return stripIds(result.filter);
}

function error(text: string): FilterQueryError {
  const result = parseFilterQuery(text, queryFields);

  if (result.ok) {
    throw new Error(`"${text}" parsed`);
  }

  return result.error;
}

/** The underlined text of an error. */
function underlined(text: string) {
  const { start, end } = error(text);

  return text.slice(start, end);
}

const condition = (
  field: string,
  operator: string,
  value?: unknown,
  not?: boolean,
) => ({
  type: "condition",
  field,
  operator,
  ...(value === undefined ? {} : { value }),
  ...(not ? { not } : {}),
});

describe("parseFilterQuery", () => {
  it("reads field:value terms with each type's syntax", () => {
    expect(
      parse(
        'status:open,blocked labels:&bug,ui amount:5..10 created:>-7d urgent:yes title:"api docs" owner:@ada',
      ),
    ).toEqual({
      type: "group",
      combinator: "and",
      children: [
        condition("status", "isAnyOf", ["open", "blocked"]),
        condition("labels", "includesAll", ["bug", "ui"]),
        condition("amount", "between", [5, 10]),
        condition("created", "after", {
          kind: "relative",
          amount: -7,
          unit: "day",
        }),
        condition("urgent", "is", true),
        condition("title", "contains", "api docs"),
        condition("owner", "is", "ada"),
      ],
    });
  });

  it("reads operator tokens, dates, durations and periods", () => {
    expect(
      parse(
        "amount:>=3 amount:!=4 title:^api title:!empty status:!done created:last:7d created:in:-1m created:2026-02-28..today",
      ),
    ).toMatchObject({
      children: [
        condition("amount", "gte", 3),
        condition("amount", "neq", 4),
        condition("title", "startsWith", "api"),
        condition("title", "isNotEmpty"),
        condition("status", "isNoneOf", ["done"]),
        condition("created", "inLast", { amount: 7, unit: "day" }),
        condition("created", "inPeriod", {
          kind: "relative",
          amount: -1,
          unit: "month",
        }),
        condition("created", "between", [
          { kind: "absolute", date: "2026-02-28" },
          { kind: "relative", amount: 0, unit: "day" },
        ]),
      ],
    });
  });

  it("writes any operator as field:id:value", () => {
    expect(parse("amount:gte:3 owner:near:a,b")).toMatchObject({
      children: [
        condition("amount", "gte", 3),
        condition("owner", "near", ["a", "b"]),
      ],
    });
  });

  it("matches option labels and field keys without case", () => {
    expect(parse('Status:OPEN,"In progress"')).toMatchObject({
      children: [condition("status", "isAnyOf", ["open", "in progress"])],
    });
  });

  it("negates terms and groups", () => {
    expect(parse("-status:done -(urgent:yes OR amount:>5)")).toEqual({
      type: "group",
      combinator: "and",
      children: [
        condition("status", "isAnyOf", ["done"], true),
        {
          type: "group",
          combinator: "or",
          not: true,
          children: [
            condition("urgent", "is", true),
            condition("amount", "gt", 5),
          ],
        },
      ],
    });
  });

  it("binds AND tighter than OR", () => {
    expect(parse("a b OR c AND d")).toEqual({
      type: "group",
      combinator: "or",
      children: [
        {
          type: "group",
          combinator: "and",
          children: [
            condition("title", "contains", "a"),
            condition("title", "contains", "b"),
          ],
        },
        {
          type: "group",
          combinator: "and",
          children: [
            condition("title", "contains", "c"),
            condition("title", "contains", "d"),
          ],
        },
      ],
    });
    expect(parse("status:open (owner:@me OR labels:bug)")).toMatchObject({
      combinator: "and",
      children: [
        condition("status", "isAnyOf", ["open"]),
        {
          combinator: "or",
          children: [
            condition("owner", "is", "me"),
            condition("labels", "includesAny", ["bug"]),
          ],
        },
      ],
    });
  });

  it("searches the default field with plain words and quoted phrases", () => {
    expect(parse('login "rate limit" -flaky or')).toMatchObject({
      children: [
        condition("title", "contains", "login"),
        condition("title", "contains", "rate limit"),
        condition("title", "contains", "flaky", true),
        // Lowercase "or" is a word, not a keyword.
        condition("title", "contains", "or"),
      ],
    });

    const byStatus = parseFilterQuery("open", queryFields, {
      defaultField: "status",
    });

    expect(byStatus.ok && stripIds(byStatus.filter)).toMatchObject({
      children: [condition("status", "isAnyOf", ["open"])],
    });
  });

  it("reads escaped quotes and empty text", () => {
    expect(parse('title:"say \\"hi\\" \\\\ bye"')).toMatchObject({
      children: [condition("title", "contains", 'say "hi" \\ bye')],
    });
    expect(parse("   ")).toEqual({
      type: "group",
      combinator: "and",
      children: [],
    });
  });
});

describe("parse errors", () => {
  it("underlines the exact range", () => {
    expect(error("status:open nope:1")).toMatchObject({
      code: "unknown-field",
      message: 'Unknown field "nope"',
      start: 12,
      end: 16,
    });
    expect(underlined("status:open,nope")).toBe("nope");
    expect(error("status:open,nope").code).toBe("unknown-option");
    expect(underlined("amount:>abc")).toBe("abc");
    expect(error("amount:>abc")).toMatchObject({
      code: "invalid-value",
      message: "Expected a number",
    });
    expect(underlined("created:2026-02-31")).toBe("2026-02-31");
    expect(error("amount:>")).toMatchObject({ code: "missing-value" });
    expect(underlined('a title:"open')).toBe('"open');
    expect(error('a title:"open').code).toBe("unclosed-quote");
    expect(underlined("a (b OR c")).toBe("(");
    expect(error("a (b OR c").code).toBe("unclosed-group");
    expect(underlined("a b) c")).toBe(")");
    expect(underlined("a () c")).toBe("()");
    expect(underlined("a OR")).toBe("OR");
    expect(error("OR a")).toMatchObject({
      code: "missing-operand",
      message: "Add a filter before OR",
    });
    expect(underlined("a -")).toBe("-");
    expect(underlined('title:"a"b')).toBe("b");
    expect(underlined("title:!emptyish x:1")).toBe("x");
    expect(underlined("urgent:maybe")).toBe("maybe");
    expect(error("urgent:maybe").message).toBe("Expected yes or no");
  });

  it("limits nesting to the shared depth", () => {
    const deep = "a (b OR (c (d OR e)))";

    expect(parseFilterQuery(deep, queryFields).ok).toBe(false);
    expect(error(deep)).toMatchObject({ code: "max-depth" });
    expect(underlined(deep)).toBe("(d OR e)");
    expect(parseFilterQuery(deep, queryFields, { maxDepth: 4 }).ok).toBe(true);
  });

  it("needs a field for plain words when there is no text field", () => {
    const result = parseFilterQuery(
      "open",
      queryFields.filter((field) => field.type !== "text"),
    );

    expect(!result.ok && result.error).toMatchObject({
      code: "no-default-field",
      start: 0,
      end: 4,
    });
  });
});

describe("printFilterQuery", () => {
  it("prints canonical text", () => {
    const filter = createFilter({
      children: [
        createFilterCondition({
          field: "status",
          operator: "isAnyOf",
          value: ["open", "in progress"],
        }),
        createFilterCondition({
          field: "created",
          operator: "after",
          value: { kind: "relative", amount: -7, unit: "day" },
        }),
        createFilter({
          combinator: "or",
          children: [
            createFilterCondition({
              field: "owner",
              operator: "is",
              value: "me",
            }),
            createFilterCondition({
              field: "labels",
              operator: "includesAny",
              value: ["bug"],
            }),
          ],
        }),
        createFilterCondition({
          field: "title",
          operator: "contains",
          value: "login",
          not: true,
        }),
        // Incomplete: left out.
        createFilterCondition({ field: "amount", operator: "gt" }),
      ],
    });

    expect(printFilterQuery(filter, queryFields)).toBe(
      'status:open,"in progress" created:>-7d (owner:@me OR labels:bug) -login',
    );
  });

  it("quotes values that would read back differently", () => {
    const print = (field: string, operator: string, value: string) =>
      printFilterQuery(
        createFilter({
          children: [createFilterCondition({ field, operator, value })],
        }),
        queryFields,
      );

    expect(print("title", "contains", "OR")).toBe('"OR"');
    expect(print("title", "contains", "-x")).toBe('"-x"');
    expect(print("title", "contains", "a:b")).toBe('"a:b"');
    expect(print("title", "notContains", "empty")).toBe('title:!"empty"');
    expect(print("title", "is", "a (b)")).toBe('title:="a (b)"');
  });
});
