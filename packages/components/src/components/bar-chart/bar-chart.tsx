import { forwardRef } from "react";
import { ChartBars } from "../chart/chart";
import {
  CartesianChart,
  valueAt,
  type CartesianChartProps,
  type CartesianLayout,
  type ChartDatum,
} from "../chart/cartesian-chart";
import { isFiniteValue, stackSeries } from "../chart/chart-core";

export type { ChartDatum };

export interface BarChartProps extends Omit<
  CartesianChartProps,
  "curve" | "includeZero"
> {
  /**
   * Stack series in one bar per index so its end reads as the total.
   * Positive values stack up and negative values down.
   */
  stacked?: boolean;
  /** Largest bar (or group) thickness in pixels. At most 24. */
  maxBarWidth?: number;
}

/** Surface gap between adjacent bars and between stacked segments. */
const GAP = 2;
const MAX_BAR_WIDTH = 24;
// Share of each index's slot that bars may fill; the rest separates groups.
const SLOT_FILL = 0.72;

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      animate = true,
      data,
      maxBarWidth = MAX_BAR_WIDTH,
      stacked = false,
      ...props
    },
    ref,
  ) => (
    <CartesianChart
      {...props}
      ref={ref}
      data={data}
      kind="bar"
      xLayout="band"
      // Bar length encodes the value, so the axis always starts at zero.
      includeZero
      data-stacked={stacked ? "" : undefined}
      layout={(visible): CartesianLayout => {
        const keys = visible.map((item) => item.key);
        const bands = stacked
          ? stackSeries(data, keys, valueAt).map((band) => band.values)
          : undefined;
        const raw = (s: number, i: number) => valueAt(data[i], keys[s]!);
        // The segment end away from zero, where its data-end sits.
        const edge = (s: number, i: number) => {
          const band = bands![s]![i]!;
          return (raw(s, i) ?? 0) < 0 ? band[0] : band[1];
        };
        const base = (s: number, i: number) => {
          const band = bands![s]![i]!;
          return (raw(s, i) ?? 0) < 0 ? band[1] : band[0];
        };
        // A stacked segment is outermost when no later series extends its side.
        const outermost = (s: number, i: number) => {
          const sign = Math.sign(raw(s, i) ?? 0);
          return !keys.some(
            (_, later) => later > s && Math.sign(raw(later, i) ?? 0) === sign,
          );
        };

        // Bars and gaps always fit inside the slot: dense charts first lose
        // the gaps between grouped bars, then bars go below 1px, rather than
        // spilling into the neighbouring category.
        const geometry = (step: number) => {
          const slot = step * SLOT_FILL;
          const count = bands ? 1 : Math.max(1, keys.length);
          const gap =
            count > 1 ? Math.min(GAP, (slot * 0.25) / (count - 1)) : 0;
          const barWidth = Math.min(
            Math.min(maxBarWidth, MAX_BAR_WIDTH),
            (slot - gap * (count - 1)) / count,
          );
          return {
            gap,
            barWidth,
            groupWidth: barWidth * count + gap * (count - 1),
          };
        };

        return {
          markHalfWidth: (step) => geometry(step).groupWidth / 2,
          domainValues: bands
            ? bands.flatMap((band) => band.flat())
            : data.flatMap((datum) => keys.map((key) => valueAt(datum, key))),
          pointValue: (key, i) => {
            const s = keys.indexOf(key);
            if (!isFiniteValue(raw(s, i))) return null;
            return bands ? edge(s, i) : raw(s, i);
          },
          render: ({ x, step, y, highlighted, hovered }) => {
            const { gap, barWidth, groupWidth } = geometry(step);
            const dimmed = (key: string) => {
              const focus = highlighted ?? hovered;
              return focus !== undefined && focus !== key;
            };

            return visible.map((item, s) => (
              <ChartBars
                key={item.key}
                data-series={item.key}
                values={data.map((_, i) => (bands ? edge(s, i) : raw(s, i)))}
                baseline={bands ? data.map((_, i) => base(s, i)) : undefined}
                inset={bands ? (i) => (base(s, i) !== 0 ? GAP : 0) : undefined}
                rounded={bands ? (i) => outermost(s, i) : true}
                x={(i) =>
                  x(i) - groupWidth / 2 + (bands ? 0 : s * (barWidth + gap))
                }
                width={barWidth}
                y={y}
                color={item.colorVar}
                animate={animate}
                dimmed={dimmed(item.key)}
              />
            ));
          },
        };
      }}
    />
  ),
);

BarChart.displayName = "BarChart";
