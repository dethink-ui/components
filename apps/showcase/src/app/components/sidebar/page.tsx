import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SidebarBasic } from "@/examples/sidebar/basic";
import { SidebarActivityExample } from "@/examples/sidebar/activity";
import { SidebarCollapsed } from "@/examples/sidebar/collapsed";
import { SidebarMobileDrawer } from "@/examples/sidebar/mobile-drawer";
import { SidebarRecipeAiWorkspace } from "@/examples/sidebar/recipe-ai-workspace";
import { sidebarProps } from "@/lib/props/sidebar";

export const metadata: Metadata = {
  title: "Sidebar",
  description: "Organize app navigation in a sidebar that can collapse.",
};

export default function SidebarPage() {
  return (
    <DocsPage
      name="Sidebar"
      description="Organize app navigation in a sidebar that can collapse."
    >
      <InstallationSection
        registryName="sidebar"
        importCode={`import {
  Sidebar,
  SidebarProvider,
  SidebarMenuLink,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="sidebar/activity.tsx"
            title="Background work"
            description="Keep AI runs, imports, and approval requests visible. Collapse the sidebar to turn the list into an activity summary."
          >
            <SidebarActivityExample />
          </ExampleBlock>
          <ExampleBlock
            file="sidebar/basic.tsx"
            title="Dashboard navigation"
            description="A labelled nav landmark with grouped links, current route state, badges, shortcuts, a visible header toggle, and content inset."
          >
            <SidebarBasic />
          </ExampleBlock>
          <ExampleBlock
            file="sidebar/collapsed.tsx"
            title="Collapsed rail"
            description="Icon rail mode preserves accessible names while trading visual labels for workspace width."
          >
            <SidebarCollapsed />
          </ExampleBlock>
          <ExampleBlock
            file="sidebar/mobile-drawer.tsx"
            title="Mobile menu"
            description="A contained mobile navigation handoff with explicit open and close states for embedded workspace previews."
          >
            <SidebarMobileDrawer />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="sidebar/recipe-ai-workspace.tsx"
          title="AI workspace navigation"
          description="A floating sidebar with nested workflow navigation, live badges, disabled items, motion preset state, and dashboard content."
        >
          <SidebarRecipeAiWorkspace />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Sidebar is composable. The provider owns shared state; parts render semantic navigation, controls, drawers, and app-shell companions."
      >
        <PropsTable caption="Sidebar props" rows={sidebarProps} />
      </DocsSection>
    </DocsPage>
  );
}
