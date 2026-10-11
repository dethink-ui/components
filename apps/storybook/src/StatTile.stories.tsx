import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DeltaBadge, KpiGroup, StatTile } from "@dethink/components";

const trend = [92, 96, 95, 101, 104, 103, 109, 113, 112, 118, 124, 128];

const meta = {
  title: "Components/StatTile",
  component: StatTile,
  args: {
    label: "Monthly recurring revenue",
    value: 128_430,
    formatOptions: { style: "currency", currency: "USD" },
    delta: 8.2,
    comparison: "vs last month",
    trend,
    size: "md",
    trendPlacement: "bottom",
    trendVariant: "area",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    trendPlacement: { control: "inline-radio", options: ["bottom", "end"] },
    trendVariant: { control: "inline-radio", options: ["line", "area", "bar"] },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tile = canvas.getByRole("group", {
      name: "Monthly recurring revenue",
    });
    await expect(tile).toHaveTextContent("$128.4K");
    await expect(canvas.getByText("Up 8.2% vs last month")).toBeInTheDocument();
  },
};

export const LowerIsBetter: Story = {
  args: {
    label: "API p95 latency",
    value: 182,
    formatValue: (value: number) => `${value} ms`,
    delta: { value: 6.5, positiveDirection: "down" },
    comparison: "vs last week",
    trendColor: "chart-7",
  },
};

export const Loading: Story = { args: { loading: true } };

export const MissingData: Story = {
  args: { value: null, delta: null, trend: undefined, caption: "Sync paused" },
};

export const Linked: Story = {
  args: { href: "#revenue", trendPlacement: "end", trendVariant: "bar" },
};

export const KpiRows: Story = {
  decorators: [
    (Story) => (
      <div className="w-[min(100vw-2rem,64rem)]">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <div className="grid gap-8">
      {(["joined", "separate"] as const).map((variant) => (
        <KpiGroup key={variant} variant={variant} aria-label={`${variant} row`}>
          <StatTile {...args} />
          <StatTile
            {...args}
            label="Active workspaces"
            value={12_408}
            formatOptions={undefined}
            delta={3.1}
            trendColor="chart-3"
          />
          <StatTile
            {...args}
            label="Logo churn"
            value="1.8%"
            delta={{ value: -0.4, positiveDirection: "down" }}
            trendColor="chart-2"
          />
        </KpiGroup>
      ))}
    </div>
  ),
};

export const DeltaBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <DeltaBadge value={12.4} />
      <DeltaBadge value={-3.1} />
      <DeltaBadge value={-0.8} positiveDirection="down" />
      <DeltaBadge value={6.5} positiveDirection="down" variant="outline" />
      <DeltaBadge value={0.1} neutralThreshold={0.25} variant="plain" />
      <DeltaBadge value={null} />
    </div>
  ),
};
