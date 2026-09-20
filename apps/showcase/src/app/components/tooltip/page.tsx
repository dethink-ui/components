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
  description: "Show a short hint when users hover over or focus a control.",
};

export default function TooltipPage() {
  return (
    <DocsPage
      name="Tooltip"
      description="Show a short hint when users hover over or focus a control."
    >
      <InstallationSection
        registryName="tooltip"
        importCode={`import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Tab to a trigger — tooltips show on focus too."
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
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="tooltip/recipe-toolbar.tsx"
          title="Formatting toolbar with shortcut hints"
          description="Tooltips in their strongest seat: an icon-only toolbar where each hint pairs the action name with its keyboard shortcut, while aria-label and aria-pressed keep the buttons fully accessible without the tooltip."
        >
          <TooltipRecipeToolbar />
        </ExampleBlock>
      </DocsSection>

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
