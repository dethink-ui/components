import type { PropRow } from "@/components/props-table";
export const resizableProps: PropRow[] = [
  {
    prop: "Group: orientation",
    type: '"horizontal" | "vertical"',
    defaultValue: "horizontal",
    description: "Pane arrangement; divider orientation is perpendicular.",
  },
  {
    prop: "Panel: defaultSize / minSize / maxSize",
    type: "number | string",
    defaultValue: "auto / 0% / 100%",
    description:
      "Numbers are pixels. Use explicit percentage strings for relative sizing.",
  },
  {
    prop: "Panel: collapsible / collapsedSize",
    type: "boolean / number | string",
    defaultValue: "false / 0%",
    description:
      "Enables collapse. Provide a reachable external reopen control.",
  },
  {
    prop: "Group: groupRef / Panel: panelRef",
    type: "ResizableGroupHandle / ResizablePanelHandle",
    defaultValue: "—",
    description: "Read/set layouts, resize, collapse and expand panels.",
  },
  {
    prop: "Group: onLayoutChange / onLayoutChanged",
    type: "(layout, meta?) => void",
    defaultValue: "—",
    description:
      "Continuous or settled layout changes. Prefer settled updates for persistence.",
  },
  {
    prop: "Handle: aria-label / withHandle",
    type: "string / boolean",
    defaultValue: "— / true",
    description: "Accessible primary-pane name and optional visible grip.",
  },
  {
    prop: "Workspace: id / label / panes",
    type: "string / string / ResizableWorkspacePane[]",
    defaultValue: "Required",
    description:
      "Document-unique workspace ID, visible label and at least two uniquely identified panes.",
  },
  {
    prop: "Workspace pane: title / children / actions / footer",
    type: "string / ReactNode",
    defaultValue: "—",
    description:
      "Content, pane chrome and optional actions. Sizing and collapsible options are supported.",
  },
  {
    prop: "Workspace: compactAt",
    type: "number",
    defaultValue: "—",
    description: "Opt into stacked panes below this container width in pixels.",
  },
  {
    prop: "Workspace: storageKey / storage",
    type: "string / ResizableLayoutStorage",
    defaultValue: "Off / localStorage",
    description:
      "Opt-in versioned size persistence; supply a synchronous storage adapter if desired.",
  },
  {
    prop: "Workspace: onLayoutCommit",
    type: "(layout: ResizableLayout) => void",
    defaultValue: "—",
    description:
      "Settled normal layouts; temporary focus and compact arrangements are excluded.",
  },
];
