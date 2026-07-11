import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardScroller,
  CardScrollerItem,
  CardTitle,
  DethinkProvider,
  Text,
} from "@dethink/components";

const meta = {
  title: "Components/CardScroller",
  component: CardScroller,
  args: { maxVisibleCards: 3, overlap: false, showControls: true },
  argTypes: {
    maxVisibleCards: { control: "inline-radio", options: [1, 2, 3, 4] },
    overlap: { control: "boolean" },
    showControls: { control: "boolean" },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CardScroller>;

export default meta;
type Story = StoryObj<typeof meta>;

const plans = [
  ["starter", "Starter", "For individual projects", "£12 / month"],
  ["team", "Team", "Shared workflows and review", "£39 / month"],
  ["scale", "Scale", "Governance for growing teams", "£89 / month"],
  ["enterprise", "Enterprise", "Security and custom support", "Let’s talk"],
] as const;

function PlanItems() {
  return plans.map(([value, title, description, price]) => (
    <CardScrollerItem key={value} value={value} label={`Select ${title}`}>
      <Card as="article" className="min-h-52">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Text weight="semibold">{price}</Text>
        </CardContent>
      </Card>
    </CardScrollerItem>
  ));
}

function ControlledExample({
  maxVisibleCards = 3,
  overlap = false,
  showControls = true,
}: {
  maxVisibleCards?: 1 | 2 | 3 | 4;
  overlap?: boolean;
  showControls?: boolean;
}) {
  const [value, setValue] = useState("starter");
  return (
    <CardScroller
      aria-label="Controlled plan selection"
      maxVisibleCards={maxVisibleCards}
      overlap={overlap}
      showControls={showControls}
      value={value}
      onValueChange={setValue}
    >
      {PlanItems()}
    </CardScroller>
  );
}

export const Default: Story = {
  render: (args) => (
    <CardScroller {...args} aria-label="Choose a plan" defaultValue="team">
      {PlanItems()}
    </CardScroller>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("radio", { name: "Select Team" }),
    ).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Select Scale" }));
    await expect(
      canvas.getByRole("radio", { name: "Select Scale" }),
    ).toBeChecked();
    const next = await canvas.findByRole("button", { name: "Next card" });
    await userEvent.click(next);
    await expect(
      canvas.getByRole("radio", { name: "Select Scale" }),
    ).toBeChecked();
  },
};

export const Controlled: Story = {
  render: (args) => (
    <ControlledExample
      maxVisibleCards={args.maxVisibleCards}
      overlap={args.overlap}
      showControls={args.showControls}
    />
  ),
};

export const Overlap: Story = {
  args: { overlap: true },
  render: (args) => (
    <CardScroller
      {...args}
      aria-label="Overlapping plan selection"
      defaultValue="team"
    >
      {PlanItems()}
    </CardScroller>
  ),
};

export const NarrowContainer: Story = {
  render: (args) => (
    <div className="max-w-sm">
      <CardScroller {...args} aria-label="Narrow plan selection">
        {PlanItems()}
      </CardScroller>
    </div>
  ),
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <CardScroller {...args} aria-label="اختيار الخطة" defaultValue="team">
        {PlanItems()}
      </CardScroller>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <CardScroller {...args} aria-label="Disabled plans" disabled>
      {PlanItems()}
    </CardScroller>
  ),
};

export const VisualModes: Story = {
  render: () => (
    <div className="grid gap-6 xl:grid-cols-2">
      {(
        [
          ["light", "compact"],
          ["light", "comfortable"],
          ["dark", "compact"],
          ["dark", "comfortable"],
        ] as const
      ).map(([theme, density]) => (
        <DethinkProvider
          key={`${theme}-${density}`}
          theme={theme}
          density={density}
          className="bg-background text-foreground rounded-lg border p-4"
        >
          <Text size="sm" weight="semibold">
            {theme} · {density}
          </Text>
          <CardScroller
            aria-label={`${theme} ${density} plan selection`}
            className="mt-3"
            defaultValue="team"
            maxVisibleCards={2}
            showControls={false}
          >
            {PlanItems().slice(0, 2)}
          </CardScroller>
        </DethinkProvider>
      ))}
      <section className="bg-background text-foreground rounded-lg border p-4">
        <Text size="sm" weight="semibold">
          Reduced-motion reference
        </Text>
        <CardScroller
          aria-label="Reduced-motion plan selection"
          className="mt-3 [&_[data-card-scroller-item]]:scale-100 [&_[data-card-scroller-item]]:blur-none [&_[data-card-scroller-item]]:transition-none [&_[data-slot=card-scroller-viewport]]:scroll-auto [&_[data-slot=card]]:scale-100 [&_[data-slot=card]]:transition-none"
          defaultValue="team"
          maxVisibleCards={2}
          showControls={false}
        >
          {PlanItems().slice(0, 2)}
        </CardScroller>
      </section>
      <section className="bg-background text-foreground rounded-lg border p-4">
        <Text size="sm" weight="semibold">
          Forced-colors reference
        </Text>
        <CardScroller
          aria-label="Forced-colors plan selection"
          className="mt-3 [&_[data-card-scroller-item]]:scale-100 [&_[data-card-scroller-item]]:opacity-100 [&_[data-card-scroller-item]]:blur-none [&_[data-slot=card]]:scale-100 [&_[data-slot=card]]:shadow-none [&_[data-slot=card][data-selected=true]]:outline [&_[data-slot=card][data-selected=true]]:outline-2"
          defaultValue="team"
          maxVisibleCards={2}
          showControls={false}
        >
          {PlanItems().slice(0, 2)}
        </CardScroller>
      </section>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
