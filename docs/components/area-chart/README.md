# AreaChart

Volume over time on a single y-axis, as overlapping or stacked areas. Install
the `area-chart` registry item (it pulls in `chart` and `chart-core`) or import
`AreaChart` from `@dethink/components`. No chart library is installed.

```tsx
<AreaChart
  aria-label="MRR by plan"
  stacked
  data={[
    { month: "Jan", starter: 8_200, growth: 21_400 },
    { month: "Feb", starter: 8_600, growth: 22_100 },
  ]}
  index="month"
  series={[
    { key: "starter", label: "Starter" },
    { key: "growth", label: "Growth" },
  ]}
  formatOptions={{ style: "currency", currency: "USD" }}
/>
```

AreaChart shares LineChart's shell, so every LineChart prop works the same way:
series and color, scale, legend filtering, table view, keyboard readout and
states. See [LineChart](../line-chart/README.md). This page covers only what
differs.

## Anatomy

- **Wash**: a vertical gradient in the series token, strongest at the top of the
  plot and fading to near-transparent at the bottom. The gradient spans the
  whole plot, so equal values wash equally across series.
- **Edge**: a 2px line in the series color with a ringed end marker. All washes
  draw first and all lines on top, so no fill hides another series' edge.
- Legend, crosshair, tooltip and table are the same as LineChart.

## Overlapping and stacked

By default series overlap, each washing down to zero (clamped into the
y-domain). Keep overlapping charts to two or three series.

`stacked` puts each series on the one before it, using `stackSeries` from chart
core, so the top edge reads as the total and the y-domain covers the totals.
Positive values stack up and negative values stack down. Each fill runs from the
series line to the stack base it grows from, so when a series changes sign the
fill narrows to meet the line where it crosses that base, instead of spanning
both sides. Hidden series are left
out of the stack, and the rest restack without changing color.

The crosshair marks each series at its stacked edge, but the tooltip, readout
and table always show each series' own value.

## Gaps

Overlapping areas leave a gap in both the wash and the line where a value is
missing; an isolated value draws as a dot. In a stacked chart a missing value
stacks as zero so the bands above stay continuous, and it reads as "no value"
in the tooltip and readout and "—" in the table.

## Theming

The wash uses the series color at `opacity` 0.24 at the top of the plot. Build a
custom chart with the `ChartArea` primitive to change it:

```tsx
<ChartArea values={values} x={x} y={y} color={colorVar} opacity={0.16} />
```

`baseline` takes one value for a flat floor or an array of lower values for
stacked bands.

## Accessibility

The same as LineChart. The plot is one tab stop with arrow, Home, End and Escape
keys, a polite live readout and a summary description. The data table is always
available to assistive technology. Washes are decorative, and the legend,
tooltip and table name every series.

## Testing

Rendered tests cover washes from the series token, overlapping gaps, stacked
crosshair positions and totals-based domain, restacking when a series is hidden,
raw values in the readout and table, clipping to the plot, and the shared
keyboard and table behavior. There are also axe and SSR tests, and Storybook
play tests for the keyboard, legend and table flows.
