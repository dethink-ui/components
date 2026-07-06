import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type PaginationSize = "sm" | "md" | "lg";
export type PaginationControlType = "first" | "previous" | "next" | "last";

export interface PaginationLabels {
  ellipsis?: string;
  firstPage?: string;
  lastPage?: (pageCount?: number) => string;
  nextPage?: string;
  nextPageShort?: string;
  page?: (page: number, context: PaginationLabelContext) => string;
  previousPage?: string;
  previousPageShort?: string;
  root?: string;
  status?: (page: number, context: PaginationStatusContext) => string;
}

export interface PaginationLabelContext {
  current: boolean;
  pageCount?: number;
}

export interface PaginationStatusContext {
  hasNextPage?: boolean;
  pageCount?: number;
}

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  boundaryCount?: number;
  compact?: boolean;
  hasNextPage?: boolean;
  hideDisabledControls?: boolean;
  hrefForPage?: (page: number) => string | undefined;
  labels?: PaginationLabels;
  onPageChange?: (page: number) => void;
  page: number;
  pageCount?: number;
  showFirstLast?: boolean;
  siblingCount?: number;
  size?: PaginationSize;
  status?: ReactNode | false;
}

export interface PaginationContentProps extends HTMLAttributes<HTMLDivElement> {}

export interface PaginationListProps extends HTMLAttributes<HTMLUListElement> {}

export interface PaginationItemProps extends LiHTMLAttributes<HTMLLIElement> {
  current?: boolean;
  disabled?: boolean;
}

export interface PaginationPageProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "onClick"> {
  children?: ReactNode;
  current?: boolean;
  disabled?: boolean;
  href?: string;
  label?: string;
  onPageChange?: (page: number) => void;
  page: number;
  size?: PaginationSize;
}

export interface PaginationControlProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "onClick"> {
  children?: ReactNode;
  disabled?: boolean;
  href?: string;
  label: string;
  onPageChange?: (page: number) => void;
  page: number;
  size?: PaginationSize;
  type: PaginationControlType;
}

export interface PaginationEllipsisProps
  extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
  size?: PaginationSize;
}

export interface PaginationStatusProps
  extends HTMLAttributes<HTMLParagraphElement> {}

export type PaginationRenderItem =
  | {
      current: boolean;
      key: string;
      page: number;
      type: "page";
    }
  | {
      key: string;
      type: "ellipsis";
    };

export interface PaginationWindowOptions {
  boundaryCount?: number;
  compact?: boolean;
  hasNextPage?: boolean;
  page: number;
  pageCount?: number;
  siblingCount?: number;
}

const defaultLabels = {
  ellipsis: "More pages",
  firstPage: "First page",
  lastPage: (pageCount?: number) =>
    pageCount ? `Last page, page ${pageCount}` : "Last page",
  nextPage: "Next page",
  nextPageShort: "Next",
  page: (page: number, { current, pageCount }: PaginationLabelContext) => {
    if (current) {
      return `Page ${page}, current page`;
    }

    return pageCount ? `Page ${page} of ${pageCount}` : `Page ${page}`;
  },
  previousPage: "Previous page",
  previousPageShort: "Back",
  root: "Pagination",
  status: (page: number, { hasNextPage, pageCount }: PaginationStatusContext) => {
    if (pageCount) {
      return `Page ${page} of ${pageCount}`;
    }

    return hasNextPage ? `Page ${page}` : `Page ${page}, end of results`;
  },
} satisfies Required<PaginationLabels>;

const paginationRootClasses =
  "flex w-full max-w-full min-w-0 flex-col text-sm text-muted-foreground @container";

const paginationContentClasses =
  "flex w-full max-w-full min-w-0 flex-col items-start gap-[var(--dt-space-2)] @md:flex-row @md:items-center @md:justify-between @md:gap-[var(--dt-space-3)]";

const paginationListClasses =
  "m-0 flex w-full max-w-full min-w-0 list-none flex-nowrap items-center justify-start gap-[var(--dt-space-1)] overflow-x-auto overscroll-x-contain p-0 [scrollbar-gutter:stable] [scrollbar-width:none] [-ms-overflow-style:none] @md:w-auto @md:flex-1 @md:justify-end [&::-webkit-scrollbar]:hidden";

const paginationItemClasses =
  "flex min-w-0 items-center data-[current=true]:z-10 data-[disabled=true]:opacity-60";

const paginationInteractiveBaseClasses =
  "inline-flex shrink-0 select-none items-center justify-center rounded-md border border-transparent bg-transparent font-medium text-muted-foreground outline-none tabular-nums no-underline motion-safe:transition-[background-color,border-color,color,box-shadow,translate] motion-safe:duration-150 motion-safe:ease-out motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px data-[current=true]:border-primary/20 data-[current=true]:bg-primary data-[current=true]:text-primary-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50";

const paginationEllipsisClasses =
  "inline-flex shrink-0 select-none items-center justify-center rounded-md text-muted-foreground";

const paginationStatusClasses = "m-0 shrink-0 whitespace-nowrap text-sm text-muted-foreground";

const paginationSizeClasses: Record<PaginationSize, string> = {
  sm: "h-8 min-w-8 px-[var(--dt-space-2)] text-xs",
  md: "h-density-control min-w-density-control px-[var(--dt-space-2-5)] text-sm",
  lg: "h-11 min-w-11 px-[var(--dt-space-3)] text-base",
};

const paginationIconSizeClasses: Record<PaginationSize, string> = {
  sm: "[&>svg]:size-3.5",
  md: "[&>svg]:size-4",
  lg: "[&>svg]:size-4",
};

export function paginationClassNames({
  className,
}: Pick<PaginationProps, "className"> = {}) {
  return cn(paginationRootClasses, className);
}

export function paginationContentClassNames({
  className,
}: Pick<PaginationContentProps, "className"> = {}) {
  return cn(paginationContentClasses, className);
}

export function paginationListClassNames({
  className,
}: Pick<PaginationListProps, "className"> = {}) {
  return cn(paginationListClasses, className);
}

export function paginationItemClassNames({
  className,
}: Pick<PaginationItemProps, "className"> = {}) {
  return cn(paginationItemClasses, className);
}

export function paginationPageClassNames({
  className,
  size = "md",
}: Pick<PaginationPageProps, "className" | "size"> = {}) {
  return cn(
    paginationInteractiveBaseClasses,
    paginationSizeClasses[size],
    paginationIconSizeClasses[size],
    className,
  );
}

export function paginationControlClassNames({
  className,
  size = "md",
}: Pick<PaginationControlProps, "className" | "size"> = {}) {
  return cn(
    paginationInteractiveBaseClasses,
    paginationSizeClasses[size],
    paginationIconSizeClasses[size],
    className,
  );
}

export function paginationEllipsisClassNames({
  className,
  size = "md",
}: Pick<PaginationEllipsisProps, "className" | "size"> = {}) {
  return cn(
    paginationEllipsisClasses,
    paginationSizeClasses[size],
    className,
  );
}

export function paginationStatusClassNames({
  className,
}: Pick<PaginationStatusProps, "className"> = {}) {
  return cn(paginationStatusClasses, className);
}

function toPositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value) || value === undefined) {
    return fallback;
  }

  return Math.max(1, Math.floor(value));
}

function toNonNegativeInteger(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value) || value === undefined) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
}

function range(start: number, end: number) {
  const items: number[] = [];

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  return items;
}

function numbersToRenderItems(pages: number[], currentPage: number) {
  const items: PaginationRenderItem[] = [];

  for (const page of pages) {
    const previous = items[items.length - 1];

    if (previous?.type === "page") {
      const gap = page - previous.page;

      if (gap === 2) {
        const missingPage = previous.page + 1;
        items.push({
          current: missingPage === currentPage,
          key: `page-${missingPage}`,
          page: missingPage,
          type: "page",
        });
      } else if (gap > 2) {
        items.push({
          key: `ellipsis-${previous.page}-${page}`,
          type: "ellipsis",
        });
      }
    }

    items.push({
      current: page === currentPage,
      key: `page-${page}`,
      page,
      type: "page",
    });
  }

  return items;
}

export function getPaginationRenderItems({
  boundaryCount = 1,
  compact = false,
  hasNextPage = false,
  page,
  pageCount,
  siblingCount = 1,
}: PaginationWindowOptions): PaginationRenderItem[] {
  const safeBoundaryCount = toNonNegativeInteger(boundaryCount, 1);
  const safeSiblingCount = compact
    ? 0
    : toNonNegativeInteger(siblingCount, 1);
  const safePageCount =
    pageCount === undefined ? undefined : toPositiveInteger(pageCount, 1);
  const currentPage = safePageCount
    ? Math.min(toPositiveInteger(page, 1), safePageCount)
    : toPositiveInteger(page, 1);
  const knownLastPage = safePageCount ?? currentPage + (hasNextPage ? 1 : 0);
  const visiblePages = new Set<number>();

  if (knownLastPage <= 0) {
    return [];
  }

  for (const pageNumber of range(1, Math.min(safeBoundaryCount, knownLastPage))) {
    visiblePages.add(pageNumber);
  }

  if (safePageCount) {
    for (const pageNumber of range(
      Math.max(1, safePageCount - safeBoundaryCount + 1),
      safePageCount,
    )) {
      visiblePages.add(pageNumber);
    }
  }

  for (
    let pageNumber = Math.max(1, currentPage - safeSiblingCount);
    pageNumber <= Math.min(knownLastPage, currentPage + safeSiblingCount);
    pageNumber += 1
  ) {
    visiblePages.add(pageNumber);
  }

  if (!safePageCount && hasNextPage) {
    visiblePages.add(knownLastPage);
  }

  visiblePages.add(currentPage);

  return numbersToRenderItems(
    Array.from(visiblePages).sort((a, b) => a - b),
    currentPage,
  );
}

function getResolvedPage(page: number, pageCount: number | undefined) {
  const safePage = toPositiveInteger(page, 1);

  if (pageCount === undefined) {
    return safePage;
  }

  return Math.min(safePage, toPositiveInteger(pageCount, 1));
}

function getPageHref(
  hrefForPage: PaginationProps["hrefForPage"] | undefined,
  disabled: boolean,
  page: number,
) {
  return disabled ? undefined : hrefForPage?.(page);
}

function getPaginationAction({
  current = false,
  disabled,
  hrefForPage,
  onPageChange,
  page,
}: {
  current?: boolean;
  disabled: boolean;
  hrefForPage: PaginationProps["hrefForPage"] | undefined;
  onPageChange: PaginationProps["onPageChange"] | undefined;
  page: number;
}) {
  const href = getPageHref(hrefForPage, disabled, page);
  const hasHref = href !== undefined;
  const hasCallback = onPageChange !== undefined;
  const resolvedDisabled = disabled || (!hasHref && (current || !hasCallback));

  return {
    disabled: resolvedDisabled,
    href,
    onPageChange: resolvedDisabled || hasHref ? undefined : onPageChange,
  };
}

function renderControlIcon(
  type: PaginationControlType,
  { rotateInRtl = true }: { rotateInRtl?: boolean } = {},
) {
  const isPrevious = type === "previous" || type === "first";
  const isBoundary = type === "first" || type === "last";

  return (
    <svg
      aria-hidden="true"
      className={cn(rotateInRtl && "rtl:rotate-180", isBoundary ? "w-4" : "w-3")}
      fill="none"
      viewBox="0 0 16 16"
    >
      {isBoundary ? (
        <path
          d={isPrevious ? "M4.5 3.5v9m7-8-4 3.5 4 3.5" : "M11.5 3.5v9m-7-8 4 3.5-4 3.5"}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      ) : (
        <path
          d={isPrevious ? "m10 4-4 4 4 4" : "m6 4 4 4-4 4"}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
}

function renderResponsiveControlContent(
  type: Extract<PaginationControlType, "previous" | "next">,
  shortLabel: string,
  size: PaginationSize,
) {
  return (
    <>
      <span
        dir="ltr"
        className={cn(
          "inline-flex items-center justify-center gap-[var(--dt-space-1)] @xs:hidden",
          paginationIconSizeClasses[size],
        )}
      >
        {type === "previous" ? (
          <>
            {renderControlIcon(type, { rotateInRtl: false })}
            <span>{shortLabel}</span>
          </>
        ) : (
          <>
            <span>{shortLabel}</span>
            {renderControlIcon(type, { rotateInRtl: false })}
          </>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "hidden items-center justify-center @xs:inline-flex",
          paginationIconSizeClasses[size],
        )}
      >
        {renderControlIcon(type)}
      </span>
    </>
  );
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      boundaryCount = 1,
      children,
      className,
      compact = false,
      hasNextPage = false,
      hideDisabledControls = false,
      hrefForPage,
      labels,
      onPageChange,
      page,
      pageCount,
      showFirstLast = false,
      siblingCount = 1,
      size = "md",
      status,
      ...props
    },
    ref,
  ) => {
    const mergedLabels = { ...defaultLabels, ...labels };
    const currentPage = getResolvedPage(page, pageCount);
    const safePageCount =
      pageCount === undefined ? undefined : toPositiveInteger(pageCount, 1);
    const canPrevious = currentPage > 1;
    const canNext = safePageCount ? currentPage < safePageCount : hasNextPage;
    const items = getPaginationRenderItems({
      boundaryCount,
      compact,
      hasNextPage,
      page: currentPage,
      pageCount: safePageCount,
      siblingCount,
    });
    const resolvedAriaLabel =
      ariaLabel ?? (ariaLabelledBy === undefined ? mergedLabels.root : undefined);
    const resolvedStatus =
      status === false
        ? null
        : (status ??
          mergedLabels.status(currentPage, {
            hasNextPage,
            pageCount: safePageCount,
          }));
    const firstPageAction = getPaginationAction({
      disabled: !canPrevious,
      hrefForPage,
      onPageChange,
      page: 1,
    });
    const previousPageAction = getPaginationAction({
      disabled: !canPrevious,
      hrefForPage,
      onPageChange,
      page: currentPage - 1,
    });
    const nextPageAction = getPaginationAction({
      disabled: !canNext,
      hrefForPage,
      onPageChange,
      page: currentPage + 1,
    });
    const lastPageAction =
      safePageCount === undefined
        ? undefined
        : getPaginationAction({
            disabled: !canNext,
            hrefForPage,
            onPageChange,
            page: safePageCount,
          });
    const generatedContentClassName = compact
      ? undefined
      : "flex-row items-center justify-between @xs:flex-col @xs:items-start @xs:justify-start @md:flex-row @md:items-center @md:justify-between";
    const smallWindowItemClassName = compact ? undefined : "hidden @xs:flex";
    const generatedListClassName = compact
      ? undefined
      : "w-auto flex-none justify-end rtl:flex-row-reverse @xs:w-full @xs:justify-start @xs:rtl:flex-row @md:w-auto @md:flex-1 @md:justify-end";
    const previousControlContent = compact
      ? undefined
      : renderResponsiveControlContent(
          "previous",
          mergedLabels.previousPageShort ?? defaultLabels.previousPageShort,
          size,
        );
    const nextControlContent = compact
      ? undefined
      : renderResponsiveControlContent(
          "next",
          mergedLabels.nextPageShort ?? defaultLabels.nextPageShort,
          size,
        );

    return (
      <nav
        {...props}
        ref={ref}
        aria-label={resolvedAriaLabel}
        aria-labelledby={ariaLabelledBy}
        data-compact={compact ? "true" : undefined}
        data-slot="pagination"
        data-size={size}
        className={paginationClassNames({ className })}
      >
        {children ?? (
          <div
            data-slot="pagination-content"
            className={paginationContentClassNames({
              className: generatedContentClassName,
            })}
          >
            {resolvedStatus ? (
              <PaginationStatus>{resolvedStatus}</PaginationStatus>
            ) : null}
            <PaginationList className={generatedListClassName}>
              {showFirstLast && (!hideDisabledControls || canPrevious) ? (
                <PaginationItem
                  className={smallWindowItemClassName}
                  disabled={firstPageAction.disabled}
                >
                  <PaginationControl
                    disabled={firstPageAction.disabled}
                    href={firstPageAction.href}
                    label={mergedLabels.firstPage}
                    onPageChange={firstPageAction.onPageChange}
                    page={1}
                    size={size}
                    type="first"
                  />
                </PaginationItem>
              ) : null}
              {!hideDisabledControls || canPrevious ? (
                <PaginationItem disabled={previousPageAction.disabled}>
                  <PaginationControl
                    disabled={previousPageAction.disabled}
                    href={previousPageAction.href}
                    label={mergedLabels.previousPage}
                    onPageChange={previousPageAction.onPageChange}
                    page={currentPage - 1}
                    size={size}
                    type="previous"
                  >
                    {previousControlContent}
                  </PaginationControl>
                </PaginationItem>
              ) : null}
              {items.map((item) => {
                if (item.type !== "page") {
                  return (
                    <PaginationItem
                      key={item.key}
                      className={smallWindowItemClassName}
                    >
                      <PaginationEllipsis
                        label={mergedLabels.ellipsis}
                        size={size}
                      />
                    </PaginationItem>
                  );
                }

                const pageAction = getPaginationAction({
                  current: item.current,
                  disabled: false,
                  hrefForPage,
                  onPageChange,
                  page: item.page,
                });

                return (
                  <PaginationItem
                    key={item.key}
                    className={smallWindowItemClassName}
                    current={item.current}
                    disabled={pageAction.disabled}
                  >
                    <PaginationPage
                      current={item.current}
                      disabled={pageAction.disabled}
                      href={pageAction.href}
                      label={mergedLabels.page(item.page, {
                        current: item.current,
                        pageCount: safePageCount,
                      })}
                      onPageChange={pageAction.onPageChange}
                      page={item.page}
                      size={size}
                    >
                      {item.page}
                    </PaginationPage>
                  </PaginationItem>
                );
              })}
              {!hideDisabledControls || canNext ? (
                <PaginationItem disabled={nextPageAction.disabled}>
                  <PaginationControl
                    disabled={nextPageAction.disabled}
                    href={nextPageAction.href}
                    label={mergedLabels.nextPage}
                    onPageChange={nextPageAction.onPageChange}
                    page={currentPage + 1}
                    size={size}
                    type="next"
                  >
                    {nextControlContent}
                  </PaginationControl>
                </PaginationItem>
              ) : null}
              {showFirstLast &&
              safePageCount !== undefined &&
              lastPageAction &&
              (!hideDisabledControls || canNext) ? (
                <PaginationItem
                  className={smallWindowItemClassName}
                  disabled={lastPageAction.disabled}
                >
                  <PaginationControl
                    disabled={lastPageAction.disabled}
                    href={lastPageAction.href}
                    label={mergedLabels.lastPage(safePageCount)}
                    onPageChange={lastPageAction.onPageChange}
                    page={safePageCount}
                    size={size}
                    type="last"
                  />
                </PaginationItem>
              ) : null}
            </PaginationList>
          </div>
        )}
      </nav>
    );
  },
);

Pagination.displayName = "Pagination";

export const PaginationList = forwardRef<HTMLUListElement, PaginationListProps>(
  ({ className, ...props }, ref) => (
    <ul
      {...props}
      ref={ref}
      data-slot="pagination-list"
      className={paginationListClassNames({ className })}
    />
  ),
);

PaginationList.displayName = "PaginationList";

export const PaginationItem = forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, current = false, disabled = false, ...props }, ref) => (
    <li
      {...props}
      ref={ref}
      data-current={current ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-slot="pagination-item"
      className={paginationItemClassNames({ className })}
    />
  ),
);

PaginationItem.displayName = "PaginationItem";

export const PaginationPage = forwardRef<HTMLElement, PaginationPageProps>(
  (
    {
      children,
      className,
      current = false,
      disabled = false,
      href,
      label,
      onPageChange,
      page,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const classes = paginationPageClassNames({ className, size });
    const handleClick = () => {
      if (!disabled && !current) {
        onPageChange?.(page);
      }
    };

    if (href !== undefined && !disabled) {
      return (
        <a
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as Ref<HTMLAnchorElement>}
          aria-current={current ? "page" : undefined}
          aria-label={label}
          data-current={current ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-slot="pagination-page"
          href={href}
          className={classes}
          onClick={handleClick}
        >
          {children ?? page}
        </a>
      );
    }

    return (
      <button
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as Ref<HTMLButtonElement>}
        aria-current={current ? "page" : undefined}
        aria-label={label}
        data-current={current ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-slot="pagination-page"
        disabled={disabled}
        type="button"
        className={classes}
        onClick={handleClick}
      >
        {children ?? page}
      </button>
    );
  },
);

PaginationPage.displayName = "PaginationPage";

export const PaginationControl = forwardRef<
  HTMLElement,
  PaginationControlProps
>(
  (
    {
      children,
      className,
      disabled = false,
      href,
      label,
      onPageChange,
      page,
      size = "md",
      type,
      ...props
    },
    ref,
  ) => {
    const classes = paginationControlClassNames({ className, size });
    const handleClick = () => {
      if (!disabled) {
        onPageChange?.(page);
      }
    };
    const content = children ?? renderControlIcon(type);

    if (href !== undefined && !disabled) {
      return (
        <a
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as Ref<HTMLAnchorElement>}
          aria-label={label}
          data-control={type}
          data-disabled={disabled ? "true" : undefined}
          data-slot="pagination-control"
          href={href}
          className={classes}
          onClick={handleClick}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as Ref<HTMLButtonElement>}
        aria-label={label}
        data-control={type}
        data-disabled={disabled ? "true" : undefined}
        data-slot="pagination-control"
        disabled={disabled}
        type="button"
        className={classes}
        onClick={handleClick}
      >
        {content}
      </button>
    );
  },
);

PaginationControl.displayName = "PaginationControl";

export const PaginationEllipsis = forwardRef<
  HTMLSpanElement,
  PaginationEllipsisProps
>(({ className, label = defaultLabels.ellipsis, size = "md", ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    data-slot="pagination-ellipsis"
    className={paginationEllipsisClassNames({ className, size })}
  >
    <span aria-hidden="true">...</span>
    <span className="sr-only">{label}</span>
  </span>
));

PaginationEllipsis.displayName = "PaginationEllipsis";

export const PaginationStatus = forwardRef<
  HTMLParagraphElement,
  PaginationStatusProps
>(({ className, ...props }, ref) => (
  <p
    {...props}
    ref={ref}
    data-slot="pagination-status"
    className={paginationStatusClassNames({ className })}
  />
));

PaginationStatus.displayName = "PaginationStatus";
