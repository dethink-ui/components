import { forwardRef } from "react";
import {
  OverlayArrow as AriaOverlayArrow,
  type OverlayArrowProps as AriaOverlayArrowProps,
} from "react-aria-components";
import type { Placement } from "react-aria/useOverlayPosition";
import { cn } from "./cn";

export type PositionedOverlayPlacement = Placement;

export interface PositionedOverlayPositionProps {
  arrowBoundaryOffset?: number;
  containerPadding?: number;
  crossOffset?: number;
  offset?: number;
  placement?: PositionedOverlayPlacement;
  shouldFlip?: boolean;
}

export interface PositionedOverlaySurfaceClassNameOptions {
  className?: string;
}

export interface PositionedOverlayArrowClassNameOptions {
  className?: string;
}

export interface PositionedOverlayArrowProps
  extends Omit<AriaOverlayArrowProps, "children" | "className"> {
  className?: string;
  shapeClassName?: string;
}

export const positionedOverlayPositionDefaults = {
  arrowBoundaryOffset: 0,
  containerPadding: 12,
  crossOffset: 0,
  offset: 0,
  placement: "bottom",
  shouldFlip: true,
} satisfies Required<PositionedOverlayPositionProps>;

export const positionedOverlayPopoverDefaults = {
  ...positionedOverlayPositionDefaults,
  offset: 8,
} satisfies Required<PositionedOverlayPositionProps>;

export const positionedOverlayTooltipDefaults = {
  ...positionedOverlayPositionDefaults,
  placement: "top",
} satisfies Required<PositionedOverlayPositionProps>;

const positionedOverlaySurfaceBaseClasses =
  "z-50 max-h-[min(var(--dt-overlay-max-height,18rem),calc(100dvh_-_var(--dt-space-4)))] min-w-[var(--dt-overlay-min-width,12rem)] overflow-auto rounded-md border border-border bg-background p-[var(--dt-space-3)] text-foreground shadow-lg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:transition-[opacity,transform] motion-safe:duration-150 data-[entering]:opacity-100 data-[exiting]:translate-y-1 data-[exiting]:opacity-0";

const positionedOverlayArrowBaseClasses =
  "z-50 flex size-3 items-center justify-center text-background drop-shadow-sm data-[placement=bottom]:rotate-180 data-[placement=left]:rotate-90 data-[placement=right]:-rotate-90";

const positionedOverlayArrowShapeBaseClasses =
  "block size-2 rotate-45 border border-border bg-background";

export function resolvePositionedOverlayPositionProps(
  props: PositionedOverlayPositionProps = {},
  defaults: Required<PositionedOverlayPositionProps> =
    positionedOverlayPositionDefaults,
): Required<PositionedOverlayPositionProps> {
  return {
    arrowBoundaryOffset:
      props.arrowBoundaryOffset ?? defaults.arrowBoundaryOffset,
    containerPadding: props.containerPadding ?? defaults.containerPadding,
    crossOffset: props.crossOffset ?? defaults.crossOffset,
    offset: props.offset ?? defaults.offset,
    placement: props.placement ?? defaults.placement,
    shouldFlip: props.shouldFlip ?? defaults.shouldFlip,
  };
}

export function positionedOverlaySurfaceClassNames({
  className,
}: PositionedOverlaySurfaceClassNameOptions = {}) {
  return cn(positionedOverlaySurfaceBaseClasses, className);
}

export function positionedOverlayArrowClassNames({
  className,
}: PositionedOverlayArrowClassNameOptions = {}) {
  return cn(positionedOverlayArrowBaseClasses, className);
}

export function positionedOverlayArrowShapeClassNames({
  className,
}: PositionedOverlayArrowClassNameOptions = {}) {
  return cn(positionedOverlayArrowShapeBaseClasses, className);
}

export const PositionedOverlayArrow = forwardRef<
  HTMLDivElement,
  PositionedOverlayArrowProps
>(({ className, shapeClassName, ...props }, ref) => (
  <AriaOverlayArrow
    {...props}
    ref={ref}
    data-slot="positioned-overlay-arrow"
    className={positionedOverlayArrowClassNames({ className })}
  >
    <span
      aria-hidden="true"
      data-slot="positioned-overlay-arrow-shape"
      className={positionedOverlayArrowShapeClassNames({
        className: shapeClassName,
      })}
    />
  </AriaOverlayArrow>
));

PositionedOverlayArrow.displayName = "PositionedOverlayArrow";
