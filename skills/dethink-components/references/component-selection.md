# Choosing components and recipes

Use this as a starting map, then verify the current component page and examples.
It is not an exhaustive catalog or a replacement for API types.

| User need               | Start with                                              | What to check                                               |
| ----------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| App dashboard           | SidebarShell, Sidebar, Card, DataTable                  | Header trigger, responsive navigation, current route        |
| Simple tabular data     | Table                                                   | Use DataTable when sorting/filtering/pagination is needed   |
| Editable form           | FormField, Input, Select, Checkbox, Button              | Labels, validation, controlled state, submission            |
| Searchable choices      | Combobox, MultiSelect, AsyncSelect, TagInput            | Single vs multiple values, async loading, free text         |
| App navigation          | Sidebar, Breadcrumb, NavigationMenu                     | Route navigation vs in-page state                           |
| Compact icon navigation | NavDock                                                 | Placement, accessible names, current value, mobile collapse |
| Confirmation or overlay | Dialog, Drawer, Popover, DropdownMenu, Tooltip          | Match interaction semantics; don't rebuild focus handling   |
| Dates and booking       | Calendar, DatePicker, DateRangePicker, SlotPlanner      | Value types, locale, timezone and range requirements        |
| AI conversation         | Chat, MessageScroller, PromptInput, ModelPicker         | Streaming state and callbacks; backend is app-owned         |
| Marketing page          | Card, Button, Steps, shader backgrounds, ShaderHeroText | Readability, motion settings, fallback and narrow layouts   |
| Loading and feedback    | Skeleton, Spinner, Progress, EmptyState, Toast          | Announcements and real loading/error states                 |

Read `apps/showcase/src/lib/recipes-meta.ts` for available recipes, then the
matching file in `apps/showcase/src/examples/recipes/`. Public previews are at
`https://components.dethink.co.uk/recipes/<slug>`.

Useful starting recipes:

- `command-center-dashboard`: operations overview, sidebar, filters and incidents.
- `crud-resource-manager`: resource lists and management interactions.
- `automation-landing`: animated marketing hero, workflows and pricing.
- `automation-login`: sign-in form and social sign-in presentation.
- `ai-chat-studio`: conversation layout and composer.
- `settings-and-billing`: account and billing settings.
- `scheduler-and-booking`: scheduling interface.

Recipes can import local helpers and assets. Follow those imports when adapting
one; remove showcase-only preview wrappers and fixed demo heights where they do
not fit the app. Do not carry over the showcase's navigation chrome or simulated
success states as working product functionality.

## Library-specific choices

- SidebarShell examples place `SidebarTrigger` in the main header. Standalone
  Sidebar examples use a header trigger. `SidebarRail` is optional; do not make an
  edge-only target the sole discoverable way to open navigation.
- NavDock distinguishes the current route from temporary hover/focus state.
  Use documented current-state props and let its responsive collapsed mode manage
  disclosure. Avoid a second magnification animation on its icon wrappers.
- Shader backgrounds and ShaderHeroText are separate components. Check the hero
  text's documented animation options for effects such as particle flow rather
  than inventing a `ParticleFlow` export. Preserve readable text and reduced-motion
  and rendering fallbacks.
- DataTable already wraps TanStack Table behavior. Begin with its basic and
  workflow examples instead of recreating a parallel table state layer.
