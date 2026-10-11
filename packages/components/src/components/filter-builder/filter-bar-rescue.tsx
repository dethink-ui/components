import { describeFilterCondition } from "./filter-core";
import {
  filterBarActionClassNames,
  useFilterBarContext,
} from "./filter-bar-parts";

export interface FilterBarRescueProps {
  className?: string;
}

/**
 * Shown when no rows match: names the most restrictive condition and offers
 * to remove it ("Relax") as one undoable step. Needs FilterBar `data`.
 */
export function FilterBarRescue({ className }: FilterBarRescueProps) {
  const { describeOptions, fields, labels, rescue, size, state } =
    useFilterBarContext("FilterBarRescue");

  if (!rescue) {
    return null;
  }

  const description = describeFilterCondition(
    rescue.condition,
    fields,
    describeOptions,
  );

  return (
    <div
      data-slot="filter-bar-rescue"
      className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-[var(--dt-space-2)] text-sm"
    >
      <span className="min-w-0">
        {labels.rescue(description, rescue.count)}
      </span>
      <button
        type="button"
        data-slot="filter-bar-relax"
        aria-label={`${labels.relax}: ${description}`}
        className={filterBarActionClassNames({
          size,
          className: `border-border text-foreground border ${className ?? ""}`,
        })}
        onClick={() => {
          state.removeNode(rescue.condition.id);
        }}
      >
        {labels.relax}
      </button>
    </div>
  );
}
