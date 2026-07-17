import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  AuroraBackground,
  Button,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  DethinkProvider,
  Link,
} from "@dethink/components";

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    staging: "flat",
    intensity: "standard",
    drag: true,
    defaultIndex: 0,
  },
  argTypes: {
    staging: {
      control: "inline-radio",
      options: ["flat", "tilt", "floor"],
    },
    intensity: {
      control: "inline-radio",
      options: ["subtle", "standard", "dramatic"],
    },
    drag: { control: "boolean" },
    defaultIndex: { control: { type: "number", min: 0, step: 1 } },
  },
  decorators: [
    (Story) => (
      <DethinkProvider>
        <div className="px-6 py-10">
          <Story />
        </div>
      </DethinkProvider>
    ),
  ],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const swatches = [
  "from-sky-400/70 to-indigo-500/70",
  "from-rose-400/70 to-orange-400/70",
  "from-emerald-400/70 to-teal-500/70",
  "from-violet-400/70 to-fuchsia-500/70",
  "from-amber-400/70 to-yellow-500/70",
  "from-cyan-400/70 to-blue-500/70",
];

function Frame({ index }: { index: number }) {
  return (
    <div className="border-border bg-card flex h-64 w-full flex-col justify-end overflow-hidden rounded-xl border shadow-lg">
      <div
        className={`flex-1 bg-gradient-to-br ${swatches[index % swatches.length]}`}
      />
      <div className="p-4">
        <p className="text-foreground text-sm font-semibold">
          Frame {index + 1}
        </p>
        <p className="text-muted-foreground text-xs">
          Gallery piece {index + 1}
        </p>
      </div>
    </div>
  );
}

function frames(count: number) {
  return Array.from({ length: count }, (_, i) => (
    <CarouselItem key={i}>
      <Frame index={i} />
    </CarouselItem>
  ));
}

export const Flat: Story = {
  render: (args) => (
    <Carousel {...args} aria-label="Flat gallery" className="mx-auto max-w-4xl">
      <CarouselContent>{frames(5)}</CarouselContent>
      <div className="mt-4 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Flat gallery" });
    await expect(region).toHaveAttribute("aria-roledescription", "carousel");

    const next = canvas.getByRole("button", { name: "Next slide" });
    await userEvent.click(next);
    await expect(
      canvas.getByRole("button", { name: "Go to slide 2" }),
    ).toHaveAttribute("aria-current", "true");
  },
};

export const GenericContent: Story = {
  render: (args) => (
    <Carousel
      {...args}
      aria-label="Generic content carousel"
      className="mx-auto max-w-4xl"
    >
      <CarouselContent>
        <CarouselItem>
          <div className="bg-muted flex h-56 items-center justify-center rounded-xl p-6 text-center">
            <p className="text-foreground text-lg font-medium">
              Any React content can be a slide.
            </p>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="bg-muted flex h-56 flex-col justify-center gap-2 rounded-xl p-6">
            <h3 className="text-foreground text-lg font-semibold">A feature</h3>
            <p className="text-muted-foreground text-sm">
              Slides are generic children — cards, media, forms, or plain
              markup.
            </p>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="bg-muted flex h-56 items-center justify-center rounded-xl p-6">
            <Button>A call to action</Button>
          </div>
        </CarouselItem>
      </CarouselContent>
      <div className="mt-4 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
};

export const Tilt: Story = {
  args: { staging: "tilt", defaultIndex: 2 },
  render: (args) => (
    <Carousel {...args} aria-label="Tilt gallery" className="mx-auto max-w-5xl">
      <CarouselContent>{frames(6)}</CarouselContent>
      <div className="mt-6 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Tilt gallery" });
    await expect(region).toHaveAttribute("data-staging", "tilt");
    await expect(
      canvasElement.querySelectorAll('[data-slot="carousel-item-shadow"]')
        .length,
    ).toBe(6);
  },
};

export const IntensityComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      {(["subtle", "standard", "dramatic"] as const).map((intensity) => (
        <div key={intensity}>
          <p className="text-muted-foreground mb-3 text-center text-xs font-medium tracking-wide uppercase">
            intensity: {intensity}
          </p>
          <Carousel
            staging="tilt"
            intensity={intensity}
            defaultIndex={2}
            aria-label={`Tilt ${intensity}`}
            className="mx-auto max-w-4xl"
          >
            <CarouselContent>{frames(5)}</CarouselContent>
            <div className="mt-5 flex items-center justify-center gap-3">
              <CarouselPrevious />
              <CarouselDots />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      ))}
    </div>
  ),
};

export const FloorGallery: Story = {
  args: { staging: "floor", intensity: "standard", defaultIndex: 3 },
  render: (args) => (
    <Carousel
      {...args}
      aria-label="Floor-standing gallery"
      className="mx-auto max-w-6xl"
    >
      <CarouselContent>{frames(7)}</CarouselContent>
      <div className="mt-8 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", {
      name: "Floor-standing gallery",
    });
    await expect(region).toHaveAttribute("data-staging", "floor");
    await expect(
      canvasElement.querySelectorAll('[data-slot="carousel-item-shadow"]')
        .length,
    ).toBe(7);
    await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
    await expect(
      canvas.getByRole("button", { name: "Go to slide 5" }),
    ).toHaveAttribute("aria-current", "true");
  },
};

export const DarkMode: Story = {
  args: { staging: "floor", defaultIndex: 2 },
  decorators: [
    (Story) => (
      <DethinkProvider theme="dark">
        <div className="bg-background px-6 py-12">
          <Story />
        </div>
      </DethinkProvider>
    ),
  ],
  render: (args) => (
    <Carousel
      {...args}
      aria-label="Dark floor gallery"
      className="mx-auto max-w-6xl"
    >
      <CarouselContent>{frames(6)}</CarouselContent>
      <div className="mt-8 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [index, setIndex] = useState(1);
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Button
              key={i}
              size="sm"
              variant={i === index ? "solid" : "outline"}
              onClick={() => setIndex(i)}
            >
              Go to {i + 1}
            </Button>
          ))}
        </div>
        <Carousel
          {...args}
          aria-label="Controlled gallery"
          index={index}
          onIndexChange={setIndex}
        >
          <CarouselContent>{frames(4)}</CarouselContent>
          <div className="mt-4 flex items-center justify-center gap-3">
            <CarouselPrevious />
            <CarouselDots />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Go to 4" }));
    await expect(
      canvas.getByRole("button", { name: "Go to slide 4" }),
    ).toHaveAttribute("aria-current", "true");
  },
};

export const MarketingCards: Story = {
  args: { staging: "tilt", defaultIndex: 2 },
  render: (args) => (
    <Carousel
      {...args}
      aria-label="Product highlights"
      className="mx-auto max-w-5xl"
    >
      <CarouselContent>
        {Array.from({ length: 5 }, (_, i) => (
          <CarouselItem key={i}>
            <article className="border-border bg-card flex h-64 w-full flex-col justify-between rounded-xl border p-5 shadow-lg">
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  Feature {i + 1}
                </p>
                <h3 className="text-foreground mt-1 text-lg font-semibold">
                  Ship faster
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Nested focusables inside slides stay reachable when a slide is
                  active and inert when it scrolls off screen.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm">Try it</Button>
                <Link href="#learn-more">Learn more</Link>
              </div>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The active slide's action is reachable; a fully off-screen slide is inert.
    await expect(
      canvas.getAllByRole("button", { name: "Try it" })[0],
    ).toBeInTheDocument();
    const slides = canvasElement.querySelectorAll(
      '[data-slot="carousel-item"]',
    );
    await expect(slides[0]).toHaveAttribute("inert");
  },
};

export const RTL: Story = {
  args: { staging: "tilt", defaultIndex: 2 },
  decorators: [
    (Story) => (
      <DethinkProvider dir="rtl">
        <div className="px-6 py-10">
          <Story />
        </div>
      </DethinkProvider>
    ),
  ],
  render: (args) => (
    <Carousel {...args} aria-label="معرض" className="mx-auto max-w-5xl">
      <CarouselContent>{frames(6)}</CarouselContent>
      <div className="mt-6 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
};

export const Density: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      {(["compact", "default", "comfortable"] as const).map((density) => (
        <DethinkProvider key={density} density={density}>
          <div>
            <p className="text-muted-foreground mb-3 text-center text-xs font-medium tracking-wide uppercase">
              density: {density}
            </p>
            <Carousel
              staging="flat"
              defaultIndex={1}
              aria-label={`Density ${density}`}
              className="mx-auto max-w-3xl"
            >
              <CarouselContent>{frames(4)}</CarouselContent>
              <div className="mt-4 flex items-center justify-center gap-3">
                <CarouselPrevious />
                <CarouselDots />
                <CarouselNext />
              </div>
            </Carousel>
          </div>
        </DethinkProvider>
      ))}
    </div>
  ),
};

export const ReducedMotion: Story = {
  name: "Reduced motion (OS preference)",
  parameters: {
    docs: {
      description: {
        story:
          "With the OS 'reduce motion' preference on, the 3D staging flattens, the spring becomes an instant jump, and the active-slide change is an opacity crossfade. Toggle your OS setting (or the browser devtools rendering emulation) to preview.",
      },
    },
  },
  args: { staging: "floor", defaultIndex: 2 },
  render: (args) => (
    <Carousel
      {...args}
      aria-label="Reduced-motion gallery"
      className="mx-auto max-w-5xl"
    >
      <CarouselContent>{frames(6)}</CarouselContent>
      <div className="mt-6 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
};

export const WithAuroraBackground: Story = {
  args: { staging: "floor", defaultIndex: 3 },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <AuroraBackground
      tone="primary"
      intensity="subtle"
      className="min-h-[70vh]"
    >
      <div className="px-6 py-16">
        <Carousel
          {...args}
          aria-label="Featured work over aurora"
          className="mx-auto max-w-6xl"
        >
          <CarouselContent>{frames(7)}</CarouselContent>
          <div className="mt-8 flex items-center justify-center gap-3">
            <CarouselPrevious />
            <CarouselDots />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </AuroraBackground>
  ),
};
