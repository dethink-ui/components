---
"@dethink/components": minor
---

Add FilterBar and the filter core. Filters are chips that read as sentences ("Status is any of Open, Blocked"), and each field, operator and value part can be edited in place. They sit in a one-tab-stop toolbar with Backspace removal, undo/redo, and polite result-count announcements. The chips edit one serializable filter model. That model supports AND/OR groups and negation, typed text, option and multi-option operators, validation, a compiled row predicate, a TanStack adapter, readable descriptions and diffs. DataTable gains additive `rowFilter`, `toolbar` and `globalFilterFn` props. Popover's ref assignment now type-checks under React 18.
