import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from ".";

describe("Pagination SSR", () => {
  it("renders callback and link mode markup on the server", () => {
    expect(
      renderToString(
        <Pagination page={2} pageCount={5} onPageChange={() => undefined} />,
      ),
    ).toContain('data-slot="pagination"');
    expect(
      renderToString(
        <Pagination
          hrefForPage={(page) => `/results?page=${page}`}
          page={2}
          pageCount={5}
        />,
      ),
    ).toContain('href="/results?page=3"');
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");

    container.innerHTML = renderToString(
      <Pagination
        hrefForPage={(page) => `/results?page=${page}`}
        page={3}
        pageCount={10}
        showFirstLast
      />,
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Pagination
          hrefForPage={(page) => `/results?page=${page}`}
          page={3}
          pageCount={10}
          showFirstLast
        />,
      );
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
