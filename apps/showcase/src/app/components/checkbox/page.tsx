import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { CheckboxBasic } from "@/examples/checkbox/basic";
import { CheckboxRecipePermissionsTree } from "@/examples/checkbox/recipe-permissions-tree";
import { CheckboxStates } from "@/examples/checkbox/states";
import { checkboxProps } from "@/lib/props/checkbox";

export const metadata: Metadata = {
  title: "Checkbox",
  description: "Let users turn individual options on or off.",
};

export default function CheckboxPage() {
  return (
    <DocsPage
      name="Checkbox"
      description="Let users turn individual options on or off."
    >
      <InstallationSection
        registryName="checkbox"
        importCode={`import { Checkbox } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="checkbox/basic.tsx"
            title="With Field anatomy"
            description="Field, FieldControl, FieldLabel, and FieldDescription wire the label association and description announcement."
          >
            <CheckboxBasic />
          </ExampleBlock>
          <ExampleBlock
            file="checkbox/states.tsx"
            title="States and sizes"
            description="Checked, indeterminate, disabled, invalid, and the three control sizes."
          >
            <CheckboxStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="checkbox/recipe-permissions-tree.tsx"
          title="Permissions tree with tri-state parent"
          description="The parent checkbox derives its state from the children — checked, unchecked, or indeterminate — and clicking it snaps the group to the obvious next state. Screen readers announce the mixed state natively."
        >
          <CheckboxRecipePermissionsTree />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Checkbox renders a real input element, so everything a native checkbox accepts works here."
      >
        <PropsTable caption="Checkbox props" rows={checkboxProps} />
      </DocsSection>
    </DocsPage>
  );
}
