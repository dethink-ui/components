import { getComponentMeta, type ComponentMeta } from "@/lib/components-meta";

export type RecipeCategory =
  | "auth"
  | "marketing"
  | "dashboard"
  | "data"
  | "settings"
  | "ai"
  | "scheduling"
  | "billing";

export type RecipeComplexity = "Starter" | "Intermediate" | "Advanced";

export interface RecipeMeta {
  slug: string;
  title: string;
  category: RecipeCategory;
  summary: string;
  tags: string[];
  components: string[];
  sourceFile: string;
  featured: boolean;
  complexity: RecipeComplexity;
  motionNotes: string;
  accessibilityNotes: string;
  responsiveNotes: string;
}

export interface RecipeCategoryMeta {
  id: RecipeCategory;
  name: string;
  description: string;
}

export const recipeCategories: RecipeCategoryMeta[] = [
  {
    id: "auth",
    name: "Auth",
    description: "Sign-in, onboarding, and account entry flows.",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Landing pages, product storytelling, and conversion bands.",
  },
  {
    id: "dashboard",
    name: "Dashboards",
    description:
      "App shells, metrics, filters, and operational command centers.",
  },
  {
    id: "data",
    name: "Data",
    description: "CRUD screens, tables, row actions, and record workflows.",
  },
  {
    id: "settings",
    name: "Settings",
    description: "Configuration, billing controls, and danger-zone flows.",
  },
  {
    id: "ai",
    name: "AI",
    description:
      "AI-native workspaces using today’s navigation and feedback primitives.",
  },
  {
    id: "scheduling",
    name: "Scheduling",
    description: "Availability management and booking experiences.",
  },
  {
    id: "billing",
    name: "Billing",
    description: "Checkout-like order summaries and subscription decisions.",
  },
];

export const recipesCatalog: RecipeMeta[] = [
  {
    slug: "login-and-onboarding",
    title: "Onboarding workspace",
    category: "auth",
    summary:
      "A responsive workspace onboarding flow with a generic top navigation and a branch-aware step sequence for solo and team setups.",
    tags: ["Onboarding", "Steps", "Navigation", "Forms"],
    components: ["steps", "form-field", "input", "button", "link"],
    sourceFile: "recipes/login-and-onboarding.tsx",
    featured: true,
    complexity: "Intermediate",
    motionNotes:
      "The Steps component uses its subtle motion preset for branch changes and progress, while its built-in reduced-motion handling preserves clear state changes.",
    accessibilityNotes:
      "The navbar uses semantic navigation, each form control has a visible label, and native radios keep the dynamic path choice keyboard-accessible.",
    responsiveNotes:
      "Navigation remains available in a horizontally scrollable mobile row, while the onboarding preview stacks below the workflow at narrower widths.",
  },
  {
    slug: "daymark-landing",
    title: "Daymark hospitality launch landing",
    category: "marketing",
    summary:
      "A warm editorial launch page for hospitality, restaurant, and retail teams, with a live opening room, sunlit hero, richly styled guest-note card rail, and opening-day walkthrough.",
    tags: ["Landing", "Hospitality", "Editorial", "Launch"],
    components: [
      "hero-text-animation",
      "light-streaks-background",
      "reveal-button",
      "card-scroller",
      "card-stack",
      "progress",
      "badge",
      "card",
      "button",
      "separator",
    ],
    sourceFile: "recipes/daymark-landing.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "LightStreaksBackground gives the warm hero a slow, decorative sweep while HeroTextAnimation opens the message. CardScroller, CardStack, and RevealButton handle their own reduced-motion-safe interaction states.",
    accessibilityNotes:
      "The page has a single readable hero heading, semantic header, navigation, sections, and footer landmarks. The opening-room meters expose accessible progress values, while each guest note is a labelled, keyboard-operable radio option in the card rail.",
    responsiveNotes:
      "The opening-room dashboard moves from a dense desktop grid to stacked room cards, the guest-note rail becomes a one-up touch scroller at narrow widths, and the hero actions stay touch-friendly without hiding the main path.",
  },
  {
    slug: "lumen-landing",
    title: "Lumen creative operations landing",
    category: "marketing",
    summary:
      "An expressive, dark-mode landing page for a fictional creative operating system, combining a kinetic hero, interactive project console, animated background layers, a narrative card rail, proof deck, and compact navigation dock.",
    tags: ["Landing", "Creative Ops", "Motion", "Storytelling"],
    components: [
      "hero-text-animation",
      "reveal-button",
      "navdock",
      "card-scroller",
      "card-stack",
      "grid-beams-background",
      "starfield-background",
      "card",
      "button",
      "separator",
    ],
    sourceFile: "recipes/lumen-landing.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "HeroTextAnimation gives the message its kinetic emphasis, while GridBeamsBackground and StarfieldBackground provide self-pausing decorative depth. NavDock, CardScroller, CardStack, and RevealButton each bring their own reduced-motion-aware interaction instead of relying on page-level scroll tricks.",
    accessibilityNotes:
      "The hero has a single readable accessible name, decorative layers stay out of the accessibility tree, the project meter exposes progress semantics, and every dock item remains a real link or button with an explicit label.",
    responsiveNotes:
      "The desktop studio console hides its decorative sidebar on narrow screens, the card rail becomes a touch-friendly one-up scroller, the dock auto-collapses when space is limited, and the proof section keeps its reading order when the deck stacks.",
  },
  {
    slug: "saas-landing-page",
    title: "SaaS landing page",
    category: "marketing",
    summary:
      "A conversion-focused SaaS page with product navigation, animated hero copy, feature bento cards, pricing, FAQ, and CTA.",
    tags: ["Landing", "Hero", "Bento", "Pricing"],
    components: [
      "navigation-menu",
      "hero-text-animation",
      "button",
      "reveal-button",
      "card",
      "card-stack",
      "grid",
      "horizontal-accordion",
    ],
    sourceFile: "recipes/saas-landing-page.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "HeroTextAnimation handles readable word reveals, CardStack cycles proof cards, and feature cards use transform-only hover polish.",
    accessibilityNotes:
      "The hero remains readable without animation, navigation links stay semantic, and FAQ content uses the accordion’s keyboard model.",
    responsiveNotes:
      "The bento grid collapses into a single-column story and the navigation remains usable without flyout-only discovery.",
  },
  {
    slug: "dethink-labs-security",
    title: "Security platform landing",
    category: "marketing",
    summary:
      "A zero-trust security product landing page composed almost entirely from interactive Dethink components: a NavigationMenu pill nav, an animated hero beside a live Tabs/Table/Switch/ProgressCircle console, a reusable Dialog+form that fires Toasts, a defense-in-depth feature bento, an incident-response Timeline, a Switch-driven pricing toggle, and an Accordion FAQ.",
    tags: ["Landing", "Security", "Interactive", "Dashboard"],
    components: [
      "hero-text-animation",
      "navigation-menu",
      "tabs",
      "table",
      "dialog",
      "timeline",
      "accordion",
      "switch",
      "badge",
      "avatar-group",
      "tooltip",
      "reveal-button",
      "feedback-states",
      "card",
      "grid",
    ],
    sourceFile: "recipes/dethink-labs-security.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "HeroTextAnimation reveals the headline (blur-focus, emphasising “breach”); the hero console is a live Tabs surface with a Switch that pauses monitoring and a ProgressCircle coverage dial; RevealButtons expand on hover, the NavigationMenu Platform flyout animates open, and the radar sweep plus status pulses run only under motion-safe.",
    accessibilityNotes:
      "Demo CTAs open a focus-trapped Dialog whose form announces success through Toast; NavigationMenu, Tabs, Accordion, and Dialog carry their own keyboard/focus models; the monitoring Switch and pricing toggle are labelled Fields; access/endpoint states are conveyed by Badge text (granted/denied, isolated) not color alone; and the headline stays readable when motion is reduced.",
    responsiveNotes:
      "The pill nav collapses its links and icon controls on small screens, the feature bento folds from a six-column grid to a single story column, and the threat console stacks its feed above the score panel.",
  },
  {
    slug: "heliogrid-energy",
    title: "Energy orchestration landing",
    category: "marketing",
    summary:
      "A production-grade clean-energy platform landing page with a Signal Control hero, live dispatch console, operational proof, rollout timeline, audit conversion flow, and FAQ.",
    tags: ["Landing", "Energy", "Interactive", "Enterprise"],
    components: [
      "navigation-menu",
      "hero-text-animation",
      "badge",
      "button",
      "reveal-button",
      "card",
      "tabs",
      "switch",
      "progress",
      "table",
      "grid",
      "dialog",
      "form-field",
      "input",
      "select",
      "timeline",
      "avatar-group",
      "accordion",
      "toast",
      "separator",
    ],
    sourceFile: "recipes/heliogrid-energy.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "HeroTextAnimation introduces the headline, while Dethink Tabs, Progress, Dialog, Toast, and restrained motion-safe state transitions keep product feedback clear without decorative scroll choreography.",
    accessibilityNotes:
      "The dispatch console uses labelled tabs, switches, progress, and status text; the audit flow uses visible labels and native validation; navigation, FAQ, timeline, dialog focus, and feedback inherit Dethink keyboard and announcement models.",
    responsiveNotes:
      "The split hero becomes a single-column story, the dispatch table keeps deliberate horizontal overflow, navigation moves into a Dethink Dialog, and all supporting grids collapse without changing content order.",
  },
  {
    slug: "hush-and-hearth",
    title: "Curated travel landing",
    category: "marketing",
    summary:
      "An editorial slow-travel landing page with a seasonal planning hero, responsive local photography, curated stay cards, a human planning flow, traveller proof, and FAQ.",
    tags: ["Landing", "Travel", "Editorial", "Booking"],
    components: [
      "navigation-menu",
      "hero-text-animation",
      "badge",
      "button",
      "card",
      "tabs",
      "date-range-picker",
      "select",
      "dialog",
      "form-field",
      "input",
      "avatar-group",
      "accordion",
      "feedback-states",
      "separator",
    ],
    sourceFile: "recipes/hush-and-hearth.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "HeroTextAnimation gives the editorial headline a restrained curtain reveal, while Tabs, Dialog, Toast, image hover transforms, and focus feedback stay subtle and reduced-motion aware.",
    accessibilityNotes:
      "Navigation, seasonal tabs, date and guest inputs, the curator dialog, form labels, FAQ, and success feedback use Dethink keyboard and announcement models; photography includes descriptive alt text and content never relies on imagery alone.",
    responsiveNotes:
      "The asymmetric hero becomes a text-first single-column story, local Next.js images advertise responsive sizes, the planner and seasonal cards stack cleanly, and primary navigation moves into a Dethink Dialog.",
  },
  {
    slug: "command-center-dashboard",
    title: "Command-center dashboard",
    category: "dashboard",
    summary:
      "A full app command center with sidebar navigation, breadcrumbs, command search, KPI cards, date filters, and incident data.",
    tags: ["Dashboard", "Sidebar", "Command palette", "Filters"],
    components: [
      "sidebar",
      "breadcrumb",
      "command-palette",
      "data-table",
      "date-range-picker",
      "multi-select",
      "progress",
      "card",
    ],
    sourceFile: "recipes/command-center-dashboard.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "Sidebar and command-palette choreography come from Dethink components; KPI cards use restrained motion-safe hover transitions.",
    accessibilityNotes:
      "Sidebar links keep current state, command actions are labelled, and filters remain visible form controls.",
    responsiveNotes:
      "The dashboard compacts into a stacked content area while preserving the navigation region and table overflow.",
  },
  {
    slug: "crud-resource-manager",
    title: "CRUD resource manager",
    category: "data",
    summary:
      "A record-management surface with searchable rows, row actions, edit drawer, create dialog, delete confirmation, empty state, and toast feedback.",
    tags: ["CRUD", "DataTable", "Drawer", "Dialog"],
    components: [
      "data-table",
      "dialog",
      "drawer",
      "dropdown-menu",
      "select",
      "async-select",
      "feedback-states",
      "empty-state",
    ],
    sourceFile: "recipes/crud-resource-manager.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "Drawer and Dialog provide overlay transitions while row-level actions keep changes visible through live status and Toast feedback.",
    accessibilityNotes:
      "Create, edit, and destructive paths use labelled modal surfaces, explicit confirmation, and visible empty-state actions.",
    responsiveNotes:
      "Record details move into a drawer so the table remains scannable on smaller screens.",
  },
  {
    slug: "settings-and-billing",
    title: "Settings and billing",
    category: "settings",
    summary:
      "An account settings page with profile fields, feature toggles, plan selection, invoice rows, usage controls, and a danger zone.",
    tags: ["Settings", "Billing", "Forms", "Danger zone"],
    components: [
      "form-field",
      "switch",
      "radio-group",
      "select",
      "number-input",
      "table",
      "feedback-states",
      "dialog",
    ],
    sourceFile: "recipes/settings-and-billing.tsx",
    featured: false,
    complexity: "Intermediate",
    motionNotes:
      "Plan and settings sections use tokenized hover/focus transitions, and the destructive action uses AlertDialog motion.",
    accessibilityNotes:
      "Controls are grouped by purpose with visible labels, descriptions, and explicit destructive confirmation.",
    responsiveNotes:
      "Settings sections stack naturally while invoice rows keep numeric alignment and horizontal breathing room.",
  },
  {
    slug: "ai-workspace",
    title: "AI workspace",
    category: "ai",
    summary:
      "An AI-native workspace using current navigation, command, timeline, loading, and composition primitives before dedicated chat components exist.",
    tags: ["AI", "Workspace", "Timeline", "Skeleton"],
    components: [
      "sidebar",
      "navdock",
      "command-palette",
      "textarea",
      "timeline",
      "card-stack",
      "skeleton",
      "progress",
    ],
    sourceFile: "recipes/ai-workspace.tsx",
    featured: false,
    complexity: "Advanced",
    motionNotes:
      "NavDock, Sidebar, Timeline, CardStack, and Skeleton create lively but bounded AI workspace feedback.",
    accessibilityNotes:
      "Prompt input stays labelled, navigation is link/button based, and loading states avoid animation-only status.",
    responsiveNotes:
      "The dock and side content collapse into a denser operations layout on narrow screens.",
  },
  {
    slug: "customer-support-copilot",
    title: "Customer Support Copilot",
    category: "ai",
    summary:
      "A communication-focused support inbox with a responsive app shell, selectable customer conversations, semantic message history, and an accessible text-reply workflow.",
    tags: ["Support", "Inbox", "Copilot", "Conversations", "Reply"],
    components: [
      "sidebar",
      "avatar",
      "badge",
      "form-field",
      "textarea",
      "button",
    ],
    sourceFile: "recipes/customer-support-copilot.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "Sidebar collapse and component-native state changes provide restrained feedback; the recipe adds no page-level animation and remains clear with reduced motion.",
    accessibilityNotes:
      "Conversation choices are native pressed buttons inside in-page navigation, messages use a semantic list, the composer has an explicit label and linked error, and submitted replies are announced politely.",
    responsiveNotes:
      "The conversation queue stacks above the selected thread on narrow screens, while desktop widths keep a stable two-column inbox inside the collapsible app shell.",
  },
  {
    slug: "scheduler-and-booking",
    title: "Scheduler and booking",
    category: "scheduling",
    summary:
      "A scheduling surface that pairs internal availability management with a public booking panel and event detail drawer.",
    tags: ["Scheduler", "Booking", "Availability", "Drawer"],
    components: [
      "slot-planner",
      "calendar",
      "date-time-picker",
      "date-range-picker",
      "drawer",
      "feedback-states",
    ],
    sourceFile: "recipes/scheduler-and-booking.tsx",
    featured: false,
    complexity: "Advanced",
    motionNotes:
      "SlotPlanner handles slot transitions and the detail drawer adds a focused motion layer for reviewing selected sessions.",
    accessibilityNotes:
      "Calendar and slot controls remain keyboard reachable, and booking actions are announced through Toast.",
    responsiveNotes:
      "Planner and booking panels stack into a single-column workflow below desktop widths.",
  },
  {
    slug: "saas-checkout-order-summary",
    title: "SaaS checkout order summary",
    category: "billing",
    summary:
      "A B2B checkout-style subscription flow with plan selection, usage inputs, order table, progress, alert messaging, and confirmation.",
    tags: ["Checkout", "Order summary", "Subscription", "Progress"],
    components: [
      "card",
      "radio-group",
      "input",
      "number-input",
      "table",
      "progress",
      "feedback-states",
      "button",
    ],
    sourceFile: "recipes/saas-checkout-order-summary.tsx",
    featured: false,
    complexity: "Intermediate",
    motionNotes:
      "The order summary uses step progress and motion-safe selection hover states without page-level animation dependencies.",
    accessibilityNotes:
      "Plan selection uses radios, quantities use number inputs, and payment status uses Alert semantics.",
    responsiveNotes:
      "The order summary follows the form on mobile and sits beside it on wider screens.",
  },
];

export const featuredRecipes = recipesCatalog.filter(
  (recipe) => recipe.featured,
);

export function getRecipeMeta(slug: string): RecipeMeta | undefined {
  return recipesCatalog.find((recipe) => recipe.slug === slug);
}

export function getRecipeCategoryMeta(
  category: RecipeCategory,
): RecipeCategoryMeta {
  return (
    recipeCategories.find((item) => item.id === category) ??
    recipeCategories[0]!
  );
}

export function getRecipeComponentMetas(recipe: RecipeMeta) {
  return recipe.components
    .map((slug) => getComponentMeta(slug))
    .filter((component): component is ComponentMeta => Boolean(component));
}
