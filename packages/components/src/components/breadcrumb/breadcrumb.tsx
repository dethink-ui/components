import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "../popover";
import { cn } from "../../utils/cn";

export type BreadcrumbSize = "sm" | "md" | "lg";
export type BreadcrumbSeparatorVariant = "chevron" | "slash" | "dot" | "none";
export type BreadcrumbCollapseFrom = "start" | "middle" | "end";

export interface BreadcrumbItemData {
  key: string;
  label: ReactNode;
  textValue?: string;
  href?: string;
  current?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onAction?: () => void;
}

export interface BreadcrumbProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  children?: ReactNode;
  collapseFrom?: BreadcrumbCollapseFrom;
  items?: BreadcrumbItemData[];
  maxItems?: number;
  overflowLabel?: string;
  preserveCurrent?: boolean;
  preserveRoot?: boolean;
  separator?: BreadcrumbSeparatorVariant | ReactNode;
  size?: BreadcrumbSize;
}

export interface BreadcrumbListProps extends HTMLAttributes<HTMLOListElement> {}

export interface BreadcrumbItemProps extends LiHTMLAttributes<HTMLLIElement> {
  current?: boolean;
  disabled?: boolean;
}

type BreadcrumbLinkBaseProps = {
  asChild?: boolean;
  current?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
};

type NativeBreadcrumbLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  BreadcrumbLinkBaseProps & {
    asChild?: false;
    children: ReactNode;
    href: string;
    onAction?: never;
  };

type ActionBreadcrumbLinkProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled" | "type"
> &
  BreadcrumbLinkBaseProps & {
    asChild?: false;
    children: ReactNode;
    href?: undefined;
    onAction: () => void;
  };

type ChildBreadcrumbLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  BreadcrumbLinkBaseProps & {
    asChild: true;
    children: ReactElement<BreadcrumbLinkSlotProps>;
    href?: string;
    onAction?: () => void;
  };

export type BreadcrumbLinkProps =
  | NativeBreadcrumbLinkProps
  | ActionBreadcrumbLinkProps
  | ChildBreadcrumbLinkProps;

export interface BreadcrumbPageProps extends HTMLAttributes<HTMLSpanElement> {
  current?: boolean;
  icon?: ReactNode;
}

export interface BreadcrumbSeparatorProps extends HTMLAttributes<HTMLSpanElement> {
  separator?: BreadcrumbSeparatorVariant | ReactNode;
}

export interface BreadcrumbEllipsisProps extends HTMLAttributes<HTMLSpanElement> {}

export interface BreadcrumbOverflowProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  items: BreadcrumbItemData[];
  label?: string;
  size?: BreadcrumbSize;
}

type BreadcrumbLinkSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  "aria-current"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
  "aria-disabled"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-disabled"];
};

type BreadcrumbContextValue = {
  separator: BreadcrumbSeparatorVariant | ReactNode;
  size: BreadcrumbSize;
};

type NormalizedBreadcrumbItem = BreadcrumbItemData & {
  current: boolean;
  index: number;
};

export type BreadcrumbRenderItem =
  | {
      type: "item";
      item: NormalizedBreadcrumbItem;
    }
  | {
      type: "overflow";
      items: NormalizedBreadcrumbItem[];
    };

interface BreadcrumbWindowOptions {
  collapseFrom?: BreadcrumbCollapseFrom;
  maxItems?: number;
  preserveCurrent?: boolean;
  preserveRoot?: boolean;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  separator: "chevron",
  size: "md",
});

const breadcrumbRootClasses = "max-w-full text-muted-foreground";

const breadcrumbListClasses =
  "m-0 flex min-w-0 list-none flex-wrap items-center gap-y-[var(--dt-space-1)] p-0";

const breadcrumbItemClasses =
  "flex min-w-0 max-w-full items-center data-[current=true]:text-foreground data-[disabled=true]:opacity-60";

const breadcrumbLinkBaseClasses =
  "group/breadcrumb-link inline-flex max-w-full min-w-0 items-center rounded-sm font-medium text-muted-foreground no-underline outline-none transition-[color,background-color,box-shadow] duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:text-foreground data-[current=true]:text-foreground data-[current=true]:font-semibold data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60";

const breadcrumbPageBaseClasses =
  "inline-flex max-w-full min-w-0 items-center rounded-sm font-medium text-foreground";

const breadcrumbTextClasses = "min-w-0 truncate";

const breadcrumbIconClasses =
  "me-[var(--dt-space-1)] flex size-4 shrink-0 items-center justify-center text-muted-foreground group-data-[current=true]/breadcrumb-link:text-foreground [&>svg]:size-4";

const breadcrumbSeparatorClasses =
  "mx-[var(--dt-space-1-5)] inline-flex shrink-0 items-center justify-center text-muted-foreground/70";

const breadcrumbEllipsisClasses =
  "inline-flex min-w-4 items-center justify-center font-semibold tracking-normal text-muted-foreground";

const breadcrumbOverflowTriggerClasses =
  "size-8 rounded-sm px-0 text-muted-foreground hover:text-foreground";

const breadcrumbOverflowContentClasses =
  "w-[var(--dt-breadcrumb-overflow-width,14rem)] p-[var(--dt-space-1)]";

const breadcrumbOverflowListClasses =
  "m-0 grid max-h-[min(18rem,calc(100dvh_-_var(--dt-space-4)))] list-none gap-0 overflow-auto p-0";

const breadcrumbOverflowItemClasses = "min-w-0";

const breadcrumbOverflowLinkClasses =
  "flex w-full min-w-0 items-center gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-start text-sm leading-5 text-foreground no-underline outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60";

const breadcrumbSizeClasses: Record<BreadcrumbSize, string> = {
  sm: "text-xs leading-5",
  md: "text-sm leading-6",
  lg: "text-base leading-7",
};

const breadcrumbLinkSizeClasses: Record<BreadcrumbSize, string> = {
  sm: "min-h-7 gap-[var(--dt-space-1)]",
  md: "min-h-8 gap-[var(--dt-space-1)]",
  lg: "min-h-9 gap-[var(--dt-space-1-5)]",
};

export function breadcrumbClassNames({
  className,
  size = "md",
}: Pick<BreadcrumbProps, "className" | "size"> = {}) {
  return cn(breadcrumbRootClasses, breadcrumbSizeClasses[size], className);
}

export function breadcrumbListClassNames({
  className,
}: Pick<BreadcrumbListProps, "className"> = {}) {
  return cn(breadcrumbListClasses, className);
}

export function breadcrumbItemClassNames({
  className,
}: Pick<BreadcrumbItemProps, "className"> = {}) {
  return cn(breadcrumbItemClasses, className);
}

export function breadcrumbLinkClassNames({
  className,
  size = "md",
}: Pick<BreadcrumbLinkProps, "className"> & { size?: BreadcrumbSize } = {}) {
  return cn(
    breadcrumbLinkBaseClasses,
    breadcrumbLinkSizeClasses[size],
    className,
  );
}

export function breadcrumbPageClassNames({
  className,
  size = "md",
}: Pick<BreadcrumbPageProps, "className"> & { size?: BreadcrumbSize } = {}) {
  return cn(
    breadcrumbPageBaseClasses,
    breadcrumbLinkSizeClasses[size],
    className,
  );
}

export function breadcrumbSeparatorClassNames({
  className,
}: Pick<BreadcrumbSeparatorProps, "className"> = {}) {
  return cn(breadcrumbSeparatorClasses, className);
}

export function breadcrumbEllipsisClassNames({
  className,
}: Pick<BreadcrumbEllipsisProps, "className"> = {}) {
  return cn(breadcrumbEllipsisClasses, className);
}

export function breadcrumbOverflowClassNames({
  className,
}: Pick<BreadcrumbOverflowProps, "className"> = {}) {
  return cn("contents", className);
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

function composeClickHandlers(
  componentHandler: MouseEventHandler<HTMLElement>,
  childHandler: MouseEventHandler<HTMLElement> | undefined,
) {
  return (event: React.MouseEvent<HTMLElement>) => {
    componentHandler(event);

    if (!event.defaultPrevented) {
      childHandler?.(event);
    }
  };
}

function getChildRef(child: ReactElement<BreadcrumbLinkSlotProps>) {
  return child.props.ref;
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

function resolveAriaCurrent(
  ariaCurrent: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"],
  current: boolean | undefined,
) {
  if (ariaCurrent !== undefined) {
    return ariaCurrent;
  }

  return current ? ("page" as const) : undefined;
}

function hasCurrentState(
  ariaCurrent: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"],
) {
  return (
    ariaCurrent !== undefined &&
    ariaCurrent !== false &&
    ariaCurrent !== "false"
  );
}

function normalizeItems(
  items: BreadcrumbItemData[],
): NormalizedBreadcrumbItem[] {
  if (items.length === 0) {
    return [];
  }

  const explicitCurrentIndex = items.findIndex((item) => item.current);
  const fallbackCurrentIndex = items.length - 1;
  const currentIndex =
    explicitCurrentIndex === -1 ? fallbackCurrentIndex : explicitCurrentIndex;

  return items.map((item, index) => ({
    ...item,
    current: index === currentIndex,
    index,
  }));
}

function isNormalizedBreadcrumbItem(
  item: BreadcrumbItemData,
): item is NormalizedBreadcrumbItem {
  return "index" in item && typeof item.current === "boolean";
}

function normalizeOverflowItems(
  items: BreadcrumbItemData[],
): NormalizedBreadcrumbItem[] {
  return items.map((item, index) =>
    isNormalizedBreadcrumbItem(item)
      ? item
      : {
          ...item,
          current: item.current === true,
          index,
        },
  );
}

function addTrailingIndexes({
  count,
  indexes,
  startIndex,
}: {
  count: number;
  indexes: Set<number>;
  items: NormalizedBreadcrumbItem[];
  startIndex: number;
}) {
  for (let index = startIndex; index >= 0 && indexes.size < count; index -= 1) {
    indexes.add(index);
  }
}

function addLeadingIndexes({
  count,
  indexes,
  items,
  startIndex,
}: {
  count: number;
  indexes: Set<number>;
  items: NormalizedBreadcrumbItem[];
  startIndex: number;
}) {
  for (
    let index = startIndex;
    index < items.length && indexes.size < count;
    index += 1
  ) {
    indexes.add(index);
  }
}

function entriesFromVisibleIndexes(
  items: NormalizedBreadcrumbItem[],
  visibleIndexes: Set<number>,
): BreadcrumbRenderItem[] {
  const entries: BreadcrumbRenderItem[] = [];
  let hidden: NormalizedBreadcrumbItem[] = [];

  const flushHidden = () => {
    if (hidden.length > 0) {
      entries.push({ type: "overflow", items: hidden });
      hidden = [];
    }
  };

  for (const item of items) {
    if (visibleIndexes.has(item.index)) {
      flushHidden();
      entries.push({ type: "item", item });
    } else {
      hidden.push(item);
    }
  }

  flushHidden();

  return entries;
}

export function getBreadcrumbRenderItems(
  sourceItems: BreadcrumbItemData[],
  {
    collapseFrom = "middle",
    maxItems,
    preserveCurrent = true,
    preserveRoot = true,
  }: BreadcrumbWindowOptions = {},
): BreadcrumbRenderItem[] {
  const items = normalizeItems(sourceItems);

  if (items.length === 0) {
    return [];
  }

  if (!maxItems || items.length <= maxItems) {
    return items.map((item) => ({ type: "item", item }));
  }

  const safeMaxItems = Math.max(3, maxItems);
  const visibleSlots = safeMaxItems - 1;
  const visibleIndexes = new Set<number>();
  const currentIndex = items.findIndex((item) => item.current);
  const anchorIndex =
    preserveCurrent && currentIndex !== -1 ? currentIndex : items.length - 1;

  if (collapseFrom === "start") {
    if (preserveRoot) {
      visibleIndexes.add(0);
    }

    addTrailingIndexes({
      count: visibleSlots,
      indexes: visibleIndexes,
      items,
      startIndex: items.length - 1,
    });
  } else if (collapseFrom === "end") {
    if (preserveCurrent) {
      visibleIndexes.add(anchorIndex);
    }

    addLeadingIndexes({
      count: visibleSlots,
      indexes: visibleIndexes,
      items,
      startIndex: 0,
    });
  } else {
    if (preserveRoot) {
      visibleIndexes.add(0);
    }

    if (preserveCurrent) {
      visibleIndexes.add(anchorIndex);
    }

    addTrailingIndexes({
      count: visibleSlots,
      indexes: visibleIndexes,
      items,
      startIndex: anchorIndex - 1,
    });
  }

  return entriesFromVisibleIndexes(items, visibleIndexes);
}

function renderSeparatorContent(
  separator: BreadcrumbSeparatorProps["separator"],
) {
  if (separator === "none") {
    return null;
  }

  if (separator === "slash") {
    return "/";
  }

  if (separator === "dot") {
    return "•";
  }

  if (separator === "chevron" || separator === undefined) {
    return (
      <svg
        aria-hidden="true"
        className="size-3.5 rtl:rotate-180"
        fill="none"
        viewBox="0 0 12 12"
      >
        <path
          d="m4.5 3 3 3-3 3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return separator;
}

function renderLinkChildren({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <>
      {icon ? (
        <span
          aria-hidden="true"
          data-slot="breadcrumb-link-icon"
          className={breadcrumbIconClasses}
        >
          {icon}
        </span>
      ) : null}
      <span data-slot="breadcrumb-link-text" className={breadcrumbTextClasses}>
        {children}
      </span>
    </>
  );
}

function renderBreadcrumbDataItem(
  item: NormalizedBreadcrumbItem,
  {
    className,
    overflow = false,
  }: {
    className?: string;
    overflow?: boolean;
  } = {},
) {
  const content = item.textValue ?? item.label;

  if (item.href) {
    return (
      <BreadcrumbLink
        className={className}
        current={item.current}
        disabled={item.disabled}
        href={item.href}
        icon={item.icon}
      >
        {item.label}
      </BreadcrumbLink>
    );
  }

  if (item.onAction) {
    return (
      <BreadcrumbLink
        className={className}
        current={item.current}
        disabled={item.disabled}
        icon={item.icon}
        onAction={item.onAction}
      >
        {item.label}
      </BreadcrumbLink>
    );
  }

  return (
    <BreadcrumbPage
      aria-label={overflow && typeof content === "string" ? content : undefined}
      className={className}
      current={item.current}
      icon={item.icon}
    >
      {item.label}
    </BreadcrumbPage>
  );
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      children,
      className,
      collapseFrom = "middle",
      items,
      maxItems,
      overflowLabel = "Show breadcrumb path",
      preserveCurrent = true,
      preserveRoot = true,
      separator = "chevron",
      size = "md",
      ...props
    },
    ref,
  ) => {
    const contextValue: BreadcrumbContextValue = { separator, size };
    const entries = items
      ? getBreadcrumbRenderItems(items, {
          collapseFrom,
          maxItems,
          preserveCurrent,
          preserveRoot,
        })
      : [];
    const resolvedAriaLabel =
      ariaLabel ?? (ariaLabelledBy === undefined ? "Breadcrumb" : undefined);

    return (
      <nav
        {...props}
        ref={ref}
        aria-label={resolvedAriaLabel}
        aria-labelledby={ariaLabelledBy}
        data-slot="breadcrumb"
        data-size={size}
        className={breadcrumbClassNames({ className, size })}
      >
        <BreadcrumbContext.Provider value={contextValue}>
          {items ? (
            <BreadcrumbList>
              {entries.map((entry, index) => (
                <BreadcrumbItem
                  key={
                    entry.type === "item"
                      ? entry.item.key
                      : `overflow-${entry.items.map((item) => item.key).join("-")}`
                  }
                  current={entry.type === "item" ? entry.item.current : false}
                >
                  {entry.type === "item" ? (
                    renderBreadcrumbDataItem(entry.item)
                  ) : (
                    <BreadcrumbOverflow
                      items={entry.items}
                      label={overflowLabel}
                      size={size}
                    />
                  )}
                  {index < entries.length - 1 ? <BreadcrumbSeparator /> : null}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          ) : (
            children
          )}
        </BreadcrumbContext.Provider>
      </nav>
    );
  },
);

Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => (
    <ol
      {...props}
      ref={ref}
      data-slot="breadcrumb-list"
      className={breadcrumbListClassNames({ className })}
    />
  ),
);

BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, current = false, disabled = false, ...props }, ref) => (
    <li
      {...props}
      ref={ref}
      data-current={current ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-slot="breadcrumb-item"
      className={breadcrumbItemClassNames({ className })}
    />
  ),
);

BreadcrumbItem.displayName = "BreadcrumbItem";

export const BreadcrumbLink = forwardRef<HTMLElement, BreadcrumbLinkProps>(
  (
    {
      asChild = false,
      children,
      className,
      current = false,
      disabled = false,
      href,
      icon,
      onAction,
      onClick,
      rel,
      target,
      "aria-current": ariaCurrent,
      ...props
    },
    ref,
  ) => {
    const { size } = useContext(BreadcrumbContext);
    const resolvedAriaCurrent = resolveAriaCurrent(ariaCurrent, current);
    const isCurrent = hasCurrentState(resolvedAriaCurrent);
    const classes = breadcrumbLinkClassNames({ className, size });
    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      (onClick as MouseEventHandler<HTMLElement> | undefined)?.(event);

      if (!event.defaultPrevented) {
        onAction?.();
      }
    };

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<BreadcrumbLinkSlotProps>(child)) {
        throw new Error(
          "BreadcrumbLink with asChild expects a single React element child.",
        );
      }

      const childRef = getChildRef(child);
      const resolvedHref = child.props.href ?? href;
      const resolvedTarget = child.props.target ?? target;
      const resolvedRel = mergeRelForTarget(
        child.props.rel ?? rel,
        resolvedTarget,
      );
      const resolvedChildAriaCurrent =
        child.props["aria-current"] ?? resolvedAriaCurrent;
      const isChildCurrent = hasCurrentState(resolvedChildAriaCurrent);
      const clonedProps: BreadcrumbLinkSlotProps = {
        ...props,
        ...child.props,
        ref: composeRefs(ref, childRef),
        "aria-current": resolvedChildAriaCurrent,
        "aria-disabled": disabled ? true : child.props["aria-disabled"],
        "data-current": isChildCurrent ? "true" : undefined,
        "data-disabled": disabled ? "true" : undefined,
        "data-slot": "breadcrumb-link",
        className: cn(classes, child.props.className),
        onClick: composeClickHandlers(handleClick, child.props.onClick),
      };

      if (resolvedHref !== undefined) {
        clonedProps.href = resolvedHref;
      }

      if (resolvedTarget !== undefined) {
        clonedProps.target = resolvedTarget;
      }

      if (resolvedRel !== undefined) {
        clonedProps.rel = resolvedRel;
      }

      return cloneElement(child, clonedProps);
    }

    if (href) {
      return (
        <a
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as Ref<HTMLAnchorElement>}
          aria-current={resolvedAriaCurrent}
          aria-disabled={disabled ? true : undefined}
          data-current={isCurrent ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-slot="breadcrumb-link"
          href={href}
          rel={mergeRelForTarget(rel, target)}
          target={target}
          className={classes}
          onClick={handleClick as MouseEventHandler<HTMLAnchorElement>}
        >
          {renderLinkChildren({ children, icon })}
        </a>
      );
    }

    return (
      <button
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as Ref<HTMLButtonElement>}
        aria-current={resolvedAriaCurrent}
        data-current={isCurrent ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-slot="breadcrumb-link"
        disabled={disabled}
        type="button"
        className={classes}
        onClick={handleClick as MouseEventHandler<HTMLButtonElement>}
      >
        {renderLinkChildren({ children, icon })}
      </button>
    );
  },
);

BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ children, className, current = true, icon, ...props }, ref) => {
    const { size } = useContext(BreadcrumbContext);

    return (
      <span
        {...props}
        ref={ref}
        aria-current={current ? "page" : undefined}
        data-current={current ? "true" : undefined}
        data-slot="breadcrumb-page"
        className={breadcrumbPageClassNames({ className, size })}
      >
        {renderLinkChildren({ children, icon })}
      </span>
    );
  },
);

BreadcrumbPage.displayName = "BreadcrumbPage";

export const BreadcrumbSeparator = forwardRef<
  HTMLSpanElement,
  BreadcrumbSeparatorProps
>(({ className, separator, ...props }, ref) => {
  const context = useContext(BreadcrumbContext);
  const resolvedSeparator = separator ?? context.separator;

  if (resolvedSeparator === "none") {
    return null;
  }

  return (
    <span
      {...props}
      ref={ref}
      aria-hidden="true"
      data-slot="breadcrumb-separator"
      className={breadcrumbSeparatorClassNames({ className })}
    >
      {renderSeparatorContent(resolvedSeparator)}
    </span>
  );
});

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export const BreadcrumbEllipsis = forwardRef<
  HTMLSpanElement,
  BreadcrumbEllipsisProps
>(({ className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    data-slot="breadcrumb-ellipsis"
    className={breadcrumbEllipsisClassNames({ className })}
  >
    ...
  </span>
));

BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export const BreadcrumbOverflow = forwardRef<
  HTMLDivElement,
  BreadcrumbOverflowProps
>(
  (
    {
      className,
      items,
      label = "Show breadcrumb path",
      size: _size = "md",
      ...props
    },
    ref,
  ) => {
    const normalizedItems = normalizeOverflowItems(items);

    return (
      <div
        {...props}
        ref={ref}
        data-slot="breadcrumb-overflow"
        className={breadcrumbOverflowClassNames({ className })}
      >
        <Popover>
          <PopoverTrigger
            aria-label={label}
            className={breadcrumbOverflowTriggerClasses}
            size="icon"
            variant="ghost"
          >
            <BreadcrumbEllipsis aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent
            aria-label={label}
            className={breadcrumbOverflowContentClasses}
            panelClassName="gap-0"
            placement="bottom start"
          >
            <PopoverTitle visuallyHidden>{label}</PopoverTitle>
            <ol
              data-slot="breadcrumb-overflow-list"
              className={breadcrumbOverflowListClasses}
            >
              {normalizedItems.map((item) => (
                <li
                  key={item.key}
                  data-slot="breadcrumb-overflow-item"
                  className={breadcrumbOverflowItemClasses}
                >
                  {renderBreadcrumbDataItem(item, {
                    className: cn(breadcrumbOverflowLinkClasses, "min-h-8"),
                    overflow: true,
                  })}
                </li>
              ))}
            </ol>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

BreadcrumbOverflow.displayName = "BreadcrumbOverflow";
