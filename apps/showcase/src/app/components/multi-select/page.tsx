import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { MultiSelectBasic } from "@/examples/multi-select/basic";
import { MultiSelectControlled } from "@/examples/multi-select/controlled";
import { MultiSelectRecipeFilterBar } from "@/examples/multi-select/recipe-filter-bar";
import { MultiSelectStates } from "@/examples/multi-select/states";
import { MultiSelectThemeAndWrapping } from "@/examples/multi-select/theme-and-wrapping";
import {
  multiSelectItemProps,
  multiSelectProps,
} from "@/lib/props/multi-select";

export const metadata: Metadata = {
  title: "MultiSelect",
  description:
    "Search and select several values with accessible listbox behavior, removable chips, and repeated form fields.",
};

export default function MultiSelectPage() {
  return (
    <DocsPage
      name="MultiSelect"
      description="A searchable multi-value field for filters, recipients, roles, and labels. Selected options render as removable chips, the listbox can be filtered from the input, and named values submit as repeated hidden inputs."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Open the list, type to filter, select multiple options, and remove selected chips from the control."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="multi-select/basic.tsx"
            title="Basic"
            description="Static options with label, helper text, and native form name."
          >
            <MultiSelectBasic />
          </ExampleBlock>
          <ExampleBlock
            file="multi-select/controlled.tsx"
            title="Controlled"
            description="Apps can own the selected array and render derived UI next to the field."
          >
            <MultiSelectControlled />
          </ExampleBlock>
          <ExampleBlock
            file="multi-select/states.tsx"
            title="Form states"
            description="Invalid, required, disabled option, read-only, and disabled control states."
          >
            <MultiSelectStates />
          </ExampleBlock>
          <ExampleBlock
            file="multi-select/theme-and-wrapping.tsx"
            title="Theme, RTL, and wrapping"
            description="Nested provider tokens, compact density, RTL direction, and narrow chip wrapping."
          >
            <MultiSelectThemeAndWrapping />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="multi-select/recipe-filter-bar.tsx"
          title="Filter bar"
          description="Two MultiSelect controls submit repeated query params for teams and statuses in a dense operations filter."
        >
          <MultiSelectRecipeFilterBar />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="multi-select"
        importCode={`import { MultiSelect, MultiSelectItem } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="MultiSelect owns its field anatomy and selected chip rendering."
      >
        <div className="space-y-8">
          <PropsTable caption="MultiSelect props" rows={multiSelectProps} />
          <PropsTable caption="MultiSelectItem props" rows={multiSelectItemProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
