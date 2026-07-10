import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DropdownMenuBasic } from "@/examples/dropdown-menu/basic";
import { DropdownMenuRecipeRowActions } from "@/examples/dropdown-menu/recipe-row-actions";
import { DropdownMenuSubmenuExample } from "@/examples/dropdown-menu/submenu";
import { dropdownMenuProps } from "@/lib/props/dropdown-menu";

export const metadata: Metadata = {
  title: "DropdownMenu",
  description:
    "Action menus with sections, icons, shortcuts, descriptions, submenus, and destructive items.",
};

export default function DropdownMenuPage() {
  return (
    <DocsPage
      name="DropdownMenu"
      description="A button-triggered action menu with full keyboard navigation and typeahead. Items compose from icon, label, description, and shortcut parts; sections, separators, and submenus structure larger menus, and destructive items get their own treatment."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Open a menu and navigate with arrows, Home/End, or by typing an item name."
      >
        <div className="space-y-10">
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
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="dropdown-menu/recipe-row-actions.tsx"
          title="Row actions"
          description="One icon trigger per row, each labelled with the row's name for screen readers. onAction mutates the live list, the destructive item is styled as such, and a live region reports what happened."
        >
          <DropdownMenuRecipeRowActions />
        </ExampleBlock>
      </DocsSection>

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
