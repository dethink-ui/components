# Shader background verification

Verified 2026-09-19 in `/private/tmp/dethink-shader-backgrounds`.
All five named components, individual showcase routes and the collection overview
are implemented. These results describe local builds and do not establish the
status of a hosted deployment.

## Passing checks

| Check                           | Result                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Component tests                 | 11 new tests passed: deterministic SSR/hydration, native refs/events, foreground content, axe and buffer limits |
| Existing shader hero regression | 13 tests passed alongside the new tests; 24 total                                                               |
| Final production browser suite  | 36 checks passed across Chromium, Firefox and WebKit in 46.4 seconds, including live OS theme color refresh     |
| TypeScript                      | Component package, showcase and Storybook passed                                                                |
| Scoped ESLint                   | No errors or warnings                                                                                           |
| Registry validation             | 91 items validated                                                                                              |
| Clean registry installation     | All five items, 20 copied files; actual dependency install, typecheck and Vite production build passed          |
| Package                         | Vite and declaration build passed                                                                               |
| Button-only tree shaking        | Shader code excluded; Button, Tabs and NavDock bundle budgets passed                                            |
| Storybook                       | Production build passed                                                                                         |
| Playground                      | Vite production build passed                                                                                    |
| Showcase                        | Full Next.js webpack production build, typecheck and prerendering passed, including all six new routes          |

Tests sample actual GPU pixels inside draw calls, without enabling preserved drawing
buffers. They check spatial color variation and motion, pause/resume without a live
canvas, foreground button/keyboard behavior, theme changes, pointer parallax, resize,
context loss/recovery, offscreen/hidden disposal, mobile overflow, reduced motion,
forced colors, print lifecycle, absent WebGL/JavaScript and axe. Dark and light
screenshots of every material were captured; the distinct shapes were visually reviewed.

The collection is `/components/shader-backgrounds`. Detail routes are
`/components/liquid-mesh-background`, `/components/silk-flow-background`,
`/components/caustic-light-background`, `/components/contour-field-background`,
and `/components/orbital-glow-background`.

## Limits

Tests use desktop browser engines and emulated touch/viewport settings. Chromium
allows SwiftShader. No physical-device frame-rate guarantee or manual screen-reader
session is claimed. Static CSS approximates the materials; it is not a frozen GPU
frame. Non-fatal bundle-size and module-directive warnings exist in the broader
playground/Storybook builds.

## Reproduce

```sh
pnpm --filter @dethink/components exec vitest run src/components/shader-backgrounds src/components/shader-hero-text
pnpm test:shader-backgrounds
pnpm registry:validate
pnpm registry:smoke:shader-backgrounds
pnpm --filter @dethink/components build
pnpm --filter @dethink/components test:bundle
pnpm --filter @dethink/showcase exec next build --webpack
```

The browser configuration starts a showcase on port 5280 or uses an existing one.
