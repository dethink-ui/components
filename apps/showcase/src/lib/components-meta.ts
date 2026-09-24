export type ComponentTypeId =
  | "general"
  | "layout"
  | "disclosure"
  | "forms"
  | "advanced-inputs"
  | "feedback"
  | "overlays"
  | "navigation"
  | "data-display"
  | "ai"
  | "effects";

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
    slug: "chat-bubble",
    name: "ChatBubble",
    description: "Open a conversation from a floating, animated chat launcher.",
    type: "ai",
  },
  {
    slug: "liquid-mesh-background",
    name: "LiquidMeshBackground",
    description: "Soft pools of color drift and blend behind your content.",
    type: "effects",
  },
  {
    slug: "silk-flow-background",
    name: "SilkFlowBackground",
    description:
      "Satin folds flow across the surface with gentle directional lighting.",
    type: "effects",
  },
  {
    slug: "caustic-light-background",
    name: "CausticLightBackground",
    description: "Moving water-like ridges cast a field of caustic light.",
    type: "effects",
  },
  {
    slug: "contour-field-background",
    name: "ContourFieldBackground",
    description: "Topographic contours evolve through a warped noise field.",
    type: "effects",
  },
  {
    slug: "orbital-glow-background",
    name: "OrbitalGlowBackground",
    description:
      "Luminous elliptical rings surround a soft, slowly shifting core.",
    type: "effects",
  },
  {
    slug: "chat",
    name: "Chat",
    description:
      "Build an AI conversation with messages, a prompt box, attachments, and tool results.",
    type: "ai",
  },
  {
    slug: "button",
    name: "Button",
    description: "Run an action, such as saving a form or opening a dialog.",
    type: "general",
  },
  {
    slug: "icon-button",
    name: "IconButton",
    description: "Show an action as an icon when space is limited.",
    type: "general",
  },
  {
    slug: "button-group",
    name: "ButtonGroup",
    description: "Keep related buttons together in a row or column.",
    type: "general",
  },
  {
    slug: "dropdown-button",
    name: "DropdownButton",
    description: "Open a menu of related actions from a button.",
    type: "general",
  },
  {
    slug: "reveal-button",
    name: "RevealButton",
    description:
      "Show an icon that reveals its label on hover or keyboard focus.",
    type: "general",
  },
  {
    slug: "badge",
    name: "Badge",
    description: "Show a short status, label, or count.",
    type: "general",
  },
  {
    slug: "link",
    name: "Link",
    description: "Take users to another page or a section on the same page.",
    type: "general",
  },
  {
    slug: "typography",
    name: "Typography",
    description:
      "Style headings and body text with consistent sizes, weights, and colors.",
    type: "general",
  },
  {
    slug: "hero-text-animation",
    name: "HeroTextAnimation",
    description: "Reveal a headline one word or line at a time.",
    type: "effects",
  },
  {
    slug: "shader-hero-text",
    name: "ShaderHeroText",
    description:
      "Six WebGL headline effects, including particle lettering that follows your mouse and reforms.",
    type: "effects",
  },
  {
    slug: "grid-beams-background",
    name: "GridBeamsBackground",
    description: "Add moving light beams to a subtle grid background.",
    type: "effects",
  },
  {
    slug: "magnetic-beams-background",
    name: "MagneticBeamsBackground",
    description: "Add grid beams that follow the pointer.",
    type: "effects",
  },
  {
    slug: "aurora-background",
    name: "AuroraBackground",
    description: "Add soft, flowing bands of color behind your content.",
    type: "effects",
  },
  {
    slug: "scan-grid-background",
    name: "ScanGridBackground",
    description: "Move a highlight across a grid background.",
    type: "effects",
  },
  {
    slug: "dot-matrix-background",
    name: "DotMatrixBackground",
    description: "Add gentle pulses of light to a dot grid.",
    type: "effects",
  },
  {
    slug: "light-streaks-background",
    name: "LightStreaksBackground",
    description: "Add moving diagonal streaks of light behind your content.",
    type: "effects",
  },
  {
    slug: "starfield-background",
    name: "StarfieldBackground",
    description:
      "Add a drifting star background with optional pointer movement.",
    type: "effects",
  },
  {
    slug: "box",
    name: "Box",
    description:
      "Wrap content with spacing, a background, a border, or rounded corners.",
    type: "layout",
  },
  {
    slug: "container",
    name: "Container",
    description: "Center page content and limit its width.",
    type: "layout",
  },
  {
    slug: "stack",
    name: "Stack",
    description: "Arrange content in a row or column with even spacing.",
    type: "layout",
  },
  {
    slug: "flex",
    name: "Flex",
    description:
      "Arrange items with control over alignment, wrapping, and available space.",
    type: "layout",
  },
  {
    slug: "grid",
    name: "Grid",
    description: "Arrange content in rows and columns.",
    type: "layout",
  },
  {
    slug: "separator",
    name: "Separator",
    description: "Add a horizontal or vertical line between sections.",
    type: "layout",
  },
  {
    slug: "accordion",
    name: "Accordion",
    description: "Let users expand and collapse sections of content.",
    type: "disclosure",
  },
  {
    slug: "horizontal-accordion",
    name: "HorizontalAccordion",
    description: "Expand one panel at a time in a horizontal row.",
    type: "disclosure",
  },
  {
    slug: "tabs",
    name: "Tabs",
    description: "Switch between related views without leaving the page.",
    type: "disclosure",
  },
  {
    slug: "form-field",
    name: "FormField",
    description:
      "Connect a form control to its label, help text, and error message.",
    type: "forms",
  },
  {
    slug: "input",
    name: "Input",
    description:
      "Collect a single line of text, such as a name or email address.",
    type: "forms",
  },
  {
    slug: "textarea",
    name: "Textarea",
    description:
      "Collect several lines of text, such as a message or description.",
    type: "forms",
  },
  {
    slug: "number-input",
    name: "NumberInput",
    description:
      "Collect a number with optional minimum, maximum, and step values.",
    type: "forms",
  },
  {
    slug: "slider",
    name: "Slider",
    description:
      "Choose a value, range, or labelled milestone with an accessible slider.",
    type: "forms",
  },
  {
    slug: "resizable",
    name: "Resizable Panels",
    description: "Compose, resize, focus and restore useful workspaces.",
    type: "layout",
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    description: "Let users turn individual options on or off.",
    type: "forms",
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    description: "Let users choose one option from a visible list.",
    type: "forms",
  },
  {
    slug: "select",
    name: "Select",
    description: "Let users choose one option from a dropdown list.",
    type: "forms",
  },
  {
    slug: "combobox",
    name: "Combobox",
    description: "Let users search a list and choose an option.",
    type: "forms",
  },
  {
    slug: "switch",
    name: "Switch",
    description: "Turn a setting on or off.",
    type: "forms",
  },
  {
    slug: "async-select",
    name: "AsyncSelect",
    description:
      "Let users choose from options loaded by your app, with loading and retry states.",
    type: "advanced-inputs",
  },
  {
    slug: "multi-select",
    name: "MultiSelect",
    description: "Let users search for and choose several options.",
    type: "advanced-inputs",
  },
  {
    slug: "tag-input",
    name: "TagInput",
    description: "Let users add, edit, and remove text tags.",
    type: "advanced-inputs",
  },
  {
    slug: "voice-input",
    name: "VoiceInput",
    description: "Capture microphone audio and show its input level.",
    type: "advanced-inputs",
  },
  {
    slug: "date-picker",
    name: "DatePicker",
    description: "Let users type a date or choose one from a calendar.",
    type: "advanced-inputs",
  },
  {
    slug: "date-range-picker",
    name: "DateRangePicker",
    description: "Let users choose a start date and an end date.",
    type: "advanced-inputs",
  },
  {
    slug: "date-time-picker",
    name: "DateTimePicker",
    description: "Let users choose a date and time.",
    type: "advanced-inputs",
  },
  {
    slug: "feedback-states",
    name: "Feedback States",
    description:
      "Show loading, progress, errors, empty states, and notifications.",
    type: "feedback",
  },
  {
    slug: "dialog",
    name: "Dialog",
    description:
      "Open a focused window above the page for a task or confirmation.",
    type: "overlays",
  },
  {
    slug: "popover",
    name: "Popover",
    description: "Show extra content next to a button or other trigger.",
    type: "overlays",
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    description: "Show a short hint when users hover over or focus a control.",
    type: "overlays",
  },
  {
    slug: "dropdown-menu",
    name: "DropdownMenu",
    description: "Show a menu of actions when users open a trigger.",
    type: "overlays",
  },
  {
    slug: "drawer",
    name: "Drawer",
    description: "Open a panel from the edge of the screen.",
    type: "overlays",
  },
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    description: "Show where the current page sits in the site hierarchy.",
    type: "navigation",
  },
  {
    slug: "command-palette",
    name: "CommandPalette",
    description: "Let users search for actions and pages from one place.",
    type: "navigation",
  },
  {
    slug: "navigation-menu",
    name: "NavigationMenu",
    description: "Group page links in a menu with optional dropdown panels.",
    type: "navigation",
  },
  {
    slug: "navdock",
    name: "NavDock",
    description: "Show navigation links in a compact icon dock.",
    type: "navigation",
  },
  {
    slug: "pagination",
    name: "Pagination",
    description: "Let users move between pages of results.",
    type: "navigation",
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    description: "Organize app navigation in a sidebar that can collapse.",
    type: "navigation",
  },
  {
    slug: "sidebar-activity",
    name: "SidebarActivity",
    description:
      "Keep background work, progress, and attention items visible in a sidebar.",
    type: "navigation",
  },
  {
    slug: "bottom-bar",
    name: "BottomBar",
    description:
      "Compose a collapsible bottom work panel with custom content and sizing.",
    type: "navigation",
  },
  {
    slug: "sidebar-shell",
    name: "SidebarShell",
    description:
      "Arrange a sidebar, header, main content, and footer into an app layout.",
    type: "navigation",
  },
  {
    slug: "steps",
    name: "Steps",
    description: "Show the current step and progress through a task.",
    type: "navigation",
  },
  {
    slug: "calendar",
    name: "Calendar",
    description: "Let users choose a date or date range from a month view.",
    type: "data-display",
  },
  {
    slug: "card",
    name: "Card",
    description: "Group related content and actions in a single panel.",
    type: "data-display",
  },
  {
    slug: "carousel",
    name: "Carousel",
    description: "Let users browse a series of cards or images.",
    type: "data-display",
  },
  {
    slug: "card-scroller",
    name: "CardScroller",
    description: "Let users scroll through and select cards in a row.",
    type: "data-display",
  },
  {
    slug: "card-stack",
    name: "CardStack",
    description: "Let users browse cards arranged in a stack or fan.",
    type: "data-display",
  },
  {
    slug: "card-stack-animated",
    name: "CardStackAnimated",
    description: "Directional card decks with optional touch navigation.",
    type: "data-display",
  },
  {
    slug: "avatar",
    name: "Avatar",
    description: "Represent a person or team with an image or initials.",
    type: "data-display",
  },
  {
    slug: "avatar-group",
    name: "AvatarGroup",
    description: "Show a group of people with overlapping avatars.",
    type: "data-display",
  },
  {
    slug: "data-table",
    name: "DataTable",
    description:
      "Display rows of data with sorting, filtering, selection, and pagination.",
    type: "data-display",
  },
  {
    slug: "slot-planner",
    name: "SlotPlanner",
    description:
      "Manage available time slots and let users request bookings in their time zone.",
    type: "data-display",
  },
  {
    slug: "table",
    name: "Table",
    description: "Display data in rows and columns.",
    type: "data-display",
  },
  {
    slug: "timeline",
    name: "Timeline",
    description: "Show events in order with statuses and optional selection.",
    type: "data-display",
  },
];

export const componentTypes: ComponentTypeMeta[] = [
  {
    id: "general",
    name: "General",
    description: "Buttons, links, labels, and text.",
  },
  {
    id: "layout",
    name: "Layout",
    description: "Spacing, alignment, grids, and dividers.",
  },
  {
    id: "disclosure",
    name: "Disclosure",
    description: "Expandable sections and switchable views.",
  },
  {
    id: "forms",
    name: "Forms",
    description: "Labels, text fields, and choice controls.",
  },
  {
    id: "advanced-inputs",
    name: "Advanced Inputs",
    description: "Searchable lists, tags, dates, and audio input.",
  },
  {
    id: "feedback",
    name: "Feedback",
    description: "Loading indicators, status messages, and notifications.",
  },
  {
    id: "overlays",
    name: "Overlays",
    description: "Dialogs, menus, tooltips, and panels.",
  },
  {
    id: "navigation",
    name: "Navigation",
    description: "Menus and controls for moving around an app.",
  },
  {
    id: "data-display",
    name: "Data Display",
    description: "Structured content, records, tables, cards, and timelines.",
  },
  {
    id: "ai",
    name: "AI / Chat",
    description: "Messages, prompts, and conversation tools.",
  },
  {
    id: "effects",
    name: "Effects",
    description:
      "Animated backgrounds and decorative motion for landing pages and heroes.",
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

const componentDisplayNameOverrides: Partial<Record<string, string>> = {
  "date-time-picker": "Date & Time Picker",
  navdock: "NavDock",
};

export function getComponentDisplayName(
  component: Pick<ComponentMeta, "name" | "slug">,
): string {
  return (
    componentDisplayNameOverrides[component.slug] ??
    component.name
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
  );
}

export function normalizeComponentSearchValue(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function filterComponentGroups(query: string): ComponentGroup[] {
  const normalizedQuery = normalizeComponentSearchValue(query);
  const terms = normalizedQuery.split(" ").filter(Boolean);

  if (terms.length === 0) {
    return componentGroups;
  }

  const exactComponentSlugs = new Set(
    componentCatalog
      .filter((component) =>
        [component.name, getComponentDisplayName(component)]
          .map(normalizeComponentSearchValue)
          .includes(normalizedQuery),
      )
      .map((component) => component.slug),
  );

  return componentGroups
    .map((group) => ({
      ...group,
      components: group.components.filter((component) => {
        if (exactComponentSlugs.size > 0) {
          return exactComponentSlugs.has(component.slug);
        }

        const searchableValue = normalizeComponentSearchValue(
          [
            component.name,
            getComponentDisplayName(component),
            component.description,
            group.name,
            group.description,
          ].join(" "),
        );

        return terms.every((term) => searchableValue.includes(term));
      }),
    }))
    .filter((group) => group.components.length > 0);
}

export function getComponentMeta(slug: string): ComponentMeta | undefined {
  return componentCatalog.find((component) => component.slug === slug);
}

export function getComponentMetaByName(
  name: string,
): ComponentMeta | undefined {
  const normalizedName = normalizeComponentSearchValue(name);

  return componentCatalog.find((component) =>
    [component.name, getComponentDisplayName(component)]
      .map(normalizeComponentSearchValue)
      .includes(normalizedName),
  );
}
