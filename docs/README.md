# Dethink Components documentation

Start with the [component catalog](https://components.dethink.co.uk/components)
for live examples, usage, props, and dependency details. The
[recipes](https://components.dethink.co.uk/recipes) combine components into complete
interfaces. See the [repository setup guide](../README.md#quick-start-for-this-repository)
to run the library locally.

## Shared foundations

- [Provider and theming](provider-theming.md): theme configuration, nested providers,
  CSS variables, and the optional no-flash script.
- [Component motion](component-motion.md): motion tokens, interaction behavior,
  and reduced-motion support.
- [Dependency attribution](dependency-attribution.md): how component dependencies
  are documented and kept aligned with source.
- [Registry notes](../registry/README.md): shared setup and component dependencies.
- [Agent skill](../skills/dethink-components/SKILL.md): using Dethink with a coding agent.

## Component guides

The [component guides](components/) cover usage, accessibility, composition, and
migration details. The full API reference and runnable examples live in the
showcase; their source is in
[`apps/showcase/src/app/components`](../apps/showcase/src/app/components) and
[`apps/showcase/src/examples`](../apps/showcase/src/examples).

## Maintaining examples

- [Recipe thumbnail capture settings](showcase/recipe-capture-contract.md).
- [NavDock motion dependency](adr/0001-navdock-requires-motion.md).
- [Logo assets](brand/logo/README.md).

Run `pnpm capture:showcase` against a running showcase to produce local review
screenshots in `test-results/showcase-captures/`. These generated review files
are ignored by Git. Recipe thumbnails used by the site remain in
`apps/showcase/public/recipe-captures/`.
