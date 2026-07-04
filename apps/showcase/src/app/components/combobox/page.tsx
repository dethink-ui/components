import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ComboboxBasic } from "@/examples/combobox/basic";
import { ComboboxCustomValue } from "@/examples/combobox/custom-value";
import { ComboboxRecipeCommandPalette } from "@/examples/combobox/recipe-command-palette";
import { ComboboxRichOptions } from "@/examples/combobox/rich-options";
import { ComboboxStates } from "@/examples/combobox/states";
import { comboboxProps } from "@/lib/props/combobox";

export const metadata: Metadata = {
  title: "Combobox",
  description:
    "Filter options as you type with an accessible input-plus-listbox field, custom values, and form states.",
};

export default function ComboboxPage() {
  return (
    <DocsPage
      name="Combobox"
      description="A text input fused with a filtering listbox: matches narrow as you type, arrow keys walk the results, and the field carries the same label/description/error anatomy and hidden-input form behavior as the other Dethink controls."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Type to filter, use the arrow keys to move through matches, and Enter to select."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="combobox/basic.tsx"
            title="Basic"
            description="Static options filter against the typed text automatically."
          >
            <ComboboxBasic />
          </ExampleBlock>
          <ExampleBlock
            file="combobox/rich-options.tsx"
            title="Rich options"
            description="Dynamic items with rich option layouts; textValue keeps filtering and announcement working, and menuTrigger opens the list on focus."
          >
            <ComboboxRichOptions />
          </ExampleBlock>
          <ExampleBlock
            file="combobox/custom-value.tsx"
            title="Custom values"
            description="allowsCustomValue keeps free text that matches no option, and formValue submits the typed text instead of an option key — the classic create-a-new-tag pattern."
          >
            <ComboboxCustomValue />
          </ExampleBlock>
          <ExampleBlock
            file="combobox/states.tsx"
            title="Form states"
            description="Required, disabled, read-only, and invalid with an error message."
          >
            <ComboboxStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="combobox/recipe-command-palette.tsx"
          title="Command palette"
          description="A command palette is a Combobox wearing different content: grouped commands with shortcut hints, selection running the command, and the input resetting for the next run. A live region announces what ran."
        >
          <ComboboxRecipeCommandPalette />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="combobox"
        importCode={`import { Combobox, ComboboxItem } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Combobox owns its field anatomy — pass a label instead of wrapping it in an external one. ComboboxItem takes the same value/textValue/disabled props as SelectItem."
      >
        <PropsTable caption="Combobox props" rows={comboboxProps} />
      </DocsSection>
    </DocsPage>
  );
}
