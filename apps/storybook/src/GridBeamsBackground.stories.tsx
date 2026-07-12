import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  Badge,
  Button,
  DethinkProvider,
  GridBeamsBackground,
} from "@dethink/components";

const meta = {
  title: "Components/GridBeamsBackground",
  component: GridBeamsBackground,
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
} satisfies Meta<typeof GridBeamsBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

function HeroContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Badge tone="primary" variant="soft">
        Now in beta
      </Badge>
      <h1 className="text-foreground max-w-2xl text-4xl font-semibold tracking-tight">
        Ship dashboards your team actually trusts
      </h1>
      <p className="text-muted-foreground max-w-md text-sm leading-6">
        Production-grade components for SaaS, internal tools, and AI-native
        products.
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
    <GridBeamsBackground {...args}>
      <HeroContent />
    </GridBeamsBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", {
        name: "Ship dashboards your team actually trusts",
      }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Get started" }),
    ).toBeVisible();

    const layer = canvasElement.querySelector(
      '[data-slot="grid-beams-background-layer"]',
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
    <GridBeamsBackground {...args}>
      <HeroContent />
    </GridBeamsBackground>
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
    <GridBeamsBackground {...args}>
      <HeroContent />
    </GridBeamsBackground>
  ),
};

export const ReducedMotion: Story = {
  args: {
    animate: false,
  },
  render: (args) => (
    <GridBeamsBackground {...args}>
      <HeroContent />
    </GridBeamsBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="grid-beams-background"]',
    );
    await expect(root).toHaveAttribute("data-reduced-motion", "true");
  },
};
