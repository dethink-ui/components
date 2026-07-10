import {
  Button as AriaButton,
  Header as AriaHeader,
  Keyboard as AriaKeyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  OverlayTriggerStateContext,
  Popover as AriaPopover,
  Separator as AriaSeparator,
  SubmenuTrigger as AriaSubmenuTrigger,
  Text as AriaText,
  type ButtonProps as AriaButtonProps,
  type HeaderProps as AriaHeaderProps,
  type MenuItemProps as AriaMenuItemProps,
  type MenuItemRenderProps as AriaMenuItemRenderProps,
  type MenuProps as AriaMenuProps,
  type MenuSectionProps as AriaMenuSectionProps,
  type MenuTriggerProps as AriaMenuTriggerProps,
  type PopoverProps as AriaPopoverProps,
  type SeparatorProps as AriaSeparatorProps,
  type SubmenuTriggerProps as AriaSubmenuTriggerProps,
  type TextProps as AriaTextProps,
} from "react-aria-components";
import { useIsSSR } from "react-aria";
import {
  AnimatePresence,
  motion,
  usePresence,
  useReducedMotion,
  type Transition,
} from "motion/react";
import {
  Children,
  createContext,
  forwardRef,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  Button,
  buttonClassNames,
  type ButtonSize,
  type ButtonVariant,
} from "../button";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
} from "../../utils/provider-portal";
import {
  PositionedOverlayArrow,
  type PositionedOverlayArrowProps,
  positionedOverlayArrowClassNames,
  positionedOverlayDropdownMenuDefaults,
  positionedOverlayDropdownSubmenuDefaults,
  positionedOverlaySurfaceClassNames,
  resolvePositionedOverlayPositionProps,
} from "../../utils/positioned-overlay";
import type { PositionedOverlayPositionProps } from "../../utils/positioned-overlay";
import { cn } from "../../utils/cn";

export interface DropdownMenuProps extends Omit<
  AriaMenuTriggerProps,
  "children" | "isOpen" | "onOpenChange"
> {
  "data-slot"?: string;
  children?: ReactNode;
  className?: string;
  motionPreset?: DropdownMenuMotionPreset;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  reducedMotion?: boolean;
}

export type DropdownMenuMotionPreset = "none" | "subtle" | "standard";

export interface DropdownMenuTriggerProps extends Omit<
  AriaButtonProps,
  "children" | "className" | "isDisabled"
> {
  "data-slot"?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export interface DropdownMenuContentProps<T extends object = object>
  extends Omit<AriaMenuProps<T>, "className">, PositionedOverlayPositionProps {
  "data-slot"?: string;
  anchorRef?: AriaPopoverProps["triggerRef"];
  arrowClassName?: string;
  arrowShapeClassName?: string;
  className?: string;
  menuClassName?: string;
  showArrow?: boolean;
}

export interface DropdownMenuSubmenuContentProps<
  T extends object = object,
> extends DropdownMenuContentProps<T> {}

export interface DropdownMenuItemProps<T extends object = object> extends Omit<
  AriaMenuItemProps<T>,
  "children" | "className" | "isDisabled"
> {
  children?: ReactNode | ((opts: AriaMenuItemRenderProps) => ReactNode);
  className?: string;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuSectionProps<
  T extends object = object,
> extends Omit<AriaMenuSectionProps<T>, "className"> {
  className?: string;
}

export interface DropdownMenuSubmenuProps extends Omit<
  AriaSubmenuTriggerProps,
  "children"
> {
  children: ReactElement[];
}

export interface DropdownMenuArrowProps extends PositionedOverlayArrowProps {}

export interface DropdownMenuLabelProps extends Omit<
  AriaHeaderProps,
  "className"
> {
  className?: string;
}

export interface DropdownMenuSeparatorProps extends Omit<
  AriaSeparatorProps,
  "className"
> {
  className?: string;
}

export interface DropdownMenuItemIconProps extends HTMLAttributes<HTMLSpanElement> {}

export interface DropdownMenuItemLabelProps extends Omit<
  AriaTextProps,
  "className" | "slot"
> {
  className?: string;
}

export interface DropdownMenuItemDescriptionProps extends Omit<
  AriaTextProps,
  "className" | "slot"
> {
  className?: string;
}

export interface DropdownMenuItemShortcutProps extends HTMLAttributes<HTMLElement> {
  className?: string;
}

const dropdownMenuRootClasses = "contents";

const dropdownMenuPositionerClasses = "z-50 overflow-visible outline-none";

const dropdownMenuContentClasses =
  "min-w-[var(--dt-dropdown-menu-min-width,13rem)] max-w-[min(var(--dt-dropdown-menu-max-width,18rem),calc(100vw_-_var(--dt-space-4)))] overflow-visible p-[var(--dt-space-1)]";

const dropdownMenuMenuClasses =
  "grid max-h-[min(var(--dt-dropdown-menu-max-height,20rem),calc(100dvh_-_var(--dt-space-4)))] gap-0 overflow-auto outline-none";

const dropdownMenuItemClasses =
  "group/dropdown-menu-item grid min-h-8 cursor-default grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-sm leading-5 text-foreground outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focused]:bg-muted data-[hovered]:bg-muted data-[open]:bg-muted data-[pressed]:bg-muted/80 data-[destructive=true]:text-destructive data-[destructive=true]:data-[focused]:bg-destructive/10 data-[destructive=true]:data-[hovered]:bg-destructive/10 data-[destructive=true]:data-[pressed]:bg-destructive/15";

const dropdownMenuItemIconClasses =
  "flex size-4 shrink-0 items-center justify-center text-muted-foreground group-data-[destructive=true]/dropdown-menu-item:text-destructive [&>svg]:size-4";

const dropdownMenuItemLabelClasses = "min-w-0 truncate";

const dropdownMenuItemDescriptionClasses =
  "col-start-2 min-w-0 text-xs leading-5 text-muted-foreground group-data-[destructive=true]/dropdown-menu-item:text-destructive/80";

const dropdownMenuItemShortcutClasses =
  "ms-[var(--dt-space-4)] justify-self-end rounded-sm bg-muted px-[var(--dt-space-1)] py-0.5 font-mono text-[0.6875rem] leading-4 text-muted-foreground";

const dropdownMenuLabelClasses =
  "px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-xs font-semibold uppercase tracking-normal text-muted-foreground";

const dropdownMenuSeparatorClasses =
  "my-[var(--dt-space-1)] h-px border-0 bg-border";

const dropdownMenuSectionClasses = "grid gap-0";

const dropdownMenuSubmenuIconClasses =
  "ms-[var(--dt-space-2)] size-4 justify-self-end text-muted-foreground rtl:rotate-180";

interface DropdownMenuMotionContextValue {
  motionPreset: DropdownMenuMotionPreset;
  reducedMotion: boolean;
}

const DropdownMenuMotionContext = createContext<DropdownMenuMotionContextValue>(
  {
    motionPreset: "standard",
    reducedMotion: false,
  },
);

const dropdownMenuMotionSettings: Record<
  DropdownMenuMotionPreset,
  {
    distance: number;
    duration: number;
    itemFocusScale: number;
    itemPressScale: number;
    surfaceScale: number;
  }
> = {
  none: {
    distance: 0,
    duration: 0,
    itemFocusScale: 1,
    itemPressScale: 1,
    surfaceScale: 1,
  },
  subtle: {
    distance: 2,
    duration: 0.12,
    itemFocusScale: 1.002,
    itemPressScale: 0.99,
    surfaceScale: 0.995,
  },
  standard: {
    distance: 4,
    duration: 0.16,
    itemFocusScale: 1.004,
    itemPressScale: 0.985,
    surfaceScale: 0.985,
  },
};

const dropdownMenuMotionEase = [0.16, 1, 0.3, 1] as const;

function getDropdownMenuSurfaceOffset(placement: string, distance: number) {
  const side = placement.split(" ")[0];

  switch (side) {
    case "top":
      return { x: 0, y: distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    default:
      return { x: 0, y: -distance };
  }
}

export function dropdownMenuClassNames({
  className,
}: Pick<DropdownMenuProps, "className"> = {}) {
  return cn(dropdownMenuRootClasses, className);
}

export function dropdownMenuTriggerClassNames({
  className,
  size = "md",
  variant = "outline",
}: Pick<DropdownMenuTriggerProps, "className" | "size" | "variant"> = {}) {
  return buttonClassNames({ className, size, variant });
}

export function dropdownMenuContentClassNames({
  className,
}: Pick<DropdownMenuContentProps, "className"> = {}) {
  return cn(
    positionedOverlaySurfaceClassNames({ animation: "none" }),
    dropdownMenuContentClasses,
    className,
  );
}

export function dropdownMenuMenuClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(dropdownMenuMenuClasses, className);
}

export function dropdownMenuItemClassNames({
  className,
}: Pick<DropdownMenuItemProps, "className"> = {}) {
  return cn(dropdownMenuItemClasses, className);
}

export function dropdownMenuItemIconClassNames({
  className,
}: Pick<DropdownMenuItemIconProps, "className"> = {}) {
  return cn(dropdownMenuItemIconClasses, className);
}

export function dropdownMenuItemLabelClassNames({
  className,
}: Pick<DropdownMenuItemLabelProps, "className"> = {}) {
  return cn(dropdownMenuItemLabelClasses, className);
}

export function dropdownMenuItemDescriptionClassNames({
  className,
}: Pick<DropdownMenuItemDescriptionProps, "className"> = {}) {
  return cn(dropdownMenuItemDescriptionClasses, className);
}

export function dropdownMenuItemShortcutClassNames({
  className,
}: Pick<DropdownMenuItemShortcutProps, "className"> = {}) {
  return cn(dropdownMenuItemShortcutClasses, className);
}

export function dropdownMenuLabelClassNames({
  className,
}: Pick<DropdownMenuLabelProps, "className"> = {}) {
  return cn(dropdownMenuLabelClasses, className);
}

export function dropdownMenuSeparatorClassNames({
  className,
}: Pick<DropdownMenuSeparatorProps, "className"> = {}) {
  return cn(dropdownMenuSeparatorClasses, className);
}

export function dropdownMenuSectionClassNames({
  className,
}: Pick<DropdownMenuSectionProps, "className"> = {}) {
  return cn(dropdownMenuSectionClasses, className);
}

export function dropdownMenuArrowClassNames({
  className,
}: Pick<DropdownMenuArrowProps, "className"> = {}) {
  return positionedOverlayArrowClassNames({ className });
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className={dropdownMenuSubmenuIconClasses}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="m6 4 4 4-4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function renderMenuItemChildren(
  children: DropdownMenuItemProps["children"],
  opts: AriaMenuItemRenderProps,
) {
  const renderedChildren =
    typeof children === "function" ? children(opts) : children;

  if (
    typeof renderedChildren === "string" ||
    typeof renderedChildren === "number"
  ) {
    return (
      <>
        <DropdownMenuItemIcon aria-hidden="true" />
        <DropdownMenuItemLabel>{renderedChildren}</DropdownMenuItemLabel>
        {opts.hasSubmenu ? <ChevronRightIcon /> : null}
      </>
    );
  }

  return (
    <>
      {renderedChildren}
      {opts.hasSubmenu ? <ChevronRightIcon /> : null}
    </>
  );
}

interface DropdownMenuMotionPopoverProps<T extends object = object> {
  anchorRef?: AriaPopoverProps["triggerRef"];
  arrowClassName?: string;
  arrowShapeClassName?: string;
  children: DropdownMenuContentProps<T>["children"];
  className?: string;
  contentSlot: string;
  menuClassName?: string;
  menuProps: Omit<AriaMenuProps<T>, "children" | "className">;
  positionProps: Required<PositionedOverlayPositionProps>;
  showArrow: boolean;
  surfaceRef: ForwardedRef<HTMLElement>;
}

function DropdownMenuMotionPopover<T extends object = object>({
  anchorRef,
  arrowClassName,
  arrowShapeClassName,
  children,
  className,
  contentSlot,
  menuClassName,
  menuProps,
  positionProps,
  showArrow,
  surfaceRef,
}: DropdownMenuMotionPopoverProps<T>) {
  const [isPresent, safeToRemove] = usePresence();
  const { motionPreset, reducedMotion } = useContext(DropdownMenuMotionContext);
  const settings = dropdownMenuMotionSettings[motionPreset];
  const motionDisabled = motionPreset === "none";
  const transition: Transition = {
    duration: reducedMotion ? 0.08 : settings.duration,
    ease: dropdownMenuMotionEase,
  };

  return (
    <AriaPopover
      {...positionProps}
      isExiting={!isPresent}
      triggerRef={anchorRef}
      className={dropdownMenuPositionerClasses}
    >
      {({ placement }) => {
        const offset = getDropdownMenuSurfaceOffset(
          placement ?? "bottom",
          settings.distance,
        );
        const hidden = reducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: settings.surfaceScale,
              x: offset.x,
              y: offset.y,
            };
        const visible = reducedMotion
          ? { opacity: 1 }
          : { opacity: 1, scale: 1, x: 0, y: 0 };

        return (
          <motion.div
            ref={surfaceRef as ForwardedRef<HTMLDivElement>}
            animate={visible}
            initial={motionDisabled ? false : hidden}
            exit={motionDisabled ? visible : hidden}
            data-motion={motionPreset}
            data-placement={placement}
            data-reduced-motion={reducedMotion ? "" : undefined}
            data-slot={contentSlot}
            data-state={isPresent ? "open" : "closed"}
            className={dropdownMenuContentClassNames({ className })}
            transition={motionDisabled ? { duration: 0 } : transition}
            onAnimationComplete={() => {
              if (!isPresent) {
                safeToRemove?.();
              }
            }}
          >
            {showArrow ? (
              <DropdownMenuArrow
                className={arrowClassName}
                shapeClassName={arrowShapeClassName}
              />
            ) : null}
            <AriaMenu
              {...menuProps}
              data-slot="dropdown-menu-menu"
              className={dropdownMenuMenuClassNames({
                className: menuClassName,
              })}
            >
              {children}
            </AriaMenu>
          </motion.div>
        );
      }}
    </AriaPopover>
  );
}

function DropdownMenuContentRoot<T extends object = object>(
  {
    "data-slot": dataSlot,
    anchorRef,
    arrowBoundaryOffset,
    arrowClassName,
    arrowShapeClassName,
    children,
    className,
    containerPadding,
    crossOffset,
    menuClassName,
    offset,
    placement,
    shouldFlip,
    showArrow = false,
    ...props
  }: DropdownMenuContentProps<T>,
  ref: ForwardedRef<HTMLElement>,
  defaults: Required<PositionedOverlayPositionProps> = positionedOverlayDropdownMenuDefaults,
  contentSlot = "dropdown-menu-content",
) {
  const positionProps = resolvePositionedOverlayPositionProps(
    {
      arrowBoundaryOffset,
      containerPadding,
      crossOffset,
      offset,
      placement,
      shouldFlip,
    },
    defaults,
  );
  const isSSR = useIsSSR();
  const overlayState = useContext(OverlayTriggerStateContext);
  const isOpen = (overlayState?.isOpen ?? false) && !isSSR;

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <DropdownMenuMotionPopover
          key={dataSlot ?? contentSlot}
          anchorRef={anchorRef}
          arrowClassName={arrowClassName}
          arrowShapeClassName={arrowShapeClassName}
          className={className}
          contentSlot={dataSlot ?? contentSlot}
          menuClassName={menuClassName}
          menuProps={props}
          positionProps={positionProps}
          showArrow={showArrow}
          surfaceRef={ref}
        >
          {children}
        </DropdownMenuMotionPopover>
      ) : null}
    </AnimatePresence>
  );
}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  (
    {
      "data-slot": dataSlot,
      children,
      className,
      defaultOpen,
      motionPreset = "standard",
      onOpenChange,
      open,
      reducedMotion,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(
      defaultOpen ?? false,
    );
    const isControlled = open !== undefined;
    const resolvedOpen = open ?? uncontrolledOpen;
    const prefersReducedMotion = useReducedMotion();
    const resolvedReducedMotion =
      reducedMotion ?? prefersReducedMotion === true;
    const { portalContainer, rootRef } = useProviderPortalRoot<HTMLDivElement>({
      forwardedRef: ref,
      portalSlot: "dropdown-menu-portal-container",
    });
    const handleOpenChange = (isOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(isOpen);
      }

      onOpenChange?.(isOpen);
    };

    return (
      <div
        ref={rootRef}
        data-slot={dataSlot ?? "dropdown-menu"}
        data-motion={motionPreset}
        data-open={resolvedOpen ? "" : undefined}
        data-reduced-motion={resolvedReducedMotion ? "" : undefined}
        className={dropdownMenuClassNames({ className })}
      >
        <DropdownMenuMotionContext.Provider
          value={{
            motionPreset,
            reducedMotion: resolvedReducedMotion,
          }}
        >
          <DethinkPortalProvider container={portalContainer}>
            <AriaMenuTrigger
              {...props}
              isOpen={resolvedOpen}
              onOpenChange={handleOpenChange}
            >
              {children}
            </AriaMenuTrigger>
          </DethinkPortalProvider>
        </DropdownMenuMotionContext.Provider>
      </div>
    );
  },
);

DropdownMenu.displayName = "DropdownMenu";

export const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(
  (
    {
      "data-slot": dataSlot = "dropdown-menu-trigger",
      children,
      className,
      disabled = false,
      size = "md",
      variant = "outline",
      ...props
    },
    ref,
  ) => (
    <Button
      asChild
      className={className}
      data-slot={dataSlot}
      disabled={disabled}
      size={size}
      variant={variant}
    >
      <AriaButton {...props} ref={ref} isDisabled={disabled}>
        {children}
      </AriaButton>
    </Button>
  ),
);

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent = forwardRef<
  HTMLElement,
  DropdownMenuContentProps
>((props, ref) => DropdownMenuContentRoot(props, ref));

DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuSubmenuContent = forwardRef<
  HTMLElement,
  DropdownMenuSubmenuContentProps
>((props, ref) =>
  DropdownMenuContentRoot(
    props,
    ref,
    positionedOverlayDropdownSubmenuDefaults,
    "dropdown-menu-submenu-content",
  ),
);

DropdownMenuSubmenuContent.displayName = "DropdownMenuSubmenuContent";

export const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(
  (
    {
      children,
      className,
      destructive = false,
      disabled = false,
      textValue,
      ...props
    },
    ref,
  ) => {
    const resolvedTextValue =
      textValue ??
      (typeof children === "string" || typeof children === "number"
        ? String(children)
        : undefined);

    const { motionPreset, reducedMotion } = useContext(
      DropdownMenuMotionContext,
    );
    const motionSettings = dropdownMenuMotionSettings[motionPreset];
    const motionDisabled = reducedMotion || motionPreset === "none";

    return (
      <AriaMenuItem
        {...props}
        ref={ref}
        data-destructive={destructive ? "true" : undefined}
        data-slot="dropdown-menu-item"
        isDisabled={disabled || undefined}
        textValue={resolvedTextValue}
        className={dropdownMenuItemClassNames({ className })}
      >
        {(opts) => {
          const itemScale = opts.isPressed
            ? motionSettings.itemPressScale
            : opts.isFocused || opts.isHovered
              ? motionSettings.itemFocusScale
              : 1;

          return (
            <motion.div
              animate={
                motionDisabled
                  ? { opacity: 1 }
                  : {
                      opacity: opts.isPressed ? 0.82 : 1,
                      scale: itemScale,
                    }
              }
              data-slot="dropdown-menu-item-feedback"
              className="col-span-full grid min-w-0 grid-cols-subgrid items-center gap-[var(--dt-space-2)]"
              transition={{
                duration: motionDisabled ? 0 : motionSettings.duration,
                ease: dropdownMenuMotionEase,
              }}
            >
              {renderMenuItemChildren(children, opts)}
            </motion.div>
          );
        }}
      </AriaMenuItem>
    );
  },
);

DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSection = forwardRef<
  HTMLElement,
  DropdownMenuSectionProps
>(({ className, ...props }, ref) => (
  <AriaMenuSection
    {...props}
    ref={ref}
    data-slot="dropdown-menu-section"
    className={dropdownMenuSectionClassNames({ className })}
  />
));

DropdownMenuSection.displayName = "DropdownMenuSection";

export const DropdownMenuSubmenu = forwardRef<
  HTMLDivElement,
  DropdownMenuSubmenuProps
>(({ children, ...props }, ref) => {
  const resolvedChildren = useMemo(
    () => Children.toArray(children) as ReactElement[],
    [children],
  );

  return (
    <AriaSubmenuTrigger {...props} ref={ref}>
      {resolvedChildren}
    </AriaSubmenuTrigger>
  );
});

DropdownMenuSubmenu.displayName = "DropdownMenuSubmenu";

export const DropdownMenuArrow = forwardRef<
  HTMLDivElement,
  DropdownMenuArrowProps
>(({ className, ...props }, ref) => (
  <PositionedOverlayArrow
    {...props}
    ref={ref}
    data-slot="dropdown-menu-arrow"
    className={dropdownMenuArrowClassNames({ className })}
  />
));

DropdownMenuArrow.displayName = "DropdownMenuArrow";

export const DropdownMenuLabel = forwardRef<
  HTMLElement,
  DropdownMenuLabelProps
>(({ className, ...props }, ref) => (
  <AriaHeader
    {...props}
    ref={ref}
    data-slot="dropdown-menu-label"
    className={dropdownMenuLabelClassNames({ className })}
  />
));

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = forwardRef<
  HTMLElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <AriaSeparator
    {...props}
    ref={ref}
    data-slot="dropdown-menu-separator"
    className={dropdownMenuSeparatorClassNames({ className })}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuItemIcon = forwardRef<
  HTMLSpanElement,
  DropdownMenuItemIconProps
>(({ className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    data-slot="dropdown-menu-item-icon"
    className={dropdownMenuItemIconClassNames({ className })}
  />
));

DropdownMenuItemIcon.displayName = "DropdownMenuItemIcon";

export const DropdownMenuItemLabel = forwardRef<
  HTMLElement,
  DropdownMenuItemLabelProps
>(({ className, ...props }, ref) => (
  <AriaText
    {...props}
    ref={ref}
    slot="label"
    data-slot="dropdown-menu-item-label"
    className={dropdownMenuItemLabelClassNames({ className })}
  />
));

DropdownMenuItemLabel.displayName = "DropdownMenuItemLabel";

export const DropdownMenuItemDescription = forwardRef<
  HTMLElement,
  DropdownMenuItemDescriptionProps
>(({ className, ...props }, ref) => (
  <AriaText
    {...props}
    ref={ref}
    slot="description"
    data-slot="dropdown-menu-item-description"
    className={dropdownMenuItemDescriptionClassNames({ className })}
  />
));

DropdownMenuItemDescription.displayName = "DropdownMenuItemDescription";

export const DropdownMenuItemShortcut = forwardRef<
  HTMLElement,
  DropdownMenuItemShortcutProps
>(({ className, ...props }, ref) => (
  <AriaKeyboard
    {...props}
    ref={ref}
    data-slot="dropdown-menu-item-shortcut"
    className={dropdownMenuItemShortcutClassNames({ className })}
  />
));

DropdownMenuItemShortcut.displayName = "DropdownMenuItemShortcut";
