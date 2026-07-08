import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useState } from "react";
import {
  DethinkProvider,
  HorizontalAccordion,
  type HorizontalAccordionProps,
  type HorizontalAccordionValue,
} from "@dethink/components";

function CompassIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m14.8 9.2-1.9 4.7-3.7 1.9 1.9-4.7 3.7-1.9Z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M4 19V5M4 19h16M8 15v-4m4 4V8m4 7v-6" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

const sections = [
  {
    value: "overview",
    label: "Overview",
    icon: <CompassIcon />,
    title: "Product overview",
    body: "Every section stays visible as a compact blade while the active section expands to fill the remaining width.",
  },
  {
    value: "metrics",
    label: "Metrics",
    icon: <ChartIcon />,
    title: "Usage metrics",
    body: "Panels keep their state mounted by default, so charts and forms survive switching sections.",
  },
  {
    value: "integrations",
    label: "Integrations",
    icon: <LayersIcon />,
    title: "Integrations",
    body: "The active highlight glides between blades as a shared Motion layout element.",
  },
] as const;

function PanelBody({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-background flex h-full flex-col justify-center gap-2 p-6">
      <h3 className="text-foreground text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground max-w-md text-sm">{body}</p>
    </div>
  );
}

function DemoAccordion(props: Partial<HorizontalAccordionProps>) {
  return (
    <HorizontalAccordion
      aria-label="Product sections"
      className="border-border rounded-lg border"
      height={320}
      {...props}
    >
      {sections.map((section) => (
        <HorizontalAccordion.Item key={section.value} value={section.value}>
          <HorizontalAccordion.Blade>
            <HorizontalAccordion.BladeIcon>
              {section.icon}
            </HorizontalAccordion.BladeIcon>
            <HorizontalAccordion.BladeLabel>
              {section.label}
            </HorizontalAccordion.BladeLabel>
          </HorizontalAccordion.Blade>
          <HorizontalAccordion.Panel>
            <PanelBody body={section.body} title={section.title} />
          </HorizontalAccordion.Panel>
        </HorizontalAccordion.Item>
      ))}
    </HorizontalAccordion>
  );
}

const meta = {
  title: "Components/HorizontalAccordion",
  component: HorizontalAccordion,
  args: {
    collapsible: true,
    activationMode: "manual",
    bladeWidth: 72,
    height: 320,
  },
  argTypes: {
    activationMode: {
      control: "inline-radio",
      options: ["manual", "automatic"],
    },
    collapsible: { control: "boolean" },
    bladeWidth: { control: { type: "number", min: 48, max: 160 } },
    height: { control: { type: "number", min: 200, max: 640 } },
    unmountInactivePanels: { control: "boolean" },
  },
} satisfies Meta<typeof HorizontalAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => <DemoAccordion {...args} defaultValue="overview" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const metricsBlade = canvas.getByRole("button", { name: "Metrics" });

    await userEvent.click(metricsBlade);
    await waitFor(() =>
      expect(canvas.getByText("Usage metrics")).toBeVisible(),
    );
    await expect(metricsBlade).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(metricsBlade);
    await expect(metricsBlade).toHaveAttribute("aria-expanded", "false");
  },
};

export const KeyboardNavigation: Story = {
  render: (args) => <DemoAccordion {...args} defaultValue="overview" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overviewBlade = canvas.getByRole("button", { name: "Overview" });

    overviewBlade.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Metrics" })).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(
      canvas.getByRole("button", { name: "Metrics" }),
    ).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{End}");
    await expect(
      canvas.getByRole("button", { name: "Integrations" }),
    ).toHaveFocus();
  },
};

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [value, setValue] = useState<HorizontalAccordionValue>("metrics");

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {sections.map((section) => (
            <button
              key={section.value}
              className="border-border text-foreground data-[active=true]:bg-muted rounded-md border px-3 py-1 text-sm"
              data-active={value === section.value}
              onClick={() => setValue(section.value)}
              type="button"
            >
              {section.label}
            </button>
          ))}
          <button
            className="border-border text-muted-foreground rounded-md border px-3 py-1 text-sm"
            onClick={() => setValue(undefined)}
            type="button"
          >
            Clear
          </button>
        </div>
        <DemoAccordion {...args} onValueChange={setValue} value={value} />
      </div>
    );
  },
};

export const BladeContentMixes: Story = {
  render: (args) => (
    <HorizontalAccordion
      {...args}
      aria-label="Blade content mixes"
      className="border-border rounded-lg border"
      defaultValue="text"
    >
      <HorizontalAccordion.Item value="text">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeLabel>
            Rotated text
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <PanelBody
            body="The default blade identity: rotated text reading bottom to top."
            title="Rotated label"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="vertical">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeLabel
            direction="top-to-bottom"
            orientation="vertical"
          >
            Vertical text
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <PanelBody
            body="True vertical writing mode reading top to bottom."
            title="Vertical label"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="icon-only">
        <HorizontalAccordion.Blade aria-label="Icon only">
          <HorizontalAccordion.BladeIcon>
            <CompassIcon />
          </HorizontalAccordion.BladeIcon>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <PanelBody
            body="Icon-only blades take an aria-label for their accessible name."
            title="Icon only"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="mixed">
        <HorizontalAccordion.Blade iconPosition="end">
          <HorizontalAccordion.BladeIcon>
            <LayersIcon />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel>
            Icon end
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <PanelBody
            body="Icon plus label with the icon anchored to the end of the blade."
            title="Mixed blade"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="disabled">
        <HorizontalAccordion.Blade disabled>
          <HorizontalAccordion.BladeLabel>
            Disabled
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <PanelBody body="Never shown." title="Disabled" />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
    </HorizontalAccordion>
  ),
};

export const NonCollapsible: Story = {
  args: { collapsible: false },
  render: (args) => <DemoAccordion {...args} defaultValue="metrics" />,
};

export const AutomaticActivation: Story = {
  args: { activationMode: "automatic" },
  render: (args) => <DemoAccordion {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    canvas.getByRole("button", { name: "Overview" }).focus();
    await expect(
      canvas.getByRole("button", { name: "Overview" }),
    ).toHaveAttribute("aria-expanded", "true");
  },
};

export const CompactLayout: Story = {
  render: (args) => (
    <div style={{ width: 420 }}>
      <DemoAccordion {...args} defaultValue="overview" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Overview" })).toHaveAttribute(
        "data-layout",
        "compact",
      ),
    );
  },
};

export const RTL: Story = {
  render: (args) => (
    <div dir="rtl">
      <DemoAccordion {...args} defaultValue="overview" />
    </div>
  ),
};

export const DarkTheme: Story = {
  render: (args) => (
    <DethinkProvider className="bg-background rounded-xl p-6" theme="dark">
      <DemoAccordion {...args} defaultValue="metrics" />
    </DethinkProvider>
  ),
};

export const CompactDensity: Story = {
  render: (args) => (
    <DethinkProvider density="compact">
      <DemoAccordion {...args} defaultValue="overview" />
    </DethinkProvider>
  ),
};

export const ReducedChoreography: Story = {
  args: { animation: { duration: 1, easing: "linear", content: false } },
  render: (args) => <DemoAccordion {...args} defaultValue="overview" />,
  play: async ({ canvasElement }) => {
    const accordion = canvasElement.querySelector(
      '[data-slot="horizontal-accordion"]',
    );

    await expect(accordion).toHaveAttribute("data-content-animation", "off");
  },
};
