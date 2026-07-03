import {
  Focusable,
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipProps as AriaTooltipProps,
  type TooltipTriggerComponentProps as AriaTooltipTriggerProps,
} from "react-aria-components";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import {
  buttonClassNames,
  type ButtonSize,
  type ButtonVariant,
} from "../button";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
} from "../../utils/provider-portal";
import {
  PositionedOverlayArrow,
  type PositionedOverlayArrowProps,
  positionedOverlayArrowClassNames,
  positionedOverlayTooltipDefaults,
  positionedOverlaySurfaceClassNames,
  resolvePositionedOverlayPositionProps,
} from "../../utils/positioned-overlay";
import { cn } from "../../utils/cn";

export interface TooltipProps
  extends Omit<
    AriaTooltipTriggerProps,
    "children" | "isDisabled" | "isOpen" | "onOpenChange"
  > {
  "data-slot"?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export interface TooltipTriggerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "disabled" | "size"
  > {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export interface TooltipContentProps
  extends Omit<
    AriaTooltipProps,
    | "children"
    | "className"
    | "defaultOpen"
    | "isOpen"
    | "onOpenChange"
    | "UNSTABLE_portalContainer"
  > {
  arrowClassName?: string;
  arrowShapeClassName?: string;
  children?: ReactNode;
  className?: string;
  showArrow?: boolean;
}

export interface TooltipArrowProps extends PositionedOverlayArrowProps {}

const tooltipRootClasses = "contents";

const tooltipContentClasses =
  "min-w-0 max-w-[min(var(--dt-tooltip-max-width,18rem),calc(100vw_-_var(--dt-space-4)))] overflow-visible rounded-md border-border/40 bg-foreground px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-xs leading-5 text-background shadow-md";

const tooltipArrowShapeClasses = "border-border/40 bg-foreground";

export function tooltipClassNames({
  className,
}: Pick<TooltipProps, "className"> = {}) {
  return cn(tooltipRootClasses, className);
}

export function tooltipTriggerClassNames({
  className,
  size = "md",
  variant = "outline",
}: Pick<TooltipTriggerProps, "className" | "size" | "variant"> = {}) {
  return buttonClassNames({ className, size, variant });
}

export function tooltipContentClassNames({
  className,
}: Pick<TooltipContentProps, "className"> = {}) {
  return cn(
    positionedOverlaySurfaceClassNames(),
    tooltipContentClasses,
    className,
  );
}

export function tooltipArrowClassNames({
  className,
}: Pick<TooltipArrowProps, "className"> = {}) {
  return positionedOverlayArrowClassNames({ className });
}

export function tooltipArrowShapeClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(tooltipArrowShapeClasses, className);
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      "data-slot": dataSlot,
      children,
      className,
      disabled = false,
      onOpenChange,
      open,
      ...props
    },
    ref,
  ) => {
    const {
      portalContainer,
      rootRef,
    } = useProviderPortalRoot<HTMLDivElement>({
      forwardedRef: ref,
      portalSlot: "tooltip-portal-container",
    });

    return (
      <div
        ref={rootRef}
        data-slot={dataSlot ?? "tooltip"}
        data-open={open ? "" : undefined}
        className={tooltipClassNames({ className })}
      >
        <DethinkPortalProvider container={portalContainer}>
          <AriaTooltipTrigger
            {...props}
            isDisabled={disabled}
            isOpen={open}
            onOpenChange={onOpenChange}
          >
            {children}
          </AriaTooltipTrigger>
        </DethinkPortalProvider>
      </div>
    );
  },
);

Tooltip.displayName = "Tooltip";

export const TooltipTrigger = forwardRef<
  HTMLButtonElement,
  TooltipTriggerProps
>(
  (
    {
      children,
      className,
      disabled = false,
      size = "md",
      type = "button",
      variant = "outline",
      ...props
    },
    ref,
  ) => (
    <Focusable ref={ref} isDisabled={disabled}>
      <button
        {...props}
        type={type}
        data-disabled={disabled ? "true" : undefined}
        data-slot="tooltip-trigger"
        disabled={disabled}
        className={tooltipTriggerClassNames({ className, size, variant })}
      >
        {children}
      </button>
    </Focusable>
  ),
);

TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      arrowBoundaryOffset,
      arrowClassName,
      arrowShapeClassName,
      children,
      className,
      containerPadding,
      crossOffset,
      offset,
      placement,
      shouldFlip,
      showArrow = false,
      ...props
    },
    ref,
  ) => {
    const positionProps = resolvePositionedOverlayPositionProps(
      {
        arrowBoundaryOffset,
        containerPadding,
        crossOffset,
        offset,
        placement,
        shouldFlip,
      },
      positionedOverlayTooltipDefaults,
    );

    return (
      <AriaTooltip
        {...props}
        {...positionProps}
        ref={ref}
        data-slot="tooltip-content"
        className={tooltipContentClassNames({ className })}
      >
        {showArrow ? (
          <TooltipArrow
            className={arrowClassName}
            shapeClassName={arrowShapeClassName}
          />
        ) : null}
        {children}
      </AriaTooltip>
    );
  },
);

TooltipContent.displayName = "TooltipContent";

export const TooltipArrow = forwardRef<HTMLDivElement, TooltipArrowProps>(
  ({ className, shapeClassName, ...props }, ref) => (
    <PositionedOverlayArrow
      {...props}
      ref={ref}
      data-slot="tooltip-arrow"
      shapeDataSlot="tooltip-arrow-shape"
      className={tooltipArrowClassNames({ className })}
      shapeClassName={tooltipArrowShapeClassNames({
        className: shapeClassName,
      })}
    />
  ),
);

TooltipArrow.displayName = "TooltipArrow";
