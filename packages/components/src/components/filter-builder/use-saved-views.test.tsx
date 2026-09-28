import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  createFilter,
  createFilterCondition,
  printFilterQuery,
  renameFilterField,
  useFilterState,
  type Filter,
} from ".";
import { queryFields } from "./filter-query.fixtures";
import {
  useSavedViews,
  type SavedView,
  type UseSavedViewsOptions,
} from "./use-saved-views";

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

function setup(
  options: Partial<UseSavedViewsOptions> = {},
  initialViews: SavedView[] = [openBugs],
) {
  const onCreate = vi.fn();
  const onUpdate = vi.fn();
  const onDelete = vi.fn();
  const hook = renderHook(() => {
    // A consumer store that persists synchronously.
    const [views, setViews] = useState(initialViews);
    const state = useFilterState();
    const saved = useSavedViews({
      state,
      fields: queryFields,
      views,
      onCreate: (view) => {
        onCreate(view);
        setViews((current) => [...current, view]);
      },
      onUpdate: (view) => {
        onUpdate(view);
        setViews((current) =>
          current.map((item) => (item.id === view.id ? view : item)),
        );
      },
      onDelete: (view) => {
        onDelete(view);
        setViews((current) => current.filter((item) => item.id !== view.id));
      },
      ...options,
    });

    return { saved, state };
  });
  const text = () =>
    printFilterQuery(hook.result.current.state.filter, queryFields);

  return { ...hook, onCreate, onDelete, onUpdate, text };
}

describe("useSavedViews", () => {
  it("applies a view as one undo step", () => {
    const { result, text } = setup();

    act(() => {
      result.current.saved.apply("open-bugs");
    });

    expect(text()).toBe("status:open labels:bug");
    expect(result.current.saved.activeView?.name).toBe("Open bugs");
    expect(result.current.saved.isDirty).toBe(false);

    act(() => {
      result.current.state.undo();
    });
    expect(text()).toBe("");
    expect(result.current.state.canUndo).toBe(false);
  });

  it("tracks dirty state by what the filter does", () => {
    const { result } = setup();

    act(() => {
      result.current.saved.apply("open-bugs");
    });
    act(() => {
      result.current.state.removeNode("l");
    });
    expect(result.current.saved.isDirty).toBe(true);
    expect(result.current.saved.diff.removed).toHaveLength(1);

    // Re-adding the same condition under a new id is clean again.
    act(() => {
      result.current.state.addNode(
        createFilterCondition({
          field: "labels",
          operator: "includesAny",
          value: ["bug"],
        }),
      );
    });
    expect(result.current.saved.isDirty).toBe(false);
    expect(result.current.saved.diff.added).toEqual([]);

    // A chip without a value yet is not a change.
    act(() => {
      result.current.state.addNode(
        createFilterCondition({ field: "amount", operator: "gt" }),
      );
    });
    expect(result.current.saved.isDirty).toBe(false);
  });

  it("saves changes into the active view without incomplete chips", () => {
    const { onUpdate, result } = setup();

    act(() => {
      result.current.saved.apply("open-bugs");
    });
    act(() => {
      result.current.state.removeNode("l");
      result.current.state.addNode(
        createFilterCondition({ field: "amount", operator: "gt" }),
      );
    });
    act(() => {
      result.current.saved.save();
    });

    const saved = onUpdate.mock.lastCall?.[0] as SavedView;

    expect(saved.id).toBe("open-bugs");
    expect(printFilterQuery(saved.filter, queryFields)).toBe("status:open");
    expect(saved.filter.children).toHaveLength(1);
    expect(result.current.saved.isDirty).toBe(false);
  });

  it("saves as a new active view, renames and deletes", () => {
    const { onCreate, onDelete, result } = setup(
      { createId: () => "mine", version: 3 },
      [],
    );

    act(() => {
      result.current.state.addNode(
        createFilterCondition({ field: "urgent", operator: "is", value: true }),
      );
    });
    act(() => {
      result.current.saved.saveAs("Urgent", { scope: "personal" });
    });

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "mine",
        name: "Urgent",
        scope: "personal",
        version: 3,
      }),
    );
    expect(result.current.saved.activeViewId).toBe("mine");

    act(() => {
      result.current.saved.rename("mine", "Hot");
    });
    expect(result.current.saved.activeView?.name).toBe("Hot");

    act(() => {
      result.current.saved.remove("mine");
    });
    expect(onDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "mine" }),
    );
    expect(result.current.saved.views).toEqual([]);
    expect(result.current.saved.activeViewId).toBeNull();
  });

  it("diffs by content even when ids came from elsewhere", () => {
    const { result } = setup();

    act(() => {
      // The same conditions as the view, under other ids (e.g. from a URL).
      result.current.state.setFilter(
        createFilter({
          id: "url",
          children: [
            createFilterCondition({
              id: "p1",
              field: "status",
              operator: "isAnyOf",
              value: ["open"],
            }),
            createFilterCondition({
              id: "p2",
              field: "labels",
              operator: "includesAny",
              value: ["bug"],
            }),
          ],
        }),
      );
    });
    act(() => {
      result.current.saved.apply("open-bugs");
    });
    act(() => {
      result.current.state.removeNode("p2");
    });

    expect(result.current.saved.diff.added).toEqual([]);
    expect(result.current.saved.diff.removed).toMatchObject([
      { field: "labels" },
    ]);
  });

  it("applies a view without duplicating ids of the live filter", () => {
    const view: SavedView = {
      id: "v",
      name: "Two titles",
      version: 1,
      filter: createFilter({
        children: [
          createFilterCondition({
            id: "a",
            field: "title",
            operator: "contains",
            value: "foo",
          }),
          createFilterCondition({
            id: "b",
            field: "title",
            operator: "contains",
            value: "bar",
          }),
        ],
      }),
    };
    const { result } = setup({}, [view]);

    act(() => {
      result.current.saved.apply("v");
    });
    act(() => {
      // Delete chip b, then edit chip a to "bar".
      result.current.state.removeNode("b");
      result.current.state.updateCondition("a", { value: "bar" });
    });

    expect(result.current.saved.diff.removed).toMatchObject([{ value: "foo" }]);

    act(() => {
      result.current.saved.apply("v");
    });

    const childIds = result.current.state.filter.children.map(
      (node) => node.id,
    );

    expect(new Set(childIds).size).toBe(2);
  });

  it("gives the diff stable ids across renders", () => {
    const view: SavedView = {
      id: "swap",
      name: "Swap",
      version: 1,
      filter: createFilter({
        children: [
          createFilterCondition({
            id: "c1",
            field: "title",
            operator: "contains",
            value: "a",
          }),
          createFilterCondition({
            id: "c2",
            field: "title",
            operator: "contains",
            value: "b2",
          }),
        ],
      }),
    };
    const { rerender, result } = setup({}, [view]);

    act(() => {
      result.current.saved.apply("swap");
    });
    act(() => {
      result.current.state.updateCondition("c1", { value: "b" });
      result.current.state.updateCondition("c2", { value: "a" });
    });

    const ids = () =>
      [
        ...result.current.saved.diff.added,
        ...result.current.saved.diff.removed,
        ...result.current.saved.diff.changed.map((change) => change.before),
      ].map((node) => node.id);
    const first = ids();

    rerender();
    expect(ids()).toEqual(first);
    expect(result.current.saved.isDirty).toBe(true);
  });

  it("migrates views saved with an older schema", () => {
    const old: SavedView = {
      id: "old",
      name: "Ada's",
      version: 1,
      filter: createFilter({
        children: [
          createFilterCondition({
            field: "assignee",
            operator: "is",
            value: "ada",
          }),
        ],
      }),
    };
    const { result, text } = setup(
      {
        version: 2,
        migrate: (filter: Filter) =>
          renameFilterField(filter, "assignee", "owner"),
      },
      [old],
    );

    act(() => {
      result.current.saved.apply("old");
    });

    expect(text()).toBe("owner:@ada");
    expect(result.current.saved.isDirty).toBe(false);
  });

  it("supports a controlled active view", () => {
    const onActiveViewChange = vi.fn();
    const { result } = setup({ activeViewId: null, onActiveViewChange });

    act(() => {
      result.current.saved.apply("open-bugs");
    });

    expect(onActiveViewChange).toHaveBeenCalledWith("open-bugs");
    expect(result.current.saved.activeViewId).toBeNull();
  });
});
