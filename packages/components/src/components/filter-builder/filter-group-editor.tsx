import {
  useEffect,
  useId,
  useMemo,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { cn } from "../../utils/cn";
import {
  canAddFilterGroup,
  createFilter,
  describeFilter,
  findFilterNode,
  getFilterNodeDepth,
} from "./filter-core";
import {
  groupEditorClasses,
  groupClasses,
  groupHeaderClasses,
  groupListClasses,
  rowClasses,
  selectClasses,
  toggleClasses,
  type EditorContextValue,
  EditorContext,
  useEditorContext,
  NodeActions,
} from "./filter-group-actions";
import { FilterAddMenu } from "./filter-add-menu";
import { FilterChip } from "./filter-chip";
import type { FilterCombinator, FilterGroup, FilterNode } from "./filter-types";
import {
  PlusIcon,
  filterBarActionClassNames,
  useFilterBarContext,
} from "./filter-bar-parts";

function GroupNode({ group }: { group: FilterGroup }) {
  const { describeOptions, fields, labels, maxDepth, state } =
    useFilterBarContext("FilterGroupEditor");
  const { focusAfterRender, focusNodeAfterRender, registerNode, topGroupId } =
    useEditorContext();
  const headingId = useId();
  const depth = getFilterNodeDepth(state.filter, group.id) ?? 1;
  const isTop = group.id === topGroupId;
  const canNest = canAddFilterGroup(state.filter, group.id, maxDepth);
  const summary =
    group.children.length > 0
      ? describeFilter(group, fields, describeOptions)
      : labels.emptyGroup;

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLLIElement>,
    node: FilterNode,
  ) => {
    if (
      !event.altKey ||
      (event.key !== "ArrowUp" && event.key !== "ArrowDown") ||
      !(event.target instanceof HTMLElement) ||
      event.target.closest("li") !== event.currentTarget
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    focusAfterRender(event.target);
    state.shiftNode(node.id, event.key === "ArrowUp" ? -1 : 1);
  };

  return (
    <div
      ref={(element) => {
        registerNode(group.id, element);
      }}
      role="group"
      aria-labelledby={headingId}
      data-slot="filter-group"
      data-depth={depth}
      data-top={isTop ? "" : undefined}
      data-negated={group.not ? "" : undefined}
      className={groupClasses}
    >
      <div data-slot="filter-group-header" className={groupHeaderClasses}>
        <span id={headingId} className="sr-only">
          {isTop && depth === 1
            ? labels.groupEditor
            : labels.editGroup(summary)}
        </span>
        <span aria-hidden="true">{labels.matchPrefix}</span>
        <select
          aria-label={`${labels.matchPrefix} ${labels.matchSuffix}`}
          data-slot="filter-group-combinator"
          value={group.combinator}
          className={selectClasses}
          onChange={(event) => {
            state.setCombinator(
              group.id,
              event.currentTarget.value as FilterCombinator,
            );
          }}
        >
          <option value="and">{labels.matchAll}</option>
          <option value="or">{labels.matchAny}</option>
        </select>
        <span aria-hidden="true">{labels.matchSuffix}</span>
        {isTop ? (
          <button
            type="button"
            data-filter-bar-item="negate"
            aria-pressed={Boolean(group.not)}
            className={toggleClasses}
            onClick={() => {
              state.setNegated(group.id, !group.not);
            }}
          >
            {labels.negate}
          </button>
        ) : (
          <NodeActions node={group} />
        )}
      </div>
      {group.children.length > 0 ? (
        <ul className={groupListClasses}>
          {group.children.map((child) => (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Alt+Arrow moves the row that holds the focused control.
            <li
              key={child.id}
              data-slot="filter-group-row"
              className="min-w-0"
              onKeyDown={(event) => {
                handleRowKeyDown(event, child);
              }}
            >
              {child.type === "condition" ? (
                <div
                  ref={(element) => {
                    registerNode(child.id, element);
                  }}
                  className={rowClasses}
                >
                  <FilterChip condition={child} />
                  <NodeActions node={child} />
                </div>
              ) : (
                <GroupNode group={child} />
              )}
            </li>
          ))}
        </ul>
      ) : null}
      <div className={rowClasses}>
        <FilterAddMenu parentId={group.id} className="h-7 text-xs">
          <PlusIcon />
          {labels.addCondition}
        </FilterAddMenu>
        <button
          type="button"
          data-filter-bar-item="add-group"
          disabled={!canNest}
          title={canNest ? undefined : labels.maxDepthReached(maxDepth)}
          className={filterBarActionClassNames({
            className:
              "h-7 text-xs disabled:pointer-events-none disabled:opacity-40",
          })}
          onClick={() => {
            const next = createFilter();

            focusNodeAfterRender(
              next.id,
              '[data-slot="filter-add-menu-trigger"]',
            );
            state.addNode(next, { parentId: group.id });
          }}
        >
          <PlusIcon />
          {labels.addGroup}
        </button>
      </div>
    </div>
  );
}

export interface FilterGroupEditorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Group to edit. Defaults to the root of the filter. */
  groupId?: string;
}

/**
 * Nested AND/OR editor for a filter group, rendered inside a FilterBar.
 * Tab moves through the controls, Alt+ArrowUp/ArrowDown moves the focused
 * row, and Cmd/Ctrl+Z undoes.
 */
export function FilterGroupEditor({
  className,
  groupId,
  onKeyDown,
  ...props
}: FilterGroupEditorProps) {
  const { state } = useFilterBarContext("FilterGroupEditor");
  const nodeElements = useRef(new Map<string, HTMLElement>());
  const pendingElement = useRef<HTMLElement | null>(null);
  const pendingNode = useRef<{ id: string; selector: string } | null>(null);
  const node = groupId ? findFilterNode(state.filter, groupId) : state.filter;
  const topGroupId = node?.id ?? state.filter.id;

  useEffect(() => {
    const element = pendingElement.current;
    const target = pendingNode.current;

    pendingElement.current = null;
    pendingNode.current = null;

    const row = target ? nodeElements.current.get(target.id) : undefined;
    const preferred = target
      ? row?.querySelector<HTMLButtonElement>(target.selector)
      : undefined;
    // A command can leave the preferred control disabled (e.g. wrapping at
    // the depth limit), so fall back to the row's first usable control.
    const nodeTarget =
      preferred && !preferred.disabled
        ? preferred
        : row?.querySelector<HTMLElement>(
            "[data-filter-bar-item]:not(:disabled)",
          );

    if (nodeTarget) {
      nodeTarget.focus();
    } else if (element?.isConnected && document.activeElement !== element) {
      element.focus();
    }
  });

  const contextValue = useMemo<EditorContextValue>(
    () => ({
      focusAfterRender: (element) => {
        pendingElement.current = element ?? null;
      },
      focusNodeAfterRender: (id, selector) => {
        pendingNode.current = { id, selector };
      },
      registerNode: (id, element) => {
        if (element) {
          nodeElements.current.set(id, element);
        } else {
          nodeElements.current.delete(id);
        }
      },
      topGroupId,
    }),
    [topGroupId],
  );

  if (node?.type !== "group") {
    return null;
  }

  return (
    <EditorContext.Provider value={contextValue}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Handles undo for the editor's own controls. */}
      <div
        {...props}
        data-slot="filter-group-editor"
        data-filter-focus-scope=""
        className={cn(groupEditorClasses, className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);

          const target = event.target;

          if (
            event.defaultPrevented ||
            !(event.metaKey || event.ctrlKey) ||
            event.key.toLowerCase() !== "z" ||
            !(target instanceof HTMLElement) ||
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA"
          ) {
            return;
          }

          event.preventDefault();
          // Keep the bar's toolbar from undoing a second time.
          event.stopPropagation();

          if (event.shiftKey) {
            state.redo();
          } else {
            state.undo();
          }
        }}
      >
        <GroupNode group={node} />
      </div>
    </EditorContext.Provider>
  );
}
