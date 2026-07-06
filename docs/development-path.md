# Development Path

Source: `react_component_library_prd.docx`.

Package name: `@dethink/components`.

The build should proceed from foundation systems to one installable, documented, tested component at a time. Each component should receive its own PRD, then its own issue breakdown, before implementation starts.

Tailwind CSS is the default component styling layer. Component specs and PRDs should describe how each component uses token-backed Tailwind utilities, CSS variables, state data attributes, responsive variants, dark mode, density, and registry-compatible `cssVars`.

Use logged-in Context7 before web search for any library, framework, SDK, API, CLI, or cloud-service documentation. Start with `npx ctx7 whoami`; if it is not logged in, run `npx ctx7 login` or use `CONTEXT7_API_KEY` before fetching docs. Resolve a library with `npx ctx7@latest library "<official library name>" "<full question>"`, then fetch docs with `npx ctx7@latest docs <libraryId> "<full question>"`.

Use `docs/high-impact-component-priority.md` as the current prioritization overlay when selecting the next component PRD. It preserves the component-by-component workflow but weighs repeated SaaS/internal-tool usage, ecosystem demand, and downstream unlock value more heavily than the original static P0/P1/P2 order.

## Repository Scaffold

The base scaffold is a pnpm workspace:

- `packages/components` contains the public React package named `@dethink/components`.
- `apps/storybook` contains the component documentation and visual/a11y story surface.
- `apps/playground-vite` contains the Vite smoke-test app for package and style imports.
- `registry/items` contains shadcn-compatible registry item metadata.
- `scripts/validate-registry.mjs` validates the initial registry item shape.

Root verification commands:

- `pnpm install`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- `pnpm test:a11y`
- `pnpm storybook:build`
- `pnpm registry:validate`

## Planning Workflow Per Component

1. Create `docs/components/<component-slug>/spec.md` from the source PRD and current implementation context.
2. Create `docs/components/<component-slug>/prd.md` using the `to-prd` template.
3. Confirm the testing seams with the user before publishing the PRD to the issue tracker.
4. Create `docs/components/<component-slug>/issues.md` using the `to-issues` tracer-bullet format.
5. Confirm issue granularity, dependencies, and HITL/AFK classification with the user.
6. Publish approved issues to the tracker with the `ready-for-agent` triage label.

## Testing Seams To Reuse

Prefer the highest practical seam for each component:

- Rendered component behavior tests for public props, states, events, and keyboard flows.
- Storybook stories for docs, interaction tests, visual states, dark mode, density, and responsive behavior.
- Accessibility checks with automated axe coverage plus manual keyboard criteria in docs.
- Registry install smoke tests in a clean consumer app to verify dependencies, aliases, CSS variables, and generated files.
- Tailwind/theme smoke tests or stories to verify variant maps, class merging, responsive utilities, dark mode, density, and token overrides.
- SSR smoke tests for Next.js and Vite where the component could be rendered during hydration.

## Tailwind CSS Conventions

Use Tailwind CSS v4 by default.

- Scaffold the base stylesheet with `@import "tailwindcss";`.
- Define shared design tokens with Tailwind's CSS-first `@theme` model and CSS custom properties.
- Bridge semantic design tokens into Tailwind utilities for color, spacing, radius, shadow, focus ring, motion, density, and chart/status colors.
- Prefer explicit utility class maps for variants and sizes.
- Use a shared class name merge helper so consumer `className` values compose predictably with component defaults.
- Avoid runtime-generated class names that Tailwind cannot detect.
- Use `data-*` and ARIA state selectors for slots and states.
- Keep component-specific CSS small and portable; registry-installed components should work from documented base setup plus their declared files.
- Only use Tailwind v3 compatibility paths when a component PRD or consumer target explicitly requires them.

## Foundation Before Components

These are prerequisites for credible component implementation. They should be planned as foundation PRDs before a broad component sprint starts.

1. Design Tokens
2. Tailwind CSS Integration
3. Global CSS / Reset and Focus Styles
4. Foundation Provider
5. ThemeProvider
6. ColorModeProvider
7. Icon System
8. Motion System
9. Layer System
10. Registry Pipeline
11. Documentation Shell
12. Storybook / Visual / Accessibility Test Harness
13. Package Build and Changesets Release Workflow

## P0 Component Order

Start with Button because it validates the smallest complete vertical slice: tokenized styling, variants, native semantics, docs, registry metadata, package export, and tests.

1. Button
2. IconButton
3. Link
4. Typography / Heading / Text
5. Box
6. Container
7. Stack
8. Flex
9. Grid
10. Separator / Divider
11. AspectRatio
12. ScrollArea
13. Card
14. Badge
15. Avatar / AvatarGroup
16. List / DataList
17. Table
18. Form
19. Field / Label / HelpText / ErrorMessage
20. Fieldset
21. Input
22. Textarea
23. NumberInput
24. Checkbox / CheckboxGroup
25. RadioGroup
26. Switch
27. Slider
28. Select
29. NativeSelect
30. Combobox
31. Accordion
32. Collapsible
33. Tabs
34. Alert / Callout
35. Toast
36. Progress / ProgressCircle
37. Spinner
38. Skeleton
39. EmptyState
40. Dialog
41. AlertDialog
42. Drawer / Sheet
43. Popover
44. Tooltip
45. DropdownMenu
46. Breadcrumb
47. Pagination
48. Sidebar
49. Calendar
50. DataTable
51. MultiSelect
52. DatePicker
53. DateRangePicker
54. FileUpload / Dropzone
55. Portal
56. VisuallyHidden
57. FocusTrap / FocusScope
58. Presence / Transition
59. useControllableState

## High-Impact Next Component Order

The static P0/P1/P2 lists remain the full inventory order. The current high-impact ordering should guide near-term PRD selection after completed components and deliberate exceptions are accounted for:

1. Stack
2. Flex
3. Grid
4. Separator / Divider
5. Card
6. Form + Field primitives
7. Input + Textarea + NumberInput
8. Checkbox + RadioGroup + Switch
9. Select
10. Combobox
11. Dialog + AlertDialog
12. Popover + Tooltip + DropdownMenu
13. Table
14. DataTable
15. DatePicker + DateRangePicker
16. MultiSelect + AsyncSelect + TagInput
17. Sidebar + CommandPalette
18. Toast + feedback states
19. Chart + Stat/KPI
20. FileUpload / Dropzone

## P1 Component Order

P1 should fill out daily-use coverage first, then move into differentiators and product blocks.

1. ButtonGroup
2. Code
3. Kbd
4. Inline
5. SimpleGrid
6. Center
7. Spacer
8. Splitter / Resizable Panels
9. SidebarShell
10. PasswordInput
11. PinInput / OTP
12. Listbox
13. SearchInput
14. TagInput
15. AsyncSelect
16. TimePicker
17. DateTimePicker
18. IntervalPicker
19. ColorPicker
20. NotificationCenter
21. LoadingOverlay
22. StatusIndicator
23. HoverCard
24. ContextMenu
25. Menubar
26. OverlayManager
27. NavigationMenu
28. Steps
29. CommandPalette
30. Timeline
31. Stat / KPI
32. Chart
33. CodeBlock
34. RichTextEditor
35. TreeView
36. TreeSelect
37. ClientOnly
38. EnvironmentProvider
39. LocaleProvider
40. DirectionProvider
41. CopyButton
42. useMediaQuery
43. Auth Screens Block
44. Dashboard Shell Block
45. CRUD Page Block
46. Settings Page Block
47. Analytics Dashboard Block

## P2 / Pro Component Order

P2 should start only after P0 quality is stable and the P1 differentiators have production feedback.

1. Rating
2. QueryBuilder
3. Anchor / ScrollSpy
4. Carousel
5. QRCode
6. DataGrid
7. Scheduler / EventCalendar
8. SortableList
9. DragDrop
10. KanbanBoard
11. OnboardingTour
12. Hotkeys
13. PromptInput
14. ChatMessage
15. MessageList
16. MessageScroller
17. ConversationList
18. AttachmentBubble
19. TypingIndicator
20. CitationCard
21. ToolCallCard
22. ModelPicker
23. AI Chat Shell Block
24. Kanban Board Block
25. Scheduler Page Block
26. Rich Text Document Page Block
27. Onboarding Flow Block
28. Private Registry
29. Pro Blocks
30. Enterprise Tooling

## Current First Component

The first concrete component is Button. The base scaffold is in place first; Button should be implemented only after its local PRD and issue breakdown are approved. Its planning docs are:

- `docs/components/button/spec.md`
- `docs/components/button/prd.md`
- `docs/components/button/issues.md`
