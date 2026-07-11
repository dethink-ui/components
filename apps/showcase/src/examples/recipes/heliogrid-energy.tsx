"use client";

import { useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BatteryCharging,
  Building2,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  Clock3,
  CloudSun,
  Gauge,
  Leaf,
  Menu,
  Network,
  Play,
  PlugZap,
  RadioTower,
  ShieldCheck,
  SlidersHorizontal,
  SunMedium,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AvatarGroup,
  type AvatarGroupMember,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldControl,
  FieldLabel,
  Grid,
  GridItem,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  Input,
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
  Progress,
  ProgressCircle,
  RevealButton,
  Select,
  SelectItem,
  Separator,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  Timeline,
  type TimelineItemData,
  ToastProvider,
  ToastViewport,
  useToast,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

const platformMenu = [
  {
    icon: SunMedium,
    title: "Generation",
    body: "Forecast and coordinate every renewable site in one operating view.",
  },
  {
    icon: BatteryCharging,
    title: "Storage",
    body: "Dispatch batteries against price, constraint, and reserve signals.",
  },
  {
    icon: Zap,
    title: "Market response",
    body: "Turn live grid conditions into auditable commercial actions.",
  },
] as const;

const operators = [
  "Clearloop Energy",
  "TerraVolt",
  "Brightline Power",
  "NorthPeak Energy",
];

const dispatchRows = [
  {
    name: "Mesa Solar",
    location: "Phoenix, AZ",
    output: "86 MW",
    outputValue: 72,
    storage: "40 MW",
    storageValue: 61,
    action: "+28 MW export",
    status: "Online",
    tone: "success" as const,
  },
  {
    name: "Silverline Solar",
    location: "Bakersfield, CA",
    output: "64 MW",
    outputValue: 54,
    storage: "80 MW",
    storageValue: 92,
    action: "−16 MW charge",
    status: "Online",
    tone: "success" as const,
  },
  {
    name: "Highpoint Solar",
    location: "Austin, TX",
    output: "42 MW",
    outputValue: 38,
    storage: "20 MW",
    storageValue: 28,
    action: "+22 MW export",
    status: "Online",
    tone: "success" as const,
  },
  {
    name: "Desert Sun",
    location: "Las Vegas, NV",
    output: "0 MW",
    outputValue: 0,
    storage: "0 MW",
    storageValue: 0,
    action: "Maintenance",
    status: "Offline",
    tone: "neutral" as const,
  },
];

const storageFleet = [
  { name: "West reserve", value: 92, status: "Dispatch ready" },
  { name: "Desert bank", value: 68, status: "Charging" },
  { name: "Metro flex", value: 44, status: "Holding" },
];

const rollout: TimelineItemData[] = [
  {
    id: "connect",
    title: "Connect the portfolio",
    description:
      "Bring sites, batteries, weather, meters, and market feeds into one governed operating layer.",
    dateLabel: "Week 1",
    status: "complete",
  },
  {
    id: "model",
    title: "Model every constraint",
    description:
      "HelioGrid learns asset limits, commercial priorities, and operator guardrails before dispatch.",
    dateLabel: "Week 2",
    status: "complete",
  },
  {
    id: "prove",
    title: "Run in shadow mode",
    description:
      "Compare recommendations with live operations and prove value before enabling automated actions.",
    dateLabel: "Week 3",
    status: "current",
  },
  {
    id: "scale",
    title: "Scale the control loop",
    description:
      "Move approved strategies into production with audit trails and human override always available.",
    dateLabel: "Week 4",
    status: "upcoming",
  },
];

const operatorTeam: AvatarGroupMember[] = [
  { id: "mira", name: "Mira Patel", tone: "primary", metadata: "Grid ops" },
  { id: "eli", name: "Eli Morgan", tone: "info", metadata: "Markets" },
  {
    id: "june",
    name: "June Okafor",
    tone: "success",
    metadata: "Storage",
  },
  { id: "sam", name: "Sam Rivera", tone: "warning", metadata: "Trading" },
  {
    id: "noah",
    name: "Noah Reyes",
    tone: "destructive",
    metadata: "Reliability",
  },
];

const faqs = [
  {
    value: "integrations",
    q: "What can HelioGrid connect to?",
    a: "HelioGrid connects to common SCADA, meter, battery-management, weather, and market data sources. The audit identifies the fastest path through your existing stack before any implementation work begins.",
  },
  {
    value: "control",
    q: "Do operators stay in control?",
    a: "Yes. Every strategy has explicit guardrails, approval boundaries, and a human override. Teams can begin in advisory mode and expand automation only after the operating evidence is clear.",
  },
  {
    value: "markets",
    q: "Which markets are supported?",
    a: "The orchestration model is market-agnostic. Regional rules, settlement windows, and portfolio constraints are configured during rollout, with initial support focused on North American and European power markets.",
  },
  {
    value: "security",
    q: "How is operational access secured?",
    a: "Connections are least-privilege, encrypted, and fully auditable. HelioGrid separates recommendation, approval, and dispatch permissions so control never depends on a shared credential or hidden automation path.",
  },
];

function BrandMark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full">
        <SunMedium className="size-4.5" aria-hidden="true" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        HelioGrid
      </span>
    </span>
  );
}

function AuditDialog({
  trigger,
  size = "lg",
  variant = "solid",
  className,
}: {
  trigger: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "solid" | "outline" | "soft" | "ghost";
  className?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [portfolio, setPortfolio] = useState<string>("");
  const [region, setRegion] = useState<string>("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger size={size} variant={variant} className={className}>
        {trigger}
      </DialogTrigger>
      <DialogContent size="sm" showCloseButton>
        <DialogHeader>
          <DialogTitle>Run a grid audit</DialogTitle>
          <DialogDescription>
            Map the fastest route from fragmented assets to one live operating
            portfolio. The first session takes 30 minutes.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
            toast({
              title: "Grid audit requested",
              description: `We’ll send the portfolio brief${
                email ? ` to ${email}` : ""
              } within one business day.`,
              tone: "success",
            });
            setEmail("");
            setPortfolio("");
            setRegion("");
          }}
        >
          <div className="space-y-4 px-[var(--dt-space-6)] py-[var(--dt-space-2)]">
            <Field id="heliogrid-audit-email">
              <FieldLabel>Work email</FieldLabel>
              <FieldControl asChild>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="operator@company.com"
                />
              </FieldControl>
            </Field>
            <Select
              label="Portfolio size"
              placeholder="Select capacity"
              required
              value={portfolio || undefined}
              onValueChange={setPortfolio}
            >
              <SelectItem value="under-100">Under 100 MW</SelectItem>
              <SelectItem value="100-500">100–500 MW</SelectItem>
              <SelectItem value="500-1000">500 MW–1 GW</SelectItem>
              <SelectItem value="over-1000">Over 1 GW</SelectItem>
            </Select>
            <Select
              label="Primary market"
              placeholder="Select region"
              required
              value={region || undefined}
              onValueChange={setRegion}
            >
              <SelectItem value="north-america">North America</SelectItem>
              <SelectItem value="uk-ireland">UK & Ireland</SelectItem>
              <SelectItem value="continental-europe">
                Continental Europe
              </SelectItem>
              <SelectItem value="other">Another market</SelectItem>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose variant="outline">Cancel</DialogClose>
            <Button type="submit" rightIcon={<ArrowRight />}>
              Request audit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MobileNavigation() {
  const links = [
    ["Platform", "heliogrid-platform"],
    ["Outcomes", "heliogrid-outcomes"],
    ["Rollout", "heliogrid-rollout"],
    ["FAQ", "heliogrid-faq"],
  ] as const;

  return (
    <Dialog>
      <DialogTrigger
        aria-label="Open primary navigation"
        size="icon"
        variant="ghost"
        className="lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent size="sm" showCloseButton>
        <DialogHeader>
          <DialogTitle>Navigate HelioGrid</DialogTitle>
          <DialogDescription>
            Explore the platform, outcomes, rollout, and common questions.
          </DialogDescription>
        </DialogHeader>
        <nav aria-label="Mobile primary" className="grid gap-2 px-6 pb-6">
          {links.map(([label, id]) => (
            <DialogClose
              key={id}
              variant="ghost"
              className="justify-between"
              onPress={() => {
                window.location.hash = id;
              }}
            >
              {label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </DialogClose>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

function DispatchConsole() {
  const [weatherAware, setWeatherAware] = useState(true);

  return (
    <Card
      id="heliogrid-dispatch"
      shadow="md"
      className="border-border/90 bg-background/95 overflow-hidden"
    >
      <div className="border-border flex items-center gap-3 border-b px-4 py-3">
        <Activity className="text-primary size-5" aria-hidden="true" />
        <span className="font-heading font-semibold">Live dispatch</span>
        <Badge
          className="ml-auto"
          tone="success"
          variant="subtle"
          size="sm"
          icon={<span className="bg-success size-1.5 rounded-full" />}
        >
          12 sites online
        </Badge>
      </div>

      <CardContent className="p-4">
        <Tabs defaultValue="sites" size="sm" motionPreset="subtle">
          <Tabs.List aria-label="Dispatch console views">
            <Tabs.Trigger value="sites" icon={<SunMedium aria-hidden="true" />}>
              Sites
            </Tabs.Trigger>
            <Tabs.Trigger
              value="storage"
              icon={<BatteryCharging aria-hidden="true" />}
            >
              Storage
            </Tabs.Trigger>
            <Tabs.Trigger
              value="market"
              icon={<TrendingUp aria-hidden="true" />}
            >
              Market
            </Tabs.Trigger>
            <Tabs.Trigger value="grid" icon={<Gauge aria-hidden="true" />}>
              Grid balance
            </Tabs.Trigger>
          </Tabs.List>

          <div className="mt-4 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <ProgressCircle
              label="Grid balance"
              value={98.4}
              showValue
              size="lg"
              tone="primary"
              formatValue={(value) => `${value.toFixed(1)}%`}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border-border rounded-md border p-3">
                <p className="text-muted-foreground text-xs">Active strategy</p>
                <p className="mt-1 text-sm font-semibold">Market optimize</p>
                <Badge className="mt-2" size="xs" tone="success">
                  In balance
                </Badge>
              </div>
              <Field
                id="heliogrid-weather-aware"
                orientation="horizontal"
                className="border-border items-center rounded-md border p-3"
              >
                <FieldControl asChild>
                  <Switch
                    checked={weatherAware}
                    onCheckedChange={setWeatherAware}
                    aria-label="Weather-aware dispatch"
                  />
                </FieldControl>
                <FieldLabel className="ml-2 text-sm">Weather aware</FieldLabel>
              </Field>
            </div>
          </div>

          <Tabs.Panel value="sites">
            <div className="mt-4 overflow-x-auto">
              <Table className="min-w-[42rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Solar output</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Net dispatch</TableHead>
                    <TableHead align="end">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatchRows.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>
                        <span className="block text-xs font-medium">
                          {row.name}
                        </span>
                        <span className="text-muted-foreground block text-[0.68rem]">
                          {row.location}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-28">
                        <span className="text-xs font-medium">
                          {row.output}
                        </span>
                        <Progress
                          aria-label={`${row.name} solar output`}
                          className="mt-1"
                          value={row.outputValue}
                          size="sm"
                          tone="info"
                        />
                      </TableCell>
                      <TableCell className="min-w-28">
                        <span className="text-xs font-medium">
                          {row.storage}
                        </span>
                        <Progress
                          aria-label={`${row.name} storage level`}
                          className="mt-1"
                          value={row.storageValue}
                          size="sm"
                          tone="primary"
                        />
                      </TableCell>
                      <TableCell className="text-xs">{row.action}</TableCell>
                      <TableCell align="end">
                        <Badge size="xs" variant="outline" tone={row.tone}>
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="storage">
            <ul className="mt-4 space-y-3">
              {storageFleet.map((asset) => (
                <li
                  key={asset.name}
                  className="border-border grid gap-3 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-center"
                >
                  <span className="text-sm font-medium">{asset.name}</span>
                  <Progress
                    aria-label={`${asset.name} state of charge`}
                    value={asset.value}
                    showValue
                    size="sm"
                  />
                  <Badge size="xs" tone="success" variant="soft">
                    {asset.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </Tabs.Panel>

          <Tabs.Panel value="market">
            <Grid
              columns="3"
              gap="3"
              className="mt-4 grid-cols-1 sm:grid-cols-3"
            >
              {[
                ["Day ahead", "$68/MWh", "+8.4%"],
                ["Frequency", "$24/MW", "Available"],
                ["Capacity", "91%", "Committed"],
              ].map(([label, value, note]) => (
                <GridItem key={label}>
                  <Card className="h-full p-4">
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="mt-2 text-xl font-semibold">{value}</p>
                    <p className="text-info mt-1 text-xs">{note}</p>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="grid">
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Progress
                label="Portfolio availability"
                value={97.8}
                showValue
                tone="success"
              />
              <Progress
                label="Dispatch confidence"
                value={94.6}
                showValue
                tone="primary"
              />
              <Progress
                label="Constraint headroom"
                value={72}
                showValue
                tone="info"
              />
              <Progress
                label="Reserve coverage"
                value={88}
                showValue
                tone="warning"
              />
            </div>
          </Tabs.Panel>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function OutcomeCard({
  icon: Icon,
  title,
  body,
  stat,
}: {
  icon: typeof TrendingUp;
  title: string;
  body: string;
  stat: string;
}) {
  return (
    <Card className="border-border/80 h-full p-5 transition-transform motion-safe:hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <span className="border-info/50 text-info grid size-11 shrink-0 place-items-center rounded-full border">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-primary font-heading text-2xl font-semibold">
            {stat}
          </p>
          <h3 className="mt-1 font-semibold">{title}</h3>
          <p className="text-muted-foreground mt-2 text-sm leading-6">{body}</p>
        </div>
      </div>
    </Card>
  );
}

export function HelioGridEnergyRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";

  return (
    <HeroTextAnimationProvider>
      <ToastProvider motion="subtle">
        <div
          data-recipe-surface="heliogrid-energy"
          className={`sc-heliogrid-theme bg-background text-foreground relative overflow-hidden border ${
            fullPage
              ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0"
              : "rounded-xl"
          }`}
        >
          <header className="border-border bg-background/95 sticky top-0 z-20 border-b backdrop-blur">
            <div className="mx-auto flex min-h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6 lg:px-10">
              <a
                href="#heliogrid-hero"
                className="focus-visible:ring-ring focus-visible:ring-offset-background rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <BrandMark />
              </a>

              <NavigationMenu
                aria-label="Primary"
                className="ml-5 hidden lg:flex"
                size="sm"
                variant="quiet"
              >
                <NavigationMenuList>
                  <NavigationMenuItem value="platform">
                    <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuFeaturedItem href="#heliogrid-platform">
                        One live operating portfolio
                        <NavigationMenuDescription>
                          Coordinate generation, storage, demand, and market
                          response from a governed control loop.
                        </NavigationMenuDescription>
                      </NavigationMenuFeaturedItem>
                      <NavigationMenuSection>
                        <NavigationMenuLabel>Capabilities</NavigationMenuLabel>
                        {platformMenu.map(({ icon: Icon, title, body }) => (
                          <NavigationMenuLink
                            key={title}
                            href="#heliogrid-platform"
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
                    <NavigationMenuLink href="#heliogrid-outcomes">
                      Outcomes
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#heliogrid-rollout">
                      Rollout
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#heliogrid-faq">
                      Resources
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuIndicator />
                </NavigationMenuList>
              </NavigationMenu>

              <div className="ml-auto flex items-center gap-2">
                <a
                  href="#heliogrid-faq"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring hidden rounded-md px-3 py-2 text-sm outline-none focus-visible:ring-2 sm:inline-flex"
                >
                  Log in
                </a>
                <AuditDialog
                  trigger={
                    <span className="inline-flex items-center gap-2">
                      Run a grid audit
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  }
                  size="sm"
                  className="hidden sm:inline-flex"
                />
                <MobileNavigation />
              </div>
            </div>
          </header>

          <div>
            <section
              id="heliogrid-hero"
              className="sc-heliogrid-grid relative px-4 py-14 sm:px-6 lg:px-10 lg:py-20"
            >
              <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(31rem,1.05fr)]">
                <div>
                  <Badge
                    tone="primary"
                    variant="outline"
                    className="font-mono tracking-[0.08em]"
                    icon={<Activity />}
                  >
                    REAL-TIME ENERGY ORCHESTRATION
                  </Badge>

                  {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
                  <HeroTextAnimation
                    as="h1"
                    animation="blur-focus"
                    text="Turn every megawatt into momentum."
                    emphasisWords={["momentum."]}
                    className="font-heading mt-7 max-w-2xl text-5xl leading-[0.98] font-bold tracking-[-0.055em] text-balance uppercase sm:text-6xl lg:text-[4.2rem]"
                  />

                  <p className="text-muted-foreground mt-6 max-w-xl text-base leading-7 text-pretty">
                    HelioGrid balances solar sites, batteries, and market demand
                    in real time—maximizing value, reducing risk, and keeping
                    the grid in equilibrium.
                  </p>

                  <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                    <AuditDialog
                      trigger={
                        <span className="inline-flex items-center gap-2">
                          <Zap className="size-4" aria-hidden="true" />
                          Run a grid audit
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </span>
                      }
                    />
                    <Button asChild size="lg" variant="outline">
                      <a href="#heliogrid-dispatch">
                        <Play className="size-4" aria-hidden="true" />
                        Watch live dispatch
                      </a>
                    </Button>
                  </div>

                  <div className="mt-9">
                    <p className="text-muted-foreground font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Trusted by leading energy operators
                    </p>
                    <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                      {operators.map((operator) => (
                        <li
                          key={operator}
                          className="text-muted-foreground text-sm font-semibold"
                        >
                          {operator}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <DispatchConsole />
              </div>
            </section>

            <section
              id="heliogrid-outcomes"
              aria-labelledby="heliogrid-outcomes-heading"
              className="border-border border-y px-4 py-14 sm:px-6 lg:px-10"
            >
              <div className="mx-auto max-w-[1200px]">
                <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-end">
                  <div>
                    <p className="text-info font-mono text-xs tracking-[0.12em] uppercase">
                      Proof in motion
                    </p>
                    <h2
                      id="heliogrid-outcomes-heading"
                      className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
                    >
                      Real operators. Real results.
                    </h2>
                  </div>
                  <p className="text-muted-foreground max-w-2xl text-sm leading-6 lg:justify-self-end">
                    Every action is tied to a measurable operating outcome, from
                    faster market response to lower curtailment and more
                    reliable storage utilization.
                  </p>
                </div>

                <Grid
                  columns="3"
                  gap="4"
                  className="grid-cols-1 lg:grid-cols-3"
                >
                  <GridItem>
                    <OutcomeCard
                      icon={TrendingUp}
                      stat="+14.2%"
                      title="Capture more value"
                      body="Optimize across energy, ancillary, and capacity markets without adding another trading screen."
                    />
                  </GridItem>
                  <GridItem>
                    <OutcomeCard
                      icon={ShieldCheck}
                      stat="−31%"
                      title="Reduce operating risk"
                      body="Predict volatility and constraint exposure before it reaches the control room."
                    />
                  </GridItem>
                  <GridItem>
                    <OutcomeCard
                      icon={Leaf}
                      stat="2.4 Mt"
                      title="Decarbonize faster"
                      body="Maximize clean generation and storage utilization across the entire portfolio."
                    />
                  </GridItem>
                </Grid>
              </div>
            </section>

            <section
              id="heliogrid-platform"
              aria-labelledby="heliogrid-platform-heading"
              className="px-4 py-16 sm:px-6 lg:px-10 lg:py-20"
            >
              <div className="mx-auto max-w-[1200px]">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                  <Badge tone="info" variant="subtle" icon={<Network />}>
                    One control loop
                  </Badge>
                  <h2
                    id="heliogrid-platform-heading"
                    className="font-heading mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
                  >
                    See the whole portfolio. Act on the next minute.
                  </h2>
                  <p className="text-muted-foreground mt-4 text-base leading-7 text-pretty">
                    HelioGrid turns asset telemetry, forecasts, constraints, and
                    market signals into a shared operating decision.
                  </p>
                </div>

                <Grid
                  columns="6"
                  gap="4"
                  className="grid-cols-1 md:grid-cols-6"
                >
                  <GridItem colSpan="4" className="max-md:col-span-full">
                    <Card className="h-full overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RadioTower
                            className="text-primary size-5"
                            aria-hidden="true"
                          />
                          Portfolio coordination
                        </CardTitle>
                        <CardDescription>
                          One operational picture across every connected asset.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Grid
                          columns="2"
                          gap="3"
                          className="grid-cols-1 sm:grid-cols-2"
                        >
                          {[
                            {
                              icon: SunMedium,
                              title: "Generation",
                              body: "Live forecasts and constraint-aware output plans.",
                              badge: "184 MW online",
                            },
                            {
                              icon: BatteryCharging,
                              title: "Storage",
                              body: "State-of-charge targets tied to price and reserve value.",
                              badge: "92% ready",
                            },
                            {
                              icon: Building2,
                              title: "Flexible demand",
                              body: "Coordinate controllable load without breaking service limits.",
                              badge: "18 MW flex",
                            },
                            {
                              icon: PlugZap,
                              title: "Market response",
                              body: "Dispatch and evidence aligned to settlement windows.",
                              badge: "4 products",
                            },
                          ].map(({ icon: Icon, title, body, badge }) => (
                            <Card key={title} surface="muted" className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-md">
                                  <Icon className="size-4" aria-hidden="true" />
                                </span>
                                <h3 className="font-semibold">{title}</h3>
                              </div>
                              <p className="text-muted-foreground mt-3 text-sm leading-6">
                                {body}
                              </p>
                              <Badge className="mt-4" size="xs" tone="success">
                                {badge}
                              </Badge>
                            </Card>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </GridItem>

                  <GridItem colSpan="2" className="max-md:col-span-full">
                    <Card className="h-full p-6">
                      <SlidersHorizontal
                        className="text-info size-6"
                        aria-hidden="true"
                      />
                      <h3 className="font-heading mt-5 text-xl font-semibold">
                        Guardrails before automation
                      </h3>
                      <p className="text-muted-foreground mt-3 text-sm leading-6">
                        Every strategy carries explicit limits, approvals, and
                        fallbacks. Operators see why an action is recommended
                        before deciding how far automation can go.
                      </p>
                      <ul className="mt-6 space-y-3">
                        {[
                          "Human override always available",
                          "Constraint and price evidence attached",
                          "Action history ready for settlement",
                        ].map((item) => (
                          <li key={item} className="flex gap-2 text-sm">
                            <Check
                              className="text-primary mt-0.5 size-4 shrink-0"
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </GridItem>
                </Grid>
              </div>
            </section>

            <section
              id="heliogrid-rollout"
              aria-labelledby="heliogrid-rollout-heading"
              className="border-border bg-muted/25 border-y px-4 py-16 sm:px-6 lg:px-10"
            >
              <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
                <div>
                  <p className="text-info font-mono text-xs tracking-[0.12em] uppercase">
                    Four-week rollout
                  </p>
                  <h2
                    id="heliogrid-rollout-heading"
                    className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance"
                  >
                    Prove the control loop before it takes control.
                  </h2>
                  <p className="text-muted-foreground mt-4 text-sm leading-6">
                    Start with a live portfolio model, validate recommendations
                    in shadow mode, and expand automation only when the evidence
                    and team are ready.
                  </p>
                  <AuditDialog
                    className="mt-6"
                    trigger="Map our rollout"
                    variant="outline"
                    size="md"
                  />
                </div>

                <Card className="p-6">
                  <Timeline
                    aria-label="HelioGrid rollout sequence"
                    items={rollout}
                    orientation="vertical"
                  />
                </Card>
              </div>
            </section>

            <section
              aria-labelledby="heliogrid-evidence-heading"
              className="px-4 py-16 sm:px-6 lg:px-10"
            >
              <div className="mx-auto max-w-[1200px]">
                <Card className="border-primary/30 overflow-hidden">
                  <Grid
                    columns="5"
                    gap="none"
                    className="grid-cols-1 lg:grid-cols-5"
                  >
                    <GridItem
                      colSpan="3"
                      className="p-7 max-lg:col-span-full sm:p-10"
                    >
                      <Badge tone="primary" variant="soft">
                        Operator story
                      </Badge>
                      <blockquote className="mt-5 max-w-3xl">
                        <p
                          id="heliogrid-evidence-heading"
                          className="font-heading text-2xl leading-tight font-semibold text-balance sm:text-3xl"
                        >
                          “HelioGrid gave operations and trading the same live
                          truth. We now respond in minutes without sacrificing
                          the guardrails our assets depend on.”
                        </p>
                      </blockquote>
                      <div className="mt-7 flex flex-wrap items-center gap-4">
                        <AvatarGroup
                          label="Clearloop operating team"
                          members={operatorTeam}
                          max={4}
                          size="sm"
                          ring="border"
                        />
                        <div>
                          <p className="text-sm font-semibold">Priya Nair</p>
                          <p className="text-muted-foreground text-xs">
                            VP of Operations, Clearloop Energy
                          </p>
                        </div>
                      </div>
                    </GridItem>
                    <GridItem
                      colSpan="2"
                      className="bg-primary text-primary-foreground grid content-center gap-6 p-7 max-lg:col-span-full sm:p-10"
                    >
                      <div>
                        <p className="text-4xl font-semibold">£3.8m</p>
                        <p className="mt-1 text-sm opacity-80">
                          incremental portfolio value
                        </p>
                      </div>
                      <Separator className="opacity-30" />
                      <div>
                        <p className="text-4xl font-semibold">58 sec</p>
                        <p className="mt-1 text-sm opacity-80">
                          median market response
                        </p>
                      </div>
                    </GridItem>
                  </Grid>
                </Card>
              </div>
            </section>

            <section
              id="heliogrid-faq"
              aria-labelledby="heliogrid-faq-heading"
              className="border-border border-t px-4 py-16 sm:px-6 lg:px-10"
            >
              <div className="mx-auto max-w-3xl">
                <div className="mb-8 text-center">
                  <p className="text-info font-mono text-xs tracking-[0.12em] uppercase">
                    Before you connect
                  </p>
                  <h2
                    id="heliogrid-faq-heading"
                    className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance"
                  >
                    Questions from the control room.
                  </h2>
                </div>
                <Accordion
                  aria-label="HelioGrid frequently asked questions"
                  defaultValue="integrations"
                >
                  {faqs.map((faq) => (
                    <Accordion.Item key={faq.value} value={faq.value}>
                      <Accordion.Blade>
                        <Accordion.BladeIcon>
                          <ChevronRight aria-hidden="true" />
                        </Accordion.BladeIcon>
                        <Accordion.BladeText>{faq.q}</Accordion.BladeText>
                      </Accordion.Blade>
                      <Accordion.Content>
                        <p className="text-muted-foreground leading-6">
                          {faq.a}
                        </p>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
            </section>

            <section
              aria-label="Run a grid audit"
              className="border-primary/30 bg-primary/8 border-y px-4 py-20 text-center sm:px-6"
            >
              <div className="mx-auto max-w-2xl">
                <CloudSun
                  className="text-primary mx-auto size-8"
                  aria-hidden="true"
                />
                <h2 className="font-heading mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Your portfolio already has the signal. Put it to work.
                </h2>
                <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-7">
                  In one session, map the assets, decisions, and market moments
                  where orchestration can create measurable value.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <AuditDialog
                    trigger={
                      <span className="inline-flex items-center gap-2">
                        Run a grid audit
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </span>
                    }
                  />
                  <RevealButton
                    icon={<Clock3 />}
                    label="30 minutes · no obligation"
                    labelVisibility="always"
                    variant="outline"
                    size="lg"
                  />
                </div>
              </div>
            </section>
          </div>

          <footer className="px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1200px]">
              <div className="flex flex-wrap items-start justify-between gap-8">
                <div>
                  <BrandMark />
                  <p className="text-muted-foreground mt-3 max-w-xs text-sm leading-6">
                    Real-time orchestration for generation, storage, demand, and
                    market response.
                  </p>
                </div>
                <nav
                  aria-label="Footer"
                  className="text-muted-foreground grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-4"
                >
                  {[
                    ["Platform", "heliogrid-platform"],
                    ["Outcomes", "heliogrid-outcomes"],
                    ["Rollout", "heliogrid-rollout"],
                    ["FAQ", "heliogrid-faq"],
                  ].map(([label, id]) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="hover:text-foreground focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
              <Separator className="mt-8" />
              <div className="text-muted-foreground mt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <p>© 2026 HelioGrid Systems.</p>
                <p className="inline-flex items-center gap-2">
                  <ChartNoAxesCombined
                    className="size-3.5"
                    aria-hidden="true"
                  />
                  Every dispatch decision, explained.
                </p>
              </div>
            </div>
          </footer>

          <ToastViewport />
        </div>
      </ToastProvider>
    </HeroTextAnimationProvider>
  );
}
