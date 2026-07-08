import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
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
import { cn } from "../../utils/cn";
import {
  centerTimelinePoint,
  fitTimelineTransform,
  getDefaultTimelineTransform,
  getEdgeEnabledTimelineItemId,
  getNextEnabledTimelineItemId,
  getTimelineContentSize,
  normalizeTimelineItems,
  normalizeViewportOptions,
  resetTimelineTransform,
  timelineGeometry,
  zoomTimelineTransform,
  type NormalizedTimelineItem,
  type TimelineItemData,
  type TimelineItemPayload,
  type TimelineLayout,
  type TimelineMode,
  type TimelineOrder,
  type TimelineOrientation,
  type TimelinePoint,
  type TimelineScale,
  type TimelineControlsVisibility,
  type TimelineStatus,
  type TimelineTransform,
  type TimelineViewportChrome,
  type TimelineViewportOptions,
} from "./timeline-utils";

export type {
  NormalizedTimelineItem,
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
  TimelineScale,
  TimelineControlsVisibility,
  TimelineStatus,
  TimelineTransform,
  TimelineViewportChrome,
  TimelineViewportOptions,
  TimelineWheelZoom,
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
  viewport?: TimelineViewportOptions;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectedIdChange?: (id: string | null) => void;
  renderItem?: TimelineItemRenderer<TPayload>;
}

export interface TimelineItemProps<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> extends Omit<HTMLAttributes<HTMLLIElement>, "onSelect"> {
  item: NormalizedTimelineItem<TPayload>;
  mode?: TimelineMode;
  orientation?: TimelineOrientation;
  layout?: TimelineLayout;
  interactive?: boolean;
  selected?: boolean;
  renderItem?: TimelineItemRenderer<TPayload>;
  onSelect?: (id: string) => void;
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
  "relative min-h-[30rem] overflow-hidden rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[interactive=true]:cursor-grab data-[dragging=true]:cursor-grabbing data-[layout=alternating]:min-h-[40rem] data-[orientation=vertical]:min-h-[38rem] data-[orientation=horizontal]:touch-pan-y data-[orientation=vertical]:touch-pan-x";

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

const timelineCardBaseClasses =
  "text-left text-foreground motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background data-[disabled=true]:opacity-55 data-[interactive=true]:cursor-pointer";

const timelineViewportCardClasses =
  "absolute w-80 rounded-md border border-timeline-border bg-background p-[var(--dt-space-4)] shadow-sm data-[interactive=true]:hover:shadow-md data-[selected=true]:border-ring data-[selected=true]:bg-muted/40 data-[selected=true]:shadow-md data-[selected=true]:ring-1 data-[selected=true]:ring-ring/35";

const timelineStoryCardClasses =
  "relative col-start-2 row-start-1 min-w-0 max-w-full border-0 bg-transparent p-[var(--dt-space-0)] shadow-none";

const timelineStoryCardAlternatingClasses: Record<"start" | "end", string> = {
  start: "sm:col-start-1 sm:justify-self-end sm:text-right",
  end: "sm:col-start-3 sm:justify-self-start sm:text-left",
};

const timelineMarkerBaseClasses =
  "z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-medium shadow-sm motion-safe:transition-[border-color,background-color,box-shadow,transform] motion-safe:duration-200 data-[selected=true]:scale-110 data-[selected=true]:shadow-md data-[selected=true]:ring-4 data-[selected=true]:ring-ring/20";

const timelineViewportMarkerClasses =
  "absolute -translate-x-1/2 -translate-y-1/2";

const timelineStoryMarkerClasses =
  "relative col-start-1 row-start-1 mt-[var(--dt-space-1)] size-7 justify-self-center border-background bg-background text-primary ring-1 ring-border";

const timelineStoryMarkerAlternatingClasses = "sm:col-start-2";

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

function isActivationKey(event: KeyboardEvent) {
  return event.key === "Enter" || event.key === " ";
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
    interactive = true,
    selected = false,
    renderItem,
    onSelect,
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
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isInteractive || !isActivationKey(event)) {
      return;
    }

    event.preventDefault();
    onSelect?.(item.id);
  };
  const isStoryRenderer = mode === "story" || layout === "story";
  const isAlternatingStoryLayout = isStoryRenderer && layout === "alternating";
  const alternatingSide = item.index % 2 === 0 ? "end" : "start";
  const contentLayout = isStoryRenderer ? "story" : layout;
  const cardContent = renderItem
    ? renderItem(item)
    : renderDefaultItemContent(item, titleId, contentLayout);
  const itemStyle = isStoryRenderer
    ? style
    : { left: item.point.x, top: item.point.y, ...style };

  return (
    <li
      {...props}
      ref={ref}
      data-slot="timeline-item"
      data-status={item.status}
      data-selected={selected ? "true" : undefined}
      data-disabled={item.disabled ? "true" : undefined}
      className={cn(
        isStoryRenderer
          ? cn(
              timelineStoryItemClasses,
              timelineStoryItemLayoutClasses[
                isAlternatingStoryLayout ? "alternating" : "default"
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
          isStoryRenderer
            ? timelineStoryMarkerClasses
            : timelineViewportMarkerClasses,
          isAlternatingStoryLayout && timelineStoryMarkerAlternatingClasses,
          isStoryRenderer
            ? timelineStoryMarkerStatusClasses[item.status]
            : timelineMarkerStatusClasses[item.status],
        )}
      >
        {item.marker ?? (
          <span
            className={cn(
              "rounded-full bg-current",
              isStoryRenderer ? "size-3.5" : "size-2",
            )}
          />
        )}
      </span>
      <article
        aria-labelledby={renderItem ? undefined : titleId}
        data-slot="timeline-card"
        data-status={item.status}
        data-selected={selected ? "true" : undefined}
        data-disabled={item.disabled ? "true" : undefined}
        data-interactive={isInteractive ? "true" : undefined}
        className={cn(
          timelineCardBaseClasses,
          isStoryRenderer
            ? timelineStoryCardClasses
            : timelineViewportCardClasses,
          isAlternatingStoryLayout &&
            timelineStoryCardAlternatingClasses[alternatingSide],
          !isStoryRenderer &&
            getCardPositionClasses({ index: item.index, orientation, layout }),
        )}
      >
        <span className="sr-only">
          Status: {timelineStatusLabel[item.status]}
        </span>
        <div
          aria-current={item.status === "current" ? "step" : undefined}
          aria-disabled={item.disabled ? true : undefined}
          aria-labelledby={renderItem ? undefined : titleId}
          aria-pressed={isInteractive ? selected : undefined}
          data-interactive={isInteractive ? "true" : undefined}
          data-selected={selected ? "true" : undefined}
          data-slot="timeline-card-action"
          role={isInteractive ? "button" : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          className={cn(
            "block focus-visible:outline-none motion-reduce:transition-none",
            isStoryRenderer
              ? "rounded-none"
              : "rounded-sm motion-safe:transition-transform motion-safe:duration-200 motion-safe:data-[interactive=true]:hover:scale-[1.01] motion-safe:data-[interactive=true]:active:scale-[0.99]",
          )}
          onClick={handleSelect}
          onKeyDown={handleKeyDown}
        >
          {cardContent}
        </div>
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
        className={timelineControlButtonClasses}
        disabled={zoom <= minZoom}
        onClick={onZoomOut}
      >
        <ZoomOutIcon />
      </button>
      <button
        type="button"
        aria-label="Zoom in"
        className={timelineControlButtonClasses}
        disabled={zoom >= maxZoom}
        onClick={onZoomIn}
      >
        <ZoomInIcon />
      </button>
      <button
        type="button"
        aria-label="Fit timeline"
        className={timelineControlButtonClasses}
        onClick={onFit}
      >
        <FitViewIcon />
      </button>
      <button
        type="button"
        aria-label="Reset timeline view"
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
      viewport,
      selectedPoint,
      onNavigate,
      getPreviousId,
      getNextId,
      getFirstId,
      getLastId,
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
    const didHandleInitialSelectionRef = useRef(false);
    const dragRef = useRef<{
      pointerId: number;
      startX: number;
      startY: number;
      transform: TimelineTransform;
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
    const reset = useCallback(() => {
      setTransform(resetTimelineTransform(viewport));
    }, [viewport]);
    const fit = useCallback(() => {
      setTransform(
        fitTimelineTransform({
          contentSize,
          viewportSize: getViewportSize(),
          minZoom: options.minZoom,
          maxZoom: options.maxZoom,
        }),
      );
    }, [contentSize, getViewportSize, options.maxZoom, options.minZoom]);

    useEffect(() => {
      setTransform((current) => ({
        ...current,
        zoom: normalizeViewportOptions(viewport).defaultZoom,
      }));
    }, [viewport]);

    useEffect(() => {
      if (!didHandleInitialSelectionRef.current) {
        didHandleInitialSelectionRef.current = true;
        return;
      }

      if (!interactive || !selectedPoint) {
        return;
      }

      const viewportSize = getViewportSize();

      if (viewportSize.width === 0 || viewportSize.height === 0) {
        return;
      }

      setTransform((current) =>
        centerTimelinePoint({
          point: selectedPoint,
          viewportSize,
          zoom: current.zoom,
        }),
      );
    }, [getViewportSize, interactive, selectedPoint]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || !interactive) {
        return;
      }

      if (
        event.target instanceof HTMLElement &&
        event.target.closest('[data-slot="timeline-controls"]')
      ) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        onNavigate?.(getNextId?.() ?? null);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        onNavigate?.(getPreviousId?.() ?? null);
      } else if (event.key === "Home") {
        event.preventDefault();
        onNavigate?.(getFirstId?.() ?? null);
      } else if (event.key === "End") {
        event.preventDefault();
        onNavigate?.(getLastId?.() ?? null);
      } else if (event.key === "+" || event.key === "=") {
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
          event.target.closest('[data-slot="timeline-controls"]'))
      ) {
        return;
      }

      event.currentTarget.focus({ preventScroll: true });
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        transform,
      };
      setDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      const drag = dragRef.current;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
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
        data-chrome={options.chrome}
        className={cn(
          timelineViewportClasses,
          timelineViewportChromeClasses[options.chrome],
          className,
        )}
        onKeyDown={handleKeyDown}
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

interface TimelineStoryViewportProps extends Omit<
  TimelineViewportProps,
  "contentSize" | "selectedPoint"
> {}

function TimelineStoryViewport({
  children,
  className,
  interactive = false,
  orientation = "vertical",
  layout = "story",
  viewport,
  onNavigate,
  getPreviousId,
  getNextId,
  getFirstId,
  getLastId,
  onKeyDown,
  ...props
}: TimelineStoryViewportProps) {
  const options = normalizeViewportOptions(viewport);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented || !interactive) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      onNavigate?.(getNextId?.() ?? null);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      onNavigate?.(getPreviousId?.() ?? null);
    } else if (event.key === "Home") {
      event.preventDefault();
      onNavigate?.(getFirstId?.() ?? null);
    } else if (event.key === "End") {
      event.preventDefault();
      onNavigate?.(getLastId?.() ?? null);
    }
  };

  return (
    <div
      {...props}
      role="region"
      aria-label={props["aria-label"] ?? "Timeline viewport"}
      tabIndex={interactive ? 0 : undefined}
      data-slot="timeline-viewport"
      data-interactive={interactive ? "true" : "false"}
      data-orientation={orientation}
      data-layout={layout}
      data-chrome={options.chrome}
      className={cn(
        timelineStoryViewportClasses,
        timelineViewportChromeClasses[options.chrome],
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
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
    viewport,
    selectedId,
    defaultSelectedId = null,
    onSelectedIdChange,
    renderItem,
    ...props
  }: TimelineProps<TPayload>,
  ref: ForwardedRef<HTMLElement>,
) {
  const isStoryMode = mode === "story";
  const resolvedOrientation =
    orientation ?? (isStoryMode ? "vertical" : "horizontal");
  const resolvedLayout = layout ?? (isStoryMode ? "story" : "rail");
  const usesStoryRenderer = isStoryMode || resolvedLayout === "story";
  const resolvedScale = scale ?? (isStoryMode ? "sequence" : "auto");
  const resolvedInteractive = interactive ?? !usesStoryRenderer;
  const resolvedViewport = usesStoryRenderer
    ? { controls: false, wheelZoom: false as const, ...viewport }
    : viewport;
  const storyListLayout =
    resolvedLayout === "alternating" ? "alternating" : "default";
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

  return (
    <section
      {...props}
      ref={ref}
      data-slot="timeline"
      data-mode={mode}
      data-orientation={resolvedOrientation}
      data-layout={resolvedLayout}
      data-scale={dataScale}
      data-interactive={resolvedInteractive ? "true" : "false"}
      className={cn(timelineRootClasses, className)}
    >
      {usesStoryRenderer ? (
        <TimelineStoryViewport
          aria-label={viewportLabel}
          interactive={resolvedInteractive}
          orientation={resolvedOrientation}
          layout={resolvedLayout}
          viewport={resolvedViewport}
          onNavigate={setSelectedId}
          getPreviousId={getPreviousId}
          getNextId={getNextId}
          getFirstId={getFirstId}
          getLastId={getLastId}
        >
          <ol
            data-slot="timeline-list"
            className={cn(
              timelineStoryListClasses,
              timelineStoryListLayoutClasses[storyListLayout],
            )}
          >
            {normalizedItems.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                mode={mode}
                orientation={resolvedOrientation}
                layout={resolvedLayout}
                interactive={resolvedInteractive}
                selected={item.id === currentSelectedId}
                renderItem={renderItem}
                onSelect={setSelectedId}
              />
            ))}
          </ol>
        </TimelineStoryViewport>
      ) : (
        <TimelineViewport
          aria-label={viewportLabel}
          contentSize={contentSize}
          interactive={resolvedInteractive}
          orientation={resolvedOrientation}
          layout={resolvedLayout}
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
