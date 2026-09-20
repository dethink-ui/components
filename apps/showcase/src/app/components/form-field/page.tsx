import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { FormFieldBasic } from "@/examples/form-field/basic";
import { FormFieldGroup } from "@/examples/form-field/group";
import { FormFieldRecipeProjectForm } from "@/examples/form-field/recipe-project-form";
import { fieldPartsProps, fieldProps } from "@/lib/props/form-field";

export const metadata: Metadata = {
  title: "FormField",
  description:
    "Connect a form control to its label, help text, and error message.",
};

export default function FormFieldPage() {
  return (
    <DocsPage
      name="FormField"
      description="Connect a form control to its label, help text, and error message."
    >
      <InstallationSection
        registryName="form-field"
        importCode={`import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Form,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="form-field/basic.tsx"
            title="Label, description, and error"
            description="FieldControl injects the wiring into the wrapped control — the description is announced with the field, and the error replaces it when invalid."
          >
            <FormFieldBasic />
          </ExampleBlock>
          <ExampleBlock
            file="form-field/group.tsx"
            title="Fieldset groups"
            description="FieldSet and FieldLegend name a related set; horizontal fields put the control before its label — the checkbox layout."
          >
            <FormFieldGroup />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="form-field/recipe-project-form.tsx"
          title="Create-project form"
          description="One anatomy across four control types — Input, Select, Textarea, and Switch — with on-submit validation rendered through FieldError so each error is announced with its field."
        >
          <FormFieldRecipeProjectForm />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Field carries the shared state; the part components read it through context."
      >
        <div className="space-y-8">
          <PropsTable caption="Field props" rows={fieldProps} />
          <PropsTable caption="Field parts" rows={fieldPartsProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
