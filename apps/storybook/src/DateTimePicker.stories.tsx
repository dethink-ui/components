import {
  CalendarDate,
  parseDateTime,
  parseZonedDateTime,
} from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DateTimePicker,
  DethinkProvider,
  defineDethinkTheme,
  type DateTimePickerPreset,
} from "@dethink/components";

const meta = {
  title: "Components/DateTimePicker",
  component: DateTimePicker,
  args: {
    label: "Start time",
    description: "Choose a date and time.",
    clearable: true,
    granularity: "minute",
    timeSelector: true,
    timeStep: 30,
  },
  argTypes: {
    granularity: {
      control: "inline-radio",
      options: ["hour", "minute", "second"],
    },
    hourCycle: {
      control: "inline-radio",
      options: [12, 24],
    },
    timeSelector: {
      control: "boolean",
    },
    timeStep: {
      control: "inline-radio",
      options: [5, 10, 15, 30, 60],
    },
    value: { control: false },
    defaultValue: { control: false },
    minValue: { control: false },
    maxValue: { control: false },
    isDateUnavailable: { control: false },
    presets: { control: false },
    timeOptions: { control: false },
    onValueChange: { action: "value changed" },
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const schedulingPresets: DateTimePickerPreset[] = [
  {
    label: "Today 09:00",
    value: parseDateTime("2026-06-30T09:00"),
  },
  {
    label: "Tomorrow 14:30",
    value: parseDateTime("2026-07-01T14:30"),
  },
  {
    label: "Friday 16:00",
    value: parseDateTime("2026-07-03T16:00"),
  },
  {
    label: "Monday 10:00",
    value: parseDateTime("2026-07-06T10:00"),
  },
];

const dateTimeTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.985 0.014 285)",
      foreground: "oklch(0.19 0.045 290)",
      muted: "oklch(0.92 0.035 285)",
      mutedForeground: "oklch(0.42 0.055 290)",
      border: "oklch(0.8 0.045 285)",
      input: "oklch(0.84 0.04 285)",
      ring: "oklch(0.58 0.17 300)",
      primary: "oklch(0.52 0.17 300)",
      primaryForeground: "oklch(0.99 0.01 290)",
      destructive: "oklch(0.58 0.21 25)",
      destructiveForeground: "oklch(0.99 0.01 25)",
      success: "oklch(0.54 0.15 145)",
      successForeground: "oklch(0.99 0.01 145)",
      warning: "oklch(0.76 0.16 85)",
      warningForeground: "oklch(0.2 0.04 85)",
      info: "oklch(0.58 0.15 240)",
      infoForeground: "oklch(0.99 0.01 240)",
    },
    dark: {
      background: "oklch(0.16 0.04 290)",
      foreground: "oklch(0.96 0.018 285)",
      muted: "oklch(0.25 0.045 290)",
      mutedForeground: "oklch(0.74 0.045 285)",
      border: "oklch(0.34 0.055 290)",
      input: "oklch(0.31 0.055 290)",
      ring: "oklch(0.72 0.14 300)",
      primary: "oklch(0.72 0.14 300)",
      primaryForeground: "oklch(0.14 0.035 290)",
      success: "oklch(0.7 0.14 145)",
      successForeground: "oklch(0.12 0.03 145)",
      warning: "oklch(0.8 0.15 85)",
      warningForeground: "oklch(0.14 0.03 85)",
      info: "oklch(0.74 0.13 240)",
      infoForeground: "oklch(0.13 0.035 240)",
    },
  },
  density: {
    comfortable: {
      control: "3rem",
      gap: "0.875rem",
    },
  },
  radii: {
    md: "0.75rem",
  },
});

const storyProviderClasses = "w-fit bg-background p-0";

export const SchedulingField: Story = {
  args: {
    defaultValue: parseDateTime("2026-06-30T09:30"),
    label: "Maintenance window",
    description: "Operations will notify affected accounts.",
    name: "maintenanceAt",
  },
  render: (args) => (
    <DethinkProvider theme="light" className={storyProviderClasses}>
      <DateTimePicker {...args} />
    </DethinkProvider>
  ),
};

export const TimezoneAwareEvent: Story = {
  render: () => (
    <DethinkProvider theme="dark" className={storyProviderClasses}>
      <DateTimePicker
        clearable
        defaultValue={parseZonedDateTime("2026-07-14T18:45[America/New_York]")}
        description="Displayed with the source timezone so global teams do not infer local time."
        granularity="minute"
        label="Investor briefing"
        name="briefingAt"
      />
    </DethinkProvider>
  ),
};

export const ConstraintsAndPresets: Story = {
  render: () => (
    <DethinkProvider theme="light" className={storyProviderClasses}>
      <DateTimePicker
        clearable
        defaultValue={parseDateTime("2026-07-02T11:00")}
        description="Weekends and July 4 are unavailable."
        isDateUnavailable={(date) =>
          date.day === 4 || date.toDate("UTC").getUTCDay() === 0
        }
        label="Deployment slot"
        maxValue={new CalendarDate(2026, 7, 10)}
        minValue={new CalendarDate(2026, 7, 1)}
        presets={schedulingPresets}
      />
    </DethinkProvider>
  ),
};

export const SelectableTimeSlots: Story = {
  render: () => (
    <DethinkProvider theme="light" className={storyProviderClasses}>
      <DateTimePicker
        clearable
        defaultValue={parseDateTime("2026-07-15T10:30")}
        description="Preset slots are available after a calendar date exists."
        granularity="minute"
        label="Customer call"
        name="customerCallAt"
        timeSelector
        timeOptions={[
          { hour: 9, label: "09:00", minute: 0 },
          { hour: 10, label: "10:30", minute: 30 },
          { hour: 13, label: "13:00", minute: 0 },
          { hour: 15, label: "15:30", minute: 30 },
          { hour: 17, label: "17:00", minute: 0 },
        ]}
      />
    </DethinkProvider>
  ),
};

export const BoundedTimePicker: Story = {
  args: {
    label: "Interview slot",
    defaultValue: parseDateTime("2026-07-14T10:15"),
    minValue: parseDateTime("2026-07-14T08:00"),
    maxValue: parseDateTime("2026-07-14T18:00"),
    hourCycle: 12,
    timeStep: 15,
    description: "Choose a time between 8 AM and 6 PM.",
  },
};

export const CalendarOnlyPopover: Story = {
  args: {
    label: "Scheduled time",
    defaultValue: parseDateTime("2026-07-14T10:15"),
    timeSelector: false,
    description: "Time remains editable in the main field.",
  },
};

export const RequiredInvalidField: Story = {
  render: () => (
    <DethinkProvider theme="light" className={storyProviderClasses}>
      <DateTimePicker
        clearable
        errorMessage="Select a launch review time before saving."
        invalid
        label="Launch review"
        required
      />
    </DethinkProvider>
  ),
};

export const LocaleAndHourCycle: Story = {
  render: () => (
    <DethinkProvider theme="light" className={storyProviderClasses}>
      <div className="grid gap-5 md:grid-cols-2">
        <DateTimePicker
          defaultValue={parseDateTime("2026-08-18T21:15")}
          hourCycle={12}
          label="US support handoff"
          locale="en-US"
        />
        <DateTimePicker
          defaultValue={parseDateTime("2026-08-18T21:15")}
          hourCycle={24}
          label="London support handoff"
          locale="en-GB"
        />
        <DateTimePicker
          defaultValue={parseDateTime("2026-08-18T21:15")}
          hourCycle={24}
          label="Paris support handoff"
          locale="fr-FR"
          weekStartsOn="mon"
        />
      </div>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <DethinkProvider
        density="compact"
        theme="dark"
        className={storyProviderClasses}
      >
        <DateTimePicker
          clearable
          defaultValue={parseZonedDateTime("2026-09-21T07:00[UTC]")}
          label="Compact dark"
          timeZone="UTC"
        />
      </DethinkProvider>
      <DethinkProvider
        density="comfortable"
        dir="rtl"
        theme="light"
        className={storyProviderClasses}
      >
        <DateTimePicker
          clearable
          defaultValue={parseDateTime("2026-09-21T15:45")}
          hourCycle={24}
          label="RTL comfortable"
          locale="ar-AE"
          weekStartsOn="sat"
        />
      </DethinkProvider>
    </div>
  ),
};

export const ThemeOverrides: Story = {
  render: () => (
    <DethinkProvider
      density="comfortable"
      theme="dark"
      themeConfig={dateTimeTheme}
      className={storyProviderClasses}
    >
      <DateTimePicker
        clearable
        defaultValue={parseDateTime("2026-11-12T14:30")}
        description="The field, calendar, time slots, focus ring, and selected states come from theme tokens."
        granularity="minute"
        label="Board review"
        name="boardReviewAt"
        timeSelector
        timeStep={15}
      />
    </DethinkProvider>
  ),
};
