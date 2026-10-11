# BarChart

Grouped or stacked vertical bars on a single, zero-based y-axis. Install the
`bar-chart` registry item (it pulls in `chart` and `chart-core`) or import
`BarChart` from `@dethink/components`. No chart library is installed.

```tsx
<BarChart
  aria-label="Signups by channel"
  data={[
    { month: "Jan", organic: 1_240, paid: 610 },
    { month: "Feb", organic: 1_310, paid: 680 },
  ]}
  index="month"
  series={[
    { key: "organic", label: "Organic" },
    { key: "paid", label: "Paid" },
  ]}
/>
```

BarChart shares LineChart's shell, so series and color, legend filtering, table
view, keyboard readout, formatting and states work the same way. See
[LineChart](../line-chart/README.md). This page covers only what differs.
For a ranked list of categories with labels, use BarList instead.

## Anatomy

- **Slots**: each index gets an equal slot. Bars fill at most 72% of it, so
  groups stay visually separate.
- **Bars**: at most 24px thick (`maxBarWidth` lowers the cap), with 4px rounded
  data-ends and square baselines. Grouped bars have a 2px surface gap between
  them. Bars always fit inside their own slot: in dense charts the gaps
  between grouped bars shrink first, then the bars themselves, so a bar never
  spills into the next category. Past a few pixels per bar, stack the series or
  show fewer categories; there is no horizontal scrolling.
- **Highlight**: the active slot gets a muted background instead of a crosshair
  line.
- **Tooltip**: opens beside the bars, towards the side with more room, and
  never grows wider than that room, so it stays inside the chart. It lists
  every series. When the pointer is
  over a bar, that series' row is emphasised and the other series dim.

## Grouped and stacked

By default series sit side by side in each slot, in config order. A missing
value leaves its place in the group empty, so bars never shift.

`stacked` draws one bar per index. Positive values stack up and negative values
stack down from zero. Segments are separated by a 2px surface gap, and only the
outermost segment on each side has a rounded data-end. Hidden series are left
out of the stack without changing the others' colors. The tooltip, readout and
table always show each series' own value.

## Scale

The value axis always includes zero, because bar length encodes the value, so
BarChart has no `includeZero` prop. `yDomain` still fixes the domain, and bars
beyond it are clipped to the plot. There is no `curve` prop.

## Motion

Bars grow from the zero line on mount; stacked segments grow together. The
animation only runs under `prefers-reduced-motion: no-preference` and
`animate={false}` turns it off.

## Accessibility

The same as LineChart. The plot is one tab stop: Left/Right (or Down/Up) move
between categories, Home and End jump to the ends, and Escape clears the
highlight. Each move is announced politely with every series' value. Keyboard
focus reads the whole category; the per-bar emphasis is a pointer affordance
only. The data table is always available to assistive technology.

## Testing

Rendered tests cover grouped and stacked geometry, the 24px cap and
`maxBarWidth`, 2px gaps inside groups and between stacked segments, rounding
only the outermost segment, negative stacks, the zero-based axis, slot
highlight, per-bar tooltip emphasis and hover dimming, the keyboard readout and
table, and reduced motion. There are also axe and SSR tests, and Storybook play
tests for the keyboard, bar hover, legend and table flows.
