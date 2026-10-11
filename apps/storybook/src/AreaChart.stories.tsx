import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { AreaChart } from "@dethink/components";

const data = [
  { month: "Jan", starter: 8_200, growth: 21_400, enterprise: 18_000 },
  { month: "Feb", starter: 8_600, growth: 22_100, enterprise: 18_000 },
  { month: "Mar", starter: 9_100, growth: 23_800, enterprise: 22_500 },
  { month: "Apr", starter: 9_300, growth: 24_600, enterprise: 22_500 },
  { month: "May", starter: 9_900, growth: 25_200, enterprise: 22_500 },
  { month: "Jun", starter: 10_400, growth: 27_100, enterprise: 26_000 },
  { month: "Jul", starter: 10_200, growth: 28_400, enterprise: 26_000 },
  { month: "Aug", starter: 10_900, growth: 29_000, enterprise: 30_500 },
];

const meta = {
  title: "Components/AreaChart",
  component: AreaChart,
  args: {
    "aria-label": "MRR by plan",
    data,
    index: "month",
    indexLabel: "Month",
    series: [
      { key: "starter", label: "Starter" },
      { key: "growth", label: "Growth" },
      { key: "enterprise", label: "Enterprise" },
    ],
    stacked: true,
    curve: "monotone",
    formatOptions: { style: "currency", currency: "USD" },
  },
  argTypes: {
    curve: {
      control: "inline-radio",
      options: ["monotone", "linear", "step"],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(100vw-2rem,44rem)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AreaChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stacked: Story = {};

export const Overlapping: Story = {
  args: {
    stacked: false,
    series: [
      { key: "growth", label: "Growth" },
      { key: "enterprise", label: "Enterprise" },
    ],
  },
};

export const KeyboardCrosshair: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("application", { name: "MRR by plan" });
    // Tab order: legend toggles, Table view, then the plot as one stop.
    for (let i = 0; i < 5; i += 1) await userEvent.tab();
    await expect(plot).toHaveFocus();
    await userEvent.keyboard("{Home}");
    // Stacked charts still read each series' own value.
    await expect(
      canvasElement.querySelector('[data-slot="area-chart-readout"]'),
    ).toHaveTextContent("Jan: Starter $8,200, Growth $21.4K, Enterprise $18K");
    await userEvent.keyboard("{Escape}{End}");
    await expect(
      canvasElement.querySelector('[data-slot="chart-tooltip"]'),
    ).toHaveTextContent("Aug");
  },
};

export const LegendFilter: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const growth = canvas.getByRole("button", { name: "Growth" });
    await userEvent.hover(growth);
    await expect(
      canvasElement.querySelector(
        '[data-slot="chart-area"][data-series="starter"]',
      ),
    ).toHaveAttribute("data-dimmed");
    await userEvent.click(growth);
    await expect(growth).toHaveAttribute("aria-pressed", "false");
    await expect(
      canvasElement.querySelector('[data-series="growth"]'),
    ).toBeNull();
  },
};

export const TableView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Table view" }));
    await expect(canvas.getAllByRole("row")).toHaveLength(data.length + 1);
  },
};

export const SingleSeries: Story = {
  args: {
    stacked: false,
    series: [{ key: "growth", label: "Growth", color: "chart-3" }],
  },
};

export const Gaps: Story = {
  args: {
    stacked: false,
    series: [{ key: "growth", label: "Growth" }],
    data: data.map((row, i) =>
      i === 3 || i === 4 ? { ...row, growth: null } : row,
    ),
  },
};

export const Empty: Story = { args: { data: [] } };

export const Refetching: Story = { args: { loading: true } };
