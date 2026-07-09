import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState, type ReactNode } from "react";
import {
  DethinkProvider,
  Tabs,
  type TabsActivationMode,
  type TabsMotionPreset,
  type TabsOrientation,
  type TabsSize,
  type TabsValue,
  type TabsVariant,
} from "@dethink/components";

const sections = [
  {
    value: "overview",
    label: "Overview",
    body: "Workspace health, plan, and rollout readiness.",
  },
  {
    value: "members",
    label: "Members",
    body: "Admins, reviewers, and pending invitations.",
  },
  {
    value: "billing",
    label: "Billing",
    body: "Invoices, seat counts, and plan limits.",
  },
  {
    value: "security",
    label: "Security",
    body: "SSO, sessions, recovery, and audit settings.",
  },
] as const;

type DemoTabsProps = {
  activationMode?: TabsActivationMode;
  defaultValue?: TabsValue;
  disabled?: boolean;
  motionPreset?: TabsMotionPreset;
  orientation?: TabsOrientation;
  size?: TabsSize;
  variant?: TabsVariant;
};

function StoryFrame({
  children,
  density = "default",
  dir = "ltr",
  theme = "light",
}: {
  children: ReactNode;
  density?: "compact" | "default" | "comfortable";
  dir?: "ltr" | "rtl";
  theme?: "light" | "dark";
}) {
  return (
    <DethinkProvider
      density={density}
      dir={dir}
      theme={theme}
      className="border-border rounded-lg border p-6"
    >
      {children}
    </DethinkProvider>
  );
}

function DemoTabs({
  activationMode = "automatic",
  defaultValue = "overview",
  disabled = false,
  motionPreset = "standard",
  orientation = "horizontal",
  size = "md",
  variant = "pill",
}: DemoTabsProps) {
  return (
    <Tabs
      activationMode={activationMode}
      defaultValue={defaultValue}
      disabled={disabled}
      motionPreset={motionPreset}
      orientation={orientation}
      size={size}
      variant={variant}
      className={
        orientation === "vertical"
          ? "grid max-w-3xl gap-5 md:grid-cols-[12rem_minmax(0,1fr)]"
          : "max-w-3xl"
      }
    >
      <Tabs.List aria-label="Workspace sections">
        {sections.map((section) => (
          <Tabs.Trigger
            key={section.value}
            disabled={section.value === "security" && disabled}
            value={section.value}
          >
            {section.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className="min-w-0">
        {sections.map((section) => (
          <Tabs.Panel key={section.value} value={section.value}>
            <div className="border-border bg-background mt-2 rounded-lg border p-5">
              <h3 className="text-foreground text-base font-semibold">
                {section.label}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {section.body}
              </p>
            </div>
          </Tabs.Panel>
        ))}
      </div>
    </Tabs>
  );
}

function ControlledTabs() {
  const [value, setValue] = useState<TabsValue>("members");

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.value}
            type="button"
            data-active={value === section.value ? "true" : undefined}
            className="border-border text-muted-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground rounded-md border px-3 py-1 text-sm"
            onClick={() => setValue(section.value)}
          >
            {section.label}
          </button>
        ))}
      </div>
      <Tabs value={value} onValueChange={setValue} className="max-w-3xl">
        <Tabs.List aria-label="Controlled sections">
          {sections.map((section) => (
            <Tabs.Trigger key={section.value} value={section.value}>
              {section.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {sections.map((section) => (
          <Tabs.Panel key={section.value} forceMount value={section.value}>
            <p className="text-muted-foreground mt-4 text-sm leading-6">
              {section.body}
            </p>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  args: {
    activationMode: "automatic",
    motionPreset: "standard",
    orientation: "horizontal",
    size: "md",
    variant: "pill",
  },
  argTypes: {
    activationMode: {
      control: "inline-radio",
      options: ["automatic", "manual"],
    },
    motionPreset: {
      control: "inline-radio",
      options: ["none", "subtle", "standard", "expressive"],
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "inline-radio",
      options: ["pill", "line"],
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => (
    <StoryFrame>
      <DemoTabs {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole("tab", { name: "Billing" });

    await userEvent.click(billing);

    await expect(billing).toHaveAttribute("aria-selected", "true");
    await expect(
      canvas.getByRole("tabpanel", { name: "Billing" }),
    ).toBeVisible();
  },
};

export const Line: Story = {
  render: (args) => (
    <StoryFrame>
      <DemoTabs {...args} variant="line" />
    </StoryFrame>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <StoryFrame>
      <DemoTabs {...args} orientation="vertical" variant="line" />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const members = canvas.getByRole("tab", { name: "Members" });

    overview.focus();
    await userEvent.keyboard("{ArrowDown}");

    await expect(members).toHaveFocus();
  },
};

export const ManualActivation: Story = {
  render: (args) => (
    <StoryFrame>
      <DemoTabs {...args} activationMode="manual" />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const members = canvas.getByRole("tab", { name: "Members" });

    overview.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(members).toHaveFocus();
    await expect(overview).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Enter}");
    await expect(members).toHaveAttribute("aria-selected", "true");
  },
};

export const Controlled: Story = {
  render: () => (
    <StoryFrame>
      <ControlledTabs />
    </StoryFrame>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <StoryFrame>
      <DemoTabs {...args} motionPreset="none" />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("tablist").closest('[data-slot="tabs"]');

    await expect(root).toHaveAttribute("data-reduced-motion", "true");
  },
};

export const DensityAndRtl: Story = {
  render: (args) => (
    <StoryFrame density="compact" dir="rtl" theme="dark">
      <DemoTabs {...args} size="sm" />
    </StoryFrame>
  ),
};
