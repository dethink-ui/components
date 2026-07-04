export interface ComponentMeta {
  slug: string;
  name: string;
  description: string;
}

export const componentCatalog: ComponentMeta[] = [
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
    slug: "input",
    name: "Input",
    description:
      "Collect single-line text with tokenized sizes and accessible invalid, disabled, and read-only states.",
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
    slug: "switch",
    name: "Switch",
    description:
      "Flip settings on and off with a native-input toggle that announces as a switch.",
  },
];

export const upcomingComponents = [
  "Dialog",
  "Tooltip",
  "Dropdown Menu",
  "Data Table",
];

export function getComponentMeta(slug: string): ComponentMeta | undefined {
  return componentCatalog.find((component) => component.slug === slug);
}
