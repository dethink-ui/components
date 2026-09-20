# ShaderHeroText verification

Verified locally on 2026-09-19 in `/private/tmp/dethink-shader-hero`.
Implementation covers PRD #462 and its implementation issues #463–#468, including
all six showcase examples and navigation. These results describe local builds;
they do not establish the status of a hosted deployment.

## Passing checks

| Surface                                        | Result                                                                                         |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Component and existing HeroTextAnimation tests | 78 passed across six test files; 13 cover the new component                                    |
| Real-browser tests                             | 36 passed: 12 each in Chromium, Firefox, and WebKit                                            |
| TypeScript                                     | Component package, showcase, and Storybook passed                                              |
| Scoped ESLint                                  | No errors or warnings in changed code                                                          |
| Registry validation                            | 86 items passed                                                                                |
| Clean registry consumer                        | Copied dependency closure, installed dependencies, TypeScript and Vite production build passed |
| Component package                              | Vite build and declaration generation passed                                                   |
| Bundle budgets                                 | Button, Tabs, NavDock passed; Button excludes shader implementation                            |
| Playground                                     | Vite production build passed                                                                   |
| Storybook                                      | Production build passed                                                                        |
| Next.js showcase                               | Full webpack production build, TypeScript and page generation passed                           |
| Patch whitespace                               | `git diff --check` passed                                                                      |

The same 36 browser checks passed against both development and production servers;
the final production run completed in 2.1 minutes. The browser suite reads actual
WebGL pixels, verifies pointer attraction and exact
pixel-pattern restoration, and counts zero GPU draws after particles settle.
It covers re-entry, five distinct one-shot shaders, stable final layout, dark/static
controls, context loss/restoration, offscreen disposal, reduced motion, forced colors,
axe, mobile touch fallback, edited copy, changed fonts, resized layout and absent WebGL.

Additional Chromium checks passed with JavaScript disabled, keyboard activation of
the Static control, and Arabic RTL particle text. At 200% CSS zoom, readable HTML
fallback remained visible without overflow in the preview. CSS zoom is not a claim
of testing every browser's native zoom implementation.

## Production build and limits

The full Next.js showcase production build passes. The feedback loading example
now declares a client boundary, matching the hook-based components it imports.
The shared brand logo imports the class utility directly instead of pulling the
component barrel into its server module. These changes resolve the existing
server/client import failures encountered while validating the new showcase.

No physical-device GPU benchmark or manual screen-reader session was performed.
Chromium tests allow SwiftShader; results establish behavior, not a guaranteed
hardware frame rate. Storybook and playground emit non-fatal existing bundle-size
and module-directive warnings.

## Reproduce

From the repository root:

```sh
pnpm --filter @dethink/components exec vitest run src/components/shader-hero-text src/components/hero-text-animation
pnpm test:shader-hero
pnpm registry:smoke:shader-hero
node scripts/validate-registry.mjs
pnpm --filter @dethink/components build
pnpm --filter @dethink/components test:bundle
```

The dedicated Playwright configuration starts the showcase on port 5279 or uses
an existing server there. The review route is `/components/shader-hero-text`.
The showcase presents particle follow first, then the five one-shot effects.
