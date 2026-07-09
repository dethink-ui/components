# Accordion Component Spec

Status: Published to GitHub issue tracker.

Parent PRD: https://github.com/parveshh/dethink-components/issues/321.

Implementation issues: https://github.com/parveshh/dethink-components/issues/322 through https://github.com/parveshh/dethink-components/issues/326.

Package target: `@dethink/components`.

## Purpose

Accordion is a vertical rounded-blade disclosure component. Each item is a
rounded blade containing a trigger and its expanded content. It is distinct
from `HorizontalAccordion`, which is a fixed-height spatial layout with
horizontal expansion and a blade tray.

## Component Family

- `Accordion`: root state coordinator and Motion configuration boundary.
- `AccordionItem`: one blade/content pair bound to a stable `value`.
- `AccordionBlade`: native button trigger.
- `AccordionBladeIcon`: optional icon slot, Motion-rotated by open state.
- `AccordionBladeText`: optional text slot.
- `AccordionContent`: arbitrary expanded content inside the blade.

All parts support static-property usage and named exports.

## State Model

- `type="single"` is the default and accepts `value?: string`,
  `defaultValue?: string`, and `onValueChange?: (value: string | undefined) =>
  void`.
- `type="multiple"` accepts `value?: string[]`, `defaultValue?: string[]`, and
  `onValueChange?: (value: string[]) => void`.
- Single mode defaults `collapsible` to `true`; clicking the active blade
  closes it.
- `collapsible={false}` keeps the active blade open in single mode.
- Multiple mode toggles each blade independently.
- Root, item, and blade disabled state prevent activation.

## Semantics And Keyboard

- Blades are real `button` elements with `aria-expanded` and `aria-controls`.
- Content renders `role="region"` and `aria-labelledby` pointing to its blade.
- Closed content is hidden from assistive technology and unmounts children by
  default; `forceMount` keeps children mounted while hidden.
- Native button behavior handles Enter and Space.
- ArrowUp/ArrowDown move focus between enabled blades. Home and End move to the
  first and last enabled blades.
- If an externally controlled close removes content while focus is inside it,
  focus returns to the owning blade.

## Motion Contract

- Uses `motion/react` as a required runtime dependency.
- Root wraps children in `MotionConfig`.
- Content animates its own `height` between `0` and `auto` with overflow
  clipping, revealing a static inner panel without scaling or reflow jumps.
  Sibling items reflow through normal document flow as the panel grows.
- Blade icon rotation, hover scale, and tap scale use Motion.
- `motionPreset` supports `none`, `subtle`, `standard`, and `expressive`.
- Reduced motion disables transform-heavy movement while preserving visible
  open/closed state.

## Styling Contract

- Tailwind utilities use Dethink semantic tokens: background, foreground,
  muted, border, ring, primary, radius, shadow, density, and spacing.
- Public data attributes:
  - `data-slot="accordion"`
  - `data-slot="accordion-item"`
  - `data-slot="accordion-blade"`
  - `data-slot="accordion-blade-icon"`
  - `data-slot="accordion-blade-text"`
  - `data-slot="accordion-content"`
  - `data-state="open|closed"`
  - `data-disabled`
  - `data-motion-preset`
  - `data-orientation="vertical"`

## Registry Requirements

- Registry item name: `accordion`.
- Type: `registry:ui`.
- Runtime dependencies: `motion`.
- Registry dependencies: `dethink-base`.
- Files: component source, component barrel, and shared class merge helper.

## Testing Seams

- Rendered behavior tests for state, callbacks, disabled behavior, keyboard
  navigation, mounted content, and composition validation.
- Axe tests for mixed blade content, icon-only blades, disabled blades, and
  multiple-open mode.
- SSR smoke tests for closed and open server markup.
- Storybook stories for basic, multiple, controlled, disabled, icon-only,
  force-mounted, reduced-motion, dark mode, and density states.
- Registry validation and playground package smoke.

## Out Of Scope

- Horizontal layouts and tray behavior.
- URL/router state.
- Drag, resize, or reorder.
- CSS-only implementation.
