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
step 1. Values must be finite; range pairs must be ascending. Both endpoints are
clamped to the numeric bounds before range constraints are applied. Do not switch between
scalar and range shapes after mounting. Use two names for independently named form
values, or one name to submit repeated values.

## Stepper mode

Use `mode="stepper"` and `steps={[{value: 0, label: "Still"}, {value: 1,
label: "Steady"}, {value: 4, label: "Rapid"}]}`. Values must be finite and strictly
increasing, labels non-empty, and there must be at least two stops. Invalid
configurations throw a descriptive error. Numeric min/max/step are excluded in
this mode. A supplied off-stop value resolves to the nearest backing value (ties
choose the lower stop). Changing steps resolves the current numeric selection
against the new stop list, preserving it when available or choosing its nearest
remaining stop. This works for controlled and uncontrolled sliders.

Callbacks and named hidden form inputs use original values, while thumb inputs
use positional indices and announce readable labels. Stops are equally spaced.
`showLabel: false` hides text below an individual mark without changing its spoken
value. Prefer 3–7 concise labels on mobile; use endpoint-only labels for denser
scales. Selected markers and the active range receive a distinct fill. Range
thumbs share this same mapping and may meet without crossing.

## Accessibility

Provide `label`, `aria-label`, or `aria-labelledby`. Range thumb labels default to
Minimum and Maximum and can be replaced with `thumbLabels`. Tab/Shift+Tab focus
thumbs; arrows adjust, Home/End reach bounds. Thumbs cannot cross. `description`
is associated with the control. `formatOptions` formats visible and spoken values.
Without explicit digit options, formatting preserves the precision of `step` and
`min`, including small increments written in scientific notation.
Disabled sliders cannot change and are omitted from form submission.

## Theming and recipes

Semantic background, primary, muted, ring and border tokens support themes. Sizes
sm/md/lg/xl change the visible track and thumb while keeping 44px targets. Override
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

## Expressive presentation and XL

`size="xl"` uses a thick pill rail with a smaller inset thumb. The rail extends
past the travel endpoints, keeping the thumb contained at both bounds. The same
size works with numeric, range and stepper modes.

`variant="expressive"` adds static themed glow to the base Slider. For animation,
install `slider-expressive` and import `ExpressiveSlider`; this companion defaults
to the expressive variant and floating output, and adds spring compression while
dragging and a brief selected-milestone pulse. Pointer tracking is never sprung.
The base registry dependency graph excludes Motion. Reduced motion disables
compression and pulse; static state remains visible. The showcase's motion-speed
preview starts paused for reduced-motion users and can be explicitly played.

```tsx
<ExpressiveSlider
  label="Speed"
  mode="stepper"
  size="xl"
  steps={[
    { value: 0, label: "Still" },
    { value: 1, label: "Steady" },
    { value: 4, label: "Rapid" },
  ]}
  defaultValue={1}
/>
```

Full prop tables and copyable budget, precision, stepper, states and motion-speed
recipes are maintained on `/components/slider` in the showcase. Floating labels
show only the active thumb and retain the inline summary for both values.

Stepper clicks and keyboard changes glide over 180ms using the
`--dt-slider-snap-duration` token. Pointer dragging disables travel transitions,
so the snapped value never trails a spring. Reduced motion removes this glide.
