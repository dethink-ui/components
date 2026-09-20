# Component dependency attribution

Component documentation includes a **Built with** section between installation
and usage. It names and links external packages, explains their role, and
distinguishes direct use from shared Dethink composition. React, clsx,
tailwind-merge and Tailwind styling appear as shared foundations. Chat documents
its opt-in Markdown peers separately.

The inventory is generated from registry dependencies and TypeScript source
imports, including local imports/re-exports and composed registry items. It does
not traverse third-party packages' own dependency trees or showcase examples.
Registry-declared packages are included even when only an optional path uses
them. Type imports are also included because consumers need their definitions.

After changing a component's imports or registry composition:

1. Run `pnpm docs:dependencies` to refresh
   `apps/showcase/src/lib/component-dependencies.json`.
2. Add a name, documentation URL, and purpose for any new library in
   `apps/showcase/src/lib/dependency-info.ts`.
3. Run `pnpm docs:dependencies:check` and build the showcase. The build rejects
   missing library descriptions; `pnpm check` rejects a stale inventory.

The shared InstallationSection renders the attribution, so individual component
pages do not maintain duplicate package lists. Libraries used only in examples
are intentionally excluded from component runtime attribution.
