import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  Badge,
  Button,
  DethinkProvider,
  DotMatrixBackground,
} from "@dethink/components";

const meta = {
  title: "Components/DotMatrixBackground",
  component: DotMatrixBackground,
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
} satisfies Meta<typeof DotMatrixBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

function HeroContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Badge tone="primary" variant="soft">
        AI-native
      </Badge>
      <h1 className="text-foreground max-w-2xl text-4xl font-semibold tracking-tight">
        Feel the compute behind every answer
      </h1>
      <p className="text-muted-foreground max-w-md text-sm leading-6">
        Ambient activity without literal imagery.
      </p>
      <div className="flex gap-3">
        <Button>Try the model</Button>
        <Button variant="outline">Read the docs</Button>
      </div>
    </div>
  );
}

export const Hero: Story = {
  render: (args) => (
    <DotMatrixBackground {...args}>
      <HeroContent />
    </DotMatrixBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", {
        name: "Feel the compute behind every answer",
      }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Try the model" }),
    ).toBeVisible();

    const layer = canvasElement.querySelector(
      '[data-slot="dot-matrix-background-layer"]',
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
    <DotMatrixBackground {...args}>
      <HeroContent />
    </DotMatrixBackground>
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
    <DotMatrixBackground {...args}>
      <HeroContent />
    </DotMatrixBackground>
  ),
};

export const ReducedMotion: Story = {
  args: {
    animate: false,
  },
  render: (args) => (
    <DotMatrixBackground {...args}>
      <HeroContent />
    </DotMatrixBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="dot-matrix-background"]',
    );
    await expect(root).toHaveAttribute("data-reduced-motion", "true");
  },
};
