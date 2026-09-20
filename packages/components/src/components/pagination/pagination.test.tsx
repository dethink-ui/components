import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination, getPaginationRenderItems } from ".";

function itemKeys(items: ReturnType<typeof getPaginationRenderItems>) {
  return items.map((item) =>
    item.type === "page" ? `page-${item.page}` : "ellipsis",
  );
}

describe("getPaginationRenderItems", () => {
  it("fills the first and last windows instead of moving the controls", () => {
    expect(
      itemKeys(getPaginationRenderItems({ page: 1, pageCount: 12 })),
    ).toEqual([
      "page-1",
      "page-2",
      "page-3",
      "page-4",
      "page-5",
      "ellipsis",
      "page-12",
    ]);
    expect(
      itemKeys(getPaginationRenderItems({ page: 12, pageCount: 12 })),
    ).toEqual([
      "page-1",
      "ellipsis",
      "page-8",
      "page-9",
      "page-10",
      "page-11",
      "page-12",
    ]);
  });

  it("keeps a stable, ordered window containing the current page across bounded configurations", () => {
    for (const pageCount of [1, 2, 5, 8, 12, 25]) {
      for (const boundaryCount of [0, 1, 2]) {
        for (const siblingCount of [0, 1, 2]) {
          const windows = Array.from({ length: pageCount }, (_, i) =>
            getPaginationRenderItems({
              page: i + 1,
              pageCount,
              boundaryCount,
              siblingCount,
            }),
          );
          expect(new Set(windows.map((items) => items.length)).size).toBe(1);
          windows.forEach((items, index) => {
            const pages = items.flatMap((item) =>
              item.type === "page" ? [item.page] : [],
            );
            expect(pages).toContain(index + 1);
            expect(pages).toEqual([...new Set(pages)].sort((a, b) => a - b));
            expect(pages.every((page) => page >= 1 && page <= pageCount)).toBe(
              true,
            );
            expect(
              items.filter((item) => item.type === "page" && item.current),
            ).toHaveLength(1);
          });
        }
      }
    }
  });
  it("creates a bounded middle window with ellipses", () => {
    expect(
      itemKeys(getPaginationRenderItems({ page: 5, pageCount: 10 })),
    ).toEqual([
      "page-1",
      "ellipsis",
      "page-4",
      "page-5",
      "page-6",
      "ellipsis",
      "page-10",
    ]);
  });

  it("renders small page counts without unnecessary ellipses", () => {
    expect(
      itemKeys(getPaginationRenderItems({ page: 3, pageCount: 5 })),
    ).toEqual(["page-1", "page-2", "page-3", "page-4", "page-5"]);
  });

  it("supports compact bounded windows", () => {
    expect(
      itemKeys(
        getPaginationRenderItems({ compact: true, page: 5, pageCount: 10 }),
      ),
    ).toEqual(["page-1", "ellipsis", "page-5", "ellipsis", "page-10"]);
  });

  it("supports custom sibling and boundary counts", () => {
    expect(
      itemKeys(
        getPaginationRenderItems({
          boundaryCount: 2,
          page: 6,
          pageCount: 12,
          siblingCount: 2,
        }),
      ),
    ).toEqual([
      "page-1",
      "page-2",
      "page-3",
      "page-4",
      "page-5",
      "page-6",
      "page-7",
      "page-8",
      "ellipsis",
      "page-11",
      "page-12",
    ]);
  });

  it("supports unbounded windows without inventing a last page", () => {
    expect(
      itemKeys(getPaginationRenderItems({ hasNextPage: true, page: 8 })),
    ).toEqual(["page-1", "ellipsis", "page-7", "page-8", "page-9"]);
  });
});

describe("Pagination", () => {
  it("renders bounded callback controls with current-page semantics", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={4}
        pageCount={10}
        showFirstLast
        onPageChange={onPageChange}
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Pagination" });
    const current = within(nav).getByRole("button", {
      name: "Page 4, current page",
    });

    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("data-current", "true");
    expect(current).toBeDisabled();

    await user.click(within(nav).getByRole("button", { name: "Next page" }));
    await user.click(
      within(nav).getByRole("button", { name: "Last page, page 10" }),
    );
    await user.click(current);

    expect(onPageChange).toHaveBeenNthCalledWith(1, 5);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 10);
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });

  it("keeps impossible boundary controls disabled by default", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={1}
        pageCount={3}
        showFirstLast
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "First page" }));
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    await user.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    expect(onPageChange).toHaveBeenCalledOnce();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("can hide disabled controls at boundaries", () => {
    render(
      <Pagination
        hideDisabledControls
        page={1}
        pageCount={2}
        showFirstLast
        onPageChange={() => undefined}
      />,
    );

    expect(screen.queryByRole("button", { name: "First page" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
  });

  it("renders anchors in link mode", () => {
    render(
      <Pagination
        hrefForPage={(page) => `/invoices?page=${page}`}
        page={2}
        pageCount={4}
        showFirstLast
      />,
    );

    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/invoices?page=1",
    );
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/invoices?page=3",
    );
    expect(
      screen.getByRole("link", { name: "Page 2, current page" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("falls back to callbacks when a generated target has no href", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        hrefForPage={(page) =>
          page === 3 ? undefined : `/invoices?page=${page}`
        }
        page={2}
        pageCount={4}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/invoices?page=1",
    );

    const next = screen.getByRole("button", { name: "Next page" });

    expect(next).toBeEnabled();

    await user.click(next);

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables generated targets with no href or callback", () => {
    render(
      <Pagination
        hrefForPage={(page) =>
          page === 3 ? undefined : `/invoices?page=${page}`
        }
        page={2}
        pageCount={4}
      />,
    );

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 3 of 4" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/invoices?page=1",
    );
  });

  it("renders unbounded pagination without a fake final page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination hasNextPage page={8} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Last page/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Page 9" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));

    expect(onPageChange).toHaveBeenCalledWith(9);
  });

  it("collapses generated non-compact controls to a status and Back/Next row in narrow containers", () => {
    const { container } = render(
      <Pagination
        page={5}
        pageCount={12}
        showFirstLast
        onPageChange={() => undefined}
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Pagination" });
    const content = container.querySelector('[data-slot="pagination-content"]');
    const list = container.querySelector('[data-slot="pagination-list"]');
    const currentItem = container.querySelector(
      '[data-slot="pagination-item"][data-current="true"]',
    );
    const items = Array.from(
      container.querySelectorAll('[data-slot="pagination-item"]'),
    );

    expect(content).toHaveClass(
      "flex-row",
      "items-center",
      "justify-between",
      "@xs:flex-col",
    );
    expect(content).not.toHaveClass("rtl:flex-row-reverse");
    expect(list).toHaveClass(
      "w-auto",
      "flex-none",
      "justify-end",
      "rtl:flex-row-reverse",
      "@xs:w-full",
      "@xs:rtl:flex-row",
    );
    expect(
      within(nav).getByRole("button", { name: "Previous page" }),
    ).toHaveTextContent("Back");
    expect(
      within(nav).getByRole("button", { name: "Next page" }),
    ).toHaveTextContent("Next");
    expect(
      within(nav)
        .getByRole("button", { name: "Previous page" })
        .querySelector("svg"),
    ).toBeInTheDocument();
    expect(
      within(nav)
        .getByRole("button", { name: "Next page" })
        .querySelector("svg"),
    ).toBeInTheDocument();
    expect(items[0]).toHaveClass("hidden", "@xs:flex");
    expect(items[1]).not.toHaveClass("hidden");
    expect(currentItem).toHaveClass("hidden", "@xs:flex");
    expect(items[items.length - 2]).not.toHaveClass("hidden");
    expect(items[items.length - 1]).toHaveClass("hidden", "@xs:flex");
  });

  it("supports compact output, RTL-safe controls, custom labels, and class merging", () => {
    const { container } = render(
      <div dir="rtl">
        <Pagination
          className="custom-pagination"
          compact
          labels={{
            nextPage: "Go forward",
            page: (page, { current }) =>
              current ? `Current page ${page}` : `Go to page ${page}`,
            previousPage: "Go back",
            root: "Results pages",
          }}
          page={5}
          pageCount={10}
          onPageChange={() => undefined}
        />
      </div>,
    );

    const nav = screen.getByRole("navigation", { name: "Results pages" });

    expect(nav).toHaveClass("custom-pagination");
    expect(nav).toHaveAttribute("data-compact", "true");
    expect(nav).toHaveClass("@container");

    const content = container.querySelector('[data-slot="pagination-content"]');
    const list = container.querySelector('[data-slot="pagination-list"]');

    expect(content).toHaveClass("@md:flex-row", "w-full");
    expect(list).toHaveClass("flex-nowrap", "overflow-x-auto", "@md:flex-1");
    expect(list).not.toHaveClass("justify-between");
    expect(within(nav).queryByText("Back")).toBeNull();
    expect(within(nav).queryByText("Next")).toBeNull();
    expect(
      within(nav).getByRole("button", { name: "Current page 5" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(nav)
        .getByRole("button", { name: "Go forward" })
        .querySelector("svg"),
    ).toHaveClass("rtl:rotate-180");
    expect(within(nav).getAllByText("More pages")).toHaveLength(2);
  });
});
