import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KpiGroup, StatTile, balancedColumns } from ".";

describe("StatTile", () => {
  it("renders a labelled group with a compact value", () => {
    render(
      <StatTile
        label="Monthly revenue"
        value={4_200_000}
        formatOptions={{ style: "currency", currency: "USD", locale: "en-US" }}
      />,
    );
    const tile = screen.getByRole("group", { name: "Monthly revenue" });
    expect(tile).toHaveTextContent("$4.2M");
  });

  it("keeps small numbers exact and passes strings through", () => {
    const { rerender } = render(<StatTile label="Seats" value={1284} />);
    expect(screen.getByRole("group")).toHaveTextContent("1,284");
    rerender(<StatTile label="Uptime" value="99.98%" />);
    expect(screen.getByRole("group")).toHaveTextContent("99.98%");
    rerender(<StatTile label="Uptime" value={null} />);
    expect(screen.getByRole("group")).toHaveTextContent("—");
  });

  it("uses a custom formatter", () => {
    render(
      <StatTile label="Latency" value={182} formatValue={(v) => `${v} ms`} />,
    );
    expect(screen.getByRole("group")).toHaveTextContent("182 ms");
  });

  it("shows a delta from a number or full props, with a visible comparison", () => {
    const { rerender } = render(
      <StatTile
        label="Signups"
        value={1284}
        delta={12.4}
        comparison="vs last month"
      />,
    );
    expect(screen.getByText("Up 12.4% vs last month")).toBeInTheDocument();
    // The visible comparison is hidden from AT because the badge already says it.
    expect(screen.getByText("vs last month")).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    rerender(
      <StatTile
        label="Churn"
        value="2.1%"
        delta={{ value: -0.4, positiveDirection: "down" }}
      />,
    );
    expect(document.querySelector('[data-slot="delta-badge"]')).toHaveAttribute(
      "data-meaning",
      "positive",
    );
  });

  it("shows a dash badge when the change is unknown", () => {
    render(
      <StatTile
        label="Refunds"
        value={null}
        delta={null}
        comparison="vs last week"
      />,
    );
    expect(screen.getByText("No change data vs last week")).toBeInTheDocument();
  });

  it("names the trend after the label", () => {
    render(<StatTile label="Active users" value={902} trend={[1, 3, 2, 5]} />);
    expect(
      screen.getByRole("img", { name: /^Active users trend: 4 values/ }),
    ).toBeInTheDocument();
  });

  it("places the trend beside the value when asked", () => {
    const { container } = render(
      <StatTile
        label="Orders"
        value={52}
        trend={[1, 2]}
        trendPlacement="end"
      />,
    );
    const value = container.querySelector('[data-slot="stat-tile-value"]')!;
    expect(value.parentElement?.nextElementSibling).toHaveAttribute(
      "data-slot",
      "sparkline",
    );
  });

  it("renders skeletons and marks itself busy while loading", () => {
    const { container } = render(
      <StatTile label="Revenue" value={10} delta={2} trend={[1, 2]} loading />,
    );
    const tile = screen.getByRole("group", { name: "Revenue" });
    expect(tile).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[data-slot="stat-tile-value"]')).toBeNull();
    expect(container.querySelector('[data-slot="sparkline"]')).toBeNull();
    expect(container.querySelector('[data-slot="delta-badge"]')).toBeNull();
  });

  it("becomes a link with href and hardens new-tab links", () => {
    render(
      <StatTile label="Revenue" value={10} href="/revenue" target="_blank" />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/revenue");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("data-interactive", "true");
    expect(link.className).toContain("focus-visible:outline-solid");
    expect(within(link).getByText("Revenue")).toBeInTheDocument();
  });

  it("renders a caption and icon", () => {
    const { container } = render(
      <StatTile
        label="Storage"
        value="71%"
        caption="Of 2 TB plan"
        icon={<svg data-testid="icon" />}
      />,
    );
    expect(screen.getByText("Of 2 TB plan")).toBeInTheDocument();
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(container.firstElementChild).toHaveAttribute("data-size", "md");
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLElement>();
    render(<StatTile ref={ref} label="A" value={1} id="tile" />);
    expect(ref.current).toHaveAttribute("id", "tile");
  });
});

describe("KpiGroup", () => {
  it("is a named group when labelled and exposes its variant", () => {
    render(
      <KpiGroup aria-label="Key metrics" variant="joined" minTileWidth="10rem">
        <StatTile label="A" value={1} />
        <StatTile label="B" value={2} />
      </KpiGroup>,
    );
    const group = screen.getByRole("group", { name: "Key metrics" });
    expect(group).toHaveAttribute("data-variant", "joined");
    expect(group.style.getPropertyValue("--kpi-min-tile")).toBe("10rem");
    expect(within(group).getAllByRole("group")).toHaveLength(2);
  });

  it("balances wrapped rows instead of leaving an orphan tile", () => {
    expect(balancedColumns(4, 3.4)).toBe(2);
    expect(balancedColumns(4, 4)).toBe(4);
    expect(balancedColumns(5, 4)).toBe(3);
    expect(balancedColumns(6, 5)).toBe(3);
    expect(balancedColumns(3, 1.5)).toBe(1);
    expect(balancedColumns(7, 10)).toBe(7);
    expect(balancedColumns(0, 3)).toBe(1);
  });

  it("applies balanced columns once measured", () => {
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ width: 700, height: 200 } as DOMRect);
    render(
      <KpiGroup aria-label="Row" variant="joined" minTileWidth="208px">
        {[1, 2, 3, 4].map((n) => (
          <StatTile key={n} label={`M${n}`} value={n} />
        ))}
      </KpiGroup>,
    );
    const group = screen.getByRole("group", { name: "Row" });
    expect(group).toHaveAttribute("data-columns", "2");
    expect(group.style.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
    spy.mockRestore();
  });

  it("counts rendered tiles, including fragments and wrapper components", () => {
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ width: 900, height: 200 } as DOMRect);
    function TwoTiles() {
      return (
        <>
          <StatTile label="C" value={3} />
          <StatTile label="D" value={4} />
        </>
      );
    }
    const { rerender } = render(
      <KpiGroup aria-label="Row" minTileWidth="208px" variant="joined">
        <>
          <StatTile label="A" value={1} />
          <StatTile label="B" value={2} />
        </>
        <TwoTiles />
      </KpiGroup>,
    );
    const group = screen.getByRole("group", { name: "Row" });
    // 900px fits four 208px tiles, and four are rendered.
    expect(group).toHaveAttribute("data-columns", "4");

    // Removing tiles re-balances on the next commit without a resize.
    rerender(
      <KpiGroup aria-label="Row" minTileWidth="208px" variant="joined">
        <>
          <StatTile label="A" value={1} />
          {null}
        </>
        {false}
        <StatTile label="B" value={2} />
      </KpiGroup>,
    );
    expect(group).toHaveAttribute("data-columns", "2");
    spy.mockRestore();
  });

  it("falls back to auto-fit when balancing is off or the width unit is unsupported", () => {
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ width: 900, height: 200 } as DOMRect);
    const { rerender } = render(
      <KpiGroup aria-label="Row" balanced={false}>
        <StatTile label="A" value={1} />
      </KpiGroup>,
    );
    const group = screen.getByRole("group", { name: "Row" });
    expect(group).not.toHaveAttribute("data-columns");
    rerender(
      <KpiGroup aria-label="Row" minTileWidth="30%">
        <StatTile label="A" value={1} />
      </KpiGroup>,
    );
    expect(group).not.toHaveAttribute("data-columns");
    expect(group.style.gridTemplateColumns).toBe("");
    spy.mockRestore();
  });

  it("has no role when unlabelled", () => {
    const { container } = render(<KpiGroup />);
    expect(container.firstElementChild).not.toHaveAttribute("role");
  });
});
