export type ComponentTypeId =
  | "general"
  | "layout"
  | "disclosure"
  | "forms"
  | "advanced-inputs"
  | "feedback"
  | "overlays"
  | "navigation"
  | "data-display";

export interface ComponentTypeMeta {
  id: ComponentTypeId;
  name: string;
  description: string;
}

export interface ComponentMeta {
  slug: string;
  name: string;
  description: string;
  type: ComponentTypeId;
}

export interface ComponentGroup extends ComponentTypeMeta {
  components: ComponentMeta[];
}

export const componentCatalog: ComponentMeta[] = [
  {
    slug: "button",
    name: "Button",
    description:
      "Trigger actions with six visual variants, five sizes, icon slots, and a built-in loading state.",
    type: "general",
  },
  {
    slug: "icon-button",
    name: "IconButton",
    description:
      "Icon-only actions with enforced accessible names, five variants, five sizes, shapes, and a loading state.",
    type: "general",
  },
  {
    slug: "button-group",
    name: "ButtonGroup",
    description:
      "Compose related native actions in attached or separated horizontal and vertical groups without changing their behavior.",
    type: "general",
  },
  {
    slug: "dropdown-button",
    name: "DropdownButton",
    description:
      "Open a related action menu from one Button-styled trigger with controlled state, positioning, and Motion-only menu presence.",
    type: "general",
  },
  {
    slug: "reveal-button",
    name: "RevealButton",
    description:
      "Icon-first actions that reveal their label on hover and focus with reduced-motion-safe Motion feedback.",
    type: "general",
  },
  {
    slug: "badge",
    name: "Badge",
    description:
      "Label statuses, counts, and metadata with tokenized variants, tones, sizes, and decorative icon slots.",
    type: "general",
  },
  {
    slug: "link",
    name: "Link",
    description:
      "Navigate with tokenized anchor styling, underline control, and asChild composition for framework routers.",
    type: "general",
  },
  {
    slug: "typography",
    name: "Typography",
    description:
      "Set text hierarchy with Heading, Text, and Typography: levels, sizes, tones, weights, truncation, and clamping.",
    type: "general",
  },
  {
    slug: "hero-text-animation",
    name: "HeroTextAnimation",
    description:
      "Animate hero headlines with accessible, SSR-safe staggered word and line reveals plus reduced-motion fallbacks.",
    type: "general",
  },
  {
    slug: "box",
    name: "Box",
    description:
      "The base layout primitive: tokenized spacing, surfaces, borders, and radius on any semantic element.",
    type: "layout",
  },
  {
    slug: "container",
    name: "Container",
    description:
      "Center page content at tokenized max widths with responsive gutters.",
    type: "layout",
  },
  {
    slug: "stack",
    name: "Stack",
    description:
      "Space children along one axis with tokenized gaps, alignment, and wrapping.",
    type: "layout",
  },
  {
    slug: "flex",
    name: "Flex",
    description:
      "Full flexbox control with tokenized gaps and per-item grow, shrink, and basis through FlexItem.",
    type: "layout",
  },
  {
    slug: "grid",
    name: "Grid",
    description:
      "Two-dimensional layouts with tokenized tracks and gaps, plus per-cell spans through GridItem.",
    type: "layout",
  },
  {
    slug: "separator",
    name: "Separator",
    description:
      "Divide content horizontally or vertically with tone, thickness, spacing, and correct semantics.",
    type: "layout",
  },
  {
    slug: "accordion",
    name: "Accordion",
    description:
      "Reveal rounded vertical blades with single or multiple open modes, arbitrary in-blade content, and Motion choreography.",
    type: "disclosure",
  },
  {
    slug: "horizontal-accordion",
    name: "HorizontalAccordion",
    description:
      "Expand one section at a time in a fixed-height band of always-visible blades with Motion choreography and a compact responsive layout.",
    type: "disclosure",
  },
  {
    slug: "tabs",
    name: "Tabs",
    description:
      "Switch in-page panels with APG semantics, roving focus, pill and line variants, and a reduced-motion-safe gliding active layer.",
    type: "disclosure",
  },
  {
    slug: "form-field",
    name: "FormField",
    description:
      "Give any control accessible field anatomy — label, description, error, and state wiring through one composable Field.",
    type: "forms",
  },
  {
    slug: "input",
    name: "Input",
    description:
      "Collect single-line text with tokenized sizes and accessible invalid, disabled, and read-only states.",
    type: "forms",
  },
  {
    slug: "textarea",
    name: "Textarea",
    description:
      "Collect multi-line text with tokenized sizes, resize control, and accessible invalid and read-only states.",
    type: "forms",
  },
  {
    slug: "number-input",
    name: "NumberInput",
    description:
      "Capture numeric input with the right mobile keypad, native min/max/step semantics, and form states.",
    type: "forms",
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    description:
      "Toggle independent options with a native-input checkbox supporting indeterminate, invalid, and sized states.",
    type: "forms",
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    description:
      "Choose exactly one option from a set of native radio inputs with orientation, size, and state control.",
    type: "forms",
  },
  {
    slug: "select",
    name: "Select",
    description:
      "Pick one option from a popover listbox with typeahead, form states, and native form submission.",
    type: "forms",
  },
  {
    slug: "combobox",
    name: "Combobox",
    description:
      "Filter options as you type with an accessible input-plus-listbox field, custom values, and form states.",
    type: "forms",
  },
  {
    slug: "switch",
    name: "Switch",
    description:
      "Flip settings on and off with a native-input toggle that announces as a switch.",
    type: "forms",
  },
  {
    slug: "async-select",
    name: "AsyncSelect",
    description:
      "Render app-owned async result windows with loading, empty, retry, and single or multiple selection.",
    type: "advanced-inputs",
  },
  {
    slug: "multi-select",
    name: "MultiSelect",
    description:
      "Search and select several values with removable chips and repeated form fields.",
    type: "advanced-inputs",
  },
  {
    slug: "tag-input",
    name: "TagInput",
    description:
      "Author free-form tags with chip editing, paste parsing, validation, and repeated form fields.",
    type: "advanced-inputs",
  },
  {
    slug: "sound-input",
    name: "SoundInput",
    description:
      "Request microphone input, expose a live MediaStream, and show recording or muted state through a Motion-powered waveform pill.",
    type: "advanced-inputs",
  },
  {
    slug: "date-picker",
    name: "DatePicker",
    description:
      "Pick a single date through segmented keyboard input and a popover calendar, with form-ready serialized values.",
    type: "advanced-inputs",
  },
  {
    slug: "date-range-picker",
    name: "DateRangePicker",
    description:
      "Capture start and end dates with linked segments, a range calendar popover, and native start/end form fields.",
    type: "advanced-inputs",
  },
  {
    slug: "date-time-picker",
    name: "DateTimePicker",
    description:
      "Combine date and time selection with granularity, hour-cycle, time-zone, preset, and time-selector options.",
    type: "advanced-inputs",
  },
  {
    slug: "feedback-states",
    name: "Feedback States",
    description:
      "Centralize announcements, loading, progress, skeletons, alerts, callouts, empty states, and actionable toasts.",
    type: "feedback",
  },
  {
    slug: "dialog",
    name: "Dialog",
    description:
      "Modal surfaces with focus trapping, size and dismissal control, plus AlertDialog for explicit confirmation.",
    type: "overlays",
  },
  {
    slug: "popover",
    name: "Popover",
    description:
      "Anchor rich interactive content to a trigger with placement, arrows, and managed focus.",
    type: "overlays",
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    description:
      "Hint at a control's purpose on hover and focus with delay, placement, and arrow options.",
    type: "overlays",
  },
  {
    slug: "dropdown-menu",
    name: "DropdownMenu",
    description:
      "Action menus with sections, icons, shortcuts, descriptions, submenus, and destructive items.",
    type: "overlays",
  },
  {
    slug: "drawer",
    name: "Drawer",
    description:
      "Edge-anchored modal and push panels with spring drag-to-dismiss, snap points, background scale, edge-swipe-to-open, and nested-drawer recede.",
    type: "overlays",
  },
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    description:
      "Show page hierarchy with labelled navigation, current-page semantics, responsive truncation, and overflow for hidden ancestors.",
    type: "navigation",
  },
  {
    slug: "command-palette",
    name: "CommandPalette",
    description:
      "Run typed action, link, and nested page commands with async sources, recents, live announcements, and Motion-aware dialog mode.",
    type: "navigation",
  },
  {
    slug: "navigation-menu",
    name: "NavigationMenu",
    description:
      "Link-first site and app navigation with disclosure flyouts, rich panels, animated indicator, and responsive collapse recipes.",
    type: "navigation",
  },
  {
    slug: "navdock",
    name: "NavDock",
    description:
      "Motion-powered icon dock navigation with title modes, current matching, submenus, placements, and responsive collapsed rails.",
    type: "navigation",
  },
  {
    slug: "pagination",
    name: "Pagination",
    description:
      "Navigate bounded and unbounded result sets with route-backed links, compact responsive layout, and current-page semantics.",
    type: "navigation",
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    description:
      "Compose app navigation with desktop collapse, icon rails, mobile drawers, grouped links, and current-route state.",
    type: "navigation",
  },
  {
    slug: "sidebar-shell",
    name: "SidebarShell",
    description:
      "Frame full application chrome around Sidebar with semantic header, main, and footer regions, skip-link targeting, and workbench or plain treatments.",
    type: "navigation",
  },
  {
    slug: "steps",
    name: "Steps",
    description:
      "Guide branching workflows with horizontal and vertical process indicators, progress, statuses, optional navigation, and Motion choreography.",
    type: "navigation",
  },
  {
    slug: "calendar",
    name: "Calendar",
    description:
      "Select single dates or ranges on keyboard-accessible month grids with locale, bounds, and week-start control.",
    type: "data-display",
  },
  {
    slug: "card",
    name: "Card",
    description:
      "Group related content with a composable header, title, description, action, content, and footer anatomy.",
    type: "data-display",
  },
  {
    slug: "card-stack",
    name: "CardStack",
    description:
      "Cycle Card children as a layered deck or fanned arc with looping, built-in controls, and a controllable index.",
    type: "data-display",
  },
  {
    slug: "avatar",
    name: "Avatar",
    description:
      "Represent people, teams, and systems with generated initials, image fallbacks, tokenized shapes, rings, and motion.",
    type: "data-display",
  },
  {
    slug: "avatar-group",
    name: "AvatarGroup",
    description:
      "Stack identity clusters with overlap, overflow summaries, accessible member lists, and optional reveal behavior.",
    type: "data-display",
  },
  {
    slug: "data-table",
    name: "DataTable",
    description:
      "Sort, filter, select, and paginate row data with column definitions, empty/loading/error states, and server-driven modes.",
    type: "data-display",
  },
  {
    slug: "slot-planner",
    name: "SlotPlanner",
    description:
      "Manage a bookable time-slot inventory with week/day views, recurrence, and constraints, and project the same slots into a viewer's time zone for booking.",
    type: "data-display",
  },
  {
    slug: "table",
    name: "Table",
    description:
      "Present static data with composable, semantic table anatomy: alignment, density, tones, caption, and footer.",
    type: "data-display",
  },
  {
    slug: "timeline",
    name: "Timeline",
    description:
      "Present event histories and step sequences on an interactive track with statuses, selection, and zoomable viewports.",
    type: "data-display",
  },
];

export const componentTypes: ComponentTypeMeta[] = [
  {
    id: "general",
    name: "General",
    description: "Actions, links, icons, and text primitives.",
  },
  {
    id: "layout",
    name: "Layout",
    description: "Responsive layout primitives and structural separators.",
  },
  {
    id: "disclosure",
    name: "Disclosure",
    description: "Progressive reveal and expansion patterns.",
  },
  {
    id: "forms",
    name: "Forms",
    description: "Field anatomy and direct input controls.",
  },
  {
    id: "advanced-inputs",
    name: "Advanced Inputs",
    description: "Search, tagging, async, multi-value, and date input flows.",
  },
  {
    id: "feedback",
    name: "Feedback",
    description: "Loading, messaging, and user state communication.",
  },
  {
    id: "overlays",
    name: "Overlays",
    description: "Layered surfaces anchored to focus, triggers, or workflows.",
  },
  {
    id: "navigation",
    name: "Navigation",
    description: "Wayfinding for pages, sections, commands, and app shells.",
  },
  {
    id: "data-display",
    name: "Data Display",
    description: "Structured content, records, tables, cards, and timelines.",
  },
];

export const componentGroups: ComponentGroup[] = componentTypes
  .map((type) => ({
    ...type,
    components: componentCatalog.filter(
      (component) => component.type === type.id,
    ),
  }))
  .filter((group) => group.components.length > 0);

export function getComponentMeta(slug: string): ComponentMeta | undefined {
  return componentCatalog.find((component) => component.slug === slug);
}
