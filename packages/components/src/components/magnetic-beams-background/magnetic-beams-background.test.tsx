import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  MagneticBeamsBackground,
  magneticBeamsBackgroundClassNames,
  magneticBeamsBackgroundContentClassNames,
  magneticBeamsBackgroundLayerClassNames,
} from ".";

function getRoot(container: HTMLElement) {
  const root = container.querySelector(
    '[data-slot="magnetic-beams-background"]',
  );
  if (!(root instanceof HTMLElement)) {
    throw new Error("magnetic-beams-background root not rendered");
  }
  return root;
}

describe("MagneticBeamsBackground", () => {
  it("renders children inside the content slot above the decorative layer", () => {
    const { container } = render(
      <MagneticBeamsBackground>
        <h1>Launch faster</h1>
      </MagneticBeamsBackground>,
    );

    const content = container.querySelector(
      '[data-slot="magnetic-beams-background-content"]',
    );
    expect(content).not.toBeNull();
    expect(content).toContainElement(
      screen.getByRole("heading", { name: "Launch faster" }),
    );
  });

  it("reflects default variant props as data attributes", () => {
    const { container } = render(<MagneticBeamsBackground />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "true");
    expect(root).toHaveAttribute("data-density", "normal");
    expect(root).toHaveAttribute("data-intensity", "subtle");
    expect(root).toHaveAttribute("data-interactive", "true");
    expect(root).toHaveAttribute("data-mode", "magnetic");
    expect(root).toHaveAttribute("data-speed", "normal");
    expect(root).toHaveAttribute("data-tone", "muted");
    expect(root).not.toHaveAttribute("data-reduced-motion");
  });

  it("reflects explicit variant props as data attributes", () => {
    const { container } = render(
      <MagneticBeamsBackground
        density="dense"
        intensity="bold"
        interactive={false}
        mode="follow"
        speed="fast"
        tone="primary"
      />,
    );
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-density", "dense");
    expect(root).toHaveAttribute("data-intensity", "bold");
    expect(root).toHaveAttribute("data-interactive", "false");
    expect(root).toHaveAttribute("data-mode", "follow");
    expect(root).toHaveAttribute("data-speed", "fast");
    expect(root).toHaveAttribute("data-tone", "primary");
  });

  it("renders one animated beam per geometry entry when animating", () => {
    const { container } = render(<MagneticBeamsBackground density="normal" />);

    const beams = container.querySelectorAll(
      '[data-slot="magnetic-beams-background-beam"]',
    );
    expect(beams).toHaveLength(5);
  });

  it("renders the static composition with animate={false}", () => {
    const { container } = render(<MagneticBeamsBackground animate={false} />);
    const root = getRoot(container);

    expect(root).toHaveAttribute("data-animate", "false");
    expect(root).toHaveAttribute("data-reduced-motion", "true");

    const beams = container.querySelectorAll(
      '[data-slot="magnetic-beams-background-beam"]',
    );
    expect(beams).toHaveLength(2);
  });

  it("renders identical markup for identical seeds and differing markup for different seeds", () => {
    const first = render(<MagneticBeamsBackground animate={false} seed={7} />);
    const second = render(<MagneticBeamsBackground animate={false} seed={7} />);
    const third = render(<MagneticBeamsBackground animate={false} seed={8} />);

    expect(first.container.innerHTML).toBe(second.container.innerHTML);
    expect(first.container.innerHTML).not.toBe(third.container.innerHTML);
  });

  it("handles pointer move and leave without crashing while animating", () => {
    const { container } = render(<MagneticBeamsBackground />);
    const root = getRoot(container);

    fireEvent.pointerMove(root, { clientX: 120, clientY: 80 });
    fireEvent.pointerMove(root, { clientX: 200, clientY: 40 });
    fireEvent.pointerLeave(root);

    expect(
      container.querySelectorAll(
        '[data-slot="magnetic-beams-background-beam"]',
      ),
    ).toHaveLength(5);
  });

  it("handles pointer move and leave without crashing in follow mode", () => {
    const { container } = render(<MagneticBeamsBackground mode="follow" />);
    const root = getRoot(container);

    fireEvent.pointerMove(root, { clientX: 120, clientY: 80 });
    fireEvent.pointerMove(root, { clientX: 200, clientY: 40 });
    fireEvent.pointerLeave(root);

    expect(
      container.querySelectorAll(
        '[data-slot="magnetic-beams-background-beam"]',
      ),
    ).toHaveLength(5);
  });

  it("handles pointer events with interactive={false} and animate={false}", () => {
    const { container } = render(
      <MagneticBeamsBackground animate={false} interactive={false} />,
    );
    const root = getRoot(container);

    fireEvent.pointerMove(root, { clientX: 120, clientY: 80 });
    fireEvent.pointerLeave(root);

    expect(root).toHaveAttribute("data-interactive", "false");
  });

  it("still calls user-supplied pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const { container } = render(
      <MagneticBeamsBackground
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
      />,
    );
    const root = getRoot(container);

    fireEvent.pointerMove(root, { clientX: 10, clientY: 10 });
    fireEvent.pointerLeave(root);

    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(onPointerLeave).toHaveBeenCalledTimes(1);
  });

  it("merges className last on the root", () => {
    const { container } = render(
      <MagneticBeamsBackground className="custom-root" />,
    );
    const root = getRoot(container);

    expect(root).toHaveClass("custom-root");
    expect(root).toHaveClass("relative");
  });

  it("forwards its ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<MagneticBeamsBackground ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute(
      "data-slot",
      "magnetic-beams-background",
    );
  });

  it("exposes classNames helpers that merge custom classes", () => {
    expect(magneticBeamsBackgroundClassNames({ className: "h-96" })).toContain(
      "h-96",
    );
    expect(magneticBeamsBackgroundClassNames({ className: "h-96" })).toContain(
      "relative",
    );
    expect(
      magneticBeamsBackgroundLayerClassNames({ tone: "primary" }),
    ).toContain("pointer-events-none");
    expect(magneticBeamsBackgroundContentClassNames()).toContain("z-10");
  });
});
