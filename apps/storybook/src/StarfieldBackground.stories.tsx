import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  Badge,
  Button,
  DethinkProvider,
  StarfieldBackground,
} from "@dethink/components";

const meta = {
  title: "Components/StarfieldBackground",
  component: StarfieldBackground,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    animate: true,
    density: "normal",
    intensity: "subtle",
    interactive: true,
    seed: 1,
    speed: "normal",
    tone: "foreground",
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
    interactive: { control: "boolean" },
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
} satisfies Meta<typeof StarfieldBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

function HeroContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Badge tone="primary" variant="soft">
        Launch window open
      </Badge>
      <h1 className="text-foreground max-w-2xl text-4xl font-semibold tracking-tight">
        Built for what ships next
      </h1>
      <p className="text-muted-foreground max-w-md text-sm leading-6">
        An expansive launch surface with calm parallax depth.
      </p>
      <div className="flex gap-3">
        <Button>Reserve access</Button>
        <Button variant="outline">See the roadmap</Button>
      </div>
    </div>
  );
}

export const Hero: Story = {
  render: (args) => (
    <StarfieldBackground {...args}>
      <HeroContent />
    </StarfieldBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "Built for what ships next" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Reserve access" }),
    ).toBeVisible();

    const layer = canvasElement.querySelector(
      '[data-slot="starfield-background-layer"]',
    );
    await expect(layer).toHaveAttribute("aria-hidden", "true");
    await expect(
      canvasElement.querySelectorAll(
        '[data-slot="starfield-background-star-layer"]',
      ),
    ).toHaveLength(3);
  },
};

export const DenseBoldPrimary: Story = {
  args: {
    density: "dense",
    intensity: "bold",
    speed: "fast",
    tone: "primary",
    seed: 3,
  },
  render: (args) => (
    <StarfieldBackground {...args}>
      <HeroContent />
    </StarfieldBackground>
  ),
};

export const NonInteractive: Story = {
  args: {
    interactive: false,
  },
  render: (args) => (
    <StarfieldBackground {...args}>
      <HeroContent />
    </StarfieldBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="starfield-background"]',
    );
    await expect(root).toHaveAttribute("data-interactive", "false");
  },
};

export const ReducedMotion: Story = {
  args: {
    animate: false,
  },
  render: (args) => (
    <StarfieldBackground {...args}>
      <HeroContent />
    </StarfieldBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="starfield-background"]',
    );
    await expect(root).toHaveAttribute("data-reduced-motion", "true");
  },
};
