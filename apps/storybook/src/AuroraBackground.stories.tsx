import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  AuroraBackground,
  Badge,
  Button,
  DethinkProvider,
} from "@dethink/components";

const meta = {
  title: "Components/AuroraBackground",
  component: AuroraBackground,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    animate: true,
    density: "normal",
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
} satisfies Meta<typeof AuroraBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

function HeroContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Badge tone="primary" variant="soft">
        Northern lights included
      </Badge>
      <h1 className="text-foreground max-w-2xl text-4xl font-semibold tracking-tight">
        Soft light for bold launches
      </h1>
      <p className="text-muted-foreground max-w-md text-sm leading-6">
        Flowing ribbons of blurred, hue-shifted gradient light drift and breathe
        behind your hero — every hue derived from one tone token.
      </p>
      <div className="flex gap-3">
        <Button>Get started</Button>
        <Button variant="outline">View docs</Button>
      </div>
    </div>
  );
}

export const Hero: Story = {
  render: (args) => (
    <AuroraBackground {...args}>
      <HeroContent />
    </AuroraBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "Soft light for bold launches" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Get started" }),
    ).toBeVisible();

    const layer = canvasElement.querySelector(
      '[data-slot="aurora-background-layer"]',
    );
    await expect(layer).toHaveAttribute("aria-hidden", "true");

    await expect(
      canvasElement.querySelectorAll('[data-slot="aurora-background-ribbon"]')
        .length,
    ).toBeGreaterThan(0);
  },
};

export const DenseFastBold: Story = {
  args: {
    density: "dense",
    intensity: "bold",
    speed: "fast",
    seed: 3,
  },
  render: (args) => (
    <AuroraBackground {...args}>
      <HeroContent />
    </AuroraBackground>
  ),
};

export const MutedTone: Story = {
  args: {
    seed: 5,
    tone: "muted",
  },
  render: (args) => (
    <AuroraBackground {...args}>
      <HeroContent />
    </AuroraBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="aurora-background"]');
    await expect(root).toHaveAttribute("data-tone", "muted");
  },
};

export const SparseFaintForeground: Story = {
  args: {
    density: "sparse",
    intensity: "faint",
    seed: 9,
    speed: "slow",
    tone: "foreground",
  },
  render: (args) => (
    <AuroraBackground {...args}>
      <HeroContent />
    </AuroraBackground>
  ),
};

export const ReducedMotion: Story = {
  args: {
    animate: false,
  },
  render: (args) => (
    <AuroraBackground {...args}>
      <HeroContent />
    </AuroraBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="aurora-background"]');
    await expect(root).toHaveAttribute("data-reduced-motion", "true");
  },
};
