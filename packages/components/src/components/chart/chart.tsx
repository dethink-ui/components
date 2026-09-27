import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type SVGAttributes,
} from "react";
import { cn } from "../../utils/cn";
import {
  definedSegments,
  linePath,
  resolveChartColor,
  type ChartColor,
  type ChartCurve,
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
  emptyValue = "—",
  className,
  style,
  ...props
}: ChartTooltipProps) {
  const flip = x > containerWidth / 2;
  return (
    <div
      aria-hidden="true"
      data-slot="chart-tooltip"
      data-side={flip ? "left" : "right"}
      className={cn(
        "border-border bg-background text-foreground pointer-events-none absolute top-[var(--dt-space-2)] z-10 grid w-max max-w-60 min-w-32 gap-[var(--dt-space-1)] rounded-md border px-[var(--dt-space-2-5)] py-[var(--dt-space-2)] text-xs shadow-md",
        className,
      )}
      style={{
        left: x,
        transform: flip ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
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
          className="grid grid-cols-[0.75rem_auto_minmax(0,1fr)] items-center gap-x-[var(--dt-space-2)]"
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
