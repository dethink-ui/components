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
  description: "Let users choose one option from a dropdown list.",
};

export default function SelectPage() {
  return (
    <DocsPage
      name="Select"
      description="Let users choose one option from a dropdown list."
    >
      <InstallationSection
        registryName="select"
        importCode={`import { Select, SelectItem } from "@dethink/components";

export function Example() {
  return (
    <Select label="Region" name="region" placeholder="Choose a region">
      <SelectItem value="us">United States</SelectItem>
      <SelectItem value="uk">United Kingdom</SelectItem>
    </Select>
  );
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Open with Space or Enter, jump options by typing, and confirm with Enter."
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
            description="Pass items to build options from data. Add textValue when an option contains icons or extra text, so users can still find it by typing."
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
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="select/recipe-density.tsx"
          title="Live density switcher"
          description="Let users choose how much space controls use. Changing the selection updates the surrounding layout."
        >
          <SelectRecipeDensity />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Use the label prop to name the field. Select connects the label, help text, and error message for you."
      >
        <div className="space-y-8">
          <PropsTable caption="Select props" rows={selectProps} />
          <PropsTable caption="SelectItem props" rows={selectItemProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
