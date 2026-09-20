import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { NavDockAiWorkspace } from "@/examples/navdock/ai-workspace";
import { NavDockCardStackSwitcher } from "@/examples/navdock/card-stack-switcher";
import { NavDockMobileCollapsed } from "@/examples/navdock/mobile-collapsed";
import { NavDockPlayground } from "@/examples/navdock/playground";
import { NavDockProductArea } from "@/examples/navdock/product-area";
import { NavDockWorkspaceSwitcher } from "@/examples/navdock/workspace-switcher";
import { navDockProps } from "@/lib/props/navdock";

export const metadata: Metadata = {
  title: "NavDock",
  description: "Show navigation links in a compact icon dock.",
};

export default function NavDockPage() {
  return (
    <DocsPage
      name="NavDock"
      description="Show navigation links in a compact icon dock."
    >
      <InstallationSection
        registryName="navdock"
        importCode={`import {
  CollapseDock,
  NavDock,
  NavDockButton,
  NavDockItem,
  NavDockLink,
  NavDockList,
  NavDockSeparator,
  NavDockSubmenu,
  NavDockSubmenuContent,
  NavDockSubmenuTrigger,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="NavDock keeps destinations role-specific: anchors navigate, buttons switch local panels, and submenu triggers disclose related destinations."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="navdock/playground.tsx"
            title="Interactive playground"
            description="Live controls for placement, size, variant, motion preset, and title mode. Sweep the pointer across the dock to feel the continuous magnification and compare spring characters between presets."
          >
            <NavDockPlayground />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="navdock/product-area.tsx"
            title="Product-area navigation"
            description="Route links, current matching from a pathname, a lightweight submenu, and external status access in a title-visible dock."
          >
            <NavDockProductArea />
          </ExampleBlock>
          <ExampleBlock
            file="navdock/workspace-switcher.tsx"
            title="Local workspace sections"
            description="In-page action items update local content with onAction while currentValue keeps the active panel visible."
          >
            <NavDockWorkspaceSwitcher />
          </ExampleBlock>
          <ExampleBlock
            file="navdock/card-stack-switcher.tsx"
            title="CardStack panel switcher"
            description="onAction handles the local action of flipping the CardStack to a panel, and currentValue marks that panel in primary — the same current contract link items use when navigating between pages. Cycling the stack with its own controls keeps the dock in sync."
          >
            <NavDockCardStackSwitcher />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="navdock/ai-workspace.tsx"
            title="AI workspace quick access"
            description="Compound composition with icon-only access, a separator, local actions, route links, and a disclosure submenu."
          >
            <NavDockAiWorkspace />
          </ExampleBlock>
          <ExampleBlock
            file="navdock/mobile-collapsed.tsx"
            title="Mobile collapsed dock"
            description="CollapseDock makes the compact trigger explicit and expands into an absolute vertical rail with spring motion."
          >
            <NavDockMobileCollapsed />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection id="props" title="Props">
        <PropsTable caption="NavDock anatomy" rows={navDockProps} />
      </DocsSection>
    </DocsPage>
  );
}
