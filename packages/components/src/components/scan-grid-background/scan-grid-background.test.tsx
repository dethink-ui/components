import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ScanGridBackground,
  getScanGridBackgroundGeometry,
  scanGridBackgroundClassNames,
  scanGridBackgroundContentClassNames,
  scanGridBackgroundLayerClassNames,
} from ".";

function getRoot(container: HTMLElement) {
  const root = container.querySelector('[data-slot="scan-grid-background"]');
  if (!(root instanceof HTMLElement)) {
    throw new Error("scan-grid-background root not rendered");
  }
  return root;
}

describe("ScanGridBackground", () => {
  it("renders children inside the content slot above the decorative layer", () => {
    const { container } = render(
      <ScanGridBackground>
        <h1>Continuous monitoring</h1>
      </ScanGridBackground>,
    );

    const content = container.querySelector(
      '[data-slot="scan-grid-background-content"]',
    );
    expect(content).not.toBeNull();
    expect(content).toContainElement(
      screen.getByRole("heading", { name: "Continuous monitoring" }),
    );
  });

  it("reflects default variant props as data attributes", () => {
    const { container } = render(<ScanGridBackground />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "true");
    expect(root).toHaveAttribute("data-density", "normal");
    expect(root).toHaveAttribute("data-direction", "vertical");
    expect(root).toHaveAttribute("data-intensity", "subtle");
    expect(root).toHaveAttribute("data-speed", "normal");
    expect(root).toHaveAttribute("data-tone", "muted");
    expect(root).not.toHaveAttribute("data-reduced-motion");
  });

  it("reflects explicit variant props as data attributes", () => {
    const { container } = render(
      <ScanGridBackground
        density="dense"
        direction="horizontal"
        intensity="bold"
        speed="fast"
        tone="primary"
      />,
    );
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-density", "dense");
    expect(root).toHaveAttribute("data-direction", "horizontal");
    expect(root).toHaveAttribute("data-intensity", "bold");
    expect(root).toHaveAttribute("data-speed", "fast");
    expect(root).toHaveAttribute("data-tone", "primary");
  });

  it("renders exactly one scan band", () => {
    const { container } = render(<ScanGridBackground />);

    const bands = container.querySelectorAll(
      '[data-slot="scan-grid-background-band"]',
    );
    expect(bands).toHaveLength(1);
  });

  it("renders the frozen band composition with animate={false}", () => {
    const { container } = render(
      <ScanGridBackground animate={false} seed={4} />,
    );
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "false");
    expect(root).toHaveAttribute("data-reduced-motion", "true");

    const band = container.querySelector(
      '[data-slot="scan-grid-background-band"]',
    );
    expect(band).toHaveClass("opacity-50");
    expect(band).toHaveStyle({
      top: `${getScanGridBackgroundGeometry(4).staticOffset}%`,
    });
  });

  it("freezes the horizontal band on the inline axis", () => {
    const { container } = render(
      <ScanGridBackground animate={false} direction="horizontal" seed={4} />,
    );

    const band = container.querySelector(
      '[data-slot="scan-grid-background-band"]',
    );
    expect(band).toHaveStyle({
      left: `${getScanGridBackgroundGeometry(4).staticOffset}%`,
    });
  });

  it("renders identical markup for identical seeds and differing markup for different seeds", () => {
    const first = render(<ScanGridBackground animate={false} seed={7} />);
    const second = render(<ScanGridBackground animate={false} seed={7} />);
    const third = render(<ScanGridBackground animate={false} seed={8} />);

    expect(first.container.innerHTML).toBe(second.container.innerHTML);
    expect(first.container.innerHTML).not.toBe(third.container.innerHTML);
  });

  it("merges className last on the root", () => {
    const { container } = render(
      <ScanGridBackground className="custom-root" />,
    );
    const root = getRoot(container);

    expect(root).toHaveClass("custom-root");
    expect(root).toHaveClass("relative");
  });

  it("forwards its ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ScanGridBackground ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-slot", "scan-grid-background");
  });

  it("exposes classNames helpers that merge custom classes", () => {
    expect(scanGridBackgroundClassNames({ className: "h-96" })).toContain(
      "h-96",
    );
    expect(scanGridBackgroundClassNames({ className: "h-96" })).toContain(
      "relative",
    );
    expect(scanGridBackgroundLayerClassNames({ tone: "primary" })).toContain(
      "pointer-events-none",
    );
    expect(scanGridBackgroundContentClassNames()).toContain("z-10");
  });
});
