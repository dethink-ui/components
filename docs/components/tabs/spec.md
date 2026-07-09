# Tabs Spec

## Anatomy

- `Tabs`: root state provider and layout wrapper.
- `Tabs.List`: labelled `tablist` container.
- `Tabs.Trigger`: native button with `role="tab"`.
- `Tabs.Panel`: `tabpanel` associated to a trigger by generated IDs.

## API

- `Tabs`: `value`, `defaultValue`, `onValueChange`, `orientation`, `activationMode`, `loop`, `disabled`, `variant`, `size`, `motionPreset`.
- `Tabs.List`: standard div attributes, requires an accessible name through `aria-label` or `aria-labelledby`.
- `Tabs.Trigger`: `value`, `disabled`, native button attributes.
- `Tabs.Panel`: `value`, `forceMount`, standard div attributes.

Defaults:

- `orientation="horizontal"`
- `activationMode="automatic"`
- `loop={true}`
- `variant="pill"`
- `size="md"`
- `motionPreset="standard"`

## Behavior

- The selected trigger has `aria-selected="true"`, `data-selected="true"`, and `data-state="active"`.
- Inactive triggers have `aria-selected="false"` and `data-state="inactive"`.
- Triggers use roving tabindex. Disabled triggers are skipped.
- Horizontal tabs handle Left/Right and respect RTL.
- Vertical tabs handle Up/Down and expose `aria-orientation="vertical"`.
- Home and End focus the first and last enabled triggers.
- Automatic activation selects on focus. Manual activation focuses on arrows and selects on Enter/Space or click.
- Inactive panels unmount by default. `forceMount` keeps them in the DOM with `hidden`.

## Motion

- The active layer is a decorative child of the selected trigger.
- The active layer is `aria-hidden` and never replaces semantic state.
- Enabled motion uses Motion `layoutId` scoped to the root id.
- `motionPreset="none"` and user reduced-motion preference render a static layer.
- Root and active layer expose `data-motion-preset` and `data-reduced-motion`.

## Styling

Tabs uses semantic provider tokens only: background, foreground, muted,
muted-foreground, border, input, ring, primary, primary-foreground, spacing,
radius, and density utilities. Styling uses static Tailwind class maps and
logical spacing for RTL safety.

## Testing

Required seams: render, keyboard, motion, accessibility, SSR/hydration,
Storybook interaction, registry validation, registry smoke, package build, and
typecheck.
