"use client";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ResizablePanelHeader,
  ResizablePanelBody,
} from "@dethink/components";
export function ResizableBasic() {
  return (
    <div className="border-border h-64 w-full overflow-hidden rounded-xl border">
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="35%" minSize="20%">
          <ResizablePanelHeader>Library</ResizablePanelHeader>
          <ResizablePanelBody>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Give navigation just enough room. The divider works with a
              pointer, touch or keyboard.
            </p>
          </ResizablePanelBody>
        </ResizablePanel>
        <ResizableHandle aria-label="Library" />
        <ResizablePanel minSize="30%">
          <ResizablePanelHeader>Canvas</ResizablePanelHeader>
          <ResizablePanelBody>
            <div className="border-border text-muted-foreground flex h-full min-h-24 items-center justify-center rounded-lg border border-dashed text-sm">
              Space for your work
            </div>
          </ResizablePanelBody>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
