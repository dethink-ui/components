import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { cn } from "../../utils/cn";

export type StepStatus =
  "complete" | "current" | "upcoming" | "error" | "skipped";

export type StepsOrientation = "horizontal" | "vertical";
export type StepsSize = "sm" | "md" | "lg";
export type StepsMotionPreset = "none" | "subtle" | "standard" | "expressive";

export interface StepItemData<TData = unknown> {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  optional?: boolean;
  status?: Exclude<StepStatus, "current">;
  data?: TData;
}

export interface StepRenderState {
  index: number;
  count: number;
  current: boolean;
  disabled: boolean;
  interactive: boolean;
  optional: boolean;
  orientation: StepsOrientation;
  size: StepsSize;
  status: StepStatus;
  percentage: number;
}

export interface StepsProps<TData = unknown> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  items: StepItemData<TData>[];
  interactive?: boolean;
  orientation?: StepsOrientation;
  size?: StepsSize;
  showProgress?: boolean;
  progressValue?: number;
  formatProgress?: (
    percentage: number,
    context: {
      count: number;
      currentIndex: number;
      currentValue: string | undefined;
    },
  ) => ReactNode;
  renderItem?: (item: StepItemData<TData>, state: StepRenderState) => ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const rootClasses = "grid min-w-0 gap-[var(--dt-space-3)]";
const horizontalViewportClasses =
  "min-w-0 overflow-x-auto overscroll-x-contain pb-[var(--dt-space-2)]";
const verticalViewportClasses = "min-w-0 overflow-visible";
const listBaseClasses = "flex list-none p-0";
const listOrientationClasses: Record<StepsOrientation, string> = {
  horizontal: "min-w-max items-start",
  vertical: "min-w-0 flex-col items-stretch",
};
const itemBaseClasses = "relative flex flex-1 items-start";
const itemOrientationClasses: Record<StepsOrientation, string> = {
  horizontal: "min-w-36",
  vertical: "w-full min-w-0 pb-[var(--dt-space-5)] last:pb-0",
};
const surfaceClasses =
  "relative z-[1] flex w-full min-w-0 gap-[var(--dt-space-2)]";
const surfaceOrientationClasses: Record<StepsOrientation, string> = {
  horizontal: "flex-col items-center px-[var(--dt-space-2)] text-center",
  vertical: "flex-row items-start px-0 text-start",
};
const interactiveSurfaceClasses =
  "rounded-lg outline-none motion-safe:transition-[background-color,color,box-shadow,transform] motion-safe:duration-150 motion-safe:ease-out hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";
const indicatorClasses =
  "relative grid shrink-0 place-items-center rounded-full border font-semibold shadow-sm contrast-more:border-foreground";
const indicatorSizeClasses: Record<StepsSize, string> = {
  sm: "size-7 text-[0.6875rem]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
};
const bodyOrientationClasses: Record<StepsOrientation, string> = {
  horizontal: "flex max-w-44 flex-col items-center gap-1",
  vertical: "flex min-w-0 flex-1 flex-col items-start gap-1 pt-0.5",
};
const labelSizeClasses: Record<StepsSize, string> = {
  sm: "text-xs leading-4",
  md: "text-sm leading-5",
  lg: "text-base leading-6",
};
const labelClasses = "font-medium text-foreground";
const descriptionClasses = "text-xs leading-5 text-muted-foreground";
const optionalClasses =
  "rounded-full bg-muted px-[var(--dt-space-2)] py-[var(--dt-space-0-5)] text-[0.6875rem] font-medium text-muted-foreground";
const connectorBaseClasses = "absolute bg-border";
const horizontalConnectorSizeClasses: Record<StepsSize, string> = {
  sm: "start-1/2 top-3.5 h-0.5 w-full -translate-y-1/2",
  md: "start-1/2 top-4 h-0.5 w-full -translate-y-1/2",
  lg: "start-1/2 top-5 h-0.5 w-full -translate-y-1/2",
};
const verticalConnectorSizeClasses: Record<StepsSize, string> = {
  sm: "bottom-0 start-3.5 top-7 w-0.5 -translate-x-1/2 rtl:translate-x-1/2",
  md: "bottom-0 start-4 top-8 w-0.5 -translate-x-1/2 rtl:translate-x-1/2",
  lg: "bottom-0 start-5 top-10 w-0.5 -translate-x-1/2 rtl:translate-x-1/2",
};
const progressClasses =
  "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--dt-space-3)]";
const progressTrackClasses =
  "block h-2 min-w-0 overflow-hidden rounded-full bg-muted";
const progressIndicatorClasses =
  "block h-full origin-left rounded-full bg-primary rtl:origin-right";
const progressValueClasses =
  "min-w-10 text-end text-xs font-medium tabular-nums text-muted-foreground";

const indicatorStatusClasses: Record<StepStatus, string> = {
  complete:
    "border-success bg-success text-success-foreground ring-2 ring-success/15 ring-offset-2 ring-offset-background",
  current:
    "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15 ring-offset-2 ring-offset-background",
  upcoming: "border-border bg-background text-muted-foreground",
  error:
    "border-destructive bg-destructive text-destructive-foreground ring-2 ring-destructive/15 ring-offset-2 ring-offset-background",
  skipped: "border-border bg-muted text-muted-foreground",
};

const statusLabels: Record<StepStatus, string> = {
  complete: "Complete",
  current: "Current step",
  upcoming: "Upcoming",
  error: "Error",
  skipped: "Skipped",
};

function getResolvedStatus({
  currentIndex,
  index,
  override,
}: {
  currentIndex: number;
  index: number;
  override?: Exclude<StepStatus, "current">;
}): StepStatus {
  if (override) {
    return override;
  }

  if (index === currentIndex) {
    return "current";
  }

  if (currentIndex >= 0 && index < currentIndex) {
    return "complete";
  }

  return "upcoming";
}

function getDuplicateStepIds<TData>(items: StepItemData<TData>[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }

    seen.add(item.id);
  }

  return [...duplicates];
}

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 100);
}

function defaultFormatProgress(percentage: number) {
  return `${Math.round(percentage)}%`;
}

function CompleteIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  );
}

function DefaultIndicator({
  index,
  item,
  status,
}: {
  index: number;
  item: StepItemData;
  status: StepStatus;
}) {
  if (item.icon !== undefined) {
    return <span aria-hidden="true">{item.icon}</span>;
  }

  if (status === "complete") {
    return <CompleteIcon />;
  }

  if (status === "error") {
    return <span aria-hidden="true">!</span>;
  }

  if (status === "skipped") {
    return <span aria-hidden="true">–</span>;
  }

  return <span aria-hidden="true">{index + 1}</span>;
}

function StepsInner<TData>(
  {
    "aria-label": ariaLabel = "Progress steps",
    "aria-labelledby": ariaLabelledBy,
    className,
    defaultValue,
    formatProgress = defaultFormatProgress,
    interactive = false,
    items,
    onValueChange,
    orientation = "horizontal",
    progressValue,
    renderItem,
    showProgress = false,
    size = "md",
    value,
    ...props
  }: StepsProps<TData>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const controlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue ?? items[0]?.id;
  const currentIndex = items.findIndex((item) => item.id === currentValue);
  const count = items.length;
  const duplicateIds = useMemo(() => getDuplicateStepIds(items), [items]);
  const duplicateIdSignature = duplicateIds.join(",");
  const derivedProgress =
    currentIndex >= 0 && count > 0 ? ((currentIndex + 1) / count) * 100 : 0;
  const resolvedProgress = clampPercentage(progressValue ?? derivedProgress);
  const progressText = formatProgress(resolvedProgress, {
    count,
    currentIndex,
    currentValue,
  });
  const progressValueText =
    typeof progressText === "string" || typeof progressText === "number"
      ? String(progressText)
      : undefined;
  const progressLabel =
    typeof ariaLabel === "string" ? `${ariaLabel} progress` : "Step progress";

  useEffect(() => {
    if (duplicateIds.length > 0) {
      console.warn(
        `[Steps] items must use stable unique ids. Duplicate ids: ${duplicateIds.join(", ")}.`,
      );
    }
  }, [duplicateIdSignature, duplicateIds]);

  useEffect(() => {
    if (currentValue !== undefined && count > 0 && currentIndex === -1) {
      console.warn(
        `[Steps] current value "${currentValue}" is not present in items. Removing the current step is unsupported; keep it in the active branch until navigation changes.`,
      );
    }
  }, [count, currentIndex, currentValue]);

  const selectValue = (nextValue: string, disabled: boolean) => {
    if (!interactive || disabled || nextValue === currentValue) {
      return;
    }

    if (!controlled) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  return (
    <div
      {...props}
      ref={ref}
      data-slot="steps"
      data-interactive={interactive ? "true" : undefined}
      data-orientation={orientation}
      data-size={size}
      className={cn(rootClasses, className)}
    >
      {showProgress ? (
        <div
          role="progressbar"
          aria-label={progressLabel}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={resolvedProgress}
          aria-valuetext={progressValueText}
          data-slot="steps-progress"
          className={progressClasses}
        >
          <span
            aria-hidden="true"
            data-slot="steps-progress-track"
            className={progressTrackClasses}
          >
            <span
              data-slot="steps-progress-indicator"
              className={progressIndicatorClasses}
              style={{ transform: `scaleX(${resolvedProgress / 100})` }}
            />
          </span>
          <span
            data-slot="steps-progress-value"
            className={progressValueClasses}
          >
            {progressText}
          </span>
        </div>
      ) : null}
      <div
        data-slot="steps-viewport"
        className={
          orientation === "horizontal"
            ? horizontalViewportClasses
            : verticalViewportClasses
        }
      >
        {/* Flex/list-none can suppress native list semantics in Safari. */}
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ol
          aria-label={ariaLabelledBy ? undefined : ariaLabel}
          aria-labelledby={ariaLabelledBy}
          role="list"
          data-slot="steps-list"
          data-orientation={orientation}
          className={cn(listBaseClasses, listOrientationClasses[orientation])}
        >
          {items.map((item, index) => {
            const current = item.id === currentValue;
            const status = getResolvedStatus({
              currentIndex,
              index,
              override: item.status,
            });
            const percentage = count === 0 ? 0 : ((index + 1) / count) * 100;
            const state: StepRenderState = {
              index,
              count,
              current,
              disabled: item.disabled === true,
              interactive,
              optional: item.optional === true,
              orientation,
              size,
              status,
              percentage,
            };

            return (
              <li
                key={item.id}
                data-slot="steps-item"
                data-current={current ? "true" : undefined}
                data-disabled={item.disabled ? "true" : undefined}
                data-optional={item.optional ? "true" : undefined}
                data-status={status}
                className={cn(
                  itemBaseClasses,
                  itemOrientationClasses[orientation],
                )}
              >
                {index < count - 1 ? (
                  <span
                    aria-hidden="true"
                    data-slot="steps-connector"
                    data-complete={status === "complete" ? "true" : undefined}
                    className={cn(
                      connectorBaseClasses,
                      orientation === "horizontal"
                        ? horizontalConnectorSizeClasses[size]
                        : verticalConnectorSizeClasses[size],
                      status === "complete" ? "bg-success" : undefined,
                    )}
                  />
                ) : null}
                {interactive ? (
                  <button
                    type="button"
                    aria-current={current ? "step" : undefined}
                    data-slot="steps-surface"
                    disabled={item.disabled}
                    className={cn(
                      surfaceClasses,
                      surfaceOrientationClasses[orientation],
                      interactiveSurfaceClasses,
                    )}
                    onClick={() => selectValue(item.id, item.disabled === true)}
                  >
                    <StepContent
                      index={index}
                      item={item}
                      renderItem={renderItem}
                      state={state}
                    />
                  </button>
                ) : (
                  <div
                    aria-current={current ? "step" : undefined}
                    data-slot="steps-surface"
                    className={cn(
                      surfaceClasses,
                      surfaceOrientationClasses[orientation],
                    )}
                  >
                    <StepContent
                      index={index}
                      item={item}
                      renderItem={renderItem}
                      state={state}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function StepContent<TData>({
  index,
  item,
  renderItem,
  state,
}: {
  index: number;
  item: StepItemData<TData>;
  renderItem?: (item: StepItemData<TData>, state: StepRenderState) => ReactNode;
  state: StepRenderState;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        data-slot="steps-indicator"
        className={cn(
          indicatorClasses,
          indicatorSizeClasses[state.size],
          indicatorStatusClasses[state.status],
        )}
      >
        <DefaultIndicator index={index} item={item} status={state.status} />
      </span>
      <span
        data-slot="steps-body"
        className={bodyOrientationClasses[state.orientation]}
      >
        {renderItem ? (
          renderItem(item, state)
        ) : (
          <>
            <span
              data-slot="steps-label"
              className={cn(labelClasses, labelSizeClasses[state.size])}
            >
              {item.label}
            </span>
            {item.description ? (
              <span
                data-slot="steps-description"
                className={descriptionClasses}
              >
                {item.description}
              </span>
            ) : null}
            {item.optional ? (
              <span data-slot="steps-optional" className={optionalClasses}>
                Optional
              </span>
            ) : null}
          </>
        )}
      </span>
      <span className="sr-only" data-slot="steps-status">
        {statusLabels[state.status]}
        {state.current && state.status !== "current" ? ", current step" : ""}
      </span>
    </>
  );
}

type StepsComponent = <TData = unknown>(
  props: StepsProps<TData> & RefAttributes<HTMLDivElement>,
) => ReactElement | null;

export const Steps = forwardRef(StepsInner) as StepsComponent;
