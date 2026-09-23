"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Button,
  BottomBar,
  BottomBarHeader,
  BottomBarTrigger,
  BottomBarContent,
  type BottomBarSize,
  Sidebar,
  SidebarActivity,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarMobile,
  SidebarMobileTrigger,
  SidebarShell,
  SidebarShellFooter,
  SidebarShellHeader,
  SidebarShellMain,
  SidebarTrigger,
  type SidebarSide,
  type SidebarActivityItem,
} from "@dethink/components";
import {
  Boxes,
  CircleCheck,
  FileText,
  House,
  Layers,
  Search,
} from "lucide-react";

function WorkspaceNavigation({
  activity,
}: {
  activity: SidebarActivityItem[];
}) {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-2">
          <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Layers className="size-4" />
          </span>
          <span className="group-data-[collapsed=true]/sidebar:sr-only">
            <strong className="block text-sm">Studio workspace</strong>
            <span className="text-muted-foreground text-xs">Product team</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {[
            { label: "Overview", icon: House },
            { label: "Projects", icon: Boxes },
            { label: "Documents", icon: FileText },
          ].map(({ label, icon: Icon }, index) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuLink
                href={`#workspace-${label.toLowerCase()}`}
                current={index === 0}
                icon={<Icon aria-hidden="true" />}
              >
                {label}
              </SidebarMenuLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarActivity
          className="mt-4"
          label="Background work"
          items={activity}
        />
      </SidebarContent>
      <SidebarFooter>
        <p className="text-muted-foreground px-2 text-xs group-data-[collapsed=true]/sidebar:sr-only">
          Everything in one place.
        </p>
      </SidebarFooter>
    </>
  );
}

const subscribeHydration = () => () => {};

export function SidebarShellLayoutOptions() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const [side, setSide] = useState<SidebarSide>("left");
  const [footer, setFooter] = useState<
    "none" | "content" | "shell" | "panel" | "panel-shell"
  >("panel");
  const [panelSize, setPanelSize] = useState<BottomBarSize>("sm");
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelView, setPanelView] = useState<"activity" | "notes">("activity");
  const [notes, setNotes] = useState("");
  const [header, setHeader] = useState(true);
  const [chrome, setChrome] = useState<"plain" | "workbench">("workbench");
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const [saved, setSaved] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const activity: SidebarActivityItem[] = [
    {
      id: "brief",
      title: "Launch brief",
      status: reviewed ? "complete" : "attention",
      action: reviewed
        ? undefined
        : { label: "Approve brief", onAction: () => setReviewed(true) },
    },
    {
      id: "index",
      title: "Indexing documents",
      status: "running",
      progress: 62,
    },
  ];
  const selectClass =
    "border-border bg-background rounded-md border px-2 py-1.5 text-sm";

  return (
    <div className="space-y-4" data-testid="shell-layout-demo">
      <fieldset
        disabled={!hydrated}
        aria-label="Workspace layout"
        className="flex min-w-0 flex-wrap items-end gap-3"
      >
        <label className="grid gap-1 text-xs">
          Navigation side
          <select
            className={selectClass}
            value={side}
            onChange={(e) => setSide(e.target.value as SidebarSide)}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          Bottom bar
          <select
            className={selectClass}
            value={footer}
            onChange={(e) => setFooter(e.target.value as typeof footer)}
          >
            <option value="none">None</option>
            <option value="content">Content width</option>
            <option value="shell">Full shell width</option>
            <option value="panel">Work panel inside shell</option>
            <option value="panel-shell">Work panel across shell</option>
          </select>
        </label>
        {(footer === "panel" || footer === "panel-shell") && (
          <label className="grid gap-1 text-xs">
            Panel size
            <select
              className={selectClass}
              value={panelSize}
              onChange={(event) =>
                setPanelSize(event.target.value as BottomBarSize)
              }
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </label>
        )}
        <label className="grid gap-1 text-xs">
          Appearance
          <select
            className={selectClass}
            value={chrome}
            onChange={(e) => setChrome(e.target.value as typeof chrome)}
          >
            <option value="workbench">Workbench</option>
            <option value="plain">Plain</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          Direction
          <select
            className={selectClass}
            value={dir}
            onChange={(e) => setDir(e.target.value as typeof dir)}
          >
            <option value="ltr">LTR</option>
            <option value="rtl">RTL</option>
          </select>
        </label>
        <label className="flex min-h-9 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={header}
            onChange={(e) => setHeader(e.target.checked)}
          />
          Show header
        </label>
      </fieldset>
      <SidebarShell
        side={side}
        dir={dir}
        chrome={chrome}
        motion="subtle"
        className="border-border h-[34rem] rounded-xl border max-md:gap-x-0"
        aria-label="Flexible workspace"
      >
        <Sidebar aria-label="Workspace navigation" className="hidden md:flex">
          <WorkspaceNavigation activity={activity} />
        </Sidebar>
        {header && (
          <SidebarShellHeader as="div">
            <SidebarTrigger className="hidden md:inline-flex" />
            <SidebarMobileTrigger className="md:hidden" />
            <span className="text-sm font-semibold">Workspace overview</span>
            <span className="text-muted-foreground ms-auto hidden items-center gap-1 text-xs sm:flex">
              <CircleCheck className="size-3.5" />
              All changes saved
            </span>
          </SidebarShellHeader>
        )}
        <SidebarShellMain as="section" aria-label="Workspace content">
          <SidebarMobile label="Workspace navigation">
            <WorkspaceNavigation activity={activity} />
          </SidebarMobile>
          {!header && (
            <div className="mb-4">
              <SidebarTrigger className="hidden md:inline-flex" />
              <SidebarMobileTrigger className="md:hidden" />
            </div>
          )}
          <div className="mx-auto max-w-3xl space-y-6">
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Your workspace
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                Make room for your work.
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Keep navigation on either edge, with the tools you need always
                within reach.
              </p>
            </div>
            <label className="border-border flex items-center gap-2 rounded-lg border px-3 py-2">
              <Search
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
              <input
                aria-label="Search workspace"
                placeholder="Search your workspace…"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Website refresh",
                "Customer insights",
                "Design system",
                "Autumn launch",
                "Product research",
                "Team handbook",
              ].map((name, i) => (
                <article
                  key={name}
                  className="border-border rounded-lg border p-4"
                >
                  <div className="bg-muted mb-5 flex size-9 items-center justify-center rounded-lg">
                    <Boxes className="text-muted-foreground size-4" />
                  </div>
                  <h4 className="text-sm font-medium">{name}</h4>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {i + 2} people · Updated today
                  </p>
                  <Button
                    className="mt-4"
                    size="sm"
                    variant="ghost"
                    onClick={() => setSaved(false)}
                  >
                    View project
                  </Button>
                </article>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              You’re all caught up.
            </p>
          </div>
        </SidebarShellMain>
        {(footer === "panel" || footer === "panel-shell") && (
          <BottomBar
            span={footer === "panel-shell" ? "shell" : "content"}
            size={panelSize}
            open={panelOpen}
            onOpenChange={setPanelOpen}
          >
            <BottomBarHeader className="gap-1">
              <span className="text-foreground me-2 text-xs font-semibold">
                Workbench
              </span>
              <div
                role="group"
                aria-label="Work panel view"
                className="flex gap-1"
              >
                {(["activity", "notes"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    aria-pressed={panelView === view}
                    className="hover:bg-muted aria-pressed:bg-muted aria-pressed:text-foreground focus-visible:outline-ring rounded-md px-2 py-1 text-xs capitalize focus-visible:outline-2"
                    onClick={() => {
                      setPanelView(view);
                      setPanelOpen(true);
                    }}
                  >
                    {view === "activity" ? "Activity" : "Notes"}
                  </button>
                ))}
              </div>
              <BottomBarTrigger
                className="ms-auto"
                expandLabel="Expand work panel"
                collapseLabel="Collapse work panel"
              />
            </BottomBarHeader>
            <BottomBarContent
              aria-label={
                panelView === "activity"
                  ? "Workbench activity"
                  : "Workbench notes"
              }
            >
              {panelView === "activity" ? (
                <ul className="space-y-2">
                  {activity.map((item) => (
                    <li
                      key={item.id}
                      className="border-border bg-background flex flex-wrap items-center gap-2 rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground text-sm font-medium">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs">
                          {item.status === "attention"
                            ? "Ready for your review"
                            : item.status === "complete"
                              ? "Approved"
                              : "In progress · 62%"}
                        </p>
                      </div>
                      {item.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewed(true)}
                        >
                          Approve brief
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <label className="grid gap-2 text-xs">
                  Workspace notes
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Keep a note beside your work…"
                    className="border-border bg-background text-foreground focus-visible:outline-ring min-h-24 w-full resize-y rounded-md border p-2 text-sm focus-visible:outline-2"
                  />
                </label>
              )}
            </BottomBarContent>
          </BottomBar>
        )}
        {footer !== "none" &&
          footer !== "panel" &&
          footer !== "panel-shell" && (
            <SidebarShellFooter as="div" span={footer}>
              <span className="flex items-center gap-2">
                <span className="bg-success size-1.5 rounded-full" />
                <span>Workspace synced</span>
              </span>
              <div className="ms-auto flex flex-wrap items-center gap-2">
                <span role="status" className="text-xs">
                  {saved ? "Draft saved" : "Ready when you are"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSaved(true)}
                >
                  Save draft
                </Button>
              </div>
            </SidebarShellFooter>
          )}
      </SidebarShell>
    </div>
  );
}
