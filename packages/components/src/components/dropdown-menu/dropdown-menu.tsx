import {
  Button as AriaButton,
  Header as AriaHeader,
  Keyboard as AriaKeyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
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
  type SeparatorProps as AriaSeparatorProps,
  type SubmenuTriggerProps as AriaSubmenuTriggerProps,
  type TextProps as AriaTextProps,
} from "react-aria-components";
import {
  Children,
  forwardRef,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import {
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

export interface DropdownMenuProps
  extends Omit<
    AriaMenuTriggerProps,
    "children" | "isOpen" | "onOpenChange"
  > {
  "data-slot"?: string;
  children?: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export interface DropdownMenuTriggerProps
  extends Omit<AriaButtonProps, "children" | "className" | "isDisabled"> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export interface DropdownMenuContentProps<T extends object = object>
  extends Omit<AriaMenuProps<T>, "className">,
    PositionedOverlayPositionProps {
  arrowClassName?: string;
  arrowShapeClassName?: string;
  className?: string;
  menuClassName?: string;
  showArrow?: boolean;
}

export interface DropdownMenuSubmenuContentProps<T extends object = object>
  extends DropdownMenuContentProps<T> {}

export interface DropdownMenuItemProps<T extends object = object>
  extends Omit<
    AriaMenuItemProps<T>,
    "children" | "className" | "isDisabled"
  > {
  children?: ReactNode | ((opts: AriaMenuItemRenderProps) => ReactNode);
  className?: string;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuSectionProps<T extends object = object>
  extends Omit<AriaMenuSectionProps<T>, "className"> {
  className?: string;
}

export interface DropdownMenuSubmenuProps
  extends Omit<AriaSubmenuTriggerProps, "children"> {
  children: ReactElement[];
}

export interface DropdownMenuArrowProps extends PositionedOverlayArrowProps {}

export interface DropdownMenuLabelProps
  extends Omit<AriaHeaderProps, "className"> {
  className?: string;
}

export interface DropdownMenuSeparatorProps
  extends Omit<AriaSeparatorProps, "className"> {
  className?: string;
}

export interface DropdownMenuItemIconProps
  extends HTMLAttributes<HTMLSpanElement> {}

export interface DropdownMenuItemLabelProps
  extends Omit<AriaTextProps, "className" | "slot"> {
  className?: string;
}

export interface DropdownMenuItemDescriptionProps
  extends Omit<AriaTextProps, "className" | "slot"> {
  className?: string;
}

export interface DropdownMenuItemShortcutProps
  extends HTMLAttributes<HTMLElement> {
  className?: string;
}

const dropdownMenuRootClasses = "contents";

const dropdownMenuContentClasses =
  "min-w-[var(--dt-dropdown-menu-min-width,13rem)] max-w-[min(var(--dt-dropdown-menu-max-width,18rem),calc(100vw_-_var(--dt-space-4)))] overflow-visible p-[var(--dt-space-1)]";

const dropdownMenuMenuClasses =
  "grid max-h-[min(var(--dt-dropdown-menu-max-height,20rem),calc(100dvh_-_var(--dt-space-4)))] gap-0 overflow-auto outline-none";

const dropdownMenuItemClasses =
  "group/dropdown-menu-item grid min-h-8 cursor-default grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-sm leading-5 text-foreground outline-none motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focused]:bg-muted data-[hovered]:bg-muted data-[open]:bg-muted data-[pressed]:bg-muted/80 data-[destructive=true]:text-destructive data-[destructive=true]:data-[focused]:bg-destructive/10 data-[destructive=true]:data-[hovered]:bg-destructive/10 data-[destructive=true]:data-[pressed]:bg-destructive/15";

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
    positionedOverlaySurfaceClassNames(),
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

  if (typeof renderedChildren === "string" || typeof renderedChildren === "number") {
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

function DropdownMenuContentRoot<T extends object = object>(
  {
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
  defaults: Required<PositionedOverlayPositionProps> =
    positionedOverlayDropdownMenuDefaults,
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

  return (
    <AriaPopover
      {...positionProps}
      ref={ref}
      data-slot="dropdown-menu-content"
      className={dropdownMenuContentClassNames({ className })}
    >
      {showArrow ? (
        <DropdownMenuArrow
          className={arrowClassName}
          shapeClassName={arrowShapeClassName}
        />
      ) : null}
      <AriaMenu
        {...props}
        data-slot="dropdown-menu-menu"
        className={dropdownMenuMenuClassNames({ className: menuClassName })}
      >
        {children}
      </AriaMenu>
    </AriaPopover>
  );
}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  (
    {
      "data-slot": dataSlot,
      children,
      className,
      defaultOpen,
      onOpenChange,
      open,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
    const isControlled = open !== undefined;
    const resolvedOpen = open ?? uncontrolledOpen;
    const {
      portalContainer,
      rootRef,
    } = useProviderPortalRoot<HTMLDivElement>({
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
        data-open={resolvedOpen ? "" : undefined}
        className={dropdownMenuClassNames({ className })}
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
      children,
      className,
      disabled = false,
      size = "md",
      variant = "outline",
      ...props
    },
    ref,
  ) => (
    <AriaButton
      {...props}
      ref={ref}
      data-slot="dropdown-menu-trigger"
      isDisabled={disabled}
      className={dropdownMenuTriggerClassNames({ className, size, variant })}
    >
      {children}
    </AriaButton>
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
  DropdownMenuContentRoot(props, ref, positionedOverlayDropdownSubmenuDefaults),
);

DropdownMenuSubmenuContent.displayName = "DropdownMenuSubmenuContent";

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
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
        {(opts) => renderMenuItemChildren(children, opts)}
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

export const DropdownMenuLabel = forwardRef<HTMLElement, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => (
    <AriaHeader
      {...props}
      ref={ref}
      data-slot="dropdown-menu-label"
      className={dropdownMenuLabelClassNames({ className })}
    />
  ),
);

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
