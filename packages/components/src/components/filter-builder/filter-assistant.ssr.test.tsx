import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { useFilterState } from ".";
import { FilterAssistant } from "./filter-assistant";
import { queryFields } from "./filter-query.fixtures";
import { useFilterAssistant } from "./use-filter-assistant";

function ServerAssistant() {
  const state = useFilterState();
  const assistant = useFilterAssistant({
    fields: queryFields,
    state,
    resolve: async () => false,
  });

  return <FilterAssistant assistant={assistant} />;
}

describe("FilterAssistant SSR", () => {
  it("renders the prompt on the server", () => {
    const markup = renderToString(<ServerAssistant />);

    expect(markup).toContain('data-slot="filter-assistant"');
    expect(markup).toContain("Describe the filter you want");
    expect(markup).not.toContain('data-slot="filter-proposal"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");

    container.innerHTML = renderToString(<ServerAssistant />);

    await act(async () => {
      hydrateRoot(container, <ServerAssistant />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);
    consoleError.mockRestore();
  });
});
