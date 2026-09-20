import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  BookOpen,
  Bot,
  Code2,
  Keyboard,
  Layers,
  MessageSquare,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Terminal,
} from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Own the source",
    description:
      "Install individual components from the shadcn-compatible registry. Keep the source in your app, change the internals, and ship commercially under MIT.",
    detail: "Open code · Pick what you need",
    href: "/docs/installation",
    link: "Install from the registry",
  },
  {
    icon: Palette,
    title: "One system, your identity",
    description:
      "Shared CSS variables control color, type, spacing, and radius. Switch between light, dark, and system themes, tune density, and support right-to-left layouts.",
    detail: "Tailwind CSS v4 · Semantic tokens",
    href: "/docs/theming",
    link: "Make it your own",
  },
  {
    icon: Keyboard,
    title: "Interaction beyond the mouse",
    description:
      "Keyboard navigation, focus management, labels, and state announcements are part of component behavior. Explore documented accessibility patterns and limitations.",
    detail: "Keyboard support · Reduced motion",
    href: "/components/dialog",
    link: "Explore accessible overlays",
  },
  {
    icon: Blocks,
    title: "Structure every screen",
    description:
      "Compose layouts with Box, Stack, Flex, and Grid. Add responsive sidebars, command menus, tabs, breadcrumbs, and a dock for navigating your product.",
    detail: "Layout primitives · Navigation",
    href: "/components/sidebar-shell",
    link: "Build an application shell",
  },
  {
    icon: SlidersHorizontal,
    title: "Forms that handle the details",
    description:
      "Pair field labels, descriptions, and errors with inputs, async selection, tag entry, date and time pickers, and scheduling controls. Handle empty, loading, and invalid states.",
    detail: "Validation states · Advanced inputs",
    href: "/components/form-field",
    link: "Compose a form",
  },
  {
    icon: Table2,
    title: "Make operational data usable",
    description:
      "Sort, filter, select, and paginate with a TanStack-powered data table. Combine tables with cards, timelines, avatars, badges, and feedback states.",
    detail: "Data display · TanStack Table",
    href: "/components/data-table",
    link: "Explore the data table",
  },
  {
    icon: MessageSquare,
    title: "Compose AI conversations",
    description:
      "Build chat interfaces with messages, a composer, streaming states, tool activity, and optional Markdown rendering. Connect the UI to your own model and backend.",
    detail: "Chat primitives · Streaming UI",
    href: "/components/chat",
    link: "Explore the chat components",
  },
  {
    icon: Sparkles,
    title: "Give interfaces a sense of motion",
    description:
      "Add animated docks, reveals, carousels, and transitions, or build a hero with shader backgrounds and particle text. Motion settings respect reduced-motion preferences.",
    detail: "Motion · Shaders · Particle text",
    href: "/components/shader-hero-text",
    link: "Try the animated hero",
  },
  {
    icon: Layers,
    title: "Start with a complete flow",
    description:
      "Adapt dashboards, landing pages, login screens, and other recipes assembled from real components. Each recipe includes a live preview and source to make your own.",
    detail: "Complete examples · Editable source",
    href: "/recipes",
    link: "Browse the recipes",
  },
  {
    icon: Terminal,
    title: "Fit your React stack",
    description:
      "Use typed props and exported types in React 18 or 19. Follow setup guidance for Next.js and Vite, including styles, providers, dependencies, and client boundaries.",
    detail: "TypeScript · React 18 + 19",
    href: "/docs/installation",
    link: "Set up your application",
  },
  {
    icon: BookOpen,
    title: "Understand what you ship",
    description:
      "Explore live states, API references, source, and the libraries behind each component. Component, keyboard, accessibility, and browser checks support ongoing development.",
    detail: "Live docs · Dependency transparency",
    href: "/components",
    link: "Open the component docs",
  },
  {
    icon: Bot,
    title: "Bring your coding agent",
    description:
      "Install the Dethink Components skill so your agent can choose components, compose recipes, wire up the registry and theme, and verify the result against real APIs.",
    detail: "Agent skill · Guided integration",
    href: "https://github.com/dethink-ui/components/tree/main/skills/dethink-components",
    link: "Get the agent skill",
  },
] as const;

export function LibraryFeatures({
  componentCount,
  recipeCount,
}: {
  componentCount: number;
  recipeCount: number;
}) {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-border/70 bg-muted/20 scroll-mt-20 border-b"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl space-y-3">
            <p className="text-primary font-mono text-[11px] font-medium tracking-[0.14em] uppercase">
              Features / from primitive to product
            </p>
            <h2
              id="features-heading"
              className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl"
            >
              The details are built in.
              <br />
              The decisions stay yours.
            </h2>
            <p className="text-muted-foreground max-w-xl text-sm leading-7 sm:text-base">
              A shared foundation for dashboards, internal tools, and AI
              interfaces. Start small, compose a full screen, and shape every
              part around your product.
            </p>
          </div>
          <ul
            aria-label="Library at a glance"
            className="border-border flex flex-wrap gap-x-6 gap-y-4 border-s-2 ps-5 text-sm"
          >
            {[
              { value: componentCount, label: "components" },
              { value: recipeCount, label: "recipes" },
              { value: "MIT", label: "licensed code" },
            ].map((stat) => (
              <li key={stat.label}>
                <span className="font-heading block text-2xl font-semibold tracking-tight">
                  {stat.value}
                </span>
                <span className="text-muted-foreground text-xs">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <ul className="grid gap-x-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ icon: Icon, ...feature }) => (
            <li
              key={feature.title}
              className="border-border/70 flex min-w-0 flex-col border-t py-7"
            >
              <Icon className="text-primary mb-5 size-5" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {feature.description}
              </p>
              <p className="text-muted-foreground mt-4 mb-3 font-mono text-[10px] leading-5 tracking-wide uppercase">
                {feature.detail}
              </p>
              <Link
                href={feature.href}
                className="text-primary focus-visible:outline-ring mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {feature.link}
                <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-border/70 mt-3 flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <p className="text-muted-foreground max-w-2xl leading-6">
            Available today through the registry. The library is in active
            development; APIs may change. Recipes demonstrate the interface and
            interactions — connect your own authentication and services.
          </p>
          <Link
            href="https://github.com/dethink-ui/components/blob/main/LICENSE"
            className="text-primary focus-visible:outline-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Read the MIT license
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
