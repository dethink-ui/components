# StatTile, KpiGroup and DeltaBadge

KPI building blocks for dashboards. Install `stat-tile` (it pulls in `delta-badge`,
`sparkline`, `skeleton` and `chart-core`) or `delta-badge` on its own, or import
from `@dethink/components`. No chart library is installed.

```tsx
<KpiGroup aria-label="Workspace health" variant="joined">
  <StatTile
    label="Monthly recurring revenue"
    value={128_430}
    formatOptions={{ style: "currency", currency: "USD" }}
    delta={8.2}
    comparison="vs last month"
    trend={[92, 96, 101, 104, 109, 113, 118, 128]}
  />
  <StatTile
    label="API p95 latency"
    value={182}
    formatValue={(v) => `${v} ms`}
    delta={{ value: 6.5, positiveDirection: "down" }}
    comparison="vs last week"
    trendColor="chart-7"
  />
</KpiGroup>
```

## StatTile anatomy

Label (sentence case, muted) → value (semibold, proportional figures, compact
formatting such as 1,284 · 12.9K · $4.2M) → delta and comparison → optional
caption → trend. `trendPlacement="end"` puts a compact sparkline beside the value.
Strings render as given; `null` shows a dash so a missing value is never
mistaken for zero.

Tiles are `role="group"` named by the label. `href` renders the whole tile as a
link. For router links, wrap the tile and set `interactive` for matching hover
and focus styles. `loading` swaps content for skeletons, keeps the size, and sets
`aria-busy`.

## KpiGroup

A CSS grid using `repeat(auto-fit, minmax(min(100%, minTileWidth), 1fr))`, so rows
wrap without breakpoints and tiles stretch to fill each row. `variant="joined"`
frames the row as one panel: every tile draws start and top hairlines and is
pulled 1px under the frame, so only the dividers between tiles remain at any
wrap point. Dividers mirror in RTL.

## RTL

Tiles, dividers and delta rows mirror. Formatted numbers and signed deltas are
isolated as left-to-right text, so `+3.1%` and `182 ms` never reorder; string
values use `dir="auto"`. Sparklines keep time running left to right.

## DeltaBadge

The direction comes from the sign; the meaning also depends on
`positiveDirection`. Use `"down"` for churn, latency, cost and errors, so a rise
reads as a regression. Changes within `neutralThreshold` read as flat.
Positive meaning uses the success tone, negative uses destructive, and flat uses
neutral. Text stays in the foreground color; only the tint and the arrow icon
carry status color, so the value always meets text contrast.

Direction is never color-only: an arrow icon and a sign (a true minus, U+2212)
are always shown. Screen readers hear one sentence, such as "Down 0.8% vs last
month", built from `formatValue` and `comparison`. The default formatter treats
`value` as percentage points.

## Testing

Unit and rendered tests cover the direction × meaning matrix, thresholds,
missing data, formatters, variants, compact values, loading, links, trend naming
and KpiGroup. There are also axe and SSR tests.
