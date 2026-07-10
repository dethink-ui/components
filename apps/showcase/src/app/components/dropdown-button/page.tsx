import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DropdownButtonBasic } from "@/examples/dropdown-button/basic";
import { dropdownButtonProps } from "@/lib/props/dropdown-button";

export const metadata: Metadata = {
  title: "DropdownButton",
  description:
    "A menu button composition for related actions, built from Button, ButtonGroup, and DropdownMenu with Motion-only menu presence.",
};

export default function DropdownButtonPage() {
  return (
    <DocsPage
      name="DropdownButton"
      description="A policy composition for one visible button that opens a menu of related actions. It reuses the existing Button visuals, ButtonGroup anatomy, and React Aria-backed DropdownMenu behavior instead of creating another menu model."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Menu mode performs no direct action: the visible button only opens the action menu."
      >
        <ExampleBlock
          file="dropdown-button/basic.tsx"
          title="Menu button"
          description="Uncontrolled and controlled examples with grouped, descriptive, disabled, destructive, placed, and Motion-configured menu content."
        >
          <DropdownButtonBasic />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="semantics"
        title="Choose it for actions—not values"
        description="DropdownButton narrows a few often-confused interaction patterns."
      >
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[
            [
              "DropdownButton (menu)",
              "Use when one labelled button reveals a small set of related commands with similar importance. Selecting an item runs an action.",
            ],
            [
              "DropdownMenu",
              "Use the lower-level primitive when the trigger or surrounding composition is product-specific, such as an icon-only row overflow menu.",
            ],
            [
              "Select or Combobox",
              "Use when the user chooses a value that persists in a field. DropdownButton items are commands, not options, and the trigger label does not become the selected item.",
            ],
            [
              "Toolbar",
              "Use for a command surface with toolbar semantics and roving arrow-key focus. DropdownButton is one normal Tab stop before its menu opens.",
            ],
            [
              "Split button",
              "Use only when a dominant direct action must remain beside a separate alternatives trigger. Split semantics are intentionally outside this menu-only slice.",
            ],
          ].map(([term, description]) => (
            <div key={term} className="border-border rounded-lg border p-4">
              <dt className="font-semibold">{term}</dt>
              <dd className="text-muted-foreground mt-1 leading-6">
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </DocsSection>

      <DocsSection
        id="accessibility"
        title="Keyboard, focus, and reduced motion"
        description="The existing DropdownMenu remains the semantic and behavioral owner."
      >
        <div className="text-muted-foreground max-w-prose space-y-3 text-sm leading-6">
          <p>
            Enter, Space, and supported Up/Down Arrow behavior open the menu.
            Arrow keys, Home/End, typeahead, disabled-item skipping, and item
            activation operate inside it. Escape closes the menu and returns
            focus to the trigger.
          </p>
          <p>
            Menu surface presence and changed item feedback use primitives from
            <code> motion/react</code>. The <code>none</code> preset disables
            choreography; reduced motion keeps a short opacity affordance while
            removing transforms. Open, focus, destructive, and disabled meaning
            never depends on movement.
          </p>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="dropdown-button"
        importCode={`import {
  DropdownButton,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="The menu-only discriminant keeps direct primary-action props out of this slice."
      >
        <PropsTable caption="DropdownButton props" rows={dropdownButtonProps} />
      </DocsSection>
    </DocsPage>
  );
}
