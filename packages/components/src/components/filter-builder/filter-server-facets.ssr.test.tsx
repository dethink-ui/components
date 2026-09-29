import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from ".";
import { fields, statusFilter } from "./filter-bar.fixtures";

describe("FilterBar server facets SSR", () => {
  it("renders on the server without requesting counts", async () => {
    const getFacets = vi.fn(async () => ({}));
    const markup = renderToString(
      <FilterBar
        fields={fields}
        defaultValue={statusFilter()}
        getFacets={getFacets}
        resultCount={12}
      />,
    );

    expect(markup).toContain('aria-label="Status is any of Open, Blocked"');
    expect(markup).toContain("12 results");
    // Past any microtask the render could have queued.
    await Promise.resolve();
    await Promise.resolve();
    expect(getFacets).not.toHaveBeenCalled();
  });
});
