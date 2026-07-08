import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DethinkProvider,
  defineDethinkTheme,
} from "@dethink/components";

const brandTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.99 0.01 250)",
      foreground: "oklch(0.18 0.04 255)",
      muted: "oklch(0.94 0.03 250)",
      mutedForeground: "oklch(0.42 0.06 255)",
      border: "oklch(0.84 0.04 250)",
      input: "oklch(0.88 0.03 250)",
      ring: "oklch(0.56 0.2 255)",
      primary: "oklch(0.52 0.2 255)",
      primaryForeground: "oklch(0.99 0.01 250)",
      success: "oklch(0.57 0.16 150)",
      successForeground: "oklch(0.99 0.01 150)",
      warning: "oklch(0.74 0.16 78)",
      warningForeground: "oklch(0.2 0.04 78)",
      info: "oklch(0.58 0.18 230)",
      infoForeground: "oklch(0.99 0.01 230)",
    },
    dark: {
      background: "oklch(0.17 0.04 255)",
      foreground: "oklch(0.96 0.02 250)",
      muted: "oklch(0.25 0.05 255)",
      mutedForeground: "oklch(0.76 0.05 250)",
      border: "oklch(0.34 0.05 255)",
      input: "oklch(0.31 0.05 255)",
      ring: "oklch(0.72 0.16 250)",
      primary: "oklch(0.72 0.16 250)",
      primaryForeground: "oklch(0.16 0.04 255)",
    },
  },
  density: {
    compact: {
      control: "1.875rem",
      gap: "0.375rem",
    },
    comfortable: {
      control: "3rem",
      gap: "0.875rem",
    },
  },
  fonts: {
    body: "Inter, ui-sans-serif, system-ui, sans-serif",
    heading: "Sora, Inter, ui-sans-serif, system-ui, sans-serif",
    mono: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace",
  },
  radii: {
    sm: "0.375rem",
    md: "0.625rem",
    lg: "0.875rem",
  },
  spacing: {
    "2": "0.625rem",
    "4": "1.125rem",
    "6": "1.75rem",
  },
});

const nestedTheme = defineDethinkTheme({
  colorSchemes: {
    dark: {
      background: "oklch(0.15 0.05 155)",
      foreground: "oklch(0.96 0.02 155)",
      muted: "oklch(0.23 0.05 155)",
      mutedForeground: "oklch(0.75 0.05 155)",
      border: "oklch(0.34 0.05 155)",
      input: "oklch(0.31 0.05 155)",
      ring: "oklch(0.72 0.15 155)",
      primary: "oklch(0.7 0.15 155)",
      primaryForeground: "oklch(0.13 0.04 155)",
    },
  },
  fonts: {
    heading: "Avenir Next, Inter, ui-sans-serif, system-ui, sans-serif",
  },
});

function ProviderSample({ title }: { title: string }) {
  return (
    <div className="grid gap-[var(--dt-space-4)]">
      <div>
        <h2 className="font-heading text-xl leading-tight font-semibold">
          {title}
        </h2>
        <p className="text-muted-foreground mt-[var(--dt-space-1)] text-sm">
          Semantic tokens cascade through component color, typography, spacing,
          radius, and density.
        </p>
      </div>
      <div className="gap-density-gap flex flex-wrap items-center">
        <Button>Primary action</Button>
        <Button variant="outline">Secondary</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pipeline health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground grid gap-[var(--dt-space-2)] text-sm">
            <div className="flex items-center justify-between gap-[var(--dt-space-4)]">
              <span>Escalations</span>
              <span className="text-foreground font-mono">12</span>
            </div>
            <div className="flex items-center justify-between gap-[var(--dt-space-4)]">
              <span>Automation coverage</span>
              <span className="text-success font-mono">84%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const meta = {
  title: "Foundation/DethinkProvider",
  component: DethinkProvider,
  args: {
    theme: "light",
    density: "default",
    dir: "ltr",
  },
  argTypes: {
    theme: {
      control: "inline-radio",
      options: ["light", "dark", "system"],
    },
    density: {
      control: "inline-radio",
      options: ["compact", "default", "comfortable"],
    },
    dir: {
      control: "inline-radio",
      options: ["ltr", "rtl"],
    },
  },
} satisfies Meta<typeof DethinkProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BaseTheme: Story = {
  render: (args) => (
    <DethinkProvider
      {...args}
      className="border-border min-h-48 rounded-lg border p-[var(--dt-space-6)]"
    >
      <div className="space-y-density-gap">
        <h2 className="font-heading text-xl font-semibold">
          Dethink foundation
        </h2>
        <p className="text-muted-foreground">
          Token-backed Tailwind utilities drive theme, density, and focus
          styles.
        </p>
        <button
          type="button"
          className="h-density-control bg-primary text-primary-foreground rounded-md px-[var(--dt-space-4)]"
        >
          Token smoke target
        </button>
      </div>
    </DethinkProvider>
  ),
};

export const CustomBrandTheme: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      themeConfig={brandTheme}
      className="border-border bg-background rounded-lg border p-[var(--dt-space-6)]"
    >
      <ProviderSample title="Custom brand tokens" />
    </DethinkProvider>
  ),
};

export const CustomSpacingAndRadius: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      themeConfig={brandTheme}
      className="border-border bg-background rounded-lg border p-[var(--dt-space-6)]"
    >
      <div className="grid gap-[var(--dt-space-6)]">
        <ProviderSample title="Expanded spacing scale" />
        <div className="border-border bg-muted text-muted-foreground rounded-lg border p-[var(--dt-space-4)] text-sm">
          This panel uses provider radius and spacing variables through Tailwind
          tokens.
        </div>
      </div>
    </DethinkProvider>
  ),
};

export const NestedThemes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      themeConfig={brandTheme}
      className="border-border bg-background grid gap-[var(--dt-space-6)] rounded-lg border p-[var(--dt-space-6)]"
    >
      <ProviderSample title="Outer theme" />
      <DethinkProvider
        theme="dark"
        themeConfig={nestedTheme}
        className="border-border bg-background rounded-lg border p-[var(--dt-space-6)]"
      >
        <ProviderSample title="Nested dark theme" />
      </DethinkProvider>
    </DethinkProvider>
  ),
};

export const DensityModes: Story = {
  render: () => (
    <div className="grid gap-[var(--dt-space-4)] lg:grid-cols-3">
      {(["compact", "default", "comfortable"] as const).map((density) => (
        <DethinkProvider
          key={density}
          density={density}
          theme="light"
          themeConfig={brandTheme}
          className="border-border bg-background rounded-lg border p-[var(--dt-space-6)]"
        >
          <ProviderSample title={density} />
        </DethinkProvider>
      ))}
    </div>
  ),
};

export const SystemMode: Story = {
  render: () => (
    <DethinkProvider
      theme="system"
      themeConfig={brandTheme}
      className="border-border bg-background rounded-lg border p-[var(--dt-space-6)]"
    >
      <ProviderSample title="System color mode" />
    </DethinkProvider>
  ),
};
