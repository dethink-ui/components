import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DotMatrixBackground,
  dotMatrixBackgroundClassNames,
  dotMatrixBackgroundContentClassNames,
  dotMatrixBackgroundLayerClassNames,
} from ".";

function getRoot(container: HTMLElement) {
  const root = container.querySelector('[data-slot="dot-matrix-background"]');
  if (!(root instanceof HTMLElement)) {
    throw new Error("dot-matrix-background root not rendered");
  }
  return root;
}

describe("DotMatrixBackground", () => {
  it("renders children inside the content slot above the decorative layer", () => {
    const { container } = render(
      <DotMatrixBackground>
        <h1>Compute in motion</h1>
      </DotMatrixBackground>,
    );

    const content = container.querySelector(
      '[data-slot="dot-matrix-background-content"]',
    );
    expect(content).not.toBeNull();
    expect(content).toContainElement(
      screen.getByRole("heading", { name: "Compute in motion" }),
    );
  });

  it("reflects default variant props as data attributes", () => {
    const { container } = render(<DotMatrixBackground />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "true");
    expect(root).toHaveAttribute("data-density", "normal");
    expect(root).toHaveAttribute("data-intensity", "subtle");
    expect(root).toHaveAttribute("data-speed", "normal");
    expect(root).toHaveAttribute("data-tone", "muted");
    expect(root).not.toHaveAttribute("data-reduced-motion");
  });

  it("reflects explicit variant props as data attributes", () => {
    const { container } = render(
      <DotMatrixBackground
        density="dense"
        intensity="bold"
        speed="fast"
        tone="primary"
      />,
    );
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-density", "dense");
    expect(root).toHaveAttribute("data-intensity", "bold");
    expect(root).toHaveAttribute("data-speed", "fast");
    expect(root).toHaveAttribute("data-tone", "primary");
  });

  it("renders three animated pulses when animating", () => {
    const { container } = render(<DotMatrixBackground />);

    const pulses = container.querySelectorAll(
      '[data-slot="dot-matrix-background-pulse"]',
    );
    expect(pulses).toHaveLength(3);
  });

  it("renders one static highlight with animate={false}", () => {
    const { container } = render(<DotMatrixBackground animate={false} />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "false");
    expect(root).toHaveAttribute("data-reduced-motion", "true");

    const pulses = container.querySelectorAll(
      '[data-slot="dot-matrix-background-pulse"]',
    );
    expect(pulses).toHaveLength(1);
    expect(pulses[0]).toHaveClass("opacity-50");
  });

  it("renders identical markup for identical seeds and differing markup for different seeds", () => {
    const first = render(<DotMatrixBackground animate={false} seed={7} />);
    const second = render(<DotMatrixBackground animate={false} seed={7} />);
    const third = render(<DotMatrixBackground animate={false} seed={8} />);

    expect(first.container.innerHTML).toBe(second.container.innerHTML);
    expect(first.container.innerHTML).not.toBe(third.container.innerHTML);
  });

  it("merges className last on the root", () => {
    const { container } = render(
      <DotMatrixBackground className="custom-root" />,
    );
    const root = getRoot(container);

    expect(root).toHaveClass("custom-root");
    expect(root).toHaveClass("relative");
  });

  it("forwards its ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<DotMatrixBackground ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "dot-matrix-background");
  });

  it("exposes classNames helpers that merge custom classes", () => {
    expect(dotMatrixBackgroundClassNames({ className: "h-96" })).toContain(
      "h-96",
    );
    expect(dotMatrixBackgroundClassNames({ className: "h-96" })).toContain(
      "relative",
    );
    expect(dotMatrixBackgroundLayerClassNames({ tone: "primary" })).toContain(
      "pointer-events-none",
    );
    expect(dotMatrixBackgroundContentClassNames()).toContain("z-10");
  });
});
