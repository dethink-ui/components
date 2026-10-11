---
"@dethink/components": minor
---

Add a text query syntax and `QueryInput` for filters.

- **Syntax:** `status:open,blocked -labels:bug estimate:>=5 created:>-7d (assignee:ada OR customer:yes)`, with operator tokens (`>` `>=` `<` `<=` `!=` `!` `^` `$` `&` `empty` `!empty` `last:` `next:` `in:`), ranges (`3..8`), relative dates (`-7d`, `+2w`, `today`), quoted values, and AND/OR with parentheses where AND binds tighter. Plain words search the default text field. Custom operators declare a `token`, and any operator can be written as `field:id:value`.
- **Core:** `parseFilterQuery` (a hand-written parser with no dependencies) returns errors with `{ code, message, start, end }`. `printFilterQuery` prints canonical text, and `parseFilterQuery(printFilterQuery(filter))` equals `normalizeFilter(filter)`. `getFilterQuerySuggestions`, `getFilterQuerySegments` and `reconcileFilterIds` support custom query UIs.
- **QueryInput:** an ARIA combobox with field, operator and value suggestions, colored tokens, an underlined error range and commit on Enter or blur. Invalid text never changes the filter. Share `useFilterState` with `FilterBar` to keep the text and the chips in sync.
- `normalizeFilter` now moves a single-child group's negation onto the child, merges groups that surface under a parent with the same combinator, hoists a lone root group, and uses `"and"` for a root with one child.
