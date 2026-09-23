import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SidebarShellBasic } from "@/examples/sidebar-shell/basic";
import { SidebarShellLayoutOptions } from "@/examples/sidebar-shell/layout-options";
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
            file="sidebar-shell/layout-options.tsx"
            title="Make it your workspace"
            description="Place navigation on either edge. Try a collapsible work panel inside the shell with activity and notes, switch to a simple bottom status bar, or leave it out. Try RTL and a header-free layout too."
          >
            <SidebarShellLayoutOptions />
          </ExampleBlock>
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
        id="composition"
        title="Placement and bottom bars"
        description="The side prop always names a physical edge, including in RTL layouts. Set it on the shell so navigation, rails, and mobile controls agree."
      >
        <div className="text-muted-foreground space-y-3 text-sm">
          <p>
            SidebarFooter belongs inside navigation. SidebarShellFooter is the
            application’s bottom bar: its default span is content; span="shell"
            places it beneath navigation and the work area. Omit it to remove
            the bar entirely. Header and footer are independently optional.
          </p>
          <p>
            For an embedded work panel, compose BottomBar, BottomBarHeader,
            BottomBarTrigger and BottomBarContent directly inside SidebarShell.
            Use span="content" or span="shell" and choose a size or custom
            height. The example keeps Activity and Notes close to the workspace;
            collapsing the panel gives that space back to the main content.
            Panel state belongs to your application.
          </p>
          <p>
            Pass regions directly or inside fragments. Wrap an extracted
            navigation component in SidebarShellNavigation. The main region
            scrolls independently; long navigation scrolls in SidebarContent.
            Keep bar content concise and allow actions to wrap.
          </p>
          <p>
            The skip link comes first. Left-side navigation precedes the content
            frame in DOM order; right-side navigation follows it. A full-width
            bottom bar comes last. On small screens, hide desktop navigation and
            compose SidebarMobile with SidebarMobileTrigger, as shown above; the
            shell does not choose your breakpoint.
          </p>
          <p>
            Existing compositions need no migration. Footer span is additive.
            Use as="div" when a parent already owns the footer landmark, and
            provide distinct navigation labels when your page has multiple
            navigation regions.
          </p>
        </div>
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
