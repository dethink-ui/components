import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { TabsBasic } from "@/examples/tabs/basic";
import { TabsCollapsible } from "@/examples/tabs/collapsible";
import { TabsControlled } from "@/examples/tabs/controlled";
import { TabsIcons } from "@/examples/tabs/icons";
import { TabsLine } from "@/examples/tabs/line";
import { TabsMotion } from "@/examples/tabs/motion";
import { TabsRecipeSettings } from "@/examples/tabs/recipe-settings";
import { TabsStates } from "@/examples/tabs/states";
import { TabsVertical } from "@/examples/tabs/vertical";
import { tabsPartProps, tabsProps } from "@/lib/props/tabs";

export const metadata: Metadata = {
  title: "Tabs",
  description: "Switch between related views without leaving the page.",
};

export default function TabsPage() {
  return (
    <DocsPage
      name="Tabs"
      description="Switch between related views without leaving the page."
    >
      <InstallationSection
        registryName="tabs"
        importCode={`import { Tabs } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Use Tab to enter the tablist. Arrow keys move through enabled tabs; automatic mode selects on focus, while manual mode uses Enter or Space."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="tabs/basic.tsx"
            title="Pill tabs"
            description="The selected background is a decorative Motion shared-layout layer that travels between triggers."
          >
            <TabsBasic />
          </ExampleBlock>
          <ExampleBlock
            file="tabs/line.tsx"
            title="Line tabs"
            description="Use the quieter line variant for report views and dense panels."
          >
            <TabsLine />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="tabs/icons.tsx"
            title="Icon tabs"
            description="Leading icons and count badges stay legible while the active pill glides beneath them; press a trigger to feel the tactile scale."
          >
            <TabsIcons />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="tabs/collapsible.tsx"
            title="Collapsible icon rail"
            description="Pass collapsible plus an icon on each trigger to keep only the active tab labeled. Hover or focus a collapsed tab to reveal its name; selecting it expands the label while the previous tab settles back to an icon. The same reveal works in vertical layout as an expandable side rail."
          >
            <TabsCollapsible />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="tabs/motion.tsx"
            title="Motion presets"
            description="Switch tabs in each column: the active layer glides and the revealed panel body fades and lifts along the same axis. Compare subtle, standard, and expressive."
          >
            <TabsMotion />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="tabs/vertical.tsx"
            title="Vertical"
            description="Vertical orientation uses Up and Down arrow keys and exposes aria-orientation."
          >
            <TabsVertical />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="tabs/controlled.tsx"
            title="Controlled"
            description="Drive selected value from app state and force-mount panels when local content state must persist."
          >
            <TabsControlled />
          </ExampleBlock>
          <ExampleBlock
            file="tabs/states.tsx"
            title="States"
            description="Disabled triggers are skipped, manual activation waits for Enter or Space, and motionPreset none renders a static layer."
          >
            <TabsStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions for settings and internal-tool pages."
      >
        <ExampleBlock
          wide
          file="tabs/recipe-settings.tsx"
          title="Settings page"
          description="Tabs compose with Button and card-like content without owning form state or persistence."
        >
          <TabsRecipeSettings />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="guides"
        title="Guides"
        description="Keep the visual active layer separate from the accessibility contract."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            [
              "Semantics",
              "Triggers expose role tab, aria-selected, aria-controls, and roving tabindex. Panels expose role tabpanel and aria-labelledby.",
            ],
            [
              "Motion",
              "The active layer is aria-hidden and decorative, and the revealed panel body fades and lifts along the tab axis. Reduced motion or motionPreset none keeps both static.",
            ],
            [
              "Activation",
              "Automatic activation is best for instant panels. Manual activation is available when panel content is heavier.",
            ],
            [
              "Scope",
              "Tabs v1 is for in-page panels. Use navigation components for route-backed links.",
            ],
          ].map(([title, body]) => (
            <section
              key={title}
              className="border-border bg-muted/30 rounded-lg border p-4"
            >
              <h3 className="text-foreground text-sm font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {body}
              </p>
            </section>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Tabs renders a div root, native button triggers, and tabpanel regions. Every part accepts className and exposes stable data-slot/state hooks."
      >
        <div className="space-y-8">
          <PropsTable caption="Tabs props" rows={tabsProps} />
          <PropsTable caption="Part props" rows={tabsPartProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
