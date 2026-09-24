// @vitest-environment node
import { renderToString } from "react-dom/server";
import { it, expect } from "vitest";
import { ResizableWorkspace } from ".";
it("renders initial pane content and restore controls without browser storage", () => {
  const html = renderToString(
    <ResizableWorkspace
      id="ssr"
      label="Workspace"
      storageKey="saved"
      panes={[
        { id: "a", title: "Sources", children: "Evidence" },
        { id: "b", title: "Draft", children: "Working text" },
      ]}
    />,
  );
  expect(html).toContain("Evidence");
  expect(html).toContain("Working text");
  expect(html).toContain("Reset layout");
});
