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

### Spinner loaders

`Spinner` supports `ring`, `dots`, `bouncing-dot`, and `moving-rings`. Bouncing dot grows as it rises and shrinks as it falls, using a 900ms CSS loop. Moving rings uses two concentric open arcs rotating in opposite directions over 1400ms. Override `--dt-spinner-bounce-duration` or `--dt-spinner-rings-duration` through the normal CSS cascade to adjust their pace. Every size from `xs` to `xl` uses the same bounded motion and semantic tone tokens.

```tsx
<Spinner variant="bouncing-dot" label="Preparing workspace" tone="primary" />
<Spinner variant="moving-rings" label="Syncing records" size="lg" />
```

The bouncing dot casts a small rounded shadow. Its blur and spread increase as the ball rises, while its opacity decreases with a subtle depth shift; the shadow tightens on descent. Ball and shadow share the same duration and easing. Reduced motion leaves both static.

Import `@dethink/components/styles.css` for package usage. Registry users install `spinner` (or `feedback-states`) with its `dethink-base` dependency and import the copied `components/dethink/styles.css`; the bounce keyframes ship in that stylesheet. No animation runtime or migration is required; `ring` remains the default.

Use `label` or `aria-label` for a standalone status. With adjacent visible loading text, leave the spinner decorative and put `role="status"` on the text's container. The application owns `aria-busy` on the region being updated and announces completion. Spinners have no keyboard interaction and must not take focus. They convey indeterminate activity, not a percentage; use Progress for measured completion and Skeleton for content placeholders.

Reduced motion stops movement and retains a visible static shape. Browser coverage in `e2e/spinner-loaders.spec.ts` checks actual bounce geometry, size containment, static reduced motion, theme/direction states and screenshots. Rendered, axe and SSR/hydration tests live with Spinner.

Spatial transitions use `motion-safe` or the component's existing reduced-motion path. State, focus, labels, and keyboard behavior remain available without animation. The motion browser suite covers actual intermediate Switch/Dialog frames, RTL, loading geometry, immediate Escape/focus restoration, reduced-motion hydration, and mobile accessibility checks.

Run component tests, build the package, then run its `test:bundle` script. `e2e/showcase-component-motion.spec.ts` exercises the showcase; `Button / LoadingTransition` provides a Storybook interaction example. Registry validation and smoke checks verify copied utility dependencies.

Package builds retain separate internal component modules and externalize declared dependencies so consumer bundlers can discard unused widgets. Public imports remain `@dethink/components` and `@dethink/components/styles.css`. Internal `dist` paths are not public exports. This follows [Vite library-build guidance](https://github.com/vitejs/vite/blob/v7.3.1/docs/guide/build.md#library-mode) and [Rollup module-preservation guidance](https://rollupjs.org/configuration-options/#output-preservemodules).

Consumer bundle probes exclude React and the separately exported CSS, while including the components' other retained runtime dependencies. They are byte regression checks, not frame-rate claims; physical-device profiling remains necessary before setting device-specific animation budgets.
