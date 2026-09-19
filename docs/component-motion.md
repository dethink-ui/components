# Component motion

Everyday controls use short CSS transitions. Existing navigation, disclosure, gesture, and decorative components retain their Motion presets. No new runtime dependency is required for Button, IconButton, Checkbox, RadioGroup, Switch, or Dialog.

## Timing and theming

The base stylesheet supplies these CSS variables:

| Variable               | Default                         | Use                                  |
| ---------------------- | ------------------------------- | ------------------------------------ |
| `--dt-motion-press`    | `100ms`                         | Button press acknowledgment          |
| `--dt-motion-fast`     | `160ms`                         | Control colors, checks, and feedback |
| `--dt-motion-standard` | `220ms`                         | Dialog and positioned-popup entrance |
| `--dt-motion-exit`     | `140ms`                         | Dialog and positioned-popup exit     |
| `--ease-control`       | `cubic-bezier(0.16, 1, 0.3, 1)` | Controlled ease-out                  |
| `--dt-overlay-scrim`   | `rgb(0 0 0 / 0.45)`             | Dialog and Drawer dimming            |

These can be overridden through the normal CSS cascade or provider `style`. For portaled overlays, place overrides on `DethinkProvider` so its portal receives them. Existing component-specific presets continue to control larger motion. Switch travel uses 180ms and Progress uses 300ms.

## Interaction behavior

- Button holds its last idle content width during loading, including label changes. Text-only buttons crossfade their label to a centered spinner; buttons with a leading icon replace that icon. The label remains accessible. Initially loading buttons use their supplied content for sizing; use a consumer width class when space must be reserved before any idle render.
- Button and IconButton compress slightly on press. Attached ButtonGroup controls keep adjoining edges stationary. Disabled controls do not animate a press.
- Switch uses numeric translation with RTL direction. Checkbox and RadioGroup keep indicator layers mounted for short opacity/scale changes.
- Dialog and AlertDialog use explicit entrance and exit keyframes. Their semantic dialog panel receives focus, enabling Escape immediately. The scrim dims consistently in light and dark themes.
- Select, Combobox, and MultiSelect use the existing overlay lifecycle for entry and exit. Errors, async statuses, and chips receive short entrance feedback. Chip removal retains the existing immediate focus behavior.
- Only Card roots rendered as links or buttons receive hover elevation. Static reading surfaces remain steady. CardStack no longer reserves GPU layers permanently.
- Calendar fades its existing month/view panel without remounting cells. Progress translates a clipped fill instead of animating width, including RTL. Table sort arrows transition opacity.
- Tabs keeps panel structure stable across hydration and motion-preference changes. Turning motion off does not discard panel input state or focus.
- Decorative backgrounds share one visibility subscription and stop their animated subtree while the document is hidden, in addition to their existing offscreen and reduced-motion handling.

## Accessibility and verification

Spatial transitions use `motion-safe` or the component's existing reduced-motion path. State, focus, labels, and keyboard behavior remain available without animation. The motion browser suite covers actual intermediate Switch/Dialog frames, RTL, loading geometry, immediate Escape/focus restoration, reduced-motion hydration, and mobile accessibility checks.

Run component tests, build the package, then run its `test:bundle` script. `e2e/showcase-component-motion.spec.ts` exercises the showcase; `Button / LoadingTransition` provides a Storybook interaction example. Registry validation and smoke checks verify copied utility dependencies.

Package builds retain separate internal component modules and externalize declared dependencies so consumer bundlers can discard unused widgets. Public imports remain `@dethink/components` and `@dethink/components/styles.css`. Internal `dist` paths are not public exports. This follows [Vite library-build guidance](https://github.com/vitejs/vite/blob/v7.3.1/docs/guide/build.md#library-mode) and [Rollup module-preservation guidance](https://rollupjs.org/configuration-options/#output-preservemodules).

Consumer bundle probes exclude React and the separately exported CSS, while including the components' other retained runtime dependencies. They are byte regression checks, not frame-rate claims; physical-device profiling remains necessary before setting device-specific animation budgets.
