import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import {
  DethinkProvider,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  type HeroTextAnimationKind,
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
    repeat: false,
    repeatDelay: 1.8,
    splitBy: "word",
    text: "Build production-ready landing pages faster.",
    trigger: "mount",
  },
  argTypes: {
    animation: {
      control: "inline-radio",
      options: [
        "stagger-words",
        "masked-curtain",
        "typewriter",
        "scramble-decrypt",
        "rotating-keyword",
        "gradient-highlight",
        "blur-focus",
        "kinetic-emphasis-pop",
        "scroll-responsive",
      ],
    },
    as: {
      control: "inline-radio",
      options: ["h1", "h2", "p", "span"],
    },
    reducedMotionStrategy: {
      control: "inline-radio",
      options: ["static", "opacity-only"],
    },
    repeat: {
      control: "boolean",
    },
    repeatDelay: {
      control: { type: "number", min: 0, step: 0.1 },
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
const animationKinds: HeroTextAnimationKind[] = [
  "stagger-words",
  "masked-curtain",
  "typewriter",
  "scramble-decrypt",
  "rotating-keyword",
  "gradient-highlight",
  "blur-focus",
  "kinetic-emphasis-pop",
  "scroll-responsive",
];

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

export const MaskedCurtainReveal: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <div className="grid gap-8 lg:grid-cols-2">
          {animationKinds.map((animation) => (
            <section key={animation} className="min-w-0">
              <p className="text-muted-foreground mb-3 text-sm font-medium">
                {animation}
              </p>
              <HeroTextAnimation
                animation={animation}
                text={"Launch pages with motion.\nKeep every line readable."}
                className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
              />
            </section>
          ))}
        </div>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const TypewriterReveal: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              caret
            </p>
            <HeroTextAnimation
              animation="typewriter"
              duration={1.1}
              text="Type concise launch copy once."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              no caret
            </p>
            <HeroTextAnimation
              animation="typewriter"
              duration={0.9}
              showCaret={false}
              text="Reveal the final message quickly."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
        </div>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const ScrambleDecryptReveal: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              bounded decrypt
            </p>
            <HeroTextAnimation
              animation="scramble-decrypt"
              duration={1.2}
              text="Decrypt the launch message once."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              replay preview
            </p>
            <HeroTextAnimation
              animation="scramble-decrypt"
              duration={1}
              repeat
              repeatDelay={1.4}
              text="Replay without exceeding flash limits."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
        </div>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const RotatingKeywordReveal: Story = {
  render: () => {
    const keywords = ["finance", "customer success", "sales operations"];
    const [keywordIndex, setKeywordIndex] = useState(0);

    return (
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-8"
      >
        <HeroTextAnimationProvider>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section className="min-w-0">
              <p className="text-muted-foreground mb-3 text-sm font-medium">
                controlled slot
              </p>
              <HeroTextAnimation
                animation="rotating-keyword"
                rotatingKeywordIndex={keywordIndex}
                rotatingKeywordOptions={keywords}
                rotatingKeywordPrefix="Build dashboards for "
                rotatingKeywordSuffix=" teams."
                text="Build dashboards for every revenue team."
                onRotatingKeywordIndexChange={setKeywordIndex}
                className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
              />
              <div className="mt-5 flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <button
                    key={keyword}
                    type="button"
                    className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background data-[active=true]:bg-primary data-[active=true]:text-primary-foreground rounded-md border px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    data-active={keywordIndex === index ? "true" : "false"}
                    onClick={() => setKeywordIndex(index)}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </section>
            <section className="min-w-0">
              <p className="text-muted-foreground mb-3 text-sm font-medium">
                bounded auto rotation
              </p>
              <HeroTextAnimation
                animation="rotating-keyword"
                autoRotateKeywords
                rotatingKeywordInterval={1.2}
                rotatingKeywordOptions={[
                  "pipeline gaps",
                  "launch blockers",
                  "handoff risks",
                ]}
                rotatingKeywordPrefix="Spot "
                rotatingKeywordSuffix=" before release."
                text="Spot release risks before launch."
                className="text-foreground text-3xl leading-tight font-semibold tracking-normal"
              />
            </section>
          </div>
        </HeroTextAnimationProvider>
      </DethinkProvider>
    );
  },
};

export const GradientHighlightSweep: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-8"
      >
        <HeroTextAnimationProvider>
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              one-shot sweep
            </p>
            <HeroTextAnimation
              animation="gradient-highlight"
              duration={0.9}
              text="Highlight the conversion-critical launch promise."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
        </HeroTextAnimationProvider>
      </DethinkProvider>
      <DethinkProvider
        theme="dark"
        className="border-border rounded-lg border p-8"
      >
        <HeroTextAnimationProvider>
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              dark theme
            </p>
            <HeroTextAnimation
              animation="gradient-highlight"
              duration={0.9}
              text="Keep the highlighted phrase readable after motion."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
        </HeroTextAnimationProvider>
      </DethinkProvider>
    </div>
  ),
};

export const BlurFocusReveal: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-8"
      >
        <HeroTextAnimationProvider>
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              short heading
            </p>
            <HeroTextAnimation
              animation="blur-focus"
              duration={0.42}
              text="Bring the launch promise into focus."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
        </HeroTextAnimationProvider>
      </DethinkProvider>
      <DethinkProvider
        theme="dark"
        className="border-border rounded-lg border p-8"
      >
        <HeroTextAnimationProvider>
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              crisp finish
            </p>
            <HeroTextAnimation
              animation="blur-focus"
              duration={0.38}
              text="Focus the product story fast."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
        </HeroTextAnimationProvider>
      </DethinkProvider>
    </div>
  ),
};

export const KineticEmphasisPop: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-8"
      >
        <HeroTextAnimationProvider>
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              configured words
            </p>
            <HeroTextAnimation
              animation="kinetic-emphasis-pop"
              duration={0.42}
              emphasisWords={["revenue", "risk"]}
              text="Make revenue risk impossible to miss."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
        </HeroTextAnimationProvider>
      </DethinkProvider>
      <DethinkProvider
        theme="dark"
        className="border-border rounded-lg border p-8"
      >
        <HeroTextAnimationProvider>
          <section className="min-w-0">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              indexed words
            </p>
            <HeroTextAnimation
              animation="kinetic-emphasis-pop"
              duration={0.38}
              emphasisWordIndices={[1, 4]}
              text="Turn launch friction into clear decisions."
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
            />
          </section>
        </HeroTextAnimationProvider>
      </DethinkProvider>
    </div>
  ),
};

export const ScrollResponsiveText: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-0"
    >
      <HeroTextAnimationProvider>
        <section className="min-w-0 px-8 pt-8 pb-48">
          <p className="text-muted-foreground mb-3 text-sm font-medium">
            bounded first-scroll response
          </p>
          <HeroTextAnimation
            animation="scroll-responsive"
            text="Let the hero respond subtly as the story starts."
            className="text-foreground max-w-3xl text-4xl leading-tight font-semibold tracking-normal md:text-6xl"
          />
          <p className="text-muted-foreground mt-5 max-w-xl text-sm leading-6">
            The heading is readable before scrolling. The decorative visual
            layer only shifts up to 32px and fades no lower than 92%.
          </p>
        </section>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const RepeatPreview: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <div className="grid gap-8 lg:grid-cols-3">
          {animationKinds.map((animation) => (
            <section key={animation} className="min-w-0">
              <p className="text-muted-foreground mb-3 text-sm font-medium">
                {animation}
              </p>
              <HeroTextAnimation
                animation={animation}
                repeat
                repeatDelay={1.4}
                text={
                  animation === "masked-curtain"
                    ? "Replay the reveal.\nKeep the copy readable."
                    : "Replay the hero headline."
                }
                className="text-foreground text-2xl leading-tight font-semibold tracking-normal"
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

export const TypewriterReducedMotionFallbacks: Story = {
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
              animation="typewriter"
              reducedMotionStrategy={strategy}
              text={`${strategy} reduced motion shows the full typed headline.`}
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal"
            />
          ))}
        </div>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const ScrambleReducedMotionFallbacks: Story = {
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
              animation="scramble-decrypt"
              reducedMotionStrategy={strategy}
              text={`${strategy} reduced motion shows the decrypted headline.`}
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal"
            />
          ))}
        </div>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const RotatingKeywordReducedMotionFallback: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="rotating-keyword"
          autoRotateKeywords
          rotatingKeywordIndex={1}
          rotatingKeywordOptions={["finance", "support", "sales"]}
          rotatingKeywordPrefix="Build dashboards for "
          rotatingKeywordSuffix=" teams."
          text="Build dashboards for every revenue team."
          className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
        />
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const GradientHighlightReducedMotionFallback: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="gradient-highlight"
          text="Reduced motion keeps the highlighted phrase settled."
          className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
        />
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const BlurFocusReducedMotionFallback: Story = {
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
              animation="blur-focus"
              reducedMotionStrategy={strategy}
              text={`${strategy} reduced motion keeps the heading focused.`}
              className="text-foreground text-3xl leading-tight font-semibold tracking-normal"
            />
          ))}
        </div>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const KineticEmphasisReducedMotionFallback: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="kinetic-emphasis-pop"
          emphasisWords={["static", "emphasis"]}
          text="Reduced motion keeps static emphasis without scale."
          className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
        />
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const ScrollResponsiveReducedMotionFallback: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider reducedMotion="always">
        <HeroTextAnimation
          animation="scroll-responsive"
          text="Reduced motion keeps scroll-responsive copy still."
          className="text-foreground text-3xl leading-tight font-semibold tracking-normal md:text-5xl"
        />
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
};

export const MaskedCurtainReducedMotionFallbacks: Story = {
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
              animation="masked-curtain"
              reducedMotionStrategy={strategy}
              text={`${strategy} reduced motion.\nCurtain reveal stays readable.`}
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

export const BlurFocusMobilePerformanceFixture: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border w-[390px] max-w-full rounded-lg border p-5"
    >
      <HeroTextAnimationProvider>
        <section className="min-w-0 space-y-4">
          <p className="text-muted-foreground text-sm font-medium">
            mobile performance fixture
          </p>
          <HeroTextAnimation
            animation="blur-focus"
            delay={0}
            duration={0.42}
            text="Focus the hero message quickly."
            className="text-foreground text-4xl leading-tight font-semibold tracking-normal"
          />
          <p className="text-muted-foreground text-sm leading-6">
            Single phrase layer, small blur radius, no scale, parallax,
            rotation, or animated background work.
          </p>
        </section>
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", {
      name: "Focus the hero message quickly.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-focus-reveal="blur-focus"]',
    );

    await expect(heading).toHaveAttribute("data-animation", "blur-focus");
    await expect(heading).toHaveAttribute("data-split-by", "phrase");
    await expect(motion).toHaveAttribute("data-blur-initial", "6px");
    await expect(motion).toHaveAttribute("data-blur-final", "0px");
  },
};

export const KineticEmphasisInteraction: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <HeroTextAnimation
          animation="kinetic-emphasis-pop"
          emphasisWords={["revenue", "handoffs"]}
          text="Make revenue handoffs impossible to miss."
          className="text-foreground text-4xl leading-tight font-semibold tracking-normal"
        />
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", {
      name: "Make revenue handoffs impossible to miss.",
    });
    const emphasizedWords = heading.querySelectorAll(
      '[data-slot="hero-text-animation-segment"][data-emphasized="true"]',
    );

    await expect(heading).toHaveAttribute(
      "data-animation",
      "kinetic-emphasis-pop",
    );
    await expect(heading).toHaveAttribute("data-emphasis-count", "2");
    await expect(emphasizedWords[0]).toHaveAttribute(
      "data-emphasis-scale",
      "1.045",
    );
  },
};

export const ScrollResponsiveInteraction: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <HeroTextAnimationProvider>
        <HeroTextAnimation
          animation="scroll-responsive"
          text="Scroll responsive headings stay readable."
          className="text-foreground text-4xl leading-tight font-semibold tracking-normal"
        />
      </HeroTextAnimationProvider>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", {
      name: "Scroll responsive headings stay readable.",
    });
    const motion = heading.querySelector(
      '[data-slot="hero-text-animation-motion"][data-scroll-responsive="subtle"]',
    );

    await expect(heading).toHaveAttribute(
      "data-animation",
      "scroll-responsive",
    );
    await expect(heading).toHaveAttribute("data-split-by", "phrase");
    await expect(motion).toHaveAttribute("data-scroll-range-px", "220");
    await expect(motion).toHaveAttribute("data-scroll-y-min", "-32");
  },
};
