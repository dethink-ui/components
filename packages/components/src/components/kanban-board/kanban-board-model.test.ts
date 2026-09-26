import { describe, expect, it } from "vitest";
import {
  applyKanbanMove,
  getKanbanCell,
  getKanbanDropRefusal,
  getKanbanLocation,
  getKanbanWipState,
  resolveKanbanLaneId,
  resolveKanbanWipLimit,
  type KanbanItem,
} from "./kanban-board-model";

const items: KanbanItem[] = [
  { id: "a", columnId: "todo" },
  { id: "b", columnId: "doing" },
  { id: "c", columnId: "todo" },
  { id: "d", columnId: "todo" },
];

const ids = (list: readonly KanbanItem[]) => list.map((item) => item.id);

describe("applyKanbanMove", () => {
  it("reorders within a column", () => {
    const next = applyKanbanMove(items, {
      itemId: "d",
      to: { columnId: "todo", index: 0 },
    });

    expect(ids(getKanbanCell(next, "todo"))).toEqual(["d", "a", "c"]);
  });

  it("moves across columns and clamps the index", () => {
    const next = applyKanbanMove(items, {
      itemId: "a",
      to: { columnId: "doing", index: 99 },
    });

    expect(ids(getKanbanCell(next, "doing"))).toEqual(["b", "a"]);
    expect(next.find((item) => item.id === "a")?.columnId).toBe("doing");
  });

  it("moves into an empty column", () => {
    const next = applyKanbanMove(items, {
      itemId: "c",
      to: { columnId: "done", index: 0 },
    });

    expect(ids(getKanbanCell(next, "done"))).toEqual(["c"]);
  });

  it("does not mutate the input and is idempotent", () => {
    const snapshot = JSON.stringify(items);
    const move = { itemId: "a", to: { columnId: "todo", index: 2 } };
    const once = applyKanbanMove(items, move);

    expect(JSON.stringify(items)).toBe(snapshot);
    expect(applyKanbanMove(once, move)).toEqual(once);
  });

  it("returns a copy when the item is unknown", () => {
    const next = applyKanbanMove(items, {
      itemId: "zzz",
      to: { columnId: "todo", index: 0 },
    });

    expect(next).toEqual(items);
    expect(next).not.toBe(items);
  });

  it("moves between lanes and assigns laneId", () => {
    const lanes = [
      { id: "ann", title: "Ann" },
      { id: "bo", title: "Bo" },
    ];
    const laneItems: KanbanItem[] = [
      { id: "x", columnId: "todo", laneId: "ann" },
      { id: "y", columnId: "todo" },
      { id: "z", columnId: "todo", laneId: "bo" },
    ];
    const next = applyKanbanMove(
      laneItems,
      { itemId: "x", to: { columnId: "todo", laneId: "bo", index: 0 } },
      lanes,
    );

    expect(ids(getKanbanCell(next, "todo", "bo", lanes))).toEqual(["x", "z"]);
    // Items without a known lane fall into the first lane.
    expect(ids(getKanbanCell(next, "todo", "ann", lanes))).toEqual(["y"]);
  });
});

describe("locations and lanes", () => {
  it("finds an item's location", () => {
    expect(getKanbanLocation(items, "c")).toEqual({
      columnId: "todo",
      laneId: undefined,
      index: 1,
    });
    expect(getKanbanLocation(items, "missing")).toBeNull();
  });

  it("resolves unknown lanes to the first lane", () => {
    const lanes = [{ id: "one", title: "One" }];

    expect(resolveKanbanLaneId({ laneId: "nope" }, lanes)).toBe("one");
    expect(resolveKanbanLaneId({ laneId: "one" }, lanes)).toBe("one");
    expect(resolveKanbanLaneId({}, undefined)).toBeUndefined();
  });
});

describe("WIP limits", () => {
  it("normalises numeric and object limits", () => {
    expect(resolveKanbanWipLimit(3)).toEqual({
      max: 3,
      min: null,
      mode: "soft",
    });
    expect(resolveKanbanWipLimit({ max: 4, min: 9, mode: "hard" })).toEqual({
      max: 4,
      min: 4,
      mode: "hard",
    });
    expect(resolveKanbanWipLimit(Number.NaN)).toBeNull();
    expect(resolveKanbanWipLimit(undefined)).toBeNull();
  });

  it("derives status", () => {
    expect(getKanbanWipState(2, undefined).status).toBe("none");
    expect(getKanbanWipState(1, { max: 4, min: 2 }).status).toBe("under");
    expect(getKanbanWipState(3, 4).status).toBe("ok");
    expect(getKanbanWipState(4, 4).status).toBe("at");
    expect(getKanbanWipState(5, 4).status).toBe("over");
  });

  it("refuses drops into full hard-limited or disabled columns", () => {
    const hard = {
      id: "doing",
      title: "Doing",
      wipLimit: { max: 1, mode: "hard" as const },
    };

    expect(getKanbanDropRefusal(items, "a", hard)).toBe("limit");
    // Reordering inside the full column is always allowed.
    expect(getKanbanDropRefusal(items, "b", hard)).toBeNull();
    expect(
      getKanbanDropRefusal(items, "a", { ...hard, wipLimit: 1 }),
    ).toBeNull();
    expect(
      getKanbanDropRefusal(items, "a", {
        id: "done",
        title: "Done",
        dropDisabled: true,
      }),
    ).toBe("disabled");
  });
});
