import {
  forwardRef,
  useId,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import {
  formatChartValue,
  isFiniteValue,
  resolveChartColor,
  type ChartColor,
  type FormatChartValueOptions,
} from "../chart/chart-core";

export type BarListSort = "descending" | "ascending" | "none";
export type BarListSize = "sm" | "md";

export interface BarListItem {
  /** Stable identity. Defaults to the label when it is a string, then the index. */
  key?: string;
  label: ReactNode;
  value: number;
  /** Render the row as a link. */
  href?: string;
  /** Small leading visual such as a favicon, flag or icon. */
  icon?: ReactNode;
  /** Override the bar color for this row (identity, never rank). */
  color?: ChartColor;
}

export interface BarListProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "color"
> {
  data: readonly BarListItem[];
  /** Ties keep their input order. */
  sort?: BarListSort;
  /** Rows shown before a "Show more" toggle. */
  limit?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Bar color for every row. */
  color?: ChartColor;
  /** Value that fills the track. Defaults to the largest value. */
  max?: number;
  formatValue?: (value: number) => string;
  formatOptions?: FormatChartValueOptions;
  /** Column headings, for example "Page" and "Visitors". */
  labelHeader?: ReactNode;
  valueHeader?: ReactNode;
  /** Makes rows without an href into buttons. */
  onItemClick?: (item: BarListItem, index: number) => void;
  emptyLabel?: ReactNode;
  showMoreLabel?: (hiddenCount: number) => ReactNode;
  showLessLabel?: ReactNode;
  size?: BarListSize;
  animate?: boolean;
}

const rowHeightClasses: Record<BarListSize, string> = {
  sm: "min-h-7 text-xs",
  md: "min-h-8 text-sm",
};

const barHeightClasses: Record<BarListSize, string> = {
  sm: "h-5",
  md: "h-6",
};

// A 24px-or-thinner tinted bar: the baseline end stays square and the data end
// is rounded 4px. A tint (not a solid fill) keeps labels on top at text contrast.
const barClasses =
  // max() keeps a sliver visible for tiny non-zero values.
  "pointer-events-none absolute w-[max(4px,var(--bar-share))] inset-y-0 start-0 m-auto rounded-e-[4px] bg-[color-mix(in_oklab,var(--bar-color)_26%,transparent)] [transform-origin:left] rtl:[transform-origin:right] motion-safe:animate-[dt-chart-grow-x_700ms_var(--ease-control)_both]";

const interactiveRowClasses =
  "rounded-md outline-hidden hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:transition-colors";

function itemKey(item: BarListItem, index: number) {
  if (item.key !== undefined) return item.key;
  return typeof item.label === "string" ? `${item.label}` : String(index);
}

/** Sort without reordering ties, so equal values keep their input order. */
export function sortBarListItems(
  data: readonly BarListItem[],
  sort: BarListSort = "descending",
) {
  const indexed = data.map((item, index) => ({ item, index }));
  if (sort !== "none") {
    const direction = sort === "descending" ? -1 : 1;
    indexed.sort(
      (a, b) =>
        direction * ((a.item.value || 0) - (b.item.value || 0)) ||
        a.index - b.index,
    );
  }
  return indexed;
}

export const BarList = forwardRef<HTMLDivElement, BarListProps>(
  (
    {
      animate = true,
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      className,
      color = "chart-1",
      data,
      defaultExpanded = false,
      emptyLabel = "No data",
      expanded: expandedProp,
      formatOptions,
      formatValue,
      labelHeader,
      limit,
      max,
      onExpandedChange,
      onItemClick,
      showLessLabel = "Show less",
      showMoreLabel = (hidden) => `Show ${hidden} more`,
      size = "md",
      sort = "descending",
      valueHeader,
      ...props
    },
    ref,
  ) => {
    const listId = useId();
    const [expandedState, setExpandedState] = useState(defaultExpanded);
    const expanded = expandedProp ?? expandedState;
    const setExpanded = (next: boolean) => {
      if (expandedProp === undefined) setExpandedState(next);
      onExpandedChange?.(next);
    };

    const rows = sortBarListItems(data, sort);
    const collapsible =
      limit !== undefined && limit >= 0 && rows.length > limit;
    const visible = collapsible && !expanded ? rows.slice(0, limit) : rows;
    const scaleMax =
      max ??
      Math.max(
        0,
        ...data.map((item) => (isFiniteValue(item.value) ? item.value : 0)),
      );
    const format = (value: number) =>
      formatValue ? formatValue(value) : formatChartValue(value, formatOptions);
    // The list carries the name; a generic <div> cannot be named, so the empty
    // state falls back to a named group on the root.
    const labelling = {
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    };
    const hasLabelling =
      ariaDescribedBy !== undefined ||
      ariaLabel !== undefined ||
      ariaLabelledBy !== undefined;
    const labelRoot = rows.length === 0 && hasLabelling;

    return (
      <div
        role={labelRoot ? "group" : undefined}
        {...props}
        {...(labelRoot ? labelling : undefined)}
        ref={ref}
        data-slot="bar-list"
        data-size={size}
        className={cn("grid min-w-0 gap-[var(--dt-space-2)]", className)}
      >
        {labelHeader || valueHeader ? (
          <div
            data-slot="bar-list-header"
            className="text-muted-foreground flex items-center justify-between gap-[var(--dt-space-4)] px-[var(--dt-space-2)] text-xs font-medium"
          >
            <span>{labelHeader}</span>
            <span>{valueHeader}</span>
          </div>
        ) : null}

        {rows.length === 0 ? (
          <p
            data-slot="bar-list-empty"
            className="text-muted-foreground px-[var(--dt-space-2)] py-[var(--dt-space-3)] text-sm"
          >
            {emptyLabel}
          </p>
        ) : (
          // Rows subgrid into a shared value column, so the widest value sets
          // the track and every bar is measured against the same length.
          <ul
            {...labelling}
            id={listId}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-[var(--dt-space-4)] gap-y-[var(--dt-space-1-5)]"
          >
            {visible.map(({ item, index }, position) => {
              const value = isFiniteValue(item.value) ? item.value : 0;
              const share =
                scaleMax > 0 ? Math.min(1, Math.max(0, value / scaleMax)) : 0;
              const rowStyle = {
                "--bar-color": resolveChartColor(item.color ?? color),
              } as CSSProperties;
              const interactive = item.href !== undefined || onItemClick;
              const content = (
                <>
                  <span className="relative flex min-w-0 items-center">
                    {share > 0 ? (
                      <span
                        aria-hidden="true"
                        data-slot="bar-list-bar"
                        className={cn(barClasses, barHeightClasses[size])}
                        style={{
                          ["--bar-share" as string]: `${(share * 100).toFixed(2)}%`,
                          animation: animate ? undefined : "none",
                          animationDelay: animate
                            ? `${Math.min(position, 12) * 30}ms`
                            : undefined,
                        }}
                      />
                    ) : null}
                    <span className="relative flex min-w-0 items-center gap-[var(--dt-space-2)] px-[var(--dt-space-2)]">
                      {item.icon ? (
                        <span
                          aria-hidden="true"
                          className="inline-flex size-4 shrink-0 items-center justify-center [&>img]:size-4 [&>svg]:size-4"
                        >
                          {item.icon}
                        </span>
                      ) : null}
                      <span
                        data-slot="bar-list-label"
                        // Labels follow their own script, so "/pricing" never
                        // renders as "pricing/" in right-to-left layouts.
                        dir="auto"
                        className="min-w-0 truncate"
                        title={
                          typeof item.label === "string"
                            ? item.label
                            : undefined
                        }
                      >
                        {item.label}
                      </span>
                    </span>
                  </span>
                  <span
                    data-slot="bar-list-value"
                    dir="ltr"
                    className="text-foreground justify-self-end font-medium tabular-nums"
                  >
                    {format(value)}
                  </span>
                </>
              );
              const rowClasses = cn(
                "col-span-2 grid w-full min-w-0 grid-cols-subgrid items-center pe-[var(--dt-space-2)] text-start text-foreground",
                rowHeightClasses[size],
                interactive && interactiveRowClasses,
              );

              return (
                <li
                  key={itemKey(item, index)}
                  style={rowStyle}
                  data-slot="bar-list-item"
                  className="col-span-2 grid grid-cols-subgrid"
                >
                  {item.href !== undefined ? (
                    <a
                      href={item.href}
                      className={rowClasses}
                      onClick={
                        onItemClick ? () => onItemClick(item, index) : undefined
                      }
                    >
                      {content}
                    </a>
                  ) : onItemClick ? (
                    <button
                      type="button"
                      className={rowClasses}
                      onClick={() => onItemClick(item, index)}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className={rowClasses}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {collapsible ? (
          <button
            type="button"
            data-slot="bar-list-toggle"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground focus-visible:outline-ring justify-self-start rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-xs font-medium outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
          >
            {expanded
              ? showLessLabel
              : showMoreLabel(rows.length - (limit ?? 0))}
          </button>
        ) : null}
      </div>
    );
  },
);

BarList.displayName = "BarList";
