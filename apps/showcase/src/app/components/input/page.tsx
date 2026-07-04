import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { InputBasic } from "@/examples/input/basic";
import { InputForm } from "@/examples/input/form";
import { InputSizes } from "@/examples/input/sizes";
import { InputStates } from "@/examples/input/states";
import { inputProps } from "@/lib/props/input";

export const metadata: Metadata = {
  title: "Input",
  description:
    "Collect single-line text with tokenized sizes and accessible invalid, disabled, and read-only states.",
};

export default function InputPage() {
  return (
    <DocsPage
      name="Input"
      description="A tokenized text field with three control sizes and first-class invalid, disabled, and read-only states. Pair it with a label element or the FormField primitives."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="input/basic.tsx"
            title="Basic"
            description="Always pair an input with a visible label; hint text ties in through aria-describedby."
          >
            <InputBasic />
          </ExampleBlock>
          <ExampleBlock
            file="input/sizes.tsx"
            title="Sizes"
            description='Three control sizes. The default md height tracks the active density token, matching Button heights in the same layout.'
          >
            <InputSizes />
          </ExampleBlock>
          <ExampleBlock
            file="input/states.tsx"
            title="States"
            description="invalid drives both the destructive styling and aria-invalid; disabled and readOnly get distinct treatments."
          >
            <InputStates />
          </ExampleBlock>
          <ExampleBlock
            file="input/form.tsx"
            title="In a form"
            description="Inputs align with buttons out of the box because both draw their height from the same density token."
          >
            <InputForm />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="input"
        importCode={`import { Input } from "@dethink/components";

export function Example() {
  return <Input type="email" placeholder="you@company.com" />;
}`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="InputProps extends InputHTMLAttributes<HTMLInputElement>."
      >
        <PropsTable caption="Input props" rows={inputProps} />
      </DocsSection>
    </DocsPage>
  );
}
