import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SliderMotionSpeed } from "@/examples/slider/motion-speed";
import { SliderPrecision } from "@/examples/slider/precision";
import { SliderBudget } from "@/examples/slider/budget";
import { SliderStates } from "@/examples/slider/states";
import { SliderStepper } from "@/examples/slider/stepper";
import { sliderProps } from "@/lib/props/slider";
import { SliderVertical } from "@/examples/slider/vertical";

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
            file="slider/vertical.tsx"
            title="Vertical controls"
            description="A compact mixer, temperature range and named focus presets. Values increase upward in both reading directions."
          >
            <SliderVertical />
          </ExampleBlock>
          <ExampleBlock
            file="slider/motion-speed.tsx"
            title="Motion speed"
            description="An inset control with a little spring. Choose a pace and watch the orbit respond; reduced-motion preferences start the preview paused."
          >
            <SliderMotionSpeed />
          </ExampleBlock>
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
            description="Four sizes, including an XL inset thumb, disabled state, compact density, and right-to-left layout."
          >
            <SliderStates />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="theming" title="Theming and expressive motion">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Semantic primary, muted, border, background and ring tokens follow
          your theme. Customize track, fill, thumb, marks and output with
          classNames. XL keeps the thumb inside a pill-shaped rail, including at
          the endpoints. Floating outputs retain an inline summary so values
          remain readable on small screens.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          The basic Slider supports a static expressive variant without Motion.
          Install the optional slider-expressive registry item and import
          ExpressiveSlider for thumb compression and milestone pulses. Only
          decoration springs; the thumb always follows your pointer directly.
          Reduced motion removes the animation.
        </p>
        <p className="mt-3 text-sm">
          <a
            className="underline underline-offset-4"
            href="https://components.dethink.co.uk/r/slider-expressive.json"
          >
            Expressive Slider registry item
          </a>
        </p>
        <pre className="bg-muted mt-3 overflow-x-auto rounded-lg p-4 text-xs">
          <code>
            {
              'npx shadcn@latest add https://components.dethink.co.uk/r/slider-expressive.json\n\nimport { ExpressiveSlider } from "@dethink/components";'
            }
          </code>
        </pre>
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
