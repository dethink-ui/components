import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { CalendarBasic } from "@/examples/calendar/basic";
import { CalendarBounds } from "@/examples/calendar/bounds";
import { CalendarLocale } from "@/examples/calendar/locale";
import { CalendarRange } from "@/examples/calendar/range";
import { calendarProps } from "@/lib/props/calendar";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Let users choose a date or date range from a month view.",
};

export default function CalendarPage() {
  return (
    <DocsPage
      name="Calendar"
      description="Let users choose a date or date range from a month view."
    >
      <InstallationSection
        registryName="calendar"
        importCode={`import { Calendar, RangeCalendar } from "@dethink/components";
import { CalendarDate } from "@internationalized/date";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Move focus into a grid and navigate with the arrow keys, PageUp/PageDown for months, and Enter or Space to select."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="calendar/basic.tsx"
            title="Single date"
            description="A controlled Calendar — value and onValueChange pair with React state holding a CalendarDate."
          >
            <CalendarBasic />
          </ExampleBlock>
          <ExampleBlock
            file="calendar/range.tsx"
            title="Range"
            description="RangeCalendar selects a start and end date in one grid; the value is a { start, end } pair."
          >
            <CalendarRange />
          </ExampleBlock>
          <ExampleBlock
            file="calendar/bounds.tsx"
            title="Bounds and unavailable dates"
            description="minValue and maxValue clamp selection to a window, while isDateUnavailable strikes out individual dates — here, weekends."
          >
            <CalendarBounds />
          </ExampleBlock>
          <ExampleBlock
            file="calendar/locale.tsx"
            title="Locale and week start"
            description="locale drives month and weekday formatting, weekStartsOn overrides the first day of the week, and weekdayStyle switches the header format."
          >
            <CalendarLocale />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Calendar and RangeCalendar share the same API; RangeCalendar's value shape is { start, end }. Always give each calendar an aria-label (or aria-labelledby) describing what is being picked."
      >
        <PropsTable
          caption="Calendar and RangeCalendar props"
          rows={calendarProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
