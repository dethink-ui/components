import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SelectBasic } from "@/examples/select/basic";
import { SelectOptions } from "@/examples/select/options";
import { SelectRecipeDensity } from "@/examples/select/recipe-density";
import { SelectSizes } from "@/examples/select/sizes";
import { SelectStates } from "@/examples/select/states";
import { selectItemProps, selectProps } from "@/lib/props/select";

export const metadata: Metadata = {
  title: "Select",
  description:
    "Pick one option from a popover listbox with typeahead, form states, and native form submission.",
};

export default function SelectPage() {
  return (
    <DocsPage
      name="Select"
      description="A single-choice field backed by a popover listbox: full keyboard navigation and typeahead, label/description/error anatomy, three control sizes, and a hidden input for native forms. Options are static SelectItem children or dynamic items rendered through a function."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Open with Space or Enter, jump options by typing, and confirm with Enter."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="select/basic.tsx"
            title="Basic"
            description="Label, placeholder, helper description, and a name for native form submission."
          >
            <SelectBasic />
          </ExampleBlock>
          <ExampleBlock
            file="select/options.tsx"
            title="Dynamic and rich options"
            description="items feeds data through a render function; textValue keeps typeahead working when option children are rich nodes, and disabledKeys disables options by value."
          >
            <SelectOptions />
          </ExampleBlock>
          <ExampleBlock
            file="select/sizes.tsx"
            title="Sizes"
            description="controlSize aligns the trigger with Input and Button heights."
          >
            <SelectSizes />
          </ExampleBlock>
          <ExampleBlock
            file="select/states.tsx"
            title="Form states"
            description="Required, disabled, read-only, and invalid with an error message."
          >
            <SelectStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="select/recipe-density.tsx"
          title="Live density switcher"
          description="The library's density contract is a plain data-density attribute, so a controlled Select can respace an entire subtree in real time — the same mechanism an app-wide preference screen would use."
        >
          <SelectRecipeDensity />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="select"
        importCode={`import { Select, SelectItem } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Select owns its field anatomy — pass a label instead of wrapping it in an external one."
      >
        <div className="space-y-8">
          <PropsTable caption="Select props" rows={selectProps} />
          <PropsTable caption="SelectItem props" rows={selectItemProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
