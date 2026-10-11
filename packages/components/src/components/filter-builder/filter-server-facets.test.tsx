import { act, render, screen, within } from "@testing-library/react";
import { Activity } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  FilterBar,
  createFilter,
  createFilterCondition,
  getFilterFacetFilter,
  printFilterQuery,
} from ".";
import { fields, statusFilter } from "./filter-bar.fixtures";
import type { FilterFacetRequest } from "./use-server-facets";

describe("getFilterFacetFilter", () => {
  it("leaves out the counted condition and inactive ones", () => {
    const filter = createFilter({
      children: [
        ...statusFilter().children,
        createFilterCondition({ field: "labels", operator: "includesAny" }),
      ],
    });
    const scoped = getFilterFacetFilter(filter, fields, "status", {
      conditionId: "status",
      operator: "isAnyOf",
    });

    expect(scoped && printFilterQuery(scoped, fields)).toBe("api");
  });

  it("is undefined where counts wouldn't be meaningful", () => {
    const either = createFilter({
      combinator: "or",
      children: [
        createFilterCondition({
          id: "s",
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        }),
        createFilterCondition({
          field: "title",
          operator: "contains",
          value: "x",
        }),
      ],
    });

    expect(
      getFilterFacetFilter(either, fields, "status", { conditionId: "s" }),
    ).toBeUndefined();
  });
});

function deferred() {
  let resolve: (counts: Record<string, number>) => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<Record<string, number>>((done, fail) => {
    resolve = done;
    reject = fail;
  });

  return { promise, reject, resolve };
}

describe("FilterBar server facets", () => {
  it("asks the server with the filter to count under, reserving space while loading", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const requests: FilterFacetRequest[] = [];
    const getFacets = vi.fn((request: FilterFacetRequest) => {
      requests.push(request);
      return pending.promise;
    });

    render(
      <FilterBar
        fields={fields}
        defaultValue={statusFilter()}
        getFacets={getFacets}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Change value, Open, Blocked" }),
    );

    const list = await screen.findByRole("listbox", {
      name: "Status",
      hidden: true,
    });

    expect(
      list.querySelectorAll('[data-slot="filter-facet-count-loading"]'),
    ).toHaveLength(3);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.field).toBe("status");
    expect(printFilterQuery(requests[0]!.filter, fields)).toBe("api");

    await act(async () => {
      pending.resolve({ open: 4, blocked: 2 });
    });

    expect(
      list.querySelector('[data-slot="filter-facet-count-loading"]'),
    ).toBeNull();
    expect(
      within(list).getByRole("option", {
        name: "Open, 4 matching",
        hidden: true,
      }),
    ).toBeInTheDocument();
    expect(
      within(list).getByRole("option", {
        name: "Done, 0 matching",
        hidden: true,
      }),
    ).toBeInTheDocument();
  });

  it("caches counts per filter and asks again when the filter changes", async () => {
    const user = userEvent.setup();
    const getFacets = vi.fn(async () => ({ open: 1 }));

    render(
      <FilterBar
        fields={fields}
        defaultValue={statusFilter()}
        getFacets={getFacets}
      />,
    );

    const openStatus = async () => {
      await user.click(
        screen.getByRole("button", { name: /^Change value, Open/ }),
      );
      await screen.findByRole("option", {
        name: "Open, 1 matching",
        hidden: true,
      });
      await user.keyboard("{Escape}");
    };

    await openStatus();
    await openStatus();
    expect(getFacets).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole("button", {
        name: 'Remove filter, Title contains "api"',
      }),
    );
    await openStatus();
    expect(getFacets).toHaveBeenCalledTimes(2);
  });

  it("drops the placeholder when a request fails", async () => {
    const user = userEvent.setup();
    const failing = deferred();
    let signal: AbortSignal | undefined;
    const { unmount } = render(
      <FilterBar
        fields={fields}
        defaultValue={statusFilter()}
        getFacets={(request) => {
          signal = request.signal;
          return failing.promise;
        }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Change value, Open, Blocked" }),
    );
    await act(async () => {
      failing.reject(new Error("offline"));
    });

    expect(
      document.querySelector('[data-slot="filter-facet-count-loading"]'),
    ).toBeNull();
    expect(
      screen.getByRole("option", { name: "Open", hidden: true }),
    ).toBeInTheDocument();

    unmount();
    // Already settled: nothing to abort.
    expect(signal?.aborted).toBe(false);
  });

  it("aborts a request still running on unmount", async () => {
    const user = userEvent.setup();
    let signal: AbortSignal | undefined;
    const { unmount } = render(
      <FilterBar
        fields={fields}
        defaultValue={statusFilter()}
        getFacets={(request) => {
          signal = request.signal;
          return new Promise(() => undefined);
        }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Change value, Open, Blocked" }),
    );
    await screen.findAllByRole("option", { hidden: true });
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it("refetches when facetsKey changes, not when an inline getFacets does", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const bar = (range: string) => (
      <FilterBar
        fields={fields}
        defaultValue={statusFilter()}
        facetsKey={range}
        // A new function every render.
        getFacets={async () => {
          calls.push(range);
          return { open: range === "1h" ? 1 : 99 };
        }}
      />
    );
    const { rerender } = render(bar("1h"));
    const openStatus = async (count: number) => {
      await user.click(
        screen.getByRole("button", { name: /^Change value, Open/ }),
      );
      await screen.findByRole("option", {
        name: `Open, ${count} matching`,
        hidden: true,
      });
      await user.keyboard("{Escape}");
    };

    await openStatus(1);
    rerender(bar("1h"));
    await openStatus(1);
    expect(calls).toEqual(["1h"]);

    rerender(bar("24h"));
    await openStatus(99);
    expect(calls).toEqual(["1h", "24h"]);
  });

  it("asks again after being hidden mid-request", async () => {
    const user = userEvent.setup();
    let calls = 0;
    const pending: ((counts: Record<string, number>) => void)[] = [];
    const bar = (mode: "visible" | "hidden") => (
      <Activity mode={mode}>
        <FilterBar
          fields={fields}
          defaultValue={statusFilter()}
          getFacets={() =>
            new Promise((resolve) => {
              calls += 1;
              pending.push(resolve);
            })
          }
        />
      </Activity>
    );
    const { rerender } = render(bar("visible"));

    await user.click(
      screen.getByRole("button", { name: "Change value, Open, Blocked" }),
    );
    await screen.findAllByRole("option", { hidden: true });
    expect(calls).toBe(1);
    // Close the picker; the request is still running.
    await user.keyboard("{Escape}");

    rerender(bar("hidden"));
    await act(async () => {
      pending[0]?.({ open: 3 });
    });
    rerender(bar("visible"));
    await user.click(
      screen.getByRole("button", { name: "Change value, Open, Blocked" }),
    );
    await act(async () => {
      pending.at(-1)?.({ open: 5 });
    });

    expect(calls).toBe(2);
    expect(
      await screen.findByRole("option", {
        name: "Open, 5 matching",
        hidden: true,
      }),
    ).toBeInTheDocument();
  });

  it("retries a failed request on a later render", async () => {
    const user = userEvent.setup();
    const now = vi.spyOn(Date, "now");
    let clock = 1_000_000;

    now.mockImplementation(() => clock);

    const getFacets = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ open: 7 });

    try {
      render(
        <FilterBar
          fields={fields}
          defaultValue={statusFilter()}
          getFacets={getFacets}
        />,
      );

      const reopen = async () => {
        await user.click(
          screen.getByRole("button", { name: /^Change value, Open/ }),
        );
        await act(async () => undefined);
      };

      await reopen();
      await user.keyboard("{Escape}");
      // Soon after, the error is still cached.
      await reopen();
      expect(getFacets).toHaveBeenCalledTimes(1);
      await user.keyboard("{Escape}");

      clock += 11_000;
      await reopen();
      expect(
        await screen.findByRole("option", {
          name: "Open, 7 matching",
          hidden: true,
        }),
      ).toBeInTheDocument();
      expect(getFacets).toHaveBeenCalledTimes(2);
    } finally {
      now.mockRestore();
    }
  });

  it("starts requests only for the current facetsKey, and none after unmount", async () => {
    const user = userEvent.setup();
    const started: string[] = [];
    const signals: AbortSignal[] = [];
    const bar = (range: string) => (
      <FilterBar
        fields={fields}
        defaultValue={statusFilter()}
        facetsKey={range}
        getFacets={({ signal }) => {
          started.push(range);
          signals.push(signal);
          return new Promise(() => undefined);
        }}
      />
    );
    const { rerender, unmount } = render(bar("1h"));

    await user.click(
      screen.getByRole("button", { name: "Change value, Open, Blocked" }),
    );
    await screen.findAllByRole("option", { hidden: true });

    // Two key changes in one task: only the last one is requested.
    rerender(bar("24h"));
    rerender(bar("7d"));
    await act(async () => undefined);
    expect(started).toEqual(["1h", "7d"]);

    // A change followed by unmount in the same task requests nothing.
    rerender(bar("30d"));
    unmount();
    await act(async () => undefined);
    expect(started).toEqual(["1h", "7d"]);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
  });
});
