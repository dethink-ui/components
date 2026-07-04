import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { RadioGroupBasic } from "@/examples/radio-group/basic";
import { RadioGroupRecipePlanPicker } from "@/examples/radio-group/recipe-plan-picker";
import { RadioGroupStates } from "@/examples/radio-group/states";
import { radioGroupItemProps, radioGroupProps } from "@/lib/props/radio-group";

export const metadata: Metadata = {
  title: "RadioGroup",
  description:
    "Choose exactly one option from a set of native radio inputs with orientation, size, and state control.",
};

export default function RadioGroupPage() {
  return (
    <DocsPage
      name="RadioGroup"
      description="A group wrapper around real radio inputs: one name, one value, native arrow-key movement. Group-level size and state props flow down to every item, and labels compose through the Field primitives."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Arrow keys move selection inside a focused group."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="radio-group/basic.tsx"
            title="With FieldSet anatomy"
            description="FieldSet and FieldLegend name the group; each item pairs a RadioGroupItem with a FieldLabel."
          >
            <RadioGroupBasic />
          </ExampleBlock>
          <ExampleBlock
            file="radio-group/states.tsx"
            title="Orientation and disabled"
            description="orientation lays items out horizontally; group-level disabled flows to every item."
          >
            <RadioGroupStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="radio-group/recipe-plan-picker.tsx"
          title="Card-style plan picker"
          description="Each label grows into a selectable card while the radio stays a real focusable input — so clicks, keyboard movement, and announcements all remain native RadioGroup behavior."
        >
          <RadioGroupRecipePlanPicker />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="radio-group"
        importCode={`import { RadioGroup, RadioGroupItem } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="RadioGroup renders a div with radiogroup semantics; items are real radio inputs."
      >
        <div className="space-y-8">
          <PropsTable caption="RadioGroup props" rows={radioGroupProps} />
          <PropsTable caption="RadioGroupItem props" rows={radioGroupItemProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
