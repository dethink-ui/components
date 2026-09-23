# Slider

Horizontal numeric and two-thumb range input backed by React Aria. Install the
`slider` registry item after the documented base setup, or import `Slider` from
`@dethink/components`. No Motion dependency is needed for the basic registry item.

## Usage and anatomy

```tsx
<Slider label="Volume" defaultValue={40} name="volume" />
<Slider<[number, number]> label="Budget" defaultValue={[20, 80]} />
```

The root coordinates a label, output, track, fill and one or two thumbs. Use
`value`/`onValueChange` for controlled state; `defaultValue` for uncontrolled state.
`onValueCommit` reports completed adjustments. Numeric defaults are min 0, max 100,
step 1. Values must be finite; range pairs must be ascending. Do not switch between
scalar and range shapes after mounting. Use two names for independently named form
values, or one name to submit repeated values.

## Accessibility

Provide `label`, `aria-label`, or `aria-labelledby`. Range thumb labels default to
Minimum and Maximum and can be replaced with `thumbLabels`. Tab/Shift+Tab focus
thumbs; arrows adjust, Home/End reach bounds. Thumbs cannot cross. `description`
is associated with the control. `formatOptions` formats visible and spoken values.
Disabled sliders cannot change and are omitted from form submission.

## Theming and recipes

Semantic background, primary, muted, ring and border tokens support themes. Sizes
sm/md/lg change the visible track and thumb while keeping 44px targets. Override
root classes or `classNames` slots: track, fill, thumb, marks, output. Size variables
are `--dt-slider-track-height` and `--dt-slider-thumb-size`. RTL inherits from
DethinkProvider. Floating outputs appear on focus, hover or drag; a stable output
retains the full value when space is tight.

The showcase includes budget filtering, quarter-step precision and state examples.

## Testing and migration

Rendered tests cover callbacks, range limits, disabled, form values and keyboard
input. SSR/hydration and axe tests complement browser drag and responsive checks.
Manual acceptance: tab through thumbs, use arrows and Home/End, inspect both range
names with a screen reader, drag with touch in RTL, and verify high contrast.
This is a new component; existing inputs do not change. V1 excludes vertical
orientation, more than two thumbs, text entry and increment/decrement buttons.
