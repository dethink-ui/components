import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createFilter, createFilterCondition } from ".";
import { QueryInput } from "./query-input";
import { queryFields } from "./filter-query.fixtures";

function ServerQueryInput() {
  return (
    <QueryInput
      fields={queryFields}
      defaultValue={createFilter({
        id: "root",
        children: [
          createFilterCondition({
            field: "status",
            operator: "isAnyOf",
            value: ["open"],
          }),
          createFilterCondition({
            field: "created",
            operator: "after",
            value: { kind: "relative", amount: -7, unit: "day" },
          }),
        ],
      })}
    />
  );
}

describe("QueryInput SSR", () => {
  it("renders the text and its highlight on the server", () => {
    const markup = renderToString(<ServerQueryInput />);

    expect(markup).toContain('data-slot="query-input"');
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('value="status:open created:&gt;-7d"');
    expect(markup).toContain('data-kind="field"');
    expect(markup).toContain('aria-expanded="false"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");

    container.innerHTML = renderToString(<ServerQueryInput />);

    await act(async () => {
      hydrateRoot(container, <ServerQueryInput />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);
    consoleError.mockRestore();
  });
});
