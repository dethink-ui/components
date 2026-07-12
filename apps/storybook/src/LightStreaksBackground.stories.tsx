import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  Badge,
  Button,
  DethinkProvider,
  LightStreaksBackground,
} from "@dethink/components";

const meta = {
  title: "Components/LightStreaksBackground",
  component: LightStreaksBackground,
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
} satisfies Meta<typeof LightStreaksBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

function HeroContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Badge tone="primary" variant="soft">
        Launching soon
      </Badge>
      <h1 className="text-foreground max-w-2xl text-4xl font-semibold tracking-tight">
        Make launch day feel like launch day
      </h1>
      <p className="text-muted-foreground max-w-md text-sm leading-6">
        Depth and motion for dark heroes without patterned geometry.
      </p>
      <div className="flex gap-3">
        <Button>Join the waitlist</Button>
        <Button variant="outline">Read the story</Button>
      </div>
    </div>
  );
}

export const Hero: Story = {
  render: (args) => (
    <LightStreaksBackground {...args}>
      <HeroContent />
    </LightStreaksBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", {
        name: "Make launch day feel like launch day",
      }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Join the waitlist" }),
    ).toBeVisible();

    const layer = canvasElement.querySelector(
      '[data-slot="light-streaks-background-layer"]',
    );
    await expect(layer).toHaveAttribute("aria-hidden", "true");
  },
};

export const DenseFastForeground: Story = {
  args: {
    density: "dense",
    intensity: "bold",
    speed: "fast",
    tone: "foreground",
    seed: 3,
  },
  render: (args) => (
    <LightStreaksBackground {...args}>
      <HeroContent />
    </LightStreaksBackground>
  ),
};

export const SparseSlowMuted: Story = {
  args: {
    density: "sparse",
    speed: "slow",
    tone: "muted",
    seed: 9,
  },
  render: (args) => (
    <LightStreaksBackground {...args}>
      <HeroContent />
    </LightStreaksBackground>
  ),
};

export const ReducedMotion: Story = {
  args: {
    animate: false,
  },
  render: (args) => (
    <LightStreaksBackground {...args}>
      <HeroContent />
    </LightStreaksBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="light-streaks-background"]',
    );
    await expect(root).toHaveAttribute("data-reduced-motion", "true");
  },
};
