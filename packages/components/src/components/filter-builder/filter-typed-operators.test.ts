import { describe, expect, it } from "vitest";
import {
  computeFilterFacets,
  computeFilterImpact,
  countFilterMatches,
  createFilter,
  createFilterCondition,
  createFilterPredicate,
  defineFilterFieldType,
  defineFilterFields,
  defineFilterOperator,
  describeFilterCondition,
  findFilterRescue,
  getDefaultFilterOperator,
  getFilterOperators,
  isFilterConditionActive,
  validateFilter,
  type FilterEvaluateOptions,
  type FilterFacetTarget,
  type FilterNode,
  type FilterCondition,
  type FilterValue,
} from ".";

interface Ticket {
  id: string;
  estimate: number | string | null;
  due: string | Date | null;
  urgent: boolean | null;
  status: string;
  owner: string | null;
}

// Wednesday Sep 30, 2026, 23:30 UTC. In Tokyo it is already Thursday Oct 1.
const now = Date.UTC(2026, 8, 30, 23, 30);
const utc: FilterEvaluateOptions = { now };

const tickets: Ticket[] = [
  {
    id: "a",
    estimate: 3,
    due: "2026-09-30",
    urgent: true,
    status: "open",
    owner: "me",
  },
  {
    id: "b",
    estimate: "8",
    due: "2026-09-24",
    urgent: false,
    status: "open",
    owner: "sam",
  },
  {
    id: "c",
    estimate: null,
    due: "2026-10-03",
    urgent: null,
    status: "done",
    owner: null,
  },
  {
    id: "d",
    estimate: 13,
    due: new Date(Date.UTC(2026, 8, 1)),
    urgent: false,
    status: "blocked",
    owner: "me",
  },
  {
    id: "e",
    estimate: "",
    due: null,
    urgent: true,
    status: "done",
    owner: "lin",
  },
];

const userType = defineFilterFieldType({
  id: "user",
  operators: [
    defineFilterOperator({
      id: "isMe",
      label: "is me",
      arity: "none",
      evaluate: (rowValue) => rowValue === "me",
    }),
    defineFilterOperator({
      id: "is",
      label: "is",
      arity: "single",
      valueKind: "user",
      isValueValid: (value) => typeof value === "string",
      evaluate: (rowValue, value) => rowValue === value,
    }),
  ],
  defaultOperator: "is",
  formatValue: (value) => [`@${String(value)}`],
});

const fields = defineFilterFields<Ticket>([
  { key: "estimate", label: "Estimate", type: "number" },
  { key: "due", label: "Due", type: "date" },
  {
    key: "urgent",
    label: "Urgent",
    type: "boolean",
    trueLabel: "Urgent",
    falseLabel: "Not urgent",
  },
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "open", label: "Open" },
      { value: "blocked", label: "Blocked" },
      { value: "done", label: "Done" },
    ],
  },
  { key: "owner", label: "Owner", type: userType },
]);

function match(
  field: string,
  operator: string,
  value?: FilterValue,
  options: FilterEvaluateOptions = utc,
) {
  const filter = createFilter({
    children: [createFilterCondition({ field, operator, value })],
  });

  return tickets
    .filter(createFilterPredicate(filter, fields, options))
    .map((ticket) => ticket.id);
}

describe("number operators", () => {
  it.each([
    ["eq", 8, ["b"]],
    ["neq", 8, ["a", "d"]],
    ["gt", 3, ["b", "d"]],
    ["gte", 3, ["a", "b", "d"]],
    ["lt", 8, ["a"]],
    ["lte", 8, ["a", "b"]],
    ["between", [13, 3], ["a", "b", "d"]],
    ["isEmpty", undefined, ["c", "e"]],
    ["isNotEmpty", undefined, ["a", "b", "d"]],
  ] as const)("%s %j", (operator, value, expected) => {
    expect(
      match("estimate", operator, value as FilterValue | undefined),
    ).toEqual(expected);
  });

  it("skips values of the wrong shape instead of filtering", () => {
    expect(match("estimate", "gt", "3")).toEqual(["a", "b", "c", "d", "e"]);
    expect(match("estimate", "between", [1] as unknown as FilterValue)).toEqual(
      ["a", "b", "c", "d", "e"],
    );
    expect(
      isFilterConditionActive(
        createFilterCondition({
          field: "estimate",
          operator: "gt",
          value: "3",
        }),
        fields,
      ),
    ).toBe(false);
  });
});

describe("date operators", () => {
  const day = (amount: number) => ({
    kind: "relative" as const,
    amount,
    unit: "day" as const,
  });

  it("compares calendar days with absolute and relative dates", () => {
    expect(match("due", "is", day(0))).toEqual(["a"]);
    expect(
      match("due", "is", { kind: "absolute", date: "2026-09-24" }),
    ).toEqual(["b"]);
    expect(match("due", "before", day(-6))).toEqual(["d"]);
    expect(match("due", "after", day(0))).toEqual(["c"]);
    expect(
      match("due", "between", [
        day(3),
        { kind: "absolute", date: "2026-09-20" },
      ]),
    ).toEqual(["a", "b", "c"]);
    expect(match("due", "isEmpty")).toEqual(["e"]);
  });

  it("covers the last and next N units, including today", () => {
    expect(match("due", "inLast", { amount: 7, unit: "day" })).toEqual([
      "a",
      "b",
    ]);
    expect(match("due", "inLast", { amount: 6, unit: "day" })).toEqual(["a"]);
    expect(match("due", "inNext", { amount: 3, unit: "day" })).toEqual(["a"]);
    expect(match("due", "inNext", { amount: 4, unit: "day" })).toEqual([
      "a",
      "c",
    ]);
    expect(match("due", "inLast", { amount: 1, unit: "month" })).toEqual([
      "a",
      "b",
      "d",
    ]);
  });

  it("uses calendar periods with the configured week start", () => {
    const thisWeek = {
      kind: "relative" as const,
      amount: 0,
      unit: "week" as const,
    };

    // Monday weeks: Sep 28 – Oct 4.
    expect(match("due", "inPeriod", thisWeek)).toEqual(["a", "c"]);
    // Sunday weeks: Sep 27 – Oct 3.
    expect(
      match("due", "inPeriod", thisWeek, { now, weekStartsOn: 0 }),
    ).toEqual(["a", "c"]);
    expect(
      match("due", "inPeriod", { kind: "relative", amount: -1, unit: "week" }),
    ).toEqual(["b"]);
    expect(
      match("due", "inPeriod", { kind: "relative", amount: 0, unit: "month" }),
    ).toEqual(["a", "b", "d"]);
  });

  it("resolves today in the evaluation time zone", () => {
    // In Tokyo it is Oct 1, so "today" is Oct 1 and Sep 30 is yesterday.
    expect(match("due", "is", day(0), { now, timeZone: "Asia/Tokyo" })).toEqual(
      [],
    );
    expect(
      match("due", "is", day(-1), { now, timeZone: "Asia/Tokyo" }),
    ).toEqual(["a"]);
  });

  it("stays stable for a fixed now, whatever the real clock says", () => {
    const filter = createFilter({
      children: [
        createFilterCondition({ field: "due", operator: "is", value: day(0) }),
      ],
    });

    expect(countFilterMatches(tickets, filter, fields, utc)).toBe(1);
    expect(
      countFilterMatches(tickets, filter, fields, {
        now: Date.UTC(2026, 8, 24),
      }),
    ).toBe(1);
    expect(
      countFilterMatches(tickets, filter, fields, {
        now: Date.UTC(2026, 9, 3),
      }),
    ).toBe(1);
  });

  it("describes dates, durations and periods", () => {
    const describe = (operator: string, value: FilterValue) =>
      describeFilterCondition(
        createFilterCondition({ field: "due", operator, value }),
        fields,
      );

    expect(describe("is", day(-1))).toBe("Due is yesterday");
    expect(describe("before", { kind: "absolute", date: "2026-09-01" })).toBe(
      "Due is before Sep 1, 2026",
    );
    expect(describe("inLast", { amount: 7, unit: "day" })).toBe(
      "Due is in the last 7 days",
    );
    expect(
      describe("inPeriod", { kind: "relative", amount: -1, unit: "month" }),
    ).toBe("Due is in last month");
    expect(
      describe("between", [
        { kind: "absolute", date: "2026-09-01" },
        { kind: "absolute", date: "2026-09-30" },
      ]),
    ).toBe("Due is between Sep 1, 2026 – Sep 30, 2026");
  });
});

describe("boolean operators", () => {
  it("matches only real booleans", () => {
    expect(match("urgent", "is", true)).toEqual(["a", "e"]);
    expect(match("urgent", "is", false)).toEqual(["b", "d"]);
    expect(match("urgent", "isEmpty")).toEqual(["c"]);
    expect(
      describeFilterCondition(
        createFilterCondition({
          field: "urgent",
          operator: "is",
          value: false,
        }),
        fields,
      ),
    ).toBe("Urgent is Not urgent");
  });
});

describe("custom field types", () => {
  it("use their own operators, evaluation and value text", () => {
    const owner = fields.find((field) => field.key === "owner")!;

    expect(getFilterOperators(owner).map((operator) => operator.id)).toEqual([
      "isMe",
      "is",
    ]);
    expect(getDefaultFilterOperator(owner)?.id).toBe("is");
    expect(match("owner", "isMe")).toEqual(["a", "d"]);
    expect(match("owner", "is", "sam")).toEqual(["b"]);
    expect(
      describeFilterCondition(
        createFilterCondition({ field: "owner", operator: "is", value: "lin" }),
        fields,
      ),
    ).toBe("Owner is @lin");
    expect(
      validateFilter(
        createFilter({
          children: [
            createFilterCondition({
              id: "bad",
              field: "owner",
              operator: "is",
              value: 3,
            }),
          ],
        }),
        fields,
      ),
    ).toMatchObject([{ nodeId: "bad", code: "invalid-value" }]);
  });
});

describe("facets, impact and rescue", () => {
  const filter: FilterNode = createFilter({
    children: [
      createFilterCondition({
        id: "status",
        field: "status",
        operator: "isAnyOf",
        value: ["open"],
      }),
      createFilterCondition({
        id: "urgent",
        field: "urgent",
        operator: "is",
        value: true,
      }),
    ],
  });

  it("counts facets with every condition but the field's own", () => {
    // Urgent rows are a and e: one open, one done.
    expect(
      Object.fromEntries(
        computeFilterFacets(tickets, filter, fields, "status", utc) ?? [],
      ),
    ).toEqual({ open: 1, done: 1 });
    // Open rows are a and b: one urgent, one not.
    expect(
      Object.fromEntries(
        computeFilterFacets(tickets, filter, fields, "urgent", utc) ?? [],
      ),
    ).toEqual({ true: 1, false: 1 });
    expect(
      computeFilterFacets(tickets, filter, fields, "missing", utc)?.size,
    ).toBe(0);
  });

  it("leaves out facet counts for a field inside an OR group", () => {
    const either = createFilter({
      combinator: "or",
      children: [
        createFilterCondition({
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        }),
        createFilterCondition({ field: "urgent", operator: "is", value: true }),
      ],
    });

    expect(
      computeFilterFacets(tickets, either, fields, "status", utc),
    ).toBeUndefined();
    expect(
      computeFilterFacets(
        tickets,
        createFilter({
          children: [
            createFilter({
              not: true,
              children: [
                createFilterCondition({
                  field: "status",
                  operator: "isAnyOf",
                  value: ["open"],
                }),
              ],
            }),
          ],
        }),
        fields,
        "status",
        utc,
      ),
    ).toBeUndefined();
    // Fields outside the OR group still count.
    expect(
      computeFilterFacets(tickets, either, fields, "estimate", utc),
    ).toBeDefined();
  });

  it("counts only operators where one value keeps the rows that have it", () => {
    const facets = (condition: Partial<FilterCondition>) =>
      computeFilterFacets(
        tickets,
        createFilter({
          children: [
            createFilterCondition({
              id: "own",
              field: "status",
              operator: "isAnyOf",
              value: ["open"],
              ...condition,
            }),
          ],
        }),
        fields,
        "status",
        { ...utc, target: { conditionId: "own" } },
      );

    expect(facets({})).toBeDefined();
    // "is not Open" matches the other three rows, not Open's two.
    expect(facets({ operator: "isNoneOf" })).toBeUndefined();
    expect(facets({ not: true })).toBeUndefined();
  });

  it("gives no counts to custom operators that reuse a built-in id", () => {
    const caseless = defineFilterFieldType({
      id: "caseless",
      operators: [
        {
          id: "is",
          label: "is",
          arity: "single",
          valueKind: "text",
          evaluate: (rowValue, value) =>
            String(rowValue).toLowerCase() === String(value).toLowerCase(),
        },
      ],
    });
    const people = [{ owner: "ADA" }];
    const ownerFields = defineFilterFields<{ owner: string }>([
      { key: "owner", label: "Owner", type: caseless },
    ]);
    const facets = (filter: FilterNode, target?: FilterFacetTarget) =>
      computeFilterFacets(people, filter, ownerFields, "owner", {
        ...utc,
        target,
      });
    const withOwner = createFilter({
      children: [
        createFilterCondition({
          id: "own",
          field: "owner",
          operator: "is",
          value: "ada",
        }),
      ],
    });

    // "ada" matches the "ADA" row, so { ADA: 1 } would show "ada, 0 matching".
    expect(facets(withOwner, { conditionId: "own" })).toBeUndefined();
    expect(facets(withOwner)).toBeUndefined();
    expect(
      facets(createFilter(), { conditionId: "draft", operator: "is" }),
    ).toBeUndefined();
    expect(facets(createFilter(), { conditionId: "draft" })).toBeUndefined();
  });

  it("counts a new condition by the group it will join", () => {
    const orGroup = createFilter({
      id: "either",
      combinator: "or",
      children: [
        createFilterCondition({ field: "urgent", operator: "is", value: true }),
      ],
    });
    const root = createFilter({ id: "root", children: [orGroup] });
    const facets = (parentId: string) =>
      computeFilterFacets(tickets, root, fields, "status", {
        ...utc,
        target: { conditionId: "draft", parentId, operator: "isAnyOf" },
      });

    // Joining the OR group widens the results, so counts would mislead.
    expect(facets("either")).toBeUndefined();
    // Joining the root narrows the urgent rows (a, e) by status.
    expect(Object.fromEntries(facets("root") ?? [])).toEqual({
      open: 1,
      done: 1,
    });
  });

  it("keeps the field's other conditions when counting one target", () => {
    const twice = createFilter({
      children: [
        createFilterCondition({
          id: "first",
          field: "status",
          operator: "isNoneOf",
          value: ["done"],
        }),
        createFilterCondition({
          id: "second",
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        }),
      ],
    });

    expect(
      Object.fromEntries(
        computeFilterFacets(tickets, twice, fields, "status", {
          ...utc,
          target: { conditionId: "second" },
        }) ?? [],
      ),
    ).toEqual({ open: 2, blocked: 1 });
    // Without a target, the negative "first" condition blocks counts.
    expect(
      computeFilterFacets(tickets, twice, fields, "status", utc),
    ).toBeUndefined();
  });

  it("measures how many rows each condition removes", () => {
    expect(
      Object.fromEntries(computeFilterImpact(tickets, filter, fields, utc)),
    ).toEqual({ status: 1, urgent: 1 });
  });

  it("finds the most restrictive condition when nothing matches", () => {
    const empty = createFilter({
      children: [
        createFilterCondition({
          id: "done",
          field: "status",
          operator: "isAnyOf",
          value: ["done"],
        }),
        createFilterCondition({
          id: "big",
          field: "estimate",
          operator: "gt",
          value: 10,
        }),
      ],
    });

    expect(countFilterMatches(tickets, empty, fields, utc)).toBe(0);
    // Dropping "done" shows d; dropping "> 10" shows c and e.
    expect(findFilterRescue(tickets, empty, fields, utc)).toMatchObject({
      condition: { id: "big" },
      count: 2,
    });
    expect(findFilterRescue(tickets, filter, fields, utc)).toBeUndefined();
    expect(findFilterRescue([], empty, fields, utc)).toBeUndefined();
  });
});
