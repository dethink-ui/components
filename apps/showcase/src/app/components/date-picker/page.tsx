import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DatePickerBasic } from "@/examples/date-picker/basic";
import { DatePickerBounds } from "@/examples/date-picker/bounds";
import { DatePickerControlled } from "@/examples/date-picker/controlled";
import { DatePickerStates } from "@/examples/date-picker/states";
import { datePickerProps } from "@/lib/props/date-picker";

export const metadata: Metadata = {
  title: "DatePicker",
  description: "Let users type a date or choose one from a calendar.",
};

export default function DatePickerPage() {
  return (
    <DocsPage
      name="DatePicker"
      description="Let users type a date or choose one from a calendar."
    >
      <InstallationSection
        registryName="date-picker"
        importCode={`import { DatePicker, type DatePickerValue } from "@dethink/components";
import { CalendarDate } from "@internationalized/date";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Tab into a field to edit segments with the arrow keys or by typing, and press the calendar button to open the popover."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="date-picker/basic.tsx"
            title="Basic"
            description="Label, helper description, and a name for native form submission — the uncontrolled default."
          >
            <DatePickerBasic />
          </ExampleBlock>
          <ExampleBlock
            file="date-picker/controlled.tsx"
            title="Controlled and clearable"
            description="value and onValueChange pair with React state; clearable adds a clear button whenever a date is set."
          >
            <DatePickerControlled />
          </ExampleBlock>
          <ExampleBlock
            file="date-picker/states.tsx"
            title="Form states"
            description="Required, disabled, read-only, and invalid with an error message — each state styles the field, segments, and popover trigger consistently."
          >
            <DatePickerStates />
          </ExampleBlock>
          <ExampleBlock
            file="date-picker/bounds.tsx"
            title="Bounds and unavailable dates"
            description="minValue/maxValue clamp selection while isDateUnavailable blocks individual dates in the popover calendar."
          >
            <DatePickerBounds />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="DatePicker owns its field anatomy — pass a label instead of wrapping it in an external one."
      >
        <PropsTable caption="DatePicker props" rows={datePickerProps} />
      </DocsSection>
    </DocsPage>
  );
}
