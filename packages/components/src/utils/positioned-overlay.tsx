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
  "data-slot"?: string;
  className?: string;
  shapeDataSlot?: string;
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
  "z-50 max-h-[min(var(--dt-overlay-max-height,18rem),calc(100dvh_-_var(--dt-space-4)))] min-w-[var(--dt-overlay-min-width,12rem)] overflow-auto rounded-md border border-border bg-background p-[var(--dt-space-3)] text-foreground shadow-lg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [--dt-popover-motion-x:0px] [--dt-popover-motion-y:var(--dt-space-1)] data-[placement=bottom]:[--dt-popover-motion-y:calc(0px_-_var(--dt-space-1))] data-[placement=top]:[--dt-popover-motion-y:var(--dt-space-1)] data-[placement=left]:[--dt-popover-motion-x:var(--dt-space-1)] data-[placement=left]:[--dt-popover-motion-y:0px] data-[placement=right]:[--dt-popover-motion-x:calc(0px_-_var(--dt-space-1))] data-[placement=right]:[--dt-popover-motion-y:0px] motion-safe:data-[entering]:animate-popover-in motion-safe:data-[exiting]:animate-popover-out motion-reduce:animate-none";

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
>(
  (
    {
      "data-slot": dataSlot = "positioned-overlay-arrow",
      className,
      shapeClassName,
      shapeDataSlot,
      ...props
    },
    ref,
  ) => (
    <AriaOverlayArrow
      {...props}
      ref={ref}
      data-slot={dataSlot}
      className={positionedOverlayArrowClassNames({ className })}
    >
      <span
        aria-hidden="true"
        data-slot={shapeDataSlot ?? `${dataSlot}-shape`}
        className={positionedOverlayArrowShapeClassNames({
          className: shapeClassName,
        })}
      />
    </AriaOverlayArrow>
  ),
);

PositionedOverlayArrow.displayName = "PositionedOverlayArrow";
