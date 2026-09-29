import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import {
  ChartAxis,
  ChartContainer,
  ChartCrosshair,
  ChartDataTable,
  ChartGrid,
  ChartLegend,
  ChartTooltip,
  chartSeriesStyle,
  resolveChartSeries,
  type ChartSeries,
  type ResolvedChartSeries,
} from "./chart";
import {
  formatChartValue,
  isFiniteValue,
  nearestIndex,
  niceTicks,
  scaleLinear,
  valueDomain,
  type ChartCurve,
  type ChartValue,
  type FormatChartValueOptions,
  type LinearScale,
} from "./chart-core";

export type ChartDatum = Record<string, unknown>;

/** Props shared by every single-axis cartesian chart (LineChart, AreaChart). */
export interface CartesianChartProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "color"
> {
  /** One record per x position, in order. */
  data: readonly ChartDatum[];
  /** Record key that holds the x value, for example "month". */
  index: string;
  /** Series to draw, all on one y-axis. At most 8; fold the rest into "Other". */
  series: readonly ChartSeries[];
  curve?: ChartCurve;
  /** Plot height. The width always fills the container. */
  height?: number | string;
  /** Fixed value domain. Defaults to the visible data, niced, including zero. */
  yDomain?: readonly [number, number];
  includeZero?: boolean;
  formatValue?: (value: number) => string;
  formatOptions?: FormatChartValueOptions;
  /** Label for an x value on the axis, tooltip, readout and table. */
  formatIndex?: (value: unknown, index: number) => string;
  /** Header for the index column of the data table. Defaults to `index`. */
  indexLabel?: string;
  /** Defaults to on for two or more series. */
  legend?: boolean;
  /** Series keys hidden through the legend (controlled). */
  hiddenSeries?: readonly string[];
  defaultHiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (hidden: string[]) => void;
  /** Show the data table instead of the plot (controlled). */
  showTable?: boolean;
  defaultShowTable?: boolean;
  onShowTableChange?: (showTable: boolean) => void;
  /** Render the chart/table toggle button. */
  tableToggle?: boolean;
  /** Keep the previous render at reduced opacity while data refetches. */
  loading?: boolean;
  emptyLabel?: ReactNode;
  loadingLabel?: ReactNode;
  animate?: boolean;
}

/** What a chart kind draws inside the shared plot, for the visible series. */
export interface CartesianLayout {
  /** Values the automatic y-domain must cover. */
  domainValues: readonly ChartValue[];
  /** Where the crosshair marks a series at an index, in value space. */
  pointValue: (key: string, index: number) => ChartValue;
  render: (context: CartesianMarksContext) => ReactNode;
  /**
   * Half the width the marks occupy around an index's centre, for a band
   * layout, so the tooltip opens beside the marks rather than the whole slot.
   */
  markHalfWidth?: (step: number) => number;
}

export interface CartesianMarksContext {
  /** Pixel x of an index: the point, or the centre of its band. */
  x: (index: number) => number;
  /** Width of one index's band (the spacing between points for "point"). */
  step: number;
  y: LinearScale;
  /** Pixel y of the plot's bottom edge. */
  bottom: number;
  active: number | undefined;
  highlighted: string | undefined;
  /** Series under the pointer, for charts whose marks carry `data-series`. */
  hovered: string | undefined;
}

export interface CartesianChartBaseProps extends Omit<
  CartesianChartProps,
  "animate" | "curve"
> {
  /** Names the widget ("line" → "line chart") and prefixes its data-slots. */
  kind: string;
  layout: (visible: readonly ResolvedChartSeries[]) => CartesianLayout;
  /**
   * "point" puts indexes on the plot edges with a crosshair line and dots;
   * "band" gives each index an equal slot and highlights the whole slot.
   */
  xLayout?: "point" | "band";
}

const MARGIN = { top: 8, right: 8, bottom: 24 };
const AXIS_GAP = 8;
// Approximate advance of an 11px tabular digit; SSR cannot measure text.
const AXIS_CHAR_WIDTH = 6.6;
// Room outside the plot for a 4px marker and its 2px surface ring.
const MARKER_BLEED = 6;

const defaultFormatIndex = (value: unknown) => String(value ?? "");

export function valueAt(
  datum: ChartDatum | undefined,
  key: string,
): ChartValue {
  const value = datum?.[key];
  return typeof value === "number" ? value : null;
}

function evenlySpacedIndexes(count: number, maxTicks: number) {
  if (count === 0) return [];
  if (count === 1) return [0];
  const step = Math.max(1, Math.ceil((count - 1) / Math.max(1, maxTicks - 1)));
  const indexes: number[] = [];
  for (let i = 0; i < count; i += step) indexes.push(i);
  // Always label the latest point; drop the tick before it if they would crowd.
  const last = count - 1;
  if (indexes.at(-1) !== last) {
    if (last - indexes.at(-1)! <= step / 2) indexes.pop();
    indexes.push(last);
  }
  return indexes;
}

/**
 * The single-axis chart shell: legend, table toggle, scales, axes, crosshair,
 * tooltip, keyboard readout and data table. Each chart kind supplies only its
 * marks through `layout`.
 */
export const CartesianChart = forwardRef<
  HTMLDivElement,
  CartesianChartBaseProps
>(
  (
    {
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      className,
      data,
      defaultHiddenSeries = [],
      defaultShowTable = false,
      emptyLabel = "No data",
      formatIndex = defaultFormatIndex,
      formatOptions,
      formatValue,
      height = 288,
      hiddenSeries: hiddenSeriesProp,
      includeZero = true,
      index,
      indexLabel,
      kind,
      layout,
      legend,
      xLayout = "point",
      loading = false,
      loadingLabel = "Loading…",
      onHiddenSeriesChange,
      onShowTableChange,
      series,
      showTable: showTableProp,
      tableToggle = true,
      yDomain,
      ...props
    },
    ref,
  ) => {
    const id = useId();
    const slot = `${kind}-chart`;
    const summaryId = `${id}-summary`;
    const clipId = `${id.replace(/[^a-zA-Z0-9_-]/g, "")}-plot-clip`;
    const [hiddenState, setHiddenState] =
      useState<readonly string[]>(defaultHiddenSeries);
    const hidden = hiddenSeriesProp ?? hiddenState;
    const [showTableState, setShowTableState] = useState(defaultShowTable);
    const showTable = showTableProp ?? showTableState;
    const [activeIndex, setActiveIndex] = useState<number>();
    const [highlighted, setHighlighted] = useState<string>();
    const [hovered, setHovered] = useState<string>();
    const [announcement, setAnnouncement] = useState("");

    const format = (value: number) =>
      formatValue ? formatValue(value) : formatChartValue(value, formatOptions);
    const resolved = resolveChartSeries(series);
    const visible = resolved.filter((item) => !hidden.includes(item.key));
    const indexText = (i: number) => formatIndex(data[i]?.[index], i);
    const title =
      typeof ariaLabel === "string" && ariaLabel
        ? ariaLabel
        : `${kind[0]!.toUpperCase()}${kind.slice(1)} chart`;
    const showLegend = legend ?? series.length >= 2;
    const hasValues = data.some((datum) =>
      visible.some((item) => isFiniteValue(valueAt(datum, item.key))),
    );

    const toggleSeries = (key: string) => {
      const next = hidden.includes(key)
        ? hidden.filter((item) => item !== key)
        : [...hidden, key];
      // Keep at least one series on the plot.
      if (series.every((item) => next.includes(item.key))) return;
      if (hiddenSeriesProp === undefined) setHiddenState(next);
      onHiddenSeriesChange?.(next);
      if (next.includes(highlighted ?? "")) setHighlighted(undefined);
    };

    const setTable = (next: boolean) => {
      if (showTableProp === undefined) setShowTableState(next);
      onShowTableChange?.(next);
    };

    const readout = (i: number) =>
      `${indexText(i)}: ` +
      visible
        .map((item) => {
          const value = valueAt(data[i], item.key);
          return `${item.label} ${isFiniteValue(value) ? format(value) : "no value"}`;
        })
        .join(", ");

    const moveTo = (i: number) => {
      const next = Math.max(0, Math.min(data.length - 1, i));
      setActiveIndex(next);
      setAnnouncement(readout(next));
    };

    const summary = (() => {
      if (!hasValues) return `${title}: no data.`;
      const names = visible.map((item) => item.label).join(", ");
      return (
        `Series: ${names}. ` +
        `${data.length} points from ${indexText(0)} to ${indexText(data.length - 1)}. ` +
        "Use the arrow keys, Home and End to read values."
      );
    })();

    // Formatting every cell is O(points × series); keep it out of crosshair
    // renders, which only change interaction state.
    const table = useMemo(
      () => (
        <ChartDataTable
          caption={title}
          indexLabel={indexLabel ?? index}
          columns={series.map(({ key, label }) => ({ key, label }))}
          rows={data.map((datum, i) => ({
            key: String(i),
            index: formatIndex(datum[index], i),
            values: series.map((item) => {
              const value = valueAt(datum, item.key);
              if (!isFiniteValue(value)) return "—";
              return formatValue
                ? formatValue(value)
                : formatChartValue(value, formatOptions);
            }),
          }))}
          visuallyHidden={!showTable}
        />
      ),
      [
        data,
        formatIndex,
        formatOptions,
        formatValue,
        index,
        indexLabel,
        series,
        showTable,
        title,
      ],
    );

    return (
      <div
        {...props}
        ref={ref}
        data-slot={slot}
        aria-busy={loading || undefined}
        className={cn("grid min-w-0 gap-[var(--dt-space-3)]", className)}
        // Series variables live on the root so the legend and table share them.
        style={{ ...chartSeriesStyle(series), ...props.style }}
      >
        {showLegend || tableToggle ? (
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-[var(--dt-space-2)]">
            {showLegend ? (
              <ChartLegend
                aria-label={`${title} series`}
                items={resolved.map((item) => ({
                  key: item.key,
                  label: item.label,
                  color: item.colorVar,
                  hidden: hidden.includes(item.key),
                }))}
                onToggle={toggleSeries}
                onHighlight={setHighlighted}
              />
            ) : (
              <span />
            )}
            {tableToggle ? (
              <button
                type="button"
                data-slot={`${slot}-table-toggle`}
                aria-pressed={showTable}
                onClick={() => setTable(!showTable)}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring rounded-sm px-[var(--dt-space-1)] py-0.5 text-xs font-medium outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
              >
                Table view
              </button>
            ) : null}
          </div>
        ) : null}

        {showTable ? null : (
          <ChartContainer
            series={series}
            style={{ height }}
            className={cn(
              "motion-safe:transition-opacity",
              loading && hasValues && "opacity-60",
            )}
          >
            {({ width, height: plotHeight, measured }) => {
              if (!hasValues) {
                return (
                  <div
                    data-slot={`${slot}-empty`}
                    className="text-muted-foreground absolute inset-0 grid place-items-center text-sm"
                  >
                    {loading ? loadingLabel : emptyLabel}
                  </div>
                );
              }

              const bottom = plotHeight - MARGIN.bottom;
              const tickCount = Math.max(
                2,
                Math.floor((bottom - MARGIN.top) / 48),
              );
              const marks = layout(visible);
              const domain =
                yDomain ??
                valueDomain(marks.domainValues, {
                  includeZero,
                  count: tickCount,
                });
              const ticks = niceTicks(domain[0], domain[1], tickCount);
              const tickLabels = ticks.map(format);
              const left =
                Math.ceil(
                  Math.max(0, ...tickLabels.map((label) => label.length)) *
                    AXIS_CHAR_WIDTH,
                ) + AXIS_GAP;
              const right = width - MARGIN.right;
              const y = scaleLinear(domain, [bottom, MARGIN.top]);
              const xScale = scaleLinear(
                [0, Math.max(1, data.length - 1)],
                [left, right],
              );
              const band = xLayout === "band";
              const step = band
                ? (right - left) / Math.max(1, data.length)
                : (right - left) / Math.max(1, data.length - 1);
              const x = (i: number) =>
                band
                  ? left + step * (i + 0.5)
                  : data.length === 1
                    ? (left + right) / 2
                    : xScale(i);
              const positions = data.map((_, i) => x(i));
              const xTicks = evenlySpacedIndexes(
                data.length,
                Math.max(2, Math.floor((right - left) / (band ? 64 : 80))),
              );
              const active =
                activeIndex !== undefined && activeIndex < data.length
                  ? activeIndex
                  : undefined;

              const onPointer = (event: PointerEvent<HTMLDivElement>) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const scaleX = rect.width > 0 ? width / rect.width : 1;
                setActiveIndex(
                  nearestIndex(positions, (event.clientX - rect.left) * scaleX),
                );
                if (band) {
                  const mark =
                    event.target instanceof Element
                      ? event.target.closest("[data-series]")
                      : null;
                  setHovered(mark?.getAttribute("data-series") ?? undefined);
                }
              };

              const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                const last = data.length - 1;
                // With no crosshair (after Escape), arrows resume at the latest
                // point; Home and End still jump to their ends.
                const step = (delta: number) =>
                  active === undefined ? last : active + delta;
                const keys: Record<string, () => number> = {
                  ArrowRight: () => step(1),
                  ArrowUp: () => step(1),
                  ArrowLeft: () => step(-1),
                  ArrowDown: () => step(-1),
                  Home: () => 0,
                  End: () => last,
                };
                if (event.key === "Escape") {
                  setActiveIndex(undefined);
                  return;
                }
                const next = keys[event.key];
                if (next === undefined) return;
                event.preventDefault();
                moveTo(next());
              };

              /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- The plot is a one-tab-stop widget: arrows, Home and End move the crosshair. */
              return (
                <div
                  role="application"
                  aria-roledescription={`${kind} chart`}
                  aria-label={ariaLabelledBy ? undefined : title}
                  aria-labelledby={ariaLabelledBy}
                  aria-describedby={
                    [summaryId, ariaDescribedBy].filter(Boolean).join(" ") ||
                    undefined
                  }
                  tabIndex={0}
                  dir="ltr"
                  data-slot={`${slot}-plot`}
                  className="focus-visible:outline-ring absolute inset-0 touch-pan-y rounded-sm outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
                  onPointerMove={onPointer}
                  onPointerDown={onPointer}
                  onPointerLeave={(event) => {
                    setHovered(undefined);
                    if (document.activeElement !== event.currentTarget) {
                      setActiveIndex(undefined);
                    }
                  }}
                  onFocus={() => {
                    if (active === undefined) moveTo(data.length - 1);
                  }}
                  onBlur={() => setActiveIndex(undefined)}
                  onKeyDown={onKeyDown}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    className="absolute inset-0 size-full overflow-visible"
                    viewBox={`0 0 ${width} ${plotHeight}`}
                    preserveAspectRatio={measured ? undefined : "none"}
                  >
                    <defs>
                      <clipPath id={clipId}>
                        <rect
                          x={left - MARKER_BLEED}
                          y={MARGIN.top - MARKER_BLEED}
                          width={Math.max(0, right - left + MARKER_BLEED * 2)}
                          height={Math.max(
                            0,
                            bottom - MARGIN.top + MARKER_BLEED * 2,
                          )}
                        />
                      </clipPath>
                    </defs>
                    <ChartGrid ticks={ticks} y={y} x0={left} x1={right} />
                    {band && active !== undefined ? (
                      <rect
                        data-slot="chart-band-highlight"
                        x={x(active) - step / 2}
                        y={MARGIN.top}
                        width={step}
                        height={Math.max(0, bottom - MARGIN.top)}
                        rx={4}
                        className="fill-muted pointer-events-none"
                      />
                    ) : null}
                    <g style={{ visibility: measured ? undefined : "hidden" }}>
                      <ChartAxis
                        orientation="left"
                        offset={left - AXIS_GAP}
                        ticks={ticks.map((tick, i) => ({
                          position: y(tick),
                          label: tickLabels[i]!,
                        }))}
                      />
                      <ChartAxis
                        orientation="bottom"
                        offset={bottom + AXIS_GAP}
                        range={[left, right]}
                        ticks={xTicks.map((i) => ({
                          position: x(i),
                          label: indexText(i),
                        }))}
                      />
                    </g>
                    {/* Values outside a fixed yDomain must not paint over nearby content. */}
                    <g
                      data-slot={`${slot}-series`}
                      clipPath={`url(#${clipId})`}
                    >
                      {marks.render({
                        x,
                        step,
                        y,
                        bottom,
                        active,
                        highlighted,
                        hovered,
                      })}
                      {!band && active !== undefined ? (
                        <ChartCrosshair
                          x={x(active)}
                          top={MARGIN.top}
                          bottom={bottom}
                          points={visible.flatMap((item) => {
                            const value = marks.pointValue(item.key, active);
                            return isFiniteValue(value)
                              ? [
                                  {
                                    key: item.key,
                                    y: y(value),
                                    color: item.colorVar,
                                  },
                                ]
                              : [];
                          })}
                        />
                      ) : null}
                    </g>
                  </svg>
                  {active !== undefined && measured ? (
                    <ChartTooltip
                      x={x(active)}
                      // Beside the band, so the tooltip never covers its bars.
                      offset={
                        band
                          ? (marks.markHalfWidth?.(step) ?? step / 2) + 4
                          : undefined
                      }
                      containerWidth={width}
                      title={indexText(active)}
                      items={visible.map((item) => {
                        const value = valueAt(data[active], item.key);
                        return {
                          key: item.key,
                          label: item.label,
                          color: item.colorVar,
                          active: band && hovered === item.key,
                          value: isFiniteValue(value)
                            ? format(value)
                            : undefined,
                        };
                      })}
                    />
                  ) : null}
                </div>
              );
              /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
            }}
          </ChartContainer>
        )}

        {table}
        <p id={summaryId} className="sr-only">
          {summary}
        </p>
        <div
          aria-live="polite"
          aria-atomic="true"
          data-slot={`${slot}-readout`}
          className="sr-only"
        >
          {announcement}
        </div>
      </div>
    );
  },
);

CartesianChart.displayName = "CartesianChart";
