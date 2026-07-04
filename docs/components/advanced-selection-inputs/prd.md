# Advanced Selection Inputs PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/167

Package target: `@dethink/components`.

## Problem Statement

Teams building SaaS dashboards, internal tools, B2B apps, AI-native
configuration screens, and admin workflows frequently need users to choose
multiple values, filter large option sets, pick server-backed entities, and
create or edit label-like tags.

Dethink now has Select and Combobox, but consumers still need to assemble
multi-value selection, async querying, selected-token rendering, remove actions,
empty/loading/error states, form serialization, keyboard behavior,
provider-token styling, registry metadata, and tests themselves.

This gap appears in role and permission assignment, customer and owner filters,
labels, status chips, AI model/tool selection, notification recipients, import
mappings, saved report filters, and CRM-style segmentation.

## Solution

Ship an advanced selection inputs suite covering MultiSelect, AsyncSelect, and
TagInput.

MultiSelect should provide a tokenized, accessible, multi-value picker for known
option sets. AsyncSelect should provide server-backed option lookup with
explicit app-owned async state. TagInput should provide free-form chip/tag
authoring.

The suite should reuse provider tokens, Form/Field conventions,
Select/Combobox popover and listbox patterns, and registry structure. It should
not introduce a command palette, virtualized collection system, TreeSelect,
QueryBuilder, or remote data-fetching framework.

## User Stories

1. As a dashboard engineer, I want a MultiSelect component, so that filter bars can choose several statuses, owners, tags, or regions without custom chip and menu code.
2. As an internal-tool engineer, I want selected options rendered as removable chips, so that users can see and edit the active selection quickly.
3. As a form builder, I want MultiSelect to support controlled selected values, so that app state and form libraries can own the selected collection.
4. As a form builder, I want MultiSelect to support uncontrolled default values, so that simple forms can work without custom state wiring.
5. As a package consumer, I want `value`, `defaultValue`, and `onValueChange`, so that multi-value APIs follow existing Dethink naming.
6. As a package consumer, I want `items` and render-function children, so that options can come from typed data arrays.
7. As a package consumer, I want static item children, so that small option lists remain readable in JSX.
8. As a package consumer, I want disabled keys and item-level disabled state, so that unavailable options remain visible but cannot be selected.
9. As a keyboard user, I want to open the menu, navigate options, select and deselect items, remove chips, clear all selections, and dismiss the menu without a mouse.
10. As a screen-reader user, I want selected count, focused option, selected state, disabled state, and remove actions announced clearly, so that multi-selection is understandable.
11. As a mobile user, I want chips and triggers to wrap or collapse responsively, so that dense filters remain usable on narrow screens.
12. As an RTL user, I want chip order, remove buttons, input caret, and popover alignment to respect direction, so that localized products work without overrides.
13. As a design-system lead, I want provider-level theme and density tokens to style MultiSelect, so that light, dark, compact, default, comfortable, and custom themes stay consistent.
14. As a registry consumer, I want MultiSelect registry metadata, so that copied-code installs include required files, dependencies, and CSS variable expectations.
15. As an accessibility reviewer, I want automated and manual keyboard coverage, so that fragile multi-select ARIA behavior is not hand-waved.
16. As a dashboard engineer, I want an AsyncSelect component, so that user, account, product, issue, model, and repository pickers can query server-owned options.
17. As a search user, I want async results to update from my query, so that large option sets do not need to be loaded up front.
18. As a user on a slow network, I want loading state, stale result handling, empty state, error state, and retry state, so that async pickers do not feel broken.
19. As an application engineer, I want AsyncSelect to accept externally supplied loading, error, and items state, so that apps can use their existing data-fetching layer.
20. As an application engineer, I want optional request helpers to be lightweight and replaceable, so that the component does not force a data client.
21. As a package consumer, I want AsyncSelect to support single selection first and multi-selection where the API remains explicit, so that server-backed pickers cover both entity and filter workflows.
22. As a package consumer, I want async options to preserve stable identity, so that selected values do not disappear when search results change.
23. As a package consumer, I want a minimum query length option, so that expensive searches can wait until enough text is entered.
24. As a package consumer, I want async empty and error slots, so that product copy can be tailored to the use case.
25. As an accessibility reviewer, I want loading and result updates announced politely, so that async behavior is perceivable without visual-only feedback.
26. As a form builder, I want AsyncSelect form serialization, so that submitted values are stable keys rather than display labels unless explicitly configured.
27. As a Storybook user, I want controlled async examples with deterministic fake data, so that loading, error, empty, retry, single, and multi modes can be inspected.
28. As a showcase reader, I want MultiSelect, AsyncSelect, and TagInput pages in the showcase webapp, so that I can evaluate the developed components outside Storybook.
29. As a TagInput user, I want to type a value and press Enter, comma, or Tab to create a tag, so that authoring labels is fast.
30. As a TagInput user, I want to delete tags with Backspace or a remove button, so that mistakes are easy to fix.
31. As a TagInput user, I want pasted comma-separated or newline-separated text to create tags, so that bulk entry is efficient.
32. As a form builder, I want controlled and uncontrolled tag arrays, so that TagInput works in both simple and managed forms.
33. As a form builder, I want validation hooks for duplicates, invalid characters, maximum count, and maximum length, so that product rules are enforced at the component boundary.
34. As a package consumer, I want duplicate prevention and normalization options, so that case and whitespace can be handled predictably.
35. As a package consumer, I want disabled and read-only TagInput modes, so that tags can be displayed in forms without being editable.
36. As a package consumer, I want invalid state and error text to follow Dethink Form/Field conventions, so that validation is consistent.
37. As a package consumer, I want tag values serialized predictably in forms, so that server handlers receive stable payloads.
38. As a design-system lead, I want selected chips in MultiSelect, AsyncSelect, and TagInput to share the same tokenized visual language, so that advanced inputs feel cohesive.
39. As a maintainer, I want shared selection and chip utilities where they reduce duplication, so that the three components do not drift.
40. As a maintainer, I want the suite to reuse Select and Combobox overlay/listbox patterns, so that provider portal behavior, density, RTL, and theme inheritance stay consistent.
41. As a maintainer, I want tests to focus on public behavior rather than internal state machinery, so that future implementation changes remain safe.
42. As a documentation reader, I want guidance on when to use Select, Combobox, MultiSelect, AsyncSelect, and TagInput, so that teams choose the right input.
43. As a product engineer, I want examples for permissions, labels, recipients, model selection, and report filters, so that I can copy realistic patterns.
44. As an SSR app developer, I want the components to render and hydrate without warnings, so that Next.js and Vite SSR consumers can use them.
45. As a registry maintainer, I want accurate registry items and smoke checks, so that copied components install cleanly outside the monorepo.
46. As a maintainer, I want this PRD to stop short of virtualization, TreeSelect, command palette, drag sorting, and remote cache orchestration, so that the first advanced selection suite stays shippable.

## Implementation Decisions

- Select MultiSelect, AsyncSelect, and TagInput as the next component group
  because the high-impact development path places it immediately after the
  completed DatePicker and DateRangePicker work.
- Treat the work as an advanced selection inputs suite rather than three
  unrelated widgets.
- Reuse React Aria Components for accessible listbox, combobox, collection,
  selection, validation, and tag behavior where it fits.
- Reuse Dethink Select and Combobox patterns for provider-aware popovers,
  listbox item styling, option data shape, stable data slots, control sizing,
  state props, and provider-token styling.
- MultiSelect should expose selected values as a string-key collection and
  support controlled and uncontrolled usage.
- MultiSelect should include searchable filtering, but remote loading belongs
  to AsyncSelect.
- AsyncSelect should be controlled by app-owned async state rather than bundling
  a data-fetching client.
- AsyncSelect should keep option identity stable across searches so selected
  values remain visible even when current results change.
- TagInput should own free-form tag creation, normalization, duplicate
  handling, paste splitting, max-count behavior, and remove interactions.
- The chip visual language should be shared across the suite.
- All three components should compose with existing Form/Field conventions.
- Registry metadata should be added for each public component with accurate
  runtime dependencies and registry dependencies.
- Storybook should demonstrate realistic SaaS/internal-tool workflows.
- Showcase webapp pages should be tracked separately from Storybook so the
  public component docs surface receives the developed suite as well.
- The suite should document when to use Select, Combobox, MultiSelect,
  AsyncSelect, and TagInput.

## Testing Decisions

- Tests should assert public behavior through accessible roles, visible text,
  form submission, keyboard interactions, focus return, state attributes, and
  user-visible chip/listbox outcomes.
- MultiSelect tests should cover controlled/uncontrolled values, filtering,
  selecting/deselecting, disabled options, chip removal, clear all, form
  serialization, invalid state, disabled/read-only state, keyboard navigation,
  RTL, density, and className composition.
- AsyncSelect tests should cover query changes, loading, empty, error, retry,
  stale result handling, minimum query length, stable selected values, approved
  selection modes, form serialization, keyboard interactions, and status text.
- TagInput tests should cover controlled/uncontrolled tags, keyboard creation,
  Backspace deletion, remove buttons, paste splitting, duplicate prevention,
  normalization, max tags, invalid tags, disabled/read-only state, form
  serialization, keyboard behavior, and focus management.
- Accessibility tests should cover labelled fields, descriptions, errors,
  invalid state, required state, chip remove buttons, async announcements,
  disabled/read-only states, and no axe violations.
- SSR tests should verify render and hydration for each component.
- Storybook should cover base, controlled, form usage, disabled/read-only,
  invalid/required, dense filter bars, theme overrides, dark mode, RTL, async
  loading/empty/error/retry, and responsive chip wrapping.
- Showcase app typecheck/build should be included once showcase pages are
  implemented.
- Registry smoke should verify copied component imports, dependency metadata,
  provider-token styling, and form serialization in a clean consumer app.

## Out of Scope

- Virtualized option lists.
- Infinite scroll primitives.
- Fuzzy-search runtime dependencies.
- Remote cache clients or request orchestration frameworks.
- Form-library adapters.
- Schema validation adapters.
- Drag sorting of selected chips.
- TreeSelect, QueryBuilder, CommandPalette, and full AI model picker
  orchestration.
- Replacing Select or Combobox APIs.
- Broad overlay, portal, or focus-management rewrites beyond reuse of existing
  provider-aware patterns.
- Component-level theme props.

## Further Notes

- Prioritization source: the repository high-impact development path places
  MultiSelect, AsyncSelect, and TagInput after DatePicker and DateRangePicker
  and before Sidebar and CommandPalette.
- Current repository state: Select and Combobox exist and provide the closest
  behavior and styling prior art.
- React Aria research source: Context7 resolved official React Aria docs and
  confirmed relevant coverage for ComboBox, ListBox, collection rendering,
  multiple selection direction, TagGroup semantics, disabled keys, validation,
  keyboard behavior, and form participation.
- Product direction: this suite strengthens the form/filter layer that later
  Sidebar, CommandPalette, Toast feedback, Chart filters, FileUpload metadata,
  and CRUD page blocks will reuse.
