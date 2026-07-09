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

export interface PositionedOverlayArrowProps extends Omit<
  AriaOverlayArrowProps,
  "children" | "className"
> {
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
  offset: 8,
  placement: "top",
} satisfies Required<PositionedOverlayPositionProps>;

export const positionedOverlayDropdownMenuDefaults = {
  ...positionedOverlayPositionDefaults,
  offset: 8,
  placement: "bottom start",
} satisfies Required<PositionedOverlayPositionProps>;

export const positionedOverlayDropdownSubmenuDefaults = {
  ...positionedOverlayPositionDefaults,
  crossOffset: -4,
  offset: -2,
  placement: "right top",
} satisfies Required<PositionedOverlayPositionProps>;

const positionedOverlaySurfaceBaseClasses =
  "z-50 max-h-[min(var(--dt-overlay-max-height,18rem),calc(100dvh_-_var(--dt-space-4)))] min-w-[var(--dt-overlay-min-width,12rem)] overflow-auto rounded-md border border-border bg-background p-[var(--dt-space-3)] text-foreground shadow-lg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [--dt-overlay-motion-x:0px] [--dt-overlay-motion-y:var(--dt-space-1)] data-[placement=bottom]:[--dt-overlay-motion-y:calc(0px_-_var(--dt-space-1))] data-[placement=top]:[--dt-overlay-motion-y:var(--dt-space-1)] data-[placement=left]:[--dt-overlay-motion-x:var(--dt-space-1)] data-[placement=left]:[--dt-overlay-motion-y:0px] data-[placement=right]:[--dt-overlay-motion-x:calc(0px_-_var(--dt-space-1))] data-[placement=right]:[--dt-overlay-motion-y:0px] origin-center data-[placement=top]:origin-bottom data-[placement=bottom]:origin-top data-[placement=left]:origin-right data-[placement=right]:origin-left motion-safe:data-[entering]:animate-overlay-in motion-safe:data-[exiting]:animate-overlay-out motion-reduce:animate-none";

const positionedOverlayArrowBaseClasses =
  "group z-50 flex size-3 items-center justify-center text-background [filter:drop-shadow(0_1px_0.5px_rgb(0_0_0_/_0.06))]";

const positionedOverlayArrowShapeBaseClasses =
  "block size-3 fill-background stroke-border group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90 [stroke-linejoin:round] [stroke-width:1px]";

export function resolvePositionedOverlayPositionProps(
  props: PositionedOverlayPositionProps = {},
  defaults: Required<PositionedOverlayPositionProps> = positionedOverlayPositionDefaults,
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
      <svg
        aria-hidden="true"
        data-slot={shapeDataSlot ?? `${dataSlot}-shape`}
        focusable="false"
        viewBox="0 0 12 12"
        className={positionedOverlayArrowShapeClassNames({
          className: shapeClassName,
        })}
      >
        <path d="M0 0 L6 12 L12 0" />
      </svg>
    </AriaOverlayArrow>
  ),
);

PositionedOverlayArrow.displayName = "PositionedOverlayArrow";
