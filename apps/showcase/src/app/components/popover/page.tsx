import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { PopoverBasic } from "@/examples/popover/basic";
import { PopoverPlacement } from "@/examples/popover/placement";
import { PopoverRecipeInlineEdit } from "@/examples/popover/recipe-inline-edit";
import { popoverProps } from "@/lib/props/popover";

export const metadata: Metadata = {
  title: "Popover",
  description: "Show extra content next to a button or other trigger.",
};

export default function PopoverPage() {
  return (
    <DocsPage
      name="Popover"
      description="Show extra content next to a button or other trigger."
    >
      <InstallationSection
        registryName="popover"
        importCode={`import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="popover/basic.tsx"
            title="Basic"
            description="Trigger, titled content, and a footer close button."
          >
            <PopoverBasic />
          </ExampleBlock>
          <ExampleBlock
            file="popover/placement.tsx"
            title="Placement and arrow"
            description="placement picks the side; showArrow points the panel at its trigger. Sides flip automatically when space runs out."
          >
            <PopoverPlacement />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="popover/recipe-inline-edit.tsx"
          title="Inline edit"
          description="The value on the page is the trigger. The controlled popover edits a draft, so Cancel discards and Save commits — the displayed value never flickers mid-edit."
        >
          <PopoverRecipeInlineEdit />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Popover coordinates trigger and content; content carries placement and arrow options."
      >
        <PropsTable caption="Popover anatomy" rows={popoverProps} />
      </DocsSection>
    </DocsPage>
  );
}
