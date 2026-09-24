import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ResizableBasic } from "@/examples/resizable/basic";
import { ResizableWorkbench } from "@/examples/resizable/workbench";
import { ResizableOperations } from "@/examples/resizable/operations";
import { ResizableChat } from "@/examples/resizable/chat";
import { resizableProps } from "@/lib/props/resizable";
export const metadata: Metadata = {
  title: "Resizable Panels",
  description:
    "Make room for the task. Compose, resize, focus and restore your workspace.",
};
export default function ResizablePage() {
  return (
    <DocsPage
      name="Resizable Panels"
      description="Make room for the task. Compose, resize, focus and restore your workspace."
    >
      <InstallationSection
        registryName="resizable"
        importCode={
          'import { ResizablePanelGroup, ResizablePanel, ResizableHandle, ResizableWorkspace } from "@dethink/components";'
        }
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Start with a divider. Build a workspace that remembers how you work."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            fullBleed
            file="resizable/workbench.tsx"
            title="Research studio"
            description="Evidence, synthesis and a working draft. Hide a pane, focus your writing and restore the layout without losing your draft."
          >
            <ResizableWorkbench />
          </ExampleBlock>
          <ExampleBlock
            wide
            fullBleed
            file="resizable/operations.tsx"
            title="Operations desk"
            description="A filtered run queue beside a nested execution view and event stream. Independent scrolling keeps each pane useful."
          >
            <ResizableOperations />
          </ExampleBlock>
          <ExampleBlock
            wide
            fullBleed
            file="resizable/chat.tsx"
            title="Chat and canvas"
            description="The Chat component beside an editable brief. Send a sample request, resize the canvas, or focus a pane without losing the conversation."
          >
            <ResizableChat />
          </ExampleBlock>
          <ExampleBlock
            wide
            fullBleed
            file="resizable/basic.tsx"
            title="Composable primitives"
            description="Two panes and a labelled handle. Nest another group inside a pane for mixed horizontal and vertical layouts."
          >
            <ResizableBasic />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="composition" title="Composition and sizing">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Group orientation describes how panes are arranged. A horizontal group
          has a vertical divider. Use percentage strings such as “30%”, pixel
          numbers, or explicit CSS units for sizes. Give vertical groups a
          definite height and keep minimum sizes feasible for the container.
          Panel and Handle must be direct DOM children of Group.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Header, Body and Footer are optional building blocks. Body scrolls
          independently. ResizableWorkspace adds visible collapse, reopen, focus
          and restore controls around these primitives; it keeps pane content
          mounted. Supply stable pane IDs and a document-unique workspace ID.
        </p>
      </DocsSection>
      <DocsSection id="persistence" title="Remember and recover">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Set storageKey to remember settled layouts. Saved data is versioned
          and validated against the pane IDs; blocked storage and invalid data
          fall back safely. Reset layout restores the initial arrangement. Focus
          mode does not overwrite your regular layout. Persistence stores sizes
          only, never pane content.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Set compactAt to opt into a stacked layout based on the workspace
          container width. Every pane stays available and keeps its state;
          resizing pauses until more space is available. Customize compact pane
          height with --dt-resizable-compact-height (default 22rem). Give the
          workspace an automatic height in compact mode, as the examples do.
        </p>
      </DocsSection>
      <DocsSection id="props" title="Props">
        <PropsTable caption="Resizable API" rows={resizableProps} />
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Name every divider after its primary pane. Tab to a divider, use
          arrows to resize, Home/End to reach its limits, and Enter to collapse
          a collapsible primary pane. Workspace controls provide a visible way
          to reopen panes. Focus mode removes other pane content from keyboard
          navigation and restores the initiating control when you return. Thin
          dividers have larger interaction targets. Theme tokens retain focus
          and boundaries in dark and high-contrast modes; resizing has no
          decorative motion.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
