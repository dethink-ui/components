import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AreaChart } from ".";

const data = [
  { month: "Jan", direct: 40, search: 20 },
  { month: "Feb", direct: 30, search: null },
  { month: "Mar", direct: 50, search: 30 },
];

const series = [
  { key: "direct", label: "Direct" },
  { key: "search", label: "Search" },
];

function mockSize(width = 400, height = 240) {
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({ width, height, left: 0, top: 0 } as DOMRect);
}

function renderChart(props: Partial<Parameters<typeof AreaChart>[0]> = {}) {
  return render(
    <AreaChart
      aria-label="Traffic"
      data={data}
      index="month"
      series={series}
      animate={false}
      {...props}
    />,
  );
}

function plot() {
  return screen.getByRole("application", { name: "Traffic" });
}

function crosshairYs(container: HTMLElement) {
  return [
    ...container.querySelectorAll('[data-slot="chart-crosshair"] circle'),
  ].map((circle) => Number(circle.getAttribute("cy")));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AreaChart", () => {
  it("draws a wash under a line for every series", () => {
    const { container } = renderChart();
    expect(container.querySelectorAll('[data-slot="chart-area"]')).toHaveLength(
      2,
    );
    expect(container.querySelectorAll('[data-slot="chart-line"]')).toHaveLength(
      2,
    );
    expect(plot()).toHaveAttribute("aria-roledescription", "area chart");
  });

  it("paints the wash from the series token and fades it downwards", () => {
    const { container } = renderChart();
    const stops = container.querySelectorAll(
      '[data-slot="chart-area"][data-series="search"] stop',
    ) as NodeListOf<SVGStopElement>;
    expect(stops[0]!.style.stopColor).toBe("var(--chart-series-1-search)");
    expect(Number(stops[0]!.style.stopOpacity)).toBeGreaterThan(
      Number(stops[1]!.style.stopOpacity),
    );
    const fill = container
      .querySelector('[data-slot="chart-area"] path')!
      .getAttribute("fill");
    expect(fill).toMatch(/^url\(#.+\)$/);
  });

  it("leaves gaps in overlapping areas", () => {
    const { container } = renderChart();
    // Search is missing in Feb, so each side is a single point with no area.
    expect(
      container.querySelectorAll(
        '[data-slot="chart-area"][data-series="search"] path',
      ),
    ).toHaveLength(0);
  });

  it("stacks series so the crosshair marks cumulative edges", () => {
    mockSize();
    const { container, rerender } = renderChart({ yDomain: [0, 100] });
    fireEvent.focus(plot());
    fireEvent.keyDown(plot(), { key: "Home" });
    const [directOverlap, searchOverlap] = crosshairYs(container);
    expect(searchOverlap).toBeGreaterThan(directOverlap!);

    rerender(
      <AreaChart
        aria-label="Traffic"
        data={data}
        index="month"
        series={series}
        animate={false}
        yDomain={[0, 100]}
        stacked
      />,
    );
    const [direct, search] = crosshairYs(container);
    expect(direct).toBe(directOverlap);
    // 40 + 20 sits above direct's 40.
    expect(search).toBeLessThan(direct!);
    // Tooltip still lists raw values, not cumulative ones.
    expect(
      container.querySelector('[data-slot="chart-tooltip"]'),
    ).toHaveTextContent("20Search");
  });

  it("fills stacked bands continuously, treating gaps as zero", () => {
    const { container } = renderChart({ stacked: true });
    expect(
      container.querySelectorAll(
        '[data-slot="chart-area"][data-series="search"] path',
      ),
    ).toHaveLength(1);
    expect(container.querySelector('[data-slot="area-chart"]')).toHaveAttribute(
      "data-stacked",
    );
  });

  it("keeps a sign-changing stacked fill bounded by its line", () => {
    mockSize();
    const { container } = render(
      <AreaChart
        aria-label="Net"
        data={[
          { month: "Jan", base: 5, net: 10 },
          { month: "Feb", base: 5, net: -10 },
          { month: "Mar", base: 5, net: 20 },
        ]}
        index="month"
        series={[
          { key: "base", label: "Base" },
          { key: "net", label: "Net" },
        ]}
        stacked
        curve="linear"
        animate={false}
      />,
    );
    const line = container
      .querySelector('[data-slot="chart-line"][data-series="net"] path')!
      .getAttribute("d")!;
    const fill = container
      .querySelector('[data-slot="chart-area"][data-series="net"] path')!
      .getAttribute("d")!;
    // The fill's outer edge is the line itself, so the line never cuts it.
    expect(fill.startsWith(line)).toBe(true);
    // It closes back along the stack base: on Base (5) while positive, on
    // zero while negative.
    const ys = (d: string) =>
      [...d.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map((m) => Number(m[2]));
    const [, , , mar, feb, jan] = ys(fill);
    const baseY = ys(
      container
        .querySelector('[data-slot="chart-line"][data-series="base"] path')!
        .getAttribute("d")!,
    )[0]!;
    expect(jan).toBe(baseY);
    expect(mar).toBe(baseY);
    expect(feb).toBeGreaterThan(baseY);
  });

  it("sizes the stacked domain to the total", () => {
    mockSize();
    const { container } = renderChart({ stacked: true });
    const labels = [
      ...container.querySelectorAll('[data-slot="chart-axis"] text'),
    ].map((text) => text.textContent);
    // Largest total is 80 (Mar), beyond any single series.
    expect(labels).toContain("80");
  });

  it("restacks without hidden series", () => {
    mockSize();
    const { container } = renderChart({ stacked: true, yDomain: [0, 100] });
    fireEvent.click(screen.getByRole("button", { name: "Direct" }));
    fireEvent.focus(plot());
    fireEvent.keyDown(plot(), { key: "Home" });
    const [search] = crosshairYs(container);
    // Search alone (20) now sits on the zero baseline.
    const { container: alone } = render(
      <AreaChart
        aria-label="Alone"
        data={data}
        index="month"
        series={[series[1]!]}
        animate={false}
        yDomain={[0, 100]}
      />,
    );
    fireEvent.focus(screen.getByRole("application", { name: "Alone" }));
    fireEvent.keyDown(screen.getByRole("application", { name: "Alone" }), {
      key: "Home",
    });
    expect(search).toBe(crosshairYs(alone)[0]);
  });

  it("shares the line chart's keyboard readout and table", () => {
    mockSize();
    const { container } = renderChart({ stacked: true });
    fireEvent.focus(plot());
    fireEvent.keyDown(plot(), { key: "ArrowLeft" });
    expect(
      container.querySelector('[data-slot="area-chart-readout"]'),
    ).toHaveTextContent("Feb: Direct 30, Search no value");
    const table = screen.getByRole("table", { name: "Traffic" });
    expect(table).toHaveTextContent("Mar5030");
    fireEvent.click(screen.getByRole("button", { name: "Table view" }));
    expect(screen.queryByRole("application")).toBeNull();
  });

  it("clips washes to the plot area", () => {
    const { container } = renderChart({ yDomain: [0, 10] });
    const group = container.querySelector('[data-slot="area-chart-series"]')!;
    expect(group).toHaveAttribute("clip-path");
    expect(group.querySelector('[data-slot="chart-area"]')).toBeTruthy();
  });
});
