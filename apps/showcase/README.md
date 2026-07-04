# @dethink/showcase

A Next.js App Router showcase for Dethink Components: live examples, copyable
usage code, installation steps, and props references for the documented
components (currently Button, Card, and Input).

## Highlights

- Consumes `@dethink/components` **source** via tsconfig paths (same approach
  as the Vite playground), so docs never lag behind an unbuilt dist.
- The teal brand is applied purely through the documented `--dt-*` token
  contract in `src/app/globals.css` — no component styles are forked.
- Every example's displayed code is read from the same file that renders the
  live preview (`src/examples/**`), so code and preview cannot drift.
- Light/dark/system color modes via `DethinkThemeScript` and a persisted
  toggle; code blocks are Shiki-highlighted.

## Commands

```sh
pnpm --filter @dethink/showcase dev    # http://localhost:3005
pnpm --filter @dethink/showcase build
pnpm --filter @dethink/showcase start
```

## Adding a component page

1. Add example files under `src/examples/<component>/`.
2. Add props metadata under `src/lib/props/<component>.ts`.
3. Add the page at `src/app/components/<component>/page.tsx` composed from
   `DocsPage`, `ExampleBlock`, `InstallationSection`, and `PropsTable`.
4. Register the component in `src/lib/components-meta.ts` (drives nav,
   catalog, and landing page).

## Manual acceptance checks

- Theme toggle: switch light/dark/system, reload — choice persists, no flash.
- Copy buttons: every code block copies its full snippet and announces
  "Code copied to clipboard" to screen readers.
- Keyboard: header nav, sidebar, theme toggle, and copy buttons are reachable
  and operable with visible focus rings.
