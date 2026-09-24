# Resizable Panels

Composable panes for dashboards, editors and workspaces. Built on
`react-resizable-panels` 4.13 with Dethink tokens and optional workspace controls.
The resize engine supports React 18 and 19; no Motion dependency is required.

## Installation and anatomy

Install the `resizable` registry item after the documented base setup, or import
from `@dethink/components`. The registry includes its resize dependency and all
source files. Use Group → Panel, Handle, Panel; panels and handles must be direct
DOM children of their group. Nest another Group inside a Panel for mixed axes.

```tsx
<div className="h-80">
  <ResizablePanelGroup>
    <ResizablePanel defaultSize="30%" minSize="20%">
      <ResizablePanelHeader>Library</ResizablePanelHeader>
      <ResizablePanelBody>Sources</ResizablePanelBody>
    </ResizablePanel>
    <ResizableHandle aria-label="Library" />
    <ResizablePanel minSize="30%">Canvas</ResizablePanel>
  </ResizablePanelGroup>
</div>
```

## Public API

- `ResizablePanelGroup` forwards current engine Group props and a DOM ref.
  `orientation` defaults to horizontal; vertical groups need a definite height.
  `groupRef` exposes `getLayout()` and `setLayout(layout)` with a pane-ID-to-percent map.
  `onLayoutChange` reports continuous changes; `onLayoutChanged` reports settled
  changes with `meta.isUserInteraction`. `resizePreviewMode="separator"` defers
  expensive content resizing until release. The target minimum is 44px for coarse
  pointers and 12px for fine pointers; override `resizeTargetMinimumSize` when needed.
- `ResizablePanel` forwards engine Panel props and a DOM ref. `defaultSize`,
  `minSize`, `maxSize` and `collapsedSize` accept pixels as numbers or explicit
  unit strings. Use `"30%"` for relative sizing, not `30`. `collapsible` is opt-in.
  `panelRef` exposes `collapse`, `expand`, `resize`, `getSize` and `isCollapsed`.
  Collapsed content is inert; provide an external reopen control. `className`
  styles the inner content element, matching the engine's API.
- `ResizableHandle` requires an accessible name supplied with `aria-label` or
  `aria-labelledby`; `withHandle` defaults to true. Native engine separators own
  ARIA values, controls relationships, pointer capture and keyboard interaction.
- `ResizablePanelHeader`, `ResizablePanelBody` and `ResizablePanelFooter` accept
  div attributes and refs. Body scrolls independently; header/footer stay visible.
- `ResizableWorkspace` accepts a document-unique `id`, visible `label` and at least
  two `panes`. A pane has a unique non-empty `id`, `title`, `children`, optional
  `description`, `actions`, `footer`, sizing constraints and `collapsible`.
  It provides consistent chrome, visible collapse/reopen actions, focus/restore
  and Reset layout. Optional `onLayoutCommit` reports settled normal layouts.
- Exported types: `ResizablePanelGroupProps`, `ResizablePanelProps`,
  `ResizableHandleProps`, `ResizableWorkspaceProps`, `ResizableWorkspacePane`,
  `ResizableGroupHandle`, `ResizablePanelHandle`, `ResizableLayout`,
  `ResizableLayoutStorage`.

## Focus, collapse and responsive composition

Workspace focus mode enlarges the existing content in place. Other panes become
inert and visually hidden; restore returns to the initiating control when it still
exists, or the workspace toolbar when it does not. Focus mode leaves the underlying
layout intact and is not a fullscreen browser API or modal focus trap. Collapse
uses the engine's remembered expansion size. External toolbar controls remain reachable.

Set `compactAt={560}` to opt into a container-width-based stacked layout. Resizing
and collapse controls pause in compact mode. Use
`className="h-[32rem] data-[compact]:h-auto"` and optionally set
`--dt-resizable-compact-height` (default 22rem). Content stays mounted across the
breakpoint and normal proportions return on wider containers. Without `compactAt`,
the application owns responsive composition. Avoid impossible sums of minimum
sizes; when constraints cannot fit, the engine reconciles them and individual pane
content may need its own overflow treatment.

## Saved layouts and SSR

Persistence is off by default. Set `storageKey` to enable versioned localStorage
snapshots or supply a synchronous `storage` adapter with getItem/setItem/removeItem.
Snapshots contain only sizes, never pane content. IDs must be stable. A changed
pane set, unsupported version, invalid percentage or corrupt JSON falls back to
the initial layout. Storage failures are ignored so interaction continues. Normal
settled layouts are saved; temporary focus and compact layouts are excluded.
Reset layout restores and saves the initial arrangement.

SSR renders content without reading browser storage. Stored sizes are restored
after mounting; a small initial layout shift is possible. Use explicit initial
sizes and a fixed container height to limit it. For a guaranteed identical first
paint, omit client storage and supply server-known defaults through the primitives.

## Theming and recipes

Semantic background, foreground, border, primary, muted and ring tokens support
light/dark/high-contrast themes. Header/body padding follows density tokens.
Customize classes and the `data-slot` hooks; no hidden global component stylesheet
is needed beyond the base theme. Dividers have a thin visual boundary with a grip
and a larger hit region. Resizing is direct; no decorative movement is introduced.

The showcase contains a research studio (sources, synthesis and an editable draft),
an operations desk (filtered queue with nested summary/event panels), and the
minimal primitive composition. These examples contain illustrative local data;
they do not connect to an AI or job service.

## Accessibility and testing

Divider orientation is perpendicular to pane arrangement. Label each divider
after its primary pane. Tab to handles, use axis arrow keys to resize, Home/End for
limits, and Enter for collapse/restore where supported by the primary pane.
Workspace toolbar actions provide another way to collapse/reopen. Do not hide all
recovery controls inside a collapsible pane. Basic primitive consumers own focus
recovery for programmatic collapse; Workspace actions run from its external toolbar.

Automated coverage includes storage validation, SSR, browser keyboard/pointer
resizing, nested groups, persistence/reset, collapse, focus restoration, draft state
retention, responsive layout, axe and visual captures. Clean consumer installation
checks copied files, dependencies, types and CSS builds.

Manual screen-reader acceptance: identify named separators and changing values;
confirm hidden content cannot receive focus; collapse/reopen and focus/restore;
check reading order in RTL and stacked mode. Automation is not a substitute for
this assistive-technology check.

## Migration and limits

This is additive. Existing SidebarShell, Separator and layout APIs do not change.
The passive Separator remains distinct from a focusable ResizableHandle.
No docking, tab management, drag-to-reorder or detached windows are included.
