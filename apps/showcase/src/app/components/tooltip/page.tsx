import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { TooltipBasic } from "@/examples/tooltip/basic";
import { TooltipRecipeToolbar } from "@/examples/tooltip/recipe-toolbar";
import { TooltipTiming } from "@/examples/tooltip/timing";
import { tooltipProps } from "@/lib/props/tooltip";

export const metadata: Metadata = {
  title: "Tooltip",
  description:
    "Hint at a control's purpose on hover and focus with delay, placement, and arrow options.",
};

export default function TooltipPage() {
  return (
    <DocsPage
      name="Tooltip"
      description="A hover-and-focus hint bound to a real button trigger. The tooltip supplements — the trigger keeps its own accessible name — and it shows on keyboard focus, not just pointer hover. For interactive content, use Popover instead."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Tab to a trigger — tooltips show on focus too."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="tooltip/basic.tsx"
            title="Basic"
            description="An icon-only trigger keeps its aria-label; the tooltip adds the visible hint."
          >
            <TooltipBasic />
          </ExampleBlock>
          <ExampleBlock
            file="tooltip/timing.tsx"
            title="Timing and placement"
            description="delay and closeDelay tune hover intent; placement and showArrow position the hint."
          >
            <TooltipTiming />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="tooltip/recipe-toolbar.tsx"
          title="Formatting toolbar with shortcut hints"
          description="Tooltips in their strongest seat: an icon-only toolbar where each hint pairs the action name with its keyboard shortcut, while aria-label and aria-pressed keep the buttons fully accessible without the tooltip."
        >
          <TooltipRecipeToolbar />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="tooltip"
        importCode={`import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Tooltip coordinates timing; the trigger is a real Button and the content carries placement."
      >
        <PropsTable caption="Tooltip anatomy" rows={tooltipProps} />
      </DocsSection>
    </DocsPage>
  );
}
