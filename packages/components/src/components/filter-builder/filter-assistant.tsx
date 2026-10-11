import {
  useEffect,
  useId,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { Input } from "../input";
import { LiveRegion } from "../live-region";
import type { DescribeFilterOptions } from "./filter-core";
import {
  SparkIcon,
  defaultFilterAssistantLabels,
  filterAssistantClasses,
  filterAssistantFormClasses,
  filterAssistantStatusClasses,
  filterProposalPrimaryClasses,
  filterProposalSecondaryClasses,
  type FilterAssistantLabels,
} from "./filter-assistant-parts";
import { FilterProposal } from "./filter-proposal";
import type { FilterAssistantState } from "./use-filter-assistant";

export interface FilterAssistantProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** State from `useFilterAssistant`. */
  assistant: FilterAssistantState;
  labels?: Partial<FilterAssistantLabels>;
  /**
   * Extra controls beside the prompt, e.g. a VoiceInput whose transcript
   * you pass to `assistant.setPrompt` or `assistant.submit`.
   */
  actions?: ReactNode;
  /** Renders the proposal under the prompt. Defaults to true. */
  showProposal?: boolean;
  describeOptions?: DescribeFilterOptions;
}

/**
 * Ask for a filter in words. The assistant's answer appears as a proposal
 * to review; nothing changes until it is applied.
 */
export function FilterAssistant({
  actions,
  assistant,
  className,
  describeOptions,
  labels: labelOverrides,
  showProposal = true,
  ...props
}: FilterAssistantProps) {
  const labels = useMemo(
    () => ({ ...defaultFilterAssistantLabels, ...labelOverrides }),
    [labelOverrides],
  );
  const inputId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const proposalRef = useRef<HTMLElement>(null);
  const focusProposalRef = useRef(false);
  const stopFocusedRef = useRef(false);
  const { proposal, status } = assistant;
  const loading = status === "loading";

  // A request that ends while Stop has focus removes Stop; keep focus in
  // the prompt instead of losing it.
  useEffect(() => {
    if (!loading && stopFocusedRef.current) {
      stopFocusedRef.current = false;

      if (
        document.activeElement === null ||
        document.activeElement === document.body
      ) {
        inputRef.current?.focus();
      }
    }
  }, [loading]);

  // After a clarification answer, move focus to the new proposal.
  useEffect(() => {
    if (focusProposalRef.current && proposal && !loading) {
      focusProposalRef.current = false;
      proposalRef.current?.focus();
    }
  }, [loading, proposal]);

  const statusText = loading
    ? labels.loading
    : status === "error"
      ? assistant.errorCode === "declined"
        ? labels.declined
        : labels.failed
      : proposal
        ? proposal.changes.length > 0
          ? labels.proposed(proposal.changes.length)
          : proposal.clarifications.length > 0
            ? labels.needsChoice
            : labels.noChanges
        : "";

  return (
    <div
      {...props}
      data-slot="filter-assistant"
      data-status={status}
      className={cn(filterAssistantClasses, className)}
    >
      <form
        className={filterAssistantFormClasses}
        onSubmit={(event) => {
          event.preventDefault();
          assistant.submit();
          // Propose turns into Stop (and back); keep focus in the prompt.
          inputRef.current?.focus();
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          {labels.prompt}
        </label>
        <Input
          ref={inputRef}
          id={inputId}
          value={assistant.prompt}
          placeholder={labels.placeholder}
          aria-describedby={statusText ? statusId : undefined}
          autoComplete="off"
          className="min-w-0 flex-1"
          onChange={(event) => {
            assistant.setPrompt(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && loading) {
              event.preventDefault();
              assistant.abort();
            }
          }}
        />
        {actions}
        {loading ? (
          // Distinct keys: reusing one element would flip it back to a
          // submit button mid-click and submit the form again.
          <button
            key="stop"
            type="button"
            onFocus={() => {
              stopFocusedRef.current = true;
            }}
            className={filterProposalSecondaryClasses}
            onClick={(event) => {
              event.preventDefault();
              assistant.abort();
              inputRef.current?.focus();
            }}
          >
            {labels.stop}
          </button>
        ) : (
          <button
            key="submit"
            type="submit"
            disabled={assistant.prompt.trim() === ""}
            className={cn(filterProposalPrimaryClasses, "gap-1.5")}
          >
            <SparkIcon />
            {labels.submit}
          </button>
        )}
      </form>
      <p
        id={statusId}
        data-slot="filter-assistant-status"
        data-tone={status === "error" ? "error" : undefined}
        className={filterAssistantStatusClasses}
      >
        {statusText}
      </p>
      <LiveRegion slotName="filter-assistant-announcer">
        {statusText}
      </LiveRegion>
      {showProposal && proposal ? (
        <FilterProposal
          ref={proposalRef}
          assistant={assistant}
          labels={labelOverrides}
          describeOptions={describeOptions}
          onAnswer={() => {
            focusProposalRef.current = true;
          }}
          onSettled={() => {
            inputRef.current?.focus();
          }}
        />
      ) : null}
    </div>
  );
}
