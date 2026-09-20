import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { TagInputBasic } from "@/examples/tag-input/basic";
import { TagInputControlled } from "@/examples/tag-input/controlled";
import { TagInputRecipeLabelEditor } from "@/examples/tag-input/recipe-label-editor";
import { TagInputStates } from "@/examples/tag-input/states";
import { TagInputThemeAndWrapping } from "@/examples/tag-input/theme-and-wrapping";
import { TagInputValidation } from "@/examples/tag-input/validation";
import { tagInputProps } from "@/lib/props/tag-input";

export const metadata: Metadata = {
  title: "TagInput",
  description: "Let users add, edit, and remove text tags.",
};

export default function TagInputPage() {
  return (
    <DocsPage
      name="TagInput"
      description="Let users add, edit, and remove text tags."
    >
      <InstallationSection
        registryName="tag-input"
        importCode={`import { TagInput } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Type a value and press Enter, comma, or Tab. Backspace removes the previous chip when the input is empty."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="tag-input/basic.tsx"
            title="Basic"
            description="Free-form labels with helper copy and native form serialization."
          >
            <TagInputBasic />
          </ExampleBlock>
          <ExampleBlock
            file="tag-input/controlled.tsx"
            title="Controlled"
            description="Apps can own the tag array and render derived submission state."
          >
            <TagInputControlled />
          </ExampleBlock>
          <ExampleBlock
            file="tag-input/validation.tsx"
            title="Validation"
            description="Duplicate prevention is built in; custom validation blocks tags with a visible message."
          >
            <TagInputValidation />
          </ExampleBlock>
          <ExampleBlock
            file="tag-input/states.tsx"
            title="Form states"
            description="Invalid, required, read-only, and disabled states use the same field styling contract as other inputs."
          >
            <TagInputStates />
          </ExampleBlock>
          <ExampleBlock
            file="tag-input/theme-and-wrapping.tsx"
            title="Theme, RTL, and wrapping"
            description="Nested provider tokens, compact density, RTL direction, and narrow chip wrapping."
          >
            <TagInputThemeAndWrapping />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="tag-input/recipe-label-editor.tsx"
          title="Case label editor"
          description="A compact form with a capped label list and a second TagInput validating email recipients."
        >
          <TagInputRecipeLabelEditor />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="TagInput owns its label, chip list, entry input, validation, and repeated form fields."
      >
        <PropsTable caption="TagInput props" rows={tagInputProps} />
      </DocsSection>
    </DocsPage>
  );
}
