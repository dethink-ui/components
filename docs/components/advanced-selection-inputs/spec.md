# Advanced Selection Inputs Component Spec

Status: Draft local spec for GitHub PRD #167.

GitHub PRD: https://github.com/parveshh/dethink-components/issues/167

Package target: `@dethink/components`.

## Purpose

Add the next high-impact advanced input group after the date suite:
MultiSelect, AsyncSelect, and TagInput.

The suite extends the existing Select and Combobox foundations into common
SaaS/internal-tool workflows: multi-value filters, role and permission
assignment, labels, recipients, server-backed entity lookup, AI model/tool
selection, and free-form token authoring.

## Component Family

- `MultiSelect`: searchable multi-value picker for known option sets.
- `AsyncSelect`: server-backed option lookup with loading, empty, error, retry,
  and stable selected values across result changes.
- `TagInput`: free-form tag/token entry with chip editing, paste parsing,
  normalization, validation, and predictable form serialization.

## Current Prior Art

- Select provides single-value listbox and provider-aware popover styling.
- Combobox provides searchable single-value input/listbox behavior.
- FormField, Input, Button, and IconButton provide state, label, help, error,
  focus, and density conventions.
- DataTable and date-suite stories show realistic filter and form examples.

## Research Notes

Context7 resolved official React Aria documentation as
`/websites/react-aria_adobe`.

Relevant React Aria coverage includes:

- ComboBox/ListBox collection rendering, validation, keyboard behavior, and form
  participation.
- Multiple-selection direction via React Aria Components examples and selection
  APIs.
- TagGroup/Tag semantics for accessible tag collections.
- Disabled keys, selected state, validation state, labels, descriptions, and
  FieldError patterns.

The component implementation should use React Aria Components where it fits and
should avoid hand-rolled ARIA behavior for listboxes, tags, and combobox-style
interactions.

## Public API Direction

- Values should use stable string keys for selected known options.
- Multi-value public APIs should prefer arrays for ergonomic app usage.
- Async selected values must remain displayable when current search results no
  longer include the selected option.
- TagInput values should be strings with optional normalization and validation
  hooks.
- Components should expose Dethink naming conventions: `value`,
  `defaultValue`, `onValueChange`, `items`, `disabledKeys`, `disabled`,
  `readOnly`, `required`, `invalid`, `description`, `errorMessage`,
  `controlSize`, and `className`.
- AsyncSelect should not own a data-fetching client. Apps should be able to pass
  query, items, loading, empty, error, and retry state.

## Behavior

- MultiSelect supports searching, selecting, deselecting, chip removal, clear
  all, disabled items, form submission, keyboard navigation, and focus return.
- AsyncSelect supports query changes, loading state, empty state, error state,
  retry, minimum query length, stale-result protection, stable selection
  display, and form submission.
- TagInput supports tag creation from Enter/comma/Tab, Backspace removal, remove
  buttons, paste splitting, duplicate prevention, max-count rules,
  normalization, invalid tags, and form submission.
- All components support disabled, read-only, required, invalid, labelled,
  described, and errored states.

## Accessibility

- Visible labels are the default documented pattern.
- Placeholder-only labelling is not acceptable in docs examples.
- Chip remove buttons need specific accessible names.
- Async status updates should be announced politely.
- Keyboard users must be able to complete the primary workflow for each
  component without a pointer.
- Automated axe coverage and manual keyboard criteria are required.

## Theming

Components must consume provider-owned tokens for background, foreground,
muted, muted foreground, border, input, ring, primary, destructive, spacing,
radius, shadow, density, and direction.

Selected chips should share one tokenized visual language across MultiSelect,
AsyncSelect, and TagInput.

## Registry Requirements

- Add registry metadata for MultiSelect, AsyncSelect, and TagInput.
- Registry metadata must include accurate files, dependencies, registry
  dependencies, CSS variable expectations, and smoke coverage.
- Copied components must work with documented Dethink base setup and provider
  tokens.

## Documentation Requirements

- Explain when to use Select, Combobox, MultiSelect, AsyncSelect, and TagInput.
- Cover controlled/uncontrolled state, form serialization, validation,
  disabled/read-only states, async state ownership, and accessibility.
- Include realistic examples for filters, role assignment, labels, recipients,
  AI model/tool selection, and server-backed lookup.
- Include showcase webapp pages after the components are developed so the
  public docs surface reflects the suite outside Storybook.

## Out Of Scope

- Virtualized option lists.
- Infinite scroll primitives.
- Fuzzy-search runtime dependencies.
- Remote cache clients or request orchestration frameworks.
- Form-library adapters.
- Schema validation adapters.
- Drag sorting of selected chips.
- TreeSelect, QueryBuilder, CommandPalette, and full AI model picker
  orchestration.
- Component-level theme props.

## Verification

- Unit and rendered behavior tests for public props and interactions.
- Accessibility automation for labelled, invalid, async, and chip-removal
  states.
- SSR smoke tests.
- Storybook coverage for base, controlled, form, invalid, disabled/read-only,
  theme, density, RTL, async loading/empty/error/retry, and responsive chip
  wrapping.
- Showcase app typecheck/build coverage once showcase pages are added.
- Registry validation and smoke checks.
