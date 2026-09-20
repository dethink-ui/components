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
    "Collect a single line of text, such as a name or email address.",
};

export default function InputPage() {
  return (
    <DocsPage
      name="Input"
      description="Collect a single line of text, such as a name or email address."
    >
      <InstallationSection
        registryName="input"
        importCode={`import { Input } from "@dethink/components";

export function Example() {
  return (
    <div>
      <label htmlFor="email">Email</label>
      <Input id="email" name="email" type="email" autoComplete="email" />
    </div>
  );
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="input/basic.tsx"
            title="Basic"
            description="Give every input a visible label. Use aria-describedby to connect any help text."
          >
            <InputBasic />
          </ExampleBlock>
          <ExampleBlock
            file="input/sizes.tsx"
            title="Sizes"
            description="Use controlSize to choose sm, md, or lg. The default size matches nearby buttons."
          >
            <InputSizes />
          </ExampleBlock>
          <ExampleBlock
            file="input/states.tsx"
            title="States"
            description="Use invalid for an error, disabled to block interaction, or readOnly to prevent editing while allowing text selection."
          >
            <InputStates />
          </ExampleBlock>
          <ExampleBlock
            file="input/form.tsx"
            title="In a form"
            description="Place an input and button together for a short form. Their default heights match."
          >
            <InputForm />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Also accepts standard input props, such as value, onChange, placeholder, and autoComplete."
      >
        <PropsTable caption="Input props" rows={inputProps} />
      </DocsSection>
    </DocsPage>
  );
}
