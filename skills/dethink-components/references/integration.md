# Installation and styling

Check the current installation documentation and the consumer's existing setup
before changing dependencies. The public registry serves component source; the
npm package is not published yet. Installing this skill does not install components.

## Public registry

For an existing React + Tailwind CSS v4 app configured for shadcn, use a verified
item from `https://components.dethink.co.uk/r/registry.json`:

```sh
npx shadcn@latest add https://components.dethink.co.uk/r/button.json
```

The installer copies files into `components/dethink/` at the project root and
installs the declared dependencies. Import from these copied paths, import the
copied `styles.css` once, and use the copied `DethinkProvider`. Preserve a client
component boundary for interactive Next.js usage. Do not use workspace package
imports in an app that only has copied source.

The optional `@dethink` shorthand requires this entry in the consumer's
`components.json` registries map:
`"@dethink": "https://components.dethink.co.uk/r/{name}.json"`.
Do not assume this namespace has already been configured.

## App inside the Dethink pnpm workspace

Add `"@dethink/components": "workspace:*"` to the consuming app's dependencies if
missing. From the library workspace root:

```sh
pnpm install
pnpm --filter @dethink/components build
```

The showcase and playground already alias the source; inspect their configuration
before adding a second installation. `workspace:*` is not an installation method
for an unrelated repository.

Import the stylesheet once at the app's global stylesheet/layout entry and use
the existing provider, or add one at the appropriate app boundary:

```tsx
import "@dethink/components/styles.css";
import { Button, DethinkProvider } from "@dethink/components";

export function App() {
  return (
    <DethinkProvider theme="system" density="default" dir="ltr">
      <Button>Save changes</Button>
    </DethinkProvider>
  );
}
```

Supported provider settings include `theme` (`light`, `dark`, `system`), `density`
(`compact`, `default`, `comfortable`), `dir`, and `themeConfig`. Verify types for
the version in use. Avoid nesting a new provider around every component.

## Source copying into another React app

When the user wants source copying and has access to the library source:

1. Read the selected `registry/items/<slug>.json`. Resolve `registryDependencies`
   recursively by each item's `name`, not an assumed filename: `dethink-base`
   lives in `registry/items/base.json`.
2. Copy the declared source files and shared dependencies, preserving their
   relative layout or rewriting imports consistently. Inspect imports too; do
   not copy an isolated TSX file and leave its utilities or provider behind.
3. Merge declared `dependencies` and `devDependencies` into the app with its
   package manager. Match versions to the library source/package metadata.
   Preserve unrelated dependencies and the consumer's aliases.
4. Include the shared style/token setup. The source stylesheet imports Tailwind
   CSS v4 and declares an `@source` path relative to itself; adapt source scanning
   to the copied files and merge with the app's existing Tailwind entry. Preserve
   the semantic theme mappings, component CSS, and relevant registry `cssVars`.
5. Rewrite example imports from `@dethink/components` to the actual copied exports.
   Verify a small component renders with styles before composing a full screen.

The component and recipe code is MIT licensed. Preserve the repository's `LICENSE`
when copying code manually; registry installs include it at
`components/dethink/LICENSE`. Third-party dependencies retain their own terms.
Showcase images and brand artwork are outside the code license; follow the root
README and `THIRD_PARTY_NOTICES.md` for asset scope. If source is unavailable, ask
for access or a supported installation path rather than claiming integration.

## Theme and dependency details

- App-level theme settings belong on `DethinkProvider`/`themeConfig`. For CSS
  overrides, inspect `styles.css` for the exact `--dt-*` variable names and theme
  scopes. Use semantic utilities such as `bg-background`, `text-foreground`,
  `border-border`, and `text-muted-foreground`.
- Source-copy consumers need a Tailwind v4 build that scans the copied files.
  Package consumers need the exported stylesheet; app-authored utilities still
  need the app's styling build. Investigate missing styles before adding CSS hacks.
- DataTable uses `@tanstack/react-table`; use Dethink's exported
  `DataTableColumnDef` and documented table props.
- Some date/selection/overlay components depend on React Aria or
  `@internationalized/date`. Preserve their documented value types rather than
  assuming every date prop accepts a JavaScript `Date` or string.
- Animated components may import `motion/react` from the `motion` package. Avoid
  adding `framer-motion` merely because the API looks familiar.
- Markdown chat rendering is optional through
  `@dethink/components/chat-markdown`, with `react-markdown` and `remark-gfm`
  optional peers. Plain chat UI does not require installing them.
