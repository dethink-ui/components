"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Command,
  Gauge,
  LayoutDashboard,
  Radio,
  Rocket,
  Search,
  Settings2,
  ShieldAlert,
  Siren,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  ChatMessage,
  CommandPalette,
  Progress,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Toast,
  TypingIndicator,
  cn,
  type BadgeTone,
  type ChatMessageData,
  type CommandPaletteCommand,
  type ProgressTone,
} from "@dethink/components";

/*
 * "Watch Beacon assemble": a pinned product stage that builds the app one
 * layer at a time while the story steps scroll past. An IntersectionObserver
 * picks the step crossing the viewport and the stage reveals every layer up
 * to it with tokenized CSS transitions (transform + opacity only). Motion is
 * used for one thing: the incident table's layout re-sort.
 *
 * The stage is a fixed 1040x640 canvas scaled to its column, so it reads as a
 * real desktop app at every breakpoint. It is decorative (aria-hidden + inert)
 * and the step list carries the accessible story. Set `--beacon-sticky-top`
 * on an ancestor when the page has its own sticky header.
 */

const CANVAS_WIDTH = 1040;
const CANVAS_HEIGHT = 640;

type Step = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  builtWith: string[];
};

const steps: Step[] = [
  {
    key: "shell",
    eyebrow: "Blank canvas",
    title: "One calm home for every incident",
    body: "Beacon starts from a single workspace instead of five browser tabs, a pager app, and a spreadsheet nobody trusts.",
    builtWith: ["Grid", "Card"],
  },
  {
    key: "navigation",
    eyebrow: "Navigation",
    title: "Everything one click away",
    body: "Incidents, responders, and service levels live in one sidebar, with a breadcrumb so nobody gets lost at 3am.",
    builtWith: ["Sidebar", "Breadcrumb"],
  },
  {
    key: "data",
    eyebrow: "Live signal",
    title: "The worst problem floats to the top",
    body: "Health metrics update in place and the incident queue re-sorts itself by severity, so responders always start with what matters.",
    builtWith: ["Card", "Progress", "Table", "Badge"],
  },
  {
    key: "feedback",
    eyebrow: "Status",
    title: "Everyone stays in the loop",
    body: "Resolutions, hand-offs, and deploy notices arrive as quiet confirmations instead of interrupting the person fixing things.",
    builtWith: ["Toast"],
  },
  {
    key: "command",
    eyebrow: "Keyboard first",
    title: "Respond without reaching for the mouse",
    body: "Press ⌘K to open an incident, page on-call, or declare a new sev from anywhere in Beacon.",
    builtWith: ["CommandPalette"],
  },
  {
    key: "ai",
    eyebrow: "Copilot",
    title: "A copilot that has read the runbook",
    body: "Ask what changed and Beacon's copilot correlates deploys, error rates, and past incidents, then drafts the status update for you.",
    builtWith: ["ChatMessage", "TypingIndicator"],
  },
  {
    key: "ship",
    eyebrow: "Live",
    title: "Running before your next standup",
    body: "Connect your alerts, invite the rotation, and Beacon is ready. Most teams resolve their first incident in it on day one.",
    builtWith: [],
  },
];

const STEP = {
  shell: 0,
  navigation: 1,
  data: 2,
  feedback: 3,
  command: 4,
  ai: 5,
  ship: 6,
} as const;

const kpis: {
  label: string;
  value: string;
  progress: number;
  tone: ProgressTone;
  delta: string;
}[] = [
  {
    label: "Open incidents",
    value: "14",
    progress: 62,
    tone: "warning",
    delta: "−3 today",
  },
  {
    label: "Uptime (30d)",
    value: "99.94%",
    progress: 94,
    tone: "success",
    delta: "+0.02%",
  },
  {
    label: "Median response",
    value: "4m 12s",
    progress: 48,
    tone: "info",
    delta: "−38s",
  },
];

type Severity = "sev1" | "sev2" | "sev3";

const severityRank: Record<Severity, number> = { sev1: 0, sev2: 1, sev3: 2 };
const severityTone: Record<Severity, BadgeTone> = {
  sev1: "destructive",
  sev2: "warning",
  sev3: "info",
};

const incidents: {
  id: string;
  title: string;
  service: string;
  severity: Severity;
}[] = [
  {
    id: "INC-1042",
    title: "Checkout webhook retries",
    service: "Billing",
    severity: "sev2",
  },
  {
    id: "INC-1041",
    title: "Delayed export jobs",
    service: "Reports",
    severity: "sev3",
  },
  {
    id: "INC-1039",
    title: "Elevated API errors",
    service: "Gateway",
    severity: "sev1",
  },
  {
    id: "INC-1037",
    title: "Search index lag",
    service: "Search",
    severity: "sev3",
  },
  {
    id: "INC-1036",
    title: "Card auth timeouts",
    service: "Payments",
    severity: "sev1",
  },
];

const sortedIncidents = [...incidents].sort(
  (a, b) => severityRank[a.severity] - severityRank[b.severity],
);

const paletteCommands: CommandPaletteCommand[] = [
  {
    key: "open-incident",
    group: "Incidents",
    label: "Open incident INC-1039",
    description: "Elevated API errors · Gateway",
    icon: <Siren aria-hidden="true" className="size-4" />,
    shortcut: "↵",
  },
  {
    key: "new-incident",
    group: "Incidents",
    label: "Declare new incident",
    icon: <ShieldAlert aria-hidden="true" className="size-4" />,
    shortcut: "N",
  },
  {
    key: "page-oncall",
    group: "Actions",
    label: "Page on-call responder",
    icon: <UserPlus aria-hidden="true" className="size-4" />,
    shortcut: "P",
  },
  {
    key: "settings",
    group: "Navigation",
    label: "Open settings",
    icon: <Settings2 aria-hidden="true" className="size-4" />,
    shortcut: "G S",
  },
];

const userMessage: ChatMessageData = {
  id: "beacon-user",
  conversationId: "beacon-assembly",
  role: "user",
  name: "Maya",
  parts: [
    {
      id: "beacon-user-text",
      type: "text",
      text: "What's driving the Gateway errors?",
    },
  ],
};

const ASSISTANT_REPLY =
  "INC-1039 started at 09:42 after the auth-proxy deploy. 5xx rate is 3.1% on /v2/orders. Rolling back proxy v4.18 should clear it; I drafted the status update.";

/* Shared reveal classes: animate transform + opacity only, off for reduced motion. */
const reveal =
  "transition-[opacity,translate,scale] duration-700 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

function useActiveStep() {
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const targets = refs.current.filter(
      (element): element is HTMLLIElement => element !== null,
    );
    if (targets.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.step));
          }
        }
      },
      // A thin band just below the middle of the viewport picks the step.
      { rootMargin: "-55% 0px -44% 0px", threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return { active, refs };
}

function useCanvasScale() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return undefined;
    }

    const update = () => setScale(frame.clientWidth / CANVAS_WIDTH);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return { frameRef, scale };
}

function useStreamedText(text: string, running: boolean, instant: boolean) {
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (!running || instant) {
      return undefined;
    }

    // Give the typing indicator a beat before tokens start streaming.
    let intervalId: number | undefined;
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setLength((current) => {
          const next = Math.min(text.length, current + 3);
          if (next === text.length) {
            window.clearInterval(intervalId);
          }
          return next;
        });
      }, 28);
    }, 700);

    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
      setLength(0);
    };
  }, [instant, running, text]);

  if (!running) {
    return "";
  }
  return instant ? text : text.slice(0, length);
}

function useDelayedFlag(on: boolean, delay: number, instant: boolean) {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!on || instant) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setElapsed(true), delay);
    return () => {
      window.clearTimeout(timeoutId);
      setElapsed(false);
    };
  }, [delay, instant, on]);

  return on && (instant || elapsed);
}

const MotionTableRow = motion.create(TableRow);

function AssemblyStage({ step }: { step: number }) {
  const reduceMotion = useReducedMotion() ?? false;
  const { frameRef, scale } = useCanvasScale();

  const at = (target: number) => step >= target;
  const sorted = useDelayedFlag(at(STEP.data), 900, reduceMotion);
  const streamed = useStreamedText(ASSISTANT_REPLY, at(STEP.ai), reduceMotion);
  const rows = sorted ? sortedIncidents : incidents;

  const assistantMessage: ChatMessageData = {
    id: "beacon-assistant",
    conversationId: "beacon-assembly",
    role: "assistant",
    name: "Beacon copilot",
    status: streamed.length < ASSISTANT_REPLY.length ? "streaming" : "complete",
    parts: [{ id: "beacon-assistant-text", type: "text", text: streamed }],
  };

  return (
    <div
      ref={frameRef}
      aria-hidden="true"
      inert
      data-beacon-stage
      data-step={steps[step]?.key}
      className={cn(
        "border-border bg-background relative w-full overflow-hidden rounded-xl border shadow-xl transition-shadow duration-700",
        at(STEP.ship) &&
          "ring-primary/40 shadow-[0_24px_80px_-24px_color-mix(in_oklab,var(--dt-color-primary)_45%,transparent)] ring-2",
      )}
      style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${scale ?? 1})`,
          visibility: scale === null ? "hidden" : undefined,
        }}
      >
        {/* Window chrome */}
        <div className="border-border bg-muted/40 flex h-10 items-center gap-2 border-b px-4">
          <span className="bg-foreground/20 size-2.5 rounded-full" />
          <span className="bg-foreground/20 size-2.5 rounded-full" />
          <span className="bg-foreground/20 size-2.5 rounded-full" />
          <span className="border-border bg-background text-muted-foreground mx-auto flex h-6 w-72 items-center justify-center rounded-md border font-mono text-[11px]">
            app.beacon.dev/overview
          </span>
          <span className="flex items-center gap-1.5">
            {steps.map((item, index) => (
              <span
                key={item.key}
                className={cn(
                  "h-1.5 rounded-full transition-[width,background-color] duration-500 motion-reduce:transition-none",
                  index === step
                    ? "bg-primary w-5"
                    : index < step
                      ? "bg-primary/50 w-1.5"
                      : "bg-foreground/15 w-1.5",
                )}
              />
            ))}
          </span>
        </div>

        <div className="relative flex h-[600px]">
          {/* Blueprint layer: dashed placeholders that the real parts cover */}
          <div
            className={cn(
              "text-muted-foreground absolute inset-0 grid grid-cols-[232px_1fr] gap-4 p-4 font-mono text-[11px] tracking-[0.12em] uppercase transition-opacity duration-700",
              at(STEP.data) && "opacity-0",
            )}
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in oklab, var(--dt-color-foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 5%, transparent) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            <div className="border-foreground/20 grid place-items-center rounded-lg border-2 border-dashed">
              Navigation
            </div>
            <div className="grid grid-rows-[40px_120px_1fr] gap-4">
              <div className="border-foreground/20 grid place-items-center rounded-lg border-2 border-dashed">
                Header
              </div>
              <div className="grid grid-cols-3 gap-4">
                {["Signal", "Signal", "Signal"].map((label, index) => (
                  <div
                    key={index}
                    className="border-foreground/20 grid place-items-center rounded-lg border-2 border-dashed"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="border-foreground/20 grid place-items-center rounded-lg border-2 border-dashed">
                Incident queue
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <SidebarProvider variant="default" motion="none" className="contents">
            <Sidebar
              aria-label="Beacon navigation"
              className={cn(
                "bg-background relative z-10 w-[232px] shrink-0",
                reveal,
                at(STEP.navigation)
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0",
              )}
            >
              <SidebarHeader>
                <div className="flex items-center gap-2.5">
                  <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-lg">
                    <Radio className="size-4.5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">Beacon</div>
                    <div className="text-muted-foreground text-xs">
                      Acme on-call
                    </div>
                  </div>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuLink
                          current
                          href="#beacon-assemble"
                          icon={<LayoutDashboard />}
                        >
                          Overview
                        </SidebarMenuLink>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuLink
                          href="#beacon-assemble"
                          badge="14"
                          icon={<ShieldAlert />}
                        >
                          Incidents
                        </SidebarMenuLink>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuLink
                          href="#beacon-assemble"
                          badge="3"
                          icon={<Users />}
                        >
                          Responders
                        </SidebarMenuLink>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuLink
                          href="#beacon-assemble"
                          icon={<Gauge />}
                        >
                          Service levels
                        </SidebarMenuLink>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
          </SidebarProvider>

          {/* Main inset */}
          <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-4 p-4">
            <div
              className={cn(
                "flex h-10 items-center justify-between gap-3",
                reveal,
                at(STEP.navigation)
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-3 opacity-0",
              )}
            >
              <Breadcrumb
                size="sm"
                items={[
                  { key: "home", label: "Acme", href: "#beacon-assemble" },
                  { key: "ops", label: "Operations", href: "#beacon-assemble" },
                  { key: "overview", label: "Overview" },
                ]}
              />
              <span
                className={cn(
                  "border-border bg-background text-muted-foreground flex h-8 w-56 items-center gap-2 rounded-md border px-2.5 text-xs transition-[scale,border-color,box-shadow] duration-300 motion-reduce:transition-none",
                  step === STEP.command &&
                    "border-primary ring-primary/25 scale-[0.97] ring-4",
                )}
              >
                <Search className="size-3.5" />
                Search or jump to…
                <kbd className="border-border bg-muted ml-auto flex items-center gap-0.5 rounded border px-1 font-mono text-[10px]">
                  <Command className="size-2.5" />K
                </kbd>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {kpis.map((kpi, index) => (
                <Card
                  key={kpi.label}
                  shadow="sm"
                  className={cn(
                    "ring-border/60 ring-1",
                    reveal,
                    at(STEP.data)
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0",
                  )}
                  style={{
                    transitionDelay: at(STEP.data) ? `${index * 90}ms` : "0ms",
                  }}
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      {kpi.label}
                      <span className="font-mono text-[10px]">{kpi.delta}</span>
                    </div>
                    <div className="font-heading text-2xl font-semibold tracking-tight">
                      {kpi.value}
                    </div>
                    <Progress
                      size="sm"
                      aria-label={kpi.label}
                      value={kpi.progress}
                      tone={kpi.tone}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card
              shadow="sm"
              className={cn(
                "ring-border/60 min-h-0 flex-1 overflow-hidden ring-1",
                reveal,
                at(STEP.data)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0",
              )}
              style={{ transitionDelay: at(STEP.data) ? "240ms" : "0ms" }}
            >
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Activity className="text-primary size-4" />
                  Active incidents
                </span>
                <span
                  className={cn(
                    "text-muted-foreground font-mono text-[10px] tracking-wide uppercase transition-colors duration-500",
                    sorted && "text-primary",
                  )}
                >
                  {sorted ? "Sorted · severity ↓" : "Newest first"}
                </span>
              </div>
              <Table density="compact">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Incident</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead align="end">Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((incident) => (
                    <MotionTableRow
                      key={incident.id}
                      layout={!reduceMotion}
                      transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
                    >
                      <TableCell className="font-mono text-xs">
                        {incident.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {incident.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {incident.service}
                      </TableCell>
                      <TableCell align="end">
                        <Badge
                          size="sm"
                          variant="soft"
                          tone={severityTone[incident.severity]}
                        >
                          {incident.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </MotionTableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Toast */}
          <div
            className={cn(
              "absolute right-4 bottom-4 z-30 w-80",
              reveal,
              step === STEP.feedback
                ? "translate-y-0 opacity-100"
                : at(STEP.feedback)
                  ? "translate-x-8 opacity-0"
                  : "translate-y-6 opacity-0",
            )}
          >
            <Toast
              motion="none"
              toast={{
                id: "beacon-toast",
                tone: "success",
                title: "INC-1041 resolved",
                description: "Export jobs are back within SLO.",
                persistent: true,
                announce: false,
              }}
            />
          </div>

          {/* Command palette */}
          <div
            className={cn(
              "bg-foreground/20 absolute inset-0 z-40 grid place-items-start justify-center pt-16 transition-opacity duration-500 motion-reduce:transition-none",
              step === STEP.command ? "opacity-100" : "opacity-0",
            )}
          >
            <div
              className={cn(
                "border-border bg-background w-[520px] overflow-hidden rounded-xl border shadow-2xl",
                reveal,
                step === STEP.command
                  ? "translate-y-0 scale-100"
                  : "-translate-y-2 scale-95",
              )}
            >
              <CommandPalette
                label="Beacon commands"
                commands={paletteCommands}
                defaultSelectedKey="open-incident"
                placeholder="Search incidents, people, actions…"
                announcements={false}
              />
            </div>
          </div>

          {/* AI copilot */}
          <div
            className={cn(
              "border-border bg-background absolute top-0 right-0 bottom-0 z-20 flex w-[340px] flex-col border-l shadow-xl",
              reveal,
              at(STEP.ai)
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0",
            )}
          >
            <div className="border-border flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold">
              <span className="bg-primary/10 text-primary grid size-7 place-items-center rounded-md">
                <Bot className="size-4" />
              </span>
              Beacon copilot
              <Badge
                size="xs"
                tone="primary"
                variant="soft"
                className="ml-auto"
              >
                Beta
              </Badge>
            </div>
            <div className="flex-1 space-y-5 overflow-hidden p-4">
              <ChatMessage message={userMessage} />
              {streamed.length === 0 ? (
                <TypingIndicator active={at(STEP.ai)} />
              ) : (
                <ChatMessage
                  message={assistantMessage}
                  avatar={<Sparkles className="text-primary size-3.5" />}
                />
              )}
            </div>
            <div className="border-border border-t p-3">
              <div className="border-border text-muted-foreground rounded-lg border px-3 py-2.5 text-xs">
                Ask about incidents, deploys, or SLOs…
              </div>
            </div>
          </div>

          {/* Live stamp */}
          <div
            className={cn(
              "absolute bottom-6 left-1/2 z-50 -translate-x-1/2",
              reveal,
              at(STEP.ship)
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-6 scale-95 opacity-0",
            )}
          >
            <div className="border-primary/40 bg-background/95 flex items-center gap-3 rounded-full border py-2 ps-2 pe-5 shadow-2xl">
              <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full">
                <Rocket className="size-4" />
              </span>
              <span className="text-sm font-semibold">Beacon is live</span>
              <span className="text-muted-foreground font-mono text-[11px]">
                set up in 4 minutes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BeaconAssembly({ onStart }: { onStart?: () => void }) {
  const { active, refs } = useActiveStep();

  return (
    <section
      id="beacon-assemble"
      aria-labelledby="beacon-assemble-heading"
      className="border-border scroll-mt-[var(--beacon-sticky-top,0px)] border-y px-4 pt-16 sm:px-6 lg:px-10"
    >
      <div className="max-w-2xl space-y-3">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Scroll to see it come together
        </p>
        <h2
          id="beacon-assemble-heading"
          className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          Watch Beacon assemble, one layer at a time
        </h2>
        <p className="text-muted-foreground text-base leading-7">
          Seven layers turn a blank screen into the place your team runs
          incidents. Keep scrolling.
        </p>
      </div>

      <div className="mt-8 grid gap-x-12 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        {/* Pinned stage: top of the viewport on small screens, vertically centred beside the steps on large. */}
        <div className="bg-background/90 sticky top-[calc(var(--beacon-sticky-top,0px)+0.5rem)] z-10 -mx-4 self-start px-4 py-3 backdrop-blur sm:mx-0 sm:px-0 lg:top-[var(--beacon-sticky-top,0px)] lg:order-2 lg:flex lg:h-[calc(100svh-var(--beacon-sticky-top,0px))] lg:items-center lg:bg-transparent lg:py-0 lg:backdrop-blur-none">
          <AssemblyStage step={active} />
        </div>

        <ol aria-label="How Beacon comes together" className="lg:order-1">
          {steps.map((step, index) => {
            const isActive = index === active;
            return (
              <li
                key={step.key}
                ref={(element) => {
                  refs.current[index] = element;
                }}
                data-step={index}
                aria-current={isActive ? "step" : undefined}
                className="flex min-h-[70svh] items-center py-8 first:min-h-[50svh] first:pt-4 last:min-h-[60svh]"
              >
                <div
                  className={cn(
                    // Emphasis comes from border and shadow, never opacity, so
                    // every step keeps full text contrast.
                    "bg-background w-full rounded-xl border p-5 transition-[border-color,box-shadow] duration-500 motion-reduce:transition-none",
                    isActive
                      ? "border-primary ring-primary/15 shadow-md ring-4"
                      : "border-border",
                  )}
                >
                  <p className="text-primary font-mono text-[11px] font-medium tracking-[0.14em] uppercase">
                    {String(index + 1).padStart(2, "0")} · {step.eyebrow}
                  </p>
                  <h3 className="font-heading mt-2 text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {step.body}
                  </p>
                  {step.builtWith.length > 0 ? (
                    <p className="text-muted-foreground mt-3 font-mono text-[11px]">
                      Built with {step.builtWith.join(" · ")}
                    </p>
                  ) : (
                    <Button
                      className="mt-4"
                      rightIcon={<ArrowRight />}
                      onClick={onStart}
                    >
                      Start free trial
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
