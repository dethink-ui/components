import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyFilterProposalChanges,
  createFilterId,
  getFilterFieldSummaries,
  getFilterProposalChanges,
  getFilterConditions,
  isFilterConditionActive,
  matchFilterProposalIds,
  sanitizeFilterAssistantResult,
  toFilterJsonSchema,
  type FilterAssistantResult,
  type FilterClarification,
  type FilterFieldSummary,
  type FilterJsonSchema,
  type FilterProposalChange,
  type FilterUnresolved,
} from "./filter-core";
import type {
  Filter,
  FilterEvaluateOptions,
  FilterFields,
} from "./filter-types";
import type { FilterState } from "./use-filter-state";

export interface FilterAssistantAnswer {
  question: string;
  answer: string;
}

/** What your `resolve` callback receives. Send it to any model. */
export interface FilterAssistantRequest {
  prompt: string;
  /** The filter the person has now. */
  current: Filter;
  /** Structured-output schema for the answer. */
  schema: FilterJsonSchema;
  fields: FilterFieldSummary[];
  /** Answers to the model's clarifying questions, oldest first. */
  answers: FilterAssistantAnswer[];
  /** Epoch ms and IANA zone, for relative dates ("last week"). */
  now: number;
  timeZone: string;
  signal: AbortSignal;
}

export type FilterAssistantResolve = (
  request: FilterAssistantRequest,
) => Promise<FilterAssistantResult | false>;

export type FilterAssistantStatus = "idle" | "loading" | "ready" | "error";

export type FilterProposalDecision = "accepted" | "rejected";

export interface FilterAssistantProposal {
  id: string;
  prompt: string;
  /** The filter the proposal was made against. */
  base: Filter;
  /** The proposed filter, sharing ids with `base` where nothing changed. */
  filter?: Filter;
  changes: FilterProposalChange[];
  clarifications: FilterClarification[];
  unresolved: FilterUnresolved[];
  message?: string;
}

export type FilterAssistantErrorCode = "declined" | "failed";

export interface UseFilterAssistantOptions<TData = unknown> {
  fields: FilterFields<TData>;
  state: FilterState;
  resolve: FilterAssistantResolve;
  /** `now` and `timeZone` passed to the model. */
  evaluateOptions?: Pick<FilterEvaluateOptions, "now" | "timeZone">;
  maxDepth?: number;
  /**
   * Counts rows for the filter the selected changes would give, e.g. from
   * your API. Shown next to Apply.
   */
  onPreviewCount?: (filter: Filter, signal: AbortSignal) => Promise<number>;
  /** Called with errors thrown by `resolve` (never shown to the person). */
  onError?: (error: unknown) => void;
}

export interface FilterAssistantState {
  fields: FilterFields;
  prompt: string;
  setPrompt: (prompt: string) => void;
  status: FilterAssistantStatus;
  errorCode?: FilterAssistantErrorCode;
  proposal?: FilterAssistantProposal;
  decisions: Readonly<Record<string, FilterProposalDecision>>;
  setDecision: (changeId: string, decision: FilterProposalDecision) => void;
  /** Accepted changes, in order. */
  selected: FilterProposalChange[];
  previewCount?: number;
  previewStatus: "idle" | "loading" | "error";
  /** Asks the model. Defaults to the current prompt. */
  submit: (prompt?: string) => void;
  /** Cancels a running request. */
  abort: () => void;
  /** Answers a clarifying question and asks again. */
  answer: (clarificationId: string, choiceId: string) => void;
  /** Applies accepted changes (or all) as one undo step. */
  apply: (options?: { all?: boolean }) => void;
  discard: () => void;
}

/**
 * Natural-language filtering with a review step. `resolve` sends the
 * request to any model; its answer is sanitized against the fields and
 * shown as a proposal. Nothing reaches the filter until the person applies
 * it, and applying is a single undo step.
 */
export function useFilterAssistant<TData>({
  evaluateOptions,
  fields,
  maxDepth,
  onError,
  onPreviewCount,
  resolve,
  state,
}: UseFilterAssistantOptions<TData>): FilterAssistantState {
  const schema = fields as FilterFields;
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<FilterAssistantStatus>("idle");
  const [errorCode, setErrorCode] = useState<FilterAssistantErrorCode>();
  const [proposal, setProposal] = useState<FilterAssistantProposal>();
  const [answers, setAnswers] = useState<FilterAssistantAnswer[]>([]);
  const [decisions, setDecisions] = useState<
    Record<string, FilterProposalDecision>
  >({});
  const [preview, setPreview] = useState<{
    count?: number;
    status: FilterAssistantState["previewStatus"];
  }>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);
  const latest = useRef({
    evaluateOptions,
    maxDepth,
    onError,
    onPreviewCount,
    resolve,
    state,
  });

  latest.current = {
    evaluateOptions,
    maxDepth,
    onError,
    onPreviewCount,
    resolve,
    state,
  };

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus((current) => (current === "loading" ? "idle" : current));
  }, []);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const request = useCallback(
    (text: string, withAnswers: FilterAssistantAnswer[]) => {
      const trimmed = text.trim();

      if (!trimmed) {
        return;
      }

      controllerRef.current?.abort();

      const controller = new AbortController();
      const options = latest.current;
      const now =
        options.evaluateOptions?.now === undefined
          ? Date.now()
          : new Date(options.evaluateOptions.now).getTime();

      // The filter the model sees; its answer is diffed against this, so
      // chips added while it thinks aren't proposed for removal.
      const requestFilter = options.state.filter;

      controllerRef.current = controller;
      setStatus("loading");
      setErrorCode(undefined);

      // Runs `update` for the current request only; true if it ran.
      const settle = (update: () => void) => {
        if (controllerRef.current !== controller || controller.signal.aborted) {
          return false;
        }

        controllerRef.current = null;

        // Whatever the answer holds, never leave the assistant loading.
        try {
          update();
        } catch (error) {
          setStatus("error");
          setErrorCode("failed");
          latest.current.onError?.(error);
        }

        return true;
      };

      let pending: Promise<FilterAssistantResult | false>;

      try {
        pending = Promise.resolve(
          options.resolve({
            prompt: trimmed,
            current: requestFilter,
            schema: toFilterJsonSchema(schema, { maxDepth: options.maxDepth }),
            fields: getFilterFieldSummaries(schema),
            answers: withAnswers,
            now,
            timeZone: options.evaluateOptions?.timeZone ?? "UTC",
            signal: controller.signal,
          }),
        );
      } catch (error) {
        pending = Promise.reject(error);
      }

      pending.then(
        (result) => {
          settle(() => {
            if (result === false) {
              setStatus("error");
              setErrorCode("declined");
              return;
            }

            const clean = sanitizeFilterAssistantResult(result, schema, {
              maxDepth: latest.current.maxDepth,
            });
            const base = requestFilter;
            const filter = clean.filter
              ? matchFilterProposalIds(clean.filter, base)
              : undefined;
            // Derived after ids are matched: conditions whose value is
            // missing or unusable.
            const needsInput = filter
              ? getFilterConditions(filter)
                  .filter(
                    (condition) => !isFilterConditionActive(condition, schema),
                  )
                  .map((condition) => condition.id)
              : [];
            const changes = filter
              ? getFilterProposalChanges(base, filter, needsInput)
              : [];

            setProposal({
              id: createFilterId("proposal"),
              prompt: trimmed,
              base,
              filter,
              changes,
              clarifications: clean.clarifications,
              unresolved: clean.unresolved,
              ...(clean.message ? { message: clean.message } : {}),
            });
            setDecisions(
              Object.fromEntries(
                changes.map((change) => [change.id, "accepted" as const]),
              ),
            );
            setStatus("ready");
          });
        },
        (error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          const settled = settle(() => {
            setStatus("error");
            setErrorCode("failed");
          });

          // Outside settle, so a throwing onError is reported once.
          if (settled) {
            latest.current.onError?.(error);
          }
        },
      );
    },
    [schema],
  );

  const selected = useMemo(
    () =>
      proposal?.changes.filter(
        (change) => decisions[change.id] !== "rejected",
      ) ?? [],
    [decisions, proposal],
  );

  // Optional row count for the selected changes. The callback is read
  // through a ref, so an inline function doesn't restart counting (or loop).
  const hasPreview = onPreviewCount !== undefined;

  useEffect(() => {
    const count = latest.current.onPreviewCount;

    if (!hasPreview || !count || !proposal?.filter) {
      setPreview((current) =>
        current.status === "idle" && current.count === undefined
          ? current
          : { status: "idle" },
      );
      return undefined;
    }

    const controller = new AbortController();
    // Counted on the live filter, like Apply.
    const filter = applyFilterProposalChanges(
      state.filter,
      proposal.filter,
      selected,
    );

    setPreview((current) =>
      current.status === "loading"
        ? current
        : { ...current, status: "loading" },
    );
    count(filter, controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) {
          setPreview({ count: result, status: "idle" });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setPreview({ status: "error" });
        }
      },
    );

    return () => {
      controller.abort();
    };
  }, [hasPreview, proposal, selected, state.filter]);

  const clear = () => {
    // A request still running (e.g. after a clarification) must not bring
    // the proposal back.
    controllerRef.current?.abort();
    controllerRef.current = null;
    setProposal(undefined);
    setDecisions({});
    setAnswers([]);
    setStatus("idle");
  };

  return {
    fields: schema,
    prompt,
    setPrompt,
    status,
    ...(errorCode ? { errorCode } : {}),
    ...(proposal ? { proposal } : {}),
    decisions,
    setDecision: (changeId, decision) => {
      setDecisions((current) => ({ ...current, [changeId]: decision }));
    },
    selected,
    ...(preview.count === undefined ? {} : { previewCount: preview.count }),
    previewStatus: preview.status,
    submit: (text = prompt) => {
      setAnswers([]);
      setProposal(undefined);
      request(text, []);
    },
    abort,
    answer: (clarificationId, choiceId) => {
      const clarification = proposal?.clarifications.find(
        (item) => item.id === clarificationId,
      );
      const choice = clarification?.choices.find(
        (item) => item.id === choiceId,
      );

      if (!proposal || !clarification || !choice) {
        return;
      }

      const next = [
        ...answers,
        { question: clarification.question, answer: choice.label },
      ];

      setAnswers(next);
      request(proposal.prompt, next);
    },
    apply: ({ all = false } = {}) => {
      if (!proposal?.filter || status === "loading") {
        return;
      }

      const chosen = all ? proposal.changes : selected;
      const current = state.filter;
      const next = applyFilterProposalChanges(current, proposal.filter, chosen);

      if (next !== current) {
        state.setFilter(next);
      }

      clear();
      setPrompt("");
    },
    discard: clear,
  };
}
