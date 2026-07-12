import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, within } from "storybook/test";
import {
  Badge,
  Button,
  DethinkProvider,
  MagneticBeamsBackground,
} from "@dethink/components";

const meta = {
  title: "Components/MagneticBeamsBackground",
  component: MagneticBeamsBackground,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    animate: true,
    density: "normal",
    intensity: "subtle",
    interactive: true,
    mode: "magnetic",
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
    interactive: { control: "boolean" },
    mode: {
      control: "inline-radio",
      options: ["magnetic", "follow"],
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
} satisfies Meta<typeof MagneticBeamsBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

function HeroContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Badge tone="primary" variant="soft">
        Move your pointer
      </Badge>
      <h1 className="text-foreground max-w-2xl text-4xl font-semibold tracking-tight">
        A hero that leans in when you do
      </h1>
      <p className="text-muted-foreground max-w-md text-sm leading-6">
        The beams spring toward your pointer while it hovers, then resume their
        traversal from wherever they are when it leaves.
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
    <MagneticBeamsBackground {...args}>
      <HeroContent />
    </MagneticBeamsBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", {
        name: "A hero that leans in when you do",
      }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Get started" }),
    ).toBeVisible();

    const root = canvasElement.querySelector(
      '[data-slot="magnetic-beams-background"]',
    );
    await expect(root).toHaveAttribute("data-interactive", "true");

    const layer = canvasElement.querySelector(
      '[data-slot="magnetic-beams-background-layer"]',
    );
    await expect(layer).toHaveAttribute("aria-hidden", "true");

    // Drive the pointer across the canvas and out again: beams attract, then
    // resume their traversal, and the composition stays intact throughout.
    if (root) {
      const rect = root.getBoundingClientRect();
      await fireEvent.pointerMove(root, {
        clientX: rect.left + rect.width * 0.3,
        clientY: rect.top + rect.height * 0.4,
      });
      await fireEvent.pointerMove(root, {
        clientX: rect.left + rect.width * 0.7,
        clientY: rect.top + rect.height * 0.6,
      });
      await fireEvent.pointerLeave(root);
    }

    await expect(
      canvasElement.querySelectorAll(
        '[data-slot="magnetic-beams-background-beam"]',
      ).length,
    ).toBeGreaterThan(0);
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
    <MagneticBeamsBackground {...args}>
      <HeroContent />
    </MagneticBeamsBackground>
  ),
};

export const FollowMode: Story = {
  args: {
    mode: "follow",
    seed: 7,
  },
  render: (args) => (
    <MagneticBeamsBackground {...args}>
      <HeroContent />
    </MagneticBeamsBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="magnetic-beams-background"]',
    );
    await expect(root).toHaveAttribute("data-mode", "follow");

    if (root) {
      const rect = root.getBoundingClientRect();
      await fireEvent.pointerMove(root, {
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height * 0.5,
      });
      await fireEvent.pointerLeave(root);
    }

    await expect(
      canvasElement.querySelectorAll(
        '[data-slot="magnetic-beams-background-beam"]',
      ).length,
    ).toBeGreaterThan(0);
  },
};

export const NonInteractive: Story = {
  args: {
    interactive: false,
    seed: 9,
  },
  render: (args) => (
    <MagneticBeamsBackground {...args}>
      <HeroContent />
    </MagneticBeamsBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="magnetic-beams-background"]',
    );
    await expect(root).toHaveAttribute("data-interactive", "false");
  },
};

export const ReducedMotion: Story = {
  args: {
    animate: false,
  },
  render: (args) => (
    <MagneticBeamsBackground {...args}>
      <HeroContent />
    </MagneticBeamsBackground>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="magnetic-beams-background"]',
    );
    await expect(root).toHaveAttribute("data-reduced-motion", "true");
  },
};
