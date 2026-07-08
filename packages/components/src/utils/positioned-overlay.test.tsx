import { createRef } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  PositionedOverlayArrow,
  positionedOverlayArrowClassNames,
  positionedOverlayArrowShapeClassNames,
  positionedOverlayDropdownMenuDefaults,
  positionedOverlayDropdownSubmenuDefaults,
  positionedOverlayPopoverDefaults,
  positionedOverlayPositionDefaults,
  positionedOverlaySurfaceClassNames,
  positionedOverlayTooltipDefaults,
  resolvePositionedOverlayPositionProps,
} from "./positioned-overlay";

describe("positioned overlay utilities", () => {
  it("captures the shared React Aria positioning defaults", () => {
    expect(positionedOverlayPositionDefaults).toEqual({
      arrowBoundaryOffset: 0,
      containerPadding: 12,
      crossOffset: 0,
      offset: 0,
      placement: "bottom",
      shouldFlip: true,
    });
    expect(positionedOverlayPopoverDefaults).toEqual({
      ...positionedOverlayPositionDefaults,
      offset: 8,
    });
    expect(positionedOverlayTooltipDefaults).toEqual({
      ...positionedOverlayPositionDefaults,
      offset: 8,
      placement: "top",
    });
    expect(positionedOverlayDropdownMenuDefaults).toEqual({
      ...positionedOverlayPositionDefaults,
      offset: 8,
      placement: "bottom start",
    });
    expect(positionedOverlayDropdownSubmenuDefaults).toEqual({
      ...positionedOverlayPositionDefaults,
      crossOffset: -4,
      offset: -2,
      placement: "right top",
    });
  });

  it("resolves partial positioning props against a chosen default set", () => {
    expect(
      resolvePositionedOverlayPositionProps({
        crossOffset: 4,
        placement: "bottom start",
        shouldFlip: false,
      }),
    ).toEqual({
      arrowBoundaryOffset: 0,
      containerPadding: 12,
      crossOffset: 4,
      offset: 0,
      placement: "bottom start",
      shouldFlip: false,
    });

    expect(
      resolvePositionedOverlayPositionProps(
        { offset: 12 },
        positionedOverlayPopoverDefaults,
      ),
    ).toEqual({
      ...positionedOverlayPopoverDefaults,
      offset: 12,
    });
  });

  it("composes tokenized surface and arrow classes", () => {
    expect(positionedOverlaySurfaceClassNames()).toContain("bg-background");
    expect(positionedOverlaySurfaceClassNames()).toContain("text-foreground");
    expect(positionedOverlaySurfaceClassNames()).toContain("border-border");
    expect(positionedOverlaySurfaceClassNames()).toContain("rounded-md");
    expect(positionedOverlaySurfaceClassNames()).toContain(
      "max-h-[min(var(--dt-overlay-max-height,18rem),calc(100dvh_-_var(--dt-space-4)))]",
    );
    expect(positionedOverlaySurfaceClassNames()).toContain(
      "focus-visible:outline-ring",
    );
    expect(positionedOverlaySurfaceClassNames()).toContain(
      "focus-visible:outline-offset-2",
    );
    expect(positionedOverlaySurfaceClassNames()).toContain(
      "motion-safe:data-[entering]:animate-overlay-in",
    );
    expect(positionedOverlaySurfaceClassNames()).toContain(
      "motion-safe:data-[exiting]:animate-overlay-out",
    );
    expect(positionedOverlaySurfaceClassNames()).toContain(
      "motion-reduce:animate-none",
    );
    expect(positionedOverlaySurfaceClassNames()).toContain(
      "[--dt-overlay-motion-y:var(--dt-space-1)]",
    );
    expect(positionedOverlaySurfaceClassNames()).toContain(
      "data-[placement=bottom]:[--dt-overlay-motion-y:calc(0px_-_var(--dt-space-1))]",
    );
    expect(
      positionedOverlaySurfaceClassNames({ className: "custom-surface" }),
    ).toContain("custom-surface");

    expect(positionedOverlayArrowClassNames()).toContain("group");
    expect(positionedOverlayArrowShapeClassNames()).toContain(
      "fill-background",
    );
    expect(positionedOverlayArrowShapeClassNames()).toContain("stroke-border");
    expect(positionedOverlayArrowShapeClassNames()).toContain(
      "group-data-[placement=bottom]:rotate-180",
    );
    expect(positionedOverlayArrowShapeClassNames()).toContain(
      "group-data-[placement=right]:rotate-90",
    );
    expect(positionedOverlayArrowShapeClassNames()).toContain(
      "group-data-[placement=left]:-rotate-90",
    );
    expect(
      positionedOverlayArrowShapeClassNames({ className: "custom-shape" }),
    ).toContain("custom-shape");
  });

  it("renders a stable arrow slot and forwards refs", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <PositionedOverlayArrow
        ref={ref}
        className="custom-arrow"
        shapeClassName="custom-shape"
      />,
    );
    const arrow = container.querySelector<HTMLElement>(
      '[data-slot="positioned-overlay-arrow"]',
    );
    const shape = container.querySelector<HTMLElement>(
      '[data-slot="positioned-overlay-arrow-shape"]',
    );

    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveClass("custom-arrow");
    expect(ref.current).toBe(arrow);
    expect(shape).toBeInTheDocument();
    expect(shape).toHaveAttribute("aria-hidden", "true");
    expect(shape).toHaveAttribute("focusable", "false");
    expect(shape?.tagName.toLowerCase()).toBe("svg");
    expect(shape).toHaveClass("custom-shape");
    expect(shape?.querySelector("path")).toHaveAttribute(
      "d",
      "M0 0 L6 12 L12 0",
    );
  });
});
