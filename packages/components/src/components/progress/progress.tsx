import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressTone =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "muted";

export interface ProgressValueOptions {
  value?: number | null;
  min?: number;
  max?: number;
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement>, ProgressValueOptions {
  tone?: ProgressTone;
  size?: ProgressSize;
  indeterminate?: boolean;
  label?: ReactNode;
  status?: ReactNode;
  showValue?: boolean;
  formatValue?: (value: number, options: Required<Pick<ProgressValueOptions, "min" | "max">>) => ReactNode;
  trackClassName?: string;
  indicatorClassName?: string;
}

export interface ProgressCircleProps
  extends Omit<ProgressProps, "trackClassName" | "indicatorClassName"> {
  thickness?: number;
}

const progressRootClasses = "grid min-w-0 gap-[var(--dt-space-2)] text-sm";
const progressHeaderClasses =
  "flex min-w-0 items-center justify-between gap-[var(--dt-space-3)]";
const progressLabelClasses = "min-w-0 font-medium text-foreground";
const progressMetaClasses = "shrink-0 text-muted-foreground";

const progressTrackBaseClasses =
  "relative overflow-hidden rounded-full bg-muted";

const progressSizeClasses: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const progressToneClasses: Record<ProgressTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  muted: "bg-muted-foreground",
};

const progressIndicatorClasses =
  "h-full rounded-full motion-safe:transition-[width,transform] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none";

const progressIndeterminateClasses =
  "absolute inset-y-0 w-1/2 animate-[dt-progress-indeterminate_1.15s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:w-full motion-reduce:opacity-60";

const progressCircleSizeClasses: Record<ProgressSize, string> = {
  sm: "size-10",
  md: "size-14",
  lg: "size-20",
};

export function clampProgressValue({
  max = 100,
  min = 0,
  value,
}: ProgressValueOptions) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return undefined;
  }

  if (max <= min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function getProgressPercent({
  max = 100,
  min = 0,
  value,
}: ProgressValueOptions) {
  const clamped = clampProgressValue({ max, min, value });

  if (clamped === undefined || max <= min) {
    return undefined;
  }

  return ((clamped - min) / (max - min)) * 100;
}

export function progressClassNames({
  className,
}: Pick<ProgressProps, "className"> = {}) {
  return cn(progressRootClasses, className);
}

export function progressTrackClassNames({
  className,
  size = "md",
}: Pick<ProgressProps, "size"> & { className?: string } = {}) {
  return cn(progressTrackBaseClasses, progressSizeClasses[size], className);
}

export function progressIndicatorClassNames({
  className,
  indeterminate,
  tone = "primary",
}: Pick<ProgressProps, "indeterminate" | "tone"> & { className?: string } = {}) {
  return cn(
    progressIndicatorClasses,
    progressToneClasses[tone],
    indeterminate ? progressIndeterminateClasses : undefined,
    className,
  );
}

function defaultFormatValue(
  value: number,
  { max, min }: Required<Pick<ProgressValueOptions, "min" | "max">>,
) {
  if (max <= min) {
    return `${value}`;
  }

  return `${Math.round(((value - min) / (max - min)) * 100)}%`;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      className,
      formatValue = defaultFormatValue,
      indicatorClassName,
      indeterminate = false,
      label,
      max = 100,
      min = 0,
      showValue = false,
      size = "md",
      status,
      tone = "primary",
      trackClassName,
      value,
      ...props
    },
    ref,
  ) => {
    const clamped = clampProgressValue({ max, min, value });
    const percent = getProgressPercent({ max, min, value });
    const hasValue = !indeterminate && clamped !== undefined;
    const valueLabel = hasValue ? formatValue(clamped, { max, min }) : undefined;
    const accessibleLabel = ariaLabel ?? (typeof label === "string" ? label : undefined) ?? "Progress";

    return (
      <div
        {...props}
        ref={ref}
        aria-label={ariaLabelledBy ? ariaLabel : accessibleLabel}
        aria-labelledby={ariaLabelledBy}
        aria-valuemax={hasValue ? max : undefined}
        aria-valuemin={hasValue ? min : undefined}
        aria-valuenow={hasValue ? clamped : undefined}
        aria-valuetext={hasValue && typeof valueLabel === "string" ? valueLabel : undefined}
        role="progressbar"
        data-slot="progress"
        data-state={indeterminate ? "indeterminate" : "determinate"}
        data-size={size}
        data-tone={tone}
        className={progressClassNames({ className })}
      >
        {label || status || showValue ? (
          <div data-slot="progress-header" className={progressHeaderClasses}>
            {label ? (
              <span data-slot="progress-label" className={progressLabelClasses}>
                {label}
              </span>
            ) : null}
            {showValue || status ? (
              <span data-slot="progress-meta" className={progressMetaClasses}>
                {status ?? valueLabel}
              </span>
            ) : null}
          </div>
        ) : null}
        <div
          aria-hidden="true"
          data-slot="progress-track"
          className={progressTrackClassNames({ className: trackClassName, size })}
        >
          <div
            data-slot="progress-indicator"
            className={progressIndicatorClassNames({
              className: indicatorClassName,
              indeterminate,
              tone,
            })}
            style={indeterminate ? undefined : { width: `${percent ?? 0}%` }}
          />
        </div>
      </div>
    );
  },
);

Progress.displayName = "Progress";

export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      className,
      formatValue = defaultFormatValue,
      indeterminate = false,
      label,
      max = 100,
      min = 0,
      showValue = false,
      size = "md",
      status,
      thickness = 8,
      tone = "primary",
      value,
      ...props
    },
    ref,
  ) => {
    const clamped = clampProgressValue({ max, min, value });
    const percent = getProgressPercent({ max, min, value }) ?? 0;
    const hasValue = !indeterminate && clamped !== undefined;
    const valueLabel = hasValue ? formatValue(clamped, { max, min }) : undefined;
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (percent / 100) * circumference;
    const accessibleLabel = ariaLabel ?? (typeof label === "string" ? label : undefined) ?? "Progress";

    return (
      <div
        {...props}
        ref={ref}
        aria-label={ariaLabelledBy ? ariaLabel : accessibleLabel}
        aria-labelledby={ariaLabelledBy}
        aria-valuemax={hasValue ? max : undefined}
        aria-valuemin={hasValue ? min : undefined}
        aria-valuenow={hasValue ? clamped : undefined}
        aria-valuetext={hasValue && typeof valueLabel === "string" ? valueLabel : undefined}
        role="progressbar"
        data-slot="progress-circle"
        data-state={indeterminate ? "indeterminate" : "determinate"}
        data-size={size}
        data-tone={tone}
        className={cn("inline-grid shrink-0 place-items-center gap-[var(--dt-space-2)] text-sm", className)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className={cn(
            progressCircleSizeClasses[size],
            indeterminate ? "animate-spin motion-reduce:animate-none" : undefined,
          )}
        >
          <circle
            cx="50"
            cy="50"
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={indeterminate ? circumference * 0.35 : dashOffset}
            strokeLinecap="round"
            strokeWidth={thickness}
            className={cn(
              "origin-center -rotate-90 motion-safe:transition-[stroke-dashoffset] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none",
              progressToneClasses[tone].replace("bg-", "text-"),
            )}
          />
        </svg>
        {label || status || showValue ? (
          <span data-slot="progress-circle-label" className="text-center text-muted-foreground">
            {status ?? (showValue ? valueLabel : label)}
          </span>
        ) : null}
      </div>
    );
  },
);

ProgressCircle.displayName = "ProgressCircle";
