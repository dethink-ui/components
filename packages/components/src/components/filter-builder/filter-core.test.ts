import { describe, expect, it } from "vitest";
import {
  addFilterNode,
  createFilter,
  createFilterCondition,
  createFilterPredicate,
  defineFilterFields,
  describeFilter,
  describeFilterCondition,
  diffFilter,
  evaluateFilter,
  getDefaultFilterOperator,
  getFilterOperatorLabel,
  getFilterOperators,
  isFilterConditionActive,
  normalizeFilter,
  removeFilterNode,
  toTanstackFilterFn,
  updateFilterCondition,
  updateFilterGroup,
  validateFilter,
  type FilterNode,
} from ".";

interface Issue {
  id: string;
  title: string;
  status: "open" | "blocked" | "done";
  labels: string[];
  assignee: { name: string } | null;
}

const issues: Issue[] = [
  {
    id: "1",
    title: "API latency spike",
    status: "open",
    labels: ["bug", "api"],
    assignee: { name: "Ada" },
  },
  {
    id: "2",
    title: "Billing export",
    status: "blocked",
    labels: ["feature"],
    assignee: null,
  },
  {
    id: "3",
    title: "Docs refresh",
    status: "done",
    labels: [],
    assignee: { name: "Lin" },
  },
];

const fields = defineFilterFields<Issue>([
  { key: "title", label: "Title", type: "text" },
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
  {
    key: "labels",
    label: "Labels",
    type: "multiOption",
    options: [
      { value: "bug", label: "Bug" },
      { value: "api", label: "API" },
      { value: "feature", label: "Feature" },
    ],
  },
  {
    key: "assignee",
    label: "Assignee",
    type: "text",
    accessor: (issue) => issue.assignee?.name,
  },
]);

function match(...children: FilterNode[]) {
  const predicate = createFilterPredicate(
    createFilter({ id: "root", children }),
    fields,
  );

  return issues.filter(predicate).map((issue) => issue.id);
}

function condition(
  field: string,
  operator: string,
  value?: string | string[],
  not?: boolean,
) {
  return createFilterCondition({ field, operator, value, not });
}

describe("filter operators", () => {
  it.each([
    ["contains", "api", ["1"]],
    ["notContains", "api", ["2", "3"]],
    ["is", "docs refresh", ["3"]],
    ["isNot", "docs refresh", ["1", "2"]],
    ["startsWith", "BILL", ["2"]],
    ["endsWith", "spike", ["1"]],
  ])("text %s %s", (operator, value, expected) => {
    expect(match(condition("title", operator, value))).toEqual(expected);
  });

  it("matches text through accessors and empty checks", () => {
    expect(match(condition("assignee", "contains", "ad"))).toEqual(["1"]);
    expect(match(condition("assignee", "isEmpty"))).toEqual(["2"]);
    expect(match(condition("assignee", "isNotEmpty"))).toEqual(["1", "3"]);
  });

  it.each([
    ["isAnyOf", ["open", "blocked"], ["1", "2"]],
    ["isNoneOf", ["open", "blocked"], ["3"]],
  ])("option %s", (operator, value, expected) => {
    expect(match(condition("status", operator, value))).toEqual(expected);
  });

  it.each([
    ["includesAny", ["api", "feature"], ["1", "2"]],
    ["includesAll", ["bug", "api"], ["1"]],
    ["excludesAll", ["bug"], ["2", "3"]],
    ["isEmpty", undefined, ["3"]],
    ["isNotEmpty", undefined, ["1", "2"]],
  ])("multiOption %s", (operator, value, expected) => {
    expect(match(condition("labels", operator, value))).toEqual(expected);
  });

  it("offers typed operators with sensible defaults", () => {
    const [title, status, labels] = fields;

    expect(getFilterOperators(title!).map((operator) => operator.id)).toEqual([
      "contains",
      "notContains",
      "is",
      "isNot",
      "startsWith",
      "endsWith",
      "isEmpty",
      "isNotEmpty",
    ]);
    expect(getDefaultFilterOperator(status!)?.id).toBe("isAnyOf");
    expect(getDefaultFilterOperator(labels!)?.id).toBe("includesAny");
    expect(
      getFilterOperators({ type: "option", operators: ["isNoneOf", "nope"] }),
    ).toHaveLength(1);
  });

  it("uses the single-value operator label for one selected value", () => {
    const [isAnyOf] = getFilterOperators(fields[1]!);

    expect(getFilterOperatorLabel(isAnyOf!, ["open"])).toBe("is");
    expect(getFilterOperatorLabel(isAnyOf!, ["open", "done"])).toBe(
      "is any of",
    );
  });
});

describe("filter evaluation", () => {
  it("combines conditions with and/or, nested groups and negation", () => {
    expect(
      match(
        condition("status", "isAnyOf", ["open", "blocked"]),
        condition("labels", "includesAny", ["bug"]),
      ),
    ).toEqual(["1"]);

    const orFilter = createFilter({
      combinator: "or",
      children: [
        condition("status", "isAnyOf", ["done"]),
        createFilter({
          children: [
            condition("labels", "includesAny", ["feature"]),
            condition("assignee", "isEmpty"),
          ],
        }),
      ],
    });

    expect(
      issues
        .filter((issue) => evaluateFilter(orFilter, issue, fields))
        .map((issue) => issue.id),
    ).toEqual(["2", "3"]);
    expect(match(condition("status", "isAnyOf", ["open"], true))).toEqual([
      "2",
      "3",
    ]);
    expect(
      match(
        createFilter({
          not: true,
          combinator: "or",
          children: [
            condition("status", "isAnyOf", ["open"]),
            condition("status", "isAnyOf", ["done"]),
          ],
        }),
      ),
    ).toEqual(["2"]);
  });

  it("skips incomplete and unknown conditions instead of hiding rows", () => {
    expect(match(condition("status", "isAnyOf", []))).toEqual(["1", "2", "3"]);
    expect(match(condition("title", "contains", ""))).toEqual(["1", "2", "3"]);
    expect(match(condition("missing", "is", "x"))).toEqual(["1", "2", "3"]);
    expect(match(condition("status", "contains", "x"))).toEqual([
      "1",
      "2",
      "3",
    ]);
    expect(match(createFilter())).toEqual(["1", "2", "3"]);
    expect(
      isFilterConditionActive(condition("status", "isAnyOf", []), fields),
    ).toBe(false);
    expect(
      isFilterConditionActive(condition("labels", "isEmpty"), fields),
    ).toBe(true);
  });

  it("adapts to TanStack's filter function, reading the filter from state", () => {
    const filterFn = toTanstackFilterFn(fields);
    const docs = createFilter({
      children: [condition("title", "contains", "docs")],
    });
    const open = createFilter({
      children: [condition("status", "isAnyOf", ["open"])],
    });
    const run = (filter: FilterNode | undefined) =>
      issues.map((original) => filterFn({ original }, "title", filter));

    expect(run(docs)).toEqual([false, false, true]);
    // A new filter value takes effect: nothing is cached across filters.
    expect(run(open)).toEqual([true, false, false]);
    expect(run(undefined)).toEqual([true, true, true]);
  });
});

describe("filter description", () => {
  it("describes conditions as sentences with option labels", () => {
    expect(
      describeFilterCondition(
        condition("status", "isAnyOf", ["open", "blocked"]),
        fields,
      ),
    ).toBe("Status is any of Open, Blocked");
    expect(
      describeFilterCondition(condition("status", "isAnyOf", ["open"]), fields),
    ).toBe("Status is Open");
    expect(
      describeFilterCondition(condition("title", "contains", "api"), fields),
    ).toBe('Title contains "api"');
    expect(
      describeFilterCondition(condition("labels", "isEmpty"), fields),
    ).toBe("Labels is empty");
    expect(
      describeFilterCondition(condition("status", "isAnyOf"), fields),
    ).toBe("Status is any of (no value)");
  });

  it("describes groups, combinators and negation", () => {
    const filter = createFilter({
      children: [
        condition("status", "isAnyOf", ["open"]),
        createFilter({
          combinator: "or",
          children: [
            condition("labels", "includesAny", ["bug"]),
            condition("assignee", "isEmpty", undefined, true),
          ],
        }),
      ],
    });

    expect(describeFilter(filter, fields)).toBe(
      "Status is Open, and (Labels includes Bug, or not (Assignee is empty))",
    );
    expect(describeFilter(createFilter(), fields)).toBe("No filters");
    expect(
      describeFilter(createFilter(), fields, { labels: { empty: "Nothing" } }),
    ).toBe("Nothing");
  });
});

describe("filter validation", () => {
  it("reports unknown fields, operators, missing values and options", () => {
    const filter = createFilter({
      children: [
        createFilterCondition({ id: "a", field: "nope", operator: "is" }),
        createFilterCondition({
          id: "b",
          field: "status",
          operator: "contains",
        }),
        createFilterCondition({
          id: "c",
          field: "status",
          operator: "isAnyOf",
        }),
        createFilterCondition({
          id: "d",
          field: "status",
          operator: "isAnyOf",
          value: "open",
        }),
        createFilterCondition({
          id: "e",
          field: "status",
          operator: "isAnyOf",
          value: ["open", "ghost"],
        }),
        createFilterCondition({
          id: "f",
          field: "labels",
          operator: "isEmpty",
        }),
      ],
    });

    expect(
      validateFilter(filter, fields).map(({ code, nodeId }) => [nodeId, code]),
    ).toEqual([
      ["a", "unknown-field"],
      ["b", "unknown-operator"],
      ["c", "missing-value"],
      ["d", "invalid-value"],
      ["e", "unknown-option"],
    ]);
  });
});

describe("filter commands", () => {
  const base = createFilter({
    id: "root",
    children: [
      createFilterCondition({
        id: "status",
        field: "status",
        operator: "isAnyOf",
        value: ["open"],
      }),
      createFilter({
        id: "nested",
        combinator: "or",
        children: [
          createFilterCondition({
            id: "title",
            field: "title",
            operator: "contains",
            value: "api",
          }),
        ],
      }),
    ],
  });

  it("adds, updates and removes nodes immutably", () => {
    const added = addFilterNode(
      base,
      createFilterCondition({ id: "x", field: "labels", operator: "isEmpty" }),
      { parentId: "nested", index: 0 },
    );
    const nested = added.children[1];

    expect(nested?.type === "group" && nested.children[0]?.id).toBe("x");
    expect(base.children[1]).not.toBe(nested);

    const updated = updateFilterCondition(added, "title", { value: undefined });
    const title = updated.children[1];

    expect(
      title?.type === "group" && "value" in (title.children[1] ?? {}),
    ).toBe(false);
    expect(
      updateFilterGroup(base, "root", { combinator: "or" }).combinator,
    ).toBe("or");

    const removed = removeFilterNode(base, "title");

    expect(removed.children.map((child) => child.id)).toEqual(["status"]);
  });

  it("normalizes single-child and same-combinator groups", () => {
    const filter = createFilter({
      id: "root",
      children: [
        createFilter({ id: "empty" }),
        base.children[1]!,
        createFilter({
          id: "same",
          children: [
            createFilterCondition({
              id: "p",
              field: "title",
              operator: "isEmpty",
            }),
            createFilterCondition({
              id: "q",
              field: "labels",
              operator: "isEmpty",
            }),
          ],
        }),
        createFilter({
          id: "negated",
          not: true,
          children: [
            createFilterCondition({
              id: "r",
              field: "title",
              operator: "isEmpty",
            }),
          ],
        }),
      ],
    });

    const normalized = normalizeFilter(filter);

    expect(normalized.id).toBe("root");
    expect(normalized.children.map((child) => child.id)).toEqual([
      "title",
      "p",
      "q",
      "negated",
    ]);
  });

  it("diffs filters by node id", () => {
    const next = removeFilterNode(
      updateFilterCondition(
        addFilterNode(
          base,
          createFilterCondition({
            id: "new",
            field: "labels",
            operator: "isEmpty",
          }),
        ),
        "status",
        { value: ["open", "blocked"] },
      ),
      "title",
    );
    const diff = diffFilter(base, next);

    expect(diff.added.map((node) => node.id)).toEqual(["new"]);
    expect(diff.removed.map((node) => node.id).sort()).toEqual([
      "nested",
      "title",
    ]);
    // The root's membership changed too: "new" joined and "nested" left.
    expect(diff.changed.map(({ after }) => after.id).sort()).toEqual([
      "root",
      "status",
    ]);
    expect(diffFilter(base, base)).toEqual({
      added: [],
      removed: [],
      changed: [],
    });
  });

  it("reports groups whose membership changes when nodes move", () => {
    const moved = addFilterNode(
      removeFilterNode(base, "status"),
      base.children[0]!,
      { parentId: "nested" },
    );
    const diff = diffFilter(base, moved);

    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.changed.map(({ after }) => after.id).sort()).toEqual([
      "nested",
      "root",
    ]);

    const reordered = { ...base, children: [...base.children].reverse() };

    expect(diffFilter(base, reordered).changed).toEqual([]);
  });

  it("keeps the AST serializable", () => {
    expect(JSON.parse(JSON.stringify(base))).toEqual(base);
  });
});
