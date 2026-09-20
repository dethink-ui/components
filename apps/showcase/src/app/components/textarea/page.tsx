import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { TextareaBasic } from "@/examples/textarea/basic";
import { TextareaRecipeComposer } from "@/examples/textarea/recipe-composer";
import { TextareaStates } from "@/examples/textarea/states";
import { textareaProps } from "@/lib/props/textarea";

export const metadata: Metadata = {
  title: "Textarea",
  description:
    "Collect several lines of text, such as a message or description.",
};

export default function TextareaPage() {
  return (
    <DocsPage
      name="Textarea"
      description="Collect several lines of text, such as a message or description."
    >
      <InstallationSection
        registryName="textarea"
        importCode={`import { Textarea } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="textarea/basic.tsx"
            title="With Field anatomy"
            description="Label and helper description wired through Field."
          >
            <TextareaBasic />
          </ExampleBlock>
          <ExampleBlock
            file="textarea/states.tsx"
            title="States, sizes, and resize"
            description="Sizes, disabled, invalid, read-only, and resize=none."
          >
            <TextareaStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="textarea/recipe-composer.tsx"
          title="Composer with character budget"
          description="The counter shifts from quiet meter to warning to error as the budget runs out, the field flips to invalid past the limit, and a live region keeps assistive tech in sync with the count."
        >
          <TextareaRecipeComposer />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Textarea renders a real textarea element, so all native attributes apply."
      >
        <PropsTable caption="Textarea props" rows={textareaProps} />
      </DocsSection>
    </DocsPage>
  );
}
