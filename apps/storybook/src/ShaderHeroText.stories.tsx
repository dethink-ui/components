import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  DethinkProvider,
  ShaderHeroText,
  shaderHeroTextAnimations,
} from "@dethink/components";

const meta = {
  title: "Components/ShaderHeroText",
  component: ShaderHeroText,
  args: {
    text: "Ideas come together.",
    animation: "liquid-ripple",
    className: "text-6xl font-semibold",
    intensity: 0.8,
  },
  argTypes: {
    animation: { control: "select", options: shaderHeroTextAnimations },
    intensity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
  },
  decorators: [
    (Story) => (
      <DethinkProvider>
        <div className="bg-background text-foreground max-w-4xl p-12">
          <Story />
        </div>
      </DethinkProvider>
    ),
  ],
} satisfies Meta<typeof ShaderHeroText>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LiquidRipple: Story = {};
export const ChromaticRefraction: Story = {
  args: { animation: "chromatic-refraction" },
};
export const NoiseDissolve: Story = { args: { animation: "noise-dissolve" } };
export const WaveDistortion: Story = { args: { animation: "wave-distortion" } };
export const LiquidMetal: Story = { args: { animation: "liquid-metal" } };
export const ParticleFollow: Story = {
  args: { animation: "particle-follow", text: "A thousand points.\nOne idea." },
};
export const ReducedMotion: Story = {
  args: { animation: "particle-follow", reducedMotion: "always" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Ideas come together." }),
    ).toBeVisible();
    await expect(canvasElement.querySelector("canvas")).toBeNull();
  },
};
export const Dark: Story = {
  args: { animation: "liquid-metal" },
  decorators: [
    (Story) => (
      <DethinkProvider theme="dark">
        <Story />
      </DethinkProvider>
    ),
  ],
};
export const Responsive: Story = {
  args: {
    text: "Ideas find their own way into the world.",
    className: "max-w-72 text-4xl font-semibold",
  },
};
export const RTL: Story = {
  args: { text: "أفكار تجمعنا", dir: "rtl", animation: "particle-follow" },
};

function ManualExample() {
  const [active, setActive] = useState(false);
  const [replay, setReplay] = useState(0);
  return (
    <div className="space-y-6">
      <ShaderHeroText
        text="Ready when you are."
        trigger="manual"
        active={active}
        replayKey={replay}
        className="text-5xl font-semibold"
      />
      <button
        onClick={() => {
          setActive(true);
          setReplay(replay + 1);
        }}
        className="bg-primary text-primary-foreground rounded px-4 py-2"
      >
        Play headline
      </button>
    </div>
  );
}
export const ManualReplay: Story = {
  render: () => <ManualExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Play headline" }),
    );
    await expect(
      canvas.getByRole("heading", { name: "Ready when you are." }),
    ).toBeVisible();
  },
};
