import type { ReactNode } from "react";

export type TimelineStatus =
  "neutral" | "complete" | "current" | "upcoming" | "warning" | "error";

export type TimelineMode = "events" | "progress" | "story";
export type TimelineOrientation = "horizontal" | "vertical";
export type TimelineLayout = "rail" | "alternating" | "stacked" | "story";
export type TimelineScale = "auto" | "time" | "sequence";
export type TimelineResolvedScale = "time" | "sequence";
export type TimelineOrder = "asc" | "desc";
export type TimelineWheelZoom = "modifier" | "always" | false;
export type TimelineViewportChrome = "none" | "subtle" | "panel";
export type TimelineControlsVisibility = "always" | "hover";

export type TimelinePresentation = "canvas" | "flow";
export type TimelineVariant = "activity" | "cards";
export type TimelineGroup = { id: string; label: ReactNode };
export type TimelineRevealMode = "none" | "stagger" | "all";
export type TimelineRevealTrigger = "mount" | "in-view" | "manual";

export type TimelineRevealOptions = {
  trigger?: TimelineRevealTrigger;
  interval?: number;
  duration?: number;
  initialDelay?: number;
};

export type NormalizedTimelineRevealOptions = {
  trigger: TimelineRevealTrigger;
  interval: number;
  duration: number;
  initialDelay: number;
  /** Undefined preserves explicitly supplied stagger timing. */
  maxStagger?: number;
};

export type TimelineImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type TimelineItemPayload = Record<string, unknown>;

export type TimelineItemBaseData = {
  id: string;
  datetime?: string | Date;
  dateLabel?: ReactNode;
  status?: TimelineStatus;
  marker?: ReactNode;
  disabled?: boolean;
};

export type TimelineItemDefaultContent = {
  title?: ReactNode;
  description?: ReactNode;
  image?: TimelineImage;
  details?: ReactNode;
};

export type TimelineItemData<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> = TimelineItemBaseData &
  TimelineItemDefaultContent & {
    data?: TPayload;
  };

export type TimelineTransform = {
  x: number;
  y: number;
  zoom: number;
};

export type TimelinePoint = {
  x: number;
  y: number;
};

export type TimelineViewportOptions = {
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  controls?: boolean;
  controlsVisibility?: TimelineControlsVisibility;
  chrome?: TimelineViewportChrome;
  wheelZoom?: TimelineWheelZoom;
};

export type NormalizedTimelineItem<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> = TimelineItemData<TPayload> & {
  index: number;
  originalIndex: number;
  status: TimelineStatus;
  datetimeAttribute?: string;
  dateValue?: number;
  point: TimelinePoint;
};

export type NormalizeTimelineItemsOptions = {
  mode?: TimelineMode;
  orientation?: TimelineOrientation;
  layout?: TimelineLayout;
  scale?: TimelineScale;
  order?: TimelineOrder;
};

export const timelineDefaultViewport = {
  defaultZoom: 1,
  minZoom: 0.5,
  maxZoom: 2.5,
  controls: true,
  controlsVisibility: "hover" as TimelineControlsVisibility,
  chrome: "none" as TimelineViewportChrome,
  wheelZoom: "modifier" as TimelineWheelZoom,
};

export const timelineDefaultRevealOptions: NormalizedTimelineRevealOptions = {
  trigger: "mount",
  interval: 60,
  duration: 220,
  initialDelay: 0,
};

export const timelineGeometry = {
  itemGap: 420,
  minimumItemGap: 360,
  startPadding: 200,
  horizontalCardOffset: 72,
  verticalCardOffset: 72,
  horizontalRailY: 132,
  horizontalAlternatingRailY: 416,
  verticalRailX: 160,
  verticalAlternatingRailX: 460,
  cardWidth: 320,
  estimatedCardBlockSize: 340,
};

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeViewportOptions(
  viewport: TimelineViewportOptions | undefined,
) {
  const minZoom = viewport?.minZoom ?? timelineDefaultViewport.minZoom;
  const maxZoom = Math.max(
    minZoom,
    viewport?.maxZoom ?? timelineDefaultViewport.maxZoom,
  );
  const defaultZoom = clampNumber(
    viewport?.defaultZoom ?? timelineDefaultViewport.defaultZoom,
    minZoom,
    maxZoom,
  );

  return {
    defaultZoom,
    minZoom,
    maxZoom,
    controls: viewport?.controls ?? timelineDefaultViewport.controls,
    controlsVisibility:
      viewport?.controlsVisibility ??
      timelineDefaultViewport.controlsVisibility,
    chrome: viewport?.chrome ?? timelineDefaultViewport.chrome,
    wheelZoom: viewport?.wheelZoom ?? timelineDefaultViewport.wheelZoom,
  };
}

export function resolveTimelinePresentation(
  presentation: TimelinePresentation | undefined,
  mode: TimelineMode = "events",
  layout: TimelineLayout = "rail",
): TimelinePresentation {
  // Story styling always renders in normal document flow. `presentation="canvas"`
  // is intentionally not supported for story-styled timelines, so it is ignored.
  if (mode === "story" || layout === "story") {
    return "flow";
  }

  return presentation ?? "flow";
}

export function normalizeTimelineRevealOptions(
  options: TimelineRevealOptions | undefined,
): NormalizedTimelineRevealOptions {
  return {
    maxStagger: options?.interval === undefined ? 300 : undefined,
    trigger: options?.trigger ?? timelineDefaultRevealOptions.trigger,
    interval: Math.max(
      0,
      options?.interval ?? timelineDefaultRevealOptions.interval,
    ),
    duration: Math.max(
      0,
      options?.duration ?? timelineDefaultRevealOptions.duration,
    ),
    initialDelay: Math.max(
      0,
      options?.initialDelay ?? timelineDefaultRevealOptions.initialDelay,
    ),
  };
}

export function isTimelineRevealActive(
  reveal: TimelineRevealMode | undefined,
  presentation: TimelinePresentation,
): boolean {
  return reveal !== undefined && reveal !== "none" && presentation === "flow";
}

export function clampTimelineRevealCount(
  revealCount: number | undefined,
  total: number,
): number {
  const max = Math.max(0, total);

  if (revealCount === undefined) {
    return 0;
  }

  if (!Number.isFinite(revealCount)) {
    return max;
  }

  return clampNumber(Math.floor(revealCount), 0, max);
}

export function getTimelineRevealItemDelay({
  batchOrder,
  reveal,
  options,
}: {
  batchOrder: number;
  reveal: TimelineRevealMode;
  options: NormalizedTimelineRevealOptions;
}): number {
  if (reveal !== "stagger") {
    return options.initialDelay;
  }

  return (
    options.initialDelay +
    Math.min(
      options.maxStagger ?? Infinity,
      Math.max(0, batchOrder) * options.interval,
    )
  );
}

export function getTimelineRevealBatchDuration({
  batchSize,
  reveal,
  options,
}: {
  batchSize: number;
  reveal: TimelineRevealMode;
  options: NormalizedTimelineRevealOptions;
}): number {
  if (batchSize <= 0) {
    return 0;
  }

  if (reveal !== "stagger") {
    return options.initialDelay + options.duration;
  }

  return (
    options.initialDelay +
    Math.min(
      options.maxStagger ?? Infinity,
      Math.max(0, batchSize - 1) * options.interval,
    ) +
    options.duration
  );
}

export function getTimelineDateValue(
  datetime: TimelineItemBaseData["datetime"],
) {
  if (!datetime) {
    return undefined;
  }

  const date = datetime instanceof Date ? datetime : new Date(datetime);
  const value = date.getTime();

  return Number.isNaN(value) ? undefined : value;
}

export function getTimelineDatetimeAttribute(
  datetime: TimelineItemBaseData["datetime"],
) {
  if (!datetime) {
    return undefined;
  }

  if (datetime instanceof Date) {
    return Number.isNaN(datetime.getTime())
      ? undefined
      : datetime.toISOString();
  }

  return getTimelineDateValue(datetime) === undefined ? undefined : datetime;
}

export function resolveTimelineScale<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>(items: TimelineItemData<TPayload>[], scale: TimelineScale = "auto") {
  if (scale !== "auto") {
    return scale;
  }

  return items.length > 0 &&
    items.every((item) => getTimelineDateValue(item.datetime) !== undefined)
    ? "time"
    : "sequence";
}

function shouldSortByDate(mode: TimelineMode, scale: TimelineResolvedScale) {
  return (mode === "events" || mode === "story") && scale === "time";
}

function getTimelineCrossAxisPosition(
  orientation: TimelineOrientation,
  layout: TimelineLayout,
) {
  if (layout === "story") {
    return orientation === "horizontal"
      ? timelineGeometry.horizontalRailY
      : timelineGeometry.verticalRailX;
  }

  if (orientation === "horizontal") {
    return layout === "alternating"
      ? timelineGeometry.horizontalAlternatingRailY
      : timelineGeometry.horizontalRailY;
  }

  return layout === "alternating"
    ? timelineGeometry.verticalAlternatingRailX
    : timelineGeometry.verticalRailX;
}

function getRawAxisPosition<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>(
  item: TimelineItemData<TPayload>,
  index: number,
  allItems: TimelineItemData<TPayload>[],
  scale: TimelineResolvedScale,
  order: TimelineOrder,
) {
  if (scale === "sequence" || allItems.length <= 1) {
    return index * timelineGeometry.itemGap;
  }

  const values = allItems
    .map((candidate) => getTimelineDateValue(candidate.datetime))
    .filter((value): value is number => value !== undefined);

  if (values.length !== allItems.length) {
    return index * timelineGeometry.itemGap;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return index * timelineGeometry.itemGap;
  }

  const value = getTimelineDateValue(item.datetime) ?? min;
  const axisLength = (allItems.length - 1) * timelineGeometry.itemGap;
  const position = ((value - min) / (max - min)) * axisLength;

  return order === "desc" ? axisLength - position : position;
}

function getAxisPositions<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>(
  items: TimelineItemData<TPayload>[],
  scale: TimelineResolvedScale,
  order: TimelineOrder,
) {
  const rawPositions = items.map((item, index) =>
    getRawAxisPosition(item, index, items, scale, order),
  );

  return rawPositions.reduce<number[]>((positions, position, index) => {
    if (index === 0) {
      positions.push(position);
      return positions;
    }

    positions.push(
      Math.max(
        position,
        positions[index - 1] + timelineGeometry.minimumItemGap,
      ),
    );
    return positions;
  }, []);
}

function getTimelinePoint({
  axisPosition,
  orientation,
  layout,
}: {
  axisPosition: number;
  orientation: TimelineOrientation;
  layout: TimelineLayout;
}) {
  if (orientation === "horizontal") {
    return {
      x: timelineGeometry.startPadding + axisPosition,
      y: getTimelineCrossAxisPosition(orientation, layout),
    };
  }

  return {
    x: getTimelineCrossAxisPosition(orientation, layout),
    y: timelineGeometry.startPadding + axisPosition,
  };
}

export function normalizeTimelineItems<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>(
  items: TimelineItemData<TPayload>[],
  {
    mode = "events",
    orientation = "horizontal",
    layout = "rail",
    scale = "auto",
    order = "asc",
  }: NormalizeTimelineItemsOptions = {},
) {
  const resolvedScale = resolveTimelineScale(items, scale);
  const withOriginalIndex = items.map((item, originalIndex) => ({
    ...item,
    originalIndex,
  }));
  const sortedItems = shouldSortByDate(mode, resolvedScale)
    ? [...withOriginalIndex].sort((a, b) => {
        const aValue = getTimelineDateValue(a.datetime) ?? 0;
        const bValue = getTimelineDateValue(b.datetime) ?? 0;

        if (aValue === bValue) {
          return a.originalIndex - b.originalIndex;
        }

        return aValue - bValue;
      })
    : withOriginalIndex;
  const orderedItems =
    order === "desc" ? [...sortedItems].reverse() : sortedItems;
  const axisPositions = getAxisPositions(orderedItems, resolvedScale, order);

  return orderedItems.map((item, index): NormalizedTimelineItem<TPayload> => {
    const axisPosition = axisPositions[index];

    return {
      ...item,
      index,
      status: item.status ?? "neutral",
      datetimeAttribute: getTimelineDatetimeAttribute(item.datetime),
      dateValue: getTimelineDateValue(item.datetime),
      point: getTimelinePoint({ axisPosition, orientation, layout }),
    };
  });
}

export function getTimelineContentSize<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>(
  items: NormalizedTimelineItem<TPayload>[],
  orientation: TimelineOrientation,
  layout: TimelineLayout,
) {
  if (items.length === 0) {
    return {
      width: orientation === "horizontal" ? 640 : 520,
      height: orientation === "horizontal" ? 360 : 520,
    };
  }

  const maxX = Math.max(...items.map((item) => item.point.x));
  const maxY = Math.max(...items.map((item) => item.point.y));
  const minX = Math.min(...items.map((item) => item.point.x));
  const minY = Math.min(...items.map((item) => item.point.y));

  if (orientation === "horizontal") {
    const railY = getTimelineCrossAxisPosition(orientation, layout);
    const cardInset =
      timelineGeometry.cardWidth / 2 + timelineGeometry.startPadding / 2;
    const cardBlock =
      timelineGeometry.estimatedCardBlockSize +
      timelineGeometry.horizontalCardOffset;

    return {
      width: Math.ceil(maxX - Math.min(0, minX) + cardInset),
      height: Math.ceil(
        layout === "alternating"
          ? railY + cardBlock
          : railY + cardBlock + timelineGeometry.startPadding / 2,
      ),
    };
  }

  const cardInset =
    timelineGeometry.cardWidth +
    timelineGeometry.verticalCardOffset +
    timelineGeometry.startPadding;

  return {
    width: Math.ceil(maxX - Math.min(0, minX) + cardInset),
    height: Math.ceil(
      maxY -
        Math.min(0, minY) +
        timelineGeometry.estimatedCardBlockSize +
        timelineGeometry.startPadding / 2,
    ),
  };
}

export function getDefaultTimelineTransform(
  viewport?: TimelineViewportOptions,
): TimelineTransform {
  const options = normalizeViewportOptions(viewport);

  return { x: 0, y: 0, zoom: options.defaultZoom };
}

export function zoomTimelineTransform({
  transform,
  delta,
  minZoom,
  maxZoom,
  origin = { x: 0, y: 0 },
}: {
  transform: TimelineTransform;
  delta: number;
  minZoom: number;
  maxZoom: number;
  origin?: TimelinePoint;
}): TimelineTransform {
  const nextZoom = clampNumber(transform.zoom + delta, minZoom, maxZoom);
  const zoomRatio = nextZoom / transform.zoom;

  return {
    zoom: nextZoom,
    x: origin.x - (origin.x - transform.x) * zoomRatio,
    y: origin.y - (origin.y - transform.y) * zoomRatio,
  };
}

export function resetTimelineTransform(
  viewport?: TimelineViewportOptions,
): TimelineTransform {
  return getDefaultTimelineTransform(viewport);
}

export function fitTimelineTransform({
  contentSize,
  viewportSize,
  minZoom,
  maxZoom,
}: {
  contentSize: { width: number; height: number };
  viewportSize: { width: number; height: number };
  minZoom: number;
  maxZoom: number;
}): TimelineTransform {
  if (
    contentSize.width <= 0 ||
    contentSize.height <= 0 ||
    viewportSize.width <= 0 ||
    viewportSize.height <= 0
  ) {
    return { x: 0, y: 0, zoom: clampNumber(1, minZoom, maxZoom) };
  }

  const zoom = clampNumber(
    Math.min(
      viewportSize.width / contentSize.width,
      viewportSize.height / contentSize.height,
    ),
    minZoom,
    maxZoom,
  );

  return {
    zoom,
    x: (viewportSize.width - contentSize.width * zoom) / 2,
    y: (viewportSize.height - contentSize.height * zoom) / 2,
  };
}

export function centerTimelinePoint({
  point,
  viewportSize,
  zoom,
}: {
  point: TimelinePoint;
  viewportSize: { width: number; height: number };
  zoom: number;
}): TimelineTransform {
  return {
    zoom,
    x: viewportSize.width / 2 - point.x * zoom,
    y: viewportSize.height / 2 - point.y * zoom,
  };
}

export function getNextEnabledTimelineItemId(
  items: Array<Pick<NormalizedTimelineItem, "id" | "disabled">>,
  selectedId: string | null | undefined,
  direction: 1 | -1,
) {
  const enabledItems = items.filter((item) => !item.disabled);

  if (enabledItems.length === 0) {
    return null;
  }

  const currentIndex = enabledItems.findIndex((item) => item.id === selectedId);

  if (currentIndex === -1) {
    return direction === 1
      ? enabledItems[0].id
      : enabledItems[enabledItems.length - 1].id;
  }

  return enabledItems[
    clampNumber(currentIndex + direction, 0, enabledItems.length - 1)
  ].id;
}

export function getEdgeEnabledTimelineItemId(
  items: Array<Pick<NormalizedTimelineItem, "id" | "disabled">>,
  edge: "first" | "last",
) {
  const enabledItems = items.filter((item) => !item.disabled);

  if (enabledItems.length === 0) {
    return null;
  }

  return edge === "first"
    ? enabledItems[0].id
    : enabledItems[enabledItems.length - 1].id;
}
