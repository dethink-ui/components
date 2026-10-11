import { forwardRef, useId, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import {
  areaPath,
  barPath,
  definedSegments,
  extent,
  formatChartValue,
  isFiniteValue,
  linePath,
  resolveChartColor,
  scaleBand,
  scaleLinear,
  summarizeSeries,
  type ChartColor,
  type ChartCurve,
  type ChartValue,
} from "../chart/chart-core";
import { useChartSize } from "../chart/use-chart-size";

export type SparklineVariant = "line" | "area" | "bar";
export type SparklineMarker = "first" | "last" | "min" | "max";
export type SparklineEmphasis = "last" | "none";

export interface SparklineProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "color"
> {
  /** Values in order. `null`/`undefined` leave a gap. */
  data: readonly ChartValue[];
  variant?: SparklineVariant;
  /** Palette slot (`"chart-3"`) or any CSS color. */
  color?: ChartColor;
  curve?: ChartCurve;
  /** Point markers for line and area variants. `true` shows min, max and last. */
  markers?: boolean | readonly SparklineMarker[];
  /** Bar variant: mute every bar except the latest period. */
  emphasis?: SparklineEmphasis;
  /** Fixed value domain. Defaults to the data extent (bars always include zero). */
  domain?: readonly [number, number];
  /** Start of the accessible summary, for example "Revenue, last 12 weeks". */
  label?: string;
  formatValue?: (value: number) => string;
  /** Hide from assistive technology when surrounding text already carries the data. */
  decorative?: boolean;
  /** Draw-in on mount. Always off under reduced motion. */
  animate?: boolean;
}

// Fallback geometry used before the first client measurement (and on the server).
const FALLBACK_WIDTH = 120;
const FALLBACK_HEIGHT = 32;
const PADDING = 4;

const sparklineRootClasses =
  "relative inline-block h-8 w-full min-w-16 align-middle text-[var(--sparkline-color)] [--sparkline-surface:var(--dt-chart-surface,var(--dt-color-background))]";

const drawClasses =
  "motion-safe:[stroke-dasharray:1] motion-safe:animate-[dt-chart-draw_900ms_var(--ease-control)_both]";
const fadeClasses =
  "motion-safe:animate-[dt-chart-fade_600ms_ease-out_150ms_both]";
const markerClasses =
  "motion-safe:animate-[dt-chart-pop_320ms_var(--ease-control)_750ms_both] [transform-box:fill-box] [transform-origin:center]";
const growClasses =
  "motion-safe:animate-[dt-chart-grow_600ms_var(--ease-control)_both] [transform-box:fill-box] [transform-origin:bottom]";

export function describeSparkline(
  data: readonly ChartValue[],
  label = "Trend",
  formatValue: (value: number) => string = (value) => formatChartValue(value),
) {
  const summary = summarizeSeries(data);
  if (summary.count === 0) return `${label}: no data`;
  if (summary.count === 1) return `${label}: ${formatValue(summary.last!)}`;

  return (
    `${label}: ${summary.count} values, from ${formatValue(summary.first!)} ` +
    `to ${formatValue(summary.last!)}; low ${formatValue(summary.min!)}, ` +
    `high ${formatValue(summary.max!)}`
  );
}

function lastDefinedIndex(data: readonly ChartValue[]) {
  for (let index = data.length - 1; index >= 0; index -= 1) {
    if (isFiniteValue(data[index])) return index;
  }
  return -1;
}

function resolveMarkers(
  markers: SparklineProps["markers"],
): readonly SparklineMarker[] {
  if (markers === true) return ["min", "max", "last"];
  if (markers === false) return [];
  return markers ?? ["last"];
}

export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(
  (
    {
      animate = true,
      className,
      color = "chart-1",
      curve = "monotone",
      data,
      decorative = false,
      domain,
      emphasis = "last",
      formatValue,
      label,
      markers,
      style,
      variant = "line",
      ...props
    },
    forwardedRef,
  ) => {
    const gradientId = useId();
    const [measureRef, size] = useChartSize<HTMLDivElement>();
    const measured = size !== undefined && size.width > 0 && size.height > 0;
    const width = measured ? size.width : FALLBACK_WIDTH;
    const height = measured ? size.height : FALLBACK_HEIGHT;

    const bounds = extent(data) ?? [0, 1];
    const valueBounds: readonly [number, number] =
      domain ??
      (variant === "bar"
        ? [Math.min(0, bounds[0]), Math.max(0, bounds[1])]
        : bounds);
    const y = scaleLinear(valueBounds, [height - PADDING, PADDING]);
    const lastIndex = data.length - 1;
    const x = scaleLinear(
      [0, Math.max(1, lastIndex)],
      [PADDING, width - PADDING],
    );
    const segments = definedSegments(data, (value, index) => ({
      x: data.length === 1 ? width / 2 : x(index),
      y: y(value),
    }));

    const summary = summarizeSeries(data);
    const markerIndexes = new Set<number>();
    if (variant !== "bar" && measured) {
      for (const marker of resolveMarkers(markers)) {
        const index =
          marker === "min"
            ? summary.minIndex
            : marker === "max"
              ? summary.maxIndex
              : marker === "first"
                ? data.findIndex(isFiniteValue)
                : lastDefinedIndex(data);
        if (index !== undefined && index >= 0) markerIndexes.add(index);
      }
    }

    const setRef = (node: HTMLDivElement | null) => {
      measureRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const motion = animate ? undefined : "none";
    const stroke = measured ? undefined : "non-scaling-stroke";

    return (
      <div
        {...props}
        ref={setRef}
        role={decorative ? undefined : "img"}
        aria-hidden={decorative ? true : undefined}
        aria-label={
          decorative ? undefined : describeSparkline(data, label, formatValue)
        }
        data-slot="sparkline"
        data-variant={variant}
        className={cn(sparklineRootClasses, className)}
        style={{
          ...style,
          ["--sparkline-color" as string]: resolveChartColor(color),
        }}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          className="absolute inset-0 size-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio={measured ? undefined : "none"}
        >
          {variant === "area" ? (
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
          ) : null}

          {variant === "bar"
            ? renderBars()
            : segments.map((points, i) =>
                points.length === 1 ? (
                  // A value isolated between gaps has no line; draw it as a dot.
                  // A zero-length round-capped stroke stays round when stretched.
                  <path
                    key={i}
                    data-slot="sparkline-point"
                    d={`M${points[0]!.x},${points[0]!.y}h0`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={4}
                    strokeLinecap="round"
                    vectorEffect={stroke}
                    className={fadeClasses}
                    style={{ animation: motion }}
                  />
                ) : (
                  <g key={i}>
                    {variant === "area" ? (
                      <path
                        data-slot="sparkline-area"
                        d={areaPath(points, height, curve)}
                        fill={`url(#${gradientId})`}
                        className={fadeClasses}
                        style={{ animation: motion }}
                      />
                    ) : null}
                    <path
                      data-slot="sparkline-line"
                      d={linePath(points, curve)}
                      pathLength={1}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect={stroke}
                      className={drawClasses}
                      style={{ animation: motion, strokeDasharray: motion }}
                    />
                  </g>
                ),
              )}

          {[...markerIndexes].map((index) => (
            <circle
              key={index}
              data-slot="sparkline-marker"
              cx={data.length === 1 ? width / 2 : x(index)}
              cy={y(data[index] as number)}
              r={3}
              fill="currentColor"
              stroke="var(--sparkline-surface)"
              strokeWidth={2}
              paintOrder="stroke"
              className={markerClasses}
              style={{ animation: motion }}
            />
          ))}
        </svg>
      </div>
    );

    function renderBars() {
      const band = scaleBand(
        data.map((_, index) => String(index)),
        [PADDING / 2, width - PADDING / 2],
        { paddingInner: 0.28, paddingOuter: 0 },
      );
      const barWidth = Math.min(band.bandwidth, 24);
      const offset = (band.bandwidth - barWidth) / 2;
      const baseline = y(Math.max(valueBounds[0], Math.min(0, valueBounds[1])));

      return data.map((value, index) => {
        if (!isFiniteValue(value)) return null;
        const d = barPath({
          x: band(String(index))! + offset,
          width: barWidth,
          baseline,
          value: y(value),
          radius: Math.min(2, barWidth / 2),
        });
        if (!d) return null;
        const muted = emphasis === "last" && index !== lastIndex;
        return (
          <path
            key={index}
            data-slot="sparkline-bar"
            data-emphasis={muted ? "muted" : undefined}
            d={d}
            fill="currentColor"
            fillOpacity={muted ? 0.38 : 1}
            className={growClasses}
            style={{
              animation: motion,
              animationDelay: animate ? `${index * 24}ms` : undefined,
            }}
          />
        );
      });
    }
  },
);

Sparkline.displayName = "Sparkline";
