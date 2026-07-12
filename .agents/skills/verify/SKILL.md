---
name: verify
description: Runtime verification recipe for Dethink Components — launch an app surface and drive a component in a real browser.
---

# Verifying component changes at runtime

Fastest surface for a component change is the Vite playground (every
component has a smoke block in `apps/playground-vite/src/App.tsx`):

```sh
pnpm --filter @dethink/playground-vite dev --port 5199 --strictPort
```

The showcase docs app (`pnpm --filter @dethink/showcase dev`, port 3005)
is the surface for docs-page/example changes; Storybook
(`apps/storybook`) for story/play changes.

Drive with Playwright headless. Playwright is not a root dependency —
import it by its pnpm path (check the version under `node_modules/.pnpm`):

```js
import { chromium } from "/<repo>/node_modules/.pnpm/playwright@<version>/node_modules/playwright/index.mjs";
```

Gotchas learned:

- Background components animate via Motion inline styles; observe them by
  sampling `element.style.transform` over time, not by screenshot diffing.
- Beam translate percentages are relative to the beam's own length (30% of
  the rail). Pointer-fraction → expected translate:
  `((fraction - 0.15) * 100) / 0.3`.
- Components gate animation on hydration + IntersectionObserver, so
  `scrollIntoViewIfNeeded()` the component and wait ~500ms before sampling.
- Use `page.mouse.move(x, y, { steps: n })` for pointer-driven behavior;
  moving the mouse outside the component's box fires `pointerleave`.
