import { StrictMode, act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FilterBar, createFilter } from ".";
import { queryFields } from "./filter-query.fixtures";
import { createHistoryFilterStore } from "./filter-url-store";
import { SavedViewsMenu } from "./saved-views-menu";
import { useFilterUrlState } from "./use-filter-url-state";
import { useSavedViews } from "./use-saved-views";

const store = createHistoryFilterStore();

function Page({ initialSearch }: { initialSearch?: string }) {
  const state = useFilterUrlState({
    fields: queryFields,
    store,
    initialSearch,
  });
  const savedViews = useSavedViews({
    state,
    fields: queryFields,
    views: [{ id: "v", name: "Open", version: 1, filter: createFilter() }],
  });

  return (
    <>
      <SavedViewsMenu savedViews={savedViews} />
      <FilterBar fields={queryFields} state={state} />
    </>
  );
}

async function hydrate(markup: string, element: React.ReactElement) {
  const consoleError = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);
  const container = document.createElement("div");

  container.innerHTML = markup;
  document.body.append(container);

  await act(async () => {
    hydrateRoot(container, element);
  });

  const mismatch = consoleError.mock.calls.some(([message]) =>
    String(message).toLowerCase().includes("hydration"),
  );

  consoleError.mockRestore();

  return { container, mismatch };
}

describe("URL state SSR", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    document.body.innerHTML = "";
  });

  it("renders the filter from initialSearch on the server", () => {
    const markup = renderToString(<Page initialSearch="?q=status:open&v=1" />);

    expect(markup).toContain('aria-label="Status is Open"');
    expect(markup).toContain('data-slot="saved-views-trigger"');
  });

  it("hydrates with the server's search, without a mismatch", async () => {
    window.history.replaceState(null, "", "/?q=status:open&v=1");

    const element = <Page initialSearch="?q=status:open&v=1" />;
    const { container, mismatch } = await hydrate(
      renderToString(element),
      element,
    );

    expect(mismatch).toBe(false);
    expect(container.innerHTML).toContain('aria-label="Status is Open"');
    expect(window.location.search).toBe("?q=status:open&v=1");
  });

  it("applies the URL after hydration when the server didn't know it", async () => {
    window.history.replaceState(null, "", "/?q=urgent:yes&v=1");

    // StrictMode runs effects twice in development, as in Next.js.
    const element = (
      <StrictMode>
        <Page />
      </StrictMode>
    );
    const markup = renderToString(element);

    expect(markup).not.toContain("Urgent");

    const { container, mismatch } = await hydrate(markup, element);

    expect(mismatch).toBe(false);
    expect(container.innerHTML).toContain('aria-label="Urgent is Yes"');
    // Hydrating never rewrites the link.
    expect(window.location.search).toBe("?q=urgent:yes&v=1");
  });
});
