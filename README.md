# Dethink Components

Open-code React components for SaaS dashboards, internal tools, B2B products,
and AI-native apps.

Dethink gives teams ready-made building blocks without hiding the code. You can
use the package in this workspace or copy components through the registry as the
registry grows.

## What you get

- React components written in TypeScript
- Tailwind CSS v4 styles backed by CSS variables
- Light and dark themes, density settings, and right-to-left support
- Accessible patterns with keyboard, accessibility, and server-rendering tests
- A shadcn-compatible registry for copying component source into an app
- Storybook, a Vite playground, and a Next.js showcase for trying components

The current catalog includes layout, form, navigation, overlay, data-display,
date and time, feedback, and decorative components. Examples include Button,
Input, Select, Dialog, DataTable, Calendar, Sidebar, Toast, and more.

## Project status

Dethink Components is in active development. The package is currently version
`0.0.0`, so its APIs may change. Component source is available from the
[public registry](https://components.dethink.co.uk/r/registry.json). Follow the
[registry installation guide](registry/README.md#public-registry) to copy it into
your app. The npm package is not published yet.

## Quick start for this repository

This project uses pnpm `11.7.0`.

```sh
git clone git@github.com:dethink-ui/components.git
cd components
pnpm install
```

Start one of the local apps:

```sh
# Vite playground
pnpm --filter @dethink/playground-vite dev

# Storybook component explorer
pnpm --filter @dethink/storybook storybook

# Next.js component showcase
pnpm --filter @dethink/showcase dev
```

## Use the local package

Build the package first:

```sh
pnpm --filter @dethink/components build
```

Then import the stylesheet once and wrap the part of your app that uses Dethink
with `DethinkProvider`:

```tsx
import "@dethink/components/styles.css";
import { Button, DethinkProvider } from "@dethink/components";

export function App() {
  return (
    <DethinkProvider theme="light">
      <Button>Save changes</Button>
    </DethinkProvider>
  );
}
```

Inside this monorepo, depend on the package with `"@dethink/components":
"workspace:*"`.

## Main folders

| Folder                                         | Purpose                                                        |
| ---------------------------------------------- | -------------------------------------------------------------- |
| [`packages/components`](packages/components)   | The public `@dethink/components` package and component source. |
| [`registry`](registry)                         | Shadcn-compatible registry metadata and copied source files.   |
| [`apps/storybook`](apps/storybook)             | Component stories, examples, and accessibility checks.         |
| [`apps/playground-vite`](apps/playground-vite) | A Vite app used to smoke-test package imports.                 |
| [`apps/showcase`](apps/showcase)               | A Next.js site with live component examples and recipes.       |
| [`docs`](docs)                                 | Component usage guides, theming, motion, and dependencies.     |

## Useful commands

```sh
# Run linting, formatting, type checks, and tests
pnpm check

# Build the package and Vite playground
pnpm build

# Build Storybook
pnpm storybook:build

# Check registry metadata and copied component files
pnpm registry:validate
pnpm registry:smoke

# Run end-to-end tests
pnpm test:e2e
```

## Documentation

### Use with a coding agent

The [Dethink Components skill](skills/dethink-components/SKILL.md) helps agents
choose components, adapt recipes, set up styles and dependencies, and verify the
result against the library's actual APIs.

From a checkout containing the skill, install it with the
[Skills CLI](https://github.com/vercel-labs/skills):

```sh
npx skills add ./skills/dethink-components
```

Install it from your application directory:

```sh
npx skills add dethink-ui/components --skill dethink-components
```

Choose your agent in the installer. In Codex, ask for example:

> Use $dethink-components to build an operations dashboard with a collapsible
> sidebar and a searchable incidents table.

Or ask your agent to use the Dethink Components skill to adapt a recipe or theme
an existing interface. Installing the skill provides agent instructions; it does
not install the component package or publish the registry. The setup limitations
in [Project status](#project-status) still apply.

### Library references

- [Component catalog](https://components.dethink.co.uk/components) — live examples and API reference.
- [Recipes](https://components.dethink.co.uk/recipes) — complete interfaces built with the library.
- [Documentation](docs/README.md) — component usage, theming, motion, and dependencies.
- [Registry notes](registry/README.md) — how registry items are organised.

## Contributing

Keep changes focused and easy to test. For a component change, update the
component source, its tests, stories, registry metadata, and docs when they are
affected. Run the relevant commands above before opening a pull request.

For new components or larger public API changes, read the project workflow in
[AGENTS.md](AGENTS.md) before starting.

## License

This repository does not yet include a license file. Please contact the
maintainers before reusing the code outside this project.
