import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BarChart } from ".";

const data = [
  { quarter: "Q1", new: 40, churned: 10 },
  { quarter: "Q2", new: 30, churned: null },
  { quarter: "Q3", new: 50, churned: 20 },
];

const series = [
  { key: "new", label: "New" },
  { key: "churned", label: "Churned" },
];

function mockSize(width = 400, height = 240) {
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({ width, height, left: 0, top: 0 } as DOMRect);
}

function renderChart(props: Partial<Parameters<typeof BarChart>[0]> = {}) {
  return render(
    <BarChart
      aria-label="Customers"
      data={data}
      index="quarter"
      series={series}
      animate={false}
      {...props}
    />,
  );
}

function plot() {
  return screen.getByRole("application", { name: "Customers" });
}

// Bar geometry from barPath: "M{x},{baseline}V{end}A… {x+r},{value}H…A… {right},{end}V{baseline}Z".
function bars(container: HTMLElement, key: string) {
  const selector = `[data-slot="chart-bars"][data-series="${key}"] [data-slot="chart-bar"]`;
  return [...container.querySelectorAll(selector)].map((bar) => {
    const d = bar.getAttribute("d")!;
    const [, x, baseline] = d.match(/^M(-?[\d.]+),(-?[\d.]+)/)!.map(Number);
    const arcs = [...d.matchAll(/ (-?[\d.]+),-?[\d.]+(?=[HV])/g)];
    const right = Number(arcs.at(-1)![1]);
    return {
      d,
      x: x!,
      baseline: baseline!,
      width: right - x!,
      index: Number(bar.getAttribute("data-index")),
    };
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BarChart", () => {
  it("draws grouped bars per series with missing values left empty", () => {
    mockSize();
    const { container } = renderChart();
    expect(bars(container, "new")).toHaveLength(3);
    expect(bars(container, "churned").map((bar) => bar.index)).toEqual([0, 2]);
    expect(plot()).toHaveAttribute("aria-roledescription", "bar chart");
  });

  it("caps bars at 24px, with a 2px gap inside a group", () => {
    mockSize(1200, 240);
    const { container } = renderChart();
    const [first] = bars(container, "new");
    const [second] = bars(container, "churned");
    expect(first!.width).toBeLessThanOrEqual(24);
    expect(second!.x - (first!.x + first!.width)).toBeCloseTo(2, 1);
  });

  it("honors a smaller maxBarWidth", () => {
    mockSize(1200, 240);
    const { container } = renderChart({ maxBarWidth: 10 });
    expect(bars(container, "new")[0]!.width).toBeCloseTo(10, 1);
  });

  it("rounds data-ends and keeps baselines square", () => {
    const { container } = renderChart();
    const d = bars(container, "new")[0]!.d;
    expect(d).toMatch(/A4,4/);
    expect(d.endsWith("Z")).toBe(true);
  });

  it("stacks segments with a 2px gap and rounds only the outermost", () => {
    mockSize();
    const { container } = renderChart({ stacked: true, yDomain: [0, 100] });
    const [lower] = bars(container, "new");
    const [upper] = bars(container, "churned");
    // One bar per index: both series share x.
    expect(upper!.x).toBe(lower!.x);
    expect(lower!.d).not.toMatch(/A4,4/);
    expect(upper!.d).toMatch(/A4,4/);
    // The upper segment's baseline sits 2px above the lower segment's end.
    const lowerEnd = Number(lower!.d.match(/V(-?[\d.]+)/)![1]);
    expect(lowerEnd - upper!.baseline).toBeCloseTo(2, 1);
    // Q2 has no churn, so New is outermost there and keeps its rounded end.
    expect(bars(container, "new")[1]!.d).toMatch(/A4,4/);
  });

  it("stacks negative values downwards from zero", () => {
    mockSize();
    const { container } = render(
      <BarChart
        aria-label="Net"
        data={[{ q: "Q1", gained: 10, lost: -6 }]}
        index="q"
        series={[
          { key: "gained", label: "Gained" },
          { key: "lost", label: "Lost" },
        ]}
        stacked
        yDomain={[-10, 10]}
        animate={false}
      />,
    );
    const [gained] = bars(container, "gained");
    const [lost] = bars(container, "lost");
    // Both start at zero (no inset: nothing below them on their side).
    expect(gained!.baseline).toBe(lost!.baseline);
    expect(lost!.d).toMatch(/A4,4 0 0 0/);
  });

  it("always starts the value axis at zero", () => {
    mockSize();
    const { container } = renderChart({
      data: [
        { quarter: "Q1", new: 400, churned: 410 },
        { quarter: "Q2", new: 420, churned: 430 },
      ],
    });
    const labels = [
      ...container.querySelectorAll('[data-slot="chart-axis"] text'),
    ].map((text) => text.textContent);
    expect(labels).toContain("0");
  });

  it("highlights the hovered slot and emphasises the hovered bar's series", () => {
    mockSize();
    const { container } = renderChart();
    const bar = container.querySelector(
      '[data-series="churned"] [data-slot="chart-bar"]',
    )!;
    fireEvent.pointerMove(bar, { clientX: 60 });
    expect(
      container.querySelector('[data-slot="chart-band-highlight"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-slot="chart-crosshair"]')).toBeNull();
    const active = container.querySelector(
      '[data-slot="chart-tooltip-item"][data-active]',
    );
    expect(active).toHaveTextContent("Churned");
    expect(
      container.querySelector('[data-slot="chart-bars"][data-series="new"]'),
    ).toHaveAttribute("data-dimmed");
    fireEvent.pointerLeave(plot());
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toBeNull();
    expect(
      container.querySelector('[data-slot="chart-bars"][data-series="new"]'),
    ).not.toHaveAttribute("data-dimmed");
  });

  it("maps pointer position to the nearest band", () => {
    mockSize(400, 240);
    const { container } = renderChart();
    fireEvent.pointerMove(plot(), { clientX: 395 });
    expect(
      container.querySelector('[data-slot="chart-tooltip"]'),
    ).toHaveTextContent("Q3");
  });

  it("shares the keyboard readout and table", () => {
    mockSize();
    const { container } = renderChart({ stacked: true });
    fireEvent.focus(plot());
    fireEvent.keyDown(plot(), { key: "ArrowLeft" });
    expect(
      container.querySelector('[data-slot="bar-chart-readout"]'),
    ).toHaveTextContent("Q2: New 30, Churned no value");
    fireEvent.keyDown(plot(), { key: "Home" });
    expect(
      container.querySelector('[data-slot="chart-band-highlight"]'),
    ).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Customers" })).toHaveTextContent(
      "Q35020",
    );
  });

  it("opens a single category's tooltip beside its bars, inside the chart", () => {
    mockSize(320, 240);
    const { container } = renderChart({ data: [data[0]!] });
    fireEvent.pointerMove(plot(), { clientX: 200 });
    const tooltip = container.querySelector(
      '[data-slot="chart-tooltip"]',
    ) as HTMLElement;
    const offset = Number(tooltip.style.transform.match(/(\d+(\.\d+)?)px/)![1]);
    const [first] = bars(container, "new");
    const [last] = bars(container, "churned");
    // Beside the group (half its width plus 4px), not half the plot away.
    expect(offset).toBeCloseTo((last!.x + last!.width - first!.x) / 2 + 4, 0);
    const left = Number.parseFloat(tooltip.style.left);
    const room =
      tooltip.dataset.side === "left" ? left - offset : 320 - left - offset;
    expect(tooltip.style.maxWidth).toBe(`min(15rem, ${Math.floor(room)}px)`);
    expect(tooltip.style.minWidth).toBe(`min(8rem, ${Math.floor(room)}px)`);
  });

  it("keeps dense grouped bars inside their own category", () => {
    mockSize(320, 240);
    const dense = Array.from({ length: 60 }, (_, i) => ({
      day: `D${i + 1}`,
      a: 10 + i,
      b: 20 + i,
      c: 30 + i,
    }));
    const { container } = render(
      <BarChart
        aria-label="Dense"
        data={dense}
        index="day"
        series={[
          { key: "a", label: "A" },
          { key: "b", label: "B" },
          { key: "c", label: "C" },
        ]}
        animate={false}
      />,
    );
    const a = bars(container, "a");
    const c = bars(container, "c");
    for (let i = 0; i < dense.length - 1; i += 1) {
      expect(c[i]!.x + c[i]!.width).toBeLessThan(a[i + 1]!.x);
    }
    // Hovering D20's third bar reads D20, not its neighbour.
    const bar = container.querySelectorAll(
      '[data-series="c"] [data-slot="chart-bar"]',
    )[19]!;
    fireEvent.pointerMove(bar, { clientX: c[19]!.x + c[19]!.width / 2 });
    const tooltip = container.querySelector('[data-slot="chart-tooltip"]')!;
    expect(tooltip.firstElementChild).toHaveTextContent(/^D20$/);
    expect(
      tooltip.querySelector('[data-slot="chart-tooltip-item"][data-active]'),
    ).toHaveTextContent("C");
  });

  it("turns off grow motion when animate is false", () => {
    const { container } = renderChart();
    const bar = container.querySelector(
      '[data-slot="chart-bar"]',
    ) as SVGPathElement;
    expect(bar.style.animation).toBe("none");
    expect(bar.getAttribute("class")).toContain("motion-safe:animate-");
  });
});
