# FilterAssistant

Ask for a filter in plain words ("big open bugs from last week, Ada or Lin") and get back a proposal you can review. The proposal lists every chip it would add, change or remove, each with Accept and Reject. Nothing touches the filter until you apply it, and applying counts as one undo step. It works with any model provider through a single `resolve` callback, and model output is treated as untrusted.

```sh
npx shadcn@latest add https://components.dethink.co.uk/r/filter-assistant.json
```

`filter-assistant` installs:

- `filter-core`, which has the schema builder, the sanitizer and the proposal helpers;
- `filter-bar`, for `useFilterState` and chip styles;
- `input` and `live-region`.

It adds no npm dependencies and bundles no AI SDK.

```tsx
import {
  FilterAssistant,
  FilterBar,
  useFilterAssistant,
  useFilterState,
} from "@dethink/components";

function Issues() {
  const state = useFilterState();
  const assistant = useFilterAssistant({
    fields,
    state,
    resolve: async ({ signal, ...request }) => {
      const response = await fetch("/api/filter-assistant", {
        method: "POST",
        body: JSON.stringify(request),
        signal,
      });

      return response.ok ? response.json() : false;
    },
  });

  return (
    <>
      <FilterAssistant assistant={assistant} />
      <FilterBar fields={fields} state={state} />
    </>
  );
}
```

## The request

`resolve(request)` receives:

- `prompt`: the trimmed text the person typed.
- `current`: the filter they have now. The answer's `filter` replaces it completely, so the model should keep the parts the request doesn't change.
- `schema`: `toFilterJsonSchema(fields)`, a JSON Schema for structured output.
  - Each condition is limited to one field's operators and value shapes.
  - Groups are unrolled to `maxDepth` levels, so the schema has no recursion.
  - Option values are hinted rather than enforced, so a value the model can't match becomes a "needs input" chip instead of a guess.
- `fields`: compact summaries (`getFilterFieldSummaries`) with keys, labels, types, operators, options, descriptions and examples.
- `answers`: `{ question, answer }` pairs from earlier clarifications.
- `now` and `timeZone`, from `evaluateOptions`, for words like "last week".
- `signal`: aborted when the person presses Stop or Escape, or asks again.

Return the model's answer (`{ filter?, clarifications?, unresolved?, message? }`), or `false` to decline. Thrown errors go to `onError`. The person only sees a generic message.

### AI SDK example

Call the model on the server, where your API key lives. For example, a Next.js route handler:

```ts
// app/api/filter-assistant/route.ts
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, jsonSchema, Output } from "ai";

export async function POST(request: Request) {
  const { prompt, current, schema, fields, answers, now, timeZone } =
    await request.json();

  const { output } = await generateText({
    model: anthropic("claude-sonnet-5"),
    output: Output.object({ schema: jsonSchema(schema) }),
    system: [
      "You turn requests into filters for a data table.",
      "Use only these fields, operators and option values:",
      JSON.stringify(fields),
      "Return the complete filter: keep conditions from the current filter unless the request changes them.",
      "Relative dates are relative to today; use relative values, not absolute dates, when the request is relative.",
      "If the request is ambiguous, ask one clarification with short choices instead of guessing.",
      "Put anything no field can express in unresolved.",
      `Today is ${new Date(now).toISOString().slice(0, 10)} in ${timeZone}.`,
    ].join("\n"),
    prompt: JSON.stringify({ request: prompt, current, answers }),
    abortSignal: request.signal,
  });

  return Response.json(output);
}
```

Whatever the route returns is sanitized in the browser before it is shown.

## Security boundary

- **The assistant can only propose filters.** It can't run actions, fetch URLs or change anything else, and a proposal only takes effect when the person applies it. The worst a prompt injection can do is propose a filter, which the person sees and has to apply.
- **Output is rebuilt, not trusted.** `sanitizeFilterAssistantResult` builds a new filter from the model's JSON:
  - Only fields, operators and values in your schema are kept. Unknown fields, operators and option values are dropped and listed under "Couldn't use".
  - Values that aren't valid for their operator leave the chip marked "needs input".
  - Only plain JSON data is read. Prototype keys such as `__proto__` and anything other than own properties are ignored.
  - Text, including strings nested in custom values, is stripped of control characters and clamped (200 characters by default). Conditions (40), children, clarifications (3), choices (6) and unresolved items (10) are capped, and nesting deeper than `maxDepth` is dropped.
  - Filter node ids are always fresh, so the model can't target or collide with existing nodes. Clarification and choice ids are positional (`clarification-1`, `choice-2`), never the model's.
- **Text only.** Messages, questions, choices and values render as React text nodes, never HTML.
- **Keep keys on the server.** Call the model from your own route. Don't send the whole data set in the prompt: field summaries and the current filter are enough.

## useFilterAssistant

`useFilterAssistant({ fields, state, resolve, evaluateOptions?, maxDepth?, onPreviewCount?, onError? })` returns:

- `prompt`, `setPrompt` and `submit(prompt?)`. A new submit aborts the one in flight, and late answers are ignored.
- `status` (`idle`, `loading`, `ready` or `error`) and `errorCode` (`declined` or `failed`).
- `proposal`: `{ base, filter, changes, clarifications, unresolved, message }`. The proposed filter keeps the current filter's ids where nothing changed, and a condition that changed on the same field counts as one change rather than a removal plus an addition (`matchFilterProposalIds`).
- `decisions`, `setDecision(id, "accepted" | "rejected")` and `selected`. Every change starts accepted.
- `apply()` applies the accepted changes and `apply({ all: true })` applies all of them. Both are disabled while a request is loading. Removing a group keeps whatever the proposal keeps from inside it, unchanged if its own change was rejected. Either is one `setFilter`, so one undo step. Changes apply on top of the current filter even if it changed after the proposal was made.
- `answer(clarificationId, choiceId)` asks again with the answer added. `discard()` also aborts a request still in flight. `abort()` cancels the current request.
- `previewCount` and `previewStatus`: with `onPreviewCount(filter, signal)`, the number of rows the accepted changes would give on the live filter, recounted when it changes. Pass `countFilterMatches` for client data, or call your API.

Pure helpers live in `filter-core`:

- `toFilterJsonSchema` and `getFilterFieldSummaries`;
- `sanitizeFilterAssistantResult` and `sanitizeFilterText`;
- `matchFilterProposalIds`, `getFilterProposalChanges` and `applyFilterProposalChanges`.

## FilterAssistant and FilterProposal

- `FilterAssistant` shows the prompt box, then Propose, or Stop while a request is running. It also has a status line that is announced politely, and renders `FilterProposal` underneath.
  - `actions` places controls beside the prompt. For example, a `VoiceInput` whose recording you transcribe and then pass to `assistant.submit(text)`. VoiceInput isn't bundled, to keep Motion out of this item.
  - Set `showProposal={false}` to render `<FilterProposal assistant={assistant} />` somewhere else.
- `FilterProposal` shows:
  - the model's message;
  - clarification questions, each with one-tap choice buttons;
  - a "Couldn't use" list with a reason for each item;
  - one row per change: an Add, Change or Remove label, the chip as a sentence (and "was …" for changes), a "Needs a value" marker, and Accept and Reject toggles;
  - Apply N changes, Apply all (when some changes are rejected), Discard, and the preview count.
- Anatomy: `data-slot="filter-assistant"` (with `data-status`), `filter-assistant-status`, `filter-proposal`, `filter-proposal-change` (with `data-proposal="added|changed|removed"`, `data-decision` and `data-needs-input`), `filter-proposal-clarification`, `filter-proposal-unresolved` and `filter-proposal-preview`.

## Accessibility

- The prompt has a label, and its status line is linked as the input's description and announced through a polite live region. Escape or Stop cancels a request.
- The proposal is a labelled region. Each change states its kind in text (Add, Change, Remove), removals are also struck through, and Accept and Reject are toggle buttons with `aria-pressed`, grouped under a name that reads the change's sentence. None of this relies on colour, and the only motion is a short opacity and colour transition, skipped with reduced motion.
- Each clarification is a group named by its question, with a button per choice. After a choice, focus moves to the new proposal. Apply, Apply all and Discard return focus to the prompt.

## Theming

Rows use a leading border in `success` (added), `info` (changed) or `destructive` (removed). The needs-input marker uses `warning`. Buttons follow the primary, outline and ghost treatments, and the prompt uses Input.

## Verification

- `filter-ai.test.ts`:
  - the schema: no recursion, per-field operators and values, and summaries;
  - the sanitizer: valid filters, hallucinated fields and operators, prototype keys, unknown option values, needs-input chips, injection strings, nested custom values, depth and count caps, junk input and positional clarification ids.
- `filter-ai-proposal.test.ts`:
  - pairing changes by field, and change lists including moves and root changes;
  - partial apply on top of a newer filter;
  - conditions and groups moved out of removed groups, including when their own change was rejected;
  - root changes after the root was replaced;
  - getters and prototype-less objects in model output.
- `filter-assistant.test.tsx`:
  - nothing changes before apply, and applying is one undo step;
  - per-change reject and apply all;
  - "Couldn't use" and needs-input chips;
  - model text rendered as text only;
  - declined and failed requests, where the error isn't shown;
  - Stop, with late answers ignored and no second submit;
  - clarifications and the request's contents;
  - the preview count, discard and focus.
- `filter-assistant.a11y.test.tsx`: axe at rest, while loading, on a proposal with every kind of content, with a rejected change and on error. `filter-assistant.ssr.test.tsx`: server render and hydration.
- `pnpm registry:smoke:filter-bar` includes `filter-assistant` in the clean-consumer install.
