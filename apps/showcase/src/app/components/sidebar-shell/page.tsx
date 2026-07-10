import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SidebarShellBasic } from "@/examples/sidebar-shell/basic";
import { SidebarShellControlled } from "@/examples/sidebar-shell/controlled";
import { SidebarShellPlain } from "@/examples/sidebar-shell/plain";
import { SidebarShellRecipeOpsConsole } from "@/examples/sidebar-shell/recipe-ops-console";
import { sidebarShellProps } from "@/lib/props/sidebar-shell";

export const metadata: Metadata = {
  title: "SidebarShell",
  description:
    "Compose full application chrome around Sidebar with semantic header, main, and footer regions, an automatic skip link, and workbench or plain framing.",
};

export default function SidebarShellPage() {
  return (
    <DocsPage
      name="SidebarShell"
      description="An animated application shell around the Sidebar family. SidebarShell owns viewport framing, landmark semantics, skip-link targeting, and collapse state so dashboards, internal tools, and AI workspaces stop rebuilding the same chrome — while navigation, routing, and page content stay yours to compose."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. The shell fills the viewport by default; these previews bound it with a height utility."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="sidebar-shell/basic.tsx"
            title="Workbench shell"
            description="The default bounded-workbench chrome: navigation and the work stage float as related panels on a calm inset canvas, with a pinned command deck, scrolling main landmark, and status footer."
          >
            <SidebarShellBasic />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="sidebar-shell/plain.tsx"
            title="Plain chrome"
            description="Neutral edge-to-edge geometry for docs sites and settings areas. The footer region is optional, and the subtle motion preset keeps movement nearly imperceptible."
          >
            <SidebarShellPlain />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="sidebar-shell/controlled.tsx"
            title="Controlled collapse"
            description="Collapse state lifted into your component. The header trigger, the edge rail, and every region's data attributes stay in agreement, so you can persist the preference or drive it from a server."
          >
            <SidebarShellControlled />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          wide
          codeCollapsible
          codeDefaultOpen={false}
          file="sidebar-shell/recipe-ops-console.tsx"
          title="AI operations console"
          description="An expressive-motion workbench for a live agent fleet: collapsible navigation groups with badges, a command deck with production status and actions, streaming stats and activity in the work stage, and a system-status footer."
        >
          <SidebarShellRecipeOpsConsole />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="sidebar-shell"
        importCode={`import {
  SidebarShell,
  SidebarShellHeader,
  SidebarShellMain,
  SidebarShellFooter,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="SidebarShell is composable. The root owns shared shell state and wraps SidebarProvider; regions render semantic landmarks around a Sidebar passed as a direct child."
      >
        <PropsTable caption="SidebarShell props" rows={sidebarShellProps} />
      </DocsSection>
    </DocsPage>
  );
}
