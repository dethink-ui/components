import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeltaBadge, describeDelta, getDeltaState } from ".";

describe("getDeltaState", () => {
  it.each([
    [12, "up", "up", "positive"],
    [-3, "up", "down", "negative"],
    [12, "down", "up", "negative"],
    [-3, "down", "down", "positive"],
    [0, "up", "flat", "neutral"],
  ] as const)(
    "value %s with positiveDirection %s is %s / %s",
    (value, positiveDirection, direction, meaning) => {
      expect(getDeltaState(value, { positiveDirection })).toEqual({
        direction,
        meaning,
      });
    },
  );

  it("treats small changes and missing values as flat", () => {
    expect(getDeltaState(0.4, { neutralThreshold: 0.5 }).meaning).toBe(
      "neutral",
    );
    expect(getDeltaState(-0.5, { neutralThreshold: 0.5 }).direction).toBe(
      "flat",
    );
    expect(getDeltaState(null)).toEqual({
      direction: "flat",
      meaning: "neutral",
    });
    expect(getDeltaState(Number.NaN).direction).toBe("flat");
  });
});

describe("DeltaBadge", () => {
  it("shows a signed value and announces direction with the comparison", () => {
    const { container } = render(
      <DeltaBadge value={12.4} comparison="vs last month" />,
    );
    expect(container).toHaveTextContent("+12.4%");
    expect(screen.getByText("Up 12.4% vs last month")).toHaveClass("sr-only");
  });

  it("uses a true minus sign for decreases", () => {
    const { container } = render(<DeltaBadge value={-3.25} />);
    expect(container).toHaveTextContent("−3.3%");
    expect(screen.getByText("Down 3.3%")).toBeInTheDocument();
  });

  it("colors by meaning, not by sign", () => {
    const { container, rerender } = render(<DeltaBadge value={-8} />);
    const badge = container.firstElementChild!;
    expect(badge).toHaveAttribute("data-meaning", "negative");
    expect(badge.className).toContain("bg-destructive/10");

    rerender(<DeltaBadge value={-8} positiveDirection="down" />);
    expect(badge).toHaveAttribute("data-meaning", "positive");
    expect(badge).toHaveAttribute("data-direction", "down");
    expect(badge.className).toContain("bg-success/10");
  });

  it("renders a dash and explains missing data", () => {
    const { container } = render(
      <DeltaBadge value={null} comparison="vs last week" />,
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-direction",
      "flat",
    );
    expect(container).toHaveTextContent("—");
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText("No change data vs last week")).toBeInTheDocument();
  });

  it("formats flat changes within the threshold as zero", () => {
    const { container } = render(
      <DeltaBadge value={0.2} neutralThreshold={0.5} />,
    );
    expect(container).toHaveTextContent("0%");
    expect(screen.getByText("No change")).toBeInTheDocument();
  });

  it("accepts a custom magnitude formatter", () => {
    const { container } = render(
      <DeltaBadge
        value={-1200}
        formatValue={(v) => `$${v.toLocaleString("en-US")}`}
      />,
    );
    expect(container).toHaveTextContent("−$1,200");
    expect(describeDelta(-1200, { formatValue: (v) => `$${v}` })).toBe(
      "Down $1200",
    );
  });

  it("supports a plain variant that keeps text in the foreground color", () => {
    const { container } = render(<DeltaBadge value={5} variant="plain" />);
    const badge = container.firstElementChild!;
    expect(badge.className).toContain("text-foreground");
    expect(badge.querySelector("svg")?.getAttribute("class")).toContain(
      "text-success",
    );
  });

  it("forwards refs and native attributes", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<DeltaBadge ref={ref} value={1} id="delta" />);
    expect(ref.current).toHaveAttribute("id", "delta");
    expect(ref.current).toHaveAttribute("data-slot", "delta-badge");
  });
});
