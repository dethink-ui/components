# Inspector

A compact, sectioned property panel for editing whatever is currently selected
in builder tools, admin consoles, and design surfaces. Install the `inspector`
registry item after the documented base setup, or import it from
`@dethink/components`.

```tsx
const [shape, setShape] = useState<InspectorValue | null>({
  name: "Hero card",
  layout: { width: 160, rotation: 0 },
  visible: true,
});

<Inspector
  aria-label="Shape properties"
  role="region"
  value={shape}
  onValueChange={(next, { path, value }) => setShape(next)}
>
  <InspectorSection title="Layout">
    <InspectorProperty path="name" label="Name">
      <InspectorText />
    </InspectorProperty>
    <InspectorProperty path="layout.width" label="Width">
      <InspectorNumber min={1} unit="px" />
    </InspectorProperty>
    <InspectorProperty path="visible" label="Visible">
      <InspectorSwitch />
    </InspectorProperty>
  </InspectorSection>
</Inspector>;
```

## Values and paths

`Inspector` is controlled and keeps no copy of your data. `value` is a plain
object, and `null` or `undefined` renders the empty state (override it with
`emptyState`). Each `InspectorProperty` reads its `path`, written in dot notation
such as `layout.width` or `points.0.x`. A commit calls
`onValueChange(next, { path, value })`, where `next` is an immutable copy.
Untouched branches keep their identity. Missing branches are created as objects,
and existing arrays are copied as arrays. Paths that use `__proto__`,
`constructor`, or `prototype` throw an error.

`getInspectorValue` and `setInspectorValue` are exported as pure helpers for
reading and writing the same paths outside the panel. Undo, redo, and
persistence belong to the host application.

## Anatomy and controls

- `Inspector`: the root. It is also the `@container/inspector` query container.
  Pass `selectionKey` (for example, the selected object's id) when `value` is
  rebuilt on renders that keep the same selection; otherwise a new `value`
  object counts as a new selection and discards unfinished drafts.
- `InspectorSection`: a heading with a disclosure button (`collapsible`,
  `defaultOpen`, `open`, `onOpenChange`, `headingLevel`, `actions`,
  `description`).
- `InspectorProperty`: a row pairing a label with a control (`path`, `label`,
  `description`, `disabled`, `readOnly`, `disabledReason`, `error`).
- `InspectorNumber`: a compact numeric field with the `spinbutton` role. It
  commits on Enter or blur, reverts on Escape, rounds to `precision` (by default,
  the number of decimals in `step`) without leaving `min`/`max`, and steps with the
  arrow keys. Home and End jump to the bounds. A typed trailing unit is accepted.
- `InspectorText`: a text field that commits on Enter or blur. It takes an
  optional `validate` function.
- `InspectorSwitch`: writes `true` or `false`.
- `InspectorSelect`: writes a string from `options`.
- `useInspectorProperty()`: connects a custom control. It returns `value`,
  `setValue`, `reportError`, the ids (`controlId`, `labelId`, `describedBy`), and
  the `disabled`, `readOnly`, and `invalid` states.

Invalid drafts (non-numeric text, or a message returned by `validate`) show an
error below the control and keep the previous value. A consumer `error` takes
precedence over errors that a control reports.

## Layout, theming and motion

Rows use a two-column label/control grid based on density tokens. The grid
stacks into one column when the panel is narrower than 17rem, so the same panel
works in drawers and on phones. Labels truncate visually but keep their full
text for assistive technology and in the `title` attribute. Styling uses
semantic tokens only and follows light, dark, density, and RTL settings.
Section disclosure animates `grid-template-rows` with a CSS transition, which is
skipped under reduced motion. Inspector itself does not import Motion. Motion
reaches the registry closure only through the Switch item's optional spring,
which is lazy-loaded.

## Accessibility

Each section's content is a `group` named by the section heading, so screen
readers announce the context when focus enters a section. Collapsed content is
`inert`. Labels name their controls, and descriptions, disabled reasons, and
errors are wired through `aria-describedby`. Number fields expose
`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and a value text that
includes the unit. Give the panel a name, for example `role="region"` with
`aria-label`.

Manual acceptance:

1. Tab through the panel. Order follows each section's triggers and controls
   from top to bottom. Collapsed sections skip their controls.
2. In a number field, the arrow keys step the value. Home and End jump to the
   bounds. Escape discards a draft, and Enter commits it.
3. With VoiceOver or NVDA, entering a section announces its name. Each control
   announces its label, unit, description, and any error.

## Verification

Unit tests cover the path helpers. Rendered tests cover commits, clamping,
stepping, validation, disabled reasons, section state, and the empty state.
Automated axe checks run on the open, collapsed, invalid, and empty states. An
SSR test and the `pnpm registry:smoke:inspector` clean-consumer install are also
included. Mixed values for multi-selection, and the segmented, colour, and
vector controls, will follow in the next slice.

## Migration

This is a new, additive component. It does not change the Input, NumberInput,
Select, Switch, or EmptyState APIs.
