import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  StarfieldBackground,
  getStarfieldBackgroundGeometry,
  starfieldBackgroundClassNames,
  starfieldBackgroundContentClassNames,
  starfieldBackgroundLayerClassNames,
} from ".";

function getRoot(container: HTMLElement) {
  const root = container.querySelector('[data-slot="starfield-background"]');
  if (!(root instanceof HTMLElement)) {
    throw new Error("starfield-background root not rendered");
  }
  return root;
}

function expectedCircleCount(density: "sparse" | "normal" | "dense") {
  return getStarfieldBackgroundGeometry(1, density).reduce(
    (total, layer) => total + layer.stars.length + layer.twinkles.length,
    0,
  );
}

describe("StarfieldBackground", () => {
  it("renders children inside the content slot above the decorative layer", () => {
    const { container } = render(
      <StarfieldBackground>
        <h1>To the launch pad</h1>
      </StarfieldBackground>,
    );

    const content = container.querySelector(
      '[data-slot="starfield-background-content"]',
    );
    expect(content).not.toBeNull();
    expect(content).toContainElement(
      screen.getByRole("heading", { name: "To the launch pad" }),
    );
  });

  it("reflects default variant props as data attributes", () => {
    const { container } = render(<StarfieldBackground />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "true");
    expect(root).toHaveAttribute("data-density", "normal");
    expect(root).toHaveAttribute("data-intensity", "subtle");
    expect(root).toHaveAttribute("data-interactive", "true");
    expect(root).toHaveAttribute("data-speed", "normal");
    expect(root).toHaveAttribute("data-tone", "muted");
    expect(root).not.toHaveAttribute("data-reduced-motion");
  });

  it("reflects explicit variant props as data attributes", () => {
    const { container } = render(
      <StarfieldBackground
        density="dense"
        intensity="bold"
        interactive={false}
        speed="fast"
        tone="primary"
      />,
    );
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-density", "dense");
    expect(root).toHaveAttribute("data-intensity", "bold");
    expect(root).toHaveAttribute("data-interactive", "false");
    expect(root).toHaveAttribute("data-speed", "fast");
    expect(root).toHaveAttribute("data-tone", "primary");
  });

  it("renders three star layers as SVG circles, not per-star divs", () => {
    const { container } = render(<StarfieldBackground />);

    const layers = container.querySelectorAll(
      '[data-slot="starfield-background-star-layer"]',
    );
    expect(layers).toHaveLength(3);
    expect(container.querySelectorAll("svg")).toHaveLength(3);
    expect(container.querySelectorAll("circle")).toHaveLength(
      expectedCircleCount("normal"),
    );
  });

  it("scales star counts with density", () => {
    expect(
      render(
        <StarfieldBackground density="sparse" />,
      ).container.querySelectorAll("circle"),
    ).toHaveLength(expectedCircleCount("sparse"));
    expect(
      render(
        <StarfieldBackground density="dense" />,
      ).container.querySelectorAll("circle"),
    ).toHaveLength(expectedCircleCount("dense"));
  });

  it("renders the same circles statically with animate={false}", () => {
    const { container } = render(<StarfieldBackground animate={false} />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "false");
    expect(root).toHaveAttribute("data-reduced-motion", "true");
    expect(container.querySelectorAll("circle")).toHaveLength(
      expectedCircleCount("normal"),
    );

    const twinkles = container.querySelectorAll(
      '[data-slot="starfield-background-twinkle"]',
    );
    expect(twinkles.length).toBeGreaterThan(0);
    for (const twinkle of twinkles) {
      expect(twinkle).toHaveAttribute("opacity", "0.6");
    }
  });

  it("renders identical markup for identical seeds and differing markup for different seeds", () => {
    const first = render(<StarfieldBackground animate={false} seed={7} />);
    const second = render(<StarfieldBackground animate={false} seed={7} />);
    const third = render(<StarfieldBackground animate={false} seed={8} />);

    expect(first.container.innerHTML).toBe(second.container.innerHTML);
    expect(first.container.innerHTML).not.toBe(third.container.innerHTML);
  });

  it("merges className last on the root", () => {
    const { container } = render(
      <StarfieldBackground className="custom-root" />,
    );
    const root = getRoot(container);

    expect(root).toHaveClass("custom-root");
    expect(root).toHaveClass("relative");
  });

  it("forwards its ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<StarfieldBackground ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "starfield-background");
  });

  it("exposes classNames helpers that merge custom classes", () => {
    expect(starfieldBackgroundClassNames({ className: "h-96" })).toContain(
      "h-96",
    );
    expect(starfieldBackgroundClassNames({ className: "h-96" })).toContain(
      "relative",
    );
    expect(starfieldBackgroundLayerClassNames({ tone: "primary" })).toContain(
      "pointer-events-none",
    );
    expect(starfieldBackgroundContentClassNames()).toContain("z-10");
  });
});
