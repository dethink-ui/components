import { getComponentMeta, type ComponentMeta } from "./components-meta";

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
    slug: "beacon-landing",
    title: "Beacon incident-response landing",
    category: "marketing",
    summary:
      "A product landing page with a live incident-replay hero and a pinned, scroll-driven stage that assembles a working incident app from real components, followed by feature tabs, pricing toggle, customer stories, FAQ and a validated trial sign-up.",
    tags: ["Landing page", "Scrollytelling", "Incident response", "Motion"],
    components: [
      "navigation-menu",
      "hero-text-animation",
      "scan-grid-background",
      "steps",
      "avatar-group",
      "icon-button",
      "sidebar",
      "breadcrumb",
      "card",
      "table",
      "badge",
      "feedback-states",
      "command-palette",
      "chat",
      "tabs",
      "switch",
      "card-scroller",
      "avatar",
      "accordion",
      "form-field",
      "input",
      "button",
      "reveal-button",
    ],
    sourceFile: "recipes/beacon-landing.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "The hero replays a scripted incident (Steps, latency bars, responders, activity log) with pause and replay controls; it pauses off-screen and on hidden tabs, and starts paused on the resolved state for reduced motion. The assembly stage reveals each layer with tokenized transform and opacity transitions as story steps cross the viewport; Motion only drives the incident table's layout re-sort. Reduced motion removes the transitions, sorts instantly and shows the copilot reply in full.",
    accessibilityNotes:
      "The assembly stage is decorative (aria-hidden and inert) while an ordered step list carries the story with aria-current. Navigation, tabs, pricing switch, card scroller, FAQ accordion and the labelled sign-up field keep Dethink keyboard models; invalid email is announced through the field error and success through a toast. Beacon, customers and quotes are fictional.",
    responsiveNotes:
      "On large screens the stage pins beside the story; on small screens it pins above the steps. The stage is a fixed 1040×640 canvas scaled to its column. Set --beacon-sticky-top when your page has a sticky header, and copy beacon-hero.tsx and beacon-assembly.tsx with the recipe.",
  },
  {
    slug: "maison-sillage",
    title: "Maison Sillage perfume store",
    category: "marketing",
    summary:
      "An editorial perfume storefront with generated photography, scent discovery, bottle-size selection, animated reviews and a local shopping bag with demo checkout.",
    tags: ["Commerce", "Perfume", "Luxury", "Motion"],
    components: [
      "button",
      "icon-button",
      "badge",
      "card",
      "card-scroller",
      "avatar",
      "accordion",
      "separator",
      "dialog",
      "drawer",
      "radio-group",
      "number-input",
      "feedback-states",
      "form-field",
    ],
    sourceFile: "recipes/maison-sillage.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "Bounded viewport reveals and filtered collection transitions use Motion. A page pause control and reactive reduced-motion preference disable decorative movement; the bag drawer respects the same preference.",
    accessibilityNotes:
      "Pressed scent filters, labelled size and quantity controls, focus-managed product dialogs and bag drawer, announced additions and checkout completion. All products, prices, policies and reviews are fictional; no payment or order is sent.",
    responsiveNotes:
      "The hero, catalog and story stack naturally on narrow screens; the bag stays within the viewport. Copy the maison-sillage companion modules, stylesheet and public assets together. See docs/recipes/maison-sillage.md.",
  },
  {
    slug: "professional-cv",
    title: "Alex Morgan professional CV",
    category: "marketing",
    summary:
      "An editorial designer portfolio with generated photography, filterable case studies, a career timeline, CV download, local contact flow and thoughtful motion.",
    tags: ["Portfolio", "CV", "Personal", "Motion"],
    components: [
      "badge",
      "button",
      "card",
      "card-scroller",
      "separator",
      "timeline",
      "dialog",
      "accordion",
      "avatar",
      "icon-button",
      "form-field",
      "input",
      "select",
      "textarea",
    ],
    sourceFile: "recipes/professional-cv.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "Bounded transform/opacity reveals and project filtering use Motion. A page pause control and reactive system preference disable decorative movement; server-rendered content remains readable.",
    accessibilityNotes:
      "Named navigation, pressed project filters, focus-managed case studies and contact validation, a real text CV download and local-only completion. People, projects and testimonials are fictional.",
    responsiveNotes:
      "Hero and career columns stack in reading order. Copy the companion source, theme and public assets; see docs/recipes/professional-cv.md.",
  },
  {
    slug: "forma-ai",
    title: "Forma AI agents studio",
    category: "marketing",
    summary:
      "An ivory-and-violet AI studio landing with an animated ribbon hero, runnable agent lab, selectable specialists, integration previews, engagement scopes, and a local project brief.",
    tags: ["AI", "Agents", "Automation", "Motion"],
    components: [
      "hero-text-animation",
      "light-streaks-background",
      "navigation-menu",
      "reveal-button",
      "button",
      "icon-button",
      "badge",
      "card",
      "card-scroller",
      "tabs",
      "progress",
      "steps",
      "avatar-group",
      "accordion",
      "dialog",
      "form-field",
      "input",
      "textarea",
      "select",
      "separator",
      "feedback-states",
    ],
    sourceFile: "recipes/forma-ai.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "HeroTextAnimation introduces the headline and LightStreaksBackground adds subtle movement. A page motion control and reactive reduced-motion preference disable decorative motion. Agent stage changes use transform/opacity transitions and clean up pending timers when reset, switched or unmounted.",
    accessibilityNotes:
      "Keyboard-operable tabs and agent cards, named integration/brief dialogs, explicit human approval in sample runs, labelled validation and local completion. Forma is fictional; no AI calls, tool connections or brief transmission occur.",
    responsiveNotes:
      "The agent canvas stacks in reading order, specialist cards become a touch-friendly scroller, and navigation wraps. Copy forma-ai-data.ts, forma-ai-lab.tsx, forma-ai-brief.tsx, forma-ai.css and public/recipes/forma-ai with the source. Usage and asset provenance are documented in docs/recipes/forma-ai.md.",
  },
  {
    slug: "news-outlet",
    title: "The Current news outlet",
    category: "marketing",
    summary:
      "A rich broadcast-style news homepage with an editorial hero, generated photography, latest and most-read stories, search, saved articles, video previews, opinion, and a newsletter demo.",
    tags: ["News", "Editorial", "Landing", "Media"],
    components: [
      "navigation-menu",
      "typography",
      "card",
      "badge",
      "button",
      "icon-button",
      "separator",
      "tabs",
      "avatar",
      "dialog",
      "form-field",
      "input",
      "feedback-states",
    ],
    sourceFile: "recipes/news-outlet.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "Static editorial layout with Dethink's reduced-motion-aware control feedback. Tabs use the none motion preset; no page-level animation runtime or autoplay is introduced.",
    accessibilityNotes:
      "Semantic sections, named controls, keyboard-operable tabs, focus-managed story/search/saved dialogs, announced saved state, and labelled newsletter validation. Reporting and writers are fictional; Watch uses still previews and sample transcripts, and signup does not send email.",
    responsiveNotes:
      "The lead grid stacks on mobile; section links wrap and story grids become one or two columns. Copy news-outlet-data.ts, news-outlet-reader.tsx, news-outlet-newsletter.tsx, news-outlet.css, and public/recipes/news-outlet alongside the main source. See docs/recipes/news-outlet.md for asset provenance and integration notes.",
  },
  {
    slug: "automation-landing",
    title: "Automation software landing",
    category: "marketing",
    summary:
      "A shader-led software automation company landing with three runnable workflow samples, activity history, pricing, FAQ, and a matching social login.",
    tags: ["Landing", "Automation", "Shaders", "Workflows"],
    components: [
      "silk-flow-background",
      "shader-hero-text",
      "tabs",
      "card",
      "button",
      "badge",
      "avatar-group",
      "progress",
      "table",
      "accordion",
    ],
    sourceFile: "recipes/automation-landing.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "SilkFlowBackground runs at its fast preset for visible flowing folds. ShaderHeroText uses particle-follow for pointer-reactive headlines. A reactive reduced-motion preference disables the shader enhancements when requested. Workflow timers are cancelled on tab changes.",
    accessibilityNotes:
      "Keyboard-operable tabs, labelled progress, semantic tables and FAQ, and polite run announcements. Pricing and all workflows are fictional; the conversion actions open the matching login demo.",
    responsiveNotes:
      "The workflow steps stack on mobile and only the activity table scrolls horizontally. Copy automation-suite.css and automation-motion.ts alongside the source for theme tokens, shader-compatible typography, and reactive reduced motion. The entire landing stays dark in both showcase themes.",
  },
  {
    slug: "automation-login",
    title: "Automation social login",
    category: "auth",
    summary:
      "A split-layout sign-in page with a silk shader panel, Google and GitHub demos, email validation, password visibility, recovery, and retryable feedback.",
    tags: ["Login", "Social", "Automation", "Shaders"],
    components: [
      "silk-flow-background",
      "shader-hero-text",
      "button",
      "badge",
      "form-field",
      "input",
      "dialog",
    ],
    sourceFile: "recipes/automation-login.tsx",
    featured: true,
    complexity: "Intermediate",
    motionNotes:
      "SilkFlowBackground uses its fast preset and ShaderHeroText adds particle-follow to the desktop illustration headline. Reduced-motion preferences disable both enhancements. Pending demo timers are cleaned up on unmount.",
    accessibilityNotes:
      "Labelled required fields with autocomplete, linked validation errors, password visibility control, focus-managed dialogs and success heading. Google/GitHub and recovery are local simulations: no credentials are stored or transmitted. About this sign-in demo exposes a one-shot error scenario.",
    responsiveNotes:
      "The decorative panel yields to a focused single-column form on mobile. Copy automation-suite.css and automation-motion.ts alongside the source for local tokens, shader-compatible typography, and reactive reduced motion. Point the landing links at your own route when copying.",
  },
  {
    slug: "ai-chat-studio",
    title: "AI Chat Studio",
    category: "ai",
    summary:
      "A complete AI conversation workspace with thinking and tool activity, approvals, streaming, sources, attachments, recovery, and independent conversation history.",
    tags: ["AI", "Chat", "Streaming", "Approvals", "Copilot"],
    components: [
      "chat",
      "button",
      "icon-button",
      "avatar",
      "badge",
      "accordion",
      "select",
      "dialog",
      "drawer",
      "textarea",
      "live-region",
    ],
    sourceFile: "recipes/ai-chat-studio.tsx",
    featured: true,
    complexity: "Advanced",
    motionNotes:
      "Quiet thinking pulses, tokenized press feedback, and animated activity disclosures keep work visible without moving streamed text. Reduced motion and hidden-page preferences are respected.",
    accessibilityNotes:
      "Named messages, a labelled IME-aware composer, coalesced phase announcements, explicit tool approval, and focus-safe scrolling. Responses and uploads are deterministic sample data.",
    responsiveNotes:
      "Desktop history and context rails give way to a mobile history drawer. The transcript owns its scroll viewport and the growing composer stays within the conversation.",
  },
  {
    slug: "relay-landing",
    title: "Relay AI research landing",
    category: "marketing",
    summary:
      "A paper-and-cobalt research landing page with an editorial hero, three explorable research samples, source-linked answers, evidence dialogs, and a guided sample workspace.",
    tags: ["Landing", "AI", "Research", "Evidence"],
    components: [
      "tabs",
      "card",
      "badge",
      "button",
      "dialog",
      "form-field",
      "input",
      "accordion",
    ],
    sourceFile: "recipes/relay-landing.tsx",
    featured: true,
    complexity: "Intermediate",
    motionNotes:
      "The page renders immediately. Research tabs and FAQ use their static motion preset; existing Dialog and button feedback respect reduced motion. No page-level animation runtime is added.",
    accessibilityNotes:
      "Research topics use keyboard-operable Tabs. Every source and citation opens its matching labelled Dialog and restores trigger focus. Search, workspace naming, validation, and local completion have visible labels and text feedback. Research data is fictional.",
    responsiveNotes:
      "The centred hero scales into short lines. The answer precedes its source list on narrow screens, topic tabs scroll within their own strip, and navigation stays visible. The local cobalt token stylesheet supplies light/dark and forced-colour support; copy relay-landing.css alongside the source.",
  },
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
    slug: "release-readiness",
    title: "Release readiness",
    category: "dashboard",
    summary:
      "A shared release room with an owner-led checklist, live readiness meters, an activity timeline, and a final approval dialog.",
    tags: ["Release", "Checklist", "Approval", "Timeline"],
    components: [
      "checkbox",
      "feedback-states",
      "tabs",
      "timeline",
      "dialog",
      "form-field",
      "textarea",
      "avatar",
      "badge",
      "card",
      "button",
    ],
    sourceFile: "recipes/release-readiness.tsx",
    featured: true,
    complexity: "Intermediate",
    motionNotes:
      "Checkbox feedback, progress transforms, the tab indicator, and the approval dialog use component-native motion. The recipe adds only motion-safe color transitions and no animation runtime.",
    accessibilityNotes:
      "Checks are grouped with legends and named controls, progress values expose completion, and sign-off becomes available only after all checks pass. The dialog traps focus; the activity view preserves a readable decision record.",
    responsiveNotes:
      "The release summary reflows on small screens and the approval panel follows the checklist in a single column. Owners and status remain visible as text.",
  },
  {
    slug: "integrations-hub",
    title: "Integrations hub",
    category: "settings",
    summary:
      "A searchable connector directory with connected-tool filters, a configuration drawer, sync preferences, pending feedback, and saved local settings.",
    tags: ["Integrations", "Settings", "Drawer", "Search"],
    components: [
      "tabs",
      "drawer",
      "input",
      "form-field",
      "switch",
      "select",
      "feedback-states",
      "avatar",
      "badge",
      "card",
      "button",
    ],
    sourceFile: "recipes/integrations-hub.tsx",
    featured: true,
    complexity: "Intermediate",
    motionNotes:
      "Tabs, Drawer, Switch, Select, Button, and Toast provide their own reduced-motion-aware transitions. The simulated save is bounded and cancelled when dismissed or unmounted.",
    accessibilityNotes:
      "Search and sync controls have accessible names, the workspace input has a visible label and native validation, and connection outcomes use status text and toast announcements. All services and settings are local demo data.",
    responsiveNotes:
      "Connector cards move from three columns to one, search becomes full width on small screens, and the configuration drawer stays within the viewport.",
  },
  {
    slug: "invoice-approval-desk",
    title: "Invoice approval desk",
    category: "billing",
    summary:
      "A finance review queue with searchable invoices, line-item totals, approval and correction dialogs, and a persistent local decision record.",
    tags: ["Invoices", "Approval", "Finance", "Master-detail"],
    components: [
      "table",
      "select",
      "dialog",
      "input",
      "textarea",
      "form-field",
      "feedback-states",
      "avatar",
      "badge",
      "card",
      "button",
    ],
    sourceFile: "recipes/invoice-approval-desk.tsx",
    featured: true,
    complexity: "Intermediate",
    motionNotes:
      "Selected invoices use motion-safe color feedback, while Select and Dialog supply focused transitions. Totals and decision labels update immediately without decorative number animation.",
    accessibilityNotes:
      "Invoice choices are pressed buttons, numeric line items use a semantic table, and correction requests require an explanation. Decisions are announced through a live region and never initiate real payments or messages.",
    responsiveNotes:
      "The desktop queue and invoice sheet stack in reading order on mobile. Metrics collapse to one column and line items scroll within their own table container.",
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
