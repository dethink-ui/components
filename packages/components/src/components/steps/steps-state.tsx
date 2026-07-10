import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StepItemData, StepsProps } from "./steps";

export interface UseStepsStateOptions<TData = unknown> {
  items?: StepItemData<TData>[];
  defaultItems?: StepItemData<TData>[];
  value?: string;
  defaultValue?: string;
  onItemsChange?: (items: StepItemData<TData>[]) => void;
  onValueChange?: (value: string) => void;
  progressValue?: number;
}

export interface StepsIndicatorProps<TData = unknown> {
  items: StepItemData<TData>[];
  value: string | undefined;
  onValueChange: NonNullable<StepsProps<TData>["onValueChange"]>;
  progressValue: number;
}

export interface StepsCurrentState<TData = unknown> {
  currentStep: StepItemData<TData> | undefined;
  currentIndex: number;
  value: string | undefined;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface StepsNextState<TData = unknown> {
  nextSteps: StepItemData<TData>[];
  addNextStep: (step: StepItemData<TData>) => boolean;
  insertNextStep: (index: number, step: StepItemData<TData>) => boolean;
  removeNextStep: (id: string) => boolean;
  replaceNextSteps: (steps: StepItemData<TData>[]) => boolean;
  clearNextSteps: () => boolean;
}

export interface StepsState<TData = unknown>
  extends StepsCurrentState<TData>, StepsNextState<TData> {
  items: StepItemData<TData>[];
  count: number;
  progress: number;
  setValue: (value: string) => boolean;
  stepsProps: StepsIndicatorProps<TData>;
}

export interface StepsProviderProps<TData = unknown> {
  children: ReactNode;
  state: StepsState<TData>;
}

const StepsStateContext = createContext<StepsState<unknown> | null>(null);

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 100);
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

function warn(message: string) {
  const nodeEnvironment = (
    globalThis as typeof globalThis & {
      process?: { env?: { NODE_ENV?: string } };
    }
  ).process?.env?.NODE_ENV;

  if (nodeEnvironment !== "production") {
    console.warn(`[Steps] ${message}`);
  }
}

export function useStepsState<TData = unknown>({
  defaultItems = [],
  defaultValue,
  items,
  onItemsChange,
  onValueChange,
  progressValue,
  value,
}: UseStepsStateOptions<TData> = {}): StepsState<TData> {
  const itemsControlled = items !== undefined;
  const valueControlled = value !== undefined;
  const initialItems = items ?? defaultItems;
  const [uncontrolledItems, setUncontrolledItems] =
    useState<StepItemData<TData>[]>(defaultItems);
  const [uncontrolledValue, setUncontrolledValue] = useState(
    () => defaultValue ?? initialItems[0]?.id,
  );
  const resolvedItems = items ?? uncontrolledItems;
  const resolvedValue = value ?? uncontrolledValue;
  const mutationSnapshotRef = useRef({
    actualItems: resolvedItems,
    actualValue: resolvedValue,
    items: resolvedItems,
    value: resolvedValue,
  });
  const getMutationSnapshot = useCallback(() => {
    const snapshot = mutationSnapshotRef.current;

    if (
      snapshot.actualItems === resolvedItems &&
      snapshot.actualValue === resolvedValue
    ) {
      return snapshot;
    }

    const nextSnapshot = {
      actualItems: resolvedItems,
      actualValue: resolvedValue,
      items: resolvedItems,
      value: resolvedValue,
    };
    mutationSnapshotRef.current = nextSnapshot;
    return nextSnapshot;
  }, [resolvedItems, resolvedValue]);
  const currentIndex = resolvedItems.findIndex(
    (item) => item.id === resolvedValue,
  );
  const currentStep =
    currentIndex >= 0 ? resolvedItems[currentIndex] : undefined;
  const count = resolvedItems.length;
  const duplicateIds = useMemo(
    () => getDuplicateStepIds(resolvedItems),
    [resolvedItems],
  );
  const duplicateIdSignature = duplicateIds.join(",");
  const derivedProgress =
    currentIndex >= 0 && count > 0 ? ((currentIndex + 1) / count) * 100 : 0;
  const progress = clampPercentage(progressValue ?? derivedProgress);
  const nextSteps = useMemo(
    () => (currentIndex >= 0 ? resolvedItems.slice(currentIndex + 1) : []),
    [currentIndex, resolvedItems],
  );

  // Accepted calls compose until React commits the consumer's actual state.
  useEffect(() => {
    mutationSnapshotRef.current = {
      actualItems: resolvedItems,
      actualValue: resolvedValue,
      items: resolvedItems,
      value: resolvedValue,
    };
  });

  useEffect(() => {
    if (duplicateIds.length > 0) {
      warn(
        `items must use stable unique ids. Duplicate ids: ${duplicateIds.join(", ")}.`,
      );
    }
  }, [duplicateIdSignature, duplicateIds]);

  useEffect(() => {
    if (resolvedValue !== undefined && count > 0 && currentIndex < 0) {
      warn(
        `current value "${resolvedValue}" is not present in items. Removing the current step is unsupported; keep it in the active branch until navigation changes.`,
      );
    }
  }, [count, currentIndex, resolvedValue]);

  const commitItems = useCallback(
    (nextItems: StepItemData<TData>[]) => {
      const duplicateIds = getDuplicateStepIds(nextItems);

      if (duplicateIds.length > 0) {
        warn(
          `items must use stable unique ids. Duplicate ids: ${duplicateIds.join(", ")}.`,
        );
        return false;
      }

      const snapshot = getMutationSnapshot();
      const currentValue = snapshot.value;

      if (
        currentValue !== undefined &&
        !nextItems.some((item) => item.id === currentValue)
      ) {
        warn(
          `cannot remove the current step "${currentValue}". Change the current value before replacing its branch.`,
        );
        return false;
      }

      mutationSnapshotRef.current = { ...snapshot, items: nextItems };

      if (!itemsControlled) {
        setUncontrolledItems(nextItems);
      }

      onItemsChange?.(nextItems);
      return true;
    },
    [getMutationSnapshot, itemsControlled, onItemsChange],
  );

  const setValue = useCallback(
    (nextValue: string) => {
      const snapshot = getMutationSnapshot();
      const nextStep = snapshot.items.find((item) => item.id === nextValue);

      if (!nextStep) {
        warn(`cannot select unknown step "${nextValue}".`);
        return false;
      }

      if (nextStep.disabled) {
        return false;
      }

      if (nextValue === snapshot.value) {
        return false;
      }

      mutationSnapshotRef.current = { ...snapshot, value: nextValue };

      if (!valueControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
      return true;
    },
    [getMutationSnapshot, onValueChange, valueControlled],
  );

  const replaceNextSteps = useCallback(
    (steps: StepItemData<TData>[]) => {
      const snapshot = getMutationSnapshot();
      const currentItems = snapshot.items;
      const currentSnapshotIndex = currentItems.findIndex(
        (item) => item.id === snapshot.value,
      );

      if (currentSnapshotIndex < 0) {
        warn(
          "cannot change future steps because the current value is not present in items.",
        );
        return false;
      }

      return commitItems([
        ...currentItems.slice(0, currentSnapshotIndex + 1),
        ...steps,
      ]);
    },
    [commitItems, getMutationSnapshot],
  );

  const addNextStep = useCallback(
    (step: StepItemData<TData>) => {
      const snapshot = getMutationSnapshot();
      const currentItems = snapshot.items;
      const currentSnapshotIndex = currentItems.findIndex(
        (item) => item.id === snapshot.value,
      );
      const currentNextSteps =
        currentSnapshotIndex >= 0
          ? currentItems.slice(currentSnapshotIndex + 1)
          : [];

      return replaceNextSteps([...currentNextSteps, step]);
    },
    [getMutationSnapshot, replaceNextSteps],
  );

  const insertNextStep = useCallback(
    (index: number, step: StepItemData<TData>) => {
      const snapshot = getMutationSnapshot();
      const currentItems = snapshot.items;
      const currentSnapshotIndex = currentItems.findIndex(
        (item) => item.id === snapshot.value,
      );
      const currentNextSteps =
        currentSnapshotIndex >= 0
          ? currentItems.slice(currentSnapshotIndex + 1)
          : [];

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index > currentNextSteps.length
      ) {
        warn(
          `future step index ${index} is outside the valid range 0-${currentNextSteps.length}.`,
        );
        return false;
      }

      const updatedNextSteps = [...currentNextSteps];
      updatedNextSteps.splice(index, 0, step);
      return replaceNextSteps(updatedNextSteps);
    },
    [getMutationSnapshot, replaceNextSteps],
  );

  const removeNextStep = useCallback(
    (id: string) => {
      const snapshot = getMutationSnapshot();
      const currentItems = snapshot.items;
      const currentSnapshotIndex = currentItems.findIndex(
        (item) => item.id === snapshot.value,
      );
      const currentNextSteps =
        currentSnapshotIndex >= 0
          ? currentItems.slice(currentSnapshotIndex + 1)
          : [];
      const nextIndex = currentNextSteps.findIndex((step) => step.id === id);

      if (nextIndex < 0) {
        warn(`cannot remove "${id}" because it is not a future step.`);
        return false;
      }

      return replaceNextSteps(
        currentNextSteps.filter((step) => step.id !== id),
      );
    },
    [getMutationSnapshot, replaceNextSteps],
  );

  const clearNextSteps = useCallback(
    () => replaceNextSteps([]),
    [replaceNextSteps],
  );

  const onStepsValueChange = useCallback(
    (nextValue: string) => {
      setValue(nextValue);
    },
    [setValue],
  );

  const stepsProps = useMemo<StepsIndicatorProps<TData>>(
    () => ({
      items: resolvedItems,
      onValueChange: onStepsValueChange,
      progressValue: progress,
      value: resolvedValue,
    }),
    [onStepsValueChange, progress, resolvedItems, resolvedValue],
  );

  return useMemo(
    () => ({
      addNextStep,
      clearNextSteps,
      count,
      currentIndex,
      currentStep,
      insertNextStep,
      isFirstStep: currentIndex === 0,
      isLastStep: currentIndex >= 0 && currentIndex === count - 1,
      items: resolvedItems,
      nextSteps,
      progress,
      removeNextStep,
      replaceNextSteps,
      setValue,
      stepsProps,
      value: resolvedValue,
    }),
    [
      addNextStep,
      clearNextSteps,
      count,
      currentIndex,
      currentStep,
      insertNextStep,
      nextSteps,
      progress,
      removeNextStep,
      replaceNextSteps,
      resolvedItems,
      resolvedValue,
      setValue,
      stepsProps,
    ],
  );
}

export function StepsProvider<TData = unknown>({
  children,
  state,
}: StepsProviderProps<TData>) {
  return (
    <StepsStateContext.Provider value={state as unknown as StepsState<unknown>}>
      {children}
    </StepsStateContext.Provider>
  );
}

export function useSteps<TData = unknown>() {
  const state = useContext(StepsStateContext);

  if (!state) {
    throw new Error("useSteps must be used within a StepsProvider.");
  }

  return state as StepsState<TData>;
}

export function useCurrentStep<TData = unknown>(): StepsCurrentState<TData> {
  const { currentIndex, currentStep, isFirstStep, isLastStep, value } =
    useSteps<TData>();

  return useMemo(
    () => ({
      currentIndex,
      currentStep,
      isFirstStep,
      isLastStep,
      value,
    }),
    [currentIndex, currentStep, isFirstStep, isLastStep, value],
  );
}

export function useNextSteps<TData = unknown>(): StepsNextState<TData> {
  const {
    addNextStep,
    clearNextSteps,
    insertNextStep,
    nextSteps,
    removeNextStep,
    replaceNextSteps,
  } = useSteps<TData>();

  return useMemo(
    () => ({
      addNextStep,
      clearNextSteps,
      insertNextStep,
      nextSteps,
      removeNextStep,
      replaceNextSteps,
    }),
    [
      addNextStep,
      clearNextSteps,
      insertNextStep,
      nextSteps,
      removeNextStep,
      replaceNextSteps,
    ],
  );
}
