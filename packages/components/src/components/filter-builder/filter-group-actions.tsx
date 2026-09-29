import { createContext, useContext } from "react";
import {
  canWrapFilterNode,
  describeFilter,
  describeFilterCondition,
  findFilterParent,
} from "./filter-core";
import type { FilterNode } from "./filter-types";
import {
  CloseIcon,
  getNeighborItem,
  useFilterBarContext,
} from "./filter-bar-parts";

export const groupEditorClasses =
  "grid min-w-0 gap-[var(--dt-space-2)] text-sm";

export const groupEditorPopoverClasses =
  "w-[min(36rem,calc(100vw-2rem))] max-w-none p-[var(--dt-space-3)]";

export const groupClasses =
  "grid min-w-0 gap-[var(--dt-space-2)] rounded-md border border-border p-[var(--dt-space-2)] data-[top]:border-0 data-[top]:p-0 data-[negated]:border-dashed";

export const groupHeaderClasses =
  "flex min-w-0 flex-wrap items-center gap-[var(--dt-space-1-5)] text-muted-foreground";

export const groupListClasses =
  "grid min-w-0 gap-[var(--dt-space-1-5)] border-s border-border ps-[var(--dt-space-3)]";

export const rowClasses =
  "flex min-w-0 flex-wrap items-center gap-[var(--dt-space-1)]";

export const selectClasses =
  "h-7 rounded-sm border border-input bg-background px-[var(--dt-space-1-5)] text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const toggleClasses =
  "inline-flex h-7 items-center rounded-sm border border-border px-[var(--dt-space-2)] text-xs font-semibold uppercase text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-foreground aria-pressed:bg-muted aria-pressed:text-foreground";

export const iconButtonClasses =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

export const groupSummaryClasses =
  "min-w-0 max-w-[24rem] text-muted-foreground hover:text-foreground";

export function ArrowIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path
        d={
          direction === "up"
            ? "M8 12.5v-9M4 7.5l4-4 4 4"
            : "M8 3.5v9M4 8.5l4 4 4-4"
        }
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function BracketIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path
        d="M5.5 2.5h-2v11h2M10.5 2.5h2v11h-2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function UngroupIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path
        d="M5.5 2.5h-2v4M3.5 9.5v4h2M10.5 2.5h2v4M12.5 9.5v4h-2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function TreeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <path
        d="M3 3.5h4M5 3.5v8.5h3M5 8h3M10 8h3M10 12h3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export interface EditorContextValue {
  /** Focus this element after the next render (moves re-order the DOM). */
  focusAfterRender: (element: HTMLElement | null | undefined) => void;
  /** Focus the add button of this group after it renders. */
  /**
   * Focus the first element matching `selector` inside a node's row after it
   * renders. Used when a command remounts the row (wrap, new group).
   */
  focusNodeAfterRender: (nodeId: string, selector: string) => void;
  registerNode: (nodeId: string, element: HTMLElement | null) => void;
  topGroupId: string;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditorContext() {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("Group editor parts must render inside FilterGroupEditor.");
  }

  return context;
}

export function NodeActions({ node }: { node: FilterNode }) {
  const { describeOptions, fields, labels, maxDepth, state } =
    useFilterBarContext("FilterGroupEditor");
  // Every row has the same actions, so names say which row they act on.
  const target =
    node.type === "condition"
      ? describeFilterCondition(node, fields, describeOptions)
      : describeFilter(node, fields, describeOptions);
  const name = (action: string) => `${action}, ${target}`;
  const { focusAfterRender, focusNodeAfterRender, topGroupId } =
    useEditorContext();
  const location = findFilterParent(state.filter, node.id);
  const index = location?.index ?? 0;
  const last = (location?.parent.children.length ?? 1) - 1;
  const canWrap = canWrapFilterNode(state.filter, node.id, maxDepth);

  const shift = (offset: -1 | 1) => {
    const next = index + offset;
    // At an edge the pressed arrow becomes disabled, so focus the other one.
    const item =
      next === 0 ? "move-down" : next === last ? "move-up" : undefined;

    focusNodeAfterRender(
      node.id,
      `[data-filter-bar-item="${item ?? (offset < 0 ? "move-up" : "move-down")}"]`,
    );
    state.shiftNode(node.id, offset);
  };

  return (
    <span data-slot="filter-node-actions" className="inline-flex items-center">
      <button
        type="button"
        data-filter-bar-item="negate"
        aria-label={name(labels.negate)}
        aria-pressed={Boolean(node.not)}
        className={toggleClasses}
        onClick={() => {
          state.setNegated(node.id, !node.not);
        }}
      >
        {labels.negate}
      </button>
      <button
        type="button"
        data-filter-bar-item="move-up"
        aria-label={name(labels.moveUp)}
        title={`${labels.moveUp} (Alt+↑)`}
        disabled={index === 0}
        className={iconButtonClasses}
        onClick={() => {
          shift(-1);
        }}
      >
        <ArrowIcon direction="up" />
      </button>
      <button
        type="button"
        data-filter-bar-item="move-down"
        aria-label={name(labels.moveDown)}
        title={`${labels.moveDown} (Alt+↓)`}
        disabled={index === last}
        className={iconButtonClasses}
        onClick={() => {
          shift(1);
        }}
      >
        <ArrowIcon direction="down" />
      </button>
      <button
        type="button"
        data-filter-bar-item="wrap"
        aria-label={name(labels.wrapInGroup)}
        title={canWrap ? labels.wrapInGroup : labels.maxDepthReached(maxDepth)}
        disabled={!canWrap}
        className={iconButtonClasses}
        onClick={() => {
          focusNodeAfterRender(node.id, '[data-filter-bar-item="wrap"]');
          state.wrapInGroup(node.id);
        }}
      >
        <BracketIcon />
      </button>
      {node.type === "group" && node.id !== topGroupId ? (
        <>
          <button
            type="button"
            data-filter-bar-item="ungroup"
            aria-label={name(labels.ungroup)}
            title={labels.ungroup}
            className={iconButtonClasses}
            onClick={(event) => {
              const row = event.currentTarget.closest("li");

              focusAfterRender(getNeighborItem(row));
              state.unwrapGroup(node.id);
            }}
          >
            <UngroupIcon />
          </button>
          <button
            type="button"
            data-filter-bar-item="remove"
            aria-label={name(labels.removeGroup)}
            title={labels.removeGroup}
            className={iconButtonClasses}
            onClick={(event) => {
              const row = event.currentTarget.closest("li");

              focusAfterRender(getNeighborItem(row));
              state.removeNode(node.id);
            }}
          >
            <CloseIcon />
          </button>
        </>
      ) : null}
    </span>
  );
}
