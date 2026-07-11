"use client";

import type { CSSProperties } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Check,
  Command,
  CreditCard,
  Gauge,
  HelpCircle,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  HorizontalAccordion,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuFeaturedItem,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuTrigger,
  RevealButton,
  Separator,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

const heroBackdropStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(60% 60% at 12% -6%, color-mix(in oklab, var(--dt-color-primary) 24%, transparent), transparent 72%)",
    "radial-gradient(52% 55% at 88% 4%, color-mix(in oklab, var(--dt-color-info) 20%, transparent), transparent 72%)",
    "radial-gradient(70% 70% at 72% 116%, color-mix(in oklab, var(--dt-color-success) 14%, transparent), transparent 74%)",
    "linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 4%, transparent), transparent 42%)",
  ].join(", "),
};

const heroGridStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, color-mix(in oklab, var(--dt-color-foreground) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 7%, transparent) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
  maskImage: "radial-gradient(80% 70% at 30% 12%, black, transparent 76%)",
  WebkitMaskImage:
    "radial-gradient(80% 70% at 30% 12%, black, transparent 76%)",
};

const ctaBackdropStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(55% 120% at 8% 0%, color-mix(in oklab, var(--dt-color-primary) 30%, transparent), transparent 68%)",
    "radial-gradient(50% 120% at 92% 100%, color-mix(in oklab, var(--dt-color-info) 24%, transparent), transparent 70%)",
    "radial-gradient(60% 120% at 50% 120%, color-mix(in oklab, var(--dt-color-success) 16%, transparent), transparent 72%)",
  ].join(", "),
};

const popularGlowStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(80% 60% at 50% -10%, color-mix(in oklab, var(--dt-color-primary) 22%, transparent), transparent 70%)",
};

const navFeatures = [
  {
    icon: Workflow,
    title: "Workflow command center",
    body: "Route incidents, approvals, and automations through one app shell.",
  },
  {
    icon: BarChart3,
    title: "Operational insight",
    body: "Use tables, progress, and timeline views until chart primitives land.",
  },
  {
    icon: Bot,
    title: "AI-native surfaces",
    body: "Command palettes, prompt areas, and run histories share the same tokens.",
  },
];

const trustedBy = [
  "Northstar",
  "Aperture",
  "Vertex",
  "Lumen",
  "Cobalt",
  "Halcyon",
];

const metrics = [
  {
    value: "99.98%",
    label: "Platform uptime",
    trend: "+0.04%",
    icon: Activity,
  },
  { value: "24k+", label: "Teams onboarded", trend: "+18%", icon: Users },
  { value: "41ms", label: "p95 render time", trend: "−12ms", icon: Gauge },
  { value: "4.9/5", label: "Operator rating", trend: "+0.3", icon: Star },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    cadence: "/ forever",
    blurb: "For solo builders wiring up their first internal tool.",
    features: [
      "Full component source, copy-paste",
      "Light, dark, and density tokens",
      "Community support",
    ],
    cta: "Start building",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Growth",
    price: "$24",
    cadence: "/ seat / mo",
    blurb: "For product teams shipping customer-facing SaaS surfaces.",
    features: [
      "Everything in Starter",
      "Recipe library & Figma tokens",
      "Registry install automation",
      "Priority issue triage",
    ],
    cta: "Choose Growth",
    variant: "solid" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For platform orgs with governance and rollout needs.",
    features: [
      "Everything in Growth",
      "Private registry & SSO",
      "Design-system audit",
      "Dedicated solutions engineer",
    ],
    cta: "Talk to sales",
    variant: "outline" as const,
    popular: false,
  },
];

const faqs = [
  {
    value: "pricing",
    icon: CreditCard,
    label: "Pricing",
    q: "Can this become a billing page?",
    a: "Yes. The checkout recipe reuses the same primitives in an app workflow with order tables, progress states, and receipts.",
  },
  {
    value: "motion",
    icon: Sparkles,
    label: "Motion",
    q: "Does it respect reduced motion?",
    a: "Component-native motion collapses to static or calmer states whenever a visitor requests less motion.",
  },
  {
    value: "theming",
    icon: Command,
    label: "Theming",
    q: "How hard is rebranding?",
    a: "Swap the semantic token values once. Every recipe, card, and chart follows the active brand and density theme with no component CSS forks.",
  },
];

function StatusDots() {
  return (
    <span className="flex items-center gap-1.5" aria-hidden="true">
      <span className="bg-destructive/60 size-2.5 rounded-full" />
      <span className="bg-warning/70 size-2.5 rounded-full" />
      <span className="bg-success/70 size-2.5 rounded-full" />
    </span>
  );
}

function ProductGlimpse() {
  const bars = [42, 68, 55, 84, 61, 92, 74];
  const runs = [
    { label: "Deploy pipeline", tone: "success", value: "Passed" },
    { label: "Sync CRM records", tone: "info", value: "Running" },
    { label: "Nightly digest", tone: "warning", value: "Queued" },
  ] as const;

  return (
    <Card
      aria-label="Product preview"
      shadow="md"
      className="ring-border/60 relative overflow-hidden ring-1 backdrop-blur-sm hover:shadow-lg motion-safe:transition-all motion-safe:duration-300 hover:motion-safe:-translate-y-1"
    >
      <div className="border-border/70 flex items-center justify-between border-b px-4 py-3">
        <StatusDots />
        <span className="text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5 text-[0.7rem] font-medium tracking-wide">
          app.northstar.io
        </span>
        <span
          aria-hidden="true"
          className="bg-primary/10 text-primary grid size-6 place-items-center rounded-md"
        >
          <Command className="size-3.5" />
        </span>
      </div>

      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="border-border/70 bg-muted/30 rounded-lg border p-3">
            <div className="text-muted-foreground text-[0.7rem] font-medium">
              Active runs
            </div>
            <div className="font-heading mt-1 text-2xl font-semibold tracking-tight">
              1,284
            </div>
            <div className="text-success mt-1 inline-flex items-center gap-1 text-[0.7rem] font-medium">
              <TrendingUp aria-hidden="true" className="size-3" />
              +12.4%
            </div>
          </div>
          <div className="border-border/70 bg-muted/30 rounded-lg border p-3">
            <div className="text-muted-foreground text-[0.7rem] font-medium">
              Throughput
            </div>
            <div aria-hidden="true" className="mt-3 flex h-11 items-end gap-1">
              {bars.map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className={
                    i === bars.length - 1
                      ? "bg-primary w-full rounded-sm"
                      : "bg-primary/25 w-full rounded-sm"
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {runs.map((run) => (
            <div
              key={run.label}
              className="border-border/60 bg-background/60 flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${
                  run.tone === "success"
                    ? "bg-success"
                    : run.tone === "info"
                      ? "bg-info"
                      : "bg-warning"
                }`}
              />
              <span className="text-foreground/90 min-w-0 flex-1 truncate text-xs font-medium">
                {run.label}
              </span>
              <span className="text-muted-foreground text-[0.7rem] font-medium">
                {run.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BentoCard({
  icon: Icon,
  title,
  body,
  children,
  colSpan,
}: {
  icon: typeof Workflow;
  title: string;
  body: string;
  children?: React.ReactNode;
  colSpan: "2" | "3" | "4";
}) {
  return (
    <GridItem colSpan={colSpan} className="max-md:col-span-full">
      <Card className="ring-border/50 relative h-full overflow-hidden ring-1 hover:shadow-md motion-safe:transition-all motion-safe:duration-200 hover:motion-safe:-translate-y-1">
        <CardHeader>
          <div className="bg-primary/10 text-primary mb-3 grid size-10 place-items-center rounded-lg">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{body}</CardDescription>
        </CardHeader>
        {children ? <CardContent>{children}</CardContent> : null}
      </Card>
    </GridItem>
  );
}

export function SaasLandingPageRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";

  return (
    <HeroTextAnimationProvider>
      <div
        data-recipe-surface="saas-landing-page"
        className={`border-border bg-background overflow-hidden border ${
          fullPage
            ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0"
            : "rounded-xl"
        }`}
      >
        <header className="border-border bg-background/80 flex min-h-16 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          <a
            href="#recipe-landing-hero"
            className="focus-visible:ring-ring focus-visible:ring-offset-background flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-md">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-semibold">
              Northstar
            </span>
          </a>

          <NavigationMenu
            aria-label="Product"
            className="ml-4 hidden flex-1 md:flex"
          >
            <NavigationMenuList>
              <NavigationMenuItem value="platform">
                <NavigationMenuTrigger>
                  <Layers3 className="text-muted-foreground size-4" />
                  Platform
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuFeaturedItem href="#recipe-landing-hero">
                    Launch kit
                    <NavigationMenuDescription>
                      Auth, dashboards, settings, AI, and billing recipes.
                    </NavigationMenuDescription>
                  </NavigationMenuFeaturedItem>
                  <NavigationMenuSection>
                    <NavigationMenuLabel>Workflows</NavigationMenuLabel>
                    {navFeatures.map(({ icon: Icon, title, body }) => (
                      <NavigationMenuLink
                        key={title}
                        href="#recipe-landing-features"
                        icon={<Icon aria-hidden="true" />}
                      >
                        {title}
                        <NavigationMenuDescription>
                          {body}
                        </NavigationMenuDescription>
                      </NavigationMenuLink>
                    ))}
                  </NavigationMenuSection>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#recipe-landing-pricing">
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuIndicator />
            </NavigationMenuList>
          </NavigationMenu>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="max-sm:hidden">
              Log in
            </Button>
            <RevealButton
              icon={<Rocket />}
              label="Start"
              size="sm"
              variant="solid"
            />
          </div>
        </header>

        <section id="recipe-landing-hero" className="relative overflow-hidden">
          <span
            aria-hidden="true"
            style={heroBackdropStyle}
            className="pointer-events-none absolute inset-0"
          />
          <span
            aria-hidden="true"
            style={heroGridStyle}
            className="pointer-events-none absolute inset-0"
          />

          <div className="relative grid gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:px-10 lg:py-16">
            <div className="space-y-6">
              <div className="border-border/70 bg-background/70 text-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
                <ShieldCheck
                  className="text-primary size-3.5"
                  aria-hidden="true"
                />
                <span className="tracking-[0.18em] uppercase">
                  Open-code SaaS components
                </span>
              </div>

              <HeroTextAnimation
                repeat
                repeatDelay={1.8}
                text="Ship production interfaces without rebuilding the basics."
                className="font-heading max-w-3xl text-4xl leading-[1.03] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              />

              <p className="text-muted-foreground max-w-xl text-base leading-7 sm:text-lg">
                Dethink recipes combine the component suite into realistic
                product screens: landing pages, dashboards, CRUD workflows,
                settings, AI workspaces, booking, and billing.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button rightIcon={<ArrowRight />} size="lg">
                  Browse recipes
                </Button>
                <Button variant="outline" size="lg">
                  View components
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <div className="flex -space-x-2">
                  {["NR", "AV", "KM", "TS"].map((initials, i) => (
                    <span
                      key={initials}
                      aria-hidden="true"
                      className="border-background text-foreground/80 grid size-8 place-items-center rounded-full border-2 text-[0.65rem] font-semibold shadow-sm"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${
                          [
                            "var(--dt-color-primary)",
                            "var(--dt-color-info)",
                            "var(--dt-color-success)",
                            "var(--dt-color-warning)",
                          ][i]
                        } 16%, var(--dt-color-background))`,
                      }}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs leading-5">
                  Trusted by product teams shipping
                  <span className="text-foreground font-medium">
                    {" "}
                    2,400+ live surfaces
                  </span>
                </p>
              </div>
            </div>

            <ProductGlimpse />
          </div>
        </section>

        <section
          aria-label="Trusted by"
          className="border-border bg-muted/20 border-y px-4 py-6 sm:px-6 lg:px-10"
        >
          <p className="text-muted-foreground text-center text-[0.7rem] font-medium tracking-[0.24em] uppercase">
            Trusted by teams building on Dethink
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {trustedBy.map((name) => (
              <span
                key={name}
                className="text-muted-foreground/80 font-heading text-base font-semibold tracking-tight opacity-80 hover:opacity-100 motion-safe:transition-opacity"
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        <section
          id="recipe-landing-features"
          className="px-4 py-12 sm:px-6 lg:px-10"
        >
          <div className="mb-8 max-w-2xl space-y-3">
            <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
              One system, every surface
            </p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              A bento of production-ready building blocks
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              Every card below is assembled entirely from library components and
              semantic tokens — the same pieces you copy into your app.
            </p>
          </div>

          <Grid
            columns="6"
            gap="4"
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-6"
          >
            <BentoCard
              icon={Workflow}
              title="Workflow command center"
              body="Route incidents, approvals, and automations through one app shell."
              colSpan="4"
            >
              <div aria-hidden="true" className="space-y-2">
                {[
                  { label: "Approvals", w: 82, tone: "bg-primary" },
                  { label: "Automations", w: 64, tone: "bg-info" },
                  { label: "Incidents", w: 38, tone: "bg-warning" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-muted-foreground w-24 shrink-0 text-xs">
                      {row.label}
                    </span>
                    <span className="bg-muted/60 h-2 flex-1 overflow-hidden rounded-full">
                      <span
                        className={`block h-full rounded-full ${row.tone}`}
                        style={{ width: `${row.w}%` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard
              icon={ShieldCheck}
              title="Governance built in"
              body="Roles, audit trails, and policy states ship with the tokens."
              colSpan="2"
            >
              <div aria-hidden="true" className="flex flex-wrap gap-2">
                {[
                  { label: "SOC 2", tone: "success" },
                  { label: "SSO", tone: "info" },
                  { label: "RBAC", tone: "primary" },
                  { label: "Audit", tone: "warning" },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      pill.tone === "success"
                        ? "bg-success/15 text-success"
                        : pill.tone === "info"
                          ? "bg-info/15 text-info"
                          : pill.tone === "warning"
                            ? "bg-warning/15 text-warning"
                            : "bg-primary/15 text-primary"
                    }`}
                  >
                    <Check className="size-3" strokeWidth={3} />
                    {pill.label}
                  </span>
                ))}
              </div>
            </BentoCard>

            <BentoCard
              icon={BarChart3}
              title="Operational insight"
              body="Tables, progress, and timeline views keep operators oriented."
              colSpan="3"
            >
              <div aria-hidden="true" className="flex h-16 items-end gap-1.5">
                {[38, 52, 44, 66, 58, 78, 64, 88].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={
                      i >= 6
                        ? "bg-primary w-full rounded-t-sm"
                        : "bg-primary/30 w-full rounded-t-sm"
                    }
                  />
                ))}
              </div>
            </BentoCard>

            <BentoCard
              icon={Bot}
              title="AI-native surfaces"
              body="Command palettes, prompt areas, and run histories share one grammar."
              colSpan="3"
            >
              <div
                aria-hidden="true"
                className="border-border/70 bg-muted/30 flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                <Command className="text-primary size-4 shrink-0" />
                <span className="text-muted-foreground text-xs">
                  Summarize the last 24h of incidents…
                </span>
                <span className="bg-primary/70 ml-auto h-4 w-0.5 rounded-full motion-safe:animate-pulse" />
              </div>
            </BentoCard>
          </Grid>
        </section>

        <section
          aria-label="Key metrics"
          className="border-border bg-muted/20 border-y px-4 py-10 sm:px-6 lg:px-10"
        >
          <Grid columns="4" gap="4" className="grid-cols-2 md:grid-cols-4">
            {metrics.map(({ value, label, trend, icon: Icon }) => (
              <GridItem key={label}>
                <div className="border-border/70 bg-background/60 rounded-xl border p-5 shadow-sm">
                  <div className="text-muted-foreground flex items-center justify-between">
                    <Icon className="text-primary size-4" aria-hidden="true" />
                    <span className="text-success inline-flex items-center gap-1 text-xs font-medium">
                      <TrendingUp aria-hidden="true" className="size-3" />
                      {trend}
                    </span>
                  </div>
                  <div className="font-heading mt-3 text-3xl font-semibold tracking-tight">
                    {value}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {label}
                  </div>
                </div>
              </GridItem>
            ))}
          </Grid>
        </section>

        <section
          id="recipe-landing-pricing"
          className="px-4 py-12 sm:px-6 lg:px-10"
        >
          <div className="mb-8 max-w-2xl space-y-3">
            <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
              Pricing
            </p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Plans that feel like an app screen
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              The same Card, Button, and feedback patterns drive both marketing
              conversion and authenticated billing workflows.
            </p>
          </div>

          <Grid
            columns="3"
            gap="6"
            align="stretch"
            className="grid-cols-1 md:grid-cols-3"
          >
            {plans.map((plan) => (
              <GridItem key={plan.name}>
                <Card
                  shadow={plan.popular ? "md" : "sm"}
                  className={`relative flex h-full flex-col overflow-hidden ${
                    plan.popular
                      ? "ring-primary ring-2"
                      : "ring-border/50 ring-1"
                  } motion-safe:transition-transform motion-safe:duration-200 hover:motion-safe:-translate-y-1`}
                >
                  {plan.popular ? (
                    <span
                      aria-hidden="true"
                      style={popularGlowStyle}
                      className="pointer-events-none absolute inset-0"
                    />
                  ) : null}

                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.popular ? (
                        <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold">
                          <Star className="size-3" aria-hidden="true" />
                          Most popular
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-heading text-3xl font-semibold tracking-tight">
                        {plan.price}
                      </span>
                      {plan.cadence ? (
                        <span className="text-muted-foreground text-sm">
                          {plan.cadence}
                        </span>
                      ) : null}
                    </div>
                    <CardDescription className="mt-2">
                      {plan.blurb}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative flex flex-1 flex-col">
                    <Separator className="mb-4" />
                    <ul className="flex-1 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="text-foreground/90 flex items-start gap-2.5 text-sm leading-6"
                        >
                          <span
                            aria-hidden="true"
                            className="bg-success/15 text-success mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
                          >
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.variant}
                      size="lg"
                      className="mt-6 w-full"
                      rightIcon={plan.popular ? <ArrowRight /> : undefined}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </section>

        <section
          aria-label="Frequently asked questions"
          className="border-border bg-muted/20 border-t px-4 py-12 sm:px-6 lg:px-10"
        >
          <div className="mb-6 max-w-2xl space-y-3">
            <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
              FAQ
            </p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Answers before you copy the source
            </h2>
          </div>

          <HorizontalAccordion
            aria-label="Landing page FAQ"
            className="border-border bg-background rounded-lg border shadow-sm"
            bladeWidth={64}
            compactBreakpoint={768}
            defaultValue="pricing"
            height={280}
          >
            {faqs.map(({ value, icon: Icon, label, q, a }) => (
              <HorizontalAccordion.Item key={value} value={value}>
                <HorizontalAccordion.Blade>
                  <HorizontalAccordion.BladeIcon>
                    <Icon className="size-5" aria-hidden="true" />
                  </HorizontalAccordion.BladeIcon>
                  <HorizontalAccordion.BladeLabel>
                    {label}
                  </HorizontalAccordion.BladeLabel>
                </HorizontalAccordion.Blade>
                <HorizontalAccordion.Panel>
                  <div className="p-6">
                    <div className="bg-primary/10 text-primary mb-3 grid size-9 place-items-center rounded-lg">
                      <HelpCircle className="size-4" aria-hidden="true" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold">{q}</h3>
                    <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
                      {a}
                    </p>
                  </div>
                </HorizontalAccordion.Panel>
              </HorizontalAccordion.Item>
            ))}
          </HorizontalAccordion>
        </section>

        <section
          aria-label="Get started"
          className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-10"
        >
          <span
            aria-hidden="true"
            style={ctaBackdropStyle}
            className="pointer-events-none absolute inset-0"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="border-border/70 bg-background/70 text-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
              <Rocket className="text-primary size-3.5" aria-hidden="true" />
              <span className="tracking-[0.18em] uppercase">
                Ship this week
              </span>
            </div>
            <h2 className="font-heading mt-6 max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Copy the recipe, keep your brand, ship the surface.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md text-sm leading-6 sm:text-base">
              Start from a production-grade screen instead of a blank canvas —
              every token, state, and interaction already handled.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button size="lg" rightIcon={<ArrowUpRight />}>
                Browse all recipes
              </Button>
              <RevealButton
                icon={<Rocket />}
                label="Start free"
                size="lg"
                variant="outline"
                labelVisibility="always"
              />
            </div>
          </div>
        </section>
      </div>
    </HeroTextAnimationProvider>
  );
}
