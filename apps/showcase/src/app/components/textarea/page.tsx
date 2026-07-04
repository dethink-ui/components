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
    "Collect multi-line text with tokenized sizes, resize control, and accessible invalid and read-only states.",
};

export default function TextareaPage() {
  return (
    <DocsPage
      name="Textarea"
      description="A styled native textarea: tokenized sizes aligned with Input, a resize prop for controlling drag behavior, and invalid styling with aria-invalid. Compose labels and errors with the Field primitives."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
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
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="textarea/recipe-composer.tsx"
          title="Composer with character budget"
          description="The counter shifts from quiet meter to warning to error as the budget runs out, the field flips to invalid past the limit, and a live region keeps assistive tech in sync with the count."
        >
          <TextareaRecipeComposer />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="textarea"
        importCode={`import { Textarea } from "@dethink/components";`}
      />

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
