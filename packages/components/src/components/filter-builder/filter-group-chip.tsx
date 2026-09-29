import { useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Popover, PopoverContent } from "../popover";
import { describeFilter } from "./filter-core";
import {
  groupEditorPopoverClasses,
  groupSummaryClasses,
  TreeIcon,
} from "./filter-group-actions";
import { FilterGroupEditor } from "./filter-group-editor";
import type { FilterGroup } from "./filter-types";
import {
  CloseIcon,
  filterBarActionClassNames,
  filterChipClassNames,
  getNeighborItem,
  isRemoveKey,
  segmentClasses,
  segmentRemoveClasses,
  useEditorFocusReturn,
  useFilterBarContext,
} from "./filter-bar-parts";

export interface FilterGroupChipProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  group: FilterGroup;
  index?: number;
}

/** Summary of a nested group. Opens the group editor; × removes the group. */
export function FilterGroupChip({
  className,
  group,
  index = 0,
  ...props
}: FilterGroupChipProps) {
  const {
    collapseAfter,
    describeOptions,
    expanded,
    fields,
    labels,
    requestFocus,
    size,
    state,
  } = useFilterBarContext("FilterGroupChip");
  const [open, setOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useEditorFocusReturn(open);
  const description =
    group.children.length > 0
      ? describeFilter(group, fields, describeOptions)
      : labels.emptyGroup;

  const remove = () => {
    requestFocus(getNeighborItem(chipRef.current));
    state.removeNode(group.id);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Keys delegate to the chip's roving segment buttons.
    <div
      {...props}
      ref={chipRef}
      role="group"
      aria-label={description}
      data-slot="filter-group-chip"
      data-negated={group.not ? "" : undefined}
      data-overflow={index >= collapseAfter && !expanded ? "" : undefined}
      className={filterChipClassNames({ size, className })}
      onKeyDown={(event) => {
        if (isRemoveKey(event)) {
          event.preventDefault();
          remove();
        }
      }}
    >
      <button
        type="button"
        data-filter-bar-item="group"
        data-slot="filter-group-chip-trigger"
        aria-label={labels.editGroup(description)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(segmentClasses, groupSummaryClasses)}
        onClick={(event) => {
          returnFocusRef.current = event.currentTarget;
          setOpen(true);
        }}
      >
        <span className="min-w-0 truncate">{description}</span>
      </button>
      <button
        type="button"
        data-filter-bar-item="remove"
        data-slot="filter-chip-remove"
        aria-label={labels.remove(description)}
        className={cn(segmentClasses, segmentRemoveClasses)}
        onClick={remove}
      >
        <CloseIcon />
      </button>
      <Popover anchorRef={chipRef} open={open} onOpenChange={setOpen}>
        <PopoverContent
          aria-label={labels.editGroup(description)}
          placement="bottom start"
          className={groupEditorPopoverClasses}
        >
          <FilterGroupEditor groupId={group.id} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export interface FilterBarAdvancedProps {
  className?: string;
  children?: ReactNode;
}

/** Opens the group editor for the whole filter. Hidden while it is empty. */
export function FilterBarAdvanced({
  children,
  className,
}: FilterBarAdvancedProps) {
  const { labels, size, state } = useFilterBarContext("FilterBarAdvanced");
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (state.filter.children.length === 0) {
    return null;
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-filter-bar-item="advanced"
        data-slot="filter-bar-advanced"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={filterBarActionClassNames({ size, className })}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {children ?? (
          <>
            <TreeIcon />
            {labels.advanced}
          </>
        )}
      </button>
      <Popover anchorRef={buttonRef} open={open} onOpenChange={setOpen}>
        <PopoverContent
          aria-label={labels.groupEditor}
          placement="bottom start"
          className={groupEditorPopoverClasses}
        >
          <FilterGroupEditor />
        </PopoverContent>
      </Popover>
    </>
  );
}
