# Optional spring animation

`Switch` keeps its CSS transition by default. Add `spring` to animate the thumb
with Motion:

```tsx
<Switch spring aria-label="Enable notifications" />
```

`spring` is a boolean, defaults to `false`, and can change at runtime without
resetting checked state. It works with controlled or uncontrolled values, all
three sizes, density tokens, and RTL. The native input still owns keyboard
interaction, focus, form submission, and checked state; animation never delays
an update. Disabled and read-only switches do not toggle.

Motion is loaded through a dynamic import only when a spring switch renders.
The registry declares `motion` and includes the private thumb module. Consumers
installing from the registry need both files even if they initially use the
default transition. A static thumb preserves the checked appearance while the
module loads, and there is no entrance animation. With `prefers-reduced-motion:
reduce`, the thumb moves directly to its new position.

## Verification

- Component and axe tests cover native semantics, forms, controlled values,
  keyboard interaction, locked states, and changing the animation option.
- The Switch Storybook spring story checks pointer and Space toggling.
- `e2e/switch.spec.ts` samples actual movement and settling in Chromium,
  Firefox, WebKit, and mobile; it covers RTL, sizes, rapid toggles, reduced
  motion, and hydration errors.
- The consumer bundle check asserts that the initial Switch import excludes
  Motion and that the optional chunk contains the animation runtime.

Manual keyboard acceptance: Tab to a spring switch, confirm a visible focus
ring, press Space twice, and verify the stable label and checked announcement.
Repeat with reduced motion enabled; the thumb should change sides immediately.
