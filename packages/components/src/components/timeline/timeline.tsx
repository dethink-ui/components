import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type AnimationEvent,
  type CSSProperties,
  type FocusEvent,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  type WheelEvent,
} from "react";
import {
  Check,
  Circle,
  CircleDot,
  Clock3,
  TriangleAlert,
  X,
} from "lucide-react";
import { useHydrated } from "../../utils/use-hydrated";
import { cn } from "../../utils/cn";
import {
  clampTimelineRevealCount,
  fitTimelineTransform,
  getDefaultTimelineTransform,
  getEdgeEnabledTimelineItemId,
  getNextEnabledTimelineItemId,
  getTimelineContentSize,
  getTimelineRevealBatchDuration,
  isTimelineRevealActive,
  normalizeTimelineItems,
  normalizeTimelineRevealOptions,
  normalizeViewportOptions,
  resolveTimelinePresentation,
  timelineGeometry,
  zoomTimelineTransform,
  type NormalizedTimelineItem,
  type NormalizedTimelineRevealOptions,
  type TimelineItemData,
  type TimelineItemPayload,
  type TimelineLayout,
  type TimelineMode,
  type TimelineOrder,
  type TimelineOrientation,
  type TimelinePoint,
  type TimelinePresentation,
  type TimelineRevealMode,
  type TimelineRevealOptions,
  type TimelineScale,
  type TimelineControlsVisibility,
  type TimelineStatus,
  type TimelineTransform,
  type TimelineVariant,
  type TimelineGroup,
  type TimelineViewportChrome,
  type TimelineViewportOptions,
} from "./timeline-utils";

export type {
  NormalizedTimelineItem,
  NormalizedTimelineRevealOptions,
  TimelineImage,
  TimelineItemBaseData,
  TimelineItemData,
  TimelineItemDefaultContent,
  TimelineItemPayload,
  TimelineLayout,
  TimelineMode,
  TimelineOrder,
  TimelineOrientation,
  TimelinePoint,
  TimelinePresentation,
  TimelineRevealMode,
  TimelineRevealOptions,
  TimelineRevealTrigger,
  TimelineScale,
  TimelineControlsVisibility,
  TimelineStatus,
  TimelineTransform,
  TimelineViewportChrome,
  TimelineViewportOptions,
  TimelineWheelZoom,
  TimelineVariant,
  TimelineGroup,
} from "./timeline-utils";

export type TimelineItemRenderer<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> = (item: TimelineItemData<TPayload>) => ReactNode;

export interface TimelineProps<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  items: TimelineItemData<TPayload>[];
  mode?: TimelineMode;
  orientation?: TimelineOrientation;
  layout?: TimelineLayout;
  scale?: TimelineScale;
  order?: TimelineOrder;
  interactive?: boolean;
  presentation?: TimelinePresentation;
  reveal?: TimelineRevealMode;
  revealOptions?: TimelineRevealOptions;
  revealCount?: number;
  onItemReveal?: (id: string, index: number) => void;
  onRevealComplete?: () => void;
  viewport?: TimelineViewportOptions;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectedIdChange?: (id: string | null) => void;
  renderItem?: TimelineItemRenderer<TPayload>;
  variant?: TimelineVariant;
  renderDetails?: TimelineItemRenderer<TPayload>;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedIdsChange?: (ids: string[]) => void;
  getGroup?: (item: TimelineItemData<TPayload>) => TimelineGroup | null;
}

export interface TimelineItemProps<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> extends Omit<HTMLAttributes<HTMLLIElement>, "onSelect"> {
  item: NormalizedTimelineItem<TPayload>;
  mode?: TimelineMode;
  orientation?: TimelineOrientation;
  layout?: TimelineLayout;
  presentation?: TimelinePresentation;
  interactive?: boolean;
  selected?: boolean;
  renderItem?: TimelineItemRenderer<TPayload>;
  onSelect?: (id: string) => void;
  variant?: TimelineVariant;
  details?: ReactNode;
  expanded?: boolean;
  onExpandedChange?: () => void;
}

export interface TimelineViewportProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  children: ReactNode;
  contentSize: { width: number; height: number };
  interactive?: boolean;
  orientation?: TimelineOrientation;
  layout?: TimelineLayout;
  presentation?: TimelinePresentation;
  viewport?: TimelineViewportOptions;
  selectedPoint?: TimelinePoint;
  onNavigate?: (id: string | null) => void;
  getPreviousId?: () => string | null;
  getNextId?: () => string | null;
  getFirstId?: () => string | null;
  getLastId?: () => string | null;
}

export interface TimelineControlsProps extends HTMLAttributes<HTMLDivElement> {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  visibility?: TimelineControlsVisibility;
  visible?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}

const timelineRootClasses = "w-full text-foreground";

const timelineViewportClasses =
  "relative min-h-[22rem] overflow-hidden rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[interactive=true]:cursor-grab data-[dragging=true]:cursor-grabbing data-[layout=alternating]:min-h-[36rem] data-[orientation=vertical]:min-h-[30rem] data-[orientation=horizontal]:touch-pan-y data-[orientation=vertical]:touch-pan-x";

const timelineViewportContentClasses =
  "absolute left-0 top-0 origin-top-left motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none data-[dragging=true]:transition-none";

const timelineListClasses =
  "absolute left-0 top-0 m-[var(--dt-space-0)] list-none p-[var(--dt-space-0)]";

const timelineStoryViewportClasses =
  "relative w-full min-w-0 overflow-hidden rounded-md bg-transparent [container-type:inline-size] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const timelineStoryListClasses =
  "relative m-[var(--dt-space-0)] list-none p-[var(--dt-space-0)] before:absolute before:bottom-[var(--dt-space-2)] before:left-7 before:top-[var(--dt-space-2)] before:w-px before:rounded-full before:bg-timeline-rail before:content-[''] forced-colors:before:bg-[CanvasText]";

const timelineStoryListLayoutClasses: Record<
  "default" | "alternating",
  string
> = {
  default: "sm:before:left-9",
  alternating: "sm:before:left-1/2 sm:before:-translate-x-1/2",
};

const timelineFlowListClasses =
  "relative m-[var(--dt-space-0)] list-none p-[var(--dt-space-0)] before:absolute before:bottom-[var(--dt-space-2)] before:left-6 before:top-[var(--dt-space-2)] before:w-px before:rounded-full before:bg-timeline-rail before:content-[''] forced-colors:before:bg-[CanvasText]";

const timelineFlowListLayoutClasses: Record<"default" | "alternating", string> =
  {
    default: "",
    alternating: "sm:before:left-1/2 sm:before:-translate-x-1/2",
  };

const timelineRailClasses =
  "absolute rounded-full bg-timeline-rail forced-colors:bg-[CanvasText]";

const timelineItemClasses = "absolute left-0 top-0";

const timelineStoryItemClasses =
  "relative grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] pb-20 last:pb-0 sm:pb-16";

const timelineStoryItemLayoutClasses: Record<
  "default" | "alternating",
  string
> = {
  default: "sm:grid-cols-[4.5rem_minmax(0,29rem)]",
  alternating: "sm:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)]",
};

const timelineFlowItemClasses =
  "relative grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] gap-x-[var(--dt-space-3)] pb-8 last:pb-0";

const timelineFlowItemLayoutClasses: Record<"default" | "alternating", string> =
  {
    default: "",
    alternating:
      "sm:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] sm:gap-x-[var(--dt-space-4)]",
  };

const timelineCardBaseClasses =
  "text-left text-foreground motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-200 data-[disabled=true]:opacity-55";

const timelineViewportCardClasses =
  "absolute w-[var(--timeline-card-width,20rem)] rounded-md border border-timeline-border bg-background p-[var(--dt-space-4)] shadow-sm data-[interactive=true]:hover:shadow-md data-[selected=true]:border-ring data-[selected=true]:bg-muted/40 data-[selected=true]:shadow-md data-[selected=true]:ring-1 data-[selected=true]:ring-ring/35";

const timelineStoryCardClasses =
  "relative col-start-2 row-start-1 min-w-0 max-w-full border-0 bg-transparent p-[var(--dt-space-0)] shadow-none";

const timelineStoryCardAlternatingClasses: Record<"start" | "end", string> = {
  start: "sm:col-start-1 sm:justify-self-end sm:text-right",
  end: "sm:col-start-3 sm:justify-self-start sm:text-left",
};

const timelineFlowCardClasses =
  "relative col-start-2 row-start-1 min-w-0 max-w-full rounded-md border border-timeline-border bg-background p-[var(--dt-space-4)] shadow-sm data-[interactive=true]:hover:shadow-md data-[selected=true]:border-ring data-[selected=true]:bg-muted/40 data-[selected=true]:shadow-md data-[selected=true]:ring-1 data-[selected=true]:ring-ring/35";

const timelineFlowCardAlternatingClasses: Record<"start" | "end", string> = {
  start: "sm:col-start-1 sm:justify-self-end sm:text-right",
  end: "sm:col-start-3 sm:justify-self-start sm:text-left",
};

const timelineMarkerBaseClasses =
  "z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-medium shadow-sm motion-safe:transition-[border-color,background-color,box-shadow,transform] motion-safe:duration-200";

const timelineViewportMarkerClasses =
  "absolute -translate-x-1/2 -translate-y-1/2";

const timelineStoryMarkerClasses =
  "relative col-start-1 row-start-1 mt-[var(--dt-space-1)] size-7 justify-self-center border-background bg-background text-primary ring-1 ring-border";

const timelineStoryMarkerAlternatingClasses = "sm:col-start-2";

const timelineFlowMarkerClasses =
  "relative col-start-1 row-start-1 mt-[var(--dt-space-1)] justify-self-center";

const timelineFlowMarkerAlternatingClasses = "sm:col-start-2";

const timelineMarkerStatusClasses: Record<TimelineStatus, string> = {
  neutral: "border-timeline-border bg-background text-muted-foreground",
  complete: "border-success bg-success text-success-foreground",
  current:
    "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
  upcoming: "border-timeline-border bg-muted text-muted-foreground",
  warning: "border-warning bg-warning text-warning-foreground",
  error: "border-destructive bg-destructive text-destructive-foreground",
};

const timelineStoryMarkerStatusClasses: Record<TimelineStatus, string> = {
  neutral: "text-muted-foreground",
  complete: "text-primary",
  current: "text-primary ring-primary/30",
  upcoming: "text-muted-foreground",
  warning: "text-warning",
  error: "text-destructive",
};

const timelineStatusLabel: Record<TimelineStatus, string> = {
  neutral: "Neutral",
  complete: "Complete",
  current: "Current",
  upcoming: "Upcoming",
  warning: "Warning",
  error: "Error",
};

const timelineControlButtonClasses =
  "inline-flex size-8 items-center justify-center rounded-md border border-timeline-border bg-background text-foreground shadow-sm motion-safe:transition-[background-color,border-color,box-shadow,transform] motion-safe:duration-150 hover:border-ring/50 hover:bg-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const timelineViewportChromeClasses: Record<TimelineViewportChrome, string> = {
  none: "",
  subtle: "bg-muted/20",
  panel: "border border-timeline-border bg-muted/20 shadow-sm",
};

const timelineControlsVisibilityClasses: Record<
  TimelineControlsVisibility,
  string
> = {
  always: "opacity-100",
  hover:
    "data-[visible=false]:pointer-events-none data-[visible=false]:translate-y-1 data-[visible=false]:opacity-0 data-[visible=true]:pointer-events-auto data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100",
};

type TimelineContentStyle = CSSProperties & {
  "--timeline-transform"?: string;
};

function getTimelineDateLabel(item: NormalizedTimelineItem) {
  if (item.dateLabel !== undefined) {
    return item.dateLabel;
  }

  if (item.datetime instanceof Date && !Number.isNaN(item.datetime.getTime())) {
    return item.datetime.toLocaleString();
  }

  if (typeof item.datetime === "string") {
    return item.datetime;
  }

  return null;
}

const timelineStatusIcons = {
  neutral: Circle,
  complete: Check,
  current: CircleDot,
  upcoming: Clock3,
  warning: TriangleAlert,
  error: X,
};

// Only primary selection controls participate; embedded inputs and disclosures
// retain their own keyboard behavior. DOM order also handles contiguous groups.
function navigateTimeline(
  event: KeyboardEvent<HTMLDivElement>,
  onNavigate?: (id: string | null) => void,
) {
  const target = event.target as HTMLElement;
  if (
    target !== event.currentTarget &&
    target.dataset.slot !== "timeline-card-action"
  )
    return false;
  const keys = [
    "ArrowRight",
    "ArrowLeft",
    "ArrowDown",
    "ArrowUp",
    "Home",
    "End",
  ];
  if (!keys.includes(event.key)) return false;
  const buttons = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>(
      'button[data-slot="timeline-card-action"]:not(:disabled)',
    ),
  );
  if (!buttons.length) return false;
  const active = buttons.indexOf(target as HTMLButtonElement);
  const selected = buttons.findIndex(
    (button) => button.getAttribute("aria-pressed") === "true",
  );
  const index = active >= 0 ? active : selected;
  const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
  let direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
  if (rtl && (event.key === "ArrowLeft" || event.key === "ArrowRight"))
    direction *= -1;
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? buttons.length - 1
        : index < 0
          ? direction > 0
            ? 0
            : buttons.length - 1
          : Math.max(0, Math.min(buttons.length - 1, index + direction));
  event.preventDefault();
  const button = buttons[next];
  button.focus({ preventScroll: true });
  if (event.currentTarget.dataset.presentation === "flow") {
    const feed = button.closest<HTMLElement>(
      '[data-slot="timeline-feed-viewport"]',
    );
    if (feed) {
      const view = feed.getBoundingClientRect();
      const rect = button.getBoundingClientRect();
      if (rect.top < view.top) feed.scrollTop += rect.top - view.top;
      else if (rect.bottom > view.bottom)
        feed.scrollTop += rect.bottom - view.bottom;
    } else
      button.scrollIntoView?.({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
  }
  onNavigate?.(button.dataset.timelineId ?? null);
  return true;
}

function getCardPositionClasses({
  index,
  orientation,
  layout,
}: {
  index: number;
  orientation: TimelineOrientation;
  layout: TimelineLayout;
}) {
  if (layout === "story") {
    return "";
  }

  const alternatingBefore = index % 2 === 0;

  if (orientation === "horizontal") {
    if (layout === "alternating" && alternatingBefore) {
      return "bottom-16 left-1/2 -translate-x-1/2";
    }

    return "left-1/2 top-14 -translate-x-1/2";
  }

  if (layout === "alternating" && alternatingBefore) {
    return "right-16 top-1/2 -translate-y-1/2";
  }

  return "left-14 top-1/2 -translate-y-1/2";
}

function renderItemDate(
  item: NormalizedTimelineItem,
  layout: TimelineLayout = "rail",
) {
  const label = getTimelineDateLabel(item);

  if (!label) {
    return null;
  }

  const className =
    layout === "story"
      ? "block font-mono text-xl font-semibold leading-none tracking-[0.08em] text-primary"
      : "text-xs font-medium text-muted-foreground";

  if (item.datetimeAttribute) {
    return (
      <time dateTime={item.datetimeAttribute} className={className}>
        {label}
      </time>
    );
  }

  return <span className={className}>{label}</span>;
}

function renderItemDescription(
  description: ReactNode,
  layout: TimelineLayout = "rail",
) {
  if (description === undefined || description === null) {
    return null;
  }

  const className =
    layout === "story"
      ? "text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9"
      : "text-sm leading-6 text-muted-foreground";

  if (typeof description === "string" || typeof description === "number") {
    return <p className={className}>{description}</p>;
  }

  return <div className={className}>{description}</div>;
}

function renderDefaultItemContent(
  item: NormalizedTimelineItem,
  titleId: string,
  layout: TimelineLayout,
) {
  const itemTitle = item.title ?? item.id;

  if (layout === "story") {
    return (
      <div className="space-y-[var(--dt-space-4)]">
        {renderItemDate(item, layout)}
        <div className="space-y-[var(--dt-space-4)]">
          <h3
            id={titleId}
            className="font-heading text-foreground text-2xl leading-tight font-semibold tracking-tight sm:text-3xl"
          >
            {itemTitle}
          </h3>
          {item.image ? (
            <img
              src={item.image.src}
              alt={item.image.alt}
              width={item.image.width}
              height={item.image.height}
              loading="lazy"
              className="border-timeline-border aspect-video w-full rounded-sm border object-cover"
            />
          ) : null}
          {renderItemDescription(item.description, layout)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--dt-space-3)]">
      <div className="space-y-[var(--dt-space-1)]">
        {renderItemDate(item, layout)}
        <h3
          id={titleId}
          className="text-foreground text-sm leading-6 font-semibold"
        >
          {itemTitle}
        </h3>
      </div>
      {item.image ? (
        <img
          src={item.image.src}
          alt={item.image.alt}
          width={item.image.width}
          height={item.image.height}
          loading="lazy"
          className="border-timeline-border aspect-video w-full rounded-sm border object-cover"
        />
      ) : null}
      {renderItemDescription(item.description, layout)}
    </div>
  );
}

function ZoomOutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function ZoomInIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function FitViewIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12h6" strokeLinecap="round" />
    </svg>
  );
}

function ResetViewIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M4 7v5h5M20 17v-5h-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12a5 5 0 0 1 8.5-3.5L20 12M17 12a5 5 0 0 1-8.5 3.5L4 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TimelineRail({
  items,
  orientation,
}: {
  items: NormalizedTimelineItem[];
  orientation: TimelineOrientation;
}) {
  if (items.length === 0) {
    return null;
  }

  const minX = Math.min(...items.map((item) => item.point.x));
  const maxX = Math.max(...items.map((item) => item.point.x));
  const minY = Math.min(...items.map((item) => item.point.y));
  const maxY = Math.max(...items.map((item) => item.point.y));

  if (orientation === "horizontal") {
    return (
      <span
        aria-hidden="true"
        data-slot="timeline-rail"
        className={cn(timelineRailClasses, "h-px")}
        style={{
          left: minX,
          top: items[0]?.point.y ?? timelineGeometry.horizontalRailY,
          width: Math.max(0, maxX - minX),
        }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      data-slot="timeline-rail"
      className={cn(timelineRailClasses, "w-px")}
      style={{
        left: items[0]?.point.x ?? timelineGeometry.verticalRailX,
        top: minY,
        height: Math.max(0, maxY - minY),
      }}
    />
  );
}

function TimelineItemInner<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>(
  {
    className,
    item,
    mode,
    orientation = "horizontal",
    layout = "rail",
    presentation = "canvas",
    interactive = true,
    selected = false,
    renderItem,
    onSelect,
    variant = "activity",
    details,
    expanded = false,
    onExpandedChange,
    style,
    ...props
  }: TimelineItemProps<TPayload>,
  ref: ForwardedRef<HTMLLIElement>,
) {
  const cardId = useId();
  const titleId = `${cardId}-title`;
  const isInteractive = interactive && !item.disabled;
  const handleSelect = () => {
    if (isInteractive) {
      onSelect?.(item.id);
    }
  };
  const detailsRef = useRef<HTMLDivElement>(null);
  const disclosureRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!expanded && detailsRef.current?.contains(document.activeElement))
      disclosureRef.current?.focus();
  }, [expanded]);
  // A "flow" presentation renders in normal document flow (marker column + rail
  // + card). "Story" is the editorial typography variant of that flow. Compact
  // flow reuses the flow structure with the default compact card styling.
  const isFlow = presentation === "flow";
  const isStory = mode === "story" || layout === "story";
  const isAlternatingFlow = isFlow && layout === "alternating";
  const alternatingSide = item.index % 2 === 0 ? "end" : "start";
  const contentLayout = isStory ? "story" : layout;
  const cardContent = renderItem
    ? renderItem(item)
    : renderDefaultItemContent(item, titleId, contentLayout);
  const StatusIcon = timelineStatusIcons[item.status];
  const hasDetails =
    isFlow && details !== undefined && details !== null && details !== false;
  const itemStyle = isFlow
    ? style
    : { left: item.point.x, top: item.point.y, ...style };

  return (
    <li
      {...props}
      ref={ref}
      data-slot="timeline-item"
      data-timeline-id={item.id}
      data-status={item.status}
      data-selected={selected ? "true" : undefined}
      data-disabled={item.disabled ? "true" : undefined}
      className={cn(
        isFlow
          ? isStory
            ? cn(
                timelineStoryItemClasses,
                timelineStoryItemLayoutClasses[
                  isAlternatingFlow ? "alternating" : "default"
                ],
              )
            : cn(
                timelineFlowItemClasses,
                timelineFlowItemLayoutClasses[
                  isAlternatingFlow ? "alternating" : "default"
                ],
              )
          : timelineItemClasses,
        className,
      )}
      style={itemStyle}
    >
      <span
        aria-hidden="true"
        data-slot="timeline-marker"
        data-selected={selected ? "true" : undefined}
        className={cn(
          timelineMarkerBaseClasses,
          isFlow
            ? isStory
              ? timelineStoryMarkerClasses
              : timelineFlowMarkerClasses
            : timelineViewportMarkerClasses,
          isAlternatingFlow &&
            (isStory
              ? timelineStoryMarkerAlternatingClasses
              : timelineFlowMarkerAlternatingClasses),
          isStory
            ? timelineStoryMarkerStatusClasses[item.status]
            : timelineMarkerStatusClasses[item.status],
        )}
      >
        {item.marker ?? (
          <StatusIcon
            className={isStory ? "size-3.5" : "size-4"}
            strokeWidth={2}
          />
        )}
      </span>
      <article
        aria-current={item.status === "current" ? "step" : undefined}
        aria-labelledby={renderItem ? undefined : titleId}
        data-slot="timeline-card"
        data-status={item.status}
        data-selected={selected ? "true" : undefined}
        data-disabled={item.disabled ? "true" : undefined}
        data-interactive={isInteractive ? "true" : undefined}
        className={cn(
          timelineCardBaseClasses,
          isFlow
            ? isStory
              ? timelineStoryCardClasses
              : timelineFlowCardClasses
            : timelineViewportCardClasses,
          isFlow &&
            !isStory &&
            variant === "activity" &&
            "border-timeline-border data-[selected=true]:bg-muted/40 rounded-none border-0 border-b bg-transparent px-0 pt-0 pb-[var(--dt-density-gap)] shadow-none hover:shadow-none data-[selected=true]:rounded-md data-[selected=true]:px-3 data-[selected=true]:shadow-none",
          isAlternatingFlow &&
            (isStory
              ? timelineStoryCardAlternatingClasses
              : timelineFlowCardAlternatingClasses)[alternatingSide],
          !isFlow &&
            getCardPositionClasses({ index: item.index, orientation, layout }),
        )}
      >
        <div
          className={cn(
            "mb-2 flex items-center justify-between gap-3 text-xs",
            isStory && !isInteractive && "sr-only",
          )}
        >
          <span className="text-muted-foreground">
            Status: {timelineStatusLabel[item.status]}
          </span>
          {isInteractive ? (
            <button
              type="button"
              data-slot="timeline-card-action"
              data-timeline-id={item.id}
              aria-label={
                renderItem
                  ? typeof item.title === "string"
                    ? item.title
                    : item.id
                  : undefined
              }
              aria-labelledby={renderItem ? undefined : titleId}
              aria-current={item.status === "current" ? "step" : undefined}
              aria-pressed={selected}
              className="text-primary hover:bg-muted focus-visible:ring-ring shrink-0 rounded-sm px-2 py-1 focus-visible:ring-2 focus-visible:outline-none"
              onClick={handleSelect}
            >
              {selected ? "Selected" : "Select"}
            </button>
          ) : null}
        </div>
        <div
          data-slot="timeline-card-content"
          aria-disabled={item.disabled || undefined}
        >
          {cardContent}
        </div>
        {hasDetails ? (
          <>
            <button
              ref={disclosureRef}
              type="button"
              data-slot="timeline-disclosure"
              aria-expanded={expanded}
              aria-controls={`${cardId}-details`}
              aria-label={`${expanded ? "Hide" : "Show"} details for ${typeof item.title === "string" ? item.title : item.id}`}
              disabled={item.disabled}
              onClick={onExpandedChange}
              className="text-primary focus-visible:ring-ring mt-3 inline-flex items-center gap-2 rounded-sm py-1 text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
            >
              {expanded ? "Hide details" : "Show details"}
              <span aria-hidden="true">{expanded ? "−" : "+"}</span>
            </button>
            <div
              id={`${cardId}-details`}
              ref={detailsRef}
              data-slot="timeline-details"
              data-expanded={expanded ? "true" : "false"}
              aria-hidden={!expanded}
              className="grid grid-rows-[0fr] data-[expanded=false]:invisible data-[expanded=false]:opacity-0 data-[expanded=true]:grid-rows-[1fr] motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-[var(--dt-motion-standard)]"
            >
              <div className="min-h-0 overflow-hidden">
                <div className="text-muted-foreground pt-3 text-sm">
                  {details}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </article>
    </li>
  );
}

export const TimelineItem = forwardRef(TimelineItemInner) as (<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>(
  props: TimelineItemProps<TPayload> & RefAttributes<HTMLLIElement>,
) => ReactElement | null) & { displayName?: string };

TimelineItem.displayName = "TimelineItem";

export function TimelineControls({
  className,
  zoom,
  minZoom,
  maxZoom,
  visibility = "hover",
  visible = false,
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
  ...props
}: TimelineControlsProps) {
  return (
    <div
      {...props}
      data-slot="timeline-controls"
      data-visibility={visibility}
      data-visible={visibility === "always" || visible ? "true" : "false"}
      className={cn(
        "border-timeline-border bg-background/95 absolute top-[var(--dt-space-3)] right-[var(--dt-space-3)] z-20 flex items-center gap-[var(--dt-space-1)] rounded-md border p-[var(--dt-space-1)] shadow-md backdrop-blur motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none",
        timelineControlsVisibilityClasses[visibility],
        className,
      )}
    >
      <button
        type="button"
        aria-label="Zoom out"
        title="Zoom out"
        className={timelineControlButtonClasses}
        disabled={zoom <= minZoom}
        onClick={onZoomOut}
      >
        <ZoomOutIcon />
      </button>
      <button
        type="button"
        aria-label="Zoom in"
        title="Zoom in"
        className={timelineControlButtonClasses}
        disabled={zoom >= maxZoom}
        onClick={onZoomIn}
      >
        <ZoomInIcon />
      </button>
      <button
        type="button"
        aria-label="Fit timeline"
        title="Fit timeline"
        className={timelineControlButtonClasses}
        onClick={onFit}
      >
        <FitViewIcon />
      </button>
      <button
        type="button"
        aria-label="Reset timeline view"
        title="Reset timeline view"
        className={timelineControlButtonClasses}
        onClick={onReset}
      >
        <ResetViewIcon />
      </button>
    </div>
  );
}

export const TimelineViewport = forwardRef<
  HTMLDivElement,
  TimelineViewportProps
>(
  (
    {
      children,
      className,
      contentSize,
      interactive = true,
      orientation = "horizontal",
      layout = "rail",
      presentation = "canvas",
      viewport,
      selectedPoint,
      onNavigate,
      getPreviousId: _getPreviousId,
      getNextId: _getNextId,
      getFirstId: _getFirstId,
      getLastId: _getLastId,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onWheel,
      ...props
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const options = useMemo(
      () => normalizeViewportOptions(viewport),
      [viewport],
    );
    const [transform, setTransform] = useState<TimelineTransform>(() =>
      getDefaultTimelineTransform(viewport),
    );
    const [dragging, setDragging] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(false);
    const suppressClickRef = useRef(false);
    const initializedRef = useRef(false);
    const dragRef = useRef<{
      pointerId: number;
      startX: number;
      startY: number;
      transform: TimelineTransform;
      moved: boolean;
    } | null>(null);
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        viewportRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );
    const getViewportSize = useCallback(() => {
      const rect = viewportRef.current?.getBoundingClientRect();

      return {
        width: rect?.width ?? 0,
        height: rect?.height ?? 0,
      };
    }, []);
    const zoomBy = useCallback(
      (delta: number, origin?: TimelinePoint) => {
        setTransform((current) =>
          zoomTimelineTransform({
            transform: current,
            delta,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
            origin,
          }),
        );
      },
      [options.maxZoom, options.minZoom],
    );
    const revealCard = useCallback(
      (card?: HTMLElement | null, initial = false) => {
        const node = viewportRef.current;
        const target =
          card ??
          node?.querySelector<HTMLElement>(
            '[data-slot="timeline-card"][data-selected="true"]',
          ) ??
          node?.querySelector<HTMLElement>('[data-slot="timeline-card"]');
        if (!node || !target) return;
        const view = node.getBoundingClientRect();
        const rect = target.getBoundingClientRect();
        if (!view.width || !rect.width) return;
        const content = contentRef.current;
        if (!content) return;
        const origin = content.getBoundingClientRect();
        const matrix = new DOMMatrixReadOnly(
          getComputedStyle(content).transform,
        );
        const zoom = matrix.a || 1;
        const local = {
          left: (rect.left - origin.left) / zoom,
          top: (rect.top - origin.top) / zoom,
          width: rect.width / zoom,
          height: rect.height / zoom,
        };
        setTransform((current) => {
          const left = current.x + local.left * current.zoom;
          const top = current.y + local.top * current.zoom;
          const right = left + local.width * current.zoom;
          const bottom = top + local.height * current.zoom;
          const dx =
            initial || left < 20
              ? 20 - left
              : right > view.width - 20
                ? view.width - 20 - right
                : 0;
          const dy =
            initial || top < 72
              ? 72 - top
              : bottom > view.height - 20
                ? view.height - 20 - bottom
                : 0;
          return dx || dy
            ? { ...current, x: current.x + dx, y: current.y + dy }
            : current;
        });
      },
      [],
    );
    const reset = useCallback(() => {
      setTransform(getDefaultTimelineTransform(viewport));
      initializedRef.current = false;
      requestAnimationFrame(() => revealCard(undefined, true));
    }, [viewport, revealCard]);
    const fit = useCallback(() => {
      const node = contentRef.current;
      const view = getViewportSize();
      const cards = Array.from(
        node?.querySelectorAll<HTMLElement>('[data-slot="timeline-card"]') ??
          [],
      );
      if (!node || !cards.length || !view.width) {
        setTransform(
          fitTimelineTransform({
            contentSize,
            viewportSize: view,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
          }),
        );
        return;
      }
      const origin = node.getBoundingClientRect();
      const renderedZoom =
        new DOMMatrixReadOnly(getComputedStyle(node).transform).a || 1;
      const rects = cards.map((card) => card.getBoundingClientRect());
      const minX =
        (Math.min(...rects.map((rect) => rect.left)) - origin.left) /
          renderedZoom -
        20;
      const minY =
        (Math.min(...rects.map((rect) => rect.top)) - origin.top) /
          renderedZoom -
        64;
      const width =
        (Math.max(...rects.map((rect) => rect.right)) - origin.left) /
          renderedZoom -
        minX +
        20;
      const height =
        (Math.max(...rects.map((rect) => rect.bottom)) - origin.top) /
          renderedZoom -
        minY +
        20;
      const fitted = fitTimelineTransform({
        contentSize: { width, height },
        viewportSize: {
          width: view.width,
          height: Math.max(1, view.height - 48),
        },
        minZoom: options.minZoom,
        maxZoom: options.maxZoom,
      });
      setTransform({
        ...fitted,
        x: fitted.x - minX * fitted.zoom,
        y: fitted.y + 48 - minY * fitted.zoom,
      });
    }, [contentSize, getViewportSize, options.maxZoom, options.minZoom]);

    useEffect(() => {
      const node = viewportRef.current;
      if (!node) return;
      let frame = 0;
      const measure = () => {
        const width = node.clientWidth;
        if (!width) return;
        node.style.setProperty(
          "--timeline-card-width",
          `${Math.max(80, Math.min(320, width - 40))}px`,
        );
        const cards = Array.from(
          node.querySelectorAll<HTMLElement>('[data-slot="timeline-card"]'),
        );
        const height = Math.max(0, ...cards.map((card) => card.offsetHeight));
        node.style.minHeight = `${Math.max(352, height + 112)}px`;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          revealCard(undefined, !initializedRef.current);
          initializedRef.current = true;
        });
      };
      measure();
      const observer =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(measure);
      observer?.observe(node);
      node
        .querySelectorAll('[data-slot="timeline-card"]')
        .forEach((card) => observer?.observe(card));
      return () => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
      };
    }, [revealCard, contentSize]);
    useEffect(() => {
      const frame = requestAnimationFrame(() =>
        revealCard(undefined, !initializedRef.current),
      );
      return () => cancelAnimationFrame(frame);
    }, [selectedPoint?.x, selectedPoint?.y, revealCard, options.defaultZoom]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || !interactive) {
        return;
      }

      if (navigateTimeline(event, onNavigate)) return;
      if (
        event.target !== event.currentTarget &&
        (event.target as HTMLElement).dataset.slot !== "timeline-card-action"
      )
        return;
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomBy(0.2);
      } else if (event.key === "-") {
        event.preventDefault();
        zoomBy(-0.2);
      } else if (event.key === "0") {
        event.preventDefault();
        reset();
      } else if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        fit();
      }
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);

      if (
        event.defaultPrevented ||
        !interactive ||
        event.button !== 0 ||
        (event.target instanceof HTMLElement &&
          event.target.closest(
            '[data-slot="timeline-card"], [data-slot="timeline-controls"], button, a, input, textarea, select, [contenteditable="true"]',
          ))
      ) {
        return;
      }

      suppressClickRef.current = false;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        transform,
        moved: false,
      };
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      const drag = dragRef.current;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      if (
        !drag.moved &&
        Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6
      )
        return;
      if (!drag.moved) {
        drag.moved = true;
        suppressClickRef.current = true;
        setDragging(true);
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
      setTransform({
        ...drag.transform,
        x: drag.transform.x + event.clientX - drag.startX,
        y: drag.transform.y + event.clientY - drag.startY,
      });
    };

    const endDrag = (event: PointerEvent<HTMLDivElement>) => {
      dragRef.current = null;
      setDragging(false);
      if (event.currentTarget.hasPointerCapture?.(event.pointerId))
        event.currentTarget.releasePointerCapture?.(event.pointerId);
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
      onPointerUp?.(event);
      endDrag(event);
    };

    const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
      onPointerCancel?.(event);
      endDrag(event);
    };

    const showHoverControls = () => {
      if (options.controlsVisibility === "hover") {
        setControlsVisible(true);
      }
    };

    const hideHoverControls = () => {
      if (options.controlsVisibility === "hover") {
        setControlsVisible(false);
      }
    };

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(event);

      if (!event.defaultPrevented) {
        showHoverControls();
      }
    };

    const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(event);

      if (
        !event.defaultPrevented &&
        !event.currentTarget.contains(document.activeElement)
      ) {
        hideHoverControls();
      }
    };

    const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);

      if (!event.defaultPrevented) {
        showHoverControls();
        const target = event.target as HTMLElement;
        if (target.dataset.slot === "timeline-card-action")
          revealCard(
            target.closest<HTMLElement>('[data-slot="timeline-card"]'),
          );
      }
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      onBlur?.(event);

      if (
        event.defaultPrevented ||
        (event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget))
      ) {
        return;
      }

      hideHoverControls();
    };

    const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
      onWheel?.(event);

      if (
        event.defaultPrevented ||
        !interactive ||
        options.wheelZoom === false
      ) {
        return;
      }

      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;

      if (options.wheelZoom === "modifier" && !hasModifier) {
        return;
      }

      event.preventDefault();

      const rect = event.currentTarget.getBoundingClientRect();

      zoomBy(event.deltaY < 0 ? 0.15 : -0.15, {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };
    const contentStyle: TimelineContentStyle = {
      width: contentSize.width,
      height: contentSize.height,
      "--timeline-transform": `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.zoom})`,
      transform: "var(--timeline-transform)",
    };

    return (
      /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- This focusable viewport supports keyboard navigation and pointer gestures. */
      <div
        {...props}
        ref={mergedRef}
        role="region"
        aria-label={props["aria-label"] ?? "Timeline viewport"}
        tabIndex={interactive ? 0 : undefined}
        data-slot="timeline-viewport"
        data-interactive={interactive ? "true" : "false"}
        data-dragging={dragging ? "true" : undefined}
        data-orientation={orientation}
        data-layout={layout}
        data-presentation={presentation}
        data-chrome={options.chrome}
        className={cn(
          timelineViewportClasses,
          timelineViewportChromeClasses[options.chrome],
          className,
        )}
        onKeyDown={handleKeyDown}
        onClickCapture={(event) => {
          if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onWheel={handleWheel}
      >
        {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        {interactive ? (
          <p className="text-muted-foreground pointer-events-none absolute inset-x-3 bottom-2 z-10 text-center text-xs">
            Drag the track · Arrow keys to navigate
          </p>
        ) : null}
        {interactive && options.controls ? (
          <TimelineControls
            zoom={transform.zoom}
            minZoom={options.minZoom}
            maxZoom={options.maxZoom}
            visibility={options.controlsVisibility}
            visible={controlsVisible}
            onZoomIn={() => zoomBy(0.2)}
            onZoomOut={() => zoomBy(-0.2)}
            onFit={fit}
            onReset={reset}
          />
        ) : null}
        <div
          ref={contentRef}
          data-slot="timeline-viewport-content"
          data-dragging={dragging ? "true" : undefined}
          className={timelineViewportContentClasses}
          style={contentStyle}
        >
          {children}
        </div>
      </div>
    );
  },
);

TimelineViewport.displayName = "TimelineViewport";

interface TimelineFlowViewportProps extends Omit<
  TimelineViewportProps,
  "contentSize" | "selectedPoint"
> {}

function TimelineFlowViewport({
  children,
  className,
  interactive = false,
  orientation = "vertical",
  layout = "story",
  presentation = "flow",
  viewport,
  onNavigate,
  getPreviousId: _getPreviousId,
  getNextId: _getNextId,
  getFirstId: _getFirstId,
  getLastId: _getLastId,
  onKeyDown,
  ...props
}: TimelineFlowViewportProps) {
  const options = normalizeViewportOptions(viewport);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented || !interactive) {
      return;
    }

    navigateTimeline(event, onNavigate);
  };

  return (
    /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- This focusable viewport supports keyboard navigation and pointer gestures. */
    <div
      {...props}
      role="region"
      aria-label={props["aria-label"] ?? "Timeline viewport"}
      tabIndex={interactive ? 0 : undefined}
      data-slot="timeline-viewport"
      data-interactive={interactive ? "true" : "false"}
      data-orientation={orientation}
      data-layout={layout}
      data-presentation={presentation}
      data-chrome={options.chrome}
      className={cn(
        timelineStoryViewportClasses,
        timelineViewportChromeClasses[options.chrome],
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      {children}
    </div>
  );
}

type TimelineRevealItemStyle = CSSProperties & {
  "--timeline-reveal-index"?: number;
  "--timeline-reveal-interval"?: string;
  "--timeline-reveal-duration"?: string;
  "--timeline-reveal-initial-delay"?: string;
  "--timeline-reveal-delay"?: string;
  "--timeline-rail-duration"?: string;
  "--timeline-rail-delay"?: string;
};

type TimelineRevealItemProps = {
  onFocusCapture?: () => void;
  ref?: (node: HTMLLIElement | null) => void;
  style?: TimelineRevealItemStyle;
  "data-reveal"?: TimelineRevealMode;
  "data-revealed"?: "true" | "false";
  "data-reveal-last"?: "true";
  "data-timeline-reveal-id"?: string;
};

type UseTimelineRevealResult = {
  getItemRevealProps: (id: string, isLast: boolean) => TimelineRevealItemProps;
  handleAnimationEnd: (event: AnimationEvent<HTMLElement>) => void;
};

const REVEAL_COMPLETE_BUFFER_MS = 60;
const subscribeReducedMotion = (notify: () => void) => {
  const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  query?.addEventListener("change", notify);
  return () => query?.removeEventListener("change", notify);
};
const getReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const getServerReducedMotion = () => false;

// Reveal progression is driven by React state (a ref-backed revealed set), not
// by animation events, so it stays correct under `prefers-reduced-motion` and
// in SSR. CSS only turns that state into motion.
function useTimelineReveal({
  itemIds,
  reveal,
  active,
  options,
  revealCount,
  onItemReveal,
  onRevealComplete,
}: {
  itemIds: string[];
  reveal: TimelineRevealMode;
  active: boolean;
  options: NormalizedTimelineRevealOptions;
  revealCount: number | undefined;
  onItemReveal?: (id: string, index: number) => void;
  onRevealComplete?: () => void;
}): UseTimelineRevealResult {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );
  const focusedRef = useRef<Set<string>>(new Set());
  const revealedRef = useRef<Set<string>>(new Set());
  const orderRef = useRef<Map<string, number>>(new Map());
  const inViewRef = useRef<Set<string>>(new Set());
  const nodesRef = useRef<Map<string, HTMLLIElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const completeFiredRef = useRef(false);
  const completionDeadlineRef = useRef(0);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [, setRevealTick] = useState(0);
  const forceRender = useCallback(() => setRevealTick((tick) => tick + 1), []);

  const stateRef = useRef({
    itemIds,
    reveal,
    active,
    options,
    reduced,
    trigger: options.trigger,
    revealCount,
    onItemReveal,
    onRevealComplete,
  });
  // Mirror the latest props into a ref so the stable reconcile/observer
  // callbacks always read current values without re-subscribing.
  // eslint-disable-next-line react-hooks/refs
  stateRef.current = {
    itemIds,
    reveal,
    active,
    options,
    reduced,
    trigger: options.trigger,
    revealCount,
    onItemReveal,
    onRevealComplete,
  };

  const reconcile = useCallback(() => {
    const state = stateRef.current;

    if (!state.active) {
      return;
    }

    const total = state.itemIds.length;
    const isTarget = (id: string, index: number) => {
      if (state.reduced || focusedRef.current.has(id)) return true;
      if (state.trigger === "manual") {
        return index < clampTimelineRevealCount(state.revealCount, total);
      }

      if (state.trigger === "in-view") {
        return inViewRef.current.has(id);
      }

      return true;
    };
    const newlyRevealed = state.itemIds.filter(
      (id, index) => isTarget(id, index) && !revealedRef.current.has(id),
    );

    if (newlyRevealed.length === 0) {
      return;
    }

    completeFiredRef.current = false;
    newlyRevealed.forEach((id, batchOrder) => {
      orderRef.current.set(id, state.reveal === "stagger" ? batchOrder : 0);
      revealedRef.current.add(id);

      const node = nodesRef.current.get(id);
      if (node && observerRef.current) {
        observerRef.current.unobserve(node);
      }
    });
    forceRender();

    newlyRevealed.forEach((id) => {
      state.onItemReveal?.(id, state.itemIds.indexOf(id));
    });

    const duration = state.reduced
      ? 0
      : getTimelineRevealBatchDuration({
          batchSize: newlyRevealed.length,
          reveal: state.reveal,
          options: state.options,
        });
    completionDeadlineRef.current = state.reduced
      ? Date.now()
      : Math.max(completionDeadlineRef.current, Date.now() + duration);
    const allRevealed = state.itemIds.every((id) =>
      revealedRef.current.has(id),
    );
    if (allRevealed) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = setTimeout(
        () => {
          const latest = stateRef.current;
          if (
            !completeFiredRef.current &&
            latest.itemIds.every((id) => revealedRef.current.has(id))
          ) {
            completeFiredRef.current = true;
            latest.onRevealComplete?.();
          }
        },
        state.reduced
          ? 0
          : Math.max(0, completionDeadlineRef.current - Date.now()) +
              REVEAL_COMPLETE_BUFFER_MS,
      );
    }
  }, [forceRender]);

  const itemKey = JSON.stringify(itemIds);

  // Prune removed ids so re-added items animate again, then reconcile whenever
  // the item set or reveal configuration changes.
  useEffect(() => {
    if (!active) {
      return;
    }

    const idSet = new Set(itemIds);
    for (const id of Array.from(revealedRef.current)) {
      if (!idSet.has(id)) revealedRef.current.delete(id);
    }
    for (const id of Array.from(orderRef.current.keys())) {
      if (!idSet.has(id)) orderRef.current.delete(id);
    }
    for (const id of Array.from(focusedRef.current)) {
      if (!idSet.has(id)) focusedRef.current.delete(id);
    }
    for (const id of Array.from(inViewRef.current)) {
      if (!idSet.has(id)) inViewRef.current.delete(id);
    }

    reconcile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    active,
    itemKey,
    reveal,
    options.trigger,
    options.interval,
    options.duration,
    options.initialDelay,
    revealCount,
    reduced,
    reconcile,
  ]);

  // IntersectionObserver for the in-view trigger. A single observer watches the
  // still-hidden item nodes and reveals them as they scroll into view.
  useEffect(() => {
    if (!active || options.trigger !== "in-view") {
      observerRef.current?.disconnect();
      observerRef.current = null;
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      itemIds.forEach((id) => inViewRef.current.add(id));
      reconcile();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).getAttribute(
            "data-timeline-reveal-id",
          );
          if (id) {
            inViewRef.current.add(id);
            changed = true;
          }
        }
        if (changed) reconcile();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observerRef.current = observer;
    nodesRef.current.forEach((node, id) => {
      if (!revealedRef.current.has(id)) observer.observe(node);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, options.trigger, itemKey, reconcile]);

  useEffect(() => () => clearTimeout(completeTimerRef.current), []);

  const registerNode = useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) {
      nodesRef.current.set(id, node);
      if (
        observerRef.current &&
        stateRef.current.trigger === "in-view" &&
        !revealedRef.current.has(id)
      ) {
        observerRef.current.observe(node);
      }
    } else {
      nodesRef.current.delete(id);
    }
  }, []);

  const handleAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLElement>) => {
      const state = stateRef.current;
      if (!state.active || Date.now() < completionDeadlineRef.current) return;
      if (!String(event.animationName).includes("timeline-reveal")) return;
      const target = event.target as HTMLElement;
      if (target.getAttribute("data-reveal-last") !== "true") return;
      if (
        !completeFiredRef.current &&
        state.itemIds.every((id) => revealedRef.current.has(id))
      ) {
        completeFiredRef.current = true;
        clearTimeout(completeTimerRef.current);
        state.onRevealComplete?.();
      }
    },
    [],
  );

  const getItemRevealProps = (
    id: string,
    isLast: boolean,
  ): TimelineRevealItemProps => {
    if (!active) {
      return {};
    }

    return {
      onFocusCapture: () => {
        focusedRef.current.add(id);
        reconcile();
      },
      ref: (node) => registerNode(id, node),
      "data-reveal": reveal,
      "data-revealed": revealedRef.current.has(id) ? "true" : "false",
      "data-reveal-last": isLast ? "true" : undefined,
      "data-timeline-reveal-id": id,
      style: {
        "--timeline-reveal-index": orderRef.current.get(id) ?? 0,
        "--timeline-reveal-delay": `${options.initialDelay + Math.min(options.maxStagger ?? Infinity, (orderRef.current.get(id) ?? 0) * options.interval)}ms`,
        "--timeline-reveal-interval": `${options.interval}ms`,
        "--timeline-reveal-duration": `${options.duration}ms`,
        "--timeline-reveal-initial-delay": `${options.initialDelay}ms`,
      },
    };
  };

  return { getItemRevealProps, handleAnimationEnd };
}

function TimelineInner<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>(
  {
    className,
    items,
    mode = "events",
    orientation,
    layout,
    scale,
    order = "asc",
    interactive,
    presentation,
    reveal = "none",
    revealOptions,
    revealCount,
    onItemReveal,
    onRevealComplete,
    viewport,
    selectedId,
    defaultSelectedId = null,
    onSelectedIdChange,
    renderItem,
    variant = "activity",
    renderDetails,
    expandedIds,
    defaultExpandedIds = [],
    onExpandedIdsChange,
    getGroup,
    ...props
  }: TimelineProps<TPayload>,
  ref: ForwardedRef<HTMLElement>,
) {
  const hydrated = useHydrated();
  const [internalExpandedIds, setInternalExpandedIds] =
    useState(defaultExpandedIds);
  const currentExpandedIds = expandedIds ?? internalExpandedIds;
  const toggleExpanded = (id: string) => {
    const next = currentExpandedIds.includes(id)
      ? currentExpandedIds.filter((value) => value !== id)
      : [...currentExpandedIds, id];
    if (expandedIds === undefined) setInternalExpandedIds(next);
    onExpandedIdsChange?.(next);
  };
  const isStoryMode = mode === "story";
  const resolvedLayout = layout ?? (isStoryMode ? "story" : "rail");
  const resolvedPresentation = resolveTimelinePresentation(
    presentation,
    mode,
    resolvedLayout,
  );
  const usesFlowRenderer = resolvedPresentation === "flow";
  // Story styling (large editorial typography) is distinct from the flow
  // renderer: compact events/progress timelines can render in flow too.
  const isStoryStyling = isStoryMode || resolvedLayout === "story";
  const resolvedOrientation = usesFlowRenderer
    ? "vertical"
    : (orientation ?? "horizontal");
  const resolvedScale = scale ?? (isStoryMode ? "sequence" : "auto");
  const resolvedInteractive = interactive ?? !isStoryStyling;
  const resolvedViewport = usesFlowRenderer
    ? { controls: false, wheelZoom: false as const, ...viewport }
    : viewport;
  const flowListLayout =
    resolvedLayout === "alternating" ? "alternating" : "default";
  const revealActive = isTimelineRevealActive(reveal, resolvedPresentation);
  const revealOptionsNormalized = useMemo(
    () => normalizeTimelineRevealOptions(revealOptions),
    // Depend on the individual fields so a fresh options object literal does
    // not re-run reveal effects on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      revealOptions?.trigger,
      revealOptions?.interval,
      revealOptions?.duration,
      revealOptions?.initialDelay,
    ],
  );
  const rootLabel = props["aria-label"];
  const viewportLabel =
    typeof rootLabel === "string" && rootLabel.length > 0
      ? `${rootLabel} viewport`
      : "Timeline viewport";
  const normalizedItems = useMemo(
    () =>
      normalizeTimelineItems(items, {
        mode,
        orientation: resolvedOrientation,
        layout: resolvedLayout,
        scale: resolvedScale,
        order,
      }),
    [items, mode, order, resolvedLayout, resolvedOrientation, resolvedScale],
  );
  const dataScale = useMemo(
    () =>
      normalizedItems.length > 0 &&
      normalizedItems.every((item) => item.dateValue !== undefined)
        ? resolvedScale === "sequence"
          ? "sequence"
          : "time"
        : "sequence",
    [normalizedItems, resolvedScale],
  );
  const contentSize = useMemo(
    () =>
      getTimelineContentSize(
        normalizedItems,
        resolvedOrientation,
        resolvedLayout,
      ),
    [normalizedItems, resolvedLayout, resolvedOrientation],
  );
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    defaultSelectedId,
  );
  const currentSelectedId =
    selectedId === undefined ? internalSelectedId : selectedId;
  const selectedPoint = normalizedItems.find(
    (item) => item.id === currentSelectedId,
  )?.point;
  const setSelectedId = useCallback(
    (id: string | null) => {
      const nextId =
        id && normalizedItems.some((item) => item.id === id && !item.disabled)
          ? id
          : null;

      if (selectedId === undefined) {
        setInternalSelectedId(nextId);
      }

      if (nextId !== currentSelectedId) {
        onSelectedIdChange?.(nextId);
      }
    },
    [currentSelectedId, normalizedItems, onSelectedIdChange, selectedId],
  );
  const getPreviousId = useCallback(
    () => getNextEnabledTimelineItemId(normalizedItems, currentSelectedId, -1),
    [currentSelectedId, normalizedItems],
  );
  const getNextId = useCallback(
    () => getNextEnabledTimelineItemId(normalizedItems, currentSelectedId, 1),
    [currentSelectedId, normalizedItems],
  );
  const getFirstId = useCallback(
    () => getEdgeEnabledTimelineItemId(normalizedItems, "first"),
    [normalizedItems],
  );
  const getLastId = useCallback(
    () => getEdgeEnabledTimelineItemId(normalizedItems, "last"),
    [normalizedItems],
  );
  const itemIds = useMemo(
    () => normalizedItems.map((item) => item.id),
    [normalizedItems],
  );
  const { getItemRevealProps, handleAnimationEnd } = useTimelineReveal({
    itemIds,
    reveal,
    active: revealActive,
    options: revealOptionsNormalized,
    revealCount,
    onItemReveal,
    onRevealComplete,
  });
  const railRevealActive = revealActive && reveal === "stagger";
  const railStyle: TimelineRevealItemStyle | undefined = railRevealActive
    ? {
        "--timeline-rail-duration": `${getTimelineRevealBatchDuration({
          batchSize: normalizedItems.length,
          reveal,
          options: revealOptionsNormalized,
        })}ms`,
        "--timeline-rail-delay": `${revealOptionsNormalized.initialDelay}ms`,
      }
    : undefined;

  return (
    <section
      {...props}
      ref={ref}
      data-slot="timeline"
      data-mode={mode}
      data-variant={variant}
      data-reveal-ready={hydrated ? "true" : undefined}
      data-orientation={resolvedOrientation}
      data-layout={resolvedLayout}
      data-scale={dataScale}
      data-interactive={resolvedInteractive ? "true" : "false"}
      data-presentation={resolvedPresentation}
      className={cn(timelineRootClasses, className)}
    >
      {usesFlowRenderer ? (
        <TimelineFlowViewport
          aria-label={viewportLabel}
          interactive={resolvedInteractive}
          orientation={resolvedOrientation}
          layout={resolvedLayout}
          presentation={resolvedPresentation}
          viewport={resolvedViewport}
          onNavigate={setSelectedId}
          getPreviousId={getPreviousId}
          getNextId={getNextId}
          getFirstId={getFirstId}
          getLastId={getLastId}
        >
          <ol
            data-slot="timeline-list"
            data-reveal={revealActive ? reveal : undefined}
            data-reveal-rail={railRevealActive ? "true" : undefined}
            onAnimationEnd={revealActive ? handleAnimationEnd : undefined}
            className={cn(
              isStoryStyling
                ? timelineStoryListClasses
                : timelineFlowListClasses,
              (isStoryStyling
                ? timelineStoryListLayoutClasses
                : timelineFlowListLayoutClasses)[flowListLayout],
            )}
            style={railStyle}
          >
            {normalizedItems.map((item, index) => {
              const {
                ref: revealRef,
                style: revealStyle,
                ...revealAttrs
              } = getItemRevealProps(
                item.id,
                index === normalizedItems.length - 1,
              );

              const group = getGroup?.(item);
              const previousGroup =
                index > 0 ? getGroup?.(normalizedItems[index - 1]) : null;
              const groupStart = group && group.id !== previousGroup?.id;
              return (
                <Fragment key={item.id}>
                  {groupStart ? (
                    <li
                      role="presentation"
                      data-slot="timeline-group"
                      className="bg-background relative z-10 py-4 text-sm font-semibold"
                    >
                      <span role="heading" aria-level={3}>
                        {group.label}
                      </span>
                    </li>
                  ) : null}
                  <TimelineItem
                    key={item.id}
                    ref={revealRef}
                    style={revealStyle}
                    item={item}
                    mode={mode}
                    orientation={resolvedOrientation}
                    layout={resolvedLayout}
                    presentation={resolvedPresentation}
                    interactive={resolvedInteractive}
                    selected={item.id === currentSelectedId}
                    renderItem={renderItem}
                    variant={variant}
                    details={renderDetails ? renderDetails(item) : item.details}
                    expanded={currentExpandedIds.includes(item.id)}
                    onExpandedChange={() => toggleExpanded(item.id)}
                    onSelect={setSelectedId}
                    {...revealAttrs}
                  />
                </Fragment>
              );
            })}
          </ol>
        </TimelineFlowViewport>
      ) : (
        <TimelineViewport
          aria-label={viewportLabel}
          contentSize={contentSize}
          interactive={resolvedInteractive}
          orientation={resolvedOrientation}
          layout={resolvedLayout}
          presentation={resolvedPresentation}
          viewport={resolvedViewport}
          selectedPoint={selectedPoint}
          onNavigate={setSelectedId}
          getPreviousId={getPreviousId}
          getNextId={getNextId}
          getFirstId={getFirstId}
          getLastId={getLastId}
        >
          <TimelineRail
            items={normalizedItems}
            orientation={resolvedOrientation}
          />
          <ol
            data-slot="timeline-list"
            className={timelineListClasses}
            style={{ width: contentSize.width, height: contentSize.height }}
          >
            {normalizedItems.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                mode={mode}
                orientation={resolvedOrientation}
                layout={resolvedLayout}
                presentation={resolvedPresentation}
                interactive={resolvedInteractive}
                selected={item.id === currentSelectedId}
                renderItem={renderItem}
                onSelect={setSelectedId}
              />
            ))}
          </ol>
        </TimelineViewport>
      )}
    </section>
  );
}

export const Timeline = forwardRef(TimelineInner) as (<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>(
  props: TimelineProps<TPayload> & RefAttributes<HTMLElement>,
) => ReactElement | null) & { displayName?: string };

Timeline.displayName = "Timeline";
