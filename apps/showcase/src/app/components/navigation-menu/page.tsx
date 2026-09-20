import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { NavigationMenuAppTopbar } from "@/examples/navigation-menu/app-topbar";
import { NavigationMenuBasic } from "@/examples/navigation-menu/basic";
import { NavigationMenuBrandNavbar } from "@/examples/navigation-menu/brand-navbar";
import { NavigationMenuDashboard } from "@/examples/navigation-menu/dashboard";
import { NavigationMenuDocsHub } from "@/examples/navigation-menu/docs-hub";
import { NavigationMenuMobileDrawer } from "@/examples/navigation-menu/mobile-drawer";
import { NavigationMenuOverflow } from "@/examples/navigation-menu/overflow";
import { NavigationMenuProductNav } from "@/examples/navigation-menu/product-nav";
import { navigationMenuProps } from "@/lib/props/navigation-menu";

export const metadata: Metadata = {
  title: "NavigationMenu",
  description: "Group page links in a menu with optional dropdown panels.",
};

export default function NavigationMenuPage() {
  return (
    <DocsPage
      name="NavigationMenu"
      description="Group page links in a menu with optional dropdown panels."
    >
      <InstallationSection
        registryName="navigation-menu"
        importCode={`import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="NavigationMenu keeps links as links. Triggers are disclosure buttons with aria-expanded, and panels stay in the navigation's tab order."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="navigation-menu/basic.tsx"
            title="Simple link bar"
            description="Current, disabled, and external states on a persistent top navigation."
          >
            <NavigationMenuBasic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="navigation-menu/brand-navbar.tsx"
            title="Brand navbar"
            description="A full marketing navbar: brand logo, icon-led menu with rich flyouts and the animated indicator, plus a theme toggle, login, and call-to-action cluster. When the bar gets narrow, the burger expands an integrated panel with accordion submenus — no overlay."
          >
            <NavigationMenuBrandNavbar />
          </ExampleBlock>
          <ExampleBlock
            file="navigation-menu/product-nav.tsx"
            title="Product navigation"
            description="Rich flyout panels with a featured card, grouped links, icons, descriptions, and the animated indicator."
          >
            <NavigationMenuProductNav />
          </ExampleBlock>
          <ExampleBlock
            file="navigation-menu/app-topbar.tsx"
            title="App topbar with mobile handoff"
            description="A compact quiet nav on desktop; on small screens the same links hand off to a Dialog. Resize the viewport to see the collapse."
          >
            <NavigationMenuAppTopbar />
          </ExampleBlock>
          <ExampleBlock
            file="navigation-menu/mobile-drawer.tsx"
            title="Mobile navigation drawer"
            description="A phone-sized in-page drawer: a disclosure button toggles the panel, and the vertical menu restyles its flyout into an accordion — links, icons, current state, and auth actions stay intact."
          >
            <NavigationMenuMobileDrawer />
          </ExampleBlock>
          <ExampleBlock
            file="navigation-menu/docs-hub.tsx"
            title="Documentation hub"
            description="Underline variant with grouped guide flyouts and aria-current=location for the active page."
          >
            <NavigationMenuDocsHub />
          </ExampleBlock>
          <ExampleBlock
            file="navigation-menu/dashboard.tsx"
            title="Dashboard composition"
            description="A quiet topbar plus a vertical section nav composing an app shell — without absorbing Sidebar's job."
          >
            <NavigationMenuDashboard />
          </ExampleBlock>
          <ExampleBlock
            file="navigation-menu/overflow.tsx"
            title="Overflow collapse"
            description="Secondary destinations collapse behind a More disclosure on narrow screens and render inline when space allows."
          >
            <NavigationMenuOverflow />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection id="props" title="Props">
        <PropsTable
          caption="NavigationMenu anatomy"
          rows={navigationMenuProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
