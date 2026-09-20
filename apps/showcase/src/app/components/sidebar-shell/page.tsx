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
    "Arrange a sidebar, header, main content, and footer into an app layout.",
};

export default function SidebarShellPage() {
  return (
    <DocsPage
      name="SidebarShell"
      description="Arrange a sidebar, header, main content, and footer into an app layout."
    >
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
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. The shell fills the viewport by default; these previews bound it with a height utility."
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
            description="Collapse state lifted into your component. The single header trigger and every region's data attributes stay in agreement, so you can persist the preference or drive it from a server."
          >
            <SidebarShellControlled />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
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
