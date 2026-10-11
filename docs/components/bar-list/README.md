# BarList

Ranked horizontal bars for "top N" views: pages, referrers, countries, plans,
endpoints. Install the `bar-list` registry item (it pulls in `chart-core`) or
import `BarList` from `@dethink/components`. No chart library is installed.

```tsx
<BarList
  aria-label="Top pages"
  data={[
    { label: "/", value: 12_940, href: "/analytics/pages/home" },
    { label: "/pricing", value: 5_320, href: "/analytics/pages/pricing" },
  ]}
  labelHeader="Page"
  valueHeader="Visitors"
  limit={5}
/>
```

## Anatomy

Each row is a list item: an optional icon and the label sit on top of the bar,
and the value is right-aligned in tabular figures. Bars are at most 24px thick, a
26% tint of the row color, so the label on top keeps full text contrast. The
baseline end is square and the data end is rounded 4px. Width is `value / max`; `max` defaults to the largest value.
Tiny non-zero values keep a 4px sliver, while zero and negative values draw no
bar. Long labels truncate with an ellipsis; the full string is in `title` and
in the accessible name.

## Sorting and limits

`sort` defaults to `"descending"`, and ties keep their input order. `"none"`
keeps the data order, for lists that are already ordered, such as funnel steps.
`limit` shows the first N rows behind a Show more button (`aria-expanded`,
`aria-controls`). Expansion is uncontrolled via `defaultExpanded`, or controlled
via `expanded` and `onExpandedChange`.

## Color

One series means one color: `color` (default `chart-1`) applies to every bar.
Use per-row `color` only for identity, such as a selected filter. Never color
by rank.

## Interaction

`href` renders a row as a link. `onItemClick` turns rows without an `href` into
buttons, for drill-down or filtering. Interactive rows have a hover wash and a
visible focus ring.

## RTL

Bars grow from the start edge, and rounded ends and caps mirror. Values stay
left-to-right.

## Testing

Rendered tests cover sorting (including ties), scaling, slivers and zero values,
formatting, colors, link and button rows, and controlled and uncontrolled
expansion. There are also axe and SSR tests, and a Storybook play test for Show
more.
