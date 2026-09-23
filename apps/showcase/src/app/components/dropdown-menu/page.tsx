import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DropdownMenuBasic } from "@/examples/dropdown-menu/basic";
import { DropdownMenuWorkspace } from "@/examples/dropdown-menu/workspace";
import { DropdownMenuAccount } from "@/examples/dropdown-menu/account";
import { DropdownMenuRecipeRowActions } from "@/examples/dropdown-menu/recipe-row-actions";
import { DropdownMenuSubmenuExample } from "@/examples/dropdown-menu/submenu";
import { dropdownMenuProps } from "@/lib/props/dropdown-menu";

export const metadata: Metadata = {
  title: "DropdownMenu",
  description: "Show a menu of actions when users open a trigger.",
};

export default function DropdownMenuPage() {
  return (
    <DocsPage
      name="DropdownMenu"
      description="Show a menu of actions when users open a trigger."
    >
      <InstallationSection
        registryName="dropdown-menu"
        importCode={`import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Open a menu and navigate with arrows, Home/End, or by typing an item name."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="dropdown-menu/workspace.tsx"
            title="Workspace switcher"
            description="A compact workspace card with initials, plan details, and an accessible active selection. Choose a workspace to update the card."
          >
            <DropdownMenuWorkspace />
          </ExampleBlock>
          <ExampleBlock
            file="dropdown-menu/account.tsx"
            title="Account menu"
            description="A profile header, grouped settings, and a highlighted plan action. Actions show local demo feedback."
          >
            <DropdownMenuAccount />
          </ExampleBlock>
          <ExampleBlock
            file="dropdown-menu/basic.tsx"
            title="Sections, icons, and shortcuts"
            description="A grouped menu with a label, icon and shortcut parts, a separator, and a destructive item."
          >
            <DropdownMenuBasic />
          </ExampleBlock>
          <ExampleBlock
            file="dropdown-menu/submenu.tsx"
            title="Submenu and descriptions"
            description="DropdownMenuSubmenu nests a flyout; item descriptions add secondary context; disabled items stay visible but inert."
          >
            <DropdownMenuSubmenuExample />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="dropdown-menu/recipe-row-actions.tsx"
          title="Row actions"
          description="One icon trigger per row, each labelled with the row's name for screen readers. onAction mutates the live list, the destructive item is styled as such, and a live region reports what happened."
        >
          <DropdownMenuRecipeRowActions />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="DropdownMenu coordinates trigger and content; items carry actions and states."
      >
        <PropsTable caption="DropdownMenu anatomy" rows={dropdownMenuProps} />
      </DocsSection>

      <DocsSection
        id="motion-migration"
        title="Motion migration"
        description="DropdownMenu now has one animation owner."
      >
        <p className="text-muted-foreground max-w-prose text-sm leading-6">
          Surface entry and exit presence plus changed item feedback use
          primitives from <code>motion/react</code>. Registry installs now
          declare Motion as a runtime dependency. Tailwind overlay keyframes and
          transition utilities no longer run on the DropdownMenu path; the
          <code> reducedMotion</code> prop or user preference removes transform
          choreography without changing roles, focus, placement, portals, or
          submenu behavior.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
