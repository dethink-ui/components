import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  Badge,
  Button,
  DethinkProvider,
  ScanGridBackground,
} from "@dethink/components";

const meta = {
  title: "Components/ScanGridBackground",
  component: ScanGridBackground,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    animate: true,
    density: "normal",
    direction: "vertical",
    intensity: "subtle",
    seed: 1,
    speed: "normal",
    tone: "primary",
  },
  argTypes: {
    animate: { control: "boolean" },
    density: {
      control: "inline-radio",
      options: ["sparse", "normal", "dense"],
    },
    direction: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
    intensity: {
      control: "inline-radio",
      options: ["faint", "subtle", "bold"],
    },
    seed: { control: { type: "number", min: 1, step: 1 } },
    speed: {
      control: "inline-radio",
      options: ["slow", "normal", "fast"],
    },
    tone: {
      control: "inline-radio",
      options: ["foreground", "muted", "primary"],
    },
  },
  decorators: [
    (Story) => (
      <DethinkProvider>
        <Story />
      </DethinkProvider>
    ),
  ],
} satisfies Meta<typeof ScanGridBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

function HeroContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Badge tone="primary" variant="soft">
        Live status
      </Badge>
      <h1 className="text-foreground max-w-2xl text-4xl font-semibold tracking-tight">
        Watch every deploy as it happens
      </h1>
      <p className="text-muted-foreground max-w-md text-sm leading-6">
        Observability surfaces that read as continuously monitored.
      </p>
      <div className="flex gap-3">
        <Button>Start monitoring</Button>
        <Button variant="outline">View docs</Button>
      </div>
    </div>
  );
}

export const Hero: Story = {
  render: (args) => (
    <ScanGridBackground {...args}>
      <HeroContent />
    </ScanGridBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", {
        name: "Watch every deploy as it happens",
      }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Start monitoring" }),
    ).toBeVisible();

    const layer = canvasElement.querySelector(
      '[data-slot="scan-grid-background-layer"]',
    );
    await expect(layer).toHaveAttribute("aria-hidden", "true");
  },
};

export const HorizontalSweep: Story = {
  args: {
    direction: "horizontal",
    density: "dense",
    intensity: "bold",
    tone: "foreground",
  },
  render: (args) => (
    <ScanGridBackground {...args}>
      <HeroContent />
    </ScanGridBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="scan-grid-background"]',
    );
    await expect(root).toHaveAttribute("data-direction", "horizontal");
  },
};

export const SlowSparseMuted: Story = {
  args: {
    density: "sparse",
    speed: "slow",
    tone: "muted",
  },
  render: (args) => (
    <ScanGridBackground {...args}>
      <HeroContent />
    </ScanGridBackground>
  ),
};

export const ReducedMotion: Story = {
  args: {
    animate: false,
  },
  render: (args) => (
    <ScanGridBackground {...args}>
      <HeroContent />
    </ScanGridBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="scan-grid-background"]',
    );
    await expect(root).toHaveAttribute("data-reduced-motion", "true");
  },
};
