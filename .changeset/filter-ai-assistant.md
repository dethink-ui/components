---
"@dethink/components": minor
---

Add `FilterAssistant`: ask for a filter in words and review the proposal before anything changes.

- **Any provider:** `useFilterAssistant({ fields, state, resolve })` calls your `resolve` with the prompt, the current filter, a structured-output schema (`toFilterJsonSchema`), field summaries, clarification answers, `now`/`timeZone` and an AbortSignal.
- **Untrusted output:** `sanitizeFilterAssistantResult` rebuilds the answer against the field allowlist. Unknown fields, operators and values are listed under "Couldn't use"; conditions without a usable value become "needs input" chips; text is plain, clamped and stripped of control characters; counts and nesting are capped.
- **Review:** `FilterProposal` shows added, changed and removed chips with Accept and Reject, one-tap clarification choices and an optional result-count preview. Applying is one undo step, and nothing changes before it. `getFilterProposalChanges`, `applyFilterProposalChanges` and `matchFilterProposalIds` are exported for custom UIs.
