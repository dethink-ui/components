import { createRef } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BarList, sortBarListItems, type BarListItem } from ".";

const pages: BarListItem[] = [
  { label: "/pricing", value: 2400 },
  { label: "/", value: 12_940 },
  { label: "/docs", value: 5100 },
  { label: "/blog", value: 5100 },
  { label: "/careers", value: 12 },
];

function labels() {
  return screen
    .getAllByRole("listitem")
    .map(
      (item) => item.querySelector('[data-slot="bar-list-label"]')!.textContent,
    );
}

function barWidth(label: string) {
  const item = screen.getByText(label).closest("li")!;
  return (
    item.querySelector('[data-slot="bar-list-bar"]') as HTMLElement | null
  )?.style.getPropertyValue("--bar-share");
}

describe("BarList", () => {
  it("ranks rows descending by default, keeping ties in input order", () => {
    render(<BarList data={pages} />);
    expect(labels()).toEqual(["/", "/docs", "/blog", "/pricing", "/careers"]);
  });

  it("supports ascending and input order", () => {
    const { rerender } = render(<BarList data={pages} sort="ascending" />);
    expect(labels()[0]).toBe("/careers");
    rerender(<BarList data={pages} sort="none" />);
    expect(labels()).toEqual(["/pricing", "/", "/docs", "/blog", "/careers"]);
    expect(sortBarListItems(pages, "none").map((row) => row.index)).toEqual([
      0, 1, 2, 3, 4,
    ]);
  });

  it("sizes bars against the largest value or an explicit max", () => {
    const { rerender } = render(<BarList data={pages} />);
    expect(barWidth("/")).toBe("100.00%");
    expect(barWidth("/docs")).toBe("39.41%");
    rerender(<BarList data={pages} max={25_880} />);
    expect(barWidth("/")).toBe("50.00%");
  });

  it("keeps a sliver for tiny values and draws nothing for zero or negative", () => {
    render(
      <BarList
        data={[
          { label: "big", value: 1_000_000 },
          { label: "tiny", value: 1 },
          { label: "zero", value: 0 },
          { label: "negative", value: -5 },
        ]}
      />,
    );
    expect(barWidth("tiny")).toBe("0.00%");
    expect(barWidth("zero")).toBeUndefined();
    expect(barWidth("negative")).toBeUndefined();
  });

  it("formats values compactly and exposes label and value as row text", () => {
    render(<BarList data={pages} />);
    const top = screen.getAllByRole("listitem")[0]!;
    expect(top).toHaveTextContent("/12.9K");
    expect(within(top).getByText("12.9K")).toHaveClass("tabular-nums");
  });

  it("uses a custom formatter", () => {
    render(
      <BarList
        data={[{ label: "US", value: 0.42 }]}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />,
    );
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("colors bars from one slot, with per-row overrides", () => {
    render(
      <BarList
        color="chart-3"
        data={[
          { label: "a", value: 2 },
          { label: "b", value: 1, color: "chart-5" },
        ]}
      />,
    );
    const [a, b] = screen.getAllByRole("listitem") as HTMLElement[];
    expect(a!.style.getPropertyValue("--bar-color")).toBe(
      "var(--dt-color-chart-3)",
    );
    expect(b!.style.getPropertyValue("--bar-color")).toBe(
      "var(--dt-color-chart-5)",
    );
  });

  it("renders link rows and button rows", () => {
    const onItemClick = vi.fn();
    render(
      <BarList
        onItemClick={onItemClick}
        data={[
          { label: "Linked", value: 2, href: "/linked" },
          { label: "Clickable", value: 1 },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: /Linked/ })).toHaveAttribute(
      "href",
      "/linked",
    );
    // outline-hidden zeroes --tw-outline-style, so the ring needs an explicit style.
    expect(screen.getByRole("link", { name: /Linked/ }).className).toContain(
      "focus-visible:outline-solid",
    );
    fireEvent.click(screen.getByRole("button", { name: /Clickable/ }));
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Clickable" }),
      1,
    );
  });

  it("limits rows behind an accessible show-more toggle", () => {
    render(<BarList data={pages} limit={3} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    const toggle = screen.getByRole("button", { name: "Show 2 more" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute(
      "aria-controls",
      screen.getByRole("list").id,
    );

    fireEvent.click(toggle);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Show less");
  });

  it("supports controlled expansion", () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <BarList
        data={pages}
        limit={2}
        expanded={false}
        onExpandedChange={onExpandedChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show 3 more" }));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    rerender(
      <BarList
        data={pages}
        limit={2}
        expanded
        onExpandedChange={onExpandedChange}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("omits the toggle when everything fits", () => {
    render(<BarList data={pages} limit={5} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows headers and an empty state", () => {
    const { rerender } = render(
      <BarList data={pages} labelHeader="Page" valueHeader="Visitors" />,
    );
    expect(screen.getByText("Page")).toBeInTheDocument();
    expect(screen.getByText("Visitors")).toBeInTheDocument();
    rerender(<BarList data={[]} emptyLabel="No visits yet" />);
    expect(screen.getByText("No visits yet")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("disables entrance motion when animate is false", () => {
    render(<BarList data={pages} animate={false} />);
    const bar = document.querySelector(
      '[data-slot="bar-list-bar"]',
    ) as HTMLElement;
    expect(bar.style.animation).toBe("none");
  });

  it("forwards refs and native attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <BarList ref={ref} data={pages} id="top-pages" aria-label="Top pages" />,
    );
    expect(ref.current).toHaveAttribute("id", "top-pages");
    expect(ref.current).toHaveAttribute("data-slot", "bar-list");
  });

  it("names the list, not the generic root", () => {
    render(
      <>
        <h3 id="pages-heading">Top pages</h3>
        <BarList data={pages} aria-labelledby="pages-heading" />
        <BarList data={pages} aria-label="Referrers" />
      </>,
    );
    expect(screen.getByRole("list", { name: "Top pages" })).toBeTruthy();
    const list = screen.getByRole("list", { name: "Referrers" });
    expect(list.closest('[data-slot="bar-list"]')).not.toHaveAttribute(
      "aria-label",
    );
  });

  it("keeps the name on a group when empty", () => {
    render(<BarList data={[]} aria-label="Top pages" />);
    expect(screen.getByRole("group", { name: "Top pages" })).toBeTruthy();
  });

  it("sizes every row's value against one shared column", () => {
    render(
      <BarList
        data={[
          { label: "a", value: 999 },
          { label: "b", value: 1000 },
        ]}
      />,
    );
    const list = screen.getByRole("list");
    expect(list.className).toContain("grid-cols-[minmax(0,1fr)_auto]");
    for (const item of screen.getAllByRole("listitem")) {
      expect(item.className).toContain("grid-cols-subgrid");
      expect(item.firstElementChild!.className).toContain("grid-cols-subgrid");
    }
  });
});
