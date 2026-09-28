import { describe, expect, it } from "vitest";
import {
  addFilterNode,
  canAddFilterGroup,
  canWrapFilterNode,
  createFilter,
  createFilterCondition,
  createFilterPredicate,
  defineFilterFields,
  describeFilter,
  findFilterParent,
  getFilterHeight,
  getFilterNodeDepth,
  moveFilterNode,
  normalizeFilter,
  removeFilterNode,
  shiftFilterNode,
  unwrapFilterGroup,
  updateFilterCondition,
  updateFilterGroup,
  validateFilter,
  wrapFilterNode,
  type Filter,
} from ".";

const fields = defineFilterFields<{ status: string; team: string }>([
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "open", label: "Open" },
      { value: "done", label: "Done" },
    ],
  },
  {
    key: "team",
    label: "Team",
    type: "option",
    options: [
      { value: "web", label: "Web" },
      { value: "api", label: "API" },
    ],
  },
]);

const condition = (id: string, field: string, value: string) =>
  createFilterCondition({ id, field, operator: "isAnyOf", value: [value] });

// root(and): open, (or: web, (and: api, done))
function tree(): Filter {
  return createFilter({
    id: "root",
    children: [
      condition("open", "status", "open"),
      createFilter({
        id: "teams",
        combinator: "or",
        children: [
          condition("web", "team", "web"),
          createFilter({
            id: "inner",
            children: [
              condition("api", "team", "api"),
              condition("done", "status", "done"),
            ],
          }),
        ],
      }),
    ],
  });
}

const ids = (filter: Filter) =>
  JSON.stringify(filter, (key, value: unknown) =>
    key === "type" || key === "operator" || key === "field" || key === "value"
      ? undefined
      : value,
  );

describe("filter group structure", () => {
  it("evaluates mixed and/or nesting", () => {
    const rows = [
      { status: "open", team: "web" },
      { status: "open", team: "api" },
      { status: "done", team: "api" },
    ];
    const withDone = updateFilterCondition(tree(), "done", {
      value: ["open"],
    });

    expect(rows.map(createFilterPredicate(tree(), fields))).toEqual([
      true,
      false,
      false,
    ]);
    expect(rows.map(createFilterPredicate(withDone, fields))).toEqual([
      true,
      true,
      false,
    ]);
    expect(describeFilter(tree(), fields)).toBe(
      "Status is Open, and (Team is Web, or (Team is API, and Status is Done))",
    );
  });

  it("reports depth, height and parents", () => {
    const filter = tree();

    expect(getFilterNodeDepth(filter, "root")).toBe(1);
    expect(getFilterNodeDepth(filter, "open")).toBe(1);
    expect(getFilterNodeDepth(filter, "teams")).toBe(2);
    expect(getFilterNodeDepth(filter, "api")).toBe(3);
    expect(getFilterNodeDepth(filter, "missing")).toBeUndefined();
    expect(getFilterHeight(filter)).toBe(3);
    expect(findFilterParent(filter, "api")).toMatchObject({
      parent: { id: "inner" },
      index: 0,
    });
    expect(findFilterParent(filter, "root")).toBeUndefined();
  });

  it("applies the same depth limit to adding, wrapping and validation", () => {
    const filter = tree();

    expect(canAddFilterGroup(filter, "root")).toBe(true);
    expect(canAddFilterGroup(filter, "teams")).toBe(true);
    expect(canAddFilterGroup(filter, "inner")).toBe(false);
    expect(canAddFilterGroup(filter, "teams", 2)).toBe(false);
    expect(canWrapFilterNode(filter, "open")).toBe(true);
    expect(canWrapFilterNode(filter, "web")).toBe(true);
    expect(canWrapFilterNode(filter, "api")).toBe(false);
    // Wrapping "teams" would push "inner" to level 4.
    expect(canWrapFilterNode(filter, "teams")).toBe(false);
    expect(canWrapFilterNode(filter, "teams", 4)).toBe(true);
    expect(validateFilter(filter, fields)).toEqual([]);
    expect(
      validateFilter(filter, fields, { maxDepth: 2 }).map(
        ({ code, nodeId }) => [code, nodeId],
      ),
    ).toEqual([["max-depth", "inner"]]);
  });

  it("wraps and unwraps nodes in place", () => {
    const wrapped = wrapFilterNode(tree(), "open", {
      combinator: "or",
      groupId: "wrap",
    });

    expect(wrapped.children[0]).toMatchObject({
      type: "group",
      id: "wrap",
      combinator: "or",
      children: [{ id: "open" }],
    });
    expect(ids(unwrapFilterGroup(wrapped, "wrap"))).toBe(ids(tree()));
    expect(
      unwrapFilterGroup(tree(), "teams").children.map((child) => child.id),
    ).toEqual(["open", "web", "inner"]);
  });

  it("moves nodes between groups and shifts them among siblings", () => {
    const moved = moveFilterNode(tree(), "open", {
      parentId: "inner",
      index: 1,
    });
    const inner = findFilterParent(moved, "open")?.parent;

    expect(inner?.id).toBe("inner");
    expect(inner?.children.map((child) => child.id)).toEqual([
      "api",
      "open",
      "done",
    ]);
    expect(moveFilterNode(tree(), "teams", { parentId: "inner" })).toEqual(
      tree(),
    );
    // Missing or non-group destinations leave the filter unchanged.
    expect(moveFilterNode(tree(), "open", { parentId: "missing" })).toEqual(
      tree(),
    );
    expect(moveFilterNode(tree(), "open", { parentId: "web" })).toEqual(tree());
    expect(
      shiftFilterNode(tree(), "teams", -1).children.map((child) => child.id),
    ).toEqual(["teams", "open"]);
    expect(shiftFilterNode(tree(), "open", -1)).toEqual(tree());
    expect(shiftFilterNode(tree(), "teams", 1)).toEqual(tree());
  });

  it("keeps user-added empty groups when unrelated nodes are removed", () => {
    const withEmpty = addFilterNode(tree(), createFilter({ id: "empty" }));
    const removed = removeFilterNode(withEmpty, "open");

    expect(removed.children.map((child) => child.id)).toEqual([
      "teams",
      "empty",
    ]);
    // A group emptied by the removal itself still goes.
    expect(
      removeFilterNode(removeFilterNode(tree(), "api"), "done").children[1],
    ).toMatchObject({ id: "teams", children: [{ id: "web" }] });
    expect(describeFilter(withEmpty, fields)).toBe(
      describeFilter(tree(), fields),
    );
  });

  it("toggles negation without leaving false flags behind", () => {
    const negated = updateFilterGroup(tree(), "teams", { not: true });

    expect(negated.children[1]).toMatchObject({ not: true });
    expect(
      "not" in
        (updateFilterGroup(negated, "teams", { not: undefined }).children[1] ??
          {}),
    ).toBe(false);
    expect(
      "not" in
        (updateFilterCondition(
          updateFilterCondition(tree(), "open", { not: true }),
          "open",
          { not: undefined },
        ).children[0] ?? {}),
    ).toBe(false);
  });

  it("normalizes single-child and empty groups", () => {
    const filter = addFilterNode(
      wrapFilterNode(tree(), "open", { groupId: "solo" }),
      createFilter({ id: "empty" }),
    );

    expect(normalizeFilter(filter).children.map((child) => child.id)).toEqual([
      "open",
      "teams",
    ]);
  });
});
