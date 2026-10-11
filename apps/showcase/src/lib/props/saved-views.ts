import type { PropRow } from "@/components/props-table";

export const filterUrlStateProps: PropRow[] = [
  {
    prop: "fields",
    type: "FilterField[]",
    defaultValue: "—",
    description: "The field schema used to read and write the URL.",
  },
  {
    prop: "store",
    type: "FilterUrlStore",
    defaultValue: "page URL",
    description:
      "{ read, write, subscribe } over a search string. createHistoryFilterStore({ mode }) and createMemoryFilterStore(search) ship; routers plug in with a few lines.",
  },
  {
    prop: "initialSearch",
    type: "string",
    defaultValue: '""',
    description:
      "The search string the server rendered with. Without it, the URL filter applies right after hydration.",
  },
  {
    prop: "defaultValue",
    type: "Filter",
    defaultValue: "empty",
    description:
      "Filter when the URL has none. It is left out of the URL; an empty filter that differs from it is written as q=.",
  },
  {
    prop: "version / fieldsAt / migrate",
    type: "number / (v) => FilterField[] / (filter, v) => Filter",
    defaultValue: "1",
    description:
      "Schema version written as v, the schema old links were written with, and the upgrade from it. renameFilterField helps with renames.",
  },
  {
    prop: "writeTimeout",
    type: "number",
    defaultValue: "2000",
    description:
      "How long after its last write the hook still recognizes its own writes coming back from a slow router.",
  },
  {
    prop: "param / versionParam",
    type: "string",
    defaultValue: '"q" / "v"',
    description: "Search param names.",
  },
  {
    prop: "returns",
    type: "FilterState & { urlError? }",
    defaultValue: "—",
    description:
      "Everything useFilterState returns, plus why the URL could not be read. Undo works; outside URL changes are not undo steps.",
  },
];

export const savedViewsProps: PropRow[] = [
  {
    prop: "state / fields / views",
    type: "FilterState / FilterField[] / SavedView[]",
    defaultValue: "—",
    description:
      "The filter state, schema and your persisted views ({ id, name, filter, version, scope?, meta? }).",
  },
  {
    prop: "onCreate / onUpdate / onDelete",
    type: "(view) => void | Promise",
    defaultValue: "—",
    description:
      "Persistence. Changes show right away and roll back if the returned promise rejects.",
  },
  {
    prop: "activeViewId / defaultActiveViewId / onActiveViewChange",
    type: "string | null",
    defaultValue: "null",
    description: "Controlled or uncontrolled active view.",
  },
  {
    prop: "version / migrate",
    type: "number / (filter, v) => Filter",
    defaultValue: "1",
    description:
      "Stamped on saves; views saved with older versions are migrated before they apply.",
  },
  {
    prop: "returns",
    type: "SavedViewsState",
    defaultValue: "—",
    description:
      "views, activeView, isDirty, diff, and apply (one undo step), save, saveAs(name, { scope }), rename, remove, deselect.",
  },
];

export const savedViewsMenuProps: PropRow[] = [
  {
    prop: "savedViews",
    type: "SavedViewsState",
    defaultValue: "—",
    description: "State from useSavedViews.",
  },
  {
    prop: "scopes",
    type: '("personal" | "team")[]',
    defaultValue: '["personal"]',
    description:
      "Scopes offered when saving a new view. With more than one, the form asks who can see it.",
  },
  {
    prop: "labels",
    type: "Partial<SavedViewsMenuLabels>",
    defaultValue: "English",
    description: "Every visible and accessible string.",
  },
  {
    prop: "size",
    type: '"sm" | "md"',
    defaultValue: '"md"',
    description: "Matches FilterBar.",
  },
];
