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
    "Capture numeric input with the right mobile keypad, native min/max/step semantics, and form states.",
};

export default function NumberInputPage() {
  return (
    <DocsPage
      name="NumberInput"
      description="A numeric input built on a real input element: numberMode picks the mobile keypad, type=number opts into native bounds and arrow-key stepping, and sizes and states align with the other controls."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
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
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="number-input/recipe-allocator.tsx"
          title="Budget allocator"
          description="The 100% invariant lives across all three inputs, so every field flips invalid together, a stacked bar visualizes the split, and a live region explains the group-level error."
        >
          <NumberInputRecipeAllocator />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="number-input"
        importCode={`import { NumberInput } from "@dethink/components";`}
      />

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
