import { describe, expect, it } from "vitest";
import {
  createFilter,
  createFilterCondition,
  reconcileFilterIds,
  type FilterNode,
} from ".";

const title = (id: string, value: string) =>
  createFilterCondition({ id, field: "title", operator: "contains", value });

function ids(node: FilterNode): string[] {
  return node.type === "group"
    ? [node.id, ...node.children.flatMap(ids)]
    : [node.id];
}

describe("reconcileFilterIds", () => {
  it("reuses ids of matching nodes and keeps the root id", () => {
    const previous = createFilter({ id: "root", children: [title("a", "x")] });
    const next = createFilter({
      id: "new",
      children: [title("n1", "x"), title("n2", "y")],
    });

    expect(ids(reconcileFilterIds(next, previous))).toEqual([
      "root",
      "a",
      "n2",
    ]);
  });

  it("never duplicates an id a match already took", () => {
    // A saved view [a: foo, b: bar] applied over the live filter [a: bar].
    const view = createFilter({
      id: "view",
      children: [title("a", "foo"), title("b", "bar")],
    });
    const live = createFilter({ id: "root", children: [title("a", "bar")] });
    const result = ids(reconcileFilterIds(view, live));

    expect(new Set(result).size).toBe(result.length);
    // "bar" keeps the live chip's id; "foo" needs a fresh one.
    expect(result[2]).toBe("a");
    expect(result[1]).not.toBe("a");
  });

  it("keeps an edited node's own id when nothing else took it", () => {
    const previous = createFilter({ id: "root", children: [title("a", "x")] });
    const edited = createFilter({ id: "root", children: [title("a", "y")] });

    expect(ids(reconcileFilterIds(edited, previous))).toEqual(["root", "a"]);
  });

  it("gives repeated ids in the new filter fresh ids", () => {
    const previous = createFilter({ id: "root" });
    const next = createFilter({
      children: [title("same", "x"), title("same", "y")],
    });
    const result = ids(reconcileFilterIds(next, previous));

    expect(new Set(result).size).toBe(3);
  });
});
