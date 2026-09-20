---
name: dethink-components
description: Build and refine React interfaces with Dethink Components. Use when a user asks to use Dethink components, adapt a Dethink recipe, install or theme the library, or fix an existing Dethink integration.
---

# Dethink Components

Turn the user's interface request into a working composition of existing Dethink
components. Preserve their app, routing, package manager, and design choices.
Prefer a suitable component or recipe before building a replacement primitive.

## Find the actual API

- Public docs: https://components.dethink.co.uk/components
- Setup: https://components.dethink.co.uk/docs/installation
- Theming: https://components.dethink.co.uk/docs/theming
- Recipes: https://components.dethink.co.uk/recipes
- Source: https://github.com/dethink-ui/components

Start with the target project's installed source/types and existing usage. These
take precedence over newer online examples. If there is no installed copy, read
the relevant component page and source before writing imports or props. Dethink
is shadcn-compatible for distribution, but its APIs are not interchangeable with
shadcn/ui or Radix APIs.

For a local library checkout, use these paths relative to its root:

| Need                           | Source                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Available exports and types    | `packages/components/src/index.ts`                                                              |
| Component implementation       | `packages/components/src/components/<slug>/`                                                    |
| Usage examples                 | `apps/showcase/src/examples/<slug>/`                                                            |
| Component docs and prop tables | `apps/showcase/src/app/components/<slug>/page.tsx`, `apps/showcase/src/lib/props/`              |
| Recipe inventory and code      | `apps/showcase/src/lib/recipes-meta.ts`, `apps/showcase/src/examples/recipes/`                  |
| Copy dependencies and files    | `registry/items/<slug>.json`                                                                    |
| Shared styles and provider     | `packages/components/src/styles.css`, `packages/components/src/foundation/dethink-provider.tsx` |

When the checkout is unavailable, read the same paths through GitHub or its raw
file URLs at `https://raw.githubusercontent.com/dethink-ui/components/main/`.
Prefer a matching tag or commit when the consumer pins one. These paths refer to
the library repository, not the installed skill folder. If source access is
unavailable and the needed API cannot be verified locally, explain the missing
information instead of inventing an API.

## Build the requested interface

1. Inspect the target app's dependencies, styles, providers, and existing UI.
   Establish whether it uses the workspace package or copied component source.
   For new setup or missing styles, read [integration.md](references/integration.md).
2. Choose the smallest useful composition. Read
   [component-selection.md](references/component-selection.md) when choosing
   components or a recipe. Open only the examples relevant to the request.
3. Verify the exports, required props, state model, and dependencies against the
   actual source. Use existing application import paths for copied components.
   Read a working example before composing compound components.
4. Implement the requested behavior. Replace recipe mock data, placeholder links,
   and demo-only actions with the app's intended behavior. Preserve the user's
   scope: a login recipe supplies UI, not working OAuth; chat UI does not supply
   an AI backend. Identify integrations that still need configuration.
5. Check the result in the app: typecheck/build, relevant existing tests, and the
   primary interaction in a browser when available. Check narrow layouts,
   keyboard/focus behavior, and relevant theme and reduced-motion states. Report
   what was implemented, verified, and any remaining integration requirement.

## Composition rules

- Use component variants and sizes first, semantic Tailwind utilities for layout,
  and Dethink CSS variables for theme changes. Keep the consumer's established
  theme instead of applying a recipe's palette globally.
- Keep accessible names, current-route state, focus indicators, and overlay
  dismissal behavior. Use the component's existing keyboard and portal behavior
  rather than duplicating it in wrappers.
- Follow the framework's client-boundary conventions for interactive components.
  Keep server data access outside client-only UI and pass serializable data where
  the framework requires it.
- Keep built-in motion and reduced-motion behavior. Avoid layering another scale
  or layout animation over an already animated Dethink element.
- Confirm external libraries through the component's "Built with" docs and
  registry metadata. Install only what the selected integration needs; do not
  substitute another component library for a missing import without explanation.

This is a consumer skill. Building a new public Dethink component or changing the
library's API follows the repository's contributor instructions separately.
