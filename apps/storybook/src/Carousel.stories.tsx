import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowUpRight,
  Check,
  ChartNoAxesCombined,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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

const coastalRetreatPhoto = new URL(
  "./assets/carousel/coastal-retreat.png",
  import.meta.url,
).href;
const glasshousePhoto = new URL(
  "./assets/carousel/glasshouse.png",
  import.meta.url,
).href;
const alpineLakePhoto = new URL(
  "./assets/carousel/alpine-lake.png",
  import.meta.url,
).href;
const readingRoomPhoto = new URL(
  "./assets/carousel/reading-room.png",
  import.meta.url,
).href;

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

const featureCards = [
  {
    description:
      "Turn scattered signals into a shared operating rhythm for the entire team.",
    eyebrow: "Planning",
    icon: Layers3,
    metric: "3.2× faster alignment",
    title: "Put the right work in view",
  },
  {
    description:
      "Give every launch a living source of truth, from the first brief to the final handoff.",
    eyebrow: "Execution",
    icon: Sparkles,
    metric: "42% fewer status meetings",
    title: "Keep momentum visible",
  },
  {
    description:
      "Surface the customer and product signals that deserve a decision before they become noise.",
    eyebrow: "Insight",
    icon: ChartNoAxesCombined,
    metric: "Weekly signal reviews",
    title: "Make progress measurable",
  },
  {
    description:
      "Build confidence into every workflow with durable permissions and clear ownership.",
    eyebrow: "Governance",
    icon: ShieldCheck,
    metric: "Enterprise-ready controls",
    title: "Scale without losing trust",
  },
] as const;

const gallerySlides = [
  {
    alt: "Pale stone coastal retreat with an olive tree facing a deep blue sea.",
    category: "Architecture",
    image: coastalRetreatPhoto,
    title: "Limestone edge",
  },
  {
    alt: "Sculptural glasshouse surrounded by lush plants and misty greenery.",
    category: "Botanical",
    image: glasshousePhoto,
    title: "Rain room",
  },
  {
    alt: "Misty alpine lake, wooden dock, wild grass, and dark mountain peaks at dawn.",
    category: "Landscape",
    image: alpineLakePhoto,
    title: "Quiet water",
  },
  {
    alt: "Warm reading room with a cream lounge chair and walnut bookcase in afternoon light.",
    category: "Interiors",
    image: readingRoomPhoto,
    title: "A place to pause",
  },
] as const;

const plans = [
  {
    description: "For a focused team building its first operating rhythm.",
    features: [
      "Up to 5 collaborators",
      "Unlimited projects",
      "Weekly insights",
    ],
    name: "Starter",
    price: "$0",
  },
  {
    description: "For cross-functional teams ready to ship with more clarity.",
    features: [
      "Unlimited collaborators",
      "Goals and roadmaps",
      "Priority support",
    ],
    name: "Growth",
    price: "$24",
  },
  {
    description: "For organizations that need governance at scale.",
    features: [
      "Advanced permissions",
      "SAML single sign-on",
      "Dedicated success partner",
    ],
    name: "Scale",
    price: "Custom",
  },
] as const;

const testimonials = [
  {
    initials: "AL",
    name: "Avery Lin",
    quote:
      "The carousel makes it easy to tell a visual story without turning a dense page into a wall of cards.",
    role: "Design Director, Northstar",
    tone: "bg-primary text-primary-foreground",
  },
  {
    initials: "JM",
    name: "Jordan Mendez",
    quote:
      "We used it to bring customer evidence, release notes, and next steps into one focused moment in the product.",
    role: "Product Lead, Meridian",
    tone: "bg-info text-info-foreground",
  },
  {
    initials: "SP",
    name: "Samira Patel",
    quote:
      "It feels deliberately calm. The motion gives context, but keyboard and reduced-motion support never feel bolted on.",
    role: "Staff Engineer, Fieldwork",
    tone: "bg-success text-success-foreground",
  },
] as const;

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

export const FeatureCards: Story = {
  args: { staging: "tilt", defaultIndex: 1 },
  parameters: {
    docs: {
      description: {
        story:
          "A product-marketing pattern with a clear content hierarchy and one focused action per slide.",
      },
    },
  },
  render: (args) => (
    <Carousel
      {...args}
      aria-label="Product capabilities"
      className="mx-auto max-w-5xl"
    >
      <CarouselContent>
        {featureCards.map((feature) => {
          const Icon = feature.icon;
          return (
            <CarouselItem key={feature.title}>
              <article className="border-border bg-card flex h-[22rem] w-full flex-col overflow-hidden rounded-2xl border shadow-xl shadow-black/5">
                <div className="from-primary/15 via-primary/5 to-background relative min-h-40 overflow-hidden bg-gradient-to-br p-6">
                  <div className="bg-primary/10 absolute -top-10 -right-10 size-40 rounded-full blur-2xl" />
                  <div className="border-primary/15 bg-background/70 text-primary relative flex size-12 items-center justify-center rounded-2xl border shadow-sm backdrop-blur-sm">
                    <Icon
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={1.75}
                    />
                  </div>
                  <p className="text-muted-foreground relative mt-8 text-xs font-semibold tracking-[0.16em] uppercase">
                    {feature.eyebrow}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-6 pt-5">
                  <h3 className="text-foreground text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {feature.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
                    <span className="text-primary text-xs font-semibold">
                      {feature.metric}
                    </span>
                    <Button size="sm" variant="outline">
                      Explore{" "}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="mt-7 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots label={(index) => `Show ${featureCards[index].title}`} />
        <CarouselNext />
      </div>
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
    await expect(
      canvas.getByRole("button", { name: "Show Make progress measurable" }),
    ).toHaveAttribute("aria-current", "true");
  },
};

export const ImageGallery: Story = {
  args: { staging: "flat", defaultIndex: 0 },
  parameters: {
    docs: {
      description: {
        story:
          "An editorial gallery with locally bundled imagery, descriptive alt text, and destination-aware pagination labels.",
      },
    },
  },
  render: (args) => (
    <Carousel
      {...args}
      aria-label="Editorial places gallery"
      className="mx-auto max-w-5xl"
    >
      <CarouselContent>
        {gallerySlides.map((slide) => (
          <CarouselItem key={slide.title}>
            <figure className="border-border bg-card relative h-[clamp(19rem,52vw,30rem)] w-full overflow-hidden rounded-2xl border shadow-xl shadow-black/10">
              <img
                alt={slide.alt}
                className="size-full object-cover"
                decoding="async"
                src={slide.image}
              />
              <figcaption className="from-foreground/80 via-foreground/15 text-primary-foreground absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-6 pt-16 pb-6">
                <p className="text-xs font-semibold tracking-[0.16em] uppercase opacity-75">
                  {slide.category}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {slide.title}
                </p>
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots label={(index) => `Show ${gallerySlides[index].title}`} />
        <CarouselNext />
      </div>
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByAltText(
        "Pale stone coastal retreat with an olive tree facing a deep blue sea.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "Show Quiet water" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Show Quiet water" }),
    ).toHaveAttribute("aria-current", "true");
  },
};

export const PricingPlans: Story = {
  args: { staging: "tilt", defaultIndex: 1 },
  parameters: {
    docs: {
      description: {
        story:
          "A compact comparison pattern that keeps each plan readable in a narrow, touch-friendly carousel.",
      },
    },
  },
  render: (args) => (
    <Carousel
      {...args}
      aria-label="Subscription plans"
      className="mx-auto max-w-5xl"
    >
      <CarouselContent>
        {plans.map((plan) => (
          <CarouselItem key={plan.name}>
            <section className="border-border bg-card flex h-[27rem] w-full flex-col rounded-2xl border p-6 shadow-xl shadow-black/5">
              <div className="flex min-h-7 items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm font-semibold">
                  {plan.name}
                </p>
                {plan.name === "Growth" ? (
                  <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide uppercase">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-4 min-h-12 text-sm leading-6">
                {plan.description}
              </p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-foreground text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                {plan.price !== "Custom" ? (
                  <span className="text-muted-foreground mb-1 text-sm">
                    / month
                  </span>
                ) : null}
              </div>
              <ul className="mt-7 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      aria-hidden="true"
                      className="text-success mt-0.5 size-4 shrink-0"
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-auto w-full"
                variant={plan.name === "Growth" ? "solid" : "outline"}
              >
                Choose {plan.name}
              </Button>
            </section>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-7 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots label={(index) => `Show ${plans[index].name} plan`} />
        <CarouselNext />
      </div>
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Choose Growth" }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
    await expect(
      canvas.getByRole("button", { name: "Show Scale plan" }),
    ).toHaveAttribute("aria-current", "true");
  },
};

export const Testimonials: Story = {
  args: { staging: "floor", intensity: "subtle", defaultIndex: 1 },
  parameters: {
    docs: {
      description: {
        story:
          "A social-proof pattern that gives longer quotes an intentional stage while preserving concise next and previous controls.",
      },
    },
  },
  render: (args) => (
    <Carousel
      {...args}
      aria-label="Customer testimonials"
      className="mx-auto max-w-5xl"
    >
      <CarouselContent>
        {testimonials.map((testimonial) => (
          <CarouselItem key={testimonial.name}>
            <figure className="border-border bg-card flex h-[22rem] w-full flex-col rounded-2xl border p-7 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between">
                <span
                  aria-hidden="true"
                  className="text-primary text-lg tracking-[0.2em]"
                >
                  ★★★★★
                </span>
                <span className="sr-only">5 out of 5 stars</span>
                <span className="text-muted-foreground text-xs font-medium">
                  Customer story
                </span>
              </div>
              <blockquote className="text-foreground mt-7 text-xl leading-8 font-medium tracking-tight">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 border-t pt-5">
                <span
                  aria-hidden="true"
                  className={`${testimonial.tone} flex size-10 items-center justify-center rounded-full text-xs font-bold`}
                >
                  {testimonial.initials}
                </span>
                <span>
                  <span className="text-foreground block text-sm font-semibold">
                    {testimonial.name}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {testimonial.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-8 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots
          label={(index) => `Show testimonial from ${testimonials[index].name}`}
        />
        <CarouselNext />
      </div>
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Previous slide" }),
    );
    await expect(
      canvas.getByRole("button", {
        name: "Show testimonial from Avery Lin",
      }),
    ).toHaveAttribute("aria-current", "true");
  },
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
