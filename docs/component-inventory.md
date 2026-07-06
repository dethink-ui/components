# Component Inventory

Source: `react_component_library_prd.docx`, draft v1.0, dated 29 June 2026.

The PRD positions the library as a shadcn-compatible, open-code React component system for production SaaS dashboards, internal tools, B2B apps, and AI-native interfaces. P0 items create v1 credibility. P1 items expand daily-use coverage and differentiation. P2 items are advanced, pro, or emerging scope.

## Foundation Systems

| Item | Priority | Notes |
| --- | --- | --- |
| Design Tokens | P0 | Semantic and primitive tokens for color, typography, spacing, radius, shadow, z-index, motion, opacity, breakpoints, and density. |
| Tailwind CSS Integration | P0 | Tailwind v4 CSS-first theme setup, token-to-utility bridge, shared class merge helper, variant recipe conventions, and registry-compatible CSS variable output. |
| ThemeProvider | P0 | Theme scoping, nested themes, brand themes, forced theme, system theme, no-flash script recipe. |
| ColorModeProvider | P0 | Light, dark, and system mode with SSR-safe initial mode and storage key. |
| Global CSS / Reset | P0 | Focus rings, body typography, interactive defaults, form defaults, and opt-in import path. |
| Icon System | P0 | Consistent icon sizing, stroke, labels, and decorative icon handling. |
| Focus Styles | P0 | Visible focus indicators across all interactive components. |
| Motion System | P0 | Durations and easings for overlays, feedback, drag, and skeletons with reduced-motion support. |
| Layer System | P0 | Z-index tokens and overlay stack guidance. |
| Density System | P1 | Compact, default, and comfortable density modes. |
| RTL / DirectionProvider | P1 | Right-to-left support and nested direction scopes. |
| LocaleProvider | P1 | Date, number, byte, relative time, and calendar defaults. |
| Provider Utilities | P0/P1 | Shared provider patterns used by components and examples. |

## Components By Category

| Category | Components |
| --- | --- |
| General | Button, IconButton, ButtonGroup, Link, Typography, Heading, Text, Code, Kbd |
| Layout | Box, Container, Stack, Inline, Flex, Grid, SimpleGrid, Center, Spacer, Divider, Separator, AspectRatio, ScrollArea, Splitter/Resizable, SidebarShell |
| Disclosure | Accordion, Collapsible, Tabs |
| Forms | Form, Field, Fieldset, Label, HelpText, ErrorMessage, Input, Textarea, PasswordInput, NumberInput, PinInput, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Select, NativeSelect, Combobox, Listbox, SearchInput, Rating |
| Advanced Inputs | MultiSelect, TagInput, AsyncSelect, DatePicker, DateRangePicker, TimePicker, DateTimePicker, IntervalPicker, FileUpload, Dropzone, ColorPicker, QueryBuilder |
| Feedback | Alert, Callout, Toast, NotificationCenter, Progress, ProgressCircle, Spinner, Skeleton, EmptyState, LoadingOverlay, StatusIndicator |
| Overlays | Dialog, AlertDialog, Drawer/Sheet, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Menubar, OverlayManager |
| Navigation | Breadcrumb, Pagination, NavigationMenu, NavDock, Sidebar, Steps, Anchor/ScrollSpy, CommandPalette, Tabs as nav |
| Data Display | Card, Badge, Avatar, AvatarGroup, List, DataList, Table, DataTable, DataGrid, Timeline, Stat/KPI, Chart, Calendar, Carousel, CodeBlock, QRCode |
| Productivity | RichTextEditor, TreeView, TreeSelect, Scheduler/EventCalendar, KanbanBoard, SortableList, DragDrop, OnboardingTour |
| AI / Chat | PromptInput, ChatMessage, MessageList, MessageScroller, ConversationList, AttachmentBubble, TypingIndicator, CitationCard, ToolCallCard, ModelPicker |
| Utilities | Portal, VisuallyHidden, FocusTrap, FocusScope, Presence, Transition, ClientOnly, EnvironmentProvider, LocaleProvider, DirectionProvider, CopyButton, Hotkeys, useControllableState, useMediaQuery |

## Priority Quick View

### P0

Button, IconButton, Link, Typography, Heading, Text, Box, Container, Stack, Flex, Grid, Separator, Divider, AspectRatio, ScrollArea, Accordion, Collapsible, Tabs, Form, Field, Fieldset, Label, HelpText, ErrorMessage, Input, Textarea, NumberInput, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Select, NativeSelect, Combobox, Alert, Callout, Toast, Progress, ProgressCircle, Spinner, Skeleton, EmptyState, Dialog, AlertDialog, Drawer/Sheet, Popover, Tooltip, DropdownMenu, Breadcrumb, Pagination, Sidebar, Card, Badge, Avatar, AvatarGroup, List, DataList, Table, DataTable, Calendar, MultiSelect, DatePicker, DateRangePicker, FileUpload/Dropzone, Portal, VisuallyHidden, FocusTrap, FocusScope, ThemeProvider, ColorModeProvider.

### P1

ButtonGroup, Code, Kbd, Inline, SimpleGrid, Center, Spacer, Splitter/Resizable, SidebarShell, PasswordInput, PinInput, Listbox, SearchInput, TagInput, AsyncSelect, TimePicker, DateTimePicker, IntervalPicker, ColorPicker, NotificationCenter, LoadingOverlay, StatusIndicator, HoverCard, ContextMenu, Menubar, OverlayManager, NavigationMenu, Steps, CommandPalette, Timeline, Stat/KPI, Chart, CodeBlock, RichTextEditor, TreeView, TreeSelect, Presence, Transition, ClientOnly, EnvironmentProvider, LocaleProvider, DirectionProvider, CopyButton, useMediaQuery, Dashboard block, CRUD block, Auth block, Settings block, Analytics block.

### P2

Rating, QueryBuilder, DataGrid, Scheduler/EventCalendar, KanbanBoard, SortableList, DragDrop, OnboardingTour, Carousel, QRCode, Anchor/ScrollSpy, Hotkeys, PromptInput, ChatMessage, MessageList, MessageScroller, ConversationList, AttachmentBubble, TypingIndicator, CitationCard, ToolCallCard, ModelPicker, private registry, pro blocks, enterprise tooling.

## Product Blocks

| Block | Priority | Scope |
| --- | --- | --- |
| Auth screens | P1 | Login, register, forgot password, verify email, SSO buttons, passkey recipe. |
| Dashboard shell | P1 | Sidebar, topbar, breadcrumbs, command palette, notifications, responsive drawer. |
| CRUD page | P1 | Filter bar, DataTable, bulk actions, create/edit Dialog/Sheet, delete confirmation, toast flows. |
| Settings page | P1 | Tabs/sidebar nav, forms, feature toggles, danger zone, audit info. |
| Analytics dashboard | P1 | KPI cards, charts, date range, multi-select filters, export action. |
| AI chat shell | P2 | Conversation list, prompt input, message scroller, attachments, citations, model picker. |
| Kanban board | P2 | Columns/cards, drag/drop, filters, assignee tags, empty columns. |
| Scheduler page | P2 | Calendar views, event drawer, filters, resource list. |
| Rich text document page | P2 | Editor, toolbar, comments/metadata sidebar, save state. |
| Onboarding flow | P2 | Checklist, tour, progress steps, welcome screen. |
