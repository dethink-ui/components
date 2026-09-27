import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type SVGAttributes,
} from "react";
import { cn } from "../../utils/cn";
import {
  areaPath,
  barPath,
  definedSegments,
  isFiniteValue,
  linePath,
  resolveChartColor,
  type ChartColor,
  type ChartCurve,
  type ChartPoint,
  type ChartValue,
  type LinearScale,
} from "./chart-core";
import { useChartSize, type ChartSize } from "./use-chart-size";

export interface ChartSeries {
  /** Record key that holds this series' values. */
  key: string;
  label: string;
  /**
   * Palette slot or any CSS color. Defaults to the slot matching the series'
   * position in the config, so hiding other series never repaints it.
   */
  color?: ChartColor;
}

export interface ResolvedChartSeries extends ChartSeries {
  /** `var(--chart-series-…)`, set on the container for this series. */
  colorVar: string;
}

export interface ChartContextValue {
  series: readonly ResolvedChartSeries[];
  /** Measured plot size, or the fallback before the first client measurement. */
  width: number;
  height: number;
  measured: boolean;
}

const ChartContext = createContext<ChartContextValue | null>(null);

/** Read the nearest `ChartContainer`'s series and size. */
export function useChart() {
  const context = useContext(ChartContext);
  if (!context) throw new Error("useChart must be used inside ChartContainer.");
  return context;
}

function seriesVarName(key: string, index: number) {
  // Keys come from data, so keep only characters valid in a custom property.
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `--chart-series-${index}-${safe}`;
}

/** Give every series a stable CSS variable and a config-position default color. */
export function resolveChartSeries(
  series: readonly ChartSeries[],
): ResolvedChartSeries[] {
  return series.map((item, index) => ({
    ...item,
    colorVar: `var(${seriesVarName(item.key, index)})`,
  }));
}

export function chartSeriesStyle(series: readonly ChartSeries[]) {
  const style: Record<string, string> = {};
  series.forEach((item, index) => {
    style[seriesVarName(item.key, index)] = resolveChartColor(
      item.color ?? (`chart-${(index % 8) + 1}` as ChartColor),
    );
  });
  return style as CSSProperties;
}

const FALLBACK_SIZE: ChartSize = { width: 640, height: 288 };

export interface ChartContainerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  series?: readonly ChartSeries[];
  children?: ReactNode | ((context: ChartContextValue) => ReactNode);
}

/**
 * Measures its own box and maps the series config to CSS variables. Children
 * read the size and series through `useChart()` or a render function.
 */
export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ children, className, series = [], style, ...props }, forwardedRef) => {
    const [measureRef, size] = useChartSize<HTMLDivElement>();
    const measured = size !== undefined && size.width > 0 && size.height > 0;
    const context: ChartContextValue = {
      series: resolveChartSeries(series),
      width: measured ? size.width : FALLBACK_SIZE.width,
      height: measured ? size.height : FALLBACK_SIZE.height,
      measured,
    };

    const setRef = (node: HTMLDivElement | null) => {
      measureRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    return (
      <ChartContext.Provider value={context}>
        <div
          {...props}
          ref={setRef}
          data-slot="chart-container"
          data-measured={measured ? "" : undefined}
          className={cn(
            "relative min-w-0 [--chart-surface:var(--dt-chart-surface,var(--dt-color-background))]",
            className,
          )}
          style={{ ...chartSeriesStyle(series), ...style }}
        >
          {typeof children === "function" ? children(context) : children}
        </div>
      </ChartContext.Provider>
    );
  },
);

ChartContainer.displayName = "ChartContainer";

export interface ChartGridProps extends Omit<SVGAttributes<SVGGElement>, "y"> {
  /** Values that get a horizontal hairline. */
  ticks: readonly number[];
  y: LinearScale;
  x0: number;
  x1: number;
}

/** Solid, recessive horizontal hairlines at each tick. */
export function ChartGrid({
  ticks,
  y,
  x0,
  x1,
  className,
  ...props
}: ChartGridProps) {
  return (
    <g
      aria-hidden="true"
      data-slot="chart-grid"
      className={cn("text-[var(--dt-color-chart-grid)]", className)}
      {...props}
    >
      {ticks.map((tick) => {
        // Half-pixel offset keeps a 1px hairline crisp.
        const position = Math.round(y(tick)) + 0.5;
        return (
          <line
            key={tick}
            x1={x0}
            x2={x1}
            y1={position}
            y2={position}
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
}

export interface ChartAxisTick {
  /** Pixel position along the axis. */
  position: number;
  label: string;
}

export interface ChartAxisProps extends Omit<
  SVGAttributes<SVGGElement>,
  "offset"
> {
  orientation: "left" | "bottom";
  ticks: readonly ChartAxisTick[];
  /** Left: x of the label's end edge. Bottom: y of the label baseline. */
  offset: number;
  /** Bottom axis: plot edges, so the outer labels never overhang them. */
  range?: readonly [number, number];
}

/** Tick labels in muted, tabular figures. No axis line; the grid carries it. */
export function ChartAxis({
  orientation,
  ticks,
  offset,
  range,
  className,
  ...props
}: ChartAxisProps) {
  return (
    <g
      aria-hidden="true"
      data-slot="chart-axis"
      data-orientation={orientation}
      className={cn(
        "fill-muted-foreground text-[11px] tabular-nums [font-variant-numeric:tabular-nums]",
        className,
      )}
      {...props}
    >
      {ticks.map((tick, i) => {
        if (orientation === "left") {
          return (
            <text
              key={i}
              x={offset}
              y={tick.position}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {tick.label}
            </text>
          );
        }
        const anchor =
          range && tick.position - range[0] < 24
            ? "start"
            : range && range[1] - tick.position < 24
              ? "end"
              : "middle";
        return (
          <text
            key={i}
            x={tick.position}
            y={offset}
            textAnchor={anchor}
            dominantBaseline="hanging"
          >
            {tick.label}
          </text>
        );
      })}
    </g>
  );
}

export interface ChartLineProps extends Omit<
  SVGAttributes<SVGGElement>,
  "color" | "values" | "x" | "y"
> {
  values: readonly ChartValue[];
  /** Pixel x for each index. */
  x: (index: number) => number;
  y: LinearScale;
  /** CSS color, usually a series' `colorVar`. */
  color: string;
  curve?: ChartCurve;
  dimmed?: boolean;
  animate?: boolean;
  /** Mark the last defined value with a ringed dot. */
  endMarker?: boolean;
  /**
   * Add a transparent 12px stroke under the line so pointer events on the
   * group (for example, dimming the other series) do not need pixel aim.
   */
  hitArea?: boolean;
}

const drawClasses =
  "motion-safe:[stroke-dasharray:1] motion-safe:animate-[dt-chart-draw_900ms_var(--ease-control)_both]";
const popClasses =
  "motion-safe:animate-[dt-chart-pop_320ms_var(--ease-control)_750ms_both] [transform-box:fill-box] [transform-origin:center]";

/** A 2px series line. Gaps stay gaps; an isolated value draws as a dot. */
export function ChartLine({
  values,
  x,
  y,
  color,
  curve = "monotone",
  dimmed = false,
  animate = true,
  endMarker = false,
  hitArea = false,
  className,
  style,
  ...props
}: ChartLineProps) {
  const segments = definedSegments(values, (value, index) => ({
    x: x(index),
    y: y(value),
  }));
  const motion = animate ? undefined : "none";
  const last = segments.at(-1)?.at(-1);

  return (
    <g
      data-slot="chart-line"
      data-dimmed={dimmed ? "" : undefined}
      className={cn(
        "motion-safe:transition-opacity motion-safe:duration-200",
        className,
      )}
      style={{ color, opacity: dimmed ? 0.2 : undefined, ...style }}
      {...props}
    >
      {hitArea
        ? segments.map((points, i) =>
            points.length > 1 ? (
              <path
                key={`hit-${i}`}
                data-slot="chart-line-hit"
                d={linePath(points, curve)}
                fill="none"
                stroke="transparent"
                strokeWidth={12}
                pointerEvents="stroke"
              />
            ) : null,
          )
        : null}
      {segments.map((points, i) =>
        points.length === 1 ? (
          <circle
            key={i}
            cx={points[0]!.x}
            cy={points[0]!.y}
            r={3}
            fill="currentColor"
          />
        ) : (
          <path
            key={i}
            d={linePath(points, curve)}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={drawClasses}
            style={{ animation: motion, strokeDasharray: motion }}
          />
        ),
      )}
      {endMarker && last ? (
        <circle
          data-slot="chart-line-end"
          cx={last.x}
          cy={last.y}
          r={4}
          fill="currentColor"
          stroke="var(--chart-surface)"
          strokeWidth={2}
          paintOrder="stroke"
          className={popClasses}
          style={{ animation: motion }}
        />
      ) : null}
    </g>
  );
}

export interface ChartAreaProps extends Omit<
  SVGAttributes<SVGGElement>,
  "color" | "opacity" | "values" | "x" | "y"
> {
  /** Upper edge per index, in value space. Missing values leave a gap. */
  values: readonly ChartValue[];
  /**
   * Lower edge in value space: one value for a flat floor, or one per index
   * for stacked bands. Defaults to zero, clamped into the y-domain.
   */
  baseline?: number | readonly ChartValue[];
  /** Pixel x for each index. */
  x: (index: number) => number;
  y: LinearScale;
  /** CSS color, usually a series' `colorVar`. */
  color: string;
  curve?: ChartCurve;
  dimmed?: boolean;
  animate?: boolean;
  /** Wash opacity at the top of the plot; it fades out towards the bottom. */
  opacity?: number;
}

const fadeClasses =
  "motion-safe:animate-[dt-chart-fade_600ms_var(--ease-control)_300ms_both]";

/**
 * A vertical gradient wash between a series and its baseline. It carries no
 * stroke: pair it with `ChartLine` so the edge reads at full strength.
 */
export function ChartArea({
  values,
  baseline,
  x,
  y,
  color,
  curve = "monotone",
  dimmed = false,
  animate = true,
  opacity = 0.24,
  className,
  style,
  ...props
}: ChartAreaProps) {
  const gradientId = `${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-area`;
  const [floor, ceiling] = y.domain;
  const flat =
    typeof baseline === "number"
      ? baseline
      : Math.min(
          Math.max(0, Math.min(floor, ceiling)),
          Math.max(floor, ceiling),
        );
  const lower = (i: number) =>
    typeof baseline === "object" ? baseline[i] : flat;

  // Runs of indexes where both edges are defined; a single index has no area.
  const segments: { top: ChartPoint[]; bottom: ChartPoint[] }[] = [];
  let current: (typeof segments)[number] | undefined;
  values.forEach((value, i) => {
    const base = lower(i);
    if (isFiniteValue(value) && isFiniteValue(base)) {
      current ??= { top: [], bottom: [] };
      current.top.push({ x: x(i), y: y(value) });
      current.bottom.push({ x: x(i), y: y(base) });
    } else if (current) {
      segments.push(current);
      current = undefined;
    }
  });
  if (current) segments.push(current);

  // One gradient across the whole plot height, so equal values wash equally.
  const [rangeBottom, rangeTop] = y.range;

  return (
    <g
      data-slot="chart-area"
      data-dimmed={dimmed ? "" : undefined}
      className={cn(
        "motion-safe:transition-opacity motion-safe:duration-200",
        className,
      )}
      style={{ opacity: dimmed ? 0.2 : undefined, ...style }}
      {...props}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={0}
          x2={0}
          y1={rangeTop}
          y2={rangeBottom}
        >
          <stop offset={0} style={{ stopColor: color, stopOpacity: opacity }} />
          <stop
            offset={1}
            style={{ stopColor: color, stopOpacity: opacity * 0.1 }}
          />
        </linearGradient>
      </defs>
      {segments.map((segment, i) =>
        segment.top.length > 1 ? (
          <path
            key={i}
            d={areaPath(segment.top, segment.bottom, curve)}
            fill={`url(#${gradientId})`}
            className={fadeClasses}
            style={{ animation: animate ? undefined : "none" }}
          />
        ) : null,
      )}
    </g>
  );
}

export interface ChartBarsProps extends Omit<
  SVGAttributes<SVGGElement>,
  "color" | "values" | "x" | "y"
> {
  /** Data end per index, in value space. Missing values draw no bar. */
  values: readonly ChartValue[];
  /**
   * Baseline in value space: one value, or one per index for stacked
   * segments. Defaults to zero, clamped into the y-domain.
   */
  baseline?: number | readonly ChartValue[];
  /** Pixel x of each index's bar left edge. */
  x: (index: number) => number;
  /** Bar thickness in pixels. */
  width: number;
  y: LinearScale;
  /** CSS color, usually a series' `colorVar`. */
  color: string;
  /**
   * Pixels trimmed from the baseline end, per index. Stacked segments use it
   * to leave a surface gap above the segment below.
   */
  inset?: number | ((index: number) => number);
  /** Round the data end; stacked charts round only the outermost segment. */
  rounded?: boolean | ((index: number) => boolean);
  dimmed?: boolean;
  animate?: boolean;
}

/**
 * One series of vertical bars with 4px rounded data-ends and square baselines.
 * Bars grow from the zero line on mount, under motion-safe only.
 */
export function ChartBars({
  values,
  baseline,
  x,
  width,
  y,
  color,
  inset = 0,
  rounded = true,
  dimmed = false,
  animate = true,
  className,
  style,
  ...props
}: ChartBarsProps) {
  const [floor, ceiling] = y.domain;
  const zero = Math.min(
    Math.max(0, Math.min(floor, ceiling)),
    Math.max(floor, ceiling),
  );
  const lower = (i: number) =>
    typeof baseline === "object"
      ? baseline[i]
      : typeof baseline === "number"
        ? baseline
        : zero;

  return (
    <g
      data-slot="chart-bars"
      data-dimmed={dimmed ? "" : undefined}
      className={cn(
        "motion-safe:transition-opacity motion-safe:duration-200",
        className,
      )}
      style={{ color, opacity: dimmed ? 0.2 : undefined, ...style }}
      {...props}
    >
      {values.map((value, i) => {
        const base = lower(i);
        if (!isFiniteValue(value) || !isFiniteValue(base)) return null;
        const end = y(value);
        let start = y(base);
        const trim = typeof inset === "function" ? inset(i) : inset;
        // Move the baseline towards the data end, never past it.
        if (trim > 0) {
          const room = Math.abs(end - start);
          start += Math.sign(end - start) * Math.min(trim, room);
        }
        const round = typeof rounded === "function" ? rounded(i) : rounded;
        const d = barPath({
          x: x(i),
          width,
          baseline: start,
          value: end,
          radius: round ? 4 : 0,
        });
        if (!d) return null;
        return (
          <path
            key={i}
            data-slot="chart-bar"
            data-index={i}
            d={d}
            fill="currentColor"
            className="motion-safe:animate-[dt-chart-grow_600ms_var(--ease-control)_both]"
            style={{
              // Every segment scales from the zero line, so stacks grow as one.
              transformBox: "view-box",
              transformOrigin: `0 ${y(zero)}px`,
              animation: animate ? undefined : "none",
            }}
          />
        );
      })}
    </g>
  );
}

export interface ChartCrosshairPoint {
  key: string;
  y: number;
  color: string;
}

export interface ChartCrosshairProps extends Omit<
  SVGAttributes<SVGGElement>,
  "x" | "points"
> {
  x: number;
  top: number;
  bottom: number;
  points?: readonly ChartCrosshairPoint[];
}

/** Vertical hairline at the active index with ringed dots on each series. */
export function ChartCrosshair({
  x,
  top,
  bottom,
  points = [],
  className,
  ...props
}: ChartCrosshairProps) {
  const position = Math.round(x) + 0.5;
  return (
    <g
      aria-hidden="true"
      data-slot="chart-crosshair"
      className={cn("pointer-events-none", className)}
      {...props}
    >
      <line
        x1={position}
        x2={position}
        y1={top}
        y2={bottom}
        stroke="var(--dt-color-chart-crosshair)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {points.map((point) => (
        <circle
          key={point.key}
          cx={x}
          cy={point.y}
          r={4}
          fill={point.color}
          stroke="var(--chart-surface)"
          strokeWidth={2}
          paintOrder="stroke"
        />
      ))}
    </g>
  );
}

export interface ChartTooltipItem {
  key: string;
  label: string;
  /** Formatted value, or undefined when the series has no value here. */
  value?: string;
  color: string;
  /** Emphasise this row, for example the bar under the pointer. */
  active?: boolean;
}

export interface ChartTooltipProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: ReactNode;
  items: readonly ChartTooltipItem[];
  /** Pixel x of the crosshair inside the positioned parent. */
  x: number;
  /** Width of the positioned parent, to flip the tooltip near the edge. */
  containerWidth: number;
  /** Gap between `x` and the tooltip's near edge. */
  offset?: number;
  emptyValue?: string;
}

/**
 * Readout for the active index: values lead, series names follow, and each row
 * is keyed by a short line in the series color. Content renders as React text,
 * never HTML, because labels usually come from data.
 */
export function ChartTooltip({
  title,
  items,
  x,
  containerWidth,
  offset = 12,
  emptyValue = "—",
  className,
  style,
  ...props
}: ChartTooltipProps) {
  // Open towards the side with more room, and never grow past that room, so
  // the tooltip stays inside the chart (and any card that clips it).
  const roomRight = containerWidth - x - offset;
  const roomLeft = x - offset;
  const flip = roomLeft > roomRight;
  const room = Math.max(0, Math.floor(flip ? roomLeft : roomRight));
  return (
    <div
      aria-hidden="true"
      data-slot="chart-tooltip"
      data-side={flip ? "left" : "right"}
      className={cn(
        "border-border bg-background text-foreground pointer-events-none absolute top-[var(--dt-space-2)] z-10 grid w-max gap-[var(--dt-space-1)] rounded-md border px-[var(--dt-space-2-5)] py-[var(--dt-space-2)] text-xs shadow-md",
        className,
      )}
      style={{
        left: x,
        maxWidth: `min(15rem, ${room}px)`,
        minWidth: `min(8rem, ${room}px)`,
        transform: flip
          ? `translateX(calc(-100% - ${offset}px))`
          : `translateX(${offset}px)`,
        ...style,
      }}
      {...props}
    >
      {title !== undefined ? (
        <div className="text-muted-foreground font-medium">{title}</div>
      ) : null}
      {items.map((item) => (
        <div
          key={item.key}
          data-slot="chart-tooltip-item"
          data-active={item.active ? "" : undefined}
          className="data-active:bg-muted -mx-[var(--dt-space-1)] grid grid-cols-[0.75rem_auto_minmax(0,1fr)] items-center gap-x-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-1)]"
        >
          <span
            aria-hidden="true"
            className="h-0.5 w-3 rounded-full"
            style={{ background: item.color }}
          />
          <span
            dir="ltr"
            className="text-foreground font-semibold tabular-nums"
          >
            {item.value ?? emptyValue}
          </span>
          <span className="text-muted-foreground truncate">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export interface ChartLegendItem {
  key: string;
  label: string;
  color: string;
  hidden?: boolean;
}

export interface ChartLegendProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  "onToggle"
> {
  items: readonly ChartLegendItem[];
  /** Makes each item a toggle button that shows or hides its series. */
  onToggle?: (key: string) => void;
  /** Called with a key on hover or focus, and `undefined` on leave or blur. */
  onHighlight?: (key: string | undefined) => void;
  /** Key style mirrors the mark: a line for line charts, a box for bars and areas. */
  marker?: "line" | "square";
}

export function ChartLegend({
  items,
  onToggle,
  onHighlight,
  marker = "line",
  className,
  ...props
}: ChartLegendProps) {
  return (
    <ul
      data-slot="chart-legend"
      className={cn(
        "flex flex-wrap items-center gap-x-[var(--dt-space-4)] gap-y-[var(--dt-space-1)] text-xs",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "shrink-0",
                marker === "line"
                  ? "h-0.5 w-3 rounded-full"
                  : "size-2.5 rounded-[2px]",
                item.hidden && "opacity-30",
              )}
              style={{ background: item.color }}
            />
            <span className={cn(item.hidden && "line-through opacity-60")}>
              {item.label}
            </span>
          </>
        );
        const highlight = onHighlight
          ? {
              onPointerEnter: () => onHighlight(item.key),
              onPointerLeave: () => onHighlight(undefined),
              onFocus: () => onHighlight(item.key),
              onBlur: () => onHighlight(undefined),
            }
          : {};
        return (
          <li key={item.key} data-slot="chart-legend-item">
            {onToggle ? (
              <button
                type="button"
                aria-pressed={!item.hidden}
                onClick={() => onToggle(item.key)}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring inline-flex items-center gap-[var(--dt-space-1-5)] rounded-sm px-[var(--dt-space-1)] py-0.5 outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
                {...highlight}
              >
                {content}
              </button>
            ) : (
              <span
                className="text-muted-foreground inline-flex items-center gap-[var(--dt-space-1-5)]"
                {...highlight}
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export interface ChartDataTableColumn {
  key: string;
  label: string;
}

export interface ChartDataTableProps extends HTMLAttributes<HTMLDivElement> {
  caption: ReactNode;
  indexLabel: string;
  columns: readonly ChartDataTableColumn[];
  rows: ReadonlyArray<{
    key: string;
    index: string;
    values: readonly string[];
  }>;
  /** Keep the table for assistive technology only. */
  visuallyHidden?: boolean;
}

/** The chart's data as a real table: the equivalent for every chart. */
export function ChartDataTable({
  caption,
  indexLabel,
  columns,
  rows,
  visuallyHidden = true,
  className,
  ...props
}: ChartDataTableProps) {
  return (
    <div
      data-slot="chart-data-table"
      className={cn(
        visuallyHidden ? "sr-only" : "max-h-80 overflow-auto rounded-md border",
        className,
      )}
      {...props}
    >
      <table className="w-full border-collapse text-xs">
        <caption className={visuallyHidden ? undefined : "sr-only"}>
          {caption}
        </caption>
        <thead className="bg-muted/50 text-muted-foreground sticky top-0">
          <tr>
            <th
              scope="col"
              className="px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-start font-medium"
            >
              {indexLabel}
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-end font-medium"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t">
              <th
                scope="row"
                className="px-[var(--dt-space-3)] py-[var(--dt-space-1-5)] text-start font-medium"
              >
                {row.index}
              </th>
              {row.values.map((value, i) => (
                <td
                  key={columns[i]?.key ?? i}
                  dir="ltr"
                  className="px-[var(--dt-space-3)] py-[var(--dt-space-1-5)] text-end tabular-nums"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
