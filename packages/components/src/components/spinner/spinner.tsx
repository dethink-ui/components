import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerTone =
  | "current"
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info";
export type SpinnerVariant = "ring" | "dots";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  variant?: SpinnerVariant;
  label?: string;
}

const spinnerBaseClasses =
  "inline-flex shrink-0 items-center justify-center align-[-0.125em]";

const spinnerSizeClasses: Record<SpinnerSize, string> = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
};

const spinnerToneClasses: Record<SpinnerTone, string> = {
  current: "text-current",
  muted: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

const spinnerRingClasses =
  "size-full rounded-full border-2 border-current border-e-transparent animate-spin motion-reduce:animate-none motion-reduce:opacity-65";

const spinnerDotsClasses =
  "grid grid-cols-3 gap-1";

const spinnerDotClasses =
  "size-1.5 rounded-full bg-current animate-pulse motion-reduce:animate-none motion-reduce:opacity-70";

export function spinnerClassNames({
  className,
  size = "md",
  tone = "current",
}: Pick<SpinnerProps, "className" | "size" | "tone"> = {}) {
  return cn(spinnerBaseClasses, spinnerSizeClasses[size], spinnerToneClasses[tone], className);
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    {
      "aria-label": ariaLabel,
      className,
      label,
      size = "md",
      tone = "current",
      variant = "ring",
      ...props
    },
    ref,
  ) => {
    const accessibleLabel = label ?? ariaLabel;

    return (
      <span
        {...props}
        ref={ref}
        aria-hidden={accessibleLabel ? undefined : true}
        aria-label={accessibleLabel}
        role={accessibleLabel ? "status" : undefined}
        data-slot="spinner"
        data-size={size}
        data-tone={tone}
        data-variant={variant}
        className={spinnerClassNames({ className, size, tone })}
      >
        {variant === "dots" ? (
          <span aria-hidden="true" className={spinnerDotsClasses}>
            <span className={spinnerDotClasses} />
            <span className={cn(spinnerDotClasses, "[animation-delay:120ms]")} />
            <span className={cn(spinnerDotClasses, "[animation-delay:240ms]")} />
          </span>
        ) : (
          <span aria-hidden="true" className={spinnerRingClasses} />
        )}
      </span>
    );
  },
);

Spinner.displayName = "Spinner";
