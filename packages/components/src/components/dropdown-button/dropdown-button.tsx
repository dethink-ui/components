import {
  forwardRef,
  isValidElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import type { Selection } from "react-aria-components";
import {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "../button";
import { ButtonGroup } from "../button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  type DropdownMenuMotionPreset,
} from "../dropdown-menu";
import type { PositionedOverlayPositionProps } from "../../utils/positioned-overlay";
import { cn } from "../../utils/cn";

export type DropdownButtonMode = "menu" | "split" | "selectable";
export type DropdownButtonMotionPreset = DropdownMenuMotionPreset;
export type DropdownButtonLoadingBehavior = "all" | "primary";

interface DropdownButtonSharedProps extends PositionedOverlayPositionProps {
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  contentClassName?: string;
  defaultOpen?: boolean;
  disabled?: boolean;
  groupClassName?: string;
  menuClassName?: string;
  motionPreset?: DropdownButtonMotionPreset;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  reducedMotion?: boolean;
  showArrow?: boolean;
  size?: ButtonSize;
  triggerClassName?: string;
  variant?: ButtonVariant;
}

export interface DropdownButtonMenuProps extends DropdownButtonSharedProps {
  actions?: never;
  children?: ReactNode;
  defaultSelectedActionId?: never;
  label: ReactNode;
  mode?: "menu";
  onSelectedActionChange?: never;
  selectedActionId?: never;

  /** Reserved for split mode. Direct primary actions are invalid in menu mode. */
  onPrimaryAction?: never;
  /** Reserved for split mode's separately named icon trigger. */
  menuLabel?: never;
  /** Reserved for split mode's primary icon. */
  primaryIcon?: never;
  /** Reserved for split mode's async primary action. */
  loading?: never;
  /** Reserved for split mode's async policy. */
  loadingBehavior?: never;
  /** Reserved for split mode's independent primary state. */
  primaryDisabled?: never;
  /** Reserved for split mode's independent menu state. */
  menuDisabled?: never;
}

export interface DropdownButtonSplitProps extends DropdownButtonSharedProps {
  actions?: never;
  children?: ReactNode;
  defaultSelectedActionId?: never;
  label: ReactNode;
  loading?: boolean;
  loadingBehavior?: DropdownButtonLoadingBehavior;
  menuLabel: string;
  menuDisabled?: boolean;
  mode: "split";
  onPrimaryAction: NonNullable<ButtonProps["onClick"]>;
  onSelectedActionChange?: never;
  primaryDisabled?: boolean;
  primaryIcon?: ReactNode;
  selectedActionId?: never;
}

export interface DropdownButtonSelectableAction {
  description?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  id: string;
  label: string;
  onAction: NonNullable<ButtonProps["onClick"]>;
}

interface DropdownButtonSelectableSharedProps extends DropdownButtonSharedProps {
  actions: readonly DropdownButtonSelectableAction[];
  children?: never;
  label?: never;
  loading?: boolean;
  loadingBehavior?: DropdownButtonLoadingBehavior;
  menuDisabled?: boolean;
  menuLabel: string;
  mode: "selectable";
  onPrimaryAction?: never;
  primaryDisabled?: boolean;
  primaryIcon?: never;
}

export type DropdownButtonSelectableControlledProps =
  DropdownButtonSelectableSharedProps & {
    defaultSelectedActionId?: never;
    onSelectedActionChange: (actionId: string) => void;
    selectedActionId: string;
  };

export type DropdownButtonSelectableUncontrolledProps =
  DropdownButtonSelectableSharedProps & {
    defaultSelectedActionId: string;
    onSelectedActionChange?: (actionId: string) => void;
    selectedActionId?: never;
  };

export type DropdownButtonSelectableProps =
  | DropdownButtonSelectableControlledProps
  | DropdownButtonSelectableUncontrolledProps;

export type DropdownButtonProps =
  | DropdownButtonMenuProps
  | DropdownButtonSplitProps
  | DropdownButtonSelectableProps;

const dropdownButtonRootClasses = "inline-flex w-fit max-w-full";
const dropdownButtonTriggerIconClasses =
  "pointer-events-none inline-flex size-4 shrink-0 items-center justify-center";

const dropdownButtonSplitTriggerSizeClasses: Record<ButtonSize, string> = {
  xs: "w-7 !p-0",
  sm: "w-8 !p-0",
  md: "w-density-control !p-0",
  lg: "w-11 !p-0",
  xl: "w-12 !p-0",
  icon: "w-density-control !p-0",
};

const dropdownButtonChevronDuration: Record<
  DropdownButtonMotionPreset,
  number
> = {
  none: 0,
  subtle: 0.12,
  standard: 0.16,
};

const dropdownButtonBusyIndicatorClasses =
  "size-4 rounded-full border-2 border-current border-r-transparent";

const dropdownButtonSelectionIndicatorClasses =
  "inline-flex size-4 items-center justify-center text-foreground";

const dropdownButtonPrimaryLabelMeasureClasses =
  "pointer-events-none invisible absolute inset-y-0 start-0 inline-flex w-max items-center whitespace-nowrap";

function getDropdownButtonNodeKey(node: ReactNode, fallback: string) {
  if (typeof node === "string" || typeof node === "number") {
    return `${fallback}-${String(node)}`;
  }

  if (isValidElement(node) && node.key != null) {
    return `${fallback}-${String(node.key)}`;
  }

  return fallback;
}

function measureDropdownButtonLabelInlineSize(node: HTMLElement) {
  return Math.ceil(node.scrollWidth || node.getBoundingClientRect().width);
}

function useDropdownButtonLabelInlineSize(
  contentKey: string | undefined,
  label: ReactNode,
) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [inlineSize, setInlineSize] = useState<number>();

  useEffect(() => {
    const node = measureRef.current;

    if (!node) {
      return undefined;
    }

    const measure = () => {
      const nextInlineSize = measureDropdownButtonLabelInlineSize(node);

      if (nextInlineSize > 0) {
        setInlineSize((current) =>
          current === nextInlineSize ? current : nextInlineSize,
        );
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => observer.disconnect();
  }, [contentKey, label]);

  return [measureRef, inlineSize] as const;
}

function resolveDropdownButtonSelectableAction(
  actions: readonly DropdownButtonSelectableAction[],
  selectedActionId: string | undefined,
) {
  if (actions.length === 0) {
    throw new Error(
      "DropdownButton selectable mode requires at least one action.",
    );
  }

  const actionIds = new Set<string>();

  for (const action of actions) {
    if (actionIds.has(action.id)) {
      throw new Error(
        `DropdownButton selectable action IDs must be unique. Duplicate ID: ${action.id}`,
      );
    }

    actionIds.add(action.id);
  }

  const selectedAction = actions.find(
    (action) => action.id === selectedActionId,
  );

  if (!selectedAction) {
    throw new Error(
      `DropdownButton selectable mode could not find selected action ID: ${String(selectedActionId)}`,
    );
  }

  return selectedAction;
}

export function dropdownButtonClassNames({
  className,
}: Pick<DropdownButtonProps, "className"> = {}) {
  return cn(dropdownButtonRootClasses, className);
}

function ChevronDownIcon({
  motionPreset,
  open,
  reducedMotion,
}: {
  motionPreset: DropdownButtonMotionPreset;
  open: boolean;
  reducedMotion: boolean;
}) {
  return (
    <motion.span
      aria-hidden="true"
      animate={{ rotate: open ? 180 : 0 }}
      data-open={open ? "" : undefined}
      data-slot="dropdown-button-trigger-icon"
      className={dropdownButtonTriggerIconClasses}
      initial={false}
      transition={{
        duration:
          reducedMotion || motionPreset === "none"
            ? 0
            : dropdownButtonChevronDuration[motionPreset],
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <ChevronDown className="size-full" strokeWidth={1.75} />
    </motion.span>
  );
}

function DropdownButtonPrimaryLabel({
  contentKey,
  label,
  motionPreset,
  reducedMotion,
}: {
  contentKey?: string;
  label: ReactNode;
  motionPreset: DropdownButtonMotionPreset;
  reducedMotion: boolean;
}) {
  const motionDisabled = reducedMotion || motionPreset === "none";
  const [measureRef, measuredInlineSize] = useDropdownButtonLabelInlineSize(
    contentKey,
    label,
  );

  return (
    <motion.span
      animate={
        measuredInlineSize === undefined
          ? undefined
          : { width: measuredInlineSize }
      }
      initial={false}
      data-inline-size={measuredInlineSize}
      data-slot="dropdown-button-primary-label-viewport"
      className="relative inline-grid min-w-0 overflow-hidden"
      transition={{
        width: {
          duration: motionDisabled
            ? 0
            : dropdownButtonChevronDuration[motionPreset],
          ease: [0.16, 1, 0.3, 1],
        },
      }}
    >
      <AnimatePresence initial={false} mode="sync">
        <DropdownButtonPrimaryLabelItem
          key={contentKey ?? getDropdownButtonNodeKey(label, "primary-label")}
          label={label}
          motionDisabled={motionDisabled}
          motionPreset={motionPreset}
        />
      </AnimatePresence>
      <span
        ref={measureRef}
        aria-hidden="true"
        data-slot="dropdown-button-primary-label-measure"
        className={dropdownButtonPrimaryLabelMeasureClasses}
      >
        {label}
      </span>
    </motion.span>
  );
}

function DropdownButtonPrimaryLabelItem({
  label,
  motionDisabled,
  motionPreset,
}: {
  label: ReactNode;
  motionDisabled: boolean;
  motionPreset: DropdownButtonMotionPreset;
}) {
  const isPresent = useIsPresent();

  return (
    <motion.span
      animate={motionDisabled ? { opacity: 1 } : { opacity: 1, y: 0 }}
      initial={motionDisabled ? false : { opacity: 0, y: -2 }}
      exit={motionDisabled ? { opacity: 1 } : { opacity: 0, y: 2 }}
      aria-hidden={isPresent ? undefined : true}
      data-slot="dropdown-button-label"
      className="col-start-1 row-start-1 min-w-0 truncate"
      transition={{
        duration: motionDisabled
          ? 0
          : dropdownButtonChevronDuration[motionPreset],
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {label}
    </motion.span>
  );
}

function DropdownButtonPrimaryIcon({
  contentKey,
  icon,
  motionPreset,
  reducedMotion,
}: {
  contentKey?: string;
  icon: ReactNode;
  motionPreset: DropdownButtonMotionPreset;
  reducedMotion: boolean;
}) {
  const motionDisabled = reducedMotion || motionPreset === "none";

  return (
    <AnimatePresence initial={false} mode="sync">
      {icon ? (
        <motion.span
          key={contentKey ?? getDropdownButtonNodeKey(icon, "primary-icon")}
          animate={motionDisabled ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          initial={motionDisabled ? false : { opacity: 0, scale: 0.9 }}
          exit={motionDisabled ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          data-slot="dropdown-button-primary-icon"
          className="inline-flex size-4 items-center justify-center"
          transition={{
            duration: motionDisabled
              ? 0
              : dropdownButtonChevronDuration[motionPreset],
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {icon}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

function DropdownButtonBusyIndicator({
  motionDisabled,
}: {
  motionDisabled: boolean;
}) {
  return (
    <motion.span
      key="dropdown-button-busy"
      animate={motionDisabled ? { opacity: 0.7 } : { opacity: 1, rotate: 360 }}
      initial={motionDisabled ? false : { opacity: 0, rotate: 0 }}
      data-slot="dropdown-button-busy-indicator"
      className={dropdownButtonBusyIndicatorClasses}
      transition={
        motionDisabled
          ? { duration: 0 }
          : {
              duration: 0.8,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }
      }
    />
  );
}

function DropdownButtonSelectionIndicator({
  motionPreset,
  reducedMotion,
  selected,
}: {
  motionPreset: DropdownButtonMotionPreset;
  reducedMotion: boolean;
  selected: boolean;
}) {
  const motionDisabled = reducedMotion || motionPreset === "none";

  return (
    <span
      aria-hidden="true"
      data-slot="dropdown-button-selection-indicator-slot"
      className={dropdownButtonSelectionIndicatorClasses}
    >
      <AnimatePresence initial={false}>
        {selected ? (
          <motion.span
            key="selected"
            animate={
              motionDisabled ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
            }
            initial={motionDisabled ? false : { opacity: 0, scale: 0.8, y: -2 }}
            exit={
              motionDisabled ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 2 }
            }
            data-slot="dropdown-button-selection-indicator"
            className="inline-flex"
            transition={{
              duration: motionDisabled
                ? 0
                : dropdownButtonChevronDuration[motionPreset],
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

export const DropdownButton = forwardRef<HTMLDivElement, DropdownButtonProps>(
  (
    {
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      actions,
      arrowBoundaryOffset,
      children,
      className,
      containerPadding,
      contentClassName,
      crossOffset,
      defaultOpen = false,
      defaultSelectedActionId,
      disabled = false,
      groupClassName,
      label,
      loading = false,
      loadingBehavior = "all",
      menuClassName,
      menuDisabled = false,
      menuLabel,
      mode = "menu",
      motionPreset = "standard",
      offset,
      onOpenChange,
      onPrimaryAction,
      onSelectedActionChange,
      open,
      placement,
      primaryDisabled = false,
      primaryIcon,
      reducedMotion,
      selectedActionId,
      shouldFlip,
      showArrow = false,
      size = "md",
      triggerClassName,
      variant = "outline",
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const [uncontrolledSelectedActionId, setUncontrolledSelectedActionId] =
      useState(defaultSelectedActionId);
    const compositeRef = useRef<HTMLDivElement>(null);
    const primaryRef = useRef<HTMLElement>(null);
    const prefersReducedMotion = useReducedMotion();
    const isControlled = open !== undefined;
    const resolvedOpen = open ?? uncontrolledOpen;
    const resolvedReducedMotion =
      reducedMotion ?? prefersReducedMotion === true;
    const isSelectable = mode === "selectable";
    const hasPrimary = mode !== "menu";
    const isSelectionControlled = selectedActionId !== undefined;
    const resolvedSelectedActionId =
      selectedActionId ?? uncontrolledSelectedActionId;
    const selectedAction = isSelectable
      ? resolveDropdownButtonSelectableAction(
          actions ?? [],
          resolvedSelectedActionId,
        )
      : undefined;
    const selectedKeys = useMemo(
      () =>
        isSelectable && resolvedSelectedActionId
          ? new Set([resolvedSelectedActionId])
          : undefined,
      [isSelectable, resolvedSelectedActionId],
    );
    const resolvedLabel = selectedAction?.label ?? label;
    const resolvedPrimaryIcon = selectedAction?.icon ?? primaryIcon;
    const resolvedPrimaryAction = selectedAction?.onAction ?? onPrimaryAction;
    const resolvedVariant = selectedAction?.destructive
      ? "destructive"
      : variant;
    const primaryUnavailable =
      disabled ||
      primaryDisabled ||
      loading ||
      (isSelectable && selectedAction?.disabled === true);
    const menuUnavailable =
      disabled || menuDisabled || (loading && loadingBehavior === "all");
    const effectiveOpen = resolvedOpen && !menuUnavailable;
    const groupLabel = ariaLabelledBy
      ? undefined
      : (ariaLabel ??
        (typeof resolvedLabel === "string" ? resolvedLabel : undefined));
    const handleOpenChange = (nextOpen: boolean) => {
      if (nextOpen && menuUnavailable) {
        return;
      }

      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    };
    const handleSelectionChange = (selection: Selection) => {
      if (!isSelectable || selection === "all") {
        return;
      }

      const nextActionId = [...selection][0];

      if (
        typeof nextActionId !== "string" ||
        nextActionId === resolvedSelectedActionId
      ) {
        return;
      }

      const nextAction = actions?.find((action) => action.id === nextActionId);

      if (!nextAction || nextAction.disabled) {
        return;
      }

      if (!isSelectionControlled) {
        setUncontrolledSelectedActionId(nextActionId);
      }

      onSelectedActionChange?.(nextActionId);
    };
    useEffect(() => {
      if (!resolvedOpen || !menuUnavailable) {
        return undefined;
      }

      if (!isControlled) {
        setUncontrolledOpen(false);
      }
      onOpenChange?.(false);

      if (hasPrimary && !primaryUnavailable) {
        const frame = requestAnimationFrame(() => primaryRef.current?.focus());
        return () => cancelAnimationFrame(frame);
      }

      return undefined;
    }, [
      isControlled,
      hasPrimary,
      menuUnavailable,
      onOpenChange,
      primaryUnavailable,
      resolvedOpen,
    ]);
    const chevron = (
      <ChevronDownIcon
        motionPreset={motionPreset}
        open={effectiveOpen}
        reducedMotion={resolvedReducedMotion}
      />
    );
    const menuChildren = isSelectable
      ? actions?.map((action) => (
          <DropdownMenuItem
            key={action.id}
            destructive={action.destructive}
            disabled={action.disabled}
            id={action.id}
            textValue={action.label}
          >
            {(itemState) => (
              <>
                <DropdownMenuItemIcon aria-hidden="true">
                  {itemState.isSelected ? (
                    <DropdownButtonSelectionIndicator
                      motionPreset={motionPreset}
                      reducedMotion={resolvedReducedMotion}
                      selected
                    />
                  ) : (
                    action.icon
                  )}
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel className="font-semibold">
                  {action.label}
                </DropdownMenuItemLabel>
                {action.description ? (
                  <DropdownMenuItemDescription className="text-sm leading-5">
                    {action.description}
                  </DropdownMenuItemDescription>
                ) : null}
              </>
            )}
          </DropdownMenuItem>
        ))
      : children;

    return (
      <div
        ref={ref}
        data-disabled={disabled ? "" : undefined}
        data-loading={loading ? "" : undefined}
        data-loading-behavior={hasPrimary ? loadingBehavior : undefined}
        data-menu-disabled={menuUnavailable ? "" : undefined}
        data-mode={mode}
        data-motion={motionPreset}
        data-open={effectiveOpen ? "" : undefined}
        data-primary-disabled={primaryUnavailable ? "" : undefined}
        data-reduced-motion={resolvedReducedMotion ? "" : undefined}
        data-selected-action-id={
          isSelectable ? resolvedSelectedActionId : undefined
        }
        data-slot="dropdown-button"
        data-state={effectiveOpen ? "open" : "closed"}
        className={dropdownButtonClassNames({ className })}
      >
        <DropdownMenu
          className="contents"
          data-slot="dropdown-button-menu-anchor"
          motionPreset={motionPreset}
          onOpenChange={handleOpenChange}
          open={effectiveOpen}
          reducedMotion={resolvedReducedMotion}
        >
          <ButtonGroup
            ref={compositeRef}
            aria-label={groupLabel}
            aria-labelledby={ariaLabelledBy}
            className={groupClassName}
            data-slot="dropdown-button-composite"
          >
            {hasPrimary ? (
              <Button
                ref={primaryRef}
                data-slot="dropdown-button-primary"
                disabled={
                  disabled ||
                  primaryDisabled ||
                  (isSelectable && selectedAction?.disabled === true)
                }
                leftIcon={
                  isSelectable || resolvedPrimaryIcon ? (
                    <DropdownButtonPrimaryIcon
                      contentKey={
                        isSelectable ? resolvedSelectedActionId : undefined
                      }
                      icon={resolvedPrimaryIcon}
                      motionPreset={motionPreset}
                      reducedMotion={resolvedReducedMotion}
                    />
                  ) : undefined
                }
                loading={loading}
                loadingIndicator={
                  <DropdownButtonBusyIndicator
                    motionDisabled={
                      resolvedReducedMotion || motionPreset === "none"
                    }
                  />
                }
                onClick={resolvedPrimaryAction}
                size={size}
                variant={resolvedVariant}
              >
                <DropdownButtonPrimaryLabel
                  contentKey={
                    isSelectable ? resolvedSelectedActionId : undefined
                  }
                  label={resolvedLabel}
                  motionPreset={motionPreset}
                  reducedMotion={resolvedReducedMotion}
                />
              </Button>
            ) : null}
            <DropdownMenuTrigger
              aria-describedby={ariaDescribedBy}
              aria-label={hasPrimary ? menuLabel : ariaLabel}
              aria-labelledby={hasPrimary ? undefined : ariaLabelledBy}
              className={cn(
                hasPrimary && dropdownButtonSplitTriggerSizeClasses[size],
                triggerClassName,
              )}
              data-slot={
                hasPrimary
                  ? "dropdown-button-menu-trigger"
                  : "dropdown-button-trigger"
              }
              disabled={menuUnavailable}
              size={size}
              variant={resolvedVariant}
            >
              {hasPrimary ? (
                chevron
              ) : (
                <>
                  <span data-slot="dropdown-button-label">{resolvedLabel}</span>
                  {chevron}
                </>
              )}
            </DropdownMenuTrigger>
          </ButtonGroup>
          <DropdownMenuContent
            anchorRef={hasPrimary ? compositeRef : undefined}
            arrowBoundaryOffset={arrowBoundaryOffset}
            className={cn("min-w-[var(--trigger-width)]", contentClassName)}
            containerPadding={containerPadding}
            crossOffset={crossOffset}
            data-slot="dropdown-button-content"
            disallowEmptySelection={isSelectable || undefined}
            menuClassName={menuClassName}
            offset={offset}
            onSelectionChange={isSelectable ? handleSelectionChange : undefined}
            placement={placement}
            selectedKeys={selectedKeys}
            selectionMode={isSelectable ? "single" : undefined}
            shouldFlip={shouldFlip}
            showArrow={showArrow}
          >
            {menuChildren}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);

DropdownButton.displayName = "DropdownButton";
