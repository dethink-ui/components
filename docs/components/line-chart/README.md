# LineChart

Multi-series trends on a single y-axis. Install the `line-chart` registry item
(it pulls in `chart` and `chart-core`) or import `LineChart` from
`@dethink/components`. No chart library is installed.

```tsx
<LineChart
  aria-label="Revenue vs spend"
  data={[
    { month: "Jan", revenue: 42_100, expenses: 31_200 },
    { month: "Feb", revenue: 44_800, expenses: 32_100 },
  ]}
  index="month"
  series={[
    { key: "revenue", label: "Revenue" },
    { key: "expenses", label: "Expenses" },
  ]}
  formatOptions={{ style: "currency", currency: "USD" }}
/>
```

## Anatomy

- **Legend** (two or more series): toggle buttons keyed with a short line in
  the series color. Hovering or focusing one dims the other lines.
- **Plot**: solid hairline grid, muted tabular tick labels, 2px lines with a
  ringed end marker, and a crosshair with ringed dots at the active index.
- **Tooltip**: every visible series at the active index. Values lead, and series
  names follow in muted text.
- **Table**: the same data as a table, visually hidden until Table view is on.

## Series and color

`series` is `{ key, label, color? }[]`. `color` is a palette slot
(`"chart-1"` … `"chart-8"`) or any CSS color. Without one, a series takes the
slot for its position in the config, not in the visible set, so hiding a series
never repaints the others. More than 8 series is out of scope: fold the tail
into "Other" or use small multiples. There is no second y-axis; put measures
with different scales in separate charts.

## Scale

The y-domain covers the visible series, is niced to round ticks, and includes
zero unless `includeZero={false}`. `yDomain` fixes it. X positions are evenly
spaced by index, and tick labels thin out to fit the width. Non-numeric values
leave gaps, and an isolated value draws as a dot.

## Keyboard and screen readers

The plot is one tab stop. Focus lands on the latest point; Left/Right (or
Down/Up) move one point, Home and End jump to the ends, and Escape clears the
crosshair. Each move is announced politely, for example
`Mar: Revenue $43,900, Expenses $34,800`. The plot is described by a summary of
its series and range, and the table is always available to assistive technology.

## States

`data={[]}` shows `emptyLabel`. `loading` with no data shows `loadingLabel`;
`loading` with data keeps the previous render at reduced opacity and sets
`aria-busy`.

## Primitives

Build other charts from the same parts: `ChartContainer` (measures itself and
maps `series` to CSS variables; read them with `useChart()` or a render
function), `ChartGrid`, `ChartAxis`, `ChartLine`, `ChartCrosshair`,
`ChartTooltip`, `ChartLegend` and `ChartDataTable`. Scales and paths come from
`chart-core`.

## Limits

About 2,000 points per chart; there is no canvas rendering or virtualization.
Tick labels are sized before measuring text, so very long formatted values may
need a custom `formatValue`. The chart renders left-to-right in RTL layouts.

## Testing

Rendered tests cover series colors from config, stable colors when filtering,
the automatic legend, hover dimming, the keyboard crosshair and live readout,
the tooltip, the table view, formatting, and empty, loading and refetch states.
There are also axe and SSR tests, and Storybook play tests for the keyboard,
legend and table flows.
