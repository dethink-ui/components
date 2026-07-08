import { CalendarDate } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  Calendar,
  DethinkProvider,
  RangeCalendar,
  Stack,
  Text,
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
  title: "Components/Calendar",
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

const themedDateSurface = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.985 0.018 210)",
      foreground: "oklch(0.2 0.045 235)",
      muted: "oklch(0.93 0.03 205)",
      mutedForeground: "oklch(0.42 0.055 235)",
      border: "oklch(0.82 0.045 215)",
      input: "oklch(0.84 0.04 215)",
      ring: "oklch(0.58 0.18 255)",
      primary: "oklch(0.52 0.19 255)",
      primaryForeground: "oklch(0.99 0.01 235)",
      destructive: "oklch(0.58 0.21 25)",
      destructiveForeground: "oklch(0.99 0.01 25)",
      success: "oklch(0.54 0.15 150)",
      successForeground: "oklch(0.99 0.01 150)",
      warning: "oklch(0.76 0.16 85)",
      warningForeground: "oklch(0.2 0.04 85)",
      info: "oklch(0.6 0.17 255)",
      infoForeground: "oklch(0.99 0.01 255)",
    },
    dark: {
      background: "oklch(0.16 0.04 238)",
      foreground: "oklch(0.96 0.018 218)",
      muted: "oklch(0.25 0.05 238)",
      mutedForeground: "oklch(0.74 0.045 220)",
      border: "oklch(0.34 0.055 238)",
      input: "oklch(0.31 0.055 238)",
      ring: "oklch(0.73 0.14 255)",
      primary: "oklch(0.74 0.14 255)",
      primaryForeground: "oklch(0.15 0.04 238)",
      success: "oklch(0.7 0.14 150)",
      successForeground: "oklch(0.12 0.03 150)",
      warning: "oklch(0.8 0.15 85)",
      warningForeground: "oklch(0.14 0.03 85)",
      info: "oklch(0.75 0.14 255)",
      infoForeground: "oklch(0.13 0.035 255)",
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
        "bg-background text-foreground min-h-[28rem] p-6",
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
    <Stack gap="4">
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

export const Base: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <StoryFrame
        title="Invoice close"
        description="Single-date calendar with tokenized navigation and selected-day states."
      >
        <Calendar
          aria-label="Invoice close date"
          defaultValue={new CalendarDate(2026, 7, 8)}
        />
      </StoryFrame>
    </StoryShell>
  ),
};

export const Range: Story = {
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <StoryFrame
        title="Billing window"
        description="Range selection keeps start, middle, and end states visually distinct."
      >
        <RangeCalendar
          aria-label="Billing window"
          defaultValue={{
            end: new CalendarDate(2026, 7, 15),
            start: new CalendarDate(2026, 7, 8),
          }}
        />
      </StoryFrame>
    </StoryShell>
  ),
};

export const Constraints: Story = {
  args: {
    density: "compact",
  },
  render: ({ density = "default" }) => (
    <StoryShell density={density}>
      <div className="grid gap-5 md:grid-cols-2">
        <StoryFrame
          title="Deployment date"
          description="Weekends and July 4 are unavailable."
        >
          <Calendar
            aria-label="Deployment date"
            defaultValue={new CalendarDate(2026, 7, 9)}
            isDateUnavailable={(date) =>
              date.day === 4 || date.toDate("UTC").getUTCDay() === 0
            }
            maxValue={new CalendarDate(2026, 7, 20)}
            minValue={new CalendarDate(2026, 7, 1)}
          />
        </StoryFrame>
        <StoryFrame
          title="Invalid range"
          description="Invalid state is carried by the root and date cells."
        >
          <RangeCalendar
            aria-label="Invalid reporting range"
            defaultValue={{
              end: new CalendarDate(2026, 7, 4),
              start: new CalendarDate(2026, 7, 2),
            }}
            invalid
            maxValue={new CalendarDate(2026, 7, 20)}
            minValue={new CalendarDate(2026, 7, 1)}
          />
        </StoryFrame>
      </div>
    </StoryShell>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <StoryShell density="compact" theme="dark">
        <Calendar
          aria-label="Compact dark calendar"
          defaultValue={new CalendarDate(2026, 8, 18)}
          weekStartsOn="mon"
        />
      </StoryShell>
      <StoryShell density="comfortable" dir="rtl" theme="light">
        <RangeCalendar
          aria-label="RTL range calendar"
          defaultValue={{
            end: new CalendarDate(2026, 8, 24),
            start: new CalendarDate(2026, 8, 18),
          }}
          locale="ar-AE"
          weekStartsOn="sat"
        />
      </StoryShell>
    </div>
  ),
};

export const ThemeOverrides: Story = {
  render: () => (
    <StoryShell
      className="bg-transparent"
      density="comfortable"
      theme="dark"
      themeConfig={themedDateSurface}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Calendar
          aria-label="Themed milestone date"
          defaultValue={new CalendarDate(2026, 9, 15)}
        />
        <RangeCalendar
          aria-label="Themed sprint range"
          defaultValue={{
            end: new CalendarDate(2026, 9, 24),
            start: new CalendarDate(2026, 9, 15),
          }}
        />
      </div>
    </StoryShell>
  ),
};
