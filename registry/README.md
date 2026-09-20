# Registry

This folder contains shadcn-compatible registry metadata and generated payloads.

Current status:

- `items/base.json` defines the shared Tailwind, provider, and utility base payload.
- Component registry metadata exists for the implemented component catalog,
  including advanced selection inputs such as MultiSelect, AsyncSelect, and
  TagInput.
- `pnpm registry:validate` checks registry item shape.
- `pnpm registry:smoke` checks dependency metadata, declared files, and key source invariants.

## ButtonGroup And DropdownButton Installation

Install only the action-composition surface the consumer needs:

- `button-group` installs Button, IconButton, and the shared base. It has no
  Motion or menu runtime dependency.
- `dropdown-button` installs ButtonGroup, Button, DropdownMenu, and the shared
  base. It declares `motion` for stateful chevron, selected-label, indicator,
  and busy feedback, plus `lucide-react` for the selected-action check icon.
- `dropdown-menu` remains independently installable for custom overflow and
  context-menu compositions. Its copied surface and changed-item feedback also
  import `motion/react`, so the registry item declares `motion` alongside the
  React Aria dependencies used for collection, focus, portal, and positioning
  behavior.

Package consumers can import all three surfaces from `@dethink/components`.
Registry consumers should keep every declared `registryDependencies` and
`dependencies` entry so aliases, CSS variables, provider-aware portals,
positioned overlays, and Motion imports remain portable after source copying.

## Public registry

The showcase build generates the catalog at
`https://components.dethink.co.uk/r/registry.json` and one source-inclusive JSON
file per item, such as `https://components.dethink.co.uk/r/button.json`.

In an existing React + Tailwind CSS v4 project configured for shadcn, install by
URL:

```sh
npx shadcn@latest add https://components.dethink.co.uk/r/button.json
```

Or add a namespace to the project's `components.json`:

```json
{
  "registries": {
    "@dethink": "https://components.dethink.co.uk/r/{name}.json"
  }
}
```

Then use `npx shadcn@latest add @dethink/button`. This namespace configuration is
local to the consumer; no global registry-directory registration is required.

Files are copied to `components/dethink/` at the consumer project root, preserving
component, utility, and foundation subdirectories. Existing shadcn components are
not overwritten. Import from those copied paths rather than `@dethink/components`.
For example, a file in `src/` can use:

```tsx
import { Button } from "../components/dethink/components/button";
import { DethinkProvider } from "../components/dethink/foundation/dethink-provider";
```

Import `components/dethink/styles.css` once through the app's global stylesheet
entry, and wrap the app with `DethinkProvider`. The copied stylesheet contains the
Tailwind v4 source scanning and Dethink tokens. Interactive usage in Next.js must
be inside a client component boundary. npm package publication is separate.

### Building and checking hosted files

- `pnpm registry:build` generates `apps/showcase/public/r/` from the registry items
  and package source. The showcase build and dev scripts run it automatically.
- `pnpm registry:test` checks the generated catalog, source contents, copied import
  graph, and public dependency URLs.
- `pnpm registry:validate` checks the authoring metadata.
- Set `DETHINK_REGISTRY_ORIGIN` to a local server origin when testing dependency
  installation locally. Production builds use the documentation domain by default.

Generated payloads are ignored by Git; edit the source and registry metadata.
