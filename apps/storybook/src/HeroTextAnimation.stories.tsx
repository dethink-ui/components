import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  DethinkProvider,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  type HeroTextAnimationReducedMotionStrategy,
  type HeroTextAnimationSplitBy,
  type HeroTextAnimationTrigger,
} from "@dethink/components";

const meta = {
  title: "Components/HeroTextAnimation",
  component: HeroTextAnimation,
  args: {
    animation: "stagger-words",
    as: "h1",
    reducedMotionStrategy: "opacity-only",
    splitBy: "word",
    text: "Build production-ready landing pages faster.",
    trigger: "mount",
  },
  argTypes: {
    as: {
      control: "inline-radio",
      options: ["h1", "h2", "p", "span"],
    },
    reducedMotionStrategy: {
      control: "inline-radio",
      options: ["static", "opacity-only"],
    },
    splitBy: {
      control: "inline-radio",
      options: ["word", "line"],
    },
    trigger: {
      control: "inline-radio",
      options: ["mount", "in-view", "manual"],
    },
  },
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <HeroTextAnimation
          {...args}
          className="max-w-3xl text-4xl leading-tight font-semibold tracking-normal md:text-6xl"
        />
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
} satisfies Meta<typeof HeroTextAnimation>;

export default meta;

type Story = StoryObj<typeof meta>;

const splitModes: HeroTextAnimationSplitBy[] = ["word", "line"];
const reducedMotionStrategies: HeroTextAnimationReducedMotionStrategy[] = [
  "static",
  "opacity-only",
];
const triggers: HeroTextAnimationTrigger[] = ["mount", "manual", "in-view"];

export const Base: Story = {};

export const WordAndLineReveal: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <div className="grid gap-8 lg:grid-cols-2">
          {splitModes.map((splitBy) => (
            <section key={splitBy} className="min-w-0">
              <HeroTextAnimation
                splitBy={splitBy}
                text={
                  splitBy === "line"
                    ? "Launch faster.\nLearn from every release."
                    : "Launch faster and learn from every release."
                }
                className="text-foreground text-3xl leading-tight font-semibold tracking-normal"
              />
            </section>
          ))}
        </div>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const ReducedMotionFallbacks: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider reducedMotion="always">
        <div className="grid gap-8 lg:grid-cols-2">
          {reducedMotionStrategies.map((strategy) => (
            <HeroTextAnimation
              key={strategy}
              reducedMotionStrategy={strategy}
              text={`${strategy} reduced motion keeps the headline readable.`}
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal"
            />
          ))}
        </div>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const TriggerModes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <div className="grid gap-8 lg:grid-cols-3">
          {triggers.map((trigger) => (
            <HeroTextAnimation
              key={trigger}
              active={trigger === "manual"}
              text={`${trigger} trigger for launch headlines.`}
              trigger={trigger}
              className="text-foreground text-2xl leading-tight font-semibold tracking-normal"
            />
          ))}
        </div>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border rounded-lg border p-8"
      >
        <HeroTextAnimationProvider>
          <HeroTextAnimation
            text="Dark mode launch copy stays readable."
            className="text-4xl leading-tight font-semibold tracking-normal"
          />
        </HeroTextAnimationProvider>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-8"
      >
        <HeroTextAnimationProvider>
          <HeroTextAnimation
            text="RTL hero copy keeps stable spacing."
            className="text-4xl leading-tight font-semibold tracking-normal"
          />
        </HeroTextAnimationProvider>
      </DethinkProvider>
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <HeroTextAnimation
          text="Build production-ready landing pages faster."
          className="text-4xl leading-tight font-semibold tracking-normal"
        />
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", {
      name: "Build production-ready landing pages faster.",
    });

    await expect(heading).toHaveAttribute("data-animation", "stagger-words");
    await expect(heading).toHaveAttribute("data-reduced-motion", "false");
  },
};
