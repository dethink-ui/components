import { describe, expect, it } from "vitest";
import {
  applyFilterProposalChanges,
  createFilter,
  createFilterCondition,
  getFilterProposalChanges,
  matchFilterProposalIds,
  printFilterQuery,
  reconcileFilterIds,
  sanitizeFilterAssistantResult,
  type Filter,
} from ".";
import { queryFields } from "./filter-query.fixtures";

const print = (filter: Filter) => printFilterQuery(filter, queryFields);
const title = (id: string, value: string) =>
  createFilterCondition({ id, field: "title", operator: "contains", value });
const status = (id: string) =>
  createFilterCondition({
    id,
    field: "status",
    operator: "isAnyOf",
    value: ["open"],
  });

function proposal(base: Filter, raw: Filter) {
  const proposed = matchFilterProposalIds(raw, base);

  return { changes: getFilterProposalChanges(base, proposed), proposed };
}

describe("applyFilterProposalChanges edge cases", () => {
  it("moves a group the proposal lifts to the root", () => {
    const base = createFilter({
      id: "root",
      children: [
        createFilter({
          id: "g1",
          children: [
            title("x", "x"),
            createFilter({
              id: "g2",
              combinator: "or",
              children: [status("s")],
            }),
          ],
        }),
      ],
    });
    const { changes, proposed } = proposal(
      base,
      createFilter({
        children: [
          createFilter({ children: [title("n1", "x")] }),
          createFilter({ combinator: "or", children: [status("n2")] }),
        ],
      }),
    );

    expect(print(applyFilterProposalChanges(base, proposed, changes))).toBe(
      "x status:open",
    );

    // Keeping the old parent but accepting the move still moves the group.
    const move = changes.filter(
      (change) => change.kind === "changed" && change.id === "g2",
    );
    const moved = applyFilterProposalChanges(base, proposed, move);

    expect(moved.children.map((node) => node.id)).toContain("g2");
  });

  it("keeps a condition whose change was rejected when its group is removed", () => {
    const base = createFilter({
      id: "root",
      children: [
        createFilter({
          id: "g",
          combinator: "or",
          children: [title("a", "a"), title("b", "b")],
        }),
      ],
    });
    const { changes, proposed } = proposal(
      base,
      createFilter({ children: [title("n", "a2")] }),
    );
    const onlyRemoval = changes.filter((change) => change.kind === "removed");

    expect(changes.map((change) => change.kind)).toEqual([
      "changed",
      "removed",
    ]);
    // "a" leaves the removed group unchanged.
    expect(print(applyFilterProposalChanges(base, proposed, onlyRemoval))).toBe(
      "a",
    );
  });

  it("applies a root change even after the root was replaced", () => {
    const base = createFilter({
      id: "root",
      children: [title("a", "a"), title("b", "b")],
    });
    const { changes, proposed } = proposal(
      base,
      createFilter({
        combinator: "or",
        children: [title("n1", "a"), title("n2", "b")],
      }),
    );
    // A saved view or URL replaced the filter with another root id.
    const live = createFilter({ id: "other", children: base.children });

    expect(applyFilterProposalChanges(live, proposed, changes).combinator).toBe(
      "or",
    );
  });
});

describe("take-overs, empty groups and identical siblings", () => {
  const all = (
    base: Filter,
    proposed: Filter,
    changes = getFilterProposalChanges(base, proposed),
  ) => applyFilterProposalChanges(base, proposed, changes);
  const idsOf = (node: Filter | Filter["children"][number]): string[] =>
    node.type === "group"
      ? [node.id, ...node.children.flatMap(idsOf)]
      : [node.id];

  it("keeps what a taken-over group held that the addition doesn't include", () => {
    const base = createFilter({
      id: "h",
      combinator: "or",
      children: [
        title("x", "x"),
        createFilter({ id: "g", children: [title("a", "a"), title("b", "b")] }),
      ],
    });
    // Ids kept, as a caller of the helpers might pass them.
    const proposed = createFilter({
      id: "h",
      combinator: "or",
      children: [
        title("x", "x"),
        title("a", "a"),
        createFilter({
          id: "n",
          combinator: "or",
          children: [
            title("y", "y"),
            createFilter({ id: "g", children: [title("b", "b")] }),
          ],
        }),
      ],
    });
    const changes = getFilterProposalChanges(base, proposed);
    const onlyAddition = changes.filter((change) => change.id === "n");
    const result = applyFilterProposalChanges(base, proposed, onlyAddition);

    expect(idsOf(result)).toContain("a");
    expect(new Set(idsOf(result)).size).toBe(idsOf(result).length);
    expect(print(all(base, proposed, changes))).toBe(print(proposed));
  });

  it("keeps a group the proposal keeps, with its negation", () => {
    const base = createFilter({
      id: "root",
      children: [
        createFilter({ id: "g", not: true, children: [title("c", "c")] }),
      ],
    });
    const proposed = createFilter({
      id: "root",
      children: [
        createFilter({
          id: "g",
          not: true,
          children: [
            createFilter({
              id: "y",
              children: [title("c", "c"), title("d", "d")],
            }),
          ],
        }),
      ],
    });

    expect(print(all(base, proposed))).toBe(print(proposed));
    expect(print(all(base, proposed))).toBe("-(c d)");
  });

  it("doesn't swap ids between identical siblings", () => {
    const urgent = (id: string) =>
      createFilterCondition({
        id,
        field: "urgent",
        operator: "is",
        value: true,
      });
    const base = createFilter({
      id: "root",
      combinator: "or",
      children: [
        createFilter({ id: "g", children: [urgent("u1"), title("a", "a")] }),
        urgent("u2"),
      ],
    });
    const { changes, proposed } = proposal(
      base,
      createFilter({
        combinator: "or",
        children: [
          urgent("n1"),
          title("n2", "y"),
          createFilter({ children: [urgent("n3"), title("n4", "a")] }),
        ],
      }),
    );

    expect(changes.map((change) => change.kind)).toEqual(["added"]);
    // Same terms; existing siblings keep their places (order doesn't change
    // what an OR matches).
    const terms = (filter: Filter) => print(filter).split(" OR ").sort();

    expect(terms(all(base, proposed, changes))).toEqual(terms(proposed));
  });
});

describe("removals inside surviving groups", () => {
  it("lists what a group loses when it outlives its removed parent", () => {
    const base = createFilter({
      id: "r",
      children: [
        createFilter({
          id: "g1",
          children: [
            createFilter({
              id: "g2",
              combinator: "or",
              children: [title("a", "a"), title("b", "b")],
            }),
          ],
        }),
      ],
    });
    const proposed = createFilter({
      id: "r",
      children: [
        createFilter({
          id: "g2",
          combinator: "or",
          children: [title("b", "b")],
        }),
      ],
    });
    const changes = getFilterProposalChanges(base, proposed);

    expect(changes.map((change) => [change.kind, change.id])).toEqual([
      ["changed", "g2"],
      ["removed", "g1"],
      ["removed", "a"],
    ]);
    expect(print(applyFilterProposalChanges(base, proposed, changes))).toBe(
      print(proposed),
    );
  });
});

describe("sanitizer with hostile objects", () => {
  it("ignores getters and prototype-less objects instead of throwing", () => {
    let called = false;
    const condition = {
      type: "condition",
      field: "title",
      operator: "contains",
      get value() {
        called = true;
        throw new Error("boom");
      },
    };
    const bare = Object.assign(Object.create(null) as object, {
      type: "condition",
      field: Object.create(null) as object,
      operator: "is",
    });
    const result = sanitizeFilterAssistantResult(
      {
        filter: {
          type: "group",
          combinator: "and",
          children: [condition, bare],
        },
        unresolved: [Object.create(null)],
      },
      queryFields,
    );

    expect(called).toBe(false);
    expect(result.filter?.children).toHaveLength(1);
    expect(result.needsInput).toHaveLength(1);
  });
});

describe("proposal changes", () => {
  const base = createFilter({
    id: "root",
    children: [
      createFilterCondition({
        id: "s",
        field: "status",
        operator: "isAnyOf",
        value: ["open"],
      }),
      createFilterCondition({
        id: "u",
        field: "urgent",
        operator: "is",
        value: true,
      }),
      createFilterCondition({
        id: "t",
        field: "title",
        operator: "contains",
        value: "api",
      }),
    ],
  });
  const proposedFrom = (text: Filter) => reconcileFilterIds(text, base);

  it("lists added, changed, moved and removed nodes", () => {
    const proposed = proposedFrom(
      createFilter({
        children: [
          // Changed in place (same id, new value).
          {
            ...base.children[0]!,
            value: ["open", "blocked"],
          } as Filter["children"][number],
          // "urgent" moves into a new OR group.
          createFilter({
            combinator: "or",
            children: [
              base.children[1]!,
              createFilterCondition({
                field: "labels",
                operator: "includesAny",
                value: ["bug"],
              }),
            ],
          }),
          // "title" is removed.
        ],
      }),
    );
    const changes = getFilterProposalChanges(base, proposed);

    expect(changes.map((change) => [change.kind, change.id])).toEqual([
      ["changed", "s"],
      ["added", proposed.children[1]!.id],
      ["removed", "t"],
    ]);

    const all = applyFilterProposalChanges(base, proposed, changes);

    expect(print(all)).toBe("status:open,blocked (urgent:yes OR labels:bug)");

    // Only the removal.
    const some = applyFilterProposalChanges(
      base,
      proposed,
      changes.filter((change) => change.kind === "removed"),
    );

    expect(print(some)).toBe("status:open urgent:yes");
  });

  it("reports needs-input and root changes, and applies onto a newer filter", () => {
    const draft = createFilterCondition({ field: "amount", operator: "gt" });
    const proposed = proposedFrom(
      createFilter({ combinator: "or", children: [...base.children, draft] }),
    );
    const changes = getFilterProposalChanges(base, proposed, [draft.id]);

    expect(changes).toMatchObject([
      { kind: "changed", id: "root" },
      { kind: "added", id: draft.id, needsInput: true },
    ]);

    // The person removed "title" meanwhile; the proposal still applies.
    const newer = createFilter({
      id: "root",
      children: base.children.slice(0, 2),
    });
    const applied = applyFilterProposalChanges(newer, proposed, changes);

    expect(applied.combinator).toBe("or");
    expect(applied.children.map((node) => node.id)).toEqual([
      "s",
      "u",
      draft.id,
    ]);
  });

  it("pairs leftover conditions on the same field as changes", () => {
    const proposed = matchFilterProposalIds(
      createFilter({
        children: [
          createFilterCondition({
            field: "status",
            operator: "isAnyOf",
            value: ["done"],
          }),
          createFilterCondition({
            field: "urgent",
            operator: "is",
            value: true,
          }),
          createFilterCondition({
            field: "status",
            operator: "isNoneOf",
            value: ["blocked"],
          }),
        ],
      }),
      base,
    );

    expect(
      getFilterProposalChanges(base, proposed).map((change) => [
        change.kind,
        change.id,
      ]),
    ).toEqual([
      ["changed", "s"],
      ["added", proposed.children[2]!.id],
      ["removed", "t"],
    ]);
    expect(proposed.children[1]!.id).toBe("u");
  });

  it("keeps a condition moved out of a group the proposal removes", () => {
    const grouped = createFilter({
      id: "root",
      children: [
        createFilterCondition({
          id: "a",
          field: "amount",
          operator: "gt",
          value: 5,
        }),
        createFilter({
          id: "g",
          combinator: "or",
          children: [
            createFilterCondition({
              id: "s",
              field: "status",
              operator: "isAnyOf",
              value: ["open"],
            }),
            createFilterCondition({
              id: "u",
              field: "urgent",
              operator: "is",
              value: true,
            }),
          ],
        }),
      ],
    });
    const proposed = matchFilterProposalIds(
      createFilter({
        children: [
          createFilterCondition({ field: "amount", operator: "gt", value: 5 }),
          createFilterCondition({
            field: "status",
            operator: "isAnyOf",
            value: ["open", "blocked"],
          }),
        ],
      }),
      grouped,
    );
    const changes = getFilterProposalChanges(grouped, proposed);

    expect(print(applyFilterProposalChanges(grouped, proposed, changes))).toBe(
      "amount:>5 status:open,blocked",
    );
  });

  it("keeps a condition moved from a nested group to an otherwise empty root", () => {
    const nested = createFilter({
      id: "root",
      children: [
        createFilter({
          id: "g",
          combinator: "or",
          children: [
            createFilterCondition({
              id: "s",
              field: "status",
              operator: "isAnyOf",
              value: ["open"],
            }),
            createFilterCondition({
              id: "u",
              field: "urgent",
              operator: "is",
              value: true,
            }),
          ],
        }),
      ],
    });
    const proposed = matchFilterProposalIds(
      createFilter({
        children: [
          createFilterCondition({
            field: "status",
            operator: "isAnyOf",
            value: ["open"],
          }),
        ],
      }),
      nested,
    );
    const changes = getFilterProposalChanges(nested, proposed);

    expect(changes.map((change) => [change.kind, change.id])).toEqual([
      ["changed", "s"],
      ["removed", "g"],
    ]);
    expect(print(applyFilterProposalChanges(nested, proposed, changes))).toBe(
      "status:open",
    );
  });

  it("returns the same filter when nothing is applied", () => {
    expect(applyFilterProposalChanges(base, base, [])).toBe(base);
  });
});
