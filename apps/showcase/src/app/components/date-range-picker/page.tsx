import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DateRangePickerBasic } from "@/examples/date-range-picker/basic";
import { DateRangePickerBounds } from "@/examples/date-range-picker/bounds";
import { DateRangePickerControlled } from "@/examples/date-range-picker/controlled";
import { DateRangePickerForm } from "@/examples/date-range-picker/form";
import { dateRangePickerProps } from "@/lib/props/date-range-picker";

export const metadata: Metadata = {
  title: "DateRangePicker",
  description:
    "Capture start and end dates with linked segments, a range calendar popover, and native start/end form fields.",
};

export default function DateRangePickerPage() {
  return (
    <DocsPage
      name="DateRangePicker"
      description="A single field for a start–end pair: two linked segmented inputs, one popover range calendar, and hidden inputs that submit both ISO dates in native forms. The value is a { start, end } pair of CalendarDate objects."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Tab through the start and end segments, or open the popover and pick both ends on the range calendar."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="date-range-picker/basic.tsx"
            title="Basic"
            description="Label and helper description around the linked start–end field — the uncontrolled default."
          >
            <DateRangePickerBasic />
          </ExampleBlock>
          <ExampleBlock
            file="date-range-picker/controlled.tsx"
            title="Controlled and clearable"
            description="value and onValueChange hold the { start, end } pair in React state; clearable resets the whole range at once."
          >
            <DateRangePickerControlled />
          </ExampleBlock>
          <ExampleBlock
            file="date-range-picker/form.tsx"
            title="Native form submission"
            description="startName and endName name the hidden inputs, so a plain FormData read gets both ISO dates."
          >
            <DateRangePickerForm />
          </ExampleBlock>
          <ExampleBlock
            file="date-range-picker/bounds.tsx"
            title="Bounds"
            description="minValue and maxValue clamp both ends of the range to a window."
          >
            <DateRangePickerBounds />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="date-range-picker"
        importCode={`import {
  DateRangePicker,
  type DateRangePickerValue,
} from "@dethink/components";
import { CalendarDate } from "@internationalized/date";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="DateRangePicker owns its field anatomy — pass a label instead of wrapping it in an external one."
      >
        <PropsTable caption="DateRangePicker props" rows={dateRangePickerProps} />
      </DocsSection>
    </DocsPage>
  );
}
