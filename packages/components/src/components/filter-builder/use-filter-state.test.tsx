import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createFilter,
  createFilterCondition,
  useFilterState,
  type Filter,
} from ".";

const status = () =>
  createFilterCondition({
    id: "status",
    field: "status",
    operator: "isAnyOf",
    value: ["open"],
  });

describe("useFilterState", () => {
  it("records each command as one undoable step", () => {
    const { result } = renderHook(() => useFilterState());

    expect(result.current.filter.children).toEqual([]);
    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.addNode(status());
    });
    act(() => {
      result.current.updateCondition("status", { value: ["open", "done"] });
    });

    expect(result.current.filter.children).toHaveLength(1);

    act(() => {
      result.current.undo();
    });

    expect(result.current.filter.children[0]).toMatchObject({
      value: ["open"],
    });
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });

    expect(result.current.filter.children[0]).toMatchObject({
      value: ["open", "done"],
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.filter.children).toEqual([]);
  });

  it("coalesces commits that share a key into one history entry", () => {
    const { result } = renderHook(() => useFilterState());

    act(() => {
      result.current.addNode(status(), { coalesceKey: "edit" });
      result.current.updateCondition(
        "status",
        { value: ["open", "done"] },
        { coalesceKey: "edit" },
      );
      result.current.updateCondition(
        "status",
        { value: ["done"] },
        { coalesceKey: "edit" },
      );
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.filter.children).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it("skips history when asked and caps the history length", () => {
    const { result } = renderHook(() => useFilterState({ historyLimit: 2 }));

    act(() => {
      result.current.addNode(status(), { history: false });
    });

    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.setCombinator(result.current.filter.id, "or");
    });
    act(() => {
      result.current.setCombinator(result.current.filter.id, "and");
    });
    act(() => {
      result.current.setCombinator(result.current.filter.id, "or");
    });
    act(() => {
      result.current.undo();
      result.current.undo();
      result.current.undo();
    });

    expect(result.current.filter.combinator).toBe("or");
  });

  it("records each group command as one undoable step", () => {
    const { result } = renderHook(() => useFilterState());
    const snapshots: Filter[] = [];
    const run = (command: () => void) => {
      snapshots.push(result.current.filter);
      act(command);
    };

    run(() => {
      result.current.addNode(status());
    });
    run(() => {
      result.current.wrapInGroup("status", { groupId: "group" });
    });
    run(() => {
      result.current.setCombinator("group", "or");
    });
    run(() => {
      result.current.setNegated("group", true);
    });
    run(() => {
      result.current.setNegated("status", true);
    });
    run(() => {
      result.current.moveNode("status", { parentId: result.current.filter.id });
    });
    run(() => {
      result.current.shiftNode("status", -1);
    });
    run(() => {
      result.current.unwrapGroup("group");
    });

    for (const snapshot of snapshots.reverse()) {
      act(() => {
        result.current.undo();
      });
      expect(result.current.filter).toEqual(snapshot);
    }

    expect(result.current.canUndo).toBe(false);
  });

  it("emits changes in controlled mode without owning the value", () => {
    const onValueChange = vi.fn<(filter: Filter) => void>();
    const value = createFilter({ id: "root" });
    const { result } = renderHook(() =>
      useFilterState({ value, onValueChange }),
    );

    act(() => {
      result.current.addNode(status());
    });

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0].children).toHaveLength(1);
    expect(result.current.filter).toBe(value);
  });
});
