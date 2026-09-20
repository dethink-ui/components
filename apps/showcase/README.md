# @dethink/showcase

A Next.js App Router showcase for Dethink Components: live examples, copyable
usage code, installation steps, and props references for the documented
components. Start at `/docs` for setup and theming, or `/components` for the catalog.

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

## Brand themes

The header's palette picker switches the whole site between prebuilt brand
themes (teal, violet, rose, amber, ocean, forest). Each theme is:

- one entry in `src/lib/brand-themes.ts` (id, label, swatch), and
- one `[data-brand="<id>"]` block in `src/app/globals.css` that overrides only
  the documented `--dt-*` light/dark token pairs (primary, primary foreground,
  ring).

The selection is stored under `dethink-brand` in localStorage, applied as a
`data-brand` attribute on `<html>`, and restored before first paint by an
inline script in `src/app/layout.tsx`. Decorative visuals (hero glows, grid,
gradient headline, brand mark) derive from the resolved `--dt-color-primary`
via `color-mix()`, so they follow the active brand and color scheme with no
per-theme rules. Brand themes compose with the light/dark/system toggle.

To add a theme: append an entry to `brandThemes`, add the matching CSS block,
done. The default teal brand is the `:root` definition — visitors who never
touch the picker see exactly the original site.

## Adding a component page

1. Add example files under `src/examples/<component>/`.
2. Add props metadata under `src/lib/props/<component>.ts`.
3. Add the page at `src/app/components/<component>/page.tsx` composed from
   `DocsPage`, `ExampleBlock`, `InstallationSection`, and `PropsTable`.
4. Register the component in `src/lib/components-meta.ts` (drives nav,
   catalog, and landing page).

## Writing docs

- Follow this order: short description, installation, usage, examples, recipes
  when useful, and props. `InstallationSection` includes the usage section.
- Describe what someone can do with the component in one sentence. Keep the
  catalog summary, page introduction, and metadata description in sync.
- Use plain English: “Choose one option” instead of “single-selection primitive”.
  Explain technical terms when they help someone use the component.
- Keep examples small and give form fields visible labels. Example code is read
  from the file that renders its preview.
- Describe each prop’s effect. Keep names, types, allowed values, and defaults
  exact. Explain `value` as the current value managed by the app and `defaultValue`
  as the starting value managed by the component.
- Use `DocsSection` with a stable, unique `id`. `DocsPage` uses these sections
  to build the desktop contents list and mobile disclosure automatically.
- Keep installation instructions honest: this repository has no public npm
  package or registry URL yet. Document the local workspace setup until it does.

## Manual acceptance checks

- Theme toggle: switch light/dark/system, reload — choice persists, no flash.
- Brand picker: open with Enter/Space, arrow through themes, Enter selects,
  Escape closes and returns focus to the trigger; selection re-themes the page
  instantly, persists across reloads with no teal flash, and works in light
  and dark modes.
- Copy buttons: every code block copies its full snippet and announces
  "Code copied to clipboard" to screen readers.
- Keyboard: header nav, sidebar, theme toggle, and copy buttons are reachable
  and operable with visible focus rings.
