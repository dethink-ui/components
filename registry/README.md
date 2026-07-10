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
  base. It declares `motion` because its copied source uses Motion for
  stateful chevron, label, and busy feedback.
- `dropdown-menu` remains independently installable for custom overflow and
  context-menu compositions. Its copied surface and changed-item feedback also
  import `motion/react`, so the registry item declares `motion` alongside the
  React Aria dependencies used for collection, focus, portal, and positioning
  behavior.

Package consumers can import all three surfaces from `@dethink/components`.
Registry consumers should keep every declared `registryDependencies` and
`dependencies` entry so aliases, CSS variables, provider-aware portals,
positioned overlays, and Motion imports remain portable after source copying.
