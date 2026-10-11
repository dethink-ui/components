import { type ReactNode } from "react";
import { cn } from "../../utils/cn";
import type { FilterCondition } from "./filter-types";
import { FilterChip } from "./filter-chip";
import { FilterGroupChip } from "./filter-group-chip";
import {
  UndoIcon,
  conjunctionClasses,
  filterBarActionClassNames,
  moreButtonClasses,
  negationClasses,
  useFilterBarContext,
} from "./filter-bar-parts";

export interface FilterBarChipsProps {
  /** Custom chip renderer. Return `undefined` to use the default chip. */
  renderChip?: (condition: FilterCondition, index: number) => ReactNode;
}

/** Chips for the root conditions, with narrow-width collapsing. */
export function FilterBarChips({ renderChip }: FilterBarChipsProps) {
  const { collapseAfter, expanded, labels, setExpanded, size, state } =
    useFilterBarContext("FilterBarChips");
  const { children, combinator } = state.filter;
  const hiddenCount = Math.max(children.length - collapseAfter, 0);

  return (
    <>
      {state.filter.not && children.length > 0 ? (
        <span data-slot="filter-bar-not" className={negationClasses}>
          {labels.notMatching}
        </span>
      ) : null}
      {children.map((node, index) => (
        <FilterBarChipSlot
          key={node.id}
          conjunction={index > 0 && combinator === "or" ? labels.or : undefined}
        >
          {node.type === "condition" ? (
            (renderChip?.(node, index) ?? (
              <FilterChip condition={node} index={index} />
            ))
          ) : (
            <FilterGroupChip group={node} index={index} />
          )}
        </FilterBarChipSlot>
      ))}
      {hiddenCount > 0 ? (
        <button
          type="button"
          data-filter-bar-item="more"
          data-slot="filter-bar-more"
          aria-expanded={expanded}
          className={filterBarActionClassNames({
            size,
            className: moreButtonClasses,
          })}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? labels.showLess : labels.showMore(hiddenCount)}
        </button>
      ) : null}
    </>
  );
}

function FilterBarChipSlot({
  children,
  conjunction,
}: {
  children: ReactNode;
  conjunction?: string;
}) {
  if (!conjunction) {
    return children;
  }

  return (
    <>
      <span aria-hidden="true" className={conjunctionClasses}>
        {conjunction}
      </span>
      {children}
    </>
  );
}

export interface FilterBarActionProps {
  className?: string;
  children?: ReactNode;
}

/** Removes every filter. Hidden while the filter is empty. */
export function FilterBarClear({ children, className }: FilterBarActionProps) {
  const { addButtonRef, labels, requestFocus, size, state } =
    useFilterBarContext("FilterBarClear");

  if (state.filter.children.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      data-filter-bar-item="clear"
      data-slot="filter-bar-clear"
      className={filterBarActionClassNames({ size, className })}
      onClick={() => {
        requestFocus(addButtonRef.current);
        state.clear();
      }}
    >
      {children ?? labels.clear}
    </button>
  );
}

/** Undoes the last filter change. Hidden when there is nothing to undo. */
export function FilterBarUndo({ children, className }: FilterBarActionProps) {
  const { labels, size, state } = useFilterBarContext("FilterBarUndo");

  if (!state.canUndo) {
    return null;
  }

  return (
    <button
      type="button"
      data-filter-bar-item="undo"
      data-slot="filter-bar-undo"
      aria-label={children ? undefined : labels.undo}
      title={children ? undefined : labels.undo}
      className={filterBarActionClassNames({
        size,
        className: cn(
          children ? undefined : "px-[var(--dt-space-1-5)]",
          className,
        ),
      })}
      onClick={() => {
        state.undo();
      }}
    >
      {children ?? <UndoIcon />}
    </button>
  );
}
