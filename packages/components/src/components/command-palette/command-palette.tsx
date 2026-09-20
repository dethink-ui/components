import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ChangeEventHandler,
  type FocusEventHandler,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion as motionElement,
  useIsPresent,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  dialogContentClassNames,
  dialogOverlayClassNames,
  dialogTriggerClassNames,
  type DialogContentProps,
  type DialogProps,
  type DialogTriggerProps,
} from "../dialog";
import { cn } from "../../utils/cn";

export type CommandPaletteValue = string;
export type CommandPaletteControlSize = "sm" | "md" | "lg";
export type CommandPaletteCommandType =
  "action" | "link" | "page" | "separator";
export type CommandPaletteMotionPreset =
  "none" | "subtle" | "standard" | "expressive";
export type CommandPalettePageDirection = "back" | "forward" | "none";
export type CommandPalettePageStackChangeReason = "back" | "push" | "reset";
export type CommandPaletteCommandSource =
  "base" | "recent" | "suggested" | "async" | "page" | (string & {});

export interface CommandPaletteCommandRunContext {
  close?: () => void;
  closeOnRun: boolean;
  page: CommandPaletteValue | undefined;
  pageStack: CommandPaletteValue[];
  query: string;
  source: CommandPaletteCommandSource | undefined;
}

export interface CommandPaletteCommand {
  action?: (
    command: CommandPaletteCommand,
    context: CommandPaletteCommandRunContext,
  ) => void;
  aliases?: string[];
  closeOnRun?: boolean;
  description?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: ReactNode;
  group?: string;
  href?: string;
  icon?: ReactNode;
  key: CommandPaletteValue;
  keywords?: string[];
  label: ReactNode;
  metadata?: Record<string, unknown>;
  page?: string;
  priority?: number;
  rel?: string;
  shortcut?: ReactNode;
  source?: CommandPaletteCommandSource;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  textValue?: string;
  type?: CommandPaletteCommandType;
}

export type CommandPaletteFilter = (
  command: CommandPaletteCommand,
  query: string,
) => boolean;

export type CommandPaletteSort = (
  a: CommandPaletteCommand,
  b: CommandPaletteCommand,
  query: string,
) => number;

export interface CommandPalettePageDefinition {
  asyncCommands?: CommandPaletteCommand[];
  commands?: CommandPaletteCommand[];
  description?: ReactNode;
  emptyMessage?: ReactNode;
  error?: ReactNode;
  filter?: CommandPaletteFilter;
  id: CommandPaletteValue;
  limit?: number;
  loading?: boolean;
  loadingMessage?: ReactNode;
  minimumQueryLength?: number;
  minimumQueryMessage?: ReactNode;
  onRetry?: () => void;
  recentCommands?: CommandPaletteCommand[];
  retryLabel?: ReactNode;
  shouldFilter?: boolean;
  sort?: CommandPaletteSort;
  stale?: boolean;
  staleMessage?: ReactNode;
  suggestedCommands?: CommandPaletteCommand[];
  title: ReactNode;
}

export interface CommandPalettePageStackChangeContext {
  activePage: CommandPaletteValue | undefined;
  direction: CommandPalettePageDirection;
  previousPage: CommandPaletteValue | undefined;
  reason: CommandPalettePageStackChangeReason;
}

export interface CommandPaletteProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onSelect"
> {
  announcements?: boolean;
  asyncCommands?: CommandPaletteCommand[];
  children?: ReactNode | ((command: CommandPaletteCommand) => ReactNode);
  clearQueryOnPageChange?: boolean;
  closeOnRun?: boolean;
  commands?: CommandPaletteCommand[];
  controlSize?: CommandPaletteControlSize;
  defaultPageStack?: CommandPaletteValue[];
  defaultQuery?: string;
  defaultSelectedKey?: CommandPaletteValue | null;
  description?: ReactNode;
  emptyMessage?: ReactNode;
  error?: ReactNode;
  filter?: CommandPaletteFilter;
  label?: ReactNode;
  limit?: number;
  loading?: boolean;
  loadingMessage?: ReactNode;
  minimumQueryLength?: number;
  minimumQueryMessage?: ReactNode;
  motionPreset?: CommandPaletteMotionPreset;
  onCommandRun?: (
    command: CommandPaletteCommand,
    context: CommandPaletteCommandRunContext,
  ) => void;
  onPageStackChange?: (
    pageStack: CommandPaletteValue[],
    context: CommandPalettePageStackChangeContext,
  ) => void;
  onQueryChange?: (query: string) => void;
  onRetry?: () => void;
  onSelectedKeyChange?: (key: CommandPaletteValue | null) => void;
  pageBackLabel?: ReactNode;
  pageStack?: CommandPaletteValue[];
  pages?: CommandPalettePageDefinition[];
  placeholder?: string;
  query?: string;
  recentCommands?: CommandPaletteCommand[];
  reducedMotion?: boolean;
  retryLabel?: ReactNode;
  selectedKey?: CommandPaletteValue | null;
  shouldFilter?: boolean;
  sort?: CommandPaletteSort;
  stale?: boolean;
  staleMessage?: ReactNode;
  suggestedCommands?: CommandPaletteCommand[];
}

export interface CommandPaletteInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  controlSize?: CommandPaletteControlSize;
}

export interface CommandPaletteDialogProps extends Omit<
  DialogProps,
  "children"
> {
  children?: ReactNode;
  closeOnRun?: boolean;
  motionPreset?: CommandPaletteMotionPreset;
  reducedMotion?: boolean;
}

export interface CommandPaletteTriggerProps extends DialogTriggerProps {}

export interface CommandPaletteContentProps extends Omit<
  DialogContentProps,
  "children"
> {
  children?: DialogContentProps["children"];
  closeOnRun?: boolean;
  description?: ReactNode;
  motionPreset?: CommandPaletteMotionPreset;
  reducedMotion?: boolean;
  title?: ReactNode;
  titleVisuallyHidden?: boolean;
}

export interface CommandPaletteListProps extends HTMLAttributes<HTMLDivElement> {}

export interface CommandPaletteGroupProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  heading?: ReactNode;
}

type CommandPaletteItemBaseProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onSelect"
> & {
  asChild?: boolean;
  children?: ReactNode;
  command?: CommandPaletteCommand;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: ReactNode;
  href?: string;
  icon?: ReactNode;
  onAction?: (
    command: CommandPaletteCommand,
    context: CommandPaletteCommandRunContext,
  ) => void;
  page?: CommandPaletteValue;
  rel?: string;
  shortcut?: ReactNode;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  value: CommandPaletteValue;
};

export type CommandPaletteItemProps = CommandPaletteItemBaseProps;

export interface CommandPaletteItemIconProps extends HTMLAttributes<HTMLSpanElement> {}

export interface CommandPaletteItemLabelProps extends HTMLAttributes<HTMLSpanElement> {}

export interface CommandPaletteItemDescriptionProps extends HTMLAttributes<HTMLSpanElement> {}

export interface CommandPaletteItemShortcutProps extends HTMLAttributes<HTMLElement> {}

export interface CommandPaletteSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export interface CommandPaletteEmptyProps extends HTMLAttributes<HTMLDivElement> {}

export interface CommandPaletteStatusProps extends HTMLAttributes<HTMLDivElement> {}

export interface CommandPaletteLoadingProps extends HTMLAttributes<HTMLDivElement> {}

export interface CommandPaletteErrorProps extends HTMLAttributes<HTMLDivElement> {}

export interface CommandPaletteRetryProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export interface CommandPaletteAnnouncerProps extends HTMLAttributes<HTMLDivElement> {}

export interface CommandPalettePageStackProps extends HTMLAttributes<HTMLDivElement> {
  "data-page"?: CommandPaletteValue;
  "data-page-depth"?: number | string;
  "data-page-direction"?: CommandPalettePageDirection;
}

export interface CommandPalettePageProps extends HTMLAttributes<HTMLElement> {
  "data-page"?: CommandPaletteValue;
  "data-page-depth"?: number | string;
  "data-page-direction"?: CommandPalettePageDirection;
}

export interface CommandPalettePageHeaderProps extends HTMLAttributes<HTMLElement> {}

export interface CommandPalettePageBackProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

type CommandPaletteItemSlotProps = Record<string, unknown> & {
  "aria-disabled"?: boolean | "false" | "true";
  children?: ReactNode;
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
};

interface CommandPaletteContextValue {
  activeCommand: CommandPaletteCommand | null;
  controlSize: CommandPaletteControlSize;
  inputAriaLabel: string | undefined;
  inputId: string;
  labelId: string | undefined;
  motionEnabled: boolean;
  motionPreset: CommandPaletteMotionPreset;
  reducedMotion: boolean;
  selectedIndicatorLayoutId: string;
  onInputKeyDown: KeyboardEventHandler<HTMLInputElement>;
  page: CommandPaletteValue | undefined;
  pageDirection: CommandPalettePageDirection;
  pageStack: CommandPaletteValue[];
  popPage: () => void;
  query: string;
  registerItem: (key: CommandPaletteValue, element: HTMLElement) => void;
  runCommand: (command: CommandPaletteCommand) => void;
  selectedKey: CommandPaletteValue | null;
  setQuery: (query: string) => void;
  setSelectedKey: (key: CommandPaletteValue | null) => void;
  unregisterItem: (key: CommandPaletteValue, element: HTMLElement) => void;
}

interface CommandPaletteDialogConfigContextValue {
  closeOnRun: boolean;
  motionPreset: CommandPaletteMotionPreset;
  reducedMotion: boolean | undefined;
}

interface CommandPaletteDialogActionContextValue {
  close: () => void;
  closeOnRun: boolean;
}

interface CommandPaletteRenderGroup {
  commands: CommandPaletteCommand[];
  heading: string | undefined;
  key: string;
}

interface CommandPaletteMotionSettings {
  indicatorTransition: Transition;
  pageOffset: number;
  pageTransition: Transition;
  resultOffset: number;
  resultTransition: Transition;
  staggerDelay: number;
}

interface CommandPalettePageFrameProps {
  children?: ReactNode;
  className?: string;
  "data-page"?: CommandPaletteValue;
  "data-page-depth"?: number | string;
  "data-page-direction"?: CommandPalettePageDirection;
  "data-state"?: string;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

const CommandPaletteDialogConfigContext =
  createContext<CommandPaletteDialogConfigContextValue | null>(null);

const CommandPaletteDialogActionContext =
  createContext<CommandPaletteDialogActionContextValue | null>(null);

const emptyCommands: CommandPaletteCommand[] = [];

const commandPaletteDefaultSourceGroups: Partial<
  Record<CommandPaletteCommandSource, string>
> = {
  async: "Results",
  recent: "Recent",
  suggested: "Suggested",
};

const commandPaletteRootClasses =
  "group/command-palette grid w-full min-w-0 overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-sm";

const commandPaletteHeaderClasses =
  "grid gap-[var(--dt-space-1)] border-b border-border p-[var(--dt-space-3)]";

const commandPaletteLabelClasses =
  "text-sm font-medium leading-5 text-foreground";

const commandPaletteDescriptionClasses =
  "text-xs leading-5 text-muted-foreground";

const commandPaletteInputClasses =
  "w-full min-w-0 border-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60";

const commandPaletteInputSizeClasses: Record<
  CommandPaletteControlSize,
  string
> = {
  sm: "h-8 text-base sm:text-sm",
  md: "h-density-control text-base sm:text-sm",
  lg: "h-11 text-base",
};

const commandPaletteListClasses =
  "grid max-h-[min(24rem,calc(100dvh_-_var(--dt-space-8)))] gap-[var(--dt-space-1)] overflow-auto p-[var(--dt-space-2)]";

const commandPaletteGroupClasses = "grid min-w-0 gap-[var(--dt-space-1)]";

const commandPaletteGroupHeadingClasses =
  "px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-xs font-medium uppercase tracking-normal text-muted-foreground";

const commandPaletteItemClasses =
  "relative isolate grid w-full min-w-0 cursor-default grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[var(--dt-space-2)] overflow-hidden rounded-md px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-start text-sm leading-5 text-foreground no-underline outline-none motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-55 data-[selected=true]:bg-muted data-[destructive=true]:text-destructive data-[destructive=true]:hover:bg-destructive/10 data-[destructive=true]:data-[selected=true]:bg-destructive/10 [&>:not([data-slot=command-palette-selected-indicator])]:relative [&>:not([data-slot=command-palette-selected-indicator])]:z-[1]";

const commandPaletteItemSizeClasses: Record<CommandPaletteControlSize, string> =
  {
    sm: "min-h-8",
    md: "min-h-10",
    lg: "min-h-11",
  };

const commandPaletteItemIconClasses =
  "flex size-4 shrink-0 items-center justify-center text-muted-foreground group-data-[destructive=true]/command-palette-item:text-destructive [&>svg]:size-4";

const commandPaletteItemContentClasses = "grid min-w-0 gap-0.5";

const commandPaletteItemLabelClasses =
  "min-w-0 truncate font-medium text-current";

const commandPaletteItemDescriptionClasses =
  "min-w-0 truncate text-xs leading-5 text-muted-foreground group-data-[destructive=true]/command-palette-item:text-destructive/80";

const commandPaletteItemShortcutClasses =
  "ms-[var(--dt-space-2)] inline-flex shrink-0 items-center rounded border border-border bg-muted px-[var(--dt-space-1-5)] py-[var(--dt-space-0-5)] font-mono text-[0.6875rem] leading-4 text-muted-foreground";

const commandPaletteSelectedIndicatorClasses =
  "pointer-events-none absolute inset-0 z-0 rounded-md bg-muted group-data-[destructive=true]/command-palette-item:bg-destructive/10";

const commandPaletteSeparatorClasses = "my-[var(--dt-space-1)] h-px bg-border";

const commandPaletteEmptyClasses =
  "px-[var(--dt-space-3)] py-[var(--dt-space-8)] text-center text-sm text-muted-foreground";

const commandPaletteStatusClasses =
  "grid gap-[var(--dt-space-2)] px-[var(--dt-space-3)] py-[var(--dt-space-5)] text-center text-sm leading-5 text-muted-foreground";

const commandPaletteErrorClasses =
  "grid gap-[var(--dt-space-3)] px-[var(--dt-space-3)] py-[var(--dt-space-5)] text-center text-sm leading-5 text-muted-foreground";

const commandPaletteRetryClasses =
  "mx-auto inline-flex min-h-8 items-center justify-center rounded-md border border-border bg-background px-[var(--dt-space-3)] py-[var(--dt-space-1)] text-sm font-medium leading-5 text-foreground outline-none motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

const commandPaletteAnnouncerClasses = "sr-only";

const commandPalettePageStackClasses = "grid min-w-0";

const commandPalettePageClasses = "grid min-w-0";

const commandPalettePageHeaderClasses =
  "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-[var(--dt-space-2)] border-b border-border px-[var(--dt-space-3)] py-[var(--dt-space-2)]";

const commandPalettePageHeadingClasses = "grid min-w-0 gap-0.5";

const commandPalettePageTitleClasses =
  "min-w-0 truncate text-sm font-medium leading-5 text-foreground";

const commandPalettePageDescriptionClasses =
  "min-w-0 text-xs leading-5 text-muted-foreground";

const commandPalettePageBackClasses =
  "inline-flex min-h-8 shrink-0 items-center justify-center rounded-md border border-border bg-background px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-sm font-medium leading-5 text-foreground outline-none motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

const commandPaletteDialogClasses = "contents";

const commandPaletteDialogContentClasses = "overflow-hidden p-0";

const commandPaletteDialogOverlayMotionClasses: Record<
  CommandPaletteMotionPreset,
  string
> = {
  none: "motion-safe:duration-0",
  subtle: "motion-safe:duration-150 motion-safe:ease-out",
  standard: "motion-safe:duration-200 motion-safe:ease-out",
  expressive: "motion-safe:duration-300 motion-safe:ease-out",
};

const commandPaletteDialogContentMotionClasses: Record<
  CommandPaletteMotionPreset,
  string
> = {
  none: "motion-safe:duration-0 data-[exiting]:translate-y-0 data-[exiting]:scale-100",
  subtle:
    "motion-safe:duration-150 data-[exiting]:translate-y-1 data-[exiting]:scale-[0.99]",
  standard:
    "motion-safe:duration-200 data-[exiting]:translate-y-2 data-[exiting]:scale-[0.98]",
  expressive:
    "motion-safe:duration-300 data-[entering]:scale-100 data-[exiting]:translate-y-3 data-[exiting]:scale-[0.96]",
};

const commandPaletteMotionGroupClasses = "grid min-w-0";

const commandPaletteMotionResultClasses = "grid min-w-0";

const commandPaletteDialogBodyClasses = "grid min-w-0";

const commandPaletteInDialogClasses = "rounded-none border-0 shadow-none";

const commandPaletteMotionSettings: Record<
  CommandPaletteMotionPreset,
  CommandPaletteMotionSettings
> = {
  none: {
    indicatorTransition: { duration: 0 },
    pageOffset: 0,
    pageTransition: { duration: 0 },
    resultOffset: 0,
    resultTransition: { duration: 0 },
    staggerDelay: 0,
  },
  subtle: {
    indicatorTransition: { duration: 0.14, ease: [0.2, 0, 0, 1] },
    pageOffset: 8,
    pageTransition: { duration: 0.14, ease: [0.2, 0, 0, 1] },
    resultOffset: 3,
    resultTransition: { duration: 0.12, ease: [0.2, 0, 0, 1] },
    staggerDelay: 0,
  },
  standard: {
    indicatorTransition: { duration: 0.18, ease: [0.2, 0, 0, 1] },
    pageOffset: 14,
    pageTransition: { duration: 0.18, ease: [0.2, 0, 0, 1] },
    resultOffset: 5,
    resultTransition: { duration: 0.16, ease: [0.2, 0, 0, 1] },
    staggerDelay: 0.014,
  },
  expressive: {
    indicatorTransition: {
      damping: 32,
      mass: 0.75,
      stiffness: 420,
      type: "spring",
    },
    pageOffset: 20,
    pageTransition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
    resultOffset: 8,
    resultTransition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    staggerDelay: 0.022,
  },
};

const commandPalettePageMotionVariants: Variants = {
  animate: {
    opacity: 1,
    x: 0,
  },
  enter: ({
    direction,
    offset,
  }: {
    direction: CommandPalettePageDirection;
    offset: number;
  }) => ({
    opacity: 0,
    x: direction === "forward" ? offset : direction === "back" ? -offset : 0,
  }),
  exit: ({
    direction,
    offset,
  }: {
    direction: CommandPalettePageDirection;
    offset: number;
  }) => ({
    opacity: 0,
    x: direction === "forward" ? -offset : direction === "back" ? offset : 0,
  }),
};

const commandPaletteResultMotionVariants: Variants = {
  animate: {
    opacity: 1,
    y: 0,
  },
  enter: ({ offset }: { offset: number }) => ({
    opacity: 0,
    y: offset,
  }),
  exit: ({ offset }: { offset: number }) => ({
    opacity: 0,
    y: -offset,
  }),
};

export function commandPaletteClassNames({
  className,
}: Pick<CommandPaletteProps, "className"> = {}) {
  return cn(commandPaletteRootClasses, className);
}

export function commandPaletteDialogClassNames({
  className,
}: Pick<CommandPaletteDialogProps, "className"> = {}) {
  return cn(commandPaletteDialogClasses, className);
}

export function commandPaletteTriggerClassNames({
  className,
  size = "md",
  variant = "solid",
}: Pick<CommandPaletteTriggerProps, "className" | "size" | "variant"> = {}) {
  return dialogTriggerClassNames({ className, size, variant });
}

export function commandPaletteContentClassNames({
  className,
  scrollBehavior = "inside",
  size = "lg",
}: Pick<
  CommandPaletteContentProps,
  "className" | "scrollBehavior" | "size"
> = {}) {
  return dialogContentClassNames({
    className: cn(commandPaletteDialogContentClasses, className),
    scrollBehavior,
    size,
  });
}

export function commandPaletteOverlayClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return dialogOverlayClassNames({ className });
}

export function commandPaletteInputClassNames({
  className,
  controlSize = "md",
}: Pick<CommandPaletteInputProps, "className" | "controlSize"> = {}) {
  return cn(
    commandPaletteInputClasses,
    commandPaletteInputSizeClasses[controlSize],
    className,
  );
}

export function commandPaletteListClassNames({
  className,
}: Pick<CommandPaletteListProps, "className"> = {}) {
  return cn(commandPaletteListClasses, className);
}

export function commandPaletteGroupClassNames({
  className,
}: Pick<CommandPaletteGroupProps, "className"> = {}) {
  return cn(commandPaletteGroupClasses, className);
}

export function commandPaletteItemClassNames({
  className,
  controlSize = "md",
}: Pick<CommandPaletteItemProps, "className"> & {
  controlSize?: CommandPaletteControlSize;
} = {}) {
  return cn(
    commandPaletteItemClasses,
    commandPaletteItemSizeClasses[controlSize],
    className,
  );
}

export function commandPaletteSeparatorClassNames({
  className,
}: Pick<CommandPaletteSeparatorProps, "className"> = {}) {
  return cn(commandPaletteSeparatorClasses, className);
}

export function commandPaletteEmptyClassNames({
  className,
}: Pick<CommandPaletteEmptyProps, "className"> = {}) {
  return cn(commandPaletteEmptyClasses, className);
}

export function commandPaletteStatusClassNames({
  className,
}: Pick<CommandPaletteStatusProps, "className"> = {}) {
  return cn(commandPaletteStatusClasses, className);
}

export function commandPaletteLoadingClassNames({
  className,
}: Pick<CommandPaletteLoadingProps, "className"> = {}) {
  return cn(commandPaletteStatusClasses, className);
}

export function commandPaletteErrorClassNames({
  className,
}: Pick<CommandPaletteErrorProps, "className"> = {}) {
  return cn(commandPaletteErrorClasses, className);
}

export function commandPaletteRetryClassNames({
  className,
}: Pick<CommandPaletteRetryProps, "className"> = {}) {
  return cn(commandPaletteRetryClasses, className);
}

export function commandPaletteAnnouncerClassNames({
  className,
}: Pick<CommandPaletteAnnouncerProps, "className"> = {}) {
  return cn(commandPaletteAnnouncerClasses, className);
}

export function commandPalettePageStackClassNames({
  className,
}: Pick<CommandPalettePageStackProps, "className"> = {}) {
  return cn(commandPalettePageStackClasses, className);
}

export function commandPalettePageClassNames({
  className,
}: Pick<CommandPalettePageProps, "className"> = {}) {
  return cn(commandPalettePageClasses, className);
}

export function commandPalettePageHeaderClassNames({
  className,
}: Pick<CommandPalettePageHeaderProps, "className"> = {}) {
  return cn(commandPalettePageHeaderClasses, className);
}

export function commandPalettePageBackClassNames({
  className,
}: Pick<CommandPalettePageBackProps, "className"> = {}) {
  return cn(commandPalettePageBackClasses, className);
}

function setRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

function composeEventHandlers<Event extends { defaultPrevented: boolean }>(
  childHandler: ((event: Event) => void) | undefined,
  componentHandler: (event: Event) => void,
) {
  return (event: Event) => {
    childHandler?.(event);

    if (!event.defaultPrevented) {
      componentHandler(event);
    }
  };
}

function mergeRelForTarget(
  rel: string | undefined,
  target: AnchorHTMLAttributes<HTMLAnchorElement>["target"] | undefined,
) {
  if (target !== "_blank") {
    return rel;
  }

  const tokens = new Set((rel ?? "").split(/\s+/).filter(Boolean));
  tokens.add("noopener");

  return Array.from(tokens).join(" ");
}

function getChildRef(child: ReactElement<CommandPaletteItemSlotProps>) {
  return child.props.ref;
}

function getCommandText(command: CommandPaletteCommand) {
  if (command.textValue) {
    return command.textValue;
  }

  return typeof command.label === "string" ? command.label : command.key;
}

function getNodeText(node: ReactNode): string | undefined {
  if (node === null || node === undefined || typeof node === "boolean") {
    return undefined;
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return (
      node
        .map((child) => getNodeText(child))
        .filter(Boolean)
        .join(" ")
        .trim() || undefined
    );
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }

  return undefined;
}

function formatCommandCount(count: number) {
  return `${count} command${count === 1 ? "" : "s"}`;
}

function formatSourceLabel(source: CommandPaletteCommandSource | undefined) {
  if (!source) {
    return undefined;
  }

  if (source === "base" || source === "page") {
    return undefined;
  }

  return commandPaletteDefaultSourceGroups[source] ?? source;
}

function removeBoundarySeparators(commands: CommandPaletteCommand[]) {
  const normalizedCommands: CommandPaletteCommand[] = [];

  for (const command of commands) {
    if (
      command.type === "separator" &&
      (normalizedCommands.length === 0 ||
        normalizedCommands[normalizedCommands.length - 1]?.type === "separator")
    ) {
      continue;
    }

    normalizedCommands.push(command);
  }

  while (
    normalizedCommands[normalizedCommands.length - 1]?.type === "separator"
  ) {
    normalizedCommands.pop();
  }

  return normalizedCommands;
}

function getPageTitleText(page: CommandPalettePageDefinition | undefined) {
  return getNodeText(page?.title) ?? page?.id;
}

function shouldEnableCommandPaletteMotion({
  motionPreset,
  reducedMotion,
}: {
  motionPreset: CommandPaletteMotionPreset;
  reducedMotion: boolean;
}) {
  return motionPreset !== "none" && !reducedMotion;
}

function getCommandPaletteMotionSettings(
  motionPreset: CommandPaletteMotionPreset,
) {
  return commandPaletteMotionSettings[motionPreset];
}

function withCommandPaletteMotionDelay(
  transition: Transition,
  delay: number,
): Transition {
  if (delay <= 0) {
    return transition;
  }

  return {
    ...transition,
    delay,
  };
}

function shouldStaggerCommandSource(
  source: CommandPaletteCommandSource | undefined,
) {
  return source === "recent" || source === "suggested";
}

function searchableParts(command: CommandPaletteCommand) {
  return [
    command.key,
    getCommandText(command),
    command.group,
    ...(command.aliases ?? []),
    ...(command.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function defaultCommandPaletteFilter(
  command: CommandPaletteCommand,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return searchableParts(command).includes(normalizedQuery);
}

function defaultSort(
  a: CommandPaletteCommand,
  b: CommandPaletteCommand,
  query: string,
) {
  const aPriority = a.priority ?? 0;
  const bPriority = b.priority ?? 0;

  if (aPriority !== bPriority) {
    return bPriority - aPriority;
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    const aText = getCommandText(a).toLowerCase();
    const bText = getCommandText(b).toLowerCase();
    const aStarts = aText.startsWith(normalizedQuery);
    const bStarts = bText.startsWith(normalizedQuery);

    if (aStarts !== bStarts) {
      return aStarts ? -1 : 1;
    }
  }

  return 0;
}

function isSelectableCommand(command: CommandPaletteCommand) {
  return command.type !== "separator" && !command.disabled;
}

function withCommandSource(
  command: CommandPaletteCommand,
  source: CommandPaletteCommandSource,
) {
  const resolvedSource = command.source ?? source;

  return {
    ...command,
    group:
      command.group ??
      (source === "base"
        ? undefined
        : commandPaletteDefaultSourceGroups[source]),
    source: resolvedSource,
  };
}

function appendSourceCommands(
  target: CommandPaletteCommand[],
  seenKeys: Set<CommandPaletteValue>,
  commands: CommandPaletteCommand[] | undefined,
  source: CommandPaletteCommandSource,
) {
  for (const command of commands ?? emptyCommands) {
    if (seenKeys.has(command.key)) {
      continue;
    }

    seenKeys.add(command.key);
    target.push(withCommandSource(command, source));
  }
}

export function getCommandPaletteSourceCommands({
  asyncCommands,
  commandSource = "base",
  commands,
  minimumQueryLength = 0,
  query = "",
  recentCommands,
  suggestedCommands,
}: {
  asyncCommands?: CommandPaletteCommand[];
  commandSource?: CommandPaletteCommandSource;
  commands?: CommandPaletteCommand[];
  minimumQueryLength?: number;
  query?: string;
  recentCommands?: CommandPaletteCommand[];
  suggestedCommands?: CommandPaletteCommand[];
} = {}) {
  const normalizedQuery = query.trim();
  const sourceCommands: CommandPaletteCommand[] = [];
  const seenKeys = new Set<CommandPaletteValue>();
  const canShowDiscoveryCommands = normalizedQuery.length === 0;
  const canShowAsyncCommands =
    minimumQueryLength <= 0 || normalizedQuery.length >= minimumQueryLength;

  if (canShowDiscoveryCommands) {
    appendSourceCommands(sourceCommands, seenKeys, recentCommands, "recent");
    appendSourceCommands(
      sourceCommands,
      seenKeys,
      suggestedCommands,
      "suggested",
    );
  }

  if (canShowAsyncCommands) {
    appendSourceCommands(sourceCommands, seenKeys, asyncCommands, "async");
  }

  appendSourceCommands(sourceCommands, seenKeys, commands, commandSource);

  return sourceCommands;
}

export function getCommandPaletteFilteredCommands(
  commands: CommandPaletteCommand[],
  {
    filter = defaultCommandPaletteFilter,
    limit,
    query = "",
    shouldFilter = true,
    sort,
  }: {
    filter?: CommandPaletteFilter;
    limit?: number;
    query?: string;
    shouldFilter?: boolean;
    sort?: CommandPaletteSort;
  } = {},
) {
  const filtered = shouldFilter
    ? commands.filter(
        (command) => command.type === "separator" || filter(command, query),
      )
    : [...commands];
  const sorter = sort ?? defaultSort;
  const sorted = filtered
    .map((command, index) => ({ command, index }))
    .sort((a, b) => {
      const result = sorter(a.command, b.command, query);

      return result === 0 ? a.index - b.index : result;
    })
    .map(({ command }) => command);
  if (limit === undefined) {
    return removeBoundarySeparators(sorted);
  }

  let commandCount = 0;
  const maxCommands = Math.max(0, limit);

  return removeBoundarySeparators(
    sorted.filter((command) => {
      if (command.type === "separator") {
        return true;
      }

      if (commandCount >= maxCommands) {
        return false;
      }

      commandCount += 1;
      return true;
    }),
  );
}

function groupCommands(
  commands: CommandPaletteCommand[],
): CommandPaletteRenderGroup[] {
  const groups: CommandPaletteRenderGroup[] = [];
  const indexes = new Map<string, number>();

  for (const command of commands) {
    const heading = command.group;
    const key = heading ?? "__command-palette-default";
    const existingIndex = indexes.get(key);

    if (existingIndex !== undefined) {
      groups[existingIndex]?.commands.push(command);
      continue;
    }

    indexes.set(key, groups.length);
    groups.push({
      commands: [command],
      heading,
      key,
    });
  }

  return groups;
}

function renderDefaultCommandContent(command: CommandPaletteCommand) {
  return (
    <>
      {command.icon ? (
        <CommandPaletteItemIcon>{command.icon}</CommandPaletteItemIcon>
      ) : (
        <span aria-hidden="true" />
      )}
      <span className={commandPaletteItemContentClasses}>
        <CommandPaletteItemLabel>{command.label}</CommandPaletteItemLabel>
        {command.disabledReason ? (
          <CommandPaletteItemDescription>
            {command.disabledReason}
          </CommandPaletteItemDescription>
        ) : command.description ? (
          <CommandPaletteItemDescription>
            {command.description}
          </CommandPaletteItemDescription>
        ) : null}
      </span>
      {command.shortcut ? (
        <CommandPaletteItemShortcut>
          {command.shortcut}
        </CommandPaletteItemShortcut>
      ) : null}
    </>
  );
}

function CommandPalettePageFrame({
  children,
  className,
  "data-page": dataPage,
  "data-page-depth": dataPageDepth,
  "data-page-direction": dataPageDirection,
  "data-state": dataState,
}: CommandPalettePageFrameProps) {
  const context = useContext(CommandPaletteContext);
  const isPresent = useIsPresent();
  const motionPreset = context?.motionPreset ?? "standard";
  const motionSettings = getCommandPaletteMotionSettings(motionPreset);
  const pageDirection = dataPageDirection ?? context?.pageDirection ?? "none";
  const resolvedPage = dataPage ?? context?.page ?? "root";
  const resolvedPageDepth = dataPageDepth ?? context?.pageStack.length ?? 0;
  const commonProps = {
    "aria-hidden":
      context?.motionEnabled === true && !isPresent ? true : undefined,
    "data-motion": motionPreset,
    "data-page": resolvedPage,
    "data-page-depth": resolvedPageDepth,
    "data-page-direction": pageDirection,
    "data-reduced-motion": context?.reducedMotion ? "true" : undefined,
    "data-slot": "command-palette-page",
    "data-state": dataState,
    className: commandPalettePageClassNames({ className }),
  };

  if (!context?.motionEnabled) {
    return <section {...commonProps}>{children}</section>;
  }

  return (
    <motionElement.section
      {...commonProps}
      custom={{
        direction: pageDirection,
        offset: motionSettings.pageOffset,
      }}
      initial="enter"
      animate="animate"
      exit="exit"
      variants={commandPalettePageMotionVariants}
      transition={motionSettings.pageTransition}
    >
      {children}
    </motionElement.section>
  );
}

function CommandPaletteMotionGroup({
  children,
  index,
  source,
}: {
  children: ReactNode;
  index: number;
  source: CommandPaletteCommandSource | undefined;
}) {
  const context = useContext(CommandPaletteContext);
  const isPresent = useIsPresent();
  const motionPreset = context?.motionPreset ?? "standard";
  const motionSettings = getCommandPaletteMotionSettings(motionPreset);
  const staggered =
    context?.motionEnabled === true &&
    motionSettings.staggerDelay > 0 &&
    (shouldStaggerCommandSource(source) || motionPreset === "expressive");
  const transition = withCommandPaletteMotionDelay(
    motionSettings.resultTransition,
    staggered ? index * motionSettings.staggerDelay : 0,
  );
  const commonProps = {
    "aria-hidden":
      context?.motionEnabled === true && !isPresent ? true : undefined,
    "data-motion": motionPreset,
    "data-motion-stagger": staggered ? "true" : undefined,
    "data-reduced-motion": context?.reducedMotion ? "true" : undefined,
    "data-slot": "command-palette-motion-group",
    className: commandPaletteMotionGroupClasses,
  };

  if (!context?.motionEnabled) {
    return <div {...commonProps}>{children}</div>;
  }

  return (
    <motionElement.div
      {...commonProps}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      {children}
    </motionElement.div>
  );
}

function CommandPaletteMotionResult({
  children,
  index,
  source,
}: {
  children: ReactNode;
  index: number;
  source: CommandPaletteCommandSource | undefined;
}) {
  const context = useContext(CommandPaletteContext);
  const isPresent = useIsPresent();
  const motionPreset = context?.motionPreset ?? "standard";
  const motionSettings = getCommandPaletteMotionSettings(motionPreset);
  const staggered =
    context?.motionEnabled === true &&
    motionSettings.staggerDelay > 0 &&
    (shouldStaggerCommandSource(source) || motionPreset === "expressive");
  const transition = withCommandPaletteMotionDelay(
    motionSettings.resultTransition,
    staggered ? index * motionSettings.staggerDelay : 0,
  );
  const commonProps = {
    "aria-hidden":
      context?.motionEnabled === true && !isPresent ? true : undefined,
    "data-motion": motionPreset,
    "data-motion-stagger": staggered ? "true" : undefined,
    "data-reduced-motion": context?.reducedMotion ? "true" : undefined,
    "data-slot": "command-palette-motion-result",
    className: commandPaletteMotionResultClasses,
  };

  if (!context?.motionEnabled) {
    return <div {...commonProps}>{children}</div>;
  }

  return (
    <motionElement.div
      {...commonProps}
      layout="position"
      custom={{ offset: motionSettings.resultOffset }}
      initial="enter"
      animate="animate"
      exit="exit"
      variants={commandPaletteResultMotionVariants}
      transition={transition}
    >
      {children}
    </motionElement.div>
  );
}

function CommandPaletteSelectedIndicator() {
  const context = useContext(CommandPaletteContext);
  const motionPreset = context?.motionPreset ?? "standard";
  const motionSettings = getCommandPaletteMotionSettings(motionPreset);
  const commonProps = {
    "aria-hidden": true,
    "data-motion": motionPreset,
    "data-reduced-motion": context?.reducedMotion ? "true" : undefined,
    "data-slot": "command-palette-selected-indicator",
    className: commandPaletteSelectedIndicatorClasses,
  } as const;

  if (!context?.motionEnabled) {
    return <span {...commonProps} />;
  }

  return (
    <motionElement.span
      {...commonProps}
      layoutId={context.selectedIndicatorLayoutId}
      transition={motionSettings.indicatorTransition}
    />
  );
}

function commandFromItemProps({
  command,
  destructive,
  disabled,
  disabledReason,
  href,
  onAction,
  page,
  rel,
  shortcut,
  target,
  value,
}: CommandPaletteItemProps): CommandPaletteCommand {
  const resolvedPage = page ?? command?.page;
  const resolvedHref = href ?? command?.href;

  const resolvedCommand: CommandPaletteCommand = {
    ...command,
    destructive: destructive ?? command?.destructive,
    disabled: disabled ?? command?.disabled,
    disabledReason: disabledReason ?? command?.disabledReason,
    href: resolvedHref,
    key: value,
    label: command?.label ?? value,
    page: resolvedPage,
    rel: rel ?? command?.rel,
    shortcut: shortcut ?? command?.shortcut,
    target: target ?? command?.target,
    type:
      command?.type ??
      (resolvedPage ? "page" : resolvedHref ? "link" : "action"),
  };

  if (command?.action) {
    resolvedCommand.action = command.action;
  } else if (onAction) {
    resolvedCommand.action = onAction;
  }

  return resolvedCommand;
}

function useControllablePageStack({
  defaultValue,
  onChange,
  value,
}: {
  defaultValue: CommandPaletteValue[];
  onChange?: (
    value: CommandPaletteValue[],
    context: CommandPalettePageStackChangeContext,
  ) => void;
  value?: CommandPaletteValue[];
}) {
  const [uncontrolledValue, setUncontrolledValue] =
    useState<CommandPaletteValue[]>(defaultValue);
  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : uncontrolledValue;
  const setValue = useCallback(
    (
      nextValue: CommandPaletteValue[],
      context: CommandPalettePageStackChangeContext,
    ) => {
      if (!controlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue, context);
    },
    [controlled, onChange],
  );

  return [resolvedValue, setValue] as const;
}

function useControllableString({
  defaultValue,
  onChange,
  value,
}: {
  defaultValue: string;
  onChange?: (value: string) => void;
  value?: string;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : uncontrolledValue;
  const setValue = useCallback(
    (nextValue: string) => {
      if (!controlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [controlled, onChange],
  );

  return [resolvedValue, setValue] as const;
}

function useControllableKey({
  defaultValue,
  onChange,
  value,
}: {
  defaultValue: CommandPaletteValue | null;
  onChange?: (value: CommandPaletteValue | null) => void;
  value?: CommandPaletteValue | null;
}) {
  const [uncontrolledValue, setUncontrolledValue] =
    useState<CommandPaletteValue | null>(defaultValue);
  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : uncontrolledValue;
  const setValue = useCallback(
    (nextValue: CommandPaletteValue | null) => {
      if (!controlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [controlled, onChange],
  );

  return [resolvedValue, setValue] as const;
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      announcements = true,
      asyncCommands,
      children,
      className,
      clearQueryOnPageChange = true,
      closeOnRun,
      commands: commandsProp,
      controlSize = "md",
      defaultPageStack = [],
      defaultQuery = "",
      defaultSelectedKey = null,
      description,
      emptyMessage = "No commands found.",
      error,
      filter,
      label,
      limit,
      loading = false,
      loadingMessage = "Searching commands...",
      minimumQueryLength = 0,
      minimumQueryMessage,
      motionPreset: motionPresetProp,
      onCommandRun,
      onKeyDownCapture,
      onPageStackChange,
      onQueryChange,
      onRetry,
      onSelectedKeyChange,
      pageBackLabel = "Back",
      pageStack,
      pages,
      placeholder = "Type a command or search...",
      query,
      recentCommands,
      reducedMotion: reducedMotionProp,
      retryLabel = "Retry",
      selectedKey,
      shouldFilter = true,
      sort,
      stale = false,
      staleMessage = "Showing previous results while updating.",
      suggestedCommands,
      ...props
    },
    ref,
  ) => {
    const dialogActionContext = useContext(CommandPaletteDialogActionContext);
    const dialogConfigContext = useContext(CommandPaletteDialogConfigContext);
    const prefersReducedMotion = useReducedMotion();
    const generatedInputId = useId();
    const generatedLabelId = useId();
    const inputId = `${generatedInputId}-input`;
    const labelId = label ? `${generatedLabelId}-label` : undefined;
    const pageTitleId = `${generatedLabelId}-page-title`;
    const selectedIndicatorLayoutId = `${generatedLabelId}-selected-indicator`;
    const resolvedMotionPreset =
      motionPresetProp ?? dialogConfigContext?.motionPreset ?? "standard";
    const resolvedReducedMotion =
      reducedMotionProp ??
      dialogConfigContext?.reducedMotion ??
      prefersReducedMotion === true;
    const motionEnabled = shouldEnableCommandPaletteMotion({
      motionPreset: resolvedMotionPreset,
      reducedMotion: resolvedReducedMotion,
    });
    const motionSettings =
      getCommandPaletteMotionSettings(resolvedMotionPreset);
    const itemRefs = useRef(new Map<CommandPaletteValue, HTMLElement>());
    const pagesById = useMemo(
      () =>
        new Map(
          (pages ?? []).map((pageDefinition) => [
            pageDefinition.id,
            pageDefinition,
          ]),
        ),
      [pages],
    );
    const [resolvedPageStack, setResolvedPageStack] = useControllablePageStack({
      defaultValue: defaultPageStack,
      onChange: onPageStackChange,
      value: pageStack,
    });
    const activePageId = resolvedPageStack[resolvedPageStack.length - 1];
    const activePage = activePageId ? pagesById.get(activePageId) : undefined;
    const activePageTitleText = getPageTitleText(activePage) ?? activePageId;
    const [pageDirection, setPageDirection] =
      useState<CommandPalettePageDirection>("none");
    const previousPageDepthRef = useRef(resolvedPageStack.length);
    const [resolvedQuery, setResolvedQuery] = useControllableString({
      defaultValue: defaultQuery,
      onChange: onQueryChange,
      value: query,
    });
    useEffect(() => {
      const previousDepth = previousPageDepthRef.current;
      const nextDepth = resolvedPageStack.length;

      if (nextDepth !== previousDepth) {
        setPageDirection(
          nextDepth > previousDepth
            ? "forward"
            : nextDepth < previousDepth
              ? "back"
              : "none",
        );
        previousPageDepthRef.current = nextDepth;
      }
    }, [resolvedPageStack.length]);

    const baseCommands =
      activePageId !== undefined
        ? (activePage?.commands ?? emptyCommands)
        : (commandsProp ?? emptyCommands);
    const resolvedAsyncCommands =
      activePageId !== undefined ? activePage?.asyncCommands : asyncCommands;
    const resolvedRecentCommands =
      activePageId !== undefined ? activePage?.recentCommands : recentCommands;
    const resolvedSuggestedCommands =
      activePageId !== undefined
        ? activePage?.suggestedCommands
        : suggestedCommands;
    const resolvedLoading =
      activePageId !== undefined ? activePage?.loading === true : loading;
    const resolvedError =
      activePageId !== undefined ? activePage?.error : error;
    const resolvedOnRetry =
      activePageId !== undefined ? activePage?.onRetry : onRetry;
    const resolvedRetryLabel =
      activePageId !== undefined
        ? (activePage?.retryLabel ?? retryLabel)
        : retryLabel;
    const resolvedEmptyMessage =
      activePageId !== undefined
        ? (activePage?.emptyMessage ?? emptyMessage)
        : emptyMessage;
    const resolvedLoadingMessage =
      activePageId !== undefined
        ? (activePage?.loadingMessage ?? loadingMessage)
        : loadingMessage;
    const resolvedStale =
      activePageId !== undefined ? activePage?.stale === true : stale;
    const resolvedStaleMessage =
      activePageId !== undefined
        ? (activePage?.staleMessage ?? staleMessage)
        : staleMessage;
    const resolvedMinimumQueryLength =
      activePageId !== undefined
        ? (activePage?.minimumQueryLength ?? 0)
        : minimumQueryLength;
    const resolvedMinimumQueryMessageProp =
      activePageId !== undefined
        ? activePage?.minimumQueryMessage
        : minimumQueryMessage;
    const resolvedFilter = activePage?.filter ?? filter;
    const resolvedLimit = activePage?.limit ?? limit;
    const resolvedShouldFilter = activePage?.shouldFilter ?? shouldFilter;
    const resolvedSort = activePage?.sort ?? sort;
    const activeCommandSource: CommandPaletteCommandSource =
      activePageId !== undefined ? "page" : "base";
    const hasDataCommands =
      commandsProp !== undefined ||
      recentCommands !== undefined ||
      suggestedCommands !== undefined ||
      asyncCommands !== undefined ||
      activePageId !== undefined;
    const normalizedQuery = resolvedQuery.trim();
    const showMinimumQuery =
      resolvedMinimumQueryLength > 0 &&
      normalizedQuery.length > 0 &&
      normalizedQuery.length < resolvedMinimumQueryLength;
    const sourceCommands = useMemo(
      () =>
        getCommandPaletteSourceCommands({
          asyncCommands: resolvedAsyncCommands,
          commandSource: activeCommandSource,
          commands: baseCommands,
          minimumQueryLength: resolvedMinimumQueryLength,
          query: resolvedQuery,
          recentCommands: resolvedRecentCommands,
          suggestedCommands: resolvedSuggestedCommands,
        }),
      [
        activeCommandSource,
        baseCommands,
        resolvedAsyncCommands,
        resolvedMinimumQueryLength,
        resolvedRecentCommands,
        resolvedQuery,
        resolvedSuggestedCommands,
      ],
    );
    const filteredCommands = useMemo(
      () =>
        getCommandPaletteFilteredCommands(sourceCommands, {
          filter: resolvedFilter,
          limit: resolvedLimit,
          query: resolvedQuery,
          shouldFilter: resolvedShouldFilter,
          sort: resolvedSort,
        }),
      [
        resolvedFilter,
        resolvedLimit,
        resolvedQuery,
        resolvedShouldFilter,
        resolvedSort,
        sourceCommands,
      ],
    );
    const resultCommands = useMemo(
      () => filteredCommands.filter((command) => command.type !== "separator"),
      [filteredCommands],
    );
    const hasError =
      resolvedError !== undefined &&
      resolvedError !== null &&
      resolvedError !== false;
    const hasStaleResults =
      resolvedStale || (resolvedLoading && resultCommands.length > 0);
    const resolvedMinimumQueryMessage =
      resolvedMinimumQueryMessageProp ??
      `Type at least ${resolvedMinimumQueryLength} ${
        resolvedMinimumQueryLength === 1 ? "character" : "characters"
      } to search.`;
    const shouldRenderEmpty =
      hasDataCommands &&
      resultCommands.length === 0 &&
      !hasError &&
      !resolvedLoading &&
      !showMinimumQuery;
    const enabledKeys = useMemo(
      () =>
        filteredCommands
          .filter(isSelectableCommand)
          .map((command) => command.key),
      [filteredCommands],
    );
    const [resolvedSelectedKey, setResolvedSelectedKey] = useControllableKey({
      defaultValue: defaultSelectedKey,
      onChange: onSelectedKeyChange,
      value: selectedKey,
    });
    const activeCommand =
      filteredCommands.find((command) => command.key === resolvedSelectedKey) ??
      null;
    const groups = useMemo(
      () => groupCommands(filteredCommands),
      [filteredCommands],
    );
    const [runAnnouncement, setRunAnnouncement] = useState("");
    const [pageAnnouncement, setPageAnnouncement] = useState("");
    const compoundChildren =
      !hasDataCommands && typeof children !== "function" && children != null;
    const renderedChildren = hasDataCommands
      ? groups.map((group, index) => (
          <CommandPaletteMotionGroup
            key={group.key}
            index={index}
            source={
              group.commands.find((command) => command.type !== "separator")
                ?.source
            }
          >
            {index > 0 ? <CommandPaletteSeparator /> : null}
            <CommandPaletteGroup heading={group.heading}>
              <AnimatePresence initial={false}>
                {group.commands.map((command, commandIndex) =>
                  command.type === "separator" ? (
                    <CommandPaletteSeparator key={command.key} />
                  ) : (
                    <CommandPaletteMotionResult
                      key={command.key}
                      index={commandIndex}
                      source={command.source}
                    >
                      <CommandPaletteItem
                        command={command}
                        destructive={command.destructive}
                        disabled={command.disabled}
                        disabledReason={command.disabledReason}
                        href={command.href}
                        page={command.page}
                        rel={command.rel}
                        shortcut={command.shortcut}
                        target={command.target}
                        value={command.key}
                      >
                        {typeof children === "function"
                          ? children(command)
                          : renderDefaultCommandContent(command)}
                      </CommandPaletteItem>
                    </CommandPaletteMotionResult>
                  ),
                )}
              </AnimatePresence>
            </CommandPaletteGroup>
          </CommandPaletteMotionGroup>
        ))
      : typeof children === "function"
        ? null
        : children;

    const clearTransientAnnouncements = useCallback(() => {
      setPageAnnouncement("");
      setRunAnnouncement("");
    }, []);
    const registerItem = useCallback(
      (key: CommandPaletteValue, element: HTMLElement) => {
        itemRefs.current.set(key, element);
      },
      [],
    );
    const unregisterItem = useCallback(
      (key: CommandPaletteValue, element: HTMLElement) => {
        if (itemRefs.current.get(key) === element) {
          itemRefs.current.delete(key);
        }
      },
      [],
    );
    const updateQuery = useCallback(
      (nextQuery: string) => {
        clearTransientAnnouncements();
        setResolvedQuery(nextQuery);
      },
      [clearTransientAnnouncements, setResolvedQuery],
    );
    const updateSelectedKey = useCallback(
      (nextKey: CommandPaletteValue | null) => {
        clearTransientAnnouncements();
        setResolvedSelectedKey(nextKey);
      },
      [clearTransientAnnouncements, setResolvedSelectedKey],
    );

    const updatePageStack = useCallback(
      (
        nextPageStack: CommandPaletteValue[],
        reason: CommandPalettePageStackChangeReason,
      ) => {
        const nextActivePage = nextPageStack[nextPageStack.length - 1];
        const direction =
          nextPageStack.length > resolvedPageStack.length
            ? "forward"
            : nextPageStack.length < resolvedPageStack.length
              ? "back"
              : "none";

        setPageDirection(direction);
        setRunAnnouncement("");
        setResolvedPageStack(nextPageStack, {
          activePage: nextActivePage,
          direction,
          previousPage: activePageId,
          reason,
        });
        setResolvedSelectedKey(null);

        if (clearQueryOnPageChange) {
          setResolvedQuery("");
        }

        const nextPage = nextActivePage
          ? pagesById.get(nextActivePage)
          : undefined;
        const nextPageTitle = getPageTitleText(nextPage) ?? nextActivePage;

        if (reason === "push" && nextPageTitle) {
          setPageAnnouncement(`Opened ${nextPageTitle}.`);
        } else if (nextPageTitle) {
          setPageAnnouncement(`Returned to ${nextPageTitle}.`);
        } else {
          setPageAnnouncement("Returned to root commands.");
        }
      },
      [
        activePageId,
        clearQueryOnPageChange,
        pagesById,
        resolvedPageStack.length,
        setResolvedPageStack,
        setResolvedQuery,
        setResolvedSelectedKey,
      ],
    );

    const pushPage = useCallback(
      (pageId: CommandPaletteValue) => {
        if (!pagesById.has(pageId)) {
          return;
        }

        updatePageStack([...resolvedPageStack, pageId], "push");
      },
      [pagesById, resolvedPageStack, updatePageStack],
    );

    const popPage = useCallback(() => {
      if (resolvedPageStack.length === 0) {
        return;
      }

      updatePageStack(resolvedPageStack.slice(0, -1), "back");
    }, [resolvedPageStack, updatePageStack]);

    const runCommand = useCallback(
      (command: CommandPaletteCommand) => {
        if (command.disabled || command.type === "separator") {
          return;
        }

        if (command.type === "page") {
          if (command.page) {
            pushPage(command.page);
          }

          return;
        }

        const shouldClose =
          command.closeOnRun ?? closeOnRun ?? dialogActionContext?.closeOnRun;
        const runContext: CommandPaletteCommandRunContext = {
          close: dialogActionContext?.close,
          closeOnRun: shouldClose === true,
          page: activePageId,
          pageStack: resolvedPageStack,
          query: resolvedQuery,
          source: command.source,
        };

        command.action?.(command, runContext);
        onCommandRun?.(command, runContext);
        setRunAnnouncement(`Ran ${getCommandText(command)}.`);

        if (shouldClose) {
          dialogActionContext?.close();
        }
      },
      [
        activePageId,
        closeOnRun,
        dialogActionContext,
        onCommandRun,
        pushPage,
        resolvedPageStack,
        resolvedQuery,
      ],
    );

    const getNavigationKeys = useCallback(() => {
      if (hasDataCommands) {
        return enabledKeys;
      }

      return Array.from(itemRefs.current.keys());
    }, [enabledKeys, hasDataCommands]);

    const selectByOffset = useCallback(
      (offset: number) => {
        const navigationKeys = getNavigationKeys();

        if (navigationKeys.length === 0) {
          return;
        }

        const currentIndex = resolvedSelectedKey
          ? navigationKeys.indexOf(resolvedSelectedKey)
          : -1;
        if (currentIndex === -1) {
          clearTransientAnnouncements();
          setResolvedSelectedKey(
            offset >= 0
              ? (navigationKeys[0] ?? null)
              : (navigationKeys[navigationKeys.length - 1] ?? null),
          );
          return;
        }

        const startIndex = currentIndex;
        const nextIndex =
          (startIndex + offset + navigationKeys.length) % navigationKeys.length;

        clearTransientAnnouncements();
        setResolvedSelectedKey(navigationKeys[nextIndex] ?? null);
      },
      [
        clearTransientAnnouncements,
        getNavigationKeys,
        resolvedSelectedKey,
        setResolvedSelectedKey,
      ],
    );

    const handleInputKeyDown = useCallback<
      KeyboardEventHandler<HTMLInputElement>
    >(
      (event) => {
        const navigationKeys = getNavigationKeys();

        if (event.key === "ArrowDown") {
          event.preventDefault();
          selectByOffset(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          selectByOffset(-1);
        } else if (event.key === "Home" && navigationKeys.length > 0) {
          event.preventDefault();
          updateSelectedKey(navigationKeys[0] ?? null);
        } else if (event.key === "End" && navigationKeys.length > 0) {
          event.preventDefault();
          updateSelectedKey(navigationKeys[navigationKeys.length - 1] ?? null);
        } else if (event.key === "Enter" && resolvedSelectedKey) {
          const element = itemRefs.current.get(resolvedSelectedKey);

          if (element) {
            event.preventDefault();
            element.click();
          }
        } else if (event.key === "Escape") {
          if (resolvedPageStack.length > 0) {
            event.preventDefault();
            popPage();
          } else if (!dialogActionContext && resolvedQuery) {
            event.preventDefault();
            updateQuery("");
          }
        }
      },
      [
        dialogActionContext,
        getNavigationKeys,
        popPage,
        resolvedPageStack.length,
        resolvedQuery,
        resolvedSelectedKey,
        selectByOffset,
        updateQuery,
        updateSelectedKey,
      ],
    );

    const handleRootKeyDownCapture = useCallback<
      KeyboardEventHandler<HTMLDivElement>
    >(
      (event) => {
        onKeyDownCapture?.(event);

        if (
          !event.defaultPrevented &&
          event.key === "Escape" &&
          resolvedPageStack.length > 0
        ) {
          event.preventDefault();
          event.stopPropagation();
          popPage();
        }
      },
      [onKeyDownCapture, popPage, resolvedPageStack.length],
    );

    useEffect(() => {
      if (!hasDataCommands) {
        return;
      }

      if (enabledKeys.length === 0) {
        if (resolvedSelectedKey !== null) {
          setResolvedSelectedKey(null);
        }

        return;
      }

      if (!resolvedSelectedKey || !enabledKeys.includes(resolvedSelectedKey)) {
        setResolvedSelectedKey(enabledKeys[0] ?? null);
      }
    }, [
      enabledKeys,
      hasDataCommands,
      resolvedSelectedKey,
      setResolvedSelectedKey,
    ]);

    const resolvedAriaLabel =
      ariaLabel ?? (label || ariaLabelledBy ? undefined : "Command palette");
    const rootRole =
      props.role ?? (resolvedAriaLabel || ariaLabelledBy ? "group" : undefined);
    const statusAnnouncement = (() => {
      if (!hasDataCommands) {
        return undefined;
      }

      if (hasError) {
        return `${getNodeText(resolvedError) ?? "Command search failed."}${
          resolvedOnRetry ? " Retry available." : ""
        }`;
      }

      if (showMinimumQuery) {
        return getNodeText(resolvedMinimumQueryMessage);
      }

      if (resolvedLoading && resultCommands.length === 0) {
        return getNodeText(resolvedLoadingMessage);
      }

      if (resultCommands.length === 0) {
        return getNodeText(resolvedEmptyMessage);
      }

      return `${formatCommandCount(resultCommands.length)} available${
        normalizedQuery ? ` for ${normalizedQuery}` : ""
      }${activePageTitleText ? ` in ${activePageTitleText}` : ""}.`;
    })();
    const selectedAnnouncement =
      activeCommand && hasDataCommands
        ? `Selected ${getCommandText(activeCommand)}${
            formatSourceLabel(activeCommand.source)
              ? ` from ${formatSourceLabel(activeCommand.source)}`
              : ""
          }.`
        : undefined;
    const visibleStatusAnnouncesStatus =
      hasError ||
      showMinimumQuery ||
      (resolvedLoading && resultCommands.length === 0) ||
      shouldRenderEmpty;
    const liveStatusAnnouncement = visibleStatusAnnouncesStatus
      ? undefined
      : statusAnnouncement;
    const liveAnnouncement = announcements
      ? [
          pageAnnouncement,
          liveStatusAnnouncement,
          selectedAnnouncement,
          runAnnouncement,
        ]
          .filter(Boolean)
          .join(" ")
      : "";

    const contextValue = useMemo<CommandPaletteContextValue>(
      () => ({
        activeCommand,
        controlSize,
        inputAriaLabel: resolvedAriaLabel,
        inputId,
        labelId,
        motionEnabled,
        motionPreset: resolvedMotionPreset,
        reducedMotion: resolvedReducedMotion,
        selectedIndicatorLayoutId,
        onInputKeyDown: handleInputKeyDown,
        page: activePageId,
        pageDirection,
        pageStack: resolvedPageStack,
        popPage,
        query: resolvedQuery,
        registerItem,
        runCommand,
        selectedKey: resolvedSelectedKey,
        setQuery: updateQuery,
        setSelectedKey: updateSelectedKey,
        unregisterItem,
      }),
      [
        activeCommand,
        activePageId,
        controlSize,
        handleInputKeyDown,
        resolvedAriaLabel,
        inputId,
        labelId,
        motionEnabled,
        pageDirection,
        popPage,
        registerItem,
        resolvedMotionPreset,
        resolvedReducedMotion,
        resolvedPageStack,
        resolvedQuery,
        resolvedSelectedKey,
        runCommand,
        selectedIndicatorLayoutId,
        unregisterItem,
        updateQuery,
        updateSelectedKey,
      ],
    );

    const pageFrame = (
      <CommandPalettePageFrame
        key={activePageId ?? "root"}
        data-page={activePageId ?? "root"}
        data-page-depth={resolvedPageStack.length}
        data-page-direction={pageDirection}
        data-state={activePageId ? "nested" : "root"}
      >
        {activePageId ? (
          <CommandPalettePageHeader aria-labelledby={pageTitleId}>
            <CommandPalettePageBack
              aria-label={getNodeText(pageBackLabel) ? undefined : "Back"}
            >
              {pageBackLabel}
            </CommandPalettePageBack>
            <span className={commandPalettePageHeadingClasses}>
              <span
                id={pageTitleId}
                data-slot="command-palette-page-title"
                className={commandPalettePageTitleClasses}
              >
                {activePage?.title ?? activePageId}
              </span>
              {activePage?.description ? (
                <span
                  data-slot="command-palette-page-description"
                  className={commandPalettePageDescriptionClasses}
                >
                  {activePage.description}
                </span>
              ) : null}
            </span>
          </CommandPalettePageHeader>
        ) : null}
        <CommandPaletteList
          data-error={hasError ? "true" : undefined}
          data-loading={resolvedLoading ? "true" : undefined}
          data-minimum-query={showMinimumQuery ? "true" : undefined}
          data-stale={hasStaleResults ? "true" : undefined}
        >
          {showMinimumQuery ? (
            <CommandPaletteStatus data-state="minimum-query">
              {resolvedMinimumQueryMessage}
            </CommandPaletteStatus>
          ) : null}
          {renderedChildren}
          {hasError ? (
            <CommandPaletteError>
              <span>{resolvedError}</span>
              {resolvedOnRetry ? (
                <CommandPaletteRetry onClick={resolvedOnRetry}>
                  {resolvedRetryLabel}
                </CommandPaletteRetry>
              ) : null}
            </CommandPaletteError>
          ) : resolvedLoading && resultCommands.length === 0 ? (
            <CommandPaletteLoading>
              {resolvedLoadingMessage}
            </CommandPaletteLoading>
          ) : resolvedLoading ? (
            <CommandPaletteLoading data-state="stale">
              {resolvedStaleMessage}
            </CommandPaletteLoading>
          ) : null}
          {shouldRenderEmpty ? (
            <CommandPaletteEmpty>{resolvedEmptyMessage}</CommandPaletteEmpty>
          ) : null}
        </CommandPaletteList>
      </CommandPalettePageFrame>
    );

    return (
      <MotionConfig
        reducedMotion={
          resolvedReducedMotion || resolvedMotionPreset === "none"
            ? "always"
            : "user"
        }
        transition={motionSettings.resultTransition}
      >
        <CommandPaletteContext.Provider value={contextValue}>
          <div
            {...props}
            ref={ref}
            aria-label={resolvedAriaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-busy={resolvedLoading || undefined}
            role={rootRole}
            data-empty={shouldRenderEmpty ? "true" : undefined}
            data-error={hasError ? "true" : undefined}
            data-loading={resolvedLoading ? "true" : undefined}
            data-minimum-query={showMinimumQuery ? "true" : undefined}
            data-mode={dialogActionContext ? "dialog" : "inline"}
            data-motion={resolvedMotionPreset}
            data-page={activePageId ?? "root"}
            data-page-depth={resolvedPageStack.length}
            data-page-direction={pageDirection}
            data-reduced-motion={resolvedReducedMotion ? "true" : undefined}
            data-size={controlSize}
            data-slot="command-palette"
            data-stale={hasStaleResults ? "true" : undefined}
            onKeyDownCapture={handleRootKeyDownCapture}
            className={commandPaletteClassNames({
              className: cn(
                dialogActionContext && commandPaletteInDialogClasses,
                className,
              ),
            })}
          >
            {compoundChildren ? (
              renderedChildren
            ) : (
              <>
                <div
                  data-slot="command-palette-header"
                  className={commandPaletteHeaderClasses}
                >
                  {label ? (
                    <label
                      id={labelId}
                      data-slot="command-palette-label"
                      htmlFor={inputId}
                      className={commandPaletteLabelClasses}
                    >
                      {label}
                    </label>
                  ) : null}
                  {description ? (
                    <p
                      data-slot="command-palette-description"
                      className={commandPaletteDescriptionClasses}
                    >
                      {description}
                    </p>
                  ) : null}
                  {/* eslint-disable jsx-a11y/no-autofocus -- Initial focus belongs in this newly opened modal. */}
                  <CommandPaletteInput
                    aria-label={label ? undefined : resolvedAriaLabel}
                    autoFocus={dialogActionContext ? true : undefined}
                    placeholder={placeholder}
                  />
                  {/* eslint-enable jsx-a11y/no-autofocus */}
                </div>
                <CommandPalettePageStack
                  data-page={activePageId ?? "root"}
                  data-page-depth={resolvedPageStack.length}
                  data-page-direction={pageDirection}
                >
                  {motionEnabled ? (
                    <AnimatePresence
                      custom={{
                        direction: pageDirection,
                        offset: motionSettings.pageOffset,
                      }}
                      initial={false}
                      mode="sync"
                    >
                      {pageFrame}
                    </AnimatePresence>
                  ) : (
                    pageFrame
                  )}
                </CommandPalettePageStack>
                {liveAnnouncement ? (
                  <CommandPaletteAnnouncer>
                    {liveAnnouncement}
                  </CommandPaletteAnnouncer>
                ) : null}
              </>
            )}
          </div>
        </CommandPaletteContext.Provider>
      </MotionConfig>
    );
  },
);

CommandPalette.displayName = "CommandPalette";

export const CommandPaletteDialog = forwardRef<
  HTMLDivElement,
  CommandPaletteDialogProps
>(
  (
    {
      children,
      className,
      closeOnRun = true,
      "data-slot": dataSlot,
      motionPreset = "standard",
      reducedMotion,
      ...props
    },
    ref,
  ) => {
    const configValue = useMemo<CommandPaletteDialogConfigContextValue>(
      () => ({ closeOnRun, motionPreset, reducedMotion }),
      [closeOnRun, motionPreset, reducedMotion],
    );

    return (
      <CommandPaletteDialogConfigContext.Provider value={configValue}>
        <Dialog
          {...props}
          ref={ref}
          data-slot={dataSlot ?? "command-palette-dialog"}
          className={commandPaletteDialogClassNames({ className })}
        >
          {children}
        </Dialog>
      </CommandPaletteDialogConfigContext.Provider>
    );
  },
);

CommandPaletteDialog.displayName = "CommandPaletteDialog";

export const CommandPaletteTrigger = forwardRef<
  HTMLButtonElement,
  CommandPaletteTriggerProps
>(({ className, size = "md", variant = "solid", ...props }, ref) => (
  <DialogTrigger
    {...props}
    ref={ref}
    data-slot="command-palette-trigger"
    size={size}
    variant={variant}
    className={commandPaletteTriggerClassNames({ className, size, variant })}
  />
));

CommandPaletteTrigger.displayName = "CommandPaletteTrigger";

export const CommandPaletteContent = forwardRef<
  HTMLDivElement,
  CommandPaletteContentProps
>(
  (
    {
      children,
      className,
      closeOnRun,
      description,
      motionPreset: motionPresetProp,
      overlayClassName,
      reducedMotion: reducedMotionProp,
      scrollBehavior = "inside",
      size = "lg",
      title,
      titleVisuallyHidden = true,
      ...props
    },
    ref,
  ) => {
    const dialogConfig = useContext(CommandPaletteDialogConfigContext);
    const prefersReducedMotion = useReducedMotion();
    const fallbackAriaLabel =
      title || props["aria-label"] || props["aria-labelledby"]
        ? undefined
        : "Command menu";
    const resolvedCloseOnRun = closeOnRun ?? dialogConfig?.closeOnRun ?? true;
    const resolvedMotionPreset =
      motionPresetProp ?? dialogConfig?.motionPreset ?? "standard";
    const resolvedReducedMotion =
      reducedMotionProp ??
      dialogConfig?.reducedMotion ??
      prefersReducedMotion === true;

    return (
      <DialogContent
        {...props}
        ref={ref}
        aria-label={props["aria-label"] ?? fallbackAriaLabel}
        data-motion={resolvedMotionPreset}
        data-reduced-motion={resolvedReducedMotion ? "true" : undefined}
        overlayClassName={commandPaletteOverlayClassNames({
          className: cn(
            commandPaletteDialogOverlayMotionClasses[resolvedMotionPreset],
            overlayClassName,
          ),
        })}
        scrollBehavior={scrollBehavior}
        size={size}
        className={commandPaletteContentClassNames({
          className: cn(
            commandPaletteDialogContentMotionClasses[resolvedMotionPreset],
            className,
          ),
          scrollBehavior,
          size,
        })}
      >
        {(opts) => {
          const actionContextValue: CommandPaletteDialogActionContextValue = {
            close: opts.close,
            closeOnRun: resolvedCloseOnRun,
          };
          const renderedChildren =
            typeof children === "function" ? children(opts) : children;

          return (
            <CommandPaletteDialogActionContext.Provider
              value={actionContextValue}
            >
              <div
                data-motion={resolvedMotionPreset}
                data-reduced-motion={resolvedReducedMotion ? "true" : undefined}
                data-slot="command-palette-content"
                className={commandPaletteDialogBodyClasses}
              >
                {title ? (
                  <DialogTitle visuallyHidden={titleVisuallyHidden}>
                    {title}
                  </DialogTitle>
                ) : null}
                {description ? (
                  <DialogDescription className="sr-only">
                    {description}
                  </DialogDescription>
                ) : null}
                {renderedChildren}
              </div>
            </CommandPaletteDialogActionContext.Provider>
          );
        }}
      </DialogContent>
    );
  },
);

CommandPaletteContent.displayName = "CommandPaletteContent";

export const CommandPaletteInput = forwardRef<
  HTMLInputElement,
  CommandPaletteInputProps
>(
  (
    {
      "aria-labelledby": ariaLabelledBy,
      className,
      controlSize,
      onChange,
      onKeyDown,
      type = "search",
      value,
      ...props
    },
    ref,
  ) => {
    const context = useContext(CommandPaletteContext);
    const resolvedControlSize = controlSize ?? context?.controlSize ?? "md";
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      onChange?.(event);

      if (!event.defaultPrevented && value === undefined) {
        context?.setQuery(event.currentTarget.value);
      }
    };
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      onKeyDown?.(event);

      if (!event.defaultPrevented) {
        context?.onInputKeyDown(event);
      }
    };

    return (
      <input
        {...props}
        ref={ref}
        id={props.id ?? context?.inputId}
        aria-label={
          props["aria-label"] ??
          ((ariaLabelledBy ?? context?.labelId)
            ? undefined
            : context?.inputAriaLabel)
        }
        aria-labelledby={ariaLabelledBy ?? context?.labelId}
        data-slot="command-palette-input"
        data-size={resolvedControlSize}
        type={type}
        value={value ?? context?.query}
        className={commandPaletteInputClassNames({
          className,
          controlSize: resolvedControlSize,
        })}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    );
  },
);

CommandPaletteInput.displayName = "CommandPaletteInput";

export const CommandPaletteList = forwardRef<
  HTMLDivElement,
  CommandPaletteListProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    data-slot="command-palette-list"
    className={commandPaletteListClassNames({ className })}
  />
));

CommandPaletteList.displayName = "CommandPaletteList";

export const CommandPaletteGroup = forwardRef<
  HTMLElement,
  CommandPaletteGroupProps
>(({ children, className, heading, ...props }, ref) => {
  const headingId = useId();

  return (
    <section
      {...props}
      ref={ref}
      aria-labelledby={heading ? headingId : undefined}
      data-slot="command-palette-group"
      className={commandPaletteGroupClassNames({ className })}
    >
      {heading ? (
        <div
          id={headingId}
          data-slot="command-palette-group-heading"
          className={commandPaletteGroupHeadingClasses}
        >
          {heading}
        </div>
      ) : null}
      {children}
    </section>
  );
});

CommandPaletteGroup.displayName = "CommandPaletteGroup";

export const CommandPaletteItem = forwardRef<
  HTMLElement,
  CommandPaletteItemProps
>(
  (
    {
      asChild = false,
      children,
      className,
      command,
      destructive,
      disabled,
      disabledReason,
      href,
      onAction,
      onClick,
      page,
      rel,
      shortcut,
      target,
      value,
      ...props
    },
    ref,
  ) => {
    const context = useContext(CommandPaletteContext);
    const resolvedCommand = commandFromItemProps({
      command,
      destructive,
      disabled,
      disabledReason,
      href,
      onAction,
      page,
      rel,
      shortcut,
      target,
      value,
    });
    const resolvedDisabled = resolvedCommand.disabled === true;
    const resolvedDestructive = resolvedCommand.destructive === true;
    const selected = context?.selectedKey === value;
    const registeredNodeRef = useRef<HTMLElement | null>(null);
    const itemRef = useCallback(
      (node: HTMLElement | null) => {
        const previousNode = registeredNodeRef.current;

        if (previousNode && previousNode !== node) {
          context?.unregisterItem(value, previousNode);
          registeredNodeRef.current = null;
        }

        if (node && !resolvedDisabled) {
          context?.registerItem(value, node);
          registeredNodeRef.current = node;
        }
      },
      [context, resolvedDisabled, value],
    );
    const composedRef = composeRefs(ref, itemRef);
    const classes = commandPaletteItemClassNames({
      className: cn("group/command-palette-item", className),
      controlSize: context?.controlSize,
    });
    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
      if (resolvedDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      (onClick as MouseEventHandler<HTMLElement> | undefined)?.(event);

      if (!event.defaultPrevented) {
        context?.runCommand(resolvedCommand);
      }
    };
    const handleMouseEnter: MouseEventHandler<HTMLElement> = (event) => {
      props.onMouseEnter?.(event);

      if (!event.defaultPrevented && !resolvedDisabled) {
        context?.setSelectedKey(value);
      }
    };
    const handleFocus: FocusEventHandler<HTMLElement> = (event) => {
      props.onFocus?.(event);

      if (!event.defaultPrevented && !resolvedDisabled) {
        context?.setSelectedKey(value);
      }
    };
    const commonProps = {
      ...props,
      "aria-disabled": resolvedDisabled ? true : undefined,
      "data-destructive": resolvedDestructive ? "true" : undefined,
      "data-disabled": resolvedDisabled ? "true" : undefined,
      "data-page": resolvedCommand.page,
      "data-selected": selected ? "true" : undefined,
      "data-slot": "command-palette-item",
      "data-source": resolvedCommand.source,
      className: classes,
      onClick: handleClick,
      onFocus: handleFocus,
      onMouseEnter: handleMouseEnter,
    };

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<CommandPaletteItemSlotProps>(child)) {
        throw new Error(
          "CommandPaletteItem with asChild expects a single React element child.",
        );
      }

      const resolvedHref = child.props.href ?? resolvedCommand.href;
      const resolvedTarget = child.props.target ?? resolvedCommand.target;
      const resolvedRel = mergeRelForTarget(
        child.props.rel ?? resolvedCommand.rel,
        resolvedTarget,
      );

      const clonedProps: CommandPaletteItemSlotProps = {
        ...commonProps,
        ...child.props,
        ref: (node) => {
          composeRefs(composedRef, getChildRef(child))(node);
        },
        className: cn(classes, child.props.className),
        onClick: composeEventHandlers(child.props.onClick, handleClick),
        onFocus: composeEventHandlers(child.props.onFocus, handleFocus),
        onMouseEnter: composeEventHandlers(
          child.props.onMouseEnter,
          handleMouseEnter,
        ),
      };

      if (resolvedHref !== undefined) {
        clonedProps.href = resolvedHref;
      }

      if (resolvedRel !== undefined) {
        clonedProps.rel = resolvedRel;
      }

      if (resolvedTarget !== undefined) {
        clonedProps.target = resolvedTarget;
      }

      return cloneElement(child, clonedProps);
    }

    if (resolvedCommand.href) {
      return (
        <a
          {...(commonProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={composedRef as Ref<HTMLAnchorElement>}
          href={resolvedCommand.href}
          rel={mergeRelForTarget(resolvedCommand.rel, resolvedCommand.target)}
          target={resolvedCommand.target}
        >
          {selected ? <CommandPaletteSelectedIndicator /> : null}
          {children ?? renderDefaultCommandContent(resolvedCommand)}
        </a>
      );
    }

    return (
      <button
        {...(commonProps as ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={composedRef as Ref<HTMLButtonElement>}
        disabled={resolvedDisabled}
        type="button"
      >
        {selected ? <CommandPaletteSelectedIndicator /> : null}
        {children ?? renderDefaultCommandContent(resolvedCommand)}
      </button>
    );
  },
);

CommandPaletteItem.displayName = "CommandPaletteItem";

export const CommandPaletteItemIcon = forwardRef<
  HTMLSpanElement,
  CommandPaletteItemIconProps
>(({ className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    aria-hidden={props["aria-hidden"] ?? true}
    data-slot="command-palette-item-icon"
    className={cn(commandPaletteItemIconClasses, className)}
  />
));

CommandPaletteItemIcon.displayName = "CommandPaletteItemIcon";

export const CommandPaletteItemLabel = forwardRef<
  HTMLSpanElement,
  CommandPaletteItemLabelProps
>(({ className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    data-slot="command-palette-item-label"
    className={cn(commandPaletteItemLabelClasses, className)}
  />
));

CommandPaletteItemLabel.displayName = "CommandPaletteItemLabel";

export const CommandPaletteItemDescription = forwardRef<
  HTMLSpanElement,
  CommandPaletteItemDescriptionProps
>(({ className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    data-slot="command-palette-item-description"
    className={cn(commandPaletteItemDescriptionClasses, className)}
  />
));

CommandPaletteItemDescription.displayName = "CommandPaletteItemDescription";

export const CommandPaletteItemShortcut = forwardRef<
  HTMLElement,
  CommandPaletteItemShortcutProps
>(({ className, ...props }, ref) => (
  <kbd
    {...props}
    ref={ref as Ref<HTMLElement>}
    data-slot="command-palette-item-shortcut"
    className={cn(commandPaletteItemShortcutClasses, className)}
  />
));

CommandPaletteItemShortcut.displayName = "CommandPaletteItemShortcut";

export const CommandPaletteSeparator = forwardRef<
  HTMLDivElement,
  CommandPaletteSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    aria-hidden="true"
    data-slot="command-palette-separator"
    className={commandPaletteSeparatorClassNames({ className })}
  />
));

CommandPaletteSeparator.displayName = "CommandPaletteSeparator";

export const CommandPaletteStatus = forwardRef<
  HTMLDivElement,
  CommandPaletteStatusProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    role={props.role ?? "status"}
    data-slot="command-palette-status"
    className={commandPaletteStatusClassNames({ className })}
  />
));

CommandPaletteStatus.displayName = "CommandPaletteStatus";

export const CommandPaletteLoading = forwardRef<
  HTMLDivElement,
  CommandPaletteLoadingProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    role={props.role ?? "status"}
    data-slot="command-palette-loading"
    className={commandPaletteLoadingClassNames({ className })}
  />
));

CommandPaletteLoading.displayName = "CommandPaletteLoading";

export const CommandPaletteError = forwardRef<
  HTMLDivElement,
  CommandPaletteErrorProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    role={props.role ?? "status"}
    data-slot="command-palette-error"
    className={commandPaletteErrorClassNames({ className })}
  />
));

CommandPaletteError.displayName = "CommandPaletteError";

export const CommandPaletteRetry = forwardRef<
  HTMLButtonElement,
  CommandPaletteRetryProps
>(({ className, type = "button", ...props }, ref) => (
  <button
    {...props}
    ref={ref}
    type={type}
    data-slot="command-palette-retry"
    className={commandPaletteRetryClassNames({ className })}
  />
));

CommandPaletteRetry.displayName = "CommandPaletteRetry";

export const CommandPaletteAnnouncer = forwardRef<
  HTMLDivElement,
  CommandPaletteAnnouncerProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    aria-atomic={props["aria-atomic"] ?? true}
    aria-live={props["aria-live"] ?? "polite"}
    data-slot="command-palette-announcer"
    className={commandPaletteAnnouncerClassNames({ className })}
  />
));

CommandPaletteAnnouncer.displayName = "CommandPaletteAnnouncer";

export const CommandPalettePageStack = forwardRef<
  HTMLDivElement,
  CommandPalettePageStackProps
>(
  (
    {
      className,
      "data-page": dataPage,
      "data-page-depth": dataPageDepth,
      "data-page-direction": dataPageDirection,
      ...props
    },
    ref,
  ) => {
    const context = useContext(CommandPaletteContext);

    return (
      <div
        {...props}
        ref={ref}
        data-page={dataPage ?? context?.page ?? "root"}
        data-page-depth={dataPageDepth ?? context?.pageStack.length ?? 0}
        data-page-direction={dataPageDirection ?? context?.pageDirection}
        data-slot="command-palette-page-stack"
        className={commandPalettePageStackClassNames({ className })}
      />
    );
  },
);

CommandPalettePageStack.displayName = "CommandPalettePageStack";

export const CommandPalettePage = forwardRef<
  HTMLElement,
  CommandPalettePageProps
>(
  (
    {
      className,
      "data-page": dataPage,
      "data-page-depth": dataPageDepth,
      "data-page-direction": dataPageDirection,
      ...props
    },
    ref,
  ) => {
    const context = useContext(CommandPaletteContext);

    return (
      <section
        {...props}
        ref={ref}
        data-page={dataPage ?? context?.page ?? "root"}
        data-page-depth={dataPageDepth ?? context?.pageStack.length ?? 0}
        data-page-direction={dataPageDirection ?? context?.pageDirection}
        data-slot="command-palette-page"
        className={commandPalettePageClassNames({ className })}
      />
    );
  },
);

CommandPalettePage.displayName = "CommandPalettePage";

export const CommandPalettePageHeader = forwardRef<
  HTMLElement,
  CommandPalettePageHeaderProps
>(({ className, ...props }, ref) => (
  <header
    {...props}
    ref={ref}
    data-slot="command-palette-page-header"
    className={commandPalettePageHeaderClassNames({ className })}
  />
));

CommandPalettePageHeader.displayName = "CommandPalettePageHeader";

export const CommandPalettePageBack = forwardRef<
  HTMLButtonElement,
  CommandPalettePageBackProps
>(({ className, disabled, onClick, type = "button", ...props }, ref) => {
  const context = useContext(CommandPaletteContext);
  const resolvedDisabled =
    disabled ?? (context ? context.pageStack.length === 0 : false);
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);

    if (!event.defaultPrevented && !resolvedDisabled) {
      context?.popPage();
    }
  };

  return (
    <button
      {...props}
      ref={ref}
      disabled={resolvedDisabled}
      type={type}
      data-slot="command-palette-page-back"
      className={commandPalettePageBackClassNames({ className })}
      onClick={handleClick}
    />
  );
});

CommandPalettePageBack.displayName = "CommandPalettePageBack";

export const CommandPaletteEmpty = forwardRef<
  HTMLDivElement,
  CommandPaletteEmptyProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    role="status"
    data-slot="command-palette-empty"
    className={commandPaletteEmptyClassNames({ className })}
  />
));

CommandPaletteEmpty.displayName = "CommandPaletteEmpty";
