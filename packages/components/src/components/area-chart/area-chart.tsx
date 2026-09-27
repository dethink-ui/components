import { forwardRef } from "react";
import { ChartArea, ChartLine } from "../chart/chart";
import {
  CartesianChart,
  valueAt,
  type CartesianChartProps,
  type CartesianLayout,
  type ChartDatum,
} from "../chart/cartesian-chart";
import { isFiniteValue, stackSeries } from "../chart/chart-core";

export type { ChartDatum };

export interface AreaChartProps extends CartesianChartProps {
  /**
   * Stack series so the top edge reads as the total. Positive values stack
   * up and negative values down; a missing value stacks as zero.
   */
  stacked?: boolean;
}

export const AreaChart = forwardRef<HTMLDivElement, AreaChartProps>(
  (
    { animate = true, curve = "monotone", data, stacked = false, ...props },
    ref,
  ) => (
    <CartesianChart
      {...props}
      ref={ref}
      data={data}
      kind="area"
      data-stacked={stacked ? "" : undefined}
      layout={(visible): CartesianLayout => {
        const keys = visible.map((item) => item.key);
        // Bands in value space: [lower, upper] per index, or the raw value
        // over the shared floor when overlapping.
        const bands = stacked
          ? stackSeries(data, keys, valueAt).map((band) => band.values)
          : undefined;
        // The edge that carries the series line (away from zero) and the
        // stack base it grows from. A fill between these two, rather than
        // between each band's lower and upper bound, stays bounded by the line
        // when a series changes sign.
        const edge = (s: number, i: number) => {
          const band = bands?.[s]?.[i];
          if (!band) return valueAt(data[i], keys[s]!);
          return (valueAt(data[i], keys[s]!) ?? 0) < 0 ? band[0] : band[1];
        };
        const base = (s: number, i: number) => {
          const band = bands![s]![i]!;
          return (valueAt(data[i], keys[s]!) ?? 0) < 0 ? band[1] : band[0];
        };

        return {
          domainValues: bands
            ? bands.flatMap((band) => band.flat())
            : data.flatMap((datum) => keys.map((key) => valueAt(datum, key))),
          pointValue: (key, i) => {
            const s = keys.indexOf(key);
            return isFiniteValue(valueAt(data[i], key)) ? edge(s, i) : null;
          },
          render: ({ x, y, active, highlighted }) => {
            const dimmed = (key: string) =>
              highlighted !== undefined && highlighted !== key;
            const edges = visible.map((_, s) =>
              data.map((__, i) => edge(s, i)),
            );
            return (
              <>
                {/* Every wash first, so no fill covers another series' line. */}
                {visible.map((item, s) => (
                  <ChartArea
                    key={item.key}
                    data-series={item.key}
                    values={edges[s]!}
                    baseline={
                      bands ? data.map((_, i) => base(s, i)) : undefined
                    }
                    x={x}
                    y={y}
                    color={item.colorVar}
                    curve={curve}
                    animate={animate}
                    dimmed={dimmed(item.key)}
                  />
                ))}
                {visible.map((item, s) => (
                  <ChartLine
                    key={item.key}
                    data-series={item.key}
                    values={edges[s]!}
                    x={x}
                    y={y}
                    color={item.colorVar}
                    curve={curve}
                    animate={animate}
                    endMarker={active === undefined}
                    dimmed={dimmed(item.key)}
                  />
                ))}
              </>
            );
          },
        };
      }}
    />
  ),
);

AreaChart.displayName = "AreaChart";
