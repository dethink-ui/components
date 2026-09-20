import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DateTimePickerBasic } from "@/examples/date-time-picker/basic";
import { DateTimePickerGranularity } from "@/examples/date-time-picker/granularity";
import { DateTimePickerPresets } from "@/examples/date-time-picker/presets";
import { DateTimePickerTimeSelector } from "@/examples/date-time-picker/time-selector";
import { DateTimePickerZoned } from "@/examples/date-time-picker/zoned";
import { dateTimePickerProps } from "@/lib/props/date-time-picker";

export const metadata: Metadata = {
  title: "DateTimePicker",
  description: "Let users choose a date and time.",
};

export default function DateTimePickerPage() {
  return (
    <DocsPage
      name="DateTimePicker"
      description="Let users choose a date and time."
    >
      <InstallationSection
        registryName="date-time-picker"
        importCode={`import {
  DateTimePicker,
  type DateTimePickerValue,
} from "@dethink/components";
import { CalendarDateTime, parseZonedDateTime } from "@internationalized/date";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Tab through the segments or open the popover for the calendar, presets, and time selector."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="date-time-picker/basic.tsx"
            title="Basic"
            description="Open the calendar to choose a date and time together, or use the clock button to jump straight to time."
          >
            <DateTimePickerBasic />
          </ExampleBlock>
          <ExampleBlock
            file="date-time-picker/granularity.tsx"
            title="Granularity and hour cycle"
            description="granularity trims or extends the time segments, and hourCycle forces 12- or 24-hour display regardless of locale."
          >
            <DateTimePickerGranularity />
          </ExampleBlock>
          <ExampleBlock
            file="date-time-picker/zoned.tsx"
            title="Zoned value"
            description="A ZonedDateTime value carries its IANA zone — the field shows the zone and the serialized value keeps the offset."
          >
            <DateTimePickerZoned />
          </ExampleBlock>
          <ExampleBlock
            file="date-time-picker/presets.tsx"
            title="Presets"
            description="presets add one-click timestamps to the popover for common choices."
          >
            <DateTimePickerPresets />
          </ExampleBlock>
          <ExampleBlock
            file="date-time-picker/time-selector.tsx"
            title="Time selector"
            description="Quick picks every 15 minutes, with unavailable times disabled. Type any exact time using the hour and minute segments."
          >
            <DateTimePickerTimeSelector />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="DateTimePicker owns its field anatomy — pass a label instead of wrapping it in an external one."
      >
        <PropsTable caption="DateTimePicker props" rows={dateTimePickerProps} />
      </DocsSection>
    </DocsPage>
  );
}
