---
"@dethink/components": minor
---

Add versioned URL state and saved views for filters.

- **URL codec:** `encodeFilterParam` and `decodeFilterParam` write the filter as its readable text query with a schema version (`?q=status:open&v=1`) and keep other params. Old links from an earlier version are parsed with `fieldsAt` and upgraded with `migrate`; `renameFilterField` helps with renames. `formatFilterSearch` keeps filter punctuation readable.
- **useFilterUrlState:** `useFilterState` mirrored into the URL through a store (`createHistoryFilterStore` with replace or push, `createMemoryFilterStore`; the docs include Next.js and nuqs recipes), with no router dependency. It follows back and forward, keeps undo, keeps chips that have no value yet, reports unreadable links, and hydrates without a mismatch, never rewriting a link on load.
- **useSavedViews and SavedViewsMenu:** apply a view as one undo step, save, save as (personal or team), rename and delete through your callbacks. Updates are optimistic and roll back if a save's promise rejects. An edited marker compares what the filters do, so it ignores ids and chips without values.
