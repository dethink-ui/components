# FilterBar

Filter chips that read as sentences, such as `Status | is any of | Open, Blocked | ×`. Every part of a chip can be edited in place. The chips edit one plain-JSON filter model (the filter AST), which the other filter surfaces use too: the text query, the AND/OR group editor, AI proposals, URL state and saved views. `createFilterPredicate` turns the model into a row filter for `DataTable`.

```sh
npx shadcn@latest add https://components.dethink.co.uk/r/filter-bar.json
```

`filter-bar` installs `filter-core`, the dependency-free model. You can install `filter-core` by itself to evaluate or describe filters without the UI, for example on a server.

```tsx
import {
  DataTable,
  FilterBar,
  createFilterPredicate,
  defineFilterFields,
  useFilterState,
} from "@dethink/components";

const fields = defineFilterFields<Issue>([
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "open", label: "Open" },
      { value: "blocked", label: "Blocked" },
    ],
  },
  {
    key: "labels",
    label: "Labels",
    type: "multiOption",
    options: labelOptions,
  },
  {
    key: "assignee",
    label: "Assignee",
    type: "text",
    accessor: (issue) => issue.assignee?.name,
  },
]);

function Issues() {
  const filter = useFilterState();
  const rowFilter = useMemo(
    () => createFilterPredicate(filter.filter, fields),
    [filter.filter],
  );

  return (
    <DataTable
      columns={columns}
      data={issues}
      rowFilter={rowFilter}
      toolbar={<FilterBar fields={fields} state={filter} addShortcut="f" />}
    />
  );
}
```

## Filter model

- A `Filter` is a group: `{ type: "group", id, combinator: "and" | "or", not?, children }`. Children are conditions or nested groups.
- A condition is `{ type: "condition", id, field, operator, value?, not? }`. `value` is a string, number, boolean or string array. The model holds no dates, functions or class instances, so it serializes as-is.
- Ids are stable React keys used for diffing and patches. They never reach the DOM, so a filter created during render does not cause hydration mismatches.
- `not: true` on a condition shows a NOT segment at the start of the chip. A negated root shows "Not matching" before the chips, and negated nested groups say "not" in their summary.
- Conditions with no value yet, unknown fields or unavailable operators are **skipped** during evaluation. A chip that is still being edited never hides every row, and `validateFilter` reports these conditions so you can show them.

## Fields and operators

| Type          | Row value         | Operators                                                                                        | Default         |
| ------------- | ----------------- | ------------------------------------------------------------------------------------------------ | --------------- |
| `text`        | any (stringified) | contains, does not contain, is, is not, starts with, ends with, is empty, is not empty           | contains        |
| `option`      | string (or array) | is any of / is, is none of / is not, is empty, is not empty                                      | is any of       |
| `multiOption` | string array      | includes any of / includes, includes all of, includes none of / does not include, is (not) empty | includes any of |

Text comparisons ignore case. When exactly one value is selected, list operators use their single-value label ("is" instead of "is any of"). `operators` restricts and orders the list for a field, and `defaultOperator` picks the one new chips start with.

Number, date (with relative values that stay relative), boolean, custom types, facet counts and chip impact counts arrive in #130.

## Groups

Filters combine conditions with AND or OR, and groups can nest.

- Each nested group appears in the bar as one group chip whose label is the group's sentence, for example "Labels includes Bug, or Title contains "api"". Clicking it opens `FilterGroupEditor` for that group, and × removes the whole group.
- The **Advanced** action (`FilterBarAdvanced`) opens the editor for the whole filter. It appears once the filter has at least one chip.
- In the editor, every group has a **Match all / any of the following** select. The root group has a **Not** toggle. Each row has these actions:
  - **Not** negates the row.
  - **Move up** and **Move down** reorder it.
  - **Wrap in group** puts the row in a new group.
  - Nested groups also have **Ungroup** and **Remove group**.
- Each group ends with **+ Condition** (a `FilterAddMenu` bound to that group) and **+ Group**.
- `maxDepth` (default 3, counting the root as level 1) caps nesting. The same limit is enforced by `canAddFilterGroup`, `canWrapFilterNode` and `validateFilter(filter, fields, { maxDepth })`. Actions blocked by the limit are disabled and explain why in their tooltip.
- New groups start empty and stay until you remove them. A group is removed automatically only when its last condition is removed.
- Core commands: `wrapFilterNode`, `unwrapFilterGroup`, `moveFilterNode`, `shiftFilterNode`, `findFilterParent`, `getFilterNodeDepth` and `getFilterHeight`.
- `useFilterState` exposes the same commands as `wrapInGroup`, `unwrapGroup`, `moveNode`, `shiftNode` and `setNegated`. Each one is a single undo step.

The PRD planned a Drawer for the group editor on mobile. It uses the Popover instead, sized to `min(36rem, 100vw - 2rem)`. Drawer depends on Motion, and the repo rules keep Motion out of components that don't need it.

## State and undo

- `FilterBar` can be uncontrolled (`defaultValue`) or controlled (`value` + `onValueChange`), or it can take `state` from `useFilterState` when the filter is also needed outside the bar.
- `useFilterState` returns the filter plus `addNode`, `updateCondition`, `removeNode`, `setCombinator`, `setNegated`, `wrapInGroup`, `unwrapGroup`, `moveNode`, `shiftNode`, `clear`, `undo` and `redo`.
- Every command is one history entry. Commits that share a `coalesceKey` merge into one entry, and the bar uses one key per editing session, so selecting three statuses in one popover undoes in a single step.
- The pure commands (`addFilterNode`, `updateFilterCondition`, `removeFilterNode`, `updateFilterGroup`, `normalizeFilter`, `diffFilter`) are exported for your own stores. `diffFilter` matches nodes by id and reports a group as changed when its combinator, negation or membership changes, so moving a condition between groups shows up.

## Composition

With no children, `FilterBar` renders `FilterBarChips`, `FilterAddMenu`, `FilterBarAdvanced`, `FilterBarClear` and `FilterBarUndo`. `FilterGroupEditor` (optionally with `groupId`) can also be rendered inline, for example in a side panel. You can compose them yourself, and `FilterBarChips` takes `renderChip` for custom chips. `FilterFieldPicker`, `FilterOperatorPicker` and `FilterValueEditor` are exported for building other editors. `useFilterBar()` exposes the nearest bar's fields, labels and state.

## DataTable integration

`DataTable` gained three additive props:

- `rowFilter`: a predicate applied before sorting and pagination (ignored with `manualFiltering`). Default row ids follow the source index, so selection survives filter changes.
- `toolbar`: content rendered at the start of the toolbar.
- `globalFilterFn`: a custom TanStack global filter function.

`DataTable` does not import the filter model. Any predicate works. For TanStack tables you build yourself, use `globalFilterFn: toTanstackFilterFn(fields)` with the filter itself as the `globalFilter` state, so TanStack re-filters whenever the filter changes. In server mode, send the filter JSON to your API; the server facet contract and a manual-filtering example arrive in #135.

## Accessibility

- The chips and actions sit in a `toolbar` with one tab stop (roving tabindex). ArrowLeft/ArrowRight move between chip parts, the direction flips in RTL, and Home/End jump to the ends. Collapsed chips are skipped.
- Each chip is a `group` named with its full sentence ("Status is any of Open, Blocked"). The toolbar is described by the whole filter's sentence, including and/or joins and nested groups.
- Chip parts are buttons with `aria-haspopup="dialog"` and `aria-expanded`. Their names say what they change ("Change operator, is any of").
- Backspace or Delete removes the focused chip and moves focus to the next one, or the previous one when it was last. Removing the last chip with Clear focuses the add button.
- Cmd/Ctrl+Z undoes and Shift+Cmd/Ctrl+Z redoes while focus is in the toolbar.
- Editors open in popovers that take focus. The field and value lists are searchable listboxes. One Escape closes the editor when the search box is empty, and focus returns to the chip part that opened it.
- `resultCount` is announced through a polite live region.
- `addShortcut` (off by default) opens the add menu when focus is not in a text field. It ignores modifier keys.
- Chips never communicate state through color alone: incomplete chips use a dashed border and a "Select…" value, and invalid fields name the unknown field.

- Group editor: the editor is a dialog with a nested structure. Each group is a labelled `group` ("Edit group, …"), and its rows are a list. It does not use the ARIA `tree` role: the APG tree pattern does not allow several interactive controls inside a tree item, and every row here has a chip plus actions. Tab and Shift+Tab move through the controls. Alt+ArrowUp/ArrowDown moves the row that holds focus. Cmd/Ctrl+Z undoes inside the editor. Row actions are named with the row's sentence ("Move up, Status is Open"). After a move, wrap or ungroup, focus stays on the moved row or its nearest neighbor. At a list edge it moves to the arrow that is still enabled.
- Backspace on a chip inside the editor removes only that condition, never the group chip that opened the editor, because remove keys are matched against the DOM, not React's portal bubbling.

Manual keyboard acceptance: Tab to the bar, add a Status filter with the keyboard only, change its operator, remove it with Backspace, undo with Ctrl+Z, and check that focus is never lost. For groups: open Advanced, wrap a condition in a group, switch the group to "any", move a row with Alt+ArrowUp, ungroup it, then undo each step, and check that focus stays in the editor throughout.

## Theming and responsive behavior

Styling uses tokens only (`border`, `muted`, `muted-foreground`, `ring`, `destructive`). `size="sm"` gives compact 28px chips. The editor width is `--dt-filter-editor-width` (default 16rem). The bar is a container query root: below 36rem, chips after `collapseAfter` (default 2) collapse behind a "+N more" toggle. Transitions are color-only and respect `prefers-reduced-motion`.

## Verification

- `filter-core.test.ts`: operator matrix, and/or/not evaluation, skipped incomplete conditions, descriptions, validation, commands, normalization, diffs, serialization.
- `filter-commands.test.ts`: mixed nesting, depth and height, the shared depth limit, wrap/unwrap, move/shift, empty-group lifetime, negation flags.
- `use-filter-state.test.tsx`: history, coalescing, limits, controlled mode, one undo step per group command.
- `filter-bar.test.tsx` and `filter-bar.keyboard.test.tsx`: add flows, segment edits, roving focus, Backspace removal, undo focus recovery, controlled value, announcements, shortcut, composition.
- `filter-group-editor.test.tsx`: group chip editor, advanced editor, add group and condition, wrap/move/negate/ungroup with undo, Alt+Arrow moves, scoped Backspace, depth limit, standalone rendering.
- `filter-bar.a11y.test.tsx`: axe with chips, group chips and open editors. `filter-bar.ssr.test.tsx`: server render and hydration.
- `pnpm registry:smoke:filter-bar` (and `:react18`): clean-consumer install of `filter-bar` + `data-table`, typecheck and Vite build.

## Out of scope for this slice

Number/date/boolean types, facets and impact counts (#130); the text query bar (#132); URL state and saved views (#133); the AI assistant (#134); server mode (#135). Server adapters (Prisma, SQL) are planned for v1.1.
