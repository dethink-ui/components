import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createFilter,
  createFilterCondition,
  printFilterQuery,
  type Filter,
} from ".";
import { queryFields } from "./filter-query.fixtures";
import {
  createHistoryFilterStore,
  createMemoryFilterStore,
} from "./filter-url-store";
import {
  useFilterUrlState,
  type UseFilterUrlStateOptions,
} from "./use-filter-url-state";

const open = createFilterCondition({
  id: "open",
  field: "status",
  operator: "isAnyOf",
  value: ["open"],
});

function setup(
  search: string,
  options: Partial<UseFilterUrlStateOptions> = {},
) {
  const store = createMemoryFilterStore(search);
  const write = vi.spyOn(store, "write");
  const hook = renderHook(() =>
    useFilterUrlState({ fields: queryFields, store, ...options }),
  );
  const text = () => printFilterQuery(hook.result.current.filter, queryFields);

  return { ...hook, store, text, write };
}

describe("useFilterUrlState", () => {
  it("starts from the URL without writing to it", () => {
    const { store, text, write } = setup("?q=status:open+urgent:yes&v=1");

    expect(text()).toBe("status:open urgent:yes");
    expect(write).not.toHaveBeenCalled();
    expect(store.read()).toBe("?q=status:open+urgent:yes&v=1");
  });

  it("writes readable text on change and keeps other params", () => {
    const { result, store } = setup("?page=2");

    act(() => {
      result.current.addNode(open);
    });
    expect(store.read()).toBe("?page=2&q=status:open&v=1");

    act(() => {
      result.current.undo();
    });
    expect(store.read()).toBe("?page=2");
  });

  it("follows outside URL changes without adding undo steps", () => {
    const { result, store, text } = setup("?q=status:open&v=1");

    act(() => {
      store.write("?q=labels:bug&v=1");
    });

    expect(text()).toBe("labels:bug");
    expect(result.current.canUndo).toBe(false);
  });

  it("keeps chips without a value when the URL text is unchanged", () => {
    const { result, store } = setup("?q=status:open&v=1");

    act(() => {
      result.current.addNode(
        createFilterCondition({ id: "draft", field: "amount", operator: "gt" }),
      );
    });
    expect(store.read()).toBe("?q=status:open&v=1");

    act(() => {
      store.write("?q=status:open&v=1&x=1");
    });
    expect(result.current.filter.children.map((node) => node.id)).toContain(
      "draft",
    );
  });

  it("ignores its own writes when a router delivers them late", () => {
    // A store like router.replace: writes land later, one at a time.
    const inner = createMemoryFilterStore("");
    const queue: string[] = [];
    const store = {
      ...inner,
      write: (search: string) => {
        queue.push(search);
      },
    };
    const deliver = () => {
      act(() => {
        inner.write(queue.shift() ?? "");
      });
    };
    const { result } = renderHook(() =>
      useFilterUrlState({ fields: queryFields, store }),
    );

    act(() => {
      result.current.addNode(open);
    });
    act(() => {
      result.current.addNode(
        createFilterCondition({
          id: "bug",
          field: "title",
          operator: "contains",
          value: "bug",
        }),
      );
    });
    act(() => {
      result.current.addNode(
        createFilterCondition({ id: "draft", field: "amount", operator: "gt" }),
      );
    });

    const ids = () => result.current.filter.children.map((node) => node.id);

    expect(queue).toHaveLength(2);
    deliver();
    expect(ids()).toEqual(["open", "bug", "draft"]);
    deliver();
    expect(ids()).toEqual(["open", "bug", "draft"]);

    // A real outside change still applies.
    act(() => {
      inner.write("?q=urgent:yes&v=1");
    });
    expect(printFilterQuery(result.current.filter, queryFields)).toBe(
      "urgent:yes",
    );
  });

  it("forgets writes a merging router never reports", () => {
    vi.useFakeTimers();

    try {
      // A store that applies only the last of a burst of writes, and only
      // notifies when the search actually changes.
      const inner = createMemoryFilterStore("");
      let queued: string | undefined;
      const store = {
        ...inner,
        write: (search: string) => {
          queued = search;
        },
      };
      const { result } = renderHook(() =>
        useFilterUrlState({ fields: queryFields, store }),
      );

      act(() => {
        result.current.addNode(open);
      });
      act(() => {
        result.current.undo();
      });
      // The router settles on "" again: no change to report.
      act(() => {
        inner.write(queued ?? "");
      });

      vi.advanceTimersByTime(2500);

      // Later, a link to the filter that was written and undone.
      act(() => {
        inner.write("?q=status:open&v=1");
      });
      expect(printFilterQuery(result.current.filter, queryFields)).toBe(
        "status:open",
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("waits for a slow router while edits keep coming", () => {
    vi.useFakeTimers();

    try {
      const inner = createMemoryFilterStore("");
      const queue: string[] = [];
      const store = {
        ...inner,
        write: (search: string) => {
          queue.push(search);
        },
      };
      const { result } = renderHook(() =>
        useFilterUrlState({ fields: queryFields, store }),
      );

      act(() => {
        result.current.addNode(open);
      });
      vi.advanceTimersByTime(1000);
      act(() => {
        result.current.addNode(
          createFilterCondition({
            field: "urgent",
            operator: "is",
            value: true,
          }),
        );
      });
      vi.advanceTimersByTime(1100);

      // The first write lands 2.1 s after it was made.
      act(() => {
        inner.write(queue.shift() ?? "");
      });
      expect(printFilterQuery(result.current.filter, queryFields)).toBe(
        "status:open urgent:yes",
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("recognizes its own writes when they land out of order", () => {
    const inner = createMemoryFilterStore("");
    const queue: string[] = [];
    const store = {
      ...inner,
      write: (search: string) => {
        queue.push(search);
      },
    };
    const { result } = renderHook(() =>
      useFilterUrlState({ fields: queryFields, store }),
    );

    act(() => {
      result.current.addNode(open);
    });
    act(() => {
      result.current.addNode(
        createFilterCondition({ field: "urgent", operator: "is", value: true }),
      );
    });

    const [first, second] = queue;

    // The newer write lands first, then the older one.
    act(() => {
      inner.write(second ?? "");
    });
    act(() => {
      inner.write(first ?? "");
    });

    expect(printFilterQuery(result.current.filter, queryFields)).toBe(
      "status:open urgent:yes",
    );
  });

  it("times expiry from the last write, not the oldest unacknowledged one", () => {
    vi.useFakeTimers();

    try {
      const inner = createMemoryFilterStore("");
      const queue: string[] = [];
      const store = {
        ...inner,
        write: (search: string) => {
          queue.push(search);
        },
      };
      const { result } = renderHook(() =>
        useFilterUrlState({ fields: queryFields, store }),
      );

      act(() => {
        result.current.addNode(open);
      });
      vi.advanceTimersByTime(1000);
      act(() => {
        result.current.addNode(
          createFilterCondition({
            field: "urgent",
            operator: "is",
            value: true,
          }),
        );
      });

      const [first, second] = queue;

      // B is acknowledged first; A lands 2.1 s after it was written but
      // only 1.1 s after the last write.
      act(() => {
        inner.write(second ?? "");
      });
      vi.advanceTimersByTime(1100);
      act(() => {
        inner.write(first ?? "");
      });

      expect(printFilterQuery(result.current.filter, queryFields)).toBe(
        "status:open urgent:yes",
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("writes an undo to a URL a merging router skipped", () => {
    // Applies only the last of a burst of writes.
    const inner = createMemoryFilterStore("");
    const queue: string[] = [];
    const store = {
      ...inner,
      write: (search: string) => {
        queue.push(search);
      },
    };
    const flushLast = () => {
      act(() => {
        inner.write(queue.at(-1) ?? "");
        queue.length = 0;
      });
    };
    const { result } = renderHook(() =>
      useFilterUrlState({ fields: queryFields, store }),
    );

    act(() => {
      result.current.addNode(open);
    });
    act(() => {
      result.current.addNode(
        createFilterCondition({ field: "urgent", operator: "is", value: true }),
      );
    });
    // Only B lands; A stays unacknowledged.
    flushLast();
    expect(inner.read()).toBe("?q=status:open+urgent:yes&v=1");

    act(() => {
      result.current.undo();
    });
    flushLast();

    expect(printFilterQuery(result.current.filter, queryFields)).toBe(
      "status:open",
    );
    expect(inner.read()).toBe("?q=status:open&v=1");
  });

  it("reports an unreadable URL, keeps the filter, then replaces the URL", () => {
    const defaultValue = createFilter({ id: "root", children: [open] });
    const { result, store } = setup("?q=(oops&v=1", { defaultValue });

    expect(result.current.urlError).toMatchObject({ code: "invalid-query" });
    expect(result.current.filter).toBe(defaultValue);

    act(() => {
      result.current.clear();
    });
    expect(result.current.urlError).toBeUndefined();
    expect(store.read()).toBe("?q=&v=1");
  });

  it("leaves the default filter out of the URL", () => {
    const defaultValue = createFilter({ id: "root", children: [open] });
    const { result, store, text } = setup("", { defaultValue });

    expect(text()).toBe("status:open");

    act(() => {
      result.current.clear();
    });
    // Empty is not the default, so it needs an explicit empty query.
    expect(store.read()).toBe("?q=&v=1");

    act(() => {
      result.current.undo();
    });
    expect(store.read()).toBe("");
  });

  it("reads an explicit empty query as no filter", () => {
    const defaultValue = createFilter({ id: "root", children: [open] });
    const { result } = setup("?q=&v=1", { defaultValue });

    expect(result.current.filter.children).toEqual([]);
  });

  it("migrates old links", () => {
    const { text } = setup("?q=assignee:@ada&v=1", {
      version: 2,
      fieldsAt: (version) =>
        version === 1
          ? queryFields.map((field) =>
              field.key === "owner" ? { ...field, key: "assignee" } : field,
            )
          : queryFields,
      migrate: (filter: Filter) => ({
        ...filter,
        children: filter.children.map((node) =>
          node.type === "condition" && node.field === "assignee"
            ? { ...node, field: "owner" }
            : node,
        ),
      }),
    });

    expect(text()).toBe("owner:@ada");
  });
});

describe("createHistoryFilterStore", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("replaces the URL, keeps the hash and follows back/forward", () => {
    window.history.replaceState(null, "", "/issues?q=status:open&v=1#top");

    const store = createHistoryFilterStore();
    const { result } = renderHook(() =>
      useFilterUrlState({ fields: queryFields, store }),
    );
    const length = window.history.length;

    act(() => {
      result.current.addNode(
        createFilterCondition({ field: "urgent", operator: "is", value: true }),
      );
    });

    expect(window.location.pathname).toBe("/issues");
    expect(window.location.search).toBe("?q=status:open+urgent:yes&v=1");
    expect(window.location.hash).toBe("#top");
    expect(window.history.length).toBe(length);

    act(() => {
      window.history.replaceState(null, "", "/issues?q=labels:bug&v=1");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(printFilterQuery(result.current.filter, queryFields)).toBe(
      "labels:bug",
    );
  });

  it("doesn't push an entry when only a value-less chip changes", () => {
    window.history.replaceState(null, "", "/?q=amount:>3&v=1");

    const store = createHistoryFilterStore({ mode: "push" });
    const { result } = renderHook(() =>
      useFilterUrlState({ fields: queryFields, store }),
    );
    const length = window.history.length;

    act(() => {
      result.current.addNode(
        createFilterCondition({ field: "title", operator: "contains" }),
      );
    });

    expect(window.history.length).toBe(length);

    act(() => {
      result.current.addNode(
        createFilterCondition({ field: "urgent", operator: "is", value: true }),
      );
    });
    expect(window.history.length).toBe(length + 1);
    expect(window.location.search).toBe("?q=amount:%3E3+urgent:yes&v=1");
  });

  it("keeps other history state but drops router markers, so routers resync", () => {
    window.history.replaceState(
      { __NA: true, _N: true, key: "k1", scroll: 10 },
      "",
      "/issues",
    );

    const replace = vi.spyOn(window.history, "replaceState");

    createHistoryFilterStore().write("?q=a&v=1");

    expect(replace).toHaveBeenCalledWith(
      { key: "k1", scroll: 10 },
      "",
      "/issues?q=a&v=1",
    );
    replace.mockRestore();
  });

  it("pushes history entries in push mode", () => {
    const store = createHistoryFilterStore({ mode: "push" });
    const length = window.history.length;

    store.write("?q=a&v=1");
    expect(window.history.length).toBe(length + 1);
    expect(store.read()).toBe("?q=a&v=1");
  });
});
