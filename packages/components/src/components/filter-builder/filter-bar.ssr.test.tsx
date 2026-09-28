import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  FilterBar,
  FilterGroupEditor,
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

  it("renders the group editor on the server", () => {
    const markup = renderToString(
      <FilterBar
        fields={fields}
        defaultValue={createFilter({
          id: "root",
          children: [
            createFilter({
              id: "group",
              combinator: "or",
              children: [
                createFilterCondition({
                  field: "status",
                  operator: "isAnyOf",
                  value: ["open"],
                }),
              ],
            }),
          ],
        })}
      >
        <FilterGroupEditor />
      </FilterBar>,
    );

    expect(markup).toContain('data-slot="filter-group-editor"');
    expect(markup).toContain('data-slot="filter-group-combinator"');
    expect(markup).toContain('data-depth="2"');
  });

  it("renders counts and relative dates identically on server and client with an injected now", async () => {
    const dateFields = defineFilterFields<{ due: string; open: boolean }>([
      { key: "due", label: "Due", type: "date" },
      { key: "open", label: "Open", type: "boolean" },
    ]);
    const rows = [
      { due: "2026-09-30", open: true },
      { due: "2026-09-29", open: false },
    ];
    const App = () => (
      <FilterBar
        fields={dateFields}
        data={rows}
        showImpact
        evaluateOptions={{ now: Date.UTC(2026, 8, 30, 12) }}
        defaultValue={createFilter({
          id: "root",
          children: [
            createFilterCondition({
              id: "due",
              field: "due",
              operator: "is",
              value: { kind: "relative", amount: 0, unit: "day" },
            }),
          ],
        })}
      />
    );
    const markup = renderToString(<App />);

    expect(markup).toContain('aria-label="Due is today"');
    expect(markup).toContain("−1");
    expect(markup).toContain("1 result");

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");

    container.innerHTML = markup;
    await act(async () => {
      hydrateRoot(container, <App />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);
    consoleError.mockRestore();
  });
});
