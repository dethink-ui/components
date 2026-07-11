"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  Clock,
  Fingerprint,
  Lock,
  Play,
  Radar,
  Search,
  Server,
  ShieldCheck,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useToast,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

/*
 * "Dethink Labs" — a security-platform landing page recipe that leans hard into
 * the component library rather than mirroring a static mock. It is built from
 * real, interactive Dethink components: NavigationMenu, a Tabs/Table/Switch/
 * ProgressCircle live console, an AvatarGroup, a reusable Dialog + Field/Input/
 * Select form that fires Toasts, an incident-response Timeline, a Switch-driven
 * pricing toggle, an Accordion FAQ, and Badge/Progress throughout. Everything is
 * driven by the semantic --dt-* token contract, so it re-themes live (light /
 * dark, any brand). Motion is guarded by `motion-safe:` and the hero animation's
 * reduced-motion strategy.
 */

// Radial teal halo, blended from the active primary token.
const haloStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(60% 55% at 50% 20%, color-mix(in oklab, var(--dt-color-primary) 18%, transparent), transparent 72%)",
};

// Faint dotted grid, masked to fade toward the hero edges.
const dottedGridStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(color-mix(in oklab, var(--dt-color-primary) 20%, transparent) 1px, transparent 1px)",
  backgroundSize: "34px 34px",
  maskImage: "radial-gradient(70% 60% at 50% 14%, black, transparent 74%)",
  WebkitMaskImage:
    "radial-gradient(70% 60% at 50% 14%, black, transparent 74%)",
};

const radarSweepStyle: CSSProperties = {
  backgroundImage:
    "conic-gradient(from 0deg, var(--dt-color-primary) 0deg, transparent 55deg, transparent 360deg)",
};

const platformMenu = [
  {
    icon: Radar,
    title: "Threat Detection",
    body: "Correlate signal across network, identity, and endpoint.",
  },
  {
    icon: Lock,
    title: "Zero Trust Access",
    body: "Verify identity, device posture, and context on every call.",
  },
  {
    icon: ShieldCheck,
    title: "Endpoint Defense",
    body: "Isolate compromised devices in seconds, across every OS.",
  },
] as const;

const securityTeam: AvatarGroupMember[] = [
  { id: "mira", name: "Mira Patel", tone: "primary", metadata: "SOC lead" },
  { id: "eli", name: "Eli Morgan", tone: "info", metadata: "Threat intel" },
  {
    id: "june",
    name: "June Okafor",
    tone: "success",
    metadata: "Incident response",
  },
  { id: "sam", name: "Sam Rivera", tone: "warning", metadata: "Compliance" },
  { id: "noah", name: "Noah Reyes", tone: "destructive", metadata: "Red team" },
];

const trustedBy = [
  "Northwind",
  "Vertex Rail",
  "Halcyon",
  "Ferro Bank",
  "Cascade Health",
  "Orbital",
];

type FeedTone = "destructive" | "warning" | "success";
const threatFeed: {
  time: string;
  msg: string;
  tag: string;
  tone: FeedTone;
}[] = [
  {
    time: "02:14:09",
    msg: "Blocked credential-stuffing attempt",
    tag: "AUTH",
    tone: "destructive",
  },
  {
    time: "02:13:41",
    msg: "Endpoint isolated: finance-laptop-22",
    tag: "EDR",
    tone: "destructive",
  },
  {
    time: "02:12:58",
    msg: "Anomalous data egress flagged",
    tag: "NET",
    tone: "warning",
  },
  {
    time: "02:11:02",
    msg: "Policy verified: prod-cluster-eu",
    tag: "OK",
    tone: "success",
  },
];

const accessRows = [
  { id: "m.reyes@corp", device: "Trusted", granted: true },
  { id: "svc-deploy@ci", device: "Managed", granted: true },
  { id: "unknown@vpn", device: "Unmanaged", granted: false },
];

const endpoints = [
  {
    name: "finance-laptop-22",
    coverage: 100,
    tone: "success" as const,
    status: "Monitored",
  },
  {
    name: "eng-mbp-09",
    coverage: 42,
    tone: "destructive" as const,
    status: "Isolated",
  },
  {
    name: "ops-win-14",
    coverage: 88,
    tone: "warning" as const,
    status: "Scanning",
  },
];

const incident: TimelineItemData[] = [
  {
    id: "detected",
    title: "Intrusion detected",
    description:
      "Behavioral engine flags lateral movement from a compromised VPN session.",
    dateLabel: "02:11:02",
    status: "complete",
  },
  {
    id: "contained",
    title: "Automatically contained",
    description:
      "Zero-trust policy revokes the session and isolates two endpoints.",
    dateLabel: "02:11:40",
    status: "complete",
  },
  {
    id: "eradicated",
    title: "Threat eradicated",
    description:
      "Malicious binaries quarantined; credentials rotated across the blast radius.",
    dateLabel: "02:19:26",
    status: "current",
  },
  {
    id: "reported",
    title: "Evidence packaged",
    description:
      "A signed incident report is filed to the audit trail for compliance.",
    dateLabel: "02:24:10",
    status: "upcoming",
  },
];

const faqs = [
  {
    value: "deploy",
    q: "How fast can we deploy?",
    a: "Agents roll out in under a day. Detection starts correlating signal the moment endpoints check in — no lengthy tuning phase.",
  },
  {
    value: "coverage",
    q: "Which platforms are covered?",
    a: "macOS, Windows, Linux, and major cloud workloads share one policy engine, so a single rule applies everywhere you run.",
  },
  {
    value: "compliance",
    q: "Does this help with audits?",
    a: "Evidence is collected continuously and packaged into signed reports for SOC 2, ISO 27001, and HIPAA — always ready, never a scramble.",
  },
  {
    value: "data",
    q: "Where does our data live?",
    a: "Telemetry is encrypted end-to-end and processed in your chosen region. You hold the keys; we hold zero standing access.",
  },
];

const plans = [
  {
    name: "Team",
    monthly: 0,
    blurb: "For small teams standing up their first detection stack.",
    features: [
      "Up to 25 endpoints",
      "Threat feed & access log",
      "Community support",
    ],
    popular: false,
  },
  {
    name: "Growth",
    monthly: 18,
    blurb: "For security teams defending a fast-moving org.",
    features: [
      "Unlimited endpoints",
      "Zero-trust access policies",
      "Automated isolation & IR timeline",
      "SOC 2 / ISO evidence export",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    blurb: "For regulated orgs with custom governance needs.",
    features: [
      "Everything in Growth",
      "Private region & BYOK",
      "Dedicated response engineer",
    ],
    popular: false,
  },
];

function BrandMark({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <ShieldCheck className="text-primary size-[1.15em]" aria-hidden="true" />
      <span className="font-heading text-sm font-bold tracking-tight">
        Dethink<span className="text-primary">Labs</span>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable "book a demo" dialog — a real form that announces via Toast.       */
/* -------------------------------------------------------------------------- */

function DemoDialog({
  trigger,
  variant = "solid",
  size = "lg",
  className,
  title = "Book your security audit",
  description = "A Dethink engineer maps your attack surface in a free 30-minute session.",
}: {
  trigger: ReactNode;
  variant?: "solid" | "outline" | "ghost" | "soft";
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
  description?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState<string>("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger variant={variant} size={size} className={className}>
        {trigger}
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
            toast({
              title: "Request received",
              description: `A response engineer will reach out${
                email ? ` to ${email}` : ""
              } within one business day.`,
              tone: "success",
            });
            setEmail("");
            setTeam("");
          }}
        >
          <div className="space-y-4 px-[var(--dt-space-6)] py-[var(--dt-space-2)]">
            <Field id="demo-email">
              <FieldLabel>Work email</FieldLabel>
              <FieldControl asChild>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ops@company.com"
                />
              </FieldControl>
            </Field>
            <Select
              label="Security team size"
              placeholder="Select…"
              value={team || undefined}
              onValueChange={setTeam}
            >
              <SelectItem value="1-10">1–10</SelectItem>
              <SelectItem value="11-50">11–50</SelectItem>
              <SelectItem value="51-200">51–200</SelectItem>
              <SelectItem value="200+">200+</SelectItem>
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

/* -------------------------------------------------------------------------- */
/* Live security console (hero visual) — Tabs + Table + Switch + ProgressCircle */
/* -------------------------------------------------------------------------- */

function feedBadgeTone(tone: FeedTone) {
  return tone;
}

function SecurityConsole() {
  const [live, setLive] = useState(true);

  return (
    <Card
      shadow="md"
      className="ring-border/60 w-full overflow-hidden ring-1 backdrop-blur-sm"
    >
      <div className="border-border/70 bg-muted/40 flex items-center gap-2.5 border-b px-4 py-2.5">
        <span className="bg-foreground/20 size-2.5 rounded-full" />
        <span className="bg-foreground/20 size-2.5 rounded-full" />
        <span className="bg-foreground/20 size-2.5 rounded-full" />
        <span className="text-muted-foreground ml-1.5 font-mono text-[11px]">
          dethink://console/soc
        </span>
        <Field
          id="console-live"
          orientation="horizontal"
          className="ml-auto items-center gap-2"
        >
          <FieldControl asChild>
            <Switch
              checked={live}
              onCheckedChange={setLive}
              controlSize="sm"
              aria-label="Live monitoring"
            />
          </FieldControl>
          <FieldLabel className="text-muted-foreground text-[11px] font-medium">
            Live
          </FieldLabel>
        </Field>
      </div>

      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-4">
          <ProgressCircle
            label="Coverage"
            value={live ? 98 : 0}
            showValue
            size="lg"
            tone={live ? "success" : "warning"}
          />
          <div className="min-w-0">
            <Badge
              tone={live ? "success" : "neutral"}
              variant="soft"
              size="sm"
              icon={
                <span
                  className={`size-1.5 rounded-full ${
                    live
                      ? "bg-success motion-safe:animate-pulse"
                      : "bg-muted-foreground"
                  }`}
                />
              }
            >
              {live ? "Monitoring" : "Paused"}
            </Badge>
            <p className="text-muted-foreground mt-1.5 text-xs leading-5">
              {live
                ? "All systems monitored · zero trust enforced"
                : "Monitoring paused — no signal is being collected"}
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <div className="font-heading text-2xl font-bold tracking-tight">
              1.8s
            </div>
            <div className="text-muted-foreground font-mono text-[10px]">
              mean detect
            </div>
          </div>
        </div>

        <Tabs defaultValue="feed">
          <Tabs.List aria-label="Console views">
            <Tabs.Trigger value="feed" icon={<Activity aria-hidden />}>
              Feed
            </Tabs.Trigger>
            <Tabs.Trigger value="access" icon={<Fingerprint aria-hidden />}>
              Access
            </Tabs.Trigger>
            <Tabs.Trigger value="endpoints" icon={<Server aria-hidden />}>
              Endpoints
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Panel value="feed">
            <ul className="mt-3 space-y-1.5 font-mono text-[12px]">
              {threatFeed.map((row) => (
                <li key={row.time} className="flex items-center gap-2.5">
                  <span className="text-muted-foreground">{row.time}</span>
                  <span className="text-foreground/90 truncate">{row.msg}</span>
                  <Badge
                    className="ml-auto shrink-0"
                    size="xs"
                    variant="soft"
                    tone={feedBadgeTone(row.tone)}
                  >
                    {row.tag}
                  </Badge>
                </li>
              ))}
            </ul>
          </Tabs.Panel>

          <Tabs.Panel value="access">
            <div className="mt-3 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identity</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead align="end">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">
                        {row.id}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {row.device}
                      </TableCell>
                      <TableCell align="end">
                        <Badge
                          size="xs"
                          variant="soft"
                          tone={row.granted ? "success" : "destructive"}
                        >
                          {row.granted ? "granted" : "denied"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="endpoints">
            <ul className="mt-3 space-y-2.5">
              {endpoints.map((ep) => (
                <li key={ep.name} className="flex items-center gap-3">
                  <span className="font-mono text-xs">{ep.name}</span>
                  <Badge
                    className="shrink-0"
                    size="xs"
                    variant="soft"
                    tone={ep.tone}
                  >
                    {ep.status}
                  </Badge>
                  <span className="ml-auto w-24 shrink-0">
                    <Progress
                      aria-label={`${ep.name} coverage`}
                      value={ep.coverage}
                      size="sm"
                      tone={
                        ep.tone === "destructive" ? "destructive" : "primary"
                      }
                    />
                  </span>
                </li>
              ))}
            </ul>
          </Tabs.Panel>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Feature bento visuals                                                       */
/* -------------------------------------------------------------------------- */

function RadarVisual() {
  return (
    <div className="bg-muted/40 relative grid min-h-44 flex-1 place-items-center overflow-hidden rounded-lg">
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--dt-color-primary) 20%, transparent) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <span className="border-primary/25 absolute size-36 rounded-full border" />
      <span className="border-primary/25 absolute size-24 rounded-full border" />
      <span className="border-primary/25 absolute size-12 rounded-full border" />
      <span
        aria-hidden="true"
        style={radarSweepStyle}
        className="absolute size-36 rounded-full opacity-70 motion-safe:animate-[spin_3.4s_linear_infinite]"
      />
      <span
        className="bg-destructive absolute top-[34%] left-[62%] size-1.5 rounded-full"
        style={{
          boxShadow:
            "0 0 0 6px color-mix(in oklab, var(--dt-color-destructive) 22%, transparent)",
        }}
      />
      <span
        className="bg-primary absolute top-[64%] left-[34%] size-1.5 rounded-full"
        style={{
          boxShadow:
            "0 0 0 5px color-mix(in oklab, var(--dt-color-primary) 25%, transparent)",
        }}
      />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  badge,
  body,
  children,
  colSpan,
  rowSpan,
}: {
  icon: typeof Radar;
  title: string;
  badge?: string;
  body: string;
  children?: ReactNode;
  colSpan: "2" | "4";
  rowSpan?: boolean;
}) {
  return (
    <GridItem
      colSpan={colSpan}
      className={`max-md:col-span-full ${rowSpan ? "md:row-span-2" : ""}`}
    >
      <Card className="ring-border/60 flex h-full flex-col gap-4 overflow-hidden p-6 ring-1 hover:shadow-md motion-safe:transition-all motion-safe:duration-200 hover:motion-safe:-translate-y-1">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-md">
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-base font-semibold">{title}</h3>
            {badge ? (
              <Badge
                className="ml-auto"
                size="xs"
                tone="primary"
                variant="soft"
              >
                {badge}
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm leading-6">{body}</p>
        </div>
        {children}
      </Card>
    </GridItem>
  );
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                     */
/* -------------------------------------------------------------------------- */

function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <div className="mb-8 flex items-center justify-center gap-3">
        <span className="text-muted-foreground text-sm">Monthly</span>
        <Field
          id="billing-cadence"
          orientation="horizontal"
          className="items-center"
        >
          <FieldControl asChild>
            <Switch
              checked={annual}
              onCheckedChange={setAnnual}
              aria-label="Bill annually"
            />
          </FieldControl>
          <FieldLabel className="text-sm">Annual</FieldLabel>
        </Field>
        <Badge tone="success" variant="soft" size="sm">
          Save 20%
        </Badge>
      </div>

      <Grid
        columns="3"
        gap="6"
        align="stretch"
        className="grid-cols-1 md:grid-cols-3"
      >
        {plans.map((plan) => {
          const price =
            plan.monthly === null
              ? "Custom"
              : plan.monthly === 0
                ? "$0"
                : `$${annual ? Math.round(plan.monthly * 0.8) : plan.monthly}`;

          return (
            <GridItem key={plan.name}>
              <Card
                shadow={plan.popular ? "md" : "sm"}
                className={`relative flex h-full flex-col overflow-hidden p-6 ${
                  plan.popular ? "ring-primary ring-2" : "ring-border/50 ring-1"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold">
                    {plan.name}
                  </h3>
                  {plan.popular ? (
                    <Badge tone="primary" size="sm">
                      Most popular
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-heading text-3xl font-bold tracking-tight">
                    {price}
                  </span>
                  {plan.monthly ? (
                    <span className="text-muted-foreground text-sm">
                      / endpoint · mo
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {plan.blurb}
                </p>
                <Separator className="my-5" />
                <ul className="flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-foreground/90 flex items-start gap-2.5 text-sm leading-6"
                    >
                      <span className="bg-success/15 text-success mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                        <Check
                          className="size-3"
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.popular ? (
                  <DemoDialog
                    size="md"
                    className="mt-6 w-full"
                    trigger={
                      <span className="inline-flex items-center gap-2">
                        Start free audit <ArrowRight className="size-4" />
                      </span>
                    }
                  />
                ) : (
                  <Button variant="outline" size="md" className="mt-6 w-full">
                    {plan.monthly === null ? "Talk to sales" : "Get started"}
                  </Button>
                )}
              </Card>
            </GridItem>
          );
        })}
      </Grid>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Landing page                                                                */
/* -------------------------------------------------------------------------- */

export function DethinkLabsSecurityRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";

  return (
    <HeroTextAnimationProvider>
      <ToastProvider motion="standard">
        <div
          data-recipe-surface="dethink-labs-security"
          className={`border-border bg-background relative overflow-hidden border ${
            fullPage
              ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0"
              : "rounded-xl"
          }`}
        >
          {/* ============================ NAVBAR ============================ */}
          <div className="sticky top-3 z-20 flex justify-center px-4 pt-4">
            <header className="border-border bg-background/80 flex items-center gap-1 rounded-full border py-1.5 pr-1.5 pl-4 shadow-lg backdrop-blur">
              <a
                href="#dethink-hero"
                className="focus-visible:ring-ring border-border/70 mr-1 flex items-center gap-2 rounded-full border-r pr-3 outline-none focus-visible:ring-2"
              >
                <BrandMark />
              </a>

              <NavigationMenu aria-label="Primary" className="hidden lg:flex">
                <NavigationMenuList>
                  <NavigationMenuItem value="platform">
                    <NavigationMenuTrigger>
                      <Lock className="size-3.5" aria-hidden="true" />
                      Platform
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuFeaturedItem href="#dethink-features">
                        Unified console
                        <NavigationMenuDescription>
                          Detection, identity, and endpoint defense in one pane
                          of glass.
                        </NavigationMenuDescription>
                      </NavigationMenuFeaturedItem>
                      <NavigationMenuSection>
                        <NavigationMenuLabel>Capabilities</NavigationMenuLabel>
                        {platformMenu.map(({ icon: Icon, title, body }) => (
                          <NavigationMenuLink
                            key={title}
                            href="#dethink-features"
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
                    <NavigationMenuLink
                      href="#dethink-timeline"
                      icon={<Clock aria-hidden="true" />}
                    >
                      Response
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="#dethink-pricing"
                      icon={<BarChart3 aria-hidden="true" />}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#dethink-faq">
                      Docs
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuIndicator />
                </NavigationMenuList>
              </NavigationMenu>

              <div className="border-border/70 ml-1 flex items-center gap-1 border-l pl-2">
                <RevealButton
                  icon={<Search />}
                  label="Search"
                  variant="ghost"
                  size="sm"
                  className="max-sm:hidden"
                />
                <RevealButton
                  icon={<Bell />}
                  label="Alerts"
                  variant="ghost"
                  size="sm"
                  className="max-sm:hidden"
                />
                <DemoDialog
                  size="sm"
                  className="rounded-full"
                  trigger="Request a demo"
                  title="Request a demo"
                  description="See the console defend a live environment in a 30-minute walkthrough."
                />
              </div>
            </header>
          </div>

          {/* ============================ HERO ============================ */}
          <section
            id="dethink-hero"
            className="relative overflow-hidden px-4 pt-14 pb-16 sm:px-6 lg:px-10"
          >
            <span
              aria-hidden="true"
              style={haloStyle}
              className="pointer-events-none absolute inset-0"
            />
            <span
              aria-hidden="true"
              style={dottedGridStyle}
              className="pointer-events-none absolute inset-0"
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_28rem]">
              <div>
                <Badge
                  data-security-status
                  tone="success"
                  variant="soft"
                  className="w-fit max-w-full justify-start font-mono leading-4 tracking-[0.06em] whitespace-normal sm:whitespace-nowrap"
                  icon={
                    <span className="bg-success size-1.5 rounded-full motion-safe:animate-pulse" />
                  }
                >
                  ALL SYSTEMS MONITORED · ZERO TRUST BY DEFAULT
                </Badge>

                {/* The rendered h1 receives accessible text through the component's text prop. */}
                {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
                <HeroTextAnimation
                  as="h1"
                  animation="blur-focus"
                  text="See the breach before it happens."
                  emphasisWords={["breach"]}
                  className="font-heading mt-5 max-w-xl text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]"
                />

                <p className="text-muted-foreground mt-5 max-w-lg text-base leading-7">
                  Dethink Labs unifies threat detection, identity, and endpoint
                  defense into one console — so your team stops chasing alerts
                  and starts stopping attackers.
                </p>

                <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <DemoDialog
                    size="lg"
                    trigger={
                      <span className="inline-flex items-center gap-2">
                        Start free audit <ArrowRight className="size-4" />
                      </span>
                    }
                  />
                  <RevealButton
                    icon={<Play />}
                    label="Watch platform demo"
                    variant="outline"
                    size="lg"
                    labelVisibility="always"
                  />
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <AvatarGroup
                    label="Dethink response team"
                    max={4}
                    members={securityTeam}
                    ring="border"
                    size="sm"
                  />
                  <p
                    data-security-proof
                    className="text-muted-foreground text-xs leading-5"
                  >
                    A 24/7 response team backs every deployment{" "}
                    <span className="text-foreground block font-medium">
                      mean time to isolate: under 40 seconds
                    </span>
                  </p>
                </div>
              </div>

              <SecurityConsole />
            </div>
          </section>

          {/* ============================ TRUST STRIP ============================ */}
          <section
            aria-label="Trusted by security teams"
            className="border-border bg-muted/20 border-y px-4 py-8 sm:px-6"
          >
            <div className="flex flex-col items-center gap-5">
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground/80 font-mono text-[11px] tracking-[0.14em]">
                  TRUSTED BY SECURITY TEAMS AT
                </p>
                <Tooltip>
                  <TooltipTrigger
                    aria-label="Compliance details"
                    size="xs"
                    variant="ghost"
                  >
                    <Badge tone="info" variant="soft" size="xs">
                      SOC 2 Type II
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Independently audited controls, renewed annually.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
                {trustedBy.map((name) => (
                  <span
                    key={name}
                    className="text-muted-foreground/70 font-heading text-lg font-semibold tracking-tight opacity-80 transition-opacity hover:opacity-100"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ============================ FEATURES (bento) ============================ */}
          <section
            id="dethink-features"
            className="px-4 py-14 sm:px-6 lg:px-10"
          >
            <div className="mx-auto mb-12 max-w-xl text-center">
              <p className="text-primary font-mono text-[11px] tracking-[0.14em]">
                THE PLATFORM
              </p>
              <h2 className="font-heading mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                One console. Every layer of defense.
              </h2>
              <p className="text-muted-foreground mt-3 text-[15px] leading-7">
                From the network edge to the endpoint, Dethink correlates signal
                across your stack in real time.
              </p>
            </div>

            <Grid columns="6" gap="4" className="grid-cols-1 md:grid-cols-6">
              <FeatureCard
                icon={Radar}
                title="Threat Detection"
                badge="Real-time"
                body="Behavioral analysis correlates signal across network, identity, and endpoint to surface real intrusions — not noise."
                colSpan="2"
                rowSpan
              >
                <RadarVisual />
                <div className="text-muted-foreground flex items-center justify-between font-mono text-[11px]">
                  <span>
                    <span className="text-primary">247</span> triaged today
                  </span>
                  <span>
                    detect <span className="text-primary">1.8s</span>
                  </span>
                </div>
              </FeatureCard>

              <FeatureCard
                icon={Lock}
                title="Zero Trust Access"
                body="Every request is verified and scoped — identity, device posture, and context, checked on each call."
                colSpan="4"
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Identity", tone: "success" as const },
                    { label: "Device posture", tone: "success" as const },
                    { label: "Context", tone: "primary" as const },
                    { label: "Unmanaged VPN", tone: "destructive" as const },
                  ].map((pill) => (
                    <Badge
                      key={pill.label}
                      tone={pill.tone}
                      variant="soft"
                      size="sm"
                    >
                      {pill.label}
                    </Badge>
                  ))}
                </div>
              </FeatureCard>

              <FeatureCard
                icon={ShieldCheck}
                title="Endpoint Defense"
                body="Compromised devices are isolated in seconds, across every OS you run."
                colSpan="2"
              >
                <div className="space-y-2">
                  {endpoints.slice(0, 2).map((ep) => (
                    <div key={ep.name} className="flex items-center gap-2">
                      <span className="font-mono text-[11px]">{ep.name}</span>
                      <Badge
                        className="ml-auto"
                        size="xs"
                        variant="soft"
                        tone={ep.tone}
                      >
                        {ep.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </FeatureCard>

              <FeatureCard
                icon={Zap}
                title="Compliance Automation"
                body="Audit evidence is collected continuously and packaged on demand."
                colSpan="2"
              >
                <div className="flex flex-wrap gap-2">
                  {["SOC 2", "ISO 27001", "HIPAA"].map((name) => (
                    <Badge
                      key={name}
                      tone="success"
                      variant="soft"
                      size="sm"
                      icon={<Check strokeWidth={3} />}
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
              </FeatureCard>
            </Grid>
          </section>

          {/* ============================ INCIDENT TIMELINE ============================ */}
          <section
            id="dethink-timeline"
            className="border-border bg-muted/20 border-y px-4 py-14 sm:px-6 lg:px-10"
          >
            <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
              <div>
                <p className="text-primary font-mono text-[11px] tracking-[0.14em]">
                  AUTONOMOUS RESPONSE
                </p>
                <h2 className="font-heading mt-3 text-3xl font-bold tracking-tight text-balance">
                  From breach to contained in seconds.
                </h2>
                <p className="text-muted-foreground mt-3 text-[15px] leading-7">
                  When the engine detects an intrusion, it acts — revoking
                  access, isolating devices, and packaging the evidence before
                  an analyst even opens the alert.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <ProgressCircle
                    label="Contained"
                    value={75}
                    showValue
                    tone="primary"
                  />
                  <p className="text-muted-foreground text-xs leading-5">
                    of incidents this month were
                    <br />
                    remediated with zero human action
                  </p>
                </div>
              </div>

              <Card className="ring-border/60 p-6 ring-1">
                <Timeline
                  aria-label="Incident response sequence"
                  items={incident}
                  orientation="vertical"
                />
              </Card>
            </div>
          </section>

          {/* ============================ METRICS ============================ */}
          <section
            aria-label="Platform metrics"
            className="px-4 py-14 sm:px-6 lg:px-10"
          >
            <Grid columns="4" gap="4" className="grid-cols-2 md:grid-cols-4">
              {[
                {
                  value: "4.2B+",
                  label: "Threats blocked / mo",
                  bar: 92,
                  tone: "primary" as const,
                },
                {
                  value: "99.99%",
                  label: "Platform uptime",
                  bar: 100,
                  tone: "success" as const,
                },
                {
                  value: "<40s",
                  label: "Mean time to isolate",
                  bar: 84,
                  tone: "primary" as const,
                },
                {
                  value: "2,600+",
                  label: "Security teams",
                  bar: 76,
                  tone: "info" as const,
                },
              ].map((stat) => (
                <GridItem key={stat.label}>
                  <Card className="ring-border/60 h-full p-5 ring-1">
                    <div className="text-primary font-heading text-3xl font-bold tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground mt-1 mb-3 text-[13px]">
                      {stat.label}
                    </div>
                    <Progress
                      aria-label={stat.label}
                      value={stat.bar}
                      size="sm"
                      tone={stat.tone}
                    />
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </section>

          {/* ============================ PRICING ============================ */}
          <section
            id="dethink-pricing"
            className="border-border bg-muted/20 border-t px-4 py-14 sm:px-6 lg:px-10"
          >
            <div className="mx-auto mb-8 max-w-xl text-center">
              <p className="text-primary font-mono text-[11px] tracking-[0.14em]">
                PRICING
              </p>
              <h2 className="font-heading mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Priced per endpoint. No surprises.
              </h2>
            </div>
            <Pricing />
          </section>

          {/* ============================ FAQ ============================ */}
          <section id="dethink-faq" className="px-4 py-14 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-2xl">
              <div className="mb-8 text-center">
                <p className="text-primary font-mono text-[11px] tracking-[0.14em]">
                  FAQ
                </p>
                <h2 className="font-heading mt-3 text-3xl font-bold tracking-tight text-balance">
                  Answers before you deploy.
                </h2>
              </div>
              <Accordion
                aria-label="Frequently asked questions"
                defaultValue="deploy"
              >
                {faqs.map((faq) => (
                  <Accordion.Item key={faq.value} value={faq.value}>
                    <Accordion.Blade>
                      <Accordion.BladeIcon>
                        <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
                          <path
                            d="m5.5 3.5 4 4.5-4 4.5"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.75"
                          />
                        </svg>
                      </Accordion.BladeIcon>
                      <Accordion.BladeText>{faq.q}</Accordion.BladeText>
                    </Accordion.Blade>
                    <Accordion.Content>
                      <p className="text-muted-foreground leading-6">{faq.a}</p>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          </section>

          {/* ============================ CTA BANNER ============================ */}
          <section
            aria-label="Get started"
            className="relative overflow-hidden px-4 py-20 text-center sm:px-6"
          >
            <span
              aria-hidden="true"
              style={haloStyle}
              className="pointer-events-none absolute inset-0"
            />
            <div className="relative mx-auto max-w-xl">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Ready to see your blind spots?
              </h2>
              <p className="text-muted-foreground mt-4 text-[15px] leading-7">
                A Dethink engineer will map your attack surface in a free
                30-minute audit — no obligation.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <DemoDialog
                  size="lg"
                  trigger={
                    <span className="inline-flex items-center gap-2">
                      Book your audit <ArrowRight className="size-4" />
                    </span>
                  }
                />
                <RevealButton
                  icon={<ShieldCheck />}
                  label="Talk to sales"
                  size="lg"
                  variant="outline"
                  labelVisibility="always"
                />
              </div>
            </div>
          </section>

          {/* ============================ FOOTER ============================ */}
          <footer className="border-border border-t px-4 py-10 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-start justify-between gap-8">
              <BrandMark className="text-base" />
              <div className="text-muted-foreground flex flex-wrap gap-x-12 gap-y-6 text-[13px]">
                {[
                  {
                    head: "PRODUCT",
                    items: [
                      "Threat Detection",
                      "Endpoint",
                      "Zero Trust Access",
                    ],
                  },
                  { head: "COMPANY", items: ["About", "Research", "Careers"] },
                  {
                    head: "LEGAL",
                    items: ["Privacy", "Security", "Trust Center"],
                  },
                ].map((col) => (
                  <div key={col.head} className="flex flex-col gap-2">
                    <span className="text-muted-foreground/70 mb-0.5 font-mono text-[10px] tracking-[0.12em]">
                      {col.head}
                    </span>
                    {col.items.map((item) => (
                      <a
                        key={item}
                        href="#dethink-hero"
                        className="hover:text-foreground transition-colors"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <Separator className="mt-8" />
            <p className="text-muted-foreground/70 mt-5 font-mono text-[11px]">
              © 2026 Dethink Labs, Inc. All systems monitored.
            </p>
          </footer>

          <ToastViewport />
        </div>
      </ToastProvider>
    </HeroTextAnimationProvider>
  );
}
