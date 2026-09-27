import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { BarChart } from "@dethink/components";

const data = [
  { month: "Jan", organic: 1_240, paid: 610, referral: 180 },
  { month: "Feb", organic: 1_310, paid: 680, referral: 210 },
  { month: "Mar", organic: 1_480, paid: 720, referral: 260 },
  { month: "Apr", organic: 1_390, paid: 910, referral: 240 },
  { month: "May", organic: 1_620, paid: 880, referral: 310 },
  { month: "Jun", organic: 1_750, paid: 940, referral: 330 },
];

const meta = {
  title: "Components/BarChart",
  component: BarChart,
  args: {
    "aria-label": "Signups by channel",
    data,
    index: "month",
    indexLabel: "Month",
    series: [
      { key: "organic", label: "Organic" },
      { key: "paid", label: "Paid" },
      { key: "referral", label: "Referral" },
    ],
    stacked: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(100vw-2rem,44rem)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grouped: Story = {};

export const Stacked: Story = { args: { stacked: true } };

export const Negative: Story = {
  args: {
    stacked: true,
    data: [
      { month: "Q1", organic: 84, paid: 31, referral: -22 },
      { month: "Q2", organic: 91, paid: 36, referral: -18 },
      { month: "Q3", organic: 78, paid: 42, referral: -27 },
      { month: "Q4", organic: 102, paid: 47, referral: -21 },
    ],
  },
};

export const KeyboardReadout: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("application", {
      name: "Signups by channel",
    });
    // Tab order: legend toggles, Table view, then the plot as one stop.
    for (let i = 0; i < 5; i += 1) await userEvent.tab();
    await expect(plot).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(
      canvasElement.querySelector('[data-slot="bar-chart-readout"]'),
    ).toHaveTextContent("Jan: Organic 1,240, Paid 610, Referral 180");
    await expect(
      canvasElement.querySelector('[data-slot="chart-band-highlight"]'),
    ).not.toBeNull();
  },
};

export const BarHover: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector(
      '[data-series="paid"] [data-slot="chart-bar"]',
    )!;
    await userEvent.hover(bar);
    await expect(
      canvasElement.querySelector(
        '[data-slot="chart-tooltip-item"][data-active]',
      ),
    ).toHaveTextContent("Paid");
    await expect(
      canvasElement.querySelector(
        '[data-slot="chart-bars"][data-series="organic"]',
      ),
    ).toHaveAttribute("data-dimmed");
  },
};

export const LegendFilter: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paid = canvas.getByRole("button", { name: "Paid" });
    await userEvent.click(paid);
    await expect(paid).toHaveAttribute("aria-pressed", "false");
    await expect(
      canvasElement.querySelector('[data-series="paid"]'),
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
  args: { series: [{ key: "organic", label: "Organic", color: "chart-7" }] },
};

export const ManyCategories: Story = {
  args: {
    series: [{ key: "organic", label: "Organic" }],
    data: Array.from({ length: 60 }, (_, i) => ({
      month: `D${i + 1}`,
      organic: 400 + Math.round(Math.sin(i / 4) * 180 + i * 6),
    })),
  },
};

export const Empty: Story = { args: { data: [] } };

export const Refetching: Story = { args: { loading: true } };
