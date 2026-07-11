# CardScroller specification

CardScroller is a selectable, horizontally scrollable row of cards tracked by PRD [#415](https://github.com/parveshh/dethink-components/issues/415) and implementation issues [#416](https://github.com/parveshh/dethink-components/issues/416), [#417](https://github.com/parveshh/dethink-components/issues/417), and [#418](https://github.com/parveshh/dethink-components/issues/418).

## Installation

Install `card-scroller` from the Dethink registry. The registry item installs the Dethink base, Card, IconButton, and shared class utility. Package consumers can import `CardScroller`, `CardScrollerItem`, and their public types from `@dethink/components` and import `@dethink/components/styles.css` once at the application root.

## Anatomy

```tsx
<CardScroller aria-label="Choose a plan" defaultValue="team">
  <CardScrollerItem value="team" label="Team plan">
    <Card>{/* static card content */}</Card>
  </CardScrollerItem>
</CardScroller>
```

`CardScroller` owns the scroll-snap viewport and optional previous/next controls. Every direct `CardScrollerItem` owns a visually hidden radio, an absolute sibling label overlay, and exactly one direct Card. The Card remains exposed with its chosen `article`, `section`, or default `div` semantics.

## API

### CardScroller

| Prop              | Type                      | Default            | Purpose                                                                     |
| ----------------- | ------------------------- | ------------------ | --------------------------------------------------------------------------- |
| `value`           | `string`                  | —                  | Controlled selected value. An unmatched value leaves every item unselected. |
| `defaultValue`    | `string`                  | first enabled item | Initial uncontrolled value; invalid or disabled values fall back.           |
| `onValueChange`   | `(value: string) => void` | —                  | Reports explicit selection changes.                                         |
| `name`            | `string`                  | generated          | Native radio-group name.                                                    |
| `disabled`        | `boolean`                 | `false`            | Disables every item and navigation control.                                 |
| `maxVisibleCards` | `1 \| 2 \| 3 \| 4`        | `3`                | Maximum wide-container column count.                                        |
| `showControls`    | `boolean`                 | `true`             | Shows non-looping controls only while content overflows.                    |
| `previousLabel`   | `string`                  | `Previous card`    | Accessible name for the previous control.                                   |
| `nextLabel`       | `string`                  | `Next card`        | Accessible name for the next control.                                       |

The root also accepts standard `HTMLAttributes<HTMLDivElement>` except conflicting form attributes.

### CardScrollerItem

| Prop       | Type              | Required | Purpose                                                         |
| ---------- | ----------------- | -------- | --------------------------------------------------------------- |
| `value`    | `string`          | Yes      | Unique, stable native radio value and React identity.           |
| `label`    | `string`          | Yes      | Accessible label for the whole-card choice.                     |
| `disabled` | `boolean`         | No       | Removes the item from selection and native keyboard navigation. |
| `children` | one direct `Card` | Yes      | Static visual and semantic card content.                        |

## Selection, scrolling, and controls

Selection and scrolling are independent: manual scrolling never changes the checked radio. Selecting a card brings it into view. Initial selection aligns with `behavior: "auto"` so first paint never animates; later explicit or controlled changes use smooth scrolling unless reduced motion is requested. If dynamic children remove or disable an uncontrolled selection, the first enabled item becomes selected. Controlled unmatched values remain unselected.

The viewport uses native horizontal mandatory scroll snap in narrow containers and proximity snapping once multiple cards fit. Previous and next IconButtons move one logical item, never select, never loop, disable at scroll boundaries, and work in RTL. ResizeObserver and scroll geometry keep control state current without relying on scroll-snap events.

## Accessibility and keyboard behavior

- Give the root an accessible label with `aria-label` or `aria-labelledby`.
- Each item is a native radio connected by `htmlFor` to an absolute label overlay; the Card is a semantic sibling rather than label content.
- `Tab` enters the native radio group. Arrow keys move among enabled radios according to browser behavior and skip disabled choices. `Space` selects the focused radio.
- Focus visibly outlines the Card. The selected Card keeps a primary border and persistent emphasis.
- Previous and next controls are separately tabbable only while overflow exists and do not affect selection.
- Fine-pointer hover and keyboard focus spotlight one card and subtly de-emphasize siblings. Touch does not depend on hover.

## Responsive styling and theming

Container queries show one full-width item in narrow containers, up to two at medium widths, and `maxVisibleCards` at wide widths. Spacing follows density tokens; colors, borders, rings, and shadows use semantic theme variables. Light, dark, compact, comfortable, and RTL examples live in Storybook.

Reduced motion disables smooth scrolling, scale, animated blur, and transitions. Forced-colors mode removes blur, shadow, opacity reduction, and scale, then outlines selection with the system highlight color. CardScroller adds no Motion runtime.

## Testing

Rendered tests cover controlled and uncontrolled selection, invalid and disabled fallbacks, dynamic children, duplicate values, native disabled keyboard behavior, overlay markup, scroll behavior, and non-selecting controls. Axe covers the composed radio group; SSR tests verify stable markup and hydration. Storybook provides interaction coverage plus narrow, RTL, disabled, theme/density, reduced-motion reference, and forced-colors reference states. Registry validation, package/playground smoke checks, typechecking, and package and Storybook builds are release gates.

## Migration and limitations

CardScroller is additive and does not change Card or CardStack APIs. Use CardStack for a single active deck; use CardScroller when multiple cards remain horizontally browsable and one value is selected.

Nested interactive descendants inside an item Card are unsupported because the label overlay intentionally owns whole-card pointer interaction. Put actions outside CardScroller or choose a non-selectable scrolling composition. Values must remain unique and stable across renders. Browsers without container queries or ResizeObserver are outside the Baseline support policy; the one-column base layout and window-resize fallback remain usable.
