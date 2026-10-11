import { forwardRef } from "react";
import { ChartLine } from "../chart/chart";
import {
  CartesianChart,
  valueAt,
  type CartesianChartProps,
  type ChartDatum,
} from "../chart/cartesian-chart";

export type { ChartDatum };

export type LineChartProps = CartesianChartProps;

export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(
  ({ animate = true, curve = "monotone", data, ...props }, ref) => (
    <CartesianChart
      {...props}
      ref={ref}
      data={data}
      kind="line"
      layout={(visible) => ({
        domainValues: data.flatMap((datum) =>
          visible.map((item) => valueAt(datum, item.key)),
        ),
        pointValue: (key, i) => valueAt(data[i], key),
        render: ({ x, y, active, highlighted }) =>
          visible.map((item) => (
            <ChartLine
              key={item.key}
              data-series={item.key}
              values={data.map((datum) => valueAt(datum, item.key))}
              x={x}
              y={y}
              color={item.colorVar}
              curve={curve}
              animate={animate}
              endMarker={active === undefined}
              dimmed={highlighted !== undefined && highlighted !== item.key}
            />
          )),
      })}
    />
  ),
);

LineChart.displayName = "LineChart";
