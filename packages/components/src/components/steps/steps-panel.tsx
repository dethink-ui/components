import {
  Fragment,
  forwardRef,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { cn } from "../../utils/cn";
import { useSteps } from "./steps-state";
import type { StepItemData } from "./steps";

export interface StepsPanelRenderContext<TData = unknown> {
  step: StepItemData<TData>;
  index: number;
  count: number;
  value: string;
}

export interface StepsPanelProps<TData = unknown> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  fallback?: ReactNode;
  render: (context: StepsPanelRenderContext<TData>) => ReactNode;
}

function StepsPanelInner<TData>(
  { className, fallback = null, render, ...props }: StepsPanelProps<TData>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { count, currentIndex, currentStep, value } = useSteps<TData>();

  return (
    <div
      {...props}
      ref={ref}
      data-slot="steps-panel"
      data-step-value={currentStep?.id}
      className={cn("min-w-0", className)}
    >
      {currentStep && value !== undefined ? (
        <Fragment key={currentStep.id}>
          {render({
            count,
            index: currentIndex,
            step: currentStep,
            value,
          })}
        </Fragment>
      ) : (
        fallback
      )}
    </div>
  );
}

type StepsPanelComponent = <TData = unknown>(
  props: StepsPanelProps<TData> & RefAttributes<HTMLDivElement>,
) => ReactElement | null;

export const StepsPanel = forwardRef(StepsPanelInner) as StepsPanelComponent;
