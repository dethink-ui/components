import { forwardRef, useId, useMemo, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import {
  describeFilter,
  describeFilterCondition,
  type DescribeFilterOptions,
  type FilterProposalChange,
} from "./filter-core";
import {
  ProposalKindIcon,
  defaultFilterAssistantLabels,
  filterProposalChangeClasses,
  filterProposalClasses,
  filterProposalDecisionClasses,
  filterProposalGhostClasses,
  filterProposalHeadingClasses,
  filterProposalKindClasses,
  filterProposalListClasses,
  filterProposalMetaClasses,
  filterProposalNeedsInputClasses,
  filterProposalPrimaryClasses,
  filterProposalSecondaryClasses,
  filterProposalSentenceClasses,
  filterProposalToggleClasses,
  type FilterAssistantLabels,
} from "./filter-assistant-parts";
import type { FilterFields, FilterNode } from "./filter-types";
import type { FilterAssistantState } from "./use-filter-assistant";

export interface FilterProposalProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** State from `useFilterAssistant`. */
  assistant: FilterAssistantState;
  labels?: Partial<FilterAssistantLabels>;
  describeOptions?: DescribeFilterOptions;
  /** Called after Apply, Apply all or Discard, e.g. to move focus. */
  onSettled?: () => void;
  /** Called after a clarification choice is sent. */
  onAnswer?: () => void;
}

function sentence(
  node: FilterNode,
  fields: FilterFields,
  options?: DescribeFilterOptions,
) {
  return node.type === "condition"
    ? describeFilterCondition(node, fields, options)
    : describeFilter(node, fields, options);
}

/**
 * Review of an assistant's proposal: each added, changed or removed chip
 * with Accept and Reject, clarification choices, what couldn't be used, and
 * Apply (selected), Apply all and Discard. Model text renders as text only.
 */
export const FilterProposal = forwardRef<HTMLElement, FilterProposalProps>(
  (
    {
      assistant,
      className,
      describeOptions,
      labels: labelOverrides,
      onAnswer,
      onSettled,
      ...props
    },
    ref,
  ) => {
    const labels = useMemo(
      () => ({ ...defaultFilterAssistantLabels, ...labelOverrides }),
      [labelOverrides],
    );
    const headingId = useId();
    const { decisions, fields, proposal, selected } = assistant;

    if (!proposal) {
      return null;
    }

    const { changes, clarifications, unresolved } = proposal;
    const describe = (change: FilterProposalChange) =>
      sentence(change.node, fields, describeOptions);

    return (
      <section
        {...props}
        ref={ref}
        tabIndex={-1}
        aria-labelledby={headingId}
        data-slot="filter-proposal"
        className={cn(filterProposalClasses, className)}
      >
        <h3 id={headingId} className={filterProposalHeadingClasses}>
          {labels.proposal}
        </h3>
        {proposal.message ? (
          <p data-slot="filter-proposal-message" className="text-sm">
            {proposal.message}
          </p>
        ) : null}
        {clarifications.map((clarification) => {
          const questionId = `${headingId}-${clarification.id}`;

          return (
            <div
              key={clarification.id}
              role="group"
              aria-labelledby={questionId}
              data-slot="filter-proposal-clarification"
              className="grid gap-[var(--dt-space-1-5)]"
            >
              <p id={questionId} className="text-sm font-medium">
                {clarification.question}
              </p>
              <div className="flex flex-wrap gap-[var(--dt-space-1-5)]">
                {clarification.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={assistant.status === "loading"}
                    className={filterProposalSecondaryClasses}
                    onClick={() => {
                      assistant.answer(clarification.id, choice.id);
                      onAnswer?.();
                    }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {unresolved.length > 0 ? (
          <div data-slot="filter-proposal-unresolved" className="grid gap-1">
            <p className="text-sm font-medium">{labels.unresolved}</p>
            <ul className={cn(filterProposalMetaClasses, "grid gap-0.5")}>
              {unresolved.map((item) => (
                <li key={`${item.reason}:${item.text}`}>
                  {item.text} ({labels.unresolvedReason[item.reason]})
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {changes.length === 0 && clarifications.length === 0 ? (
          <p className={filterProposalMetaClasses}>{labels.noChanges}</p>
        ) : null}
        {changes.length > 0 ? (
          <ul className={filterProposalListClasses}>
            {changes.map((change) => {
              const text = describe(change);
              const decision = decisions[change.id] ?? "accepted";

              return (
                <li
                  key={change.id}
                  data-slot="filter-proposal-change"
                  data-proposal={change.kind}
                  data-decision={decision}
                  data-needs-input={change.needsInput ? "" : undefined}
                  className={cn("group/change", filterProposalChangeClasses)}
                >
                  <span className={filterProposalKindClasses}>
                    <ProposalKindIcon kind={change.kind} />
                    {labels.kind[change.kind]}
                  </span>
                  <span className="min-w-0">
                    <span className={filterProposalSentenceClasses}>
                      {text}
                    </span>
                    {change.needsInput ? (
                      <span className={filterProposalNeedsInputClasses}>
                        {labels.needsInput}
                      </span>
                    ) : null}
                    {change.before ? (
                      <span className={cn(filterProposalMetaClasses, "block")}>
                        {labels.was}{" "}
                        {sentence(change.before, fields, describeOptions)}
                      </span>
                    ) : null}
                  </span>
                  <span
                    role="group"
                    aria-label={labels.decision(text)}
                    className={filterProposalDecisionClasses}
                  >
                    <button
                      type="button"
                      aria-pressed={decision === "accepted"}
                      className={filterProposalToggleClasses}
                      onClick={() => {
                        assistant.setDecision(change.id, "accepted");
                      }}
                    >
                      {labels.accept}
                    </button>
                    <button
                      type="button"
                      aria-pressed={decision === "rejected"}
                      className={filterProposalToggleClasses}
                      onClick={() => {
                        assistant.setDecision(change.id, "rejected");
                      }}
                    >
                      {labels.reject}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
        <div className="flex flex-wrap items-center gap-[var(--dt-space-2)]">
          {changes.length > 0 ? (
            <>
              <button
                type="button"
                disabled={
                  selected.length === 0 || assistant.status === "loading"
                }
                className={filterProposalPrimaryClasses}
                onClick={() => {
                  assistant.apply();
                  onSettled?.();
                }}
              >
                {labels.applySelected(selected.length)}
              </button>
              {selected.length < changes.length ? (
                <button
                  type="button"
                  disabled={assistant.status === "loading"}
                  className={filterProposalSecondaryClasses}
                  onClick={() => {
                    assistant.apply({ all: true });
                    onSettled?.();
                  }}
                >
                  {labels.applyAll}
                </button>
              ) : null}
            </>
          ) : null}
          <button
            type="button"
            className={filterProposalGhostClasses}
            onClick={() => {
              assistant.discard();
              onSettled?.();
            }}
          >
            {labels.discard}
          </button>
          {assistant.previewStatus === "loading" ? (
            <span className={filterProposalMetaClasses}>
              {labels.previewLoading}
            </span>
          ) : assistant.previewCount === undefined ? null : (
            <span
              data-slot="filter-proposal-preview"
              className={filterProposalMetaClasses}
            >
              {labels.previewCount(assistant.previewCount)}
            </span>
          )}
        </div>
      </section>
    );
  },
);

FilterProposal.displayName = "FilterProposal";
