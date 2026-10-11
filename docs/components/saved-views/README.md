# Saved views and URL state

Filters can live in the URL as readable, versioned text (`?q=status:open,blocked created:>-7d&v=1`), so people can share and bookmark them, and old links keep working after you rename a field. Saved views give a filter a name. They show when the current filter differs from the view, and applying a view is one undo step.

```sh
npx shadcn@latest add https://components.dethink.co.uk/r/filter-url-state.json
npx shadcn@latest add https://components.dethink.co.uk/r/saved-views.json
```

The codec (`encodeFilterParam`, `decodeFilterParam`) is part of `filter-core`. `filter-url-state` adds the hook and its stores. `saved-views` adds `useSavedViews` and `SavedViewsMenu`. Neither adds npm dependencies or a router dependency.

```tsx
import {
  FilterBar,
  QueryInput,
  SavedViewsMenu,
  useFilterUrlState,
  useSavedViews,
} from "@dethink/components";

function Issues({ views, api }) {
  const state = useFilterUrlState({ fields });
  const savedViews = useSavedViews({
    state,
    fields,
    views,
    onCreate: api.createView,
    onUpdate: api.updateView,
    onDelete: api.deleteView,
  });

  return (
    <>
      <SavedViewsMenu savedViews={savedViews} scopes={["personal", "team"]} />
      <QueryInput fields={fields} state={state} />
      <FilterBar fields={fields} state={state} />
    </>
  );
}
```

## URL codec

- `encodeFilterParam(filter, fields, options?, search?)` returns `URLSearchParams` with `q` (the canonical text query) and `v` (the schema version) set, and keeps every other param. An empty filter removes both. `formatFilterSearch(params)` builds `?…` and leaves filter punctuation such as `: , ! ( )` unescaped, so links stay readable. (`< > '` stay encoded, because browsers re-encode them.) `isSameFilterSearch(a, b)` compares two searches by their params, however they are encoded.
- `decodeFilterParam(search, fields, options?)` returns `{ ok: true, filter, version, migrated }` or `{ ok: false, error }`. A missing `q` is an empty filter, and a missing `v` means the current version. Error codes:
  - `invalid-version`
  - `future-version` (the link is newer than the page)
  - `invalid-query` (the error includes the parser's range)
  - `invalid-filter` (after migration the filter still has unknown fields, unknown operators, invalid values or too much nesting)
- `readFilterParam(search, fields, options?, fallback?)` returns the decoded filter or a fallback.
- Options: `version` (default 1), `param` / `versionParam` (default `q` / `v`), `defaultField`, `maxDepth`, `fieldsAt` and `migrate`.

### Migrating renamed fields

Raise `version` when you rename a field or operator. Old links are parsed with the schema they were written with (`fieldsAt`) and then upgraded (`migrate`):

```ts
const options = {
  version: 2,
  // Version 1 called the field "assignee".
  fieldsAt: (version: number) =>
    version === 1
      ? fields.map((f) => (f.key === "owner" ? { ...f, key: "assignee" } : f))
      : fields,
  migrate: (filter: Filter, from: number) =>
    from < 2 ? renameFilterField(filter, "assignee", "owner") : filter,
};
```

`renameFilterField(filter, from, to, operators?)` can also rename that field's operator ids. Saved views take the same `migrate`, applied when a view saved with an older version is used.

## useFilterUrlState

`useFilterUrlState({ fields, store?, initialSearch?, defaultValue?, …codecOptions })` returns everything `useFilterState` does, plus `urlError`.

- **Filter to URL.** Every change is written through the store. The page URL is the default, updated with `history.replaceState` so edits don't flood the back button. Undo and redo update the URL too. Chips that have no value yet don't change the URL.
- **URL to filter.** Back and forward, pasted links and other writes are applied without adding undo steps. Stores can deliver writes late (as `router.replace` does); the hook recognizes its own writes coming back, even out of order, and doesn't apply them over newer edits. It forgets them once no write has been made for `writeTimeout` (default 2000 ms), so writes a router drops or merges can't hide a later navigation. A write that comes back after that window counts as an outside change. A store must keep param order; one that reorders params makes late echoes look like outside changes. If the URL's text matches the current filter, nothing changes, so chips that are still being edited stay put.
- **Default filter.** `defaultValue` is used when the URL has no `q`, and it is never written to the URL. An empty filter that differs from the default is written as `q=`.
- **Invalid links.** `urlError` explains the problem and the filter stays as it was. The next edit replaces the bad link.
- **SSR and hydration.** The search is read with `useSyncExternalStore`. The server and the hydrating client render from `initialSearch`, and the client URL applies right after hydration. Mounting never writes, even under StrictMode, so loading a page can't rewrite a link. In Next.js, pass the page's `searchParams` (serialized) as `initialSearch` so the server renders the same filter.

### Stores

A store is `{ read(): string; write(search: string): void; subscribe(onChange): () => void }`.

- `createHistoryFilterStore({ mode?: "replace" | "push" })` uses the page URL, keeps the path and hash, and listens for `popstate`. Next.js App Router follows native `history` updates, so this store works there as-is.
- `createMemoryFilterStore(search?)` is for tests, previews and embedded views.

**Next.js router** (when server components must re-render with the filter):

```tsx
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function useNextFilterStore(): FilterUrlStore {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const listeners = useRef(new Set<() => void>());
  const searchRef = useRef(search);

  searchRef.current = search ? `?${search}` : "";
  useEffect(
    () => listeners.current.forEach((listener) => listener()),
    [search],
  );

  return useMemo(
    () => ({
      read: () => searchRef.current,
      write: (next) => router.replace(`${pathname}${next}`, { scroll: false }),
      subscribe: (listener) => {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
      },
    }),
    [pathname, router],
  );
}
```

**nuqs:**

```tsx
import { parseAsString, useQueryStates } from "nuqs";

function useNuqsFilterStore(): FilterUrlStore {
  const [params, setParams] = useQueryStates({
    q: parseAsString,
    v: parseAsString,
  });
  const listeners = useRef(new Set<() => void>());
  const searchRef = useRef("");
  const current = new URLSearchParams();

  if (params.q !== null) current.set("q", params.q);
  if (params.v !== null) current.set("v", params.v);
  searchRef.current = current.size ? `?${current}` : "";
  useEffect(
    () => listeners.current.forEach((listener) => listener()),
    [params],
  );

  return useMemo(
    () => ({
      read: () => searchRef.current,
      // null removes a key; other params are left alone.
      write: (next) => {
        const parsed = new URLSearchParams(next);
        void setParams({ q: parsed.get("q"), v: parsed.get("v") });
      },
      subscribe: (listener) => {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
      },
    }),
    [setParams],
  );
}
```

## useSavedViews

A `SavedView` is `{ id, name, filter, version, scope?: "personal" | "team", meta? }`. You store views wherever you like and pass them in as `views`.

- `apply(id)` replaces the filter as one undo step (ids of unchanged nodes are kept) and makes the view active. Views saved with an older `version` go through `migrate` first.
- `isDirty` is true when the filter does something different from the active view. It ignores node ids, redundant groups and chips that have no value yet. `diff` (from `diffFilter`) lists what was added, removed or changed.
- `save()`, `saveAs(name, { scope, meta })`, `rename(id, name)` and `remove(id)` call `onUpdate`, `onCreate` and `onDelete`. Changes show immediately and last until `views` reflects them. If a callback returns a promise that rejects, the change rolls back. Saved filters leave out chips that have no value.
- `activeViewId`, `defaultActiveViewId` and `onActiveViewChange` support controlled or uncontrolled use. `deselect()` clears the active view and keeps the filter.

## SavedViewsMenu

A trigger button and a popover dialog.

**Anatomy:**

- `data-slot="saved-views-trigger"`: the trigger. It gets `data-dirty` when the filter differs from the view.
- `data-slot="saved-views-menu"`: the popover content.
- `data-slot="saved-view"`: one row per view. The active row has `data-active`.

**Props:** `savedViews`, `scopes` (the scopes offered when saving as, default `["personal"]`), `labels` and `size`.

- The trigger shows the active view's name and a dot when the view has changed. Its accessible name adds "edited", so the change isn't signaled by the dot alone.
- Views are grouped under Personal, Team and unscoped headings. Each row has an apply button (with `aria-current` on the active view), a rename button and a delete button, all named after the view.
- Rename and Save as are inline forms. They take focus, submit with Enter and cancel with Escape, and focus returns to the control that opened them. Delete asks for confirmation first.
- "Save changes" is disabled until the view is edited. "Leave view" clears the active view.

## Theming

The trigger uses the FilterBar action styles, and rows use muted hover and active backgrounds. The edited dot uses `warning`. Destructive confirmation uses `destructive`. Popover and inputs follow their own tokens.

## Limitations

- Views are stored as filters. Column layout, sorting and grouping are out of scope, so put them in `meta` if you need them.
- The URL holds only the query text and version. For very large filters, consider saved views, and share the view id instead.

## Verification

- `filter-url.test.ts`: readable encoding that keeps other params, removing params for an empty filter, custom param names, a 500-seed round-trip through a real `URL`, version errors, migrating a renamed field (and rejecting one that isn't migrated), and renaming operators.
- `use-filter-url-state.test.tsx`: starting from the URL without writing, writes and undo, outside changes that aren't undo steps, keeping incomplete chips, invalid links, the default filter left out of the URL, an explicit empty query, migration, and the History store (replace, push, hash, popstate).
- `filter-url-state.ssr.test.tsx`: server render from `initialSearch`, hydration without mismatch, and applying the client URL after hydration under StrictMode without rewriting the link.
- `use-saved-views.test.tsx` covers apply as one undo step, dirty and diff by content (including ids from elsewhere and stable diff ids), saving without incomplete chips, save as, rename and delete, applying without duplicate ids, migration, and a controlled active view. `use-saved-views.persistence.test.tsx` covers optimistic updates, rollback (including the active view), later changes showing through, and deleting a view while its create is in flight.
- `saved-views-menu.test.tsx` covers the scoped list, apply and focus, edited and save, save as with scope, rename with Enter and Escape, confirmed delete, and the empty state. `saved-views.a11y.test.tsx` runs axe on each menu state.
- `pnpm registry:smoke:filter-bar` installs `filter-bar`, `query-input`, `filter-url-state`, `saved-views` and `data-table` in a clean consumer.
