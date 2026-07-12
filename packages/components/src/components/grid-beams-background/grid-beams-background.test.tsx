import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  GridBeamsBackground,
  gridBeamsBackgroundClassNames,
  gridBeamsBackgroundContentClassNames,
  gridBeamsBackgroundLayerClassNames,
} from ".";

function getRoot(container: HTMLElement) {
  const root = container.querySelector('[data-slot="grid-beams-background"]');
  if (!(root instanceof HTMLElement)) {
    throw new Error("grid-beams-background root not rendered");
  }
  return root;
}

describe("GridBeamsBackground", () => {
  it("renders children inside the content slot above the decorative layer", () => {
    const { container } = render(
      <GridBeamsBackground>
        <h1>Launch faster</h1>
      </GridBeamsBackground>,
    );

    const content = container.querySelector(
      '[data-slot="grid-beams-background-content"]',
    );
    expect(content).not.toBeNull();
    expect(content).toContainElement(
      screen.getByRole("heading", { name: "Launch faster" }),
    );
  });

  it("reflects default variant props as data attributes", () => {
    const { container } = render(<GridBeamsBackground />);
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
      <GridBeamsBackground
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

  it("renders one animated beam per geometry entry when animating", () => {
    const { container } = render(<GridBeamsBackground density="normal" />);

    const beams = container.querySelectorAll(
      '[data-slot="grid-beams-background-beam"]',
    );
    expect(beams).toHaveLength(5);
  });

  it("renders the static composition with animate={false}", () => {
    const { container } = render(<GridBeamsBackground animate={false} />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "false");
    expect(root).toHaveAttribute("data-reduced-motion", "true");

    const beams = container.querySelectorAll(
      '[data-slot="grid-beams-background-beam"]',
    );
    expect(beams).toHaveLength(2);
  });

  it("renders identical markup for identical seeds and differing markup for different seeds", () => {
    const first = render(<GridBeamsBackground animate={false} seed={7} />);
    const second = render(<GridBeamsBackground animate={false} seed={7} />);
    const third = render(<GridBeamsBackground animate={false} seed={8} />);

    expect(first.container.innerHTML).toBe(second.container.innerHTML);
    expect(first.container.innerHTML).not.toBe(third.container.innerHTML);
  });

  it("merges className last on the root", () => {
    const { container } = render(
      <GridBeamsBackground className="custom-root" />,
    );
    const root = getRoot(container);

    expect(root).toHaveClass("custom-root");
    expect(root).toHaveClass("relative");
  });

  it("forwards its ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<GridBeamsBackground ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "grid-beams-background");
  });

  it("exposes classNames helpers that merge custom classes", () => {
    expect(gridBeamsBackgroundClassNames({ className: "h-96" })).toContain(
      "h-96",
    );
    expect(gridBeamsBackgroundClassNames({ className: "h-96" })).toContain(
      "relative",
    );
    expect(gridBeamsBackgroundLayerClassNames({ tone: "primary" })).toContain(
      "pointer-events-none",
    );
    expect(gridBeamsBackgroundContentClassNames()).toContain("z-10");
  });
});
