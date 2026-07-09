import {
  forwardRef,
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
  optional: boolean;
  status: StepStatus;
  percentage: number;
}

export interface StepsProps<TData = unknown> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  items: StepItemData<TData>[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const rootClasses = "grid min-w-0 gap-[var(--dt-space-3)]";
const viewportClasses =
  "min-w-0 overflow-x-auto overscroll-x-contain pb-[var(--dt-space-2)]";
const listClasses = "flex min-w-max list-none items-start p-0";
const itemClasses = "relative flex min-w-36 flex-1 items-start";
const surfaceClasses =
  "relative z-[1] flex w-full min-w-0 flex-col items-center gap-[var(--dt-space-2)] px-[var(--dt-space-2)] text-center";
const indicatorClasses =
  "relative grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold shadow-sm";
const labelClasses = "max-w-40 text-sm font-medium leading-5 text-foreground";
const descriptionClasses = "max-w-44 text-xs leading-5 text-muted-foreground";
const optionalClasses =
  "rounded-full bg-muted px-[var(--dt-space-2)] py-[var(--dt-space-0-5)] text-[0.6875rem] font-medium text-muted-foreground";
const connectorClasses =
  "absolute start-1/2 top-4 h-0.5 w-full -translate-y-1/2 bg-border";

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

  return <span aria-hidden="true">{index + 1}</span>;
}

function StepsInner<TData>(
  {
    "aria-label": ariaLabel = "Progress steps",
    "aria-labelledby": ariaLabelledBy,
    className,
    defaultValue,
    items,
    value,
    ...props
  }: StepsProps<TData>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [uncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue ?? items[0]?.id;
  const currentIndex = items.findIndex((item) => item.id === currentValue);
  const count = items.length;

  return (
    <div
      {...props}
      ref={ref}
      data-slot="steps"
      data-orientation="horizontal"
      className={cn(rootClasses, className)}
    >
      <div data-slot="steps-viewport" className={viewportClasses}>
        {/* Flex/list-none can suppress native list semantics in Safari. */}
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ol
          aria-label={ariaLabelledBy ? undefined : ariaLabel}
          aria-labelledby={ariaLabelledBy}
          role="list"
          data-slot="steps-list"
          className={listClasses}
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
              optional: item.optional === true,
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
                className={itemClasses}
              >
                {index < count - 1 ? (
                  <span
                    aria-hidden="true"
                    data-slot="steps-connector"
                    data-complete={status === "complete" ? "true" : undefined}
                    className={cn(
                      connectorClasses,
                      status === "complete" ? "bg-success" : undefined,
                    )}
                  />
                ) : null}
                <div
                  aria-current={current ? "step" : undefined}
                  data-slot="steps-surface"
                  className={surfaceClasses}
                >
                  <span
                    aria-hidden="true"
                    data-slot="steps-indicator"
                    className={cn(
                      indicatorClasses,
                      indicatorStatusClasses[status],
                    )}
                  >
                    <DefaultIndicator
                      index={index}
                      item={item as StepItemData}
                      status={status}
                    />
                  </span>
                  <span data-slot="steps-label" className={labelClasses}>
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
                    <span
                      data-slot="steps-optional"
                      className={optionalClasses}
                    >
                      Optional
                    </span>
                  ) : null}
                  <span className="sr-only" data-slot="steps-status">
                    {statusLabels[state.status]}
                    {current && status !== "current" ? ", current step" : ""}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

type StepsComponent = <TData = unknown>(
  props: StepsProps<TData> & RefAttributes<HTMLDivElement>,
) => ReactElement | null;

export const Steps = forwardRef(StepsInner) as StepsComponent;
