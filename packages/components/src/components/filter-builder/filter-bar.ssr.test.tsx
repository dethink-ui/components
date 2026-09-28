import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  FilterBar,
  createFilter,
  createFilterCondition,
  defineFilterFields,
} from ".";

const fields = defineFilterFields([
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [{ value: "open", label: "Open" }],
  },
]);

function ServerFilterBar() {
  return (
    <FilterBar
      fields={fields}
      resultCount={3}
      defaultValue={createFilter({
        id: "root",
        children: [
          createFilterCondition({
            field: "status",
            operator: "isAnyOf",
            value: ["open"],
          }),
        ],
      })}
    />
  );
}

describe("FilterBar SSR", () => {
  it("renders chips and actions on the server", () => {
    const markup = renderToString(<ServerFilterBar />);

    expect(markup).toContain('data-slot="filter-bar"');
    expect(markup).toContain('role="toolbar"');
    expect(markup).toContain('data-slot="filter-chip"');
    expect(markup).toContain('aria-label="Status is Open"');
    expect(markup).toContain('data-slot="filter-add-menu-trigger"');
    expect(markup).toContain("3 results");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");

    container.innerHTML = renderToString(<ServerFilterBar />);

    await act(async () => {
      hydrateRoot(container, <ServerFilterBar />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);
    consoleError.mockRestore();
  });
});
