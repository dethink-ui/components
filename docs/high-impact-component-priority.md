# High-Impact Component Priority Plan

Source: `react_component_library_prd.docx`, `docs/component-inventory.md`, `docs/development-path.md`, public shadcn/ui issue-demand checks, and npm last-week package demand checked on 30 June 2026.

Status last refreshed: 4 July 2026.

This document is a prioritization overlay for choosing the next component PRD. It does not replace the per-component workflow: every selected component still needs local `spec.md`, `prd.md`, `issues.md`, published GitHub PRD/issues, stacked implementation branches, verification, and PRs.

## Prioritization Signals

High-impact components are the ones that score well across three signals:

1. Repeated use in SaaS dashboards, internal tools, B2B apps, and AI-native interfaces.
2. Public ecosystem demand, especially around shadcn/ui issues and common React package usage.
3. Ability to unlock later components, product blocks, examples, and registry credibility.

The strongest demand clusters are forms, selects and comboboxes, overlays, data tables, date and calendar workflows, app navigation, charts, uploads, and command/search.

## Research Takeaways

- shadcn/ui issue mentions were highest around `select`, `command`, `form`, `dialog`, `popover`, `sidebar`, `combobox`, `calendar`, `toast`, `tooltip`, `chart`, `tree`, `date picker`, and `data table`.
- npm demand supports the same categories: `recharts`, `sonner`, `react-day-picker`, `cmdk`, `vaul`, `react-resizable-panels`, `@dnd-kit/core`, `@tanstack/react-table`, `react-dropzone`, `@tiptap/react`, and `react-select` all show meaningful usage.
- The highest-value gap is not basic visual primitives alone. It is production-ready workflow primitives that teams repeatedly assemble themselves: forms, filtering, tables, date ranges, overlays, navigation shells, uploads, charts, and command/search.

## High-Impact Priority Groups

| Rank | Component group | Status | Why it matters |
| --- | --- | --- | --- |
| 1 | Form, Field, Label, HelpText, ErrorMessage, Input, Textarea, NumberInput | Done | Highest daily usage; required before serious settings, CRUD, auth, and dashboard examples. |
| 2 | Select, Combobox, MultiSelect, AsyncSelect, TagInput | Done | Critical for filters, permissions, assignees, labels, roles, AI model selection, and admin workflows. |
| 3 | Dialog, AlertDialog, Drawer, Popover, Tooltip, DropdownMenu | Partial | Dialog, AlertDialog, Popover, Tooltip, and DropdownMenu are done. Drawer/Sheet remains open. |
| 4 | Table, DataTable | Done | Core internal-tool workflow; includes semantic table plus TanStack-powered sorting, filtering, pagination, selection, column visibility, row actions, loading, empty, and error states. |
| 5 | Calendar, DatePicker, DateRangePicker | Done | Needed for filters, scheduling, billing, reports, and dashboards. DateTimePicker is also shipped. |
| 6 | Toast, Alert, Callout, EmptyState, Skeleton, Spinner, Progress | Open | Required for async UX, validation, loading states, CRUD feedback, and polished examples. |
| 7 | Sidebar, Breadcrumb, Pagination, NavigationMenu, CommandPalette | PRDs published | Builds the app-shell layer and directly supports dashboard/product blocks. |
| 8 | Card, Badge, Avatar, List, DataList, Stat/KPI | Partial | Card and CardStack are done. Badge, Avatar, List/DataList, and Stat/KPI remain open. |
| 9 | Chart | Open | High value for analytics dashboards; should follow a tokenized Recharts composition model rather than over-wrapping charts. |
| 10 | FileUpload, Dropzone | Open | Practical value for imports, attachments, profile media, onboarding, and AI/chat files; needs strong validation-boundary docs. |
| 11 | Splitter, Resizable Panels, ScrollArea | Open | Important for dashboards, editors, side panels, AI workspaces, and admin tools. |
| 12 | RichTextEditor, TreeView, TreeSelect | Open | Production differentiators, but they depend on stable overlays, forms, selection, keyboard, popover, command, and focus patterns. |
| 13 | AI chat primitives | Open | Strategic track after core shell/input/display work: PromptInput, MessageList, MessageScroller, AttachmentBubble, CitationCard, ToolCallCard, ModelPicker. |
| 14 | Scheduler, Kanban, DragDrop | Open | High demo value but heavy complexity; defer until DatePicker/Calendar, overlays, panels, and drag primitives are stable. |

## Recommended Next Development Order

Status as of 4 July 2026: the package, registry, Storybook, and showcase surfaces include Button, IconButton, Link, Typography, Box, Container, Stack, Flex, Grid, Separator, Card, CardStack, FormField/Form/Field, Input, Textarea, NumberInput, Checkbox, RadioGroup, Switch, Select, Combobox, MultiSelect, AsyncSelect, TagInput, Dialog, AlertDialog, Popover, Tooltip, DropdownMenu, Table, DataTable, Calendar, DatePicker, DateRangePicker, DateTimePicker, and Timeline.

1. Stack — done
2. Flex — done
3. Grid — done
4. Separator / Divider — done
5. Card — done
6. Form + Field primitives — done (FormField)
7. Input + Textarea + NumberInput — done
8. Checkbox + RadioGroup + Switch — done
9. Select — done
10. Combobox — done (PRD #109)
11. Dialog + AlertDialog — done (PRD #115)
12. Popover + Tooltip + DropdownMenu — done (PRD #122)
13. Table — done (PRD #130)
14. DataTable — done (PRD #135)
15. Calendar + DatePicker + DateRangePicker + DateTimePicker — done (Date suite PRD #141)
16. MultiSelect + AsyncSelect + TagInput — done (PRD #167)
17. Navigation set: Sidebar + Breadcrumb + Pagination + NavigationMenu + CommandPalette — PRDs published (#186, #187, #188, #189, #190)
18. Toast + feedback states — open
19. Badge + Avatar + List/DataList + Stat/KPI — open except Card/CardStack
20. Chart — open
21. FileUpload / Dropzone — open
22. Splitter / Resizable Panels / ScrollArea — open

## Selected Next: Navigation Set

The app-navigation set now has separate GitHub PRDs:

- Breadcrumb: https://github.com/parveshh/dethink-components/issues/186
- CommandPalette: https://github.com/parveshh/dethink-components/issues/187
- NavigationMenu: https://github.com/parveshh/dethink-components/issues/188
- Sidebar: https://github.com/parveshh/dethink-components/issues/189
- Pagination: https://github.com/parveshh/dethink-components/issues/190

Include SkipLink as an accessibility utility if the Sidebar or app-shell follow-up needs keyboard bypass behavior, but keep full Dashboard Shell block composition out of the component PRDs.

Recommended PRD boundary:

- Build reusable navigation primitives, not a full product shell.
- Compose with existing Button, IconButton, Link, Typography, Stack, Flex, Grid, Separator, Card, Dialog, Popover, Tooltip, DropdownMenu, Input, and DataTable examples.
- Keep Toast, NotificationCenter, global OverlayManager, dashboard block templates, router-specific integrations, auth navigation, and analytics dashboards out of scope.
- Verify keyboard navigation, focus visibility, active/current page state, collapsed and responsive Sidebar states, Breadcrumb truncation, Pagination labeling, NavigationMenu submenu behavior, CommandPalette search and empty states, SSR safety, registry metadata, Storybook coverage, showcase recipes, and accessibility automation.

## Review Suggestions (4 July 2026)

Findings from a validation pass against the PRD (Draft v1.1, Appendix C) and the current repository state:

1. **Continue reusing the shared overlay/positioning foundation.** Dialog, Popover, Tooltip, DropdownMenu, DatePicker, DateRangePicker, Combobox, MultiSelect, AsyncSelect, and TagInput now have shipped overlay-adjacent behavior. NavigationMenu and CommandPalette should reuse existing portal, provider, focus, and positioning patterns where they fit instead of starting a parallel overlay layer.
2. **Feedback states remain the next cross-cutting gap after Navigation.** DataTable has local loading, empty, and error states, but the library still lacks standalone Spinner, Skeleton, EmptyState, Alert/Callout, Progress, and Toast primitives for reuse across CRUD and async examples.
3. **Advanced selection is complete enough to become prior art.** MultiSelect, AsyncSelect, and TagInput should inform CommandPalette option modeling, filtering vocabulary, result windows, and empty/loading states without forcing CommandPalette to be a form control.
4. **Date suite is complete enough to become prior art.** Calendar, DatePicker, DateRangePicker, and DateTimePicker should remain the shared date workflow surface; future Scheduler work should build on it rather than introducing separate calendar logic.
5. **Missing high-frequency primitives to slot into future groups:** Toggle/ToggleGroup (toolbar and view switching), Toolbar (DataTable filter bars and RichTextEditor), SkipLink (Navigation set and app shells), a shared LiveRegion/Announcer utility (Toast, Combobox results, DataTable sort announcements, CommandPalette results), and Meter (quota/capacity display distinct from Progress).
6. **Refresh the AI-chat group (rank 13) with 2026 patterns:** streaming markdown Response renderer, ReasoningDisclosure for thinking traces, ApprovalCard for human-in-the-loop tool approval, SuggestionChips, and BranchNavigator for regenerated variants. These now matter as much as the original list.
7. **Keep this document dated and statused.** The demand signals were checked 30 June 2026; re-check npm/shadcn-issue demand quarterly, and update the status annotations above as components land so this stays the operative overlay the PRD now points to.

## Operating Rules

- Use this list to choose the next PRD candidate, not to skip the workflow.
- Complex differentiators can jump ahead only as explicit PRD exceptions.
- Prefer components that unlock several product blocks before isolated, showcase-heavy widgets.
- Keep implementation slices vertical: component API, source, docs, Storybook, tests, registry metadata, and smoke verification should land together where practical.
