import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createFilter, createFilterCondition, useFilterState } from ".";
import { queryFields } from "./filter-query.fixtures";
import { useSavedViews, type SavedView } from "./use-saved-views";

const openBugs: SavedView = {
  id: "open-bugs",
  name: "Open bugs",
  version: 1,
  scope: "team",
  filter: createFilter({
    id: "v1",
    children: [
      createFilterCondition({
        id: "s",
        field: "status",
        operator: "isAnyOf",
        value: ["open"],
      }),
      createFilterCondition({
        id: "l",
        field: "labels",
        operator: "includesAny",
        value: ["bug"],
      }),
    ],
  }),
};

describe("useSavedViews persistence", () => {
  it("shows saves right away while persistence is pending", () => {
    const onCreate = vi.fn(() => new Promise(() => undefined));
    const { result } = renderHook(() => {
      const state = useFilterState();

      return useSavedViews({
        state,
        fields: queryFields,
        views: [],
        onCreate,
        createId: () => "pending",
      });
    });

    act(() => {
      result.current.saveAs("Draft");
    });

    expect(result.current.views.map((view) => view.id)).toEqual(["pending"]);
    expect(result.current.activeView?.name).toBe("Draft");
  });

  it("rolls an optimistic save back when persistence fails", async () => {
    let fail: (reason: Error) => void = () => undefined;
    const onCreate = vi.fn(
      () =>
        new Promise((_resolve, reject) => {
          fail = reject;
        }),
    );
    const { result } = renderHook(() => {
      const state = useFilterState();

      return useSavedViews({
        state,
        fields: queryFields,
        views: [],
        onCreate,
        createId: () => "doomed",
      });
    });

    act(() => {
      result.current.saveAs("Doomed");
    });
    expect(result.current.views).toHaveLength(1);

    await act(async () => {
      fail(new Error("offline"));
    });
    expect(result.current.views).toEqual([]);
  });

  it("lets later changes to a settled view show through", () => {
    const { rerender, result } = renderHook(
      ({ views }: { views: SavedView[] }) => {
        const state = useFilterState();

        return useSavedViews({ state, fields: queryFields, views });
      },
      { initialProps: { views: [openBugs] } },
    );
    const names = () => result.current.views.map((view) => view.name);

    act(() => {
      result.current.rename("open-bugs", "B");
    });
    // Persisted, then renamed again elsewhere.
    rerender({ views: [{ ...openBugs, name: "B" }] });
    rerender({ views: [{ ...openBugs, name: "C" }] });
    expect(names()).toEqual(["C"]);

    act(() => {
      result.current.remove("open-bugs");
    });
    rerender({ views: [] });
    // Restored, e.g. by an undo toast.
    rerender({ views: [openBugs] });
    expect(names()).toEqual(["Open bugs"]);
  });

  it("restores the active view when a save or delete is rejected", async () => {
    const rejecters: ((reason: Error) => void)[] = [];
    const failing = () =>
      new Promise((_resolve, reject) => {
        rejecters.push(reject);
      });
    const { result } = renderHook(() => {
      const state = useFilterState();

      return useSavedViews({
        state,
        fields: queryFields,
        views: [openBugs],
        defaultActiveViewId: "open-bugs",
        onCreate: failing,
        onDelete: failing,
        createId: () => "ghost",
      });
    });

    act(() => {
      result.current.saveAs("Ghost");
    });
    expect(result.current.activeViewId).toBe("ghost");
    await act(async () => {
      rejecters[0]?.(new Error("offline"));
    });
    expect(result.current.activeViewId).toBe("open-bugs");

    act(() => {
      result.current.remove("open-bugs");
    });
    expect(result.current.activeViewId).toBeNull();
    await act(async () => {
      rejecters[1]?.(new Error("offline"));
    });
    expect(result.current.activeView?.id).toBe("open-bugs");
  });

  it("deletes a view whose create is still in flight once it lands", async () => {
    let finishCreate: () => void = () => undefined;
    let finishDelete: () => void = () => undefined;
    const onDelete = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishDelete = resolve;
        }),
    );
    const { rerender, result } = renderHook(
      ({ views }: { views: SavedView[] }) => {
        const state = useFilterState();

        return useSavedViews({
          state,
          fields: queryFields,
          views,
          createId: () => "late",
          onCreate: () =>
            new Promise<void>((resolve) => {
              finishCreate = resolve;
            }),
          onDelete,
        });
      },
      { initialProps: { views: [] as SavedView[] } },
    );

    act(() => {
      result.current.saveAs("Late");
    });
    const created = result.current.views[0] as SavedView;

    act(() => {
      result.current.remove("late");
    });
    expect(result.current.views).toEqual([]);
    expect(onDelete).not.toHaveBeenCalled();

    // The create lands and the consumer adds the view; the delete starts.
    await act(async () => {
      finishCreate();
    });
    rerender({ views: [created] });
    expect(onDelete).toHaveBeenCalledWith(created);
    expect(result.current.views).toEqual([]);

    // The delete lands and the consumer removes the view.
    await act(async () => {
      finishDelete();
    });
    rerender({ views: [] });
    // A later re-add (e.g. undo) shows again: nothing is left pending.
    rerender({ views: [created] });
    expect(result.current.views.map((view) => view.id)).toEqual(["late"]);
  });

  it("settles a deleted-while-creating view that a refetch never shows", async () => {
    let finishCreate: () => void = () => undefined;
    const { rerender, result } = renderHook(
      ({ views }: { views: SavedView[] }) => {
        const state = useFilterState();

        return useSavedViews({
          state,
          fields: queryFields,
          views,
          createId: () => "late",
          onCreate: () =>
            new Promise<void>((resolve) => {
              finishCreate = resolve;
            }),
          onDelete: () => Promise.resolve(),
        });
      },
      { initialProps: { views: [] as SavedView[] } },
    );

    act(() => {
      result.current.saveAs("Late");
    });
    const created = result.current.views[0] as SavedView;

    act(() => {
      result.current.remove("late");
    });
    // Create and delete both land before the next refetch.
    await act(async () => {
      finishCreate();
    });
    rerender({ views: [] });
    // Nothing stays pending: the view shows if it comes back.
    rerender({ views: [created] });
    expect(result.current.views.map((view) => view.id)).toEqual(["late"]);
  });

  it("keeps a new view when renaming it fails before its create lands", async () => {
    let failRename: () => void = () => undefined;
    const { result } = renderHook(() => {
      const state = useFilterState();

      return useSavedViews({
        state,
        fields: queryFields,
        views: [],
        createId: () => "fresh",
        onCreate: () => new Promise(() => undefined),
        onUpdate: () =>
          new Promise<void>((_resolve, reject) => {
            failRename = () => reject(new Error("offline"));
          }),
      });
    });

    act(() => {
      result.current.saveAs("Fresh");
    });
    act(() => {
      result.current.rename("fresh", "Renamed");
    });
    expect(result.current.activeView?.name).toBe("Renamed");

    await act(async () => {
      failRename();
    });

    expect(result.current.views.map((view) => view.name)).toEqual(["Fresh"]);
    expect(result.current.activeView?.id).toBe("fresh");
  });

  it.each([
    ["in order", [0, 1]],
    ["in reverse", [1, 0]],
  ])(
    "rolls back to the persisted name when chained renames fail %s",
    async (_order, sequence) => {
      const rejecters: (() => void)[] = [];
      const { result } = renderHook(() => {
        const state = useFilterState();

        return useSavedViews({
          state,
          fields: queryFields,
          views: [{ ...openBugs, name: "Original" }],
          onUpdate: () =>
            new Promise<void>((_resolve, reject) => {
              rejecters.push(() => reject(new Error("offline")));
            }),
        });
      });
      const names = () => result.current.views.map((view) => view.name);

      act(() => {
        result.current.rename("open-bugs", "First");
      });
      act(() => {
        result.current.rename("open-bugs", "Second");
      });
      expect(names()).toEqual(["Second"]);

      await act(async () => {
        rejecters[sequence[0] ?? 0]?.();
      });
      // One failed; the other is still in flight.
      expect(names()).toEqual([sequence[0] === 0 ? "Second" : "First"]);

      await act(async () => {
        rejecters[sequence[1] ?? 1]?.();
      });
      expect(names()).toEqual(["Original"]);
    },
  );

  it("drops the tombstone when a create that was deleted fails", async () => {
    let failCreate: () => void = () => undefined;
    const onDelete = vi.fn();
    const { result } = renderHook(() => {
      const state = useFilterState();

      return useSavedViews({
        state,
        fields: queryFields,
        views: [],
        createId: () => "never",
        onCreate: () =>
          new Promise<void>((_resolve, reject) => {
            failCreate = () => reject(new Error("offline"));
          }),
        onDelete,
      });
    });

    act(() => {
      result.current.saveAs("Never");
    });
    act(() => {
      result.current.remove("never");
    });
    await act(async () => {
      failCreate();
    });

    expect(result.current.views).toEqual([]);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
