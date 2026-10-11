---
"@dethink/components": minor
---

Add AND/OR filter groups to FilterBar. Nested groups appear in the bar as group chips named by their sentence and open a `FilterGroupEditor`, and a new Advanced action edits the whole filter. In the editor you can set "match all/any", negate, wrap a row in a group, ungroup, remove, and reorder rows with buttons or Alt+Arrow keys, with focus kept on the moved row. `maxDepth` (default 3) applies the same limit to adding, wrapping and `validateFilter`. The filter core gains `wrapFilterNode`, `unwrapFilterGroup`, `moveFilterNode`, `shiftFilterNode`, `findFilterParent`, `getFilterNodeDepth`, `getFilterHeight`, `canAddFilterGroup` and `canWrapFilterNode`. `useFilterState` gains the matching commands, each a single undo step. Removing a node now removes only the groups that removal empties, so empty groups you add yourself stay.
