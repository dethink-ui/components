import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { ButtonVariant } from "../button";
import { cn } from "../../utils/cn";

export type IconButtonVariant = Exclude<ButtonVariant, "link">;
export type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type IconButtonShape = "square" | "circle";

export type IconButtonAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "aria-labelledby"
> &
  IconButtonAccessibleName & {
    variant?: IconButtonVariant;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    loading?: boolean;
    children: ReactNode;
  };

const iconButtonBaseClasses =
  "inline-flex shrink-0 items-center justify-center border border-transparent font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[loading=true]:cursor-wait data-[loading=true]:opacity-80";

const iconButtonVariantClasses: Record<IconButtonVariant, string> = {
  solid:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  soft: "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
  outline:
    "border-border bg-background text-foreground hover:bg-muted active:bg-muted/80",
  ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted/80",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
};

const iconButtonSizeClasses: Record<IconButtonSize, string> = {
  xs: "size-7 text-xs",
  sm: "size-8 text-sm",
  md: "size-density-control text-sm",
  lg: "size-11 text-base",
  xl: "size-12 text-base",
};

const iconButtonIconSizeClasses: Record<IconButtonSize, string> = {
  xs: "size-3.5 [&>svg]:size-3.5",
  sm: "size-4 [&>svg]:size-4",
  md: "size-4 [&>svg]:size-4",
  lg: "size-5 [&>svg]:size-5",
  xl: "size-5 [&>svg]:size-5",
};

const iconButtonShapeClasses: Record<IconButtonShape, string> = {
  square: "rounded-md",
  circle: "rounded-full",
};

const iconButtonIconClasses =
  "pointer-events-none inline-flex shrink-0 items-center justify-center";

const iconButtonSpinnerClasses =
  "pointer-events-none shrink-0 rounded-full border-2 border-current border-r-transparent animate-spin motion-reduce:animate-none";

export function iconButtonClassNames({
  variant = "ghost",
  size = "md",
  shape = "square",
  className,
}: Pick<IconButtonProps, "variant" | "size" | "shape" | "className"> = {}) {
  return cn(
    iconButtonBaseClasses,
    iconButtonSizeClasses[size],
    iconButtonShapeClasses[shape],
    iconButtonVariantClasses[variant],
    className,
  );
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      "aria-busy": ariaBusy,
      children,
      className,
      disabled = false,
      loading = false,
      onClick,
      shape = "square",
      size = "md",
      type = "button",
      variant = "ghost",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    };

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading ? true : ariaBusy}
        data-slot="icon-button"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-disabled={isDisabled ? "true" : undefined}
        data-loading={loading ? "true" : undefined}
        className={iconButtonClassNames({ variant, size, shape, className })}
        onClick={handleClick}
      >
        {loading ? (
          <span
            aria-hidden="true"
            data-slot="icon-button-spinner"
            className={cn(
              iconButtonSpinnerClasses,
              iconButtonIconSizeClasses[size],
            )}
          />
        ) : (
          <span
            aria-hidden="true"
            data-slot="icon-button-icon"
            className={cn(
              iconButtonIconClasses,
              iconButtonIconSizeClasses[size],
            )}
          >
            {children}
          </span>
        )}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
