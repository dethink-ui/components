import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { useSidebarState } from "../sidebar";

export type SidebarActivityStatus =
  "running" | "attention" | "complete" | "queued";
export type SidebarActivityAction = { label: string } & (
  { href: string; onAction?: never } | { href?: never; onAction: () => void }
);
export interface SidebarActivityItem {
  id: string;
  title: string;
  status: SidebarActivityStatus;
  description?: string;
  /** Percentage from 0 to 100. Omit for indeterminate running work. */
  progress?: number;
  action?: SidebarActivityAction;
}
export type SidebarActivityCounts = Record<SidebarActivityStatus, number>;
export interface SidebarActivityProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  items: readonly SidebarActivityItem[];
  label?: string;
  emptyMessage?: ReactNode;
  openLabel?: string;
  statusLabels?: Partial<Record<SidebarActivityStatus, string>>;
  formatSummary?: (counts: SidebarActivityCounts) => string;
  /** Open consumer-owned details instead of expanding, including permanent rails. */
  onOpen?: () => void;
}

const labels: Record<SidebarActivityStatus, string> = {
  running: "Running",
  attention: "Needs attention",
  complete: "Complete",
  queued: "Queued",
};
const tones: Record<SidebarActivityStatus, string> = {
  running: "text-primary",
  attention: "text-warning",
  complete: "text-success",
  queued: "text-muted-foreground",
};

function ActivityIcon({ status }: { status?: SidebarActivityStatus }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      {status === "complete" ? (
        <path d="m4 10 4 4 8-8" />
      ) : status === "attention" ? (
        <>
          <path d="M10 3 2 17h16L10 3Z" />
          <path d="M10 8v4m0 2v.5" />
        </>
      ) : status === "queued" ? (
        <>
          <circle cx="10" cy="10" r="7" />
          <path d="M10 6v4l3 2" />
        </>
      ) : (
        <path d="M2 10h3l3-6 4 12 3-6h3" />
      )}
    </svg>
  );
}

export const SidebarActivity = forwardRef<HTMLDivElement, SidebarActivityProps>(
  (
    {
      items,
      label = "Activity",
      emptyMessage = "All caught up",
      openLabel = "Open activity",
      statusLabels,
      formatSummary,
      onOpen,
      className,
      ...props
    },
    ref,
  ) => {
    const { collapsed, variant, setCollapsed } = useSidebarState();
    const headingId = useId();
    const detailsRef = useRef<HTMLElement | null>(null);
    const pendingFocus = useRef(false);
    const counts: SidebarActivityCounts = {
      running: 0,
      attention: 0,
      complete: 0,
      queued: 0,
    };
    for (const item of items) counts[item.status]++;
    const resolvedLabels = {
      running: statusLabels?.running ?? labels.running,
      attention: statusLabels?.attention ?? labels.attention,
      complete: statusLabels?.complete ?? labels.complete,
      queued: statusLabels?.queued ?? labels.queued,
    };
    const summary =
      formatSummary?.(counts) ??
      (Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(
          ([status, count]) =>
            `${count} ${resolvedLabels[status as SidebarActivityStatus].toLowerCase()}`,
        )
        .join(", ") ||
        "No activity");
    const summaryStatus =
      counts.attention > 0
        ? "attention"
        : counts.running > 0
          ? "running"
          : counts.queued > 0
            ? "queued"
            : "complete";

    useEffect(() => {
      if (!collapsed && pendingFocus.current) {
        detailsRef.current?.focus();
        pendingFocus.current = false;
      }
    }, [collapsed]);

    const open = () => {
      if (onOpen) {
        onOpen();
        return;
      }
      pendingFocus.current = true;
      setCollapsed(false);
    };
    const compactContent = (
      <>
        <span className={tones[summaryStatus]}>
          <ActivityIcon status={summaryStatus} />
        </span>
        <span className="text-[0.625rem] leading-none font-semibold tabular-nums">
          {items.length}
        </span>
      </>
    );
    const compactClass = cn(
      "flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-md border border-border bg-background p-1",
      "text-foreground",
    );
    const actionClass =
      "rounded px-1 py-0.5 text-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring";

    return (
      <div
        {...props}
        ref={ref}
        data-slot="sidebar-activity"
        data-collapsed={collapsed ? "true" : "false"}
        className={cn(
          "min-w-0 p-[var(--dt-space-2)] data-[collapsed=true]:px-0",
          className,
        )}
      >
        <p role="status" aria-atomic="true" className="sr-only">
          {summary}
        </p>
        {collapsed ? (
          variant !== "rail" || onOpen ? (
            <button
              type="button"
              className={cn(
                compactClass,
                "hover:bg-muted focus-visible:outline-ring focus-visible:outline-2",
              )}
              aria-label={`${openLabel}: ${summary}`}
              onClick={open}
            >
              {compactContent}
            </button>
          ) : (
            <div
              className={compactClass}
              role="img"
              aria-label={`${label}: ${summary}`}
            >
              {compactContent}
            </div>
          )
        ) : (
          <section
            ref={detailsRef}
            tabIndex={-1}
            aria-labelledby={headingId}
            className="border-border bg-background focus-visible:ring-ring rounded-lg border p-[var(--dt-density-gap)] outline-none focus-visible:ring-2"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3
                id={headingId}
                className="text-muted-foreground text-xs font-medium"
              >
                {label}
              </h3>
              <span
                aria-hidden="true"
                className="text-muted-foreground text-xs tabular-nums"
              >
                {items.length}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="text-muted-foreground text-xs">{emptyMessage}</p>
            ) : (
              <ul className="m-0 grid list-none gap-4 p-0">
                {items.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <div className="flex items-start gap-2">
                      <span className={cn("mt-0.5", tones[item.status])}>
                        <ActivityIcon status={item.status} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground text-xs font-medium break-words">
                          {item.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {resolvedLabels[item.status]}
                        </p>
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-muted-foreground mt-1 text-xs break-words">
                        {item.description}
                      </p>
                    )}
                    {item.status === "running" && (
                      <progress
                        aria-label={`${item.title} progress`}
                        max={100}
                        value={
                          Number.isFinite(item.progress)
                            ? Math.min(100, Math.max(0, item.progress!))
                            : undefined
                        }
                        className="accent-primary bg-muted [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary mt-2 block h-1.5 w-full appearance-none overflow-hidden rounded-full"
                      />
                    )}
                    {item.action && (
                      <div className="mt-1.5 text-end">
                        {item.action.href !== undefined ? (
                          <a className={actionClass} href={item.action.href}>
                            {item.action.label}
                          </a>
                        ) : (
                          <button
                            className={actionClass}
                            type="button"
                            onClick={item.action.onAction}
                          >
                            {item.action.label}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    );
  },
);
SidebarActivity.displayName = "SidebarActivity";
