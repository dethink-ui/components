# Sparkline

A compact trend with no axes or chrome, for KPI tiles, table rows and lists.
Install the `sparkline` registry item after the documented base setup (it pulls in
`chart-core`), or import `Sparkline` from `@dethink/components`. No chart library
is installed.

```tsx
<Sparkline
  data={[42, 48, 45, 53, 51, 58, 64]}
  variant="area"
  color="chart-3"
  label="Weekly revenue"
  formatValue={(value) => `$${value}K`}
/>
```

## Anatomy

A sized `div` (`role="img"` with a generated summary) wraps an SVG. The line is
a 2px monotone curve that never overshoots the data. `area` adds a gradient wash,
and `bar` draws rounded bars from zero with every bar except the latest muted.
Markers carry a ring in the surface color (`--dt-chart-surface`, defaulting to the
background) so they stay readable on top of the line.

The root is `h-8 w-full` by default; size it with `className`. Before the first
client measurement (and on the server) the SVG stretches to fit, so the
container never jumps.

## Data

`data` is an ordered array of numbers. `null` and `undefined` leave a gap
instead of joining neighbours. The value range is the data extent, and bars
always include zero. Pass `domain` to put several sparklines on one shared scale.

## Chart palette

Colors come from `--dt-color-chart-1…8` (light and dark values per slot),
exposed to Tailwind as `chart-1…8`. Pass `color="chart-N"` or any CSS color.
Assign slots by series identity, never by rank. The default order passes
adjacent-pair colour-vision checks (worst ΔE 9.1 light / 8.4 dark, OKLab ×100)
and normal-vision separation (≥ 19). Aqua, yellow and magenta fall below 3:1
contrast on white, so pair them with visible labels or a table. Override the
`-light`/`-dark` variables to rebrand, and re-validate the palette when you do.

## Accessibility

The summary reads "Label: N values, from A to B; low C, high D". Use `label`
for the metric and period, and `formatValue` for units. Set `decorative` when
surrounding text already states the values. Entrance motion (stroke draw, fade,
bar growth) runs only under `prefers-reduced-motion: no-preference`, and
`animate={false}` turns it off entirely.

## Testing

Unit tests cover the chart core (scales, ticks, the no-overshoot curve,
stacking, bar paths, formatting). Rendered tests cover the summary, gaps,
markers, variants and colors. There are also axe and SSR tests.
