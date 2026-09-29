import { cn } from "../../utils/cn";
import type {
  FilterProposalChangeKind,
  FilterUnresolvedReason,
} from "./filter-core";

export interface FilterAssistantLabels {
  /** Label of the prompt box. */
  prompt: string;
  placeholder: string;
  submit: string;
  stop: string;
  loading: string;
  declined: string;
  failed: string;
  /** Heading of the proposal. */
  proposal: string;
  proposed: (count: number) => string;
  noChanges: string;
  needsChoice: string;
  kind: Record<FilterProposalChangeKind, string>;
  was: string;
  needsInput: string;
  accept: string;
  reject: string;
  /** Accessible name of a change's decision buttons. */
  decision: (sentence: string) => string;
  unresolved: string;
  unresolvedReason: Record<FilterUnresolvedReason, string>;
  applySelected: (count: number) => string;
  applyAll: string;
  discard: string;
  previewCount: (count: number) => string;
  previewLoading: string;
}

export const defaultFilterAssistantLabels: FilterAssistantLabels = {
  prompt: "Describe the filter you want",
  placeholder: "e.g. open bugs from last week",
  submit: "Propose",
  stop: "Stop",
  loading: "Working on a proposal…",
  declined: "The assistant couldn't turn that into a filter. Try rephrasing.",
  failed: "Something went wrong. Try again.",
  proposal: "Proposed changes",
  proposed: (count) =>
    `${count} ${count === 1 ? "change" : "changes"} proposed`,
  noChanges: "No filter changes suggested.",
  needsChoice: "The assistant needs a choice to continue.",
  kind: { added: "Add", removed: "Remove", changed: "Change" },
  was: "was",
  needsInput: "Needs a value",
  accept: "Accept",
  reject: "Reject",
  decision: (sentence) => `Keep this change? ${sentence}`,
  unresolved: "Couldn't use",
  unresolvedReason: {
    "unknown-field": "no such field",
    "unknown-operator": "not a supported comparison",
    "unknown-value": "no matching value",
    "max-depth": "nested too deeply",
    "too-many-conditions": "too many conditions",
    model: "not supported",
  },
  applySelected: (count) =>
    `Apply ${count} ${count === 1 ? "change" : "changes"}`,
  applyAll: "Apply all",
  discard: "Discard",
  previewCount: (count) =>
    `About ${count.toLocaleString("en-US")} ${count === 1 ? "result" : "results"}`,
  previewLoading: "Counting results…",
};

export const filterAssistantClasses =
  "grid w-full min-w-0 gap-[var(--dt-space-2)]";

export const filterAssistantFormClasses =
  "flex min-w-0 items-center gap-[var(--dt-space-2)]";

export const filterAssistantStatusClasses =
  "min-h-5 text-sm text-muted-foreground data-[tone=error]:text-destructive";

export const filterProposalClasses =
  "grid gap-[var(--dt-space-3)] rounded-lg border border-border bg-background p-[var(--dt-space-3)] outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const filterProposalHeadingClasses = "text-sm font-medium";

export const filterProposalListClasses = "grid gap-[var(--dt-space-1-5)]";

export const filterProposalChangeClasses =
  "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-[var(--dt-space-2)] gap-y-[var(--dt-space-1-5)] rounded-md border border-l-4 px-[var(--dt-space-2-5)] py-[var(--dt-space-2)] text-sm motion-safe:transition-[opacity,background-color] motion-safe:duration-[var(--dt-motion-fast)] data-[proposal=added]:border-l-success data-[proposal=changed]:border-l-info data-[proposal=removed]:border-l-destructive data-[decision=rejected]:opacity-60 sm:grid-cols-[auto_minmax(0,1fr)_auto]";

export const filterProposalKindClasses =
  "inline-flex items-center gap-[var(--dt-space-1)] rounded-sm bg-muted px-[var(--dt-space-1-5)] py-0.5 text-xs font-medium text-foreground";

export const filterProposalSentenceClasses =
  "min-w-0 [overflow-wrap:anywhere] group-data-[proposal=removed]/change:line-through";

export const filterProposalMetaClasses = "text-xs text-muted-foreground";

export const filterProposalNeedsInputClasses =
  "ms-[var(--dt-space-1-5)] inline-flex items-center rounded-sm border border-warning px-[var(--dt-space-1)] text-xs font-medium text-foreground";

export const filterProposalDecisionClasses =
  "col-span-2 flex gap-[var(--dt-space-1)] sm:col-span-1";

export const filterProposalToggleClasses =
  "inline-flex h-7 items-center rounded-md border border-border px-[var(--dt-space-2)] text-xs font-medium text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-foreground aria-pressed:bg-muted aria-pressed:text-foreground motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)]";

export const filterProposalButtonClasses =
  "inline-flex h-8 items-center justify-center rounded-md px-[var(--dt-space-3)] text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)]";

export const filterProposalPrimaryClasses = cn(
  filterProposalButtonClasses,
  "bg-primary text-primary-foreground hover:bg-primary/90",
);

export const filterProposalSecondaryClasses = cn(
  filterProposalButtonClasses,
  "border border-border text-foreground hover:bg-muted",
);

export const filterProposalGhostClasses = cn(
  filterProposalButtonClasses,
  "text-muted-foreground hover:bg-muted hover:text-foreground",
);

export function ProposalKindIcon({ kind }: { kind: FilterProposalChangeKind }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3">
      <path
        d={
          kind === "added"
            ? "M8 3.5v9M3.5 8h9"
            : kind === "removed"
              ? "M3.5 8h9"
              : "M3 6h10M3 10h10"
        }
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <path
        d="M8 2.5 9.3 6.7 13.5 8 9.3 9.3 8 13.5 6.7 9.3 2.5 8l4.2-1.3z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}
