"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  Activity,
  Bot,
  BrainCircuit,
  Check,
  Coins,
  Cpu,
  FileSearch,
  Gauge,
  MessageSquareText,
  PanelLeftOpen,
  Route,
  Search,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardStack,
  CardTitle,
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteDialog,
  CommandPaletteTrigger,
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  NavDock,
  NavDockButton,
  NavDockItem,
  NavDockList,
  NavDockSeparator,
  Progress,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarMobile,
  SidebarMobileTrigger,
  SidebarProvider,
  SidebarRail,
  SkeletonText,
  Textarea,
  Timeline,
  type CommandPaletteCommand,
  type TimelineItemData,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

// ----------------------------------------------------------------------------
// Decorative layers (token-only, aria-hidden, non-interactive)
// ----------------------------------------------------------------------------

const insetWashStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(56% 46% at 0% 0%, color-mix(in oklab, var(--dt-color-primary) 15%, transparent), transparent 70%)",
    "radial-gradient(50% 44% at 100% 0%, color-mix(in oklab, var(--dt-color-info) 13%, transparent), transparent 72%)",
    "radial-gradient(70% 62% at 90% 110%, color-mix(in oklab, var(--dt-color-success) 10%, transparent), transparent 74%)",
    "linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 3%, transparent), transparent 30%)",
  ].join(", "),
};

const insetGridStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, color-mix(in oklab, var(--dt-color-foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 5%, transparent) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  maskImage: "radial-gradient(90% 58% at 14% 0%, black, transparent 72%)",
  WebkitMaskImage: "radial-gradient(90% 58% at 14% 0%, black, transparent 72%)",
};

// ----------------------------------------------------------------------------
// Data
// ----------------------------------------------------------------------------

const runSteps: TimelineItemData[] = [
  {
    id: "queued",
    title: "Queued",
    description: "The run entered the evaluation queue.",
    status: "complete",
  },
  {
    id: "retrieval",
    title: "Retrieval",
    description: "Collecting docs, policies, and previous decisions.",
    status: "complete",
  },
  {
    id: "reasoning",
    title: "Reasoning",
    description: "Drafting recommendations with tool-call evidence.",
    status: "current",
  },
  {
    id: "review",
    title: "Human review",
    description: "Waiting for an owner to approve next steps.",
    status: "upcoming",
  },
];

const recentRuns = [
  { id: "run-8f2", label: "Regression review", status: "running" as const },
  { id: "run-8e9", label: "Policy audit", status: "passed" as const },
  { id: "run-8e1", label: "Prompt eval sweep", status: "queued" as const },
];

const recentRunDot: Record<string, string> = {
  running: "bg-warning motion-safe:animate-pulse",
  passed: "bg-success",
  queued: "bg-muted-foreground",
  failed: "bg-destructive",
};

const recentRunLabel: Record<string, string> = {
  running: "Running",
  passed: "Passed",
  queued: "Queued",
  failed: "Failed",
};

// Trend spark data for metric tiles
const costSpark = [24, 21, 26, 19, 22, 18, 20, 18];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const barTone: Record<string, { solid: string; soft: string }> = {
  primary: { solid: "bg-primary", soft: "bg-primary/25" },
  info: { solid: "bg-info", soft: "bg-info/25" },
  success: { solid: "bg-success", soft: "bg-success/25" },
  warning: { solid: "bg-warning", soft: "bg-warning/25" },
};

const snapshotTone: Record<string, { text: string; dot: string }> = {
  info: { text: "text-foreground", dot: "bg-info" },
  success: { text: "text-foreground", dot: "bg-success" },
  warning: {
    text: "text-foreground",
    dot: "bg-warning motion-safe:animate-pulse",
  },
};

function MiniBars({
  data,
  tone,
}: {
  data: number[];
  tone: keyof typeof barTone;
}) {
  const max = Math.max(...data);
  const { solid, soft } = barTone[tone];
  return (
    <div aria-hidden="true" className="flex h-8 w-20 items-end gap-0.5">
      {data.map((v, i) => (
        <span
          key={i}
          style={{ height: `${Math.max((v / max) * 100, 8)}%` }}
          className={`w-full rounded-sm ${i === data.length - 1 ? solid : soft}`}
        />
      ))}
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  delta,
  deltaDir,
  deltaTone,
  children,
}: {
  icon: typeof Route;
  label: string;
  delta?: string;
  deltaDir?: "up" | "down";
  deltaTone?: "success" | "destructive" | "muted";
  children: React.ReactNode;
}) {
  const deltaColor =
    deltaTone === "success"
      ? "text-success"
      : deltaTone === "destructive"
        ? "text-destructive"
        : "text-muted-foreground";
  const DeltaIcon = deltaDir === "down" ? TrendingDown : TrendingUp;
  return (
    <Card
      shadow="sm"
      className="ring-border/60 relative overflow-hidden ring-1 backdrop-blur-sm hover:shadow-md motion-safe:transition-all motion-safe:duration-300 hover:motion-safe:-translate-y-0.5"
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[0.7rem] font-medium tracking-wide uppercase">
            <Icon aria-hidden="true" className="size-3.5" />
            {label}
          </span>
          {delta ? (
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold ${deltaColor}`}
            >
              {deltaDir ? (
                <DeltaIcon aria-hidden="true" className="size-3" />
              ) : null}
              {delta}
            </span>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------------

export function AiWorkspaceRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const [activeTool, setActiveTool] = useState("runs");
  const [status, setStatus] = useState("Agent run is collecting evidence.");
  const fullPage = presentation === "full-page";

  const commands: CommandPaletteCommand[] = [
    {
      action: () => setStatus("Started a regression review run."),
      group: "Run",
      icon: <Bot aria-hidden="true" className="size-4" />,
      key: "start-review",
      label: "Start regression review",
      shortcut: "G R",
    },
    {
      action: () => setStatus("Opened eval comparison."),
      group: "Navigate",
      icon: <BrainCircuit aria-hidden="true" className="size-4" />,
      key: "evals",
      label: "Open eval comparison",
    },
    {
      action: () => setStatus("Filtered runs to those needing approval."),
      group: "Filter",
      icon: <FileSearch aria-hidden="true" className="size-4" />,
      key: "needs-approval",
      label: "Runs needing approval",
    },
  ];

  return (
    <SidebarProvider variant="floating" motion="expressive">
      <div
        data-recipe-surface="ai-workspace"
        className={`border-border bg-muted/30 flex overflow-hidden border ${
          fullPage
            ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0"
            : "min-h-[42rem] rounded-xl"
        }`}
      >
        <Sidebar
          aria-label="AI workspace navigation"
          className={fullPage ? "max-md:hidden" : undefined}
        >
          <SidebarHeader>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary ring-primary/20 grid size-9 shrink-0 place-items-center rounded-lg ring-1"
                >
                  <Sparkles className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-foreground truncate text-sm font-semibold">
                    Assist Studio
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    Agent operations
                  </div>
                </div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workflows</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      current
                      badge="Live"
                      href="#runs"
                      icon={<Sparkles aria-hidden="true" />}
                    >
                      Agent runs
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="#evals"
                      icon={<BrainCircuit aria-hidden="true" />}
                    >
                      Evaluations
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="#prompts"
                      icon={<MessageSquareText aria-hidden="true" />}
                    >
                      Prompt library
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Recent runs</SidebarGroupLabel>
              <SidebarGroupContent>
                <ul className="space-y-0.5 px-1 py-1">
                  {recentRuns.map((run) => (
                    <li
                      key={run.id}
                      className="hover:bg-muted/60 flex items-center gap-2.5 rounded-md px-1.5 py-1.5 motion-safe:transition-colors"
                    >
                      <span
                        aria-hidden="true"
                        className={`size-2 shrink-0 rounded-full ${recentRunDot[run.status]}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="text-foreground block truncate text-xs font-medium">
                          {run.label}
                        </span>
                        <span className="text-muted-foreground block truncate font-mono text-[0.65rem]">
                          {run.id}
                        </span>
                      </span>
                      <span className="text-muted-foreground shrink-0 text-[0.65rem] font-medium">
                        {recentRunLabel[run.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button size="sm" variant="outline" leftIcon={<Bot />}>
              New agent run
            </Button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {fullPage ? (
          <SidebarMobile label="AI workspace navigation" className="md:hidden">
            <SidebarHeader>
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary ring-primary/20 grid size-9 shrink-0 place-items-center rounded-lg ring-1"
                >
                  <Sparkles className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-foreground truncate text-sm font-semibold">
                    Assist Studio
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    Agent operations
                  </div>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Workflows</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuLink
                        current
                        badge="Live"
                        href="#runs"
                        icon={<Sparkles aria-hidden="true" />}
                      >
                        Agent runs
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuLink
                        href="#evals"
                        icon={<BrainCircuit aria-hidden="true" />}
                      >
                        Evaluations
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuLink
                        href="#prompts"
                        icon={<MessageSquareText aria-hidden="true" />}
                      >
                        Prompt library
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </SidebarMobile>
        ) : null}

        <SidebarInset className="relative min-w-0 overflow-hidden p-4 sm:p-6">
          <span
            aria-hidden="true"
            style={insetWashStyle}
            className="pointer-events-none absolute inset-0"
          />
          <span
            aria-hidden="true"
            style={insetGridStyle}
            className="pointer-events-none absolute inset-0"
          />

          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
            {fullPage ? (
              <SidebarMobileTrigger className="md:hidden">
                <PanelLeftOpen aria-hidden="true" className="size-4" />
              </SidebarMobileTrigger>
            ) : null}

            <main className="min-w-0 space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-muted-foreground inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
                    <span className="relative flex size-2">
                      <span
                        aria-hidden="true"
                        className="bg-success/60 absolute inline-flex size-full rounded-full motion-safe:animate-ping"
                      />
                      <span
                        aria-hidden="true"
                        className="bg-success relative inline-flex size-2 rounded-full"
                      />
                    </span>
                    Agent operations
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-heading text-2xl font-semibold tracking-tight">
                      Agent review queue
                    </h2>
                    <span className="border-border/70 bg-background/70 text-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
                      <span
                        aria-hidden="true"
                        className="bg-primary/10 text-primary grid size-4 place-items-center rounded"
                      >
                        <Cpu className="size-3" />
                      </span>
                      Claude Opus
                      <span className="text-muted-foreground">
                        · fallback GPT
                      </span>
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Compose AI-native screens with existing primitives today.
                  </p>
                </div>
                <CommandPaletteDialog closeOnRun motionPreset="standard">
                  <CommandPaletteTrigger variant="outline">
                    <Search className="size-4" aria-hidden="true" />
                    Commands
                  </CommandPaletteTrigger>
                  <CommandPaletteContent
                    title="AI workspace commands"
                    description="Start runs, navigate evals, and filter review work."
                  >
                    <CommandPalette
                      label="AI workspace commands"
                      commands={commands}
                      placeholder="Search AI actions..."
                    />
                  </CommandPaletteContent>
                </CommandPaletteDialog>
              </div>

              <output className="border-border bg-background/70 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm backdrop-blur">
                <Activity
                  className="text-primary size-4 shrink-0"
                  aria-hidden="true"
                />
                {status}
              </output>

              {/* Run transcript / conversation feed */}
              <Card shadow="sm" className="ring-border/60 ring-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquareText
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    Run transcript
                  </CardTitle>
                  <CardDescription>
                    A chat-like log assembled from primitives — no dedicated
                    chat component required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    role="log"
                    aria-label="Agent run transcript"
                    className="space-y-4"
                  >
                    {/* User instruction */}
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="border-border/60 text-foreground/80 grid size-7 shrink-0 place-items-center rounded-full border text-[0.6rem] font-semibold"
                        style={{
                          backgroundColor:
                            "color-mix(in oklab, var(--dt-color-info) 18%, var(--dt-color-background))",
                        }}
                      >
                        <User className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                          <span className="text-foreground font-medium">
                            You
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>2m ago</span>
                        </div>
                        <div className="border-border/70 bg-muted/40 text-foreground/90 rounded-lg rounded-tl-sm border px-3 py-2 text-sm leading-6">
                          Audit the checkout regression suite and flag any evals
                          that dropped below the 90% pass threshold this week.
                        </div>
                      </div>
                    </div>

                    {/* Assistant tool calls */}
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-primary/10 text-primary ring-primary/20 grid size-7 shrink-0 place-items-center rounded-full ring-1"
                      >
                        <Bot className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span className="text-foreground font-medium">
                            Assist Studio
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>working</span>
                        </div>
                        <div className="border-border/60 bg-background/60 flex items-center gap-2.5 rounded-lg border px-3 py-2">
                          <span
                            aria-hidden="true"
                            className="bg-success/10 text-success grid size-6 shrink-0 place-items-center rounded-md"
                          >
                            <FileSearch className="size-3.5" />
                          </span>
                          <span className="text-foreground/90 min-w-0 flex-1 truncate text-xs">
                            <span className="font-mono">retrieval.search</span>{" "}
                            · 8 documents
                          </span>
                          <span className="text-success inline-flex items-center gap-1.5 text-[0.7rem] font-semibold">
                            <span
                              aria-hidden="true"
                              className="bg-success size-2 shrink-0 rounded-full"
                            />
                            Done
                          </span>
                        </div>
                        <div className="border-border/60 bg-background/60 flex items-center gap-2.5 rounded-lg border px-3 py-2">
                          <span
                            aria-hidden="true"
                            className="bg-warning/10 text-warning grid size-6 shrink-0 place-items-center rounded-md"
                          >
                            <BrainCircuit className="size-3.5" />
                          </span>
                          <span className="text-foreground/90 min-w-0 flex-1 truncate text-xs">
                            <span className="font-mono">reasoning.plan</span> ·
                            weighing eval deltas
                          </span>
                          <span className="text-foreground inline-flex items-center gap-1.5 text-[0.7rem] font-semibold">
                            <span
                              aria-hidden="true"
                              className="bg-warning size-2 shrink-0 rounded-full motion-safe:animate-pulse"
                            />
                            Running
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Assistant streaming response */}
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-primary/10 text-primary ring-primary/20 grid size-7 shrink-0 place-items-center rounded-full ring-1"
                      >
                        <Sparkles className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center gap-2 text-xs">
                          <span className="text-foreground font-medium">
                            Assist Studio
                          </span>
                          <span
                            className="text-primary inline-flex items-center gap-1.5 font-medium"
                            aria-live="polite"
                          >
                            <span
                              aria-hidden="true"
                              className="bg-primary size-1.5 rounded-full motion-safe:animate-pulse"
                            />
                            Streaming response…
                          </span>
                        </div>
                        <div className="border-border/60 bg-background/60 rounded-lg rounded-tl-sm border px-3 py-2.5">
                          <SkeletonText lines={3} animation="shimmer" />
                          <span
                            aria-hidden="true"
                            className="bg-primary/80 mt-2 inline-block h-4 w-0.5 rounded-full align-middle motion-safe:animate-pulse"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current run timeline */}
              <Card shadow="sm" className="ring-border/60 ring-1">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Activity
                          className="text-primary size-4"
                          aria-hidden="true"
                        />
                        Current run
                      </CardTitle>
                      <CardDescription>
                        Timeline communicates progress without a chat primitive.
                      </CardDescription>
                    </div>
                    <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem]">
                      run-8f2
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Timeline
                    aria-label="Agent run progress"
                    mode="progress"
                    layout="stacked"
                    scale="auto"
                    items={runSteps}
                    defaultSelectedId="reasoning"
                  />
                </CardContent>
              </Card>

              {/* Metric tiles */}
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricTile icon={Route} label="Model routing">
                  <div className="font-heading text-xl font-semibold tracking-tight">
                    Opus · GPT-4o
                  </div>
                  <div
                    aria-hidden="true"
                    className="bg-muted/50 flex h-2 w-full overflow-hidden rounded-full"
                  >
                    <span
                      className="bg-primary h-full"
                      style={{ width: "92%" }}
                    />
                    <span className="bg-info h-full" style={{ width: "8%" }} />
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-[0.7rem]">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="bg-primary size-2 rounded-full"
                      />
                      Primary 92%
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="bg-info size-2 rounded-full"
                      />
                      Fallback 8%
                    </span>
                  </div>
                </MetricTile>

                <MetricTile
                  icon={Cpu}
                  label="Token usage"
                  delta="+180K"
                  deltaTone="muted"
                >
                  <div className="font-heading text-xl font-semibold tracking-tight">
                    1.24M
                    <span className="text-muted-foreground ml-1 text-xs font-normal">
                      tokens
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="bg-muted/50 flex h-2 w-full overflow-hidden rounded-full"
                  >
                    <span
                      className="bg-primary h-full"
                      style={{ width: "62%" }}
                    />
                    <span className="bg-info h-full" style={{ width: "38%" }} />
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-[0.7rem]">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="bg-primary size-2 rounded-full"
                      />
                      Input 780K
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="bg-info size-2 rounded-full"
                      />
                      Output 460K
                    </span>
                  </div>
                </MetricTile>

                <MetricTile
                  icon={Coins}
                  label="Cost window"
                  delta="−$2.10"
                  deltaDir="down"
                  deltaTone="success"
                >
                  <div className="flex items-end justify-between gap-3">
                    <div className="font-heading text-xl font-semibold tracking-tight">
                      $18.42
                      <span className="text-muted-foreground ml-1 text-xs font-normal">
                        today
                      </span>
                    </div>
                    <MiniBars data={costSpark} tone="success" />
                  </div>
                  <div className="text-muted-foreground text-[0.7rem]">
                    Trending under the $24 daily budget.
                  </div>
                </MetricTile>

                <MetricTile
                  icon={Gauge}
                  label="Eval pass rate"
                  delta="+2%"
                  deltaDir="up"
                  deltaTone="success"
                >
                  <div className="font-heading text-xl font-semibold tracking-tight">
                    94%
                    <span className="text-muted-foreground ml-1 text-xs font-normal">
                      last 24h
                    </span>
                  </div>
                  <Progress
                    size="sm"
                    tone="success"
                    value={94}
                    aria-label="Eval pass rate 94 percent"
                  />
                  <div className="text-muted-foreground text-[0.7rem]">
                    47 of 50 checks passing.
                  </div>
                </MetricTile>
              </div>

              {/* Prompt + run snapshots */}
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <Card shadow="sm" className="ring-border/60 ring-1">
                  <CardHeader>
                    <CardTitle className="text-base">Prompt</CardTitle>
                    <CardDescription>
                      Textarea gives prompt input room without pretending to be
                      a full chat component.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Field id="ai-prompt">
                      <FieldLabel>Instruction</FieldLabel>
                      <FieldDescription>
                        Ask the agent to inspect a product surface.
                      </FieldDescription>
                      <FieldControl asChild>
                        <Textarea
                          rows={5}
                          defaultValue="Review the dashboard recipe for missing empty, loading, and reduced-motion states."
                        />
                      </FieldControl>
                    </Field>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button rightIcon={<Send />}>Queue run</Button>
                      <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                        <Cpu className="size-3.5" aria-hidden="true" />
                        Routed to Claude Opus
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <CardStack aria-label="AI run snapshots">
                  {[
                    {
                      title: "Regression review",
                      body: "8 evidence docs · reasoning in progress",
                      tone: "warning" as const,
                      state: "Running",
                    },
                    {
                      title: "Policy audit",
                      body: "All 24 policies matched · no drift",
                      tone: "success" as const,
                      state: "Passed",
                    },
                    {
                      title: "Prompt eval sweep",
                      body: "Waiting on human approval to deploy",
                      tone: "info" as const,
                      state: "Queued",
                    },
                  ].map((run) => (
                    <Card key={run.title}>
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">
                            {run.title}
                          </CardTitle>
                          <span
                            className={`inline-flex items-center gap-1.5 text-[0.7rem] font-semibold ${snapshotTone[run.tone].text}`}
                          >
                            <span
                              aria-hidden="true"
                              className={`size-2 rounded-full ${snapshotTone[run.tone].dot}`}
                            />
                            {run.state}
                          </span>
                        </div>
                        <CardDescription>{run.body}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </CardStack>
              </div>
            </main>

            <aside className="space-y-5">
              <Card shadow="sm" className="ring-border/60 ring-1">
                <CardHeader>
                  <CardTitle className="text-base">Tool dock</CardTitle>
                  <CardDescription>
                    Compact local navigation for AI workbench modes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NavDock
                    aria-label="AI tools"
                    currentValue={activeTool}
                    placement="bottom"
                    showTitle="always"
                    size="sm"
                    variant="glass"
                  >
                    <NavDockList>
                      <NavDockItem icon={<Bot />} title="Runs" value="runs">
                        <NavDockButton onAction={() => setActiveTool("runs")} />
                      </NavDockItem>
                      <NavDockItem
                        icon={<BrainCircuit />}
                        title="Evals"
                        value="evals"
                      >
                        <NavDockButton
                          onAction={() => setActiveTool("evals")}
                        />
                      </NavDockItem>
                      <NavDockSeparator />
                      <NavDockItem
                        icon={<MessageSquareText />}
                        title="Prompts"
                        value="prompts"
                      >
                        <NavDockButton
                          onAction={() => setActiveTool("prompts")}
                        />
                      </NavDockItem>
                    </NavDockList>
                  </NavDock>
                </CardContent>
              </Card>

              <Card shadow="sm" className="ring-border/60 ring-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    Streaming summary
                  </CardTitle>
                  <CardDescription>
                    Skeletons keep space stable while a run streams.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-primary inline-flex items-center gap-1.5 text-xs font-medium">
                      <span
                        aria-hidden="true"
                        className="bg-primary size-1.5 rounded-full motion-safe:animate-pulse"
                      />
                      Generating summary…
                    </span>
                    <SkeletonText lines={4} animation="shimmer" />
                  </div>
                  <Progress
                    label="Evidence collected"
                    tone="primary"
                    value={72}
                    showValue
                  />
                  <Progress
                    label="Eval coverage"
                    tone="success"
                    value={94}
                    showValue
                  />
                </CardContent>
              </Card>

              <Card shadow="sm" className="ring-border/60 ring-1">
                <CardHeader>
                  <CardTitle className="text-base">Reviewers</CardTitle>
                  <CardDescription>
                    Owners queued for the approval step.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {[
                      {
                        name: "Maya Chen",
                        role: "Approver · Billing",
                        tint: "var(--dt-color-primary)",
                        dot: "bg-success",
                      },
                      {
                        name: "Priya Rao",
                        role: "Reviewer · Gateway",
                        tint: "var(--dt-color-warning)",
                        dot: "bg-warning motion-safe:animate-pulse",
                      },
                    ].map((person) => (
                      <li
                        key={person.name}
                        className="flex items-center gap-2.5"
                      >
                        <span className="relative shrink-0">
                          <span
                            aria-hidden="true"
                            className="border-border/60 text-foreground/80 grid size-8 place-items-center rounded-full border text-[0.65rem] font-semibold"
                            style={{
                              backgroundColor: `color-mix(in oklab, ${person.tint} 18%, var(--dt-color-background))`,
                            }}
                          >
                            {initials(person.name)}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`border-background absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 ${person.dot}`}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground block truncate text-xs font-medium">
                            {person.name}
                          </span>
                          <span className="text-muted-foreground block truncate text-[0.7rem]">
                            {person.role}
                          </span>
                        </span>
                        <Check
                          className="text-success size-4 shrink-0"
                          aria-hidden="true"
                        />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
