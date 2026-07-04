import { CalendarDate } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  DateRangePicker,
  DethinkProvider,
  Stack,
  Text,
  defineDethinkTheme,
  type DethinkDensity,
  type DethinkTheme,
  type DethinkThemeConfig,
} from "@dethink/components";

type StoryArgs = {
  density?: DethinkDensity;
};

const meta = {
  title: "Components/DateRangePicker",
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

const rangeTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.985 0.014 120)",
      foreground: "oklch(0.19 0.045 140)",
      muted: "oklch(0.92 0.035 125)",
      mutedForeground: "oklch(0.4 0.055 150)",
      border: "oklch(0.8 0.045 130)",
      input: "oklch(0.84 0.04 130)",
      ring: "oklch(0.55 0.16 150)",
      primary: "oklch(0.48 0.16 150)",
      primaryForeground: "oklch(0.99 0.01 145)",
      destructive: "oklch(0.58 0.21 25)",
      destructiveForeground: "oklch(0.99 0.01 25)",
      success: "oklch(0.54 0.15 145)",
      successForeground: "oklch(0.99 0.01 145)",
      warning: "oklch(0.76 0.16 85)",
      warningForeground: "oklch(0.2 0.04 85)",
      info: "oklch(0.58 0.15 235)",
      infoForeground: "oklch(0.99 0.01 235)",
    },
    dark: {
      background: "oklch(0.16 0.04 148)",
      foreground: "oklch(0.96 0.018 135)",
      muted: "oklch(0.25 0.045 148)",
      mutedForeground: "oklch(0.73 0.045 140)",
      border: "oklch(0.34 0.055 148)",
      input: "oklch(0.31 0.055 148)",
      ring: "oklch(0.72 0.13 150)",
      primary: "oklch(0.72 0.13 150)",
      primaryForeground: "oklch(0.13 0.035 148)",
      success: "oklch(0.7 0.14 145)",
      successForeground: "oklch(0.12 0.03 145)",
      warning: "oklch(0.8 0.15 85)",
      warningForeground: "oklch(0.14 0.03 85)",
      info: "oklch(0.74 0.13 235)",
      infoForeground: "oklch(0.13 0.035 235)",
    },
  },
  radii: {
    md: "0.75rem",
  },
});

function StoryShell({
  children,
  density = "default",
  dir = "ltr",
  theme = "light",
  themeConfig,
}: {
  children: ReactNode;
  density?: DethinkDensity;
  dir?: "ltr" | "rtl";
  theme?: DethinkTheme;
  themeConfig?: DethinkThemeConfig;
}) {
  return (
    <DethinkProvider
      className="min-h-[28rem] bg-background p-6 text-foreground"
      density={density}
      dir={dir}
      theme={theme}
      themeConfig={themeConfig}
    >
      {children}
    </DethinkProvider>
  );
}

function StoryFrame({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Stack className="max-w-3xl" gap="4">
      <Stack gap="1">
        <Text weight="semibold">{title}</Text>
        <Text size="sm" tone="muted">
          {description}
        </Text>
      </Stack>
      {children}
    </Stack>
  );
}

const julyRange = {
  end: new CalendarDate(2026, 7, 18),
  start: new CalendarDate(2026, 7, 8),
};

export const Base: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <StoryFrame
        title="Report range"
        description="Start and end segmented fields share one range calendar overlay."
      >
        <DateRangePicker
          clearable
          defaultValue={julyRange}
          description="Exports include records updated inside the selected window."
          label="Report range"
          name="reportRange"
        />
      </StoryFrame>
    </StoryShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Open calendar" }));
    await expect(await page.findByRole("grid")).toBeVisible();
  },
};

export const ConstraintsAndInvalid: Story = {
  args: {
    density: "compact",
  },
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <div className="grid gap-5 md:grid-cols-2">
        <DateRangePicker
          clearable
          defaultValue={julyRange}
          description="Weekends and July 4 are unavailable."
          isDateUnavailable={(date) =>
            date.day === 4 || date.toDate("UTC").getUTCDay() === 0
          }
          label="Billing cycle"
          maxValue={new CalendarDate(2026, 7, 31)}
          minValue={new CalendarDate(2026, 7, 1)}
          name="billingCycle"
        />
        <DateRangePicker
          errorMessage="Select both start and end dates."
          invalid
          label="Audit range"
          required
        />
      </div>
    </StoryShell>
  ),
};

export const CustomFieldNames: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <DateRangePicker
        clearable
        defaultValue={julyRange}
        description="Explicit names support backend contracts that do not use the default Start and End suffixes."
        endName="closedAfter"
        label="Opportunity close range"
        startName="closedBefore"
      />
    </StoryShell>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <StoryShell density="compact" theme="dark">
        <DateRangePicker
          clearable
          defaultValue={julyRange}
          label="Compact dark"
          name="compactRange"
          weekStartsOn="mon"
        />
      </StoryShell>
      <StoryShell density="comfortable" dir="rtl" theme="light">
        <DateRangePicker
          clearable
          defaultValue={{
            end: new CalendarDate(2026, 8, 24),
            start: new CalendarDate(2026, 8, 18),
          }}
          label="RTL comfortable"
          locale="ar-AE"
          name="rtlRange"
          weekStartsOn="sat"
        />
      </StoryShell>
    </div>
  ),
};

export const ThemeOverrides: Story = {
  render: () => (
    <StoryShell density="comfortable" theme="dark" themeConfig={rangeTheme}>
      <DateRangePicker
        clearable
        defaultValue={{
          end: new CalendarDate(2026, 10, 23),
          start: new CalendarDate(2026, 10, 12),
        }}
        description="Range fill, endpoints, field border, and overlay surface use provider tokens."
        label="Campaign window"
        name="campaignWindow"
      />
    </StoryShell>
  ),
};
