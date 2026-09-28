import {
  createElement,
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { useChartSize } from "../chart/use-chart-size";
import {
  formatChartValue,
  isFiniteValue,
  type ChartColor,
  type ChartValue,
  type FormatChartValueOptions,
} from "../chart/chart-core";
import { DeltaBadge, type DeltaBadgeProps } from "../delta-badge";
import { Skeleton } from "../skeleton";
import { Sparkline, type SparklineVariant } from "../sparkline";

export type StatTileSize = "sm" | "md" | "lg";
export type StatTileTrendPlacement = "bottom" | "end";

export interface StatTileProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** Sentence-case metric name, without a trailing colon. */
  label: ReactNode;
  /** Numbers are formatted compactly; strings render as given; null shows a dash. */
  value: number | string | null | undefined;
  formatValue?: (value: number) => string;
  /** Options for the default compact formatter, such as currency or percent. */
  formatOptions?: FormatChartValueOptions;
  /** A signed change, full DeltaBadge props, or null when the change is unknown. */
  delta?: number | null | Omit<DeltaBadgeProps, "size">;
  /** Comparison period shown beside the delta, for example "vs last month". */
  comparison?: string;
  /** Recent values drawn as a sparkline under (or beside) the value. */
  trend?: readonly ChartValue[];
  trendColor?: ChartColor;
  trendVariant?: SparklineVariant;
  trendPlacement?: StatTileTrendPlacement;
  /** Accessible name for the trend. Defaults to the label when it is a string. */
  trendLabel?: string;
  /** Small leading icon or visual beside the label. */
  icon?: ReactNode;
  /** Secondary text under the value, such as a target or data freshness. */
  caption?: ReactNode;
  /** Render the layout with skeletons while data loads. */
  loading?: boolean;
  /** Render the tile as a link. */
  href?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  /** Hover and focus treatment for tiles wrapped in your own link or button. */
  interactive?: boolean;
  size?: StatTileSize;
}

const rootClasses =
  "group/stat-tile relative flex min-w-0 flex-col gap-[var(--dt-space-3)] rounded-xl border border-border bg-background p-[var(--dt-space-5)] text-foreground outline-hidden [--dt-chart-surface:var(--dt-color-background)] " +
  // Inside a joined KpiGroup the group owns the frame. Each tile draws a
  // hairline on its start and top edges and is pulled 1px under the frame, so
  // outer edges clip away and only the dividers between tiles remain.
  "group-data-[variant=joined]/kpi:-ms-px group-data-[variant=joined]/kpi:-mt-px group-data-[variant=joined]/kpi:rounded-none group-data-[variant=joined]/kpi:border-0 group-data-[variant=joined]/kpi:shadow-[inset_1px_1px_0_var(--dt-color-border)] rtl:group-data-[variant=joined]/kpi:shadow-[inset_-1px_1px_0_var(--dt-color-border)]";

const interactiveClasses =
  "cursor-pointer motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-200 hover:border-foreground/25 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring group-data-[variant=joined]/kpi:focus-visible:-outline-offset-2";

const valueSizeClasses: Record<StatTileSize, string> = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
};

const trendSizeClasses: Record<StatTileSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
};

function formatTileValue(
  value: StatTileProps["value"],
  formatValue: StatTileProps["formatValue"],
  formatOptions: StatTileProps["formatOptions"],
) {
  if (typeof value === "string") return value;
  if (!isFiniteValue(value)) return "—";
  return formatValue
    ? formatValue(value)
    : formatChartValue(value, formatOptions);
}

export const StatTile = forwardRef<HTMLElement, StatTileProps>(
  (
    {
      caption,
      className,
      comparison,
      delta,
      formatOptions,
      formatValue,
      href,
      icon,
      interactive,
      label,
      loading = false,
      rel,
      size = "md",
      target,
      trend,
      trendColor = "chart-1",
      trendLabel,
      trendPlacement = "bottom",
      trendVariant = "area",
      value,
      ...props
    },
    ref,
  ) => {
    const labelId = useId();
    const isLink = href !== undefined;
    const deltaProps =
      delta === undefined
        ? undefined
        : typeof delta === "number" || delta === null
          ? { value: delta }
          : delta;
    const hasTrend = trend !== undefined && trend.length > 0;
    const resolvedTrendLabel =
      trendLabel ?? (typeof label === "string" ? `${label} trend` : "Trend");

    const trendNode = hasTrend ? (
      loading ? (
        <Skeleton
          radius="sm"
          className={cn(
            trendSizeClasses[size],
            trendPlacement === "end" ? "w-24" : "w-full",
          )}
        />
      ) : (
        <Sparkline
          data={trend}
          color={trendColor}
          variant={trendVariant}
          label={resolvedTrendLabel}
          className={cn(
            trendSizeClasses[size],
            trendPlacement === "end" ? "w-24 shrink-0 sm:w-28" : "w-full",
          )}
        />
      )
    ) : null;

    const valueNode = loading ? (
      <Skeleton
        radius="sm"
        className={cn("h-[1em] w-28", valueSizeClasses[size])}
      />
    ) : (
      <span
        data-slot="stat-tile-value"
        // Formatted numbers read left-to-right; free text follows its script.
        dir={typeof value === "string" ? "auto" : "ltr"}
        className={cn(
          "max-w-full min-w-0 justify-self-start truncate font-semibold tracking-tight [font-variant-numeric:proportional-nums]",
          valueSizeClasses[size],
        )}
      >
        {formatTileValue(value, formatValue, formatOptions)}
      </span>
    );

    const deltaRow =
      deltaProps || comparison ? (
        <div
          data-slot="stat-tile-delta"
          className="flex min-w-0 flex-wrap items-center gap-x-[var(--dt-space-2)] gap-y-1"
        >
          {loading ? (
            <Skeleton radius="full" className="h-5 w-24" />
          ) : (
            <>
              {deltaProps ? (
                <DeltaBadge
                  comparison={comparison}
                  {...deltaProps}
                  size={size === "lg" ? "md" : "sm"}
                />
              ) : null}
              {comparison ? (
                <span
                  aria-hidden={deltaProps ? true : undefined}
                  className="text-muted-foreground truncate text-xs"
                >
                  {comparison}
                </span>
              ) : null}
            </>
          )}
        </div>
      ) : null;

    return createElement(
      isLink ? "a" : "div",
      {
        ...props,
        ref,
        href,
        target,
        rel: rel ?? (target === "_blank" ? "noopener noreferrer" : undefined),
        role: isLink ? undefined : "group",
        "aria-labelledby": isLink ? undefined : labelId,
        "aria-busy": loading || undefined,
        "data-slot": "stat-tile",
        "data-size": size,
        "data-loading": loading || undefined,
        "data-interactive": isLink || interactive || undefined,
        className: cn(
          rootClasses,
          (isLink || interactive) && interactiveClasses,
          className,
        ),
      },
      <div className="flex min-w-0 items-center gap-[var(--dt-space-2)]">
        {icon ? (
          <span
            aria-hidden="true"
            className="text-muted-foreground inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4"
          >
            {icon}
          </span>
        ) : null}
        <span
          id={labelId}
          data-slot="stat-tile-label"
          className="text-muted-foreground min-w-0 truncate text-sm font-medium"
        >
          {label}
        </span>
      </div>,
      trendPlacement === "end" ? (
        <div className="flex min-w-0 items-end justify-between gap-[var(--dt-space-4)]">
          <div className="grid min-w-0 gap-[var(--dt-space-2)]">
            {valueNode}
            {deltaRow}
          </div>
          {trendNode}
        </div>
      ) : (
        <div className="grid min-w-0 gap-[var(--dt-space-2)]">
          {valueNode}
          {deltaRow}
        </div>
      ),
      caption ? (
        <p
          data-slot="stat-tile-caption"
          className="text-muted-foreground text-xs leading-relaxed"
        >
          {caption}
        </p>
      ) : null,
      trendPlacement === "bottom" && trendNode ? (
        <div className="mt-auto pt-[var(--dt-space-1)]">{trendNode}</div>
      ) : null,
    );
  },
);

StatTile.displayName = "StatTile";

export type KpiGroupVariant = "separate" | "joined";

export interface KpiGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** "joined" frames the tiles as one panel with hairline dividers. */
  variant?: KpiGroupVariant;
  /** Narrowest a tile may get before the row wraps, in px or rem. */
  minTileWidth?: string;
  /**
   * Even out wrapped rows: four tiles that fit three-across become 2 × 2
   * instead of 3 + 1. Falls back to plain auto-fit wrapping when off.
   */
  balanced?: boolean;
}

/**
 * The fewest columns that still need the same number of rows, so wrapped rows
 * stay as even as possible (4 tiles fitting 3-across → 2 columns).
 */
export function balancedColumns(count: number, fit: number) {
  if (count <= 0) return 1;
  const columns = Math.max(1, Math.min(Math.floor(fit), count));
  const rows = Math.ceil(count / columns);
  return Math.ceil(count / rows);
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function lengthToPixels(length: string, element: HTMLElement) {
  // Separate integer-led and leading-dot forms so digit runs cannot overlap.
  const match = /^(\d+(?:\.\d+)?|\.\d+)(px|rem)$/.exec(length.trim());
  if (!match) return undefined;
  const value = Number(match[1]);
  if (match[2] === "px") return value;
  const rootSize = parseFloat(
    getComputedStyle(element.ownerDocument.documentElement).fontSize,
  );
  return value * (Number.isFinite(rootSize) ? rootSize : 16);
}

export const KpiGroup = forwardRef<HTMLDivElement, KpiGroupProps>(
  (
    {
      balanced = true,
      children,
      className,
      minTileWidth = "13rem",
      style,
      variant = "separate",
      ...props
    },
    forwardedRef,
  ) => {
    const [measureRef, size] = useChartSize<HTMLDivElement>();
    const [columns, setColumns] = useState<number>();

    // Runs after every commit: count the grid items actually rendered, so
    // fragments, mapped arrays, conditionals and wrapper components that
    // render several tiles are all counted correctly.
    useIsomorphicLayoutEffect(() => {
      const element = measureRef.current;
      let next: number | undefined;

      if (balanced && element && size && size.width > 0) {
        const minimum = lengthToPixels(minTileWidth, element);
        if (minimum !== undefined && minimum > 0) {
          const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
          next = balancedColumns(
            element.childElementCount,
            (size.width + gap) / (minimum + gap),
          );
        }
      }

      setColumns((previous) => (previous === next ? previous : next));
    });

    const setRef = (node: HTMLDivElement | null) => {
      measureRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    return (
      <div
        {...props}
        ref={setRef}
        role={
          props["aria-label"] || props["aria-labelledby"] ? "group" : props.role
        }
        data-slot="kpi-group"
        data-variant={variant}
        data-columns={columns}
        className={cn(
          // Auto-fit is the server and no-JS layout; balancing refines it.
          "group/kpi grid min-w-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,var(--kpi-min-tile)),1fr))]",
          variant === "joined"
            ? "border-border bg-background overflow-hidden rounded-xl border"
            : "gap-[var(--dt-space-4)]",
          className,
        )}
        style={{
          ...style,
          ["--kpi-min-tile" as string]: minTileWidth,
          ...(columns
            ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
            : null),
        }}
      >
        {children}
      </div>
    );
  },
);

KpiGroup.displayName = "KpiGroup";
