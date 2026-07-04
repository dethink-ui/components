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
  description:
    "Anchor rich interactive content to a trigger with placement, arrows, and managed focus.",
};

export default function PopoverPage() {
  return (
    <DocsPage
      name="Popover"
      description="A non-modal overlay anchored to its trigger: focus moves in when it opens, Escape and outside clicks dismiss, and focus returns to the trigger. Use it when the content is interactive — for plain hints, use Tooltip."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
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
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="popover/recipe-inline-edit.tsx"
          title="Inline edit"
          description="The value on the page is the trigger. The controlled popover edits a draft, so Cancel discards and Save commits — the displayed value never flickers mid-edit."
        >
          <PopoverRecipeInlineEdit />
        </ExampleBlock>
      </DocsSection>

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
        id="props"
        title="Props"
        description="Popover coordinates trigger and content; content carries placement and arrow options."
      >
        <PropsTable caption="Popover anatomy" rows={popoverProps} />
      </DocsSection>
    </DocsPage>
  );
}
