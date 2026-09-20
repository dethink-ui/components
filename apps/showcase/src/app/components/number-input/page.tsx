import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { NumberInputBasic } from "@/examples/number-input/basic";
import { NumberInputModes } from "@/examples/number-input/modes";
import { NumberInputRecipeAllocator } from "@/examples/number-input/recipe-allocator";
import { numberInputProps } from "@/lib/props/number-input";

export const metadata: Metadata = {
  title: "NumberInput",
  description:
    "Collect a number with optional minimum, maximum, and step values.",
};

export default function NumberInputPage() {
  return (
    <DocsPage
      name="NumberInput"
      description="Collect a number with optional minimum, maximum, and step values."
    >
      <InstallationSection
        registryName="number-input"
        importCode={`import { NumberInput } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="number-input/basic.tsx"
            title="Bounded quantity"
            description="type=number gives native min/max/step behavior — arrow keys and spinners step within bounds."
          >
            <NumberInputBasic />
          </ExampleBlock>
          <ExampleBlock
            file="number-input/modes.tsx"
            title="Keypad modes and states"
            description="numberMode switches the mobile keypad between decimal and digits-only; disabled and invalid states flow through Field."
          >
            <NumberInputModes />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="number-input/recipe-allocator.tsx"
          title="Budget allocator"
          description="The 100% invariant lives across all three inputs, so every field flips invalid together, a stacked bar visualizes the split, and a live region explains the group-level error."
        >
          <NumberInputRecipeAllocator />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="NumberInput renders a real input element, so all native numeric attributes apply."
      >
        <PropsTable caption="NumberInput props" rows={numberInputProps} />
      </DocsSection>
    </DocsPage>
  );
}
