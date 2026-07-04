import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SidebarBasic } from "@/examples/sidebar/basic";
import { SidebarCollapsed } from "@/examples/sidebar/collapsed";
import { SidebarMobileDrawer } from "@/examples/sidebar/mobile-drawer";
import { SidebarRecipeAiWorkspace } from "@/examples/sidebar/recipe-ai-workspace";
import { sidebarProps } from "@/lib/props/sidebar";

export const metadata: Metadata = {
  title: "Sidebar",
  description:
    "Compose app navigation with desktop collapse, icon rails, mobile drawer behavior, grouped links, and current-route state.",
};

export default function SidebarPage() {
  return (
    <DocsPage
      name="Sidebar"
      description="A composable app navigation primitive for dashboards, internal tools, analytics surfaces, settings areas, and AI workspaces. Sidebar owns navigation state and semantics without becoming a full dashboard shell."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="sidebar/basic.tsx"
            title="Dashboard navigation"
            description="A labelled nav landmark with grouped links, current route state, badges, shortcuts, trigger, rail, and content inset."
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
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="sidebar/recipe-ai-workspace.tsx"
          title="AI workspace navigation"
          description="A floating sidebar with nested workflow navigation, live badges, disabled items, motion preset state, and dashboard content."
        >
          <SidebarRecipeAiWorkspace />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="sidebar"
        importCode={`import {
  Sidebar,
  SidebarProvider,
  SidebarMenuLink,
} from "@dethink/components";`}
      />

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
