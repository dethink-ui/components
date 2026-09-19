"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Cloud,
  GitBranch,
  Layers3,
  LifeBuoy,
  MessageSquare,
  PlugZap,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  EmptyState,
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Input,
  Select,
  SelectItem,
  Switch,
  Tabs,
  ToastProvider,
  ToastViewport,
  useToast,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

const integrations = [
  {
    id: "relay",
    name: "Relay",
    category: "Communication",
    description:
      "Bring project updates to the conversations where work happens.",
    icon: MessageSquare,
  },
  {
    id: "orbit",
    name: "Orbit",
    category: "Project management",
    description: "Keep issues, milestones, and team priorities in sync.",
    icon: GitBranch,
  },
  {
    id: "cloud",
    name: "Cloudroom",
    category: "File storage",
    description:
      "Make the latest files easy to find, right inside your workspace.",
    icon: Cloud,
  },
  {
    id: "atlas",
    name: "Atlas",
    category: "Knowledge",
    description: "Connect the notes and decisions behind every project.",
    icon: BookOpen,
  },
  {
    id: "pulse",
    name: "Pulse",
    category: "Monitoring",
    description: "Turn service alerts into clear, actionable team updates.",
    icon: Radio,
  },
  {
    id: "loop",
    name: "Loop",
    category: "Customer support",
    description: "Give your team the customer context behind each request.",
    icon: LifeBuoy,
  },
];
type Integration = (typeof integrations)[number];
type Connection = { workspace: string; sync: boolean; cadence: string };
const initialConnections: Record<string, Connection> = {
  relay: { workspace: "Acme Studio", sync: true, cadence: "hourly" },
  orbit: { workspace: "Acme Studio", sync: true, cadence: "hourly" },
  cloud: { workspace: "Acme Studio", sync: false, cadence: "daily" },
};
const emptyConnection: Connection = {
  workspace: "Acme Studio",
  sync: true,
  cadence: "hourly",
};

export function IntegrationsHubRecipe(props: RecipePreviewProps) {
  return (
    <ToastProvider placement="bottom-end">
      <IntegrationsHub {...props} />
      <ToastViewport />
    </ToastProvider>
  );
}

function IntegrationsHub({ presentation = "embedded" }: RecipePreviewProps) {
  const { toast, clearToasts } = useToast();
  const [connections, setConnections] = useState(initialConnections);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Integration | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Connection>(emptyConnection);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );
  const connectedCount = Object.keys(connections).length;
  const filtered = integrations.filter(
    (item) =>
      (tab === "all" || Boolean(connections[item.id])) &&
      `${item.name} ${item.category} ${item.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  function cancelPendingSave() {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    setSaving(false);
  }
  function changeOpen(next: boolean) {
    if (!next) cancelPendingSave();
    setOpen(next);
  }
  function configure(item: Integration) {
    cancelPendingSave();
    setSelected(item);
    setDraft(connections[item.id] ?? emptyConnection);
    setOpen(true);
  }
  function save() {
    if (!selected || saving) return;
    const item = selected;
    const wasConnected = Boolean(connections[item.id]);
    const settings = { ...draft, workspace: draft.workspace.trim() };
    setSaving(true);
    // A bounded local delay demonstrates Button's pending state. No network request.
    timer.current = setTimeout(() => {
      setConnections((current) => ({ ...current, [item.id]: settings }));
      timer.current = null;
      setSaving(false);
      setOpen(false);
      toast({
        title: wasConnected
          ? `${item.name} settings saved`
          : `${item.name} connected`,
        description: `Sample connection for ${settings.workspace}.`,
        tone: "success",
      });
    }, 650);
  }

  const settingsPanel = (
    <DrawerContent dismissible showCloseButton>
      {selected ? (
        <form
          className="flex min-h-full flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <DrawerHeader>
            <span className="bg-primary/10 text-primary mb-3 grid size-12 place-items-center rounded-xl">
              <selected.icon className="size-5" aria-hidden />
            </span>
            <DrawerTitle>
              {connections[selected.id] ? "Manage" : "Connect"} {selected.name}
            </DrawerTitle>
            <DrawerDescription>
              Choose how this tool works with your workspace.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 space-y-6 px-6 py-4">
            <Field>
              <FieldLabel>Workspace name</FieldLabel>
              <FieldControl asChild>
                <Input
                  required
                  pattern=".*\S.*"
                  title="Enter a workspace name"
                  maxLength={60}
                  name="workspace"
                  value={draft.workspace}
                  disabled={saving}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      workspace: event.target.value,
                    }))
                  }
                />
              </FieldControl>
              <FieldDescription>
                This label appears in your connection settings.
              </FieldDescription>
            </Field>
            <div className="border-border flex items-center justify-between gap-4 rounded-xl border p-4">
              <div>
                <p className="text-sm font-medium">Automatic sync</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Keep workspace updates in step.
                </p>
              </div>
              <Switch
                aria-label="Automatic sync"
                checked={draft.sync}
                disabled={saving}
                onCheckedChange={(sync) =>
                  setDraft((current) => ({ ...current, sync }))
                }
              />
            </div>
            <Select
              label="Sync frequency"
              value={draft.cadence}
              disabled={!draft.sync || saving}
              onValueChange={(cadence) =>
                setDraft((current) => ({ ...current, cadence }))
              }
            >
              <SelectItem value="hourly">Every hour</SelectItem>
              <SelectItem value="daily">Once a day</SelectItem>
            </Select>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm font-medium">A safe place to explore</p>
              <p className="text-muted-foreground mt-2 text-xs leading-5">
                This sample stores settings in this page only. No account,
                credentials, or external permissions are needed.
              </p>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => changeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving
                ? "Saving…"
                : connections[selected.id]
                  ? "Save changes"
                  : "Connect integration"}
            </Button>
          </DrawerFooter>
        </form>
      ) : null}
    </DrawerContent>
  );

  return (
    <section
      data-recipe-surface="integrations-hub"
      className={`bg-background text-foreground ${presentation === "full-page" ? "min-h-[calc(100dvh-7rem)]" : "border-border overflow-hidden rounded-xl border"}`}
    >
      <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
            <Layers3 className="size-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">Mesh</span>
          <span className="text-muted-foreground hidden text-sm sm:inline">
            / Workspace connections
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Acme Studio</Badge>
          <Avatar name="Jamie Rivers" size="sm" />
        </div>
      </header>
      <div className="space-y-8 p-5 sm:p-8 lg:p-10">
        <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Better, together.
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Your tools. One flow.
            </h2>
            <p className="text-muted-foreground max-w-lg text-sm leading-6">
              A little less switching. A lot more doing. Connect the tools your
              team already loves.
            </p>
          </div>
          <div aria-hidden className="hidden items-center gap-3 sm:flex">
            <span className="bg-muted text-muted-foreground grid size-12 place-items-center rounded-2xl">
              <MessageSquare className="size-5" />
            </span>
            <span className="border-primary/30 w-6 border-t border-dashed" />
            <span className="bg-primary/10 text-primary ring-primary/20 grid size-20 place-items-center rounded-3xl ring-1">
              <Layers3 className="size-8" />
            </span>
            <span className="border-primary/30 w-6 border-t border-dashed" />
            <span className="bg-muted text-muted-foreground grid size-12 place-items-center rounded-2xl">
              <GitBranch className="size-5" />
            </span>
          </div>
        </div>
        <div className="border-border bg-muted/25 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="bg-success/10 text-success grid size-9 place-items-center rounded-full">
              <ShieldCheck className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium" role="status">
                {connectedCount} connected tools
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                You choose what syncs and when.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw />}
            onClick={() => {
              cancelPendingSave();
              setOpen(false);
              setConnections(initialConnections);
              setQuery("");
              setTab("all");
              clearToasts();
            }}
          >
            Reset demo
          </Button>
        </div>
        <Tabs
          value={tab}
          onValueChange={setTab}
          variant="line"
          motionPreset="subtle"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <Tabs.List aria-label="Integration views" className="w-auto">
              <Tabs.Trigger value="all">All integrations</Tabs.Trigger>
              <Tabs.Trigger value="connected">
                Connected ({connectedCount})
              </Tabs.Trigger>
            </Tabs.List>
            <div className="relative w-full sm:w-64">
              <Search
                className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                aria-label="Search integrations"
                placeholder="Search integrations…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="ps-9"
              />
            </div>
          </div>
          {/* Both tabs use the same grid so filtering keeps a single source of truth. */}
          {["all", "connected"].map((value) => (
            <Tabs.Panel key={value} value={value}>
              <p className="sr-only" role="status">
                {filtered.length} integrations shown
              </p>
              {filtered.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((item) => {
                    const connection = connections[item.id];
                    return (
                      <Drawer
                        key={item.id}
                        open={open && selected?.id === item.id}
                        onOpenChange={changeOpen}
                        direction="right"
                        size="sm"
                        motionPreset="subtle"
                      >
                        <Card
                          shadow="none"
                          className="flex h-full flex-col gap-5 p-5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="bg-muted text-foreground grid size-11 place-items-center rounded-xl">
                              <item.icon className="size-5" aria-hidden />
                            </span>
                            {connection ? (
                              <Badge tone="success" icon={<Check />}>
                                Connected
                              </Badge>
                            ) : (
                              <Badge variant="outline">Available</Badge>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold">
                              {item.name}
                            </h3>
                            <p className="text-primary mt-1 text-xs">
                              {item.category}
                            </p>
                            <p className="text-muted-foreground mt-3 text-sm leading-6">
                              {item.description}
                            </p>
                          </div>
                          <div className="border-border flex items-center justify-between gap-2 border-t pt-4">
                            <span className="text-muted-foreground text-xs">
                              {connection
                                ? connection.sync
                                  ? "Auto-sync on"
                                  : "Sync paused"
                                : "Ready to connect"}
                            </span>
                            <DrawerTrigger
                              size="sm"
                              variant={connection ? "outline" : "soft"}
                              aria-label={`${connection ? "Manage" : "Connect"} ${item.name}`}
                              onPress={() => configure(item)}
                            >
                              {connection ? "Manage" : "Connect"}
                              {connection ? (
                                <ArrowUpRight className="size-4" aria-hidden />
                              ) : (
                                <PlugZap className="size-4" aria-hidden />
                              )}
                            </DrawerTrigger>
                          </div>
                        </Card>
                        {selected?.id === item.id ? settingsPanel : null}
                      </Drawer>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  variant="card"
                  title="No integrations found"
                  description="Try a different name or explore all available tools."
                  visual={<Search />}
                  primaryAction={
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery("");
                        setTab("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              )}
            </Tabs.Panel>
          ))}
        </Tabs>
        <p className="text-muted-foreground border-border border-t pt-5 text-xs">
          Interactive demo · Fictional services, local settings, no external
          connections. Changes reset on refresh.
        </p>
      </div>
    </section>
  );
}
