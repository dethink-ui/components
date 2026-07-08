import { CalendarDate } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  DatePicker,
  DethinkProvider,
  cn,
  defineDethinkTheme,
  type DethinkDensity,
  type DethinkTheme,
  type DethinkThemeConfig,
} from "@dethink/components";

type StoryArgs = {
  density?: DethinkDensity;
};

const meta = {
  title: "Components/DatePicker",
  args: {
    density: "default",
  },
  argTypes: {
    density: {
      control: "inline-radio",
      options: ["compact", "default", "comfortable"],
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;

type Story = StoryObj<StoryArgs>;

const datePickerTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.985 0.018 185)",
      foreground: "oklch(0.18 0.045 195)",
      muted: "oklch(0.92 0.035 185)",
      mutedForeground: "oklch(0.4 0.055 205)",
      border: "oklch(0.8 0.045 190)",
      input: "oklch(0.84 0.04 190)",
      ring: "oklch(0.56 0.17 205)",
      primary: "oklch(0.5 0.17 205)",
      primaryForeground: "oklch(0.99 0.01 195)",
      destructive: "oklch(0.58 0.21 25)",
      destructiveForeground: "oklch(0.99 0.01 25)",
      success: "oklch(0.54 0.15 145)",
      successForeground: "oklch(0.99 0.01 145)",
      warning: "oklch(0.76 0.16 85)",
      warningForeground: "oklch(0.2 0.04 85)",
      info: "oklch(0.58 0.15 240)",
      infoForeground: "oklch(0.99 0.01 240)",
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

const datePickerStoryClasses = "w-fit max-w-none";
const tightStoryShellClasses = "min-h-0 w-fit bg-transparent p-0";

function StoryShell({
  children,
  className,
  density = "default",
  dir = "ltr",
  theme = "light",
  themeConfig,
}: {
  children: ReactNode;
  className?: string;
  density?: DethinkDensity;
  dir?: "ltr" | "rtl";
  theme?: DethinkTheme;
  themeConfig?: DethinkThemeConfig;
}) {
  return (
    <DethinkProvider
      className={cn(
        "text-foreground min-h-0 w-fit bg-transparent p-0",
        className,
      )}
      density={density}
      dir={dir}
      theme={theme}
      themeConfig={themeConfig}
    >
      {children}
    </DethinkProvider>
  );
}

export const Base: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <DatePicker
        clearable
        className={datePickerStoryClasses}
        defaultValue={new CalendarDate(2026, 7, 14)}
        description="The account owner sees this date in renewal workflows."
        label="Renewal date"
        name="renewalDate"
      />
    </StoryShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole("button", { name: "Open calendar" }),
    );
    await expect(await page.findByRole("grid")).toBeVisible();
  },
};

export const ConstraintsAndInvalid: Story = {
  args: {
    density: "compact",
  },
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <div className="flex w-fit flex-wrap gap-4">
        <DatePicker
          clearable
          className={datePickerStoryClasses}
          defaultValue={new CalendarDate(2026, 7, 8)}
          description="Weekends and July 4 are unavailable."
          isDateUnavailable={(date) =>
            date.day === 4 || date.toDate("UTC").getUTCDay() === 0
          }
          label="Deployment date"
          maxValue={new CalendarDate(2026, 7, 20)}
          minValue={new CalendarDate(2026, 7, 1)}
          name="deploymentDate"
        />
        <DatePicker
          className={datePickerStoryClasses}
          errorMessage="Select a review date before continuing."
          invalid
          label="Review date"
          required
        />
      </div>
    </StoryShell>
  ),
};

export const FormSerialization: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <form className="grid w-fit gap-4">
        <DatePicker
          clearable
          className={datePickerStoryClasses}
          defaultValue={new CalendarDate(2026, 8, 3)}
          label="Contract start"
          name="contractStart"
        />
        <DatePicker
          clearable
          className={datePickerStoryClasses}
          defaultValue={new CalendarDate(2026, 8, 28)}
          label="Contract review"
          name="contractReview"
        />
      </form>
    </StoryShell>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="flex w-fit flex-wrap gap-4">
      <StoryShell className="bg-background" density="compact" theme="dark">
        <DatePicker
          clearable
          className={datePickerStoryClasses}
          defaultValue={new CalendarDate(2026, 9, 10)}
          label="Compact dark"
          name="compactDate"
          weekStartsOn="mon"
        />
      </StoryShell>
      <StoryShell density="comfortable" dir="rtl" theme="light">
        <DatePicker
          clearable
          className={datePickerStoryClasses}
          defaultValue={new CalendarDate(2026, 9, 10)}
          label="RTL comfortable"
          locale="ar-AE"
          name="rtlDate"
          weekStartsOn="sat"
        />
      </StoryShell>
    </div>
  ),
};

export const ThemeOverrides: Story = {
  render: () => (
    <StoryShell
      className={tightStoryShellClasses}
      density="comfortable"
      theme="light"
      themeConfig={datePickerTheme}
    >
      <DatePicker
        clearable
        className={datePickerStoryClasses}
        defaultValue={new CalendarDate(2026, 10, 12)}
        description="Theme tokens change the field, overlay, selected day, and focus states."
        label="Customer kickoff"
        name="kickoffDate"
      />
    </StoryShell>
  ),
};
