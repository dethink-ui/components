---
"@dethink/components": minor
---

Add server-mode facets for filters, plus two full-page filter recipes.

- **Server facets:** `FilterBar` takes `getFacets({ field, filter, signal })` to load option counts from your API. `filter` is the scope to count under (`getFilterFacetFilter` computes the same for custom UIs), each field and filter pair is requested once and cached (`facetsKey` refetches when something else changes, such as a time range; an inline `getFacets` is fine), requests abort when no longer needed and are asked again later, failed requests retry after 10 seconds, and pickers reserve the counts' space while they load, so lists don't shift. `useServerFacets` is exported for custom bars.
- **Fix:** `createHistoryFilterStore` no longer passes routers' own markers (`__NA`, `_N`) through `history.state`. With them, Next.js treated the URL change as its own and later restored its stale URL, dropping the filter from the page.
- **Docs and showcase:** a server-mode DataTable example (`manualFiltering`, counts from a pretend API, no layout shift while loading), a hand-written Prisma translation recipe, and Issue tracker and Logs dashboard recipes that combine the text query, chips and groups, URL state, saved views and the assistant.
