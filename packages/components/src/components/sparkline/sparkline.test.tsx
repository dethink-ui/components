import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sparkline, describeSparkline } from ".";

function mockSize(width: number, height: number) {
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({ width, height } as DOMRect);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Sparkline", () => {
  it("exposes an accessible summary of the series", () => {
    render(<Sparkline data={[12, 18, 9, 24]} label="Signups" />);
    expect(
      screen.getByRole("img", {
        name: "Signups: 4 values, from 12 to 24; low 9, high 24",
      }),
    ).toBeInTheDocument();
  });

  it("describes empty and single-value series", () => {
    expect(describeSparkline([], "Revenue")).toBe("Revenue: no data");
    expect(describeSparkline([null, 5])).toBe("Trend: 5");
    expect(describeSparkline([1000, 25_000], "MRR", (v) => `$${v}`)).toBe(
      "MRR: 2 values, from $1000 to $25000; low $1000, high $25000",
    );
  });

  it("hides from assistive technology when decorative", () => {
    const { container } = render(<Sparkline data={[1, 2]} decorative />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("colors the series from a palette slot or any CSS color", () => {
    const { container, rerender } = render(
      <Sparkline data={[1, 2]} color="chart-4" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--sparkline-color")).toBe(
      "var(--dt-color-chart-4)",
    );
    rerender(<Sparkline data={[1, 2]} color="rebeccapurple" />);
    expect(root.style.getPropertyValue("--sparkline-color")).toBe(
      "rebeccapurple",
    );
  });

  it("splits the line at gaps", () => {
    mockSize(200, 40);
    const { container } = render(
      <Sparkline data={[1, 2, null, 4, 5]} markers={false} />,
    );
    expect(
      container.querySelectorAll('[data-slot="sparkline-line"]'),
    ).toHaveLength(2);
  });

  it("draws values isolated between gaps as points", () => {
    mockSize(200, 40);
    const { container } = render(
      <Sparkline data={[1, null, 2, null, 3]} markers={false} />,
    );
    const points = container.querySelectorAll('[data-slot="sparkline-point"]');
    expect(points).toHaveLength(3);
    for (const point of points) {
      expect(point.getAttribute("d")).toMatch(/^M[\d.]+,[\d.]+h0$/);
    }
    expect(
      container.querySelectorAll('[data-slot="sparkline-line"]'),
    ).toHaveLength(0);
  });

  it("keeps isolated points visible in the area variant and before measuring", () => {
    const { container } = render(
      <Sparkline data={[4, 6, null, 5, null, 8, 9]} variant="area" />,
    );
    expect(
      container.querySelectorAll('[data-slot="sparkline-point"]'),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll('[data-slot="sparkline-line"]'),
    ).toHaveLength(2);
    expect(
      container.querySelector('[data-slot="sparkline-point"]'),
    ).toHaveAttribute("vector-effect", "non-scaling-stroke");
  });

  it("places markers once measured, defaulting to the last point", () => {
    mockSize(200, 40);
    const { container, rerender } = render(<Sparkline data={[3, 1, 9, 4]} />);
    expect(
      container.querySelectorAll('[data-slot="sparkline-marker"]'),
    ).toHaveLength(1);

    rerender(<Sparkline data={[3, 1, 9, 4]} markers />);
    expect(
      container.querySelectorAll('[data-slot="sparkline-marker"]'),
    ).toHaveLength(3);
  });

  it("renders an area wash under the line", () => {
    mockSize(200, 40);
    const { container } = render(<Sparkline data={[1, 3, 2]} variant="area" />);
    const area = container.querySelector('[data-slot="sparkline-area"]');
    expect(area?.getAttribute("fill")).toMatch(/^url\(#/);
    expect(container.querySelector("linearGradient")).not.toBeNull();
  });

  it("renders one bar per value and mutes all but the latest", () => {
    mockSize(200, 40);
    const { container, rerender } = render(
      <Sparkline data={[4, 0, 6, null, 8]} variant="bar" />,
    );
    const bars = container.querySelectorAll('[data-slot="sparkline-bar"]');
    // Zero-height and missing values draw nothing.
    expect(bars).toHaveLength(3);
    expect(container.querySelectorAll('[data-emphasis="muted"]')).toHaveLength(
      2,
    );

    rerender(<Sparkline data={[4, 6, 8]} variant="bar" emphasis="none" />);
    expect(container.querySelectorAll('[data-emphasis="muted"]')).toHaveLength(
      0,
    );
  });

  it("scales to its container before measuring", () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("preserveAspectRatio", "none");
    expect(
      container.querySelector('[data-slot="sparkline-line"]'),
    ).toHaveAttribute("vector-effect", "non-scaling-stroke");
  });

  it("disables entrance motion when animate is false", () => {
    mockSize(200, 40);
    const { container } = render(
      <Sparkline data={[1, 2, 3]} animate={false} />,
    );
    const line = container.querySelector(
      '[data-slot="sparkline-line"]',
    ) as SVGPathElement;
    expect(line.style.animation).toBe("none");
  });

  it("forwards refs and native attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Sparkline ref={ref} data={[1, 2]} id="spark" className="h-12 w-40" />,
    );
    expect(ref.current).toHaveAttribute("id", "spark");
    expect(ref.current).toHaveAttribute("data-slot", "sparkline");
    expect(ref.current?.className).toContain("h-12");
  });
});
