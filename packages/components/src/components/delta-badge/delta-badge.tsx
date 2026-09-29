import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { badgeClassNames, type BadgeSize, type BadgeTone } from "../badge";
import { formatChartValue, isFiniteValue } from "../chart/chart-core";

export type DeltaDirection = "up" | "down" | "flat";
export type DeltaMeaning = "positive" | "negative" | "neutral";
export type DeltaBadgeVariant = "soft" | "outline" | "plain";
export type DeltaBadgeSize = Extract<BadgeSize, "xs" | "sm" | "md">;

export interface DeltaBadgeProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  /** Signed change. With the default formatter this is percentage points: 12.4 → "12.4%". */
  value: number | null | undefined;
  /** Which direction is good. Use "down" for churn, latency, cost or errors. */
  positiveDirection?: "up" | "down";
  /** Changes whose magnitude is at or below this read as flat and neutral. */
  neutralThreshold?: number;
  /** Formats the magnitude; the sign and direction are added for you. */
  formatValue?: (magnitude: number) => string;
  /** Comparison period for assistive technology, for example "vs last month". */
  comparison?: string;
  variant?: DeltaBadgeVariant;
  size?: DeltaBadgeSize;
}

export interface DeltaState {
  direction: DeltaDirection;
  meaning: DeltaMeaning;
}

/** Direction comes from the sign; meaning also depends on which way is good. */
export function getDeltaState(
  value: number | null | undefined,
  { positiveDirection = "up", neutralThreshold = 0 } = {},
): DeltaState {
  if (!isFiniteValue(value) || Math.abs(value) <= neutralThreshold) {
    return { direction: "flat", meaning: "neutral" };
  }

  const direction = value > 0 ? "up" : "down";
  return {
    direction,
    meaning: direction === positiveDirection ? "positive" : "negative",
  };
}

const defaultFormat = (magnitude: number) =>
  `${formatChartValue(magnitude, { maximumFractionDigits: 1 })}%`;

const meaningTone: Record<DeltaMeaning, BadgeTone> = {
  positive: "success",
  negative: "destructive",
  neutral: "neutral",
};

const iconToneClasses: Record<DeltaMeaning, string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

const plainClasses =
  "inline-flex max-w-full shrink-0 items-center gap-1 whitespace-nowrap font-medium leading-none text-foreground";

const plainSizeClasses: Record<DeltaBadgeSize, string> = {
  xs: "text-[0.6875rem]",
  sm: "text-xs",
  md: "text-sm",
};

const iconSizeClasses: Record<DeltaBadgeSize, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
};

const directionWords: Record<DeltaDirection, string> = {
  up: "Up",
  down: "Down",
  flat: "No change",
};

function DeltaIcon({
  direction,
  className,
}: {
  direction: DeltaDirection;
  className: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      {direction === "up" ? (
        <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
      ) : direction === "down" ? (
        <path d="M4.5 4.5 11.5 11.5M11.5 6v5.5H6" />
      ) : (
        <path d="M3.5 8h9" />
      )}
    </svg>
  );
}

/** Build the text a screen reader hears, for example "Up 12.4% vs last month". */
export function describeDelta(
  value: number | null | undefined,
  {
    comparison,
    formatValue = defaultFormat,
    neutralThreshold = 0,
  }: Pick<
    DeltaBadgeProps,
    "comparison" | "formatValue" | "neutralThreshold"
  > = {},
): string {
  const suffix = comparison ? ` ${comparison}` : "";
  if (!isFiniteValue(value)) return `No change data${suffix}`;

  const { direction } = getDeltaState(value, { neutralThreshold });
  if (direction === "flat") return `No change${suffix}`;
  return `${directionWords[direction]} ${formatValue(Math.abs(value))}${suffix}`;
}

export const DeltaBadge = forwardRef<HTMLSpanElement, DeltaBadgeProps>(
  (
    {
      className,
      comparison,
      formatValue = defaultFormat,
      neutralThreshold = 0,
      positiveDirection = "up",
      size = "sm",
      value,
      variant = "soft",
      ...props
    },
    ref,
  ) => {
    const { direction, meaning } = getDeltaState(value, {
      neutralThreshold,
      positiveDirection,
    });
    const sign = direction === "up" ? "+" : direction === "down" ? "−" : "";
    let visible: ReactNode = "—";
    if (isFiniteValue(value)) {
      visible = `${sign}${formatValue(direction === "flat" ? 0 : Math.abs(value))}`;
    }

    return (
      <span
        {...props}
        ref={ref}
        data-slot="delta-badge"
        data-direction={direction}
        data-meaning={meaning}
        data-variant={variant}
        className={
          variant === "plain"
            ? cn(plainClasses, plainSizeClasses[size], className)
            : badgeClassNames({
                className: cn("tabular-nums", className),
                size,
                tone: meaningTone[meaning],
                variant,
              })
        }
      >
        {isFiniteValue(value) ? (
          <DeltaIcon
            direction={direction}
            className={cn(iconSizeClasses[size], iconToneClasses[meaning])}
          />
        ) : null}
        {/* Signed numbers stay left-to-right inside right-to-left text. */}
        <span aria-hidden="true" dir="ltr" className="tabular-nums">
          {visible}
        </span>
        <span className="sr-only">
          {describeDelta(value, { comparison, formatValue, neutralThreshold })}
        </span>
      </span>
    );
  },
);

DeltaBadge.displayName = "DeltaBadge";
