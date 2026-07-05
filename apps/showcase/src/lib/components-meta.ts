export interface ComponentMeta {
  slug: string;
  name: string;
  description: string;
}

export const componentCatalog: ComponentMeta[] = [
  {
    slug: "box",
    name: "Box",
    description:
      "The base layout primitive: tokenized spacing, surfaces, borders, and radius on any semantic element.",
  },
  {
    slug: "button",
    name: "Button",
    description:
      "Trigger actions with six visual variants, five sizes, icon slots, and a built-in loading state.",
  },
  {
    slug: "calendar",
    name: "Calendar",
    description:
      "Select single dates or ranges on keyboard-accessible month grids with locale, bounds, and week-start control.",
  },
  {
    slug: "card",
    name: "Card",
    description:
      "Group related content with a composable header, title, description, action, content, and footer anatomy.",
  },
  {
    slug: "card-stack",
    name: "CardStack",
    description:
      "Cycle Card children as a layered deck or fanned arc with looping, built-in controls, and a controllable index.",
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    description:
      "Toggle independent options with a native-input checkbox supporting indeterminate, invalid, and sized states.",
  },
  {
    slug: "combobox",
    name: "Combobox",
    description:
      "Filter options as you type with an accessible input-plus-listbox field, custom values, and form states.",
  },
  {
    slug: "async-select",
    name: "AsyncSelect",
    description:
      "Render app-owned async result windows with loading, empty, retry, and single or multiple selection.",
  },
  {
    slug: "multi-select",
    name: "MultiSelect",
    description:
      "Search and select several values with removable chips and repeated form fields.",
  },
  {
    slug: "tag-input",
    name: "TagInput",
    description:
      "Author free-form tags with chip editing, paste parsing, validation, and repeated form fields.",
  },
  {
    slug: "container",
    name: "Container",
    description:
      "Center page content at tokenized max widths with responsive gutters.",
  },
  {
    slug: "data-table",
    name: "DataTable",
    description:
      "Sort, filter, select, and paginate row data with column definitions, empty/loading/error states, and server-driven modes.",
  },
  {
    slug: "date-picker",
    name: "DatePicker",
    description:
      "Pick a single date through segmented keyboard input and a popover calendar, with form-ready serialized values.",
  },
  {
    slug: "date-range-picker",
    name: "DateRangePicker",
    description:
      "Capture start and end dates with linked segments, a range calendar popover, and native start/end form fields.",
  },
  {
    slug: "date-time-picker",
    name: "DateTimePicker",
    description:
      "Combine date and time selection with granularity, hour-cycle, time-zone, preset, and time-selector options.",
  },
  {
    slug: "dialog",
    name: "Dialog",
    description:
      "Modal surfaces with focus trapping, size and dismissal control, plus AlertDialog for explicit confirmation.",
  },
  {
    slug: "dropdown-menu",
    name: "DropdownMenu",
    description:
      "Action menus with sections, icons, shortcuts, descriptions, submenus, and destructive items.",
  },
  {
    slug: "flex",
    name: "Flex",
    description:
      "Full flexbox control with tokenized gaps and per-item grow, shrink, and basis through FlexItem.",
  },
  {
    slug: "form-field",
    name: "FormField",
    description:
      "Give any control accessible field anatomy — label, description, error, and state wiring through one composable Field.",
  },
  {
    slug: "grid",
    name: "Grid",
    description:
      "Two-dimensional layouts with tokenized tracks and gaps, plus per-cell spans through GridItem.",
  },
  {
    slug: "horizontal-accordion",
    name: "HorizontalAccordion",
    description:
      "Expand one section at a time in a fixed-height band of always-visible blades with Motion choreography and a compact responsive layout.",
  },
  {
    slug: "icon-button",
    name: "IconButton",
    description:
      "Icon-only actions with enforced accessible names, five variants, five sizes, shapes, and a loading state.",
  },
  {
    slug: "input",
    name: "Input",
    description:
      "Collect single-line text with tokenized sizes and accessible invalid, disabled, and read-only states.",
  },
  {
    slug: "link",
    name: "Link",
    description:
      "Navigate with tokenized anchor styling, underline control, and asChild composition for framework routers.",
  },
  {
    slug: "navigation-menu",
    name: "NavigationMenu",
    description:
      "Link-first site and app navigation with disclosure flyouts, rich panels, animated indicator, and responsive collapse recipes.",
  },
  {
    slug: "navdock",
    name: "NavDock",
    description:
      "Motion-powered icon dock navigation with title modes, current matching, submenus, placements, and responsive collapsed rails.",
  },
  {
    slug: "number-input",
    name: "NumberInput",
    description:
      "Capture numeric input with the right mobile keypad, native min/max/step semantics, and form states.",
  },
  {
    slug: "popover",
    name: "Popover",
    description:
      "Anchor rich interactive content to a trigger with placement, arrows, and managed focus.",
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    description:
      "Choose exactly one option from a set of native radio inputs with orientation, size, and state control.",
  },
  {
    slug: "select",
    name: "Select",
    description:
      "Pick one option from a popover listbox with typeahead, form states, and native form submission.",
  },
  {
    slug: "separator",
    name: "Separator",
    description:
      "Divide content horizontally or vertically with tone, thickness, spacing, and correct semantics.",
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    description:
      "Compose app navigation with desktop collapse, icon rails, mobile drawers, grouped links, and current-route state.",
  },
  {
    slug: "stack",
    name: "Stack",
    description:
      "Space children along one axis with tokenized gaps, alignment, and wrapping.",
  },
  {
    slug: "switch",
    name: "Switch",
    description:
      "Flip settings on and off with a native-input toggle that announces as a switch.",
  },
  {
    slug: "table",
    name: "Table",
    description:
      "Present static data with composable, semantic table anatomy: alignment, density, tones, caption, and footer.",
  },
  {
    slug: "textarea",
    name: "Textarea",
    description:
      "Collect multi-line text with tokenized sizes, resize control, and accessible invalid and read-only states.",
  },
  {
    slug: "timeline",
    name: "Timeline",
    description:
      "Present event histories and step sequences on an interactive track with statuses, selection, and zoomable viewports.",
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    description:
      "Hint at a control's purpose on hover and focus with delay, placement, and arrow options.",
  },
  {
    slug: "typography",
    name: "Typography",
    description:
      "Set text hierarchy with Heading, Text, and Typography: levels, sizes, tones, weights, truncation, and clamping.",
  },
];

export function getComponentMeta(slug: string): ComponentMeta | undefined {
  return componentCatalog.find((component) => component.slug === slug);
}
