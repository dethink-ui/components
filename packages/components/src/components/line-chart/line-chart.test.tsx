import { createRef } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LineChart } from ".";

const data = [
  { month: "Jan", revenue: 4000, costs: 2400 },
  { month: "Feb", revenue: 3000, costs: 1398 },
  { month: "Mar", revenue: 5000, costs: null },
  { month: "Apr", revenue: 4780, costs: 3908 },
];

const series = [
  { key: "revenue", label: "Revenue" },
  { key: "costs", label: "Costs", color: "chart-4" },
];

function mockSize(width = 400, height = 240) {
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({
      width,
      height,
      left: 0,
      top: 0,
    } as DOMRect);
}

function plot() {
  return screen.getByRole("application", { name: "Revenue and costs" });
}

function renderChart(props: Partial<Parameters<typeof LineChart>[0]> = {}) {
  return render(
    <LineChart
      aria-label="Revenue and costs"
      data={data}
      index="month"
      series={series}
      animate={false}
      {...props}
    />,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LineChart", () => {
  it("draws one line per series, colored from config by key", () => {
    const { container } = renderChart();
    const lines = container.querySelectorAll('[data-slot="chart-line"]');
    expect(lines).toHaveLength(2);
    const root = container.querySelector(
      '[data-slot="chart-container"]',
    ) as HTMLElement;
    expect(root.style.getPropertyValue("--chart-series-0-revenue")).toBe(
      "var(--dt-color-chart-1)",
    );
    expect(root.style.getPropertyValue("--chart-series-1-costs")).toBe(
      "var(--dt-color-chart-4)",
    );
    expect((lines[1] as SVGGElement).style.color).toBe(
      "var(--chart-series-1-costs)",
    );
  });

  it("keeps a series' color when another is hidden through the legend", () => {
    const { container } = renderChart();
    const legend = screen.getByRole("list", {
      name: "Revenue and costs series",
    });
    fireEvent.click(within(legend).getByRole("button", { name: "Revenue" }));
    expect(
      within(legend).getByRole("button", { name: "Revenue" }),
    ).toHaveAttribute("aria-pressed", "false");
    const lines = container.querySelectorAll('[data-slot="chart-line"]');
    expect(lines).toHaveLength(1);
    expect((lines[0] as SVGGElement).style.color).toBe(
      "var(--chart-series-1-costs)",
    );
  });

  it("never hides the last visible series", () => {
    const onHiddenSeriesChange = vi.fn();
    renderChart({ defaultHiddenSeries: ["revenue"], onHiddenSeriesChange });
    fireEvent.click(screen.getByRole("button", { name: "Costs" }));
    expect(onHiddenSeriesChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Costs" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("adds a legend only for two or more series", () => {
    renderChart({ series: [series[0]!] });
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("dims the other series while one is highlighted", () => {
    const { container } = renderChart();
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Costs" }));
    const [revenue, costs] = container.querySelectorAll(
      '[data-slot="chart-line"]',
    );
    expect(revenue).toHaveAttribute("data-dimmed");
    expect(costs).not.toHaveAttribute("data-dimmed");
    fireEvent.pointerLeave(screen.getByRole("button", { name: "Costs" }));
    expect(revenue).not.toHaveAttribute("data-dimmed");
  });

  it("moves a keyboard crosshair with arrows, Home and End and announces it", () => {
    mockSize();
    const { container } = renderChart();
    const target = plot();
    const readout = container.querySelector(
      '[data-slot="line-chart-readout"]',
    )!;
    fireEvent.focus(target);
    expect(readout).toHaveTextContent("Apr: Revenue 4,780, Costs 3,908");
    fireEvent.keyDown(target, { key: "ArrowLeft" });
    expect(readout).toHaveTextContent("Mar: Revenue 5,000, Costs no value");
    fireEvent.keyDown(target, { key: "Home" });
    expect(readout).toHaveTextContent("Jan: Revenue 4,000, Costs 2,400");
    fireEvent.keyDown(target, { key: "ArrowLeft" });
    expect(readout).toHaveTextContent("Jan:");
    fireEvent.keyDown(target, { key: "End" });
    expect(readout).toHaveTextContent("Apr:");
    expect(
      container.querySelector('[data-slot="chart-crosshair"]'),
    ).toBeInTheDocument();
    fireEvent.keyDown(target, { key: "Escape" });
    expect(container.querySelector('[data-slot="chart-crosshair"]')).toBeNull();
  });

  it("honors Home and End after Escape clears the crosshair", () => {
    mockSize();
    const { container } = renderChart();
    const target = plot();
    const readout = container.querySelector(
      '[data-slot="line-chart-readout"]',
    )!;
    fireEvent.focus(target);
    fireEvent.keyDown(target, { key: "Escape" });
    fireEvent.keyDown(target, { key: "Home" });
    expect(readout).toHaveTextContent("Jan:");
    fireEvent.keyDown(target, { key: "Escape" });
    fireEvent.keyDown(target, { key: "End" });
    expect(readout).toHaveTextContent("Apr:");
    fireEvent.keyDown(target, { key: "Escape" });
    fireEvent.keyDown(target, { key: "ArrowLeft" });
    expect(readout).toHaveTextContent("Apr:");
  });

  it("clips series and crosshair markers to the plot area", () => {
    mockSize();
    const { container } = renderChart({ yDomain: [0, 100] });
    fireEvent.focus(plot());
    const group = container.querySelector('[data-slot="line-chart-series"]')!;
    const clip = group.getAttribute("clip-path")!.match(/url\(#(.+)\)/)![1]!;
    expect(container.querySelector(`clipPath[id="${clip}"] rect`)).toBeTruthy();
    expect(group.querySelector('[data-slot="chart-line"]')).toBeTruthy();
    expect(group.querySelector('[data-slot="chart-crosshair"]')).toBeTruthy();
  });

  it("formats the data table once, not on every crosshair move", () => {
    mockSize();
    const formatValue = vi.fn((value: number) => String(value));
    const many = Array.from({ length: 500 }, (_, i) => ({
      month: `P${i}`,
      revenue: i,
      costs: i * 2,
    }));
    renderChart({ data: many, formatValue });
    fireEvent.focus(plot());
    const before = formatValue.mock.calls.length;
    fireEvent.keyDown(plot(), { key: "ArrowLeft" });
    // Tooltip, readout and axis ticks only; the 1,000 table cells stay memoized.
    expect(formatValue.mock.calls.length - before).toBeLessThan(50);
  });

  it("lists every series in the hover tooltip at the nearest index", () => {
    mockSize(400, 240);
    const { container } = renderChart();
    fireEvent.pointerMove(plot(), { clientX: 10 });
    const tooltip = container.querySelector('[data-slot="chart-tooltip"]')!;
    expect(tooltip).toHaveTextContent("Jan");
    const items = tooltip.querySelectorAll('[data-slot="chart-tooltip-item"]');
    expect([...items].map((item) => item.textContent)).toEqual([
      "4,000Revenue",
      "2,400Costs",
    ]);
    fireEvent.pointerMove(plot(), { clientX: 280 });
    expect(tooltip).toHaveTextContent("Mar");
    expect(tooltip).toHaveTextContent("—Costs");
    fireEvent.pointerLeave(plot());
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toBeNull();
  });

  it("offers an equivalent data table, hidden until toggled", () => {
    renderChart({ indexLabel: "Month" });
    const table = screen.getByRole("table", { name: "Revenue and costs" });
    expect(table.closest('[data-slot="chart-data-table"]')).toHaveClass(
      "sr-only",
    );
    expect(within(table).getAllByRole("row")[3]).toHaveTextContent("Mar5,000—");
    fireEvent.click(screen.getByRole("button", { name: "Table view" }));
    expect(screen.queryByRole("application")).toBeNull();
    expect(
      screen.getByRole("table").closest('[data-slot="chart-data-table"]'),
    ).not.toHaveClass("sr-only");
  });

  it("formats values and index labels", () => {
    mockSize();
    const { container } = renderChart({
      formatOptions: { style: "currency", currency: "USD" },
      formatIndex: (value) => `${value} 2026`,
    });
    fireEvent.focus(plot());
    expect(
      container.querySelector('[data-slot="line-chart-readout"]'),
    ).toHaveTextContent("Apr 2026: Revenue $4,780, Costs $3,908");
  });

  it("shows empty and loading states without a plot", () => {
    const { rerender } = renderChart({ data: [] });
    expect(screen.getByText("No data")).toBeInTheDocument();
    rerender(
      <LineChart
        data={[]}
        index="month"
        series={series}
        loading
        loadingLabel="Fetching"
      />,
    );
    expect(screen.getByText("Fetching")).toBeInTheDocument();
  });

  it("holds the previous render while refetching", () => {
    const { container } = renderChart({ loading: true });
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(
      container.querySelector('[data-slot="chart-container"]'),
    ).toHaveClass("opacity-60");
    expect(container.querySelectorAll('[data-slot="chart-line"]')).toHaveLength(
      2,
    );
  });

  it("describes the chart and forwards refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <LineChart
        ref={ref}
        aria-label="Revenue and costs"
        data={data}
        index="month"
        series={series}
      />,
    );
    expect(ref.current).toHaveAttribute("data-slot", "line-chart");
    expect(plot()).toHaveAccessibleDescription(
      "Series: Revenue, Costs. 4 points from Jan to Apr. Use the arrow keys, Home and End to read values.",
    );
  });
});
