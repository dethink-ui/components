"use client";

import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  version as reactVersion,
  type ReactNode,
} from "react";
import type {
  GroupImperativeHandle,
  PanelImperativeHandle,
  Layout,
} from "react-resizable-panels";
import { cn } from "../../utils/cn";
const inertAttribute = (
  Number.parseInt(reactVersion, 10) < 19 ? "" : true
) as true;
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ResizablePanelHeader,
  ResizablePanelBody,
  ResizablePanelFooter,
} from "./resizable";
import {
  parseResizableLayout,
  serializeResizableLayout,
  type ResizableLayoutStorage,
} from "./resizable-layout";

export interface ResizableWorkspacePane {
  id: string;
  title: string;
  children: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  defaultSize?: string | number;
  minSize?: string | number;
  maxSize?: string | number;
  collapsible?: boolean;
}
export interface ResizableWorkspaceProps {
  /** Stable document-unique ID; also scopes pane IDs in saved layouts. */
  id: string;
  label: string;
  panes: readonly ResizableWorkspacePane[];
  orientation?: "horizontal" | "vertical";
  /** Opt into a stacked, non-resizing layout below this container width. */
  compactAt?: number;
  /** Persistence is disabled unless a key is supplied. */
  storageKey?: string;
  storage?: ResizableLayoutStorage;
  onLayoutCommit?: (layout: Layout) => void;
  className?: string;
}

const actionClass =
  "inline-flex min-h-8 items-center justify-center rounded-md border border-transparent px-2 text-xs font-medium text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40";

export function ResizableWorkspace({
  id,
  label,
  panes,
  orientation = "horizontal",
  compactAt,
  storageKey,
  storage,
  onLayoutCommit,
  className,
}: ResizableWorkspaceProps) {
  const root = useRef<HTMLDivElement>(null);
  const group = useRef<GroupImperativeHandle | null>(null);
  const handles = useRef(new Map<string, PanelImperativeHandle>());
  const baseline = useRef<Layout | undefined>(undefined);
  const normalLayout = useRef<Layout | undefined>(undefined);
  const ready = useRef(false);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const returnFocus = useRef<HTMLElement | null>(null);
  const previousFocus = useRef<string | null>(null);
  const restoreButton = useRef<HTMLButtonElement>(null);
  const helperId = useId();
  const ids = panes.map((pane) => `${id}-${pane.id}`);
  const signature = JSON.stringify(ids);
  const active = panes.some((pane) => pane.id === focused) ? focused : null;
  if (focused && !active) setFocused(null);
  const getStorage = () =>
    storage ??
    (typeof window !== "undefined" ? window.localStorage : undefined);
  const persist = (layout: Layout) => {
    if (storageKey) {
      try {
        getStorage()?.setItem(storageKey, serializeResizableLayout(layout));
      } catch {
        /* Private/blocked storage does not disable resizing. */
      }
    }
  };

  useEffect(() => {
    const node = root.current;
    if (!node || compactAt === undefined) return;
    const observer = new ResizeObserver(([entry]) =>
      setCompact(entry.contentRect.width < compactAt),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [compactAt]);

  useEffect(() => {
    ready.current = false;
    const frame = requestAnimationFrame(() => {
      const initial = group.current?.getLayout();
      baseline.current = initial;
      let saved: Layout | undefined;
      try {
        saved = storageKey
          ? parseResizableLayout(
              (storage ?? window.localStorage).getItem(storageKey),
              JSON.parse(signature) as string[],
            )
          : undefined;
      } catch {
        /* Storage is best effort. */
      }
      normalLayout.current = saved ?? initial;
      if (saved) group.current?.setLayout(saved);
      ready.current = true;
      setInitializedFor(signature);
    });
    return () => {
      cancelAnimationFrame(frame);
      ready.current = false;
    };
  }, [signature, storageKey, storage]);

  useEffect(() => {
    if (!compact && ready.current && normalLayout.current)
      group.current?.setLayout(normalLayout.current);
  }, [compact]);

  useEffect(() => {
    if (previousFocus.current && !active && !returnFocus.current?.isConnected) {
      restoreButton.current?.focus();
    }
    previousFocus.current = active;
  }, [active]);

  function restore() {
    setFocused(null);
    requestAnimationFrame(() => {
      if (returnFocus.current?.isConnected) returnFocus.current.focus();
      else restoreButton.current?.focus();
    });
  }

  function focusPane(paneId: string, trigger: HTMLElement) {
    returnFocus.current = trigger;
    setFocused(paneId);
    // The workspace action remains available even when the source pane is hidden.
    requestAnimationFrame(() => restoreButton.current?.focus());
  }

  function togglePane(paneId: string) {
    const handle = handles.current.get(paneId);
    if (!handle) return;
    if (handle.isCollapsed()) handle.expand();
    else handle.collapse();
  }

  if (
    panes.length < 2 ||
    new Set(panes.map((pane) => pane.id)).size !== panes.length ||
    panes.some((pane) => !pane.id || !pane.title)
  ) {
    throw new Error(
      "ResizableWorkspace requires at least two panes with unique non-empty IDs and titles.",
    );
  }

  return (
    <div
      ref={root}
      data-slot="resizable-workspace"
      data-ready={initializedFor === signature || undefined}
      data-compact={compact || undefined}
      data-focused={active || undefined}
      className={cn(
        "border-border bg-background text-foreground flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border",
        className,
      )}
    >
      <div
        role="group"
        aria-label={`${label} layout controls`}
        className="border-border bg-muted/30 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2"
      >
        <span className="text-xs font-semibold">{label}</span>
        <div className="flex flex-wrap items-center gap-1">
          {panes
            .filter((pane) => pane.collapsible)
            .map((pane) => (
              <button
                key={pane.id}
                type="button"
                className={actionClass}
                aria-controls={`${id}-${pane.id}`}
                aria-expanded={!collapsed.has(pane.id) || compact}
                disabled={!!active || compact || initializedFor !== signature}
                onClick={() => togglePane(pane.id)}
              >
                {collapsed.has(pane.id) ? "Show" : "Hide"} {pane.title}
              </button>
            ))}
          <button
            ref={restoreButton}
            type="button"
            disabled={initializedFor !== signature}
            className={actionClass}
            onClick={() => {
              if (active) {
                restore();
                return;
              }
              if (baseline.current) {
                normalLayout.current = baseline.current;
                if (!compact) group.current?.setLayout(baseline.current);
                persist(baseline.current);
                onLayoutCommit?.(baseline.current);
              }
            }}
          >
            {active ? "Restore layout" : "Reset layout"}
          </button>
        </div>
      </div>
      <p id={helperId} className="sr-only">
        Use arrow keys on a divider to resize. Home and End reach size limits.
        Enter toggles a collapsible pane. Use the layout controls to reopen
        hidden panes.
      </p>
      <div className={cn("min-h-0 flex-1", compact && "flex-none")}>
        <ResizablePanelGroup
          id={`${id}-group`}
          groupRef={group}
          orientation={orientation}
          disabled={!!active || compact}
          className={cn(
            "relative",
            compact &&
              "!h-auto !flex-col [&>[data-panel]]:!max-h-none [&>[data-panel]]:!w-full [&>[data-panel]]:!flex-none",
            compact &&
              active &&
              "!h-[var(--dt-resizable-compact-height,22rem)]",
          )}
          onLayoutChanged={(layout) => {
            if (!ready.current || active || compact) return;
            normalLayout.current = layout;
            persist(layout);
            onLayoutCommit?.(layout);
          }}
        >
          {panes.map((pane, index) => (
            <Fragment key={pane.id}>
              {index > 0 && (
                <ResizableHandle
                  aria-label={panes[index - 1].title}
                  aria-describedby={helperId}
                  className={cn((active || compact) && "invisible")}
                />
              )}
              <ResizablePanel
                id={`${id}-${pane.id}`}
                defaultSize={pane.defaultSize ?? `${100 / panes.length}%`}
                minSize={pane.minSize ?? "10%"}
                maxSize={pane.maxSize}
                collapsible={pane.collapsible && !compact}
                panelRef={(handle) => {
                  if (handle) handles.current.set(pane.id, handle);
                  else handles.current.delete(pane.id);
                }}
                onResize={() => {
                  const isCollapsed =
                    handles.current.get(pane.id)?.isCollapsed() ?? false;
                  setCollapsed((previous) => {
                    if (previous.has(pane.id) === isCollapsed) return previous;
                    const next = new Set(previous);
                    if (isCollapsed) next.add(pane.id);
                    else next.delete(pane.id);
                    return next;
                  });
                }}
                className={cn(
                  "!overflow-hidden",
                  compact &&
                    "border-border !h-[var(--dt-resizable-compact-height,22rem)] !max-h-none border-b",
                  active === pane.id &&
                    "absolute inset-0 z-20 !max-h-none !max-w-none",
                  active && active !== pane.id && "invisible",
                )}
              >
                <div
                  {...{
                    inert:
                      active && active !== pane.id ? inertAttribute : undefined,
                  }}
                  aria-hidden={active && active !== pane.id ? true : undefined}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <ResizablePanelHeader>
                    <div className="min-w-0">
                      <h3 className="truncate">{pane.title}</h3>
                      {pane.description && (
                        <p className="text-muted-foreground mt-0.5 truncate text-xs font-normal">
                          {pane.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {pane.actions}
                      <button
                        type="button"
                        className={actionClass}
                        aria-label={
                          active === pane.id
                            ? `Restore ${pane.title}`
                            : `Focus ${pane.title}`
                        }
                        onClick={(event) =>
                          active
                            ? restore()
                            : focusPane(pane.id, event.currentTarget)
                        }
                      >
                        {active === pane.id ? "Restore" : "Focus"}
                      </button>
                    </div>
                  </ResizablePanelHeader>
                  <ResizablePanelBody>{pane.children}</ResizablePanelBody>
                  {pane.footer && (
                    <ResizablePanelFooter>{pane.footer}</ResizablePanelFooter>
                  )}
                </div>
              </ResizablePanel>
            </Fragment>
          ))}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
