import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  LightStreaksBackground,
  lightStreaksBackgroundClassNames,
  lightStreaksBackgroundContentClassNames,
  lightStreaksBackgroundLayerClassNames,
} from ".";

function getRoot(container: HTMLElement) {
  const root = container.querySelector(
    '[data-slot="light-streaks-background"]',
  );
  if (!(root instanceof HTMLElement)) {
    throw new Error("light-streaks-background root not rendered");
  }
  return root;
}

describe("LightStreaksBackground", () => {
  it("renders children inside the content slot above the decorative layer", () => {
    const { container } = render(
      <LightStreaksBackground>
        <h1>Launch night</h1>
      </LightStreaksBackground>,
    );

    const content = container.querySelector(
      '[data-slot="light-streaks-background-content"]',
    );
    expect(content).not.toBeNull();
    expect(content).toContainElement(
      screen.getByRole("heading", { name: "Launch night" }),
    );
  });

  it("reflects default variant props as data attributes", () => {
    const { container } = render(<LightStreaksBackground />);
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
      <LightStreaksBackground
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

  it("renders one animated streak per geometry entry when animating", () => {
    expect(
      render(
        <LightStreaksBackground density="sparse" />,
      ).container.querySelectorAll(
        '[data-slot="light-streaks-background-streak"]',
      ),
    ).toHaveLength(3);
    expect(
      render(
        <LightStreaksBackground density="normal" />,
      ).container.querySelectorAll(
        '[data-slot="light-streaks-background-streak"]',
      ),
    ).toHaveLength(4);
    expect(
      render(
        <LightStreaksBackground density="dense" />,
      ).container.querySelectorAll(
        '[data-slot="light-streaks-background-streak"]',
      ),
    ).toHaveLength(5);
  });

  it("renders a single static streak with animate={false}", () => {
    const { container } = render(<LightStreaksBackground animate={false} />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "false");
    expect(root).toHaveAttribute("data-reduced-motion", "true");

    const streaks = container.querySelectorAll(
      '[data-slot="light-streaks-background-streak"]',
    );
    expect(streaks).toHaveLength(1);
    expect(streaks[0]).toHaveClass("opacity-40");
  });

  it("renders identical markup for identical seeds and differing markup for different seeds", () => {
    const first = render(<LightStreaksBackground animate={false} seed={7} />);
    const second = render(<LightStreaksBackground animate={false} seed={7} />);
    const third = render(<LightStreaksBackground animate={false} seed={8} />);

    expect(first.container.innerHTML).toBe(second.container.innerHTML);
    expect(first.container.innerHTML).not.toBe(third.container.innerHTML);
  });

  it("merges className last on the root", () => {
    const { container } = render(
      <LightStreaksBackground className="custom-root" />,
    );
    const root = getRoot(container);

    expect(root).toHaveClass("custom-root");
    expect(root).toHaveClass("relative");
  });

  it("forwards its ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<LightStreaksBackground ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute(
      "data-slot",
      "light-streaks-background",
    );
  });

  it("exposes classNames helpers that merge custom classes", () => {
    expect(lightStreaksBackgroundClassNames({ className: "h-96" })).toContain(
      "h-96",
    );
    expect(lightStreaksBackgroundClassNames({ className: "h-96" })).toContain(
      "relative",
    );
    expect(
      lightStreaksBackgroundLayerClassNames({ tone: "primary" }),
    ).toContain("pointer-events-none");
    expect(lightStreaksBackgroundContentClassNames()).toContain("z-10");
  });
});
