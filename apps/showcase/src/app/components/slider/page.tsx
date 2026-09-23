import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SliderPrecision } from "@/examples/slider/precision";
import { SliderBudget } from "@/examples/slider/budget";
import { SliderStates } from "@/examples/slider/states";
import { SliderStepper } from "@/examples/slider/stepper";
import { sliderProps } from "@/lib/props/slider";

export const metadata: Metadata = {
  title: "Slider",
  description:
    "Choose a value, find a range, or snap to a meaningful milestone.",
};
export default function SliderPage() {
  return (
    <DocsPage
      name="Slider"
      description="Choose a value, find a range, or snap to a meaningful milestone."
    >
      <InstallationSection
        registryName="slider"
        importCode={'import { Slider } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Drag, click the track, or use your keyboard. Every adjustment stays precise."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="slider/stepper.tsx"
            title="Labelled steps"
            description="Named milestones snap to evenly spaced stops. The app receives the original numeric values, including uneven increments."
          >
            <SliderStepper />
          </ExampleBlock>
          <ExampleBlock
            file="slider/budget.tsx"
            title="Budget range"
            description="Two independently labelled thumbs keep minimum and maximum values in order."
          >
            <SliderBudget />
          </ExampleBlock>
          <ExampleBlock
            file="slider/precision.tsx"
            title="Precision control"
            description="Quarter-step adjustments with separate change and commit feedback."
          >
            <SliderPrecision />
          </ExampleBlock>
          <ExampleBlock
            file="slider/states.tsx"
            title="Sizes and states"
            description="Three sizes, disabled state, compact density, and right-to-left layout."
          >
            <SliderStates />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="props" title="Props">
        <PropsTable caption="Slider API" rows={sliderProps} />
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          Give every slider a visible label or an accessible name. Tab focuses
          each thumb; arrow keys adjust values, and Home/End reach the available
          bounds. Range thumbs cannot cross. Touch and pointer targets remain at
          least 44 pixels even with the small visual size. Descriptions provide
          additional context.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
