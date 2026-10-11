# QueryInput

A one-line text query for the filter model: `status:open,blocked created:>-7d (assignee:ada OR labels:bug)`. It edits the same filter AST as `FilterBar`, so people can switch between typing and chips without losing anything. As you type, it suggests fields, operators and values. Tokens are colored, and text that can't be applied is underlined at the exact range. Invalid text never changes the filter.

```sh
npx shadcn@latest add https://components.dethink.co.uk/r/query-input.json
```

`query-input` installs `filter-core` (which contains the parser, printer and suggestions), `filter-bar` (for `useFilterState`) and `input`. It adds no npm dependencies.

```tsx
import { FilterBar, QueryInput, useFilterState } from "@dethink/components";

function IssueFilters() {
  // One state drives both the text and the chips.
  const state = useFilterState();

  return (
    <>
      <QueryInput fields={fields} state={state} defaultField="title" />
      <FilterBar fields={fields} state={state} />
    </>
  );
}
```

## Anatomy

- `data-slot="query-input"`: the wrapper. It gets `data-invalid` while an error is shown.
- `data-slot="query-input-field"`: the `<input role="combobox">`. Its own text is transparent.
- `data-slot="query-input-highlight"`: an `aria-hidden` overlay that draws the text in color. Runs carry `data-kind` (`field`, `operator`, `value`, `keyword`, `negation`, `paren`, `text`) and `data-error`.
- `data-slot="query-input-suggestions"`: the listbox. Options carry `data-kind` and `data-active`.
- `data-slot="query-input-error"`: the error message (`role="alert"`).

## Syntax

A term is `field:` followed by an optional operator token and a value. Field keys can be typed in any case. Terms side by side are ANDed.

| Query                                                   | Means                                                   |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `status:open,blocked`                                   | Status is any of Open, Blocked (option labels work too) |
| `-status:done`                                          | Not (Status is Done): `-` negates a term or `(group)`   |
| `status:!done`                                          | Status is none of Done                                  |
| `labels:&bug,api` / `labels:!bug`                       | Includes all of / none of                               |
| `estimate:>=5`, `>`, `<`, `<=`, `!=`                    | Number comparisons                                      |
| `estimate:3..8`                                         | Between, inclusive                                      |
| `created:2026-09-28`, `today`, `-7d`, `+2w`             | A calendar day, absolute or relative (d, w, m, y)       |
| `created:<-30d`, `created:>-7d`                         | Before / after                                          |
| `created:-7d..today`                                    | Between two days                                        |
| `created:last:30d`, `created:next:2w`                   | In the last / next N units                              |
| `created:in:0w`, `created:in:-1m`                       | This week, last month (a whole calendar period)         |
| `customer:yes` / `customer:no`                          | Yes/No fields                                           |
| `title:=x` `title:!=x` `title:^x` `title:$x` `title:!x` | Is, is not, starts with, ends with, does not contain    |
| `assignee:empty` / `assignee:!empty`                    | Is empty / is not empty                                 |
| `login "rate limit"`                                    | Plain words and quoted phrases search `defaultField`    |
| `a b OR c`                                              | `(a AND b) OR c`: AND binds tighter than OR             |
| `a (b OR c)`                                            | Parentheses group, up to `maxDepth` (3) levels          |
| `estimate:gte:5`                                        | Any operator by id: `field:id:value`                    |

Only uppercase `OR` and `AND` are keywords. Quote values that contain spaces, commas, parentheses or quotes, or that would otherwise read as a token. Inside quotes, `\"` and `\\` are escapes. Field keys must be identifiers (letters, digits, `_`, `.`, `-`).

### Custom operators

Give an operator a `token` to control how it's written. Without one, it's written as `field:id:value`. Values are read according to the operator's `valueKind`. Reuse a built-in kind (`number`, `date`, `list`…) to get its syntax. Any other kind is read as text, or as a comma list for operators whose arity is `"multiple"`.

```ts
defineFilterOperator({
  id: "is",
  label: "is",
  token: "@",
  arity: "single",
  valueKind: "user",
  evaluate,
});
// owner:@ada
```

## Core API

- `parseFilterQuery(text, fields, { defaultField?, maxDepth? })` returns `{ ok: true, filter }` or `{ ok: false, error }`, where `error` is `{ code, message, start, end }`. The filter is normalized. Codes: `unclosed-quote`, `unclosed-group`, `unexpected-close`, `empty-group`, `missing-operand`, `unknown-field`, `unknown-operator`, `missing-value`, `invalid-value`, `unknown-option`, `no-default-field`, `max-depth`.
- `printFilterQuery(filter, fields, options?)` returns canonical text. `parseFilterQuery(printFilterQuery(f))` equals `normalizeFilter(f)` apart from ids. Incomplete conditions and unknown fields are left out. The printer picks the shortest spelling that reads back as the same condition, quoting only when needed.
- `getFilterQuerySuggestions(text, caret, fields, options?)` returns completions, each with `{ kind, label, detail, start, end, insert }`.
- `getFilterQuerySegments(text, fields)` returns highlight ranges. `lexFilterQuery(text)` returns raw tokens.
- `reconcileFilterIds(next, previous)` reuses the ids of unchanged nodes. QueryInput uses it so committing text keeps the chips' identity and focus. `getFilterSignature(node)` compares filters without ids.

## Behavior

- The text follows the filter until you edit it. Enter or blur commits. If the text means the same filter as the current one (for example `Status:Open` when the filter is `status:open`), nothing is recorded. Otherwise the commit is one undo step.
- A failed commit shows the error and keeps your text. The underline then updates as you type, and clears when the text parses.
- If the filter changes elsewhere (a chip, undo, the parent), the text is replaced with the new filter, discarding any uncommitted edit.
- Escape closes the suggestion list. A second Escape throws away the edit.

## Accessibility

- The input is an ARIA 1.2 combobox (`aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`). Focus never leaves the input; clicking a suggestion keeps focus and the caret.
- Keyboard: ArrowDown/ArrowUp move through suggestions (and open the list), Enter picks the active suggestion or commits, Escape closes the list and then reverts, and Tab leaves (and commits).
- The overlay is `aria-hidden`, so screen readers read the plain text. Suggestions are announced with their kind ("Blocked, Value").
- Errors set `aria-invalid`, link the message with `aria-describedby`, and announce it with `role="alert"`. The error is also shown as a wavy underline, so it isn't signaled by color alone.
- Manual check: with VoiceOver or NVDA, type `st`, press ArrowDown and Enter, choose a value, press Enter, then type an invalid term and confirm the message is announced.

## Theming

The field uses the Input tokens, and the text is set in `font-mono` so overlay glyphs line up with the caret. Token colors: fields use `primary`, operators and parentheses `muted-foreground`, keywords `info`, negation and errors `destructive`. `controlSize` (`sm`, `md`, `lg`) matches Input. Pass `className` to style the wrapper and `inputClassName` to style the field. Labels, the placeholder and error text are set through `labels`. `labels.error(error)` receives the error code for localization.

## Limitations

- Suggestions list the options declared in `fields`. `getOptions` and async options are not queried.
- Time of day isn't supported. Dates are calendar days, the same as the chips.
- The overlay approach needs a monospace font, or at least one where each token keeps the same width. Don't change `font-weight` per token.

## Verification

- `filter-query.test.ts`: every operator token and value kind, id spelling, labels, negation, precedence, plain words, escapes, exact error ranges for every error code, the depth limit, canonical printing and quoting.
- `filter-query.property.test.ts`: 2,000 seeded random filters (awkward strings, all operators, custom operators with and without tokens, nesting and negation) check that `parse(print(f))` equals `normalize(f)` and that printing is stable.
- `filter-query-suggest.test.ts`: field, value, operator and preset completion, list items, and highlight segments.
- `query-input.test.tsx`: commit on Enter and blur, errors that keep state, the combobox flow, Escape revert, no-op commits, and sync with FilterBar that keeps chip ids and undo.
- `query-input.a11y.test.tsx` (axe at rest, with suggestions open and with an error) and `query-input.ssr.test.tsx` (server render and hydration).
- `pnpm registry:smoke:filter-bar` installs `filter-bar`, `query-input` and `data-table` in a clean consumer, then typechecks and builds with Vite.
