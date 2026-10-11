---
"@dethink/components": minor
---

Add number, date and boolean filter fields, custom field types, and counts to FilterBar.

- **Dates** compare calendar days in a chosen time zone, which is safe across daylight-saving changes. Relative values ("7 days ago", "in the last 30 days", "this week") stay relative and resolve against an injectable `now`, so saved filters don't go stale and server-rendered counts match.
- **Editors:** number boxes and ranges, date presets with an inline calendar, range calendars, duration and period pickers, and Yes/No.
- **Custom types:** `defineFilterFieldType` and `defineFilterOperator` register types such as `user` with their own operators, value text and editor.
- **Counts:** with `data`, option and Yes/No pickers show facet counts that apply the other filters, `showImpact` shows how many rows each chip removes, and an empty result offers "Relax" on the most restrictive chip.
- **Exports:** the counting helpers are `computeFilterFacets`, `computeFilterImpact`, `countFilterMatches`, `findFilterRescue` and `useFilterInsights`.
- **Other changes:** `FilterValueEditor` now takes an `operator` and `labels`, and `toTanstackFilterFn` and `createFilterPredicate` accept evaluation options.
