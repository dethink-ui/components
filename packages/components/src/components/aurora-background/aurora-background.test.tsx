import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AuroraBackground,
  auroraBackgroundClassNames,
  auroraBackgroundContentClassNames,
  auroraBackgroundHueShifts,
  auroraBackgroundLayerClassNames,
} from ".";

function getRoot(container: HTMLElement) {
  const root = container.querySelector('[data-slot="aurora-background"]');
  if (!(root instanceof HTMLElement)) {
    throw new Error("aurora-background root not rendered");
  }
  return root;
}

describe("AuroraBackground", () => {
  it("renders children inside the content slot above the decorative layer", () => {
    const { container } = render(
      <AuroraBackground>
        <h1>Northern lights</h1>
      </AuroraBackground>,
    );

    const content = container.querySelector(
      '[data-slot="aurora-background-content"]',
    );
    expect(content).not.toBeNull();
    expect(content).toContainElement(
      screen.getByRole("heading", { name: "Northern lights" }),
    );
  });

  it("reflects default variant props as data attributes", () => {
    const { container } = render(<AuroraBackground />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "true");
    expect(root).toHaveAttribute("data-density", "normal");
    expect(root).toHaveAttribute("data-intensity", "subtle");
    expect(root).toHaveAttribute("data-speed", "normal");
    expect(root).toHaveAttribute("data-tone", "primary");
    expect(root).not.toHaveAttribute("data-reduced-motion");
  });

  it("reflects explicit variant props as data attributes", () => {
    const { container } = render(
      <AuroraBackground
        density="dense"
        intensity="bold"
        speed="fast"
        tone="muted"
      />,
    );
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-density", "dense");
    expect(root).toHaveAttribute("data-intensity", "bold");
    expect(root).toHaveAttribute("data-speed", "fast");
    expect(root).toHaveAttribute("data-tone", "muted");
  });

  it("renders one ribbon per geometry entry for each density", () => {
    expect(
      render(<AuroraBackground density="sparse" />).container.querySelectorAll(
        '[data-slot="aurora-background-ribbon"]',
      ),
    ).toHaveLength(3);
    expect(
      render(<AuroraBackground density="normal" />).container.querySelectorAll(
        '[data-slot="aurora-background-ribbon"]',
      ),
    ).toHaveLength(4);
    expect(
      render(<AuroraBackground density="dense" />).container.querySelectorAll(
        '[data-slot="aurora-background-ribbon"]',
      ),
    ).toHaveLength(5);
  });

  it("renders the full static composition with animate={false}", () => {
    const { container } = render(<AuroraBackground animate={false} />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "false");
    expect(root).toHaveAttribute("data-reduced-motion", "true");

    const ribbons = container.querySelectorAll(
      '[data-slot="aurora-background-ribbon"]',
    );
    expect(ribbons).toHaveLength(4);
    expect(ribbons[0]).toHaveClass("opacity-70");
    expect(ribbons[1]).toHaveClass("opacity-50");
  });

  it("assigns each ribbon slot its literal hue shift custom property", () => {
    const { container } = render(
      <AuroraBackground animate={false} density="dense" />,
    );
    const ribbons = container.querySelectorAll<HTMLElement>(
      '[data-slot="aurora-background-ribbon"]',
    );

    expect(auroraBackgroundHueShifts).toEqual([0, 75, -60, 145, -115]);
    ribbons.forEach((ribbon, slot) => {
      expect(ribbon.style.getPropertyValue("--aurora-hue-shift")).toBe(
        `${auroraBackgroundHueShifts[slot]}`,
      );
    });
  });

  it("renders identical markup for identical seeds and differing markup for different seeds", () => {
    const first = render(<AuroraBackground animate={false} seed={7} />);
    const second = render(<AuroraBackground animate={false} seed={7} />);
    const third = render(<AuroraBackground animate={false} seed={8} />);

    expect(first.container.innerHTML).toBe(second.container.innerHTML);
    expect(first.container.innerHTML).not.toBe(third.container.innerHTML);
  });

  it("merges className last on the root", () => {
    const { container } = render(<AuroraBackground className="custom-root" />);
    const root = getRoot(container);

    expect(root).toHaveClass("custom-root");
    expect(root).toHaveClass("relative");
  });

  it("forwards its ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AuroraBackground ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "aurora-background");
  });

  it("exposes classNames helpers that merge custom classes", () => {
    expect(auroraBackgroundClassNames({ className: "h-96" })).toContain("h-96");
    expect(auroraBackgroundClassNames({ className: "h-96" })).toContain(
      "relative",
    );
    expect(auroraBackgroundLayerClassNames({ tone: "muted" })).toContain(
      "pointer-events-none",
    );
    expect(auroraBackgroundContentClassNames()).toContain("z-10");
  });
});
