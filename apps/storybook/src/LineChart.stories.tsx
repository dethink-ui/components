import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { LineChart } from "@dethink/components";

const data = [
  { month: "Jan", revenue: 42_100, expenses: 31_200, payroll: 18_400 },
  { month: "Feb", revenue: 44_800, expenses: 32_100, payroll: 18_400 },
  { month: "Mar", revenue: 43_900, expenses: 34_800, payroll: 19_100 },
  { month: "Apr", revenue: 48_200, expenses: 33_900, payroll: 19_100 },
  { month: "May", revenue: 51_600, expenses: 35_600, payroll: 19_800 },
  { month: "Jun", revenue: 55_300, expenses: 37_200, payroll: 21_200 },
  { month: "Jul", revenue: 54_100, expenses: 38_900, payroll: 21_200 },
  { month: "Aug", revenue: 58_900, expenses: 38_100, payroll: 21_900 },
];

const meta = {
  title: "Components/LineChart",
  component: LineChart,
  args: {
    "aria-label": "Revenue vs spend",
    data,
    index: "month",
    indexLabel: "Month",
    series: [
      { key: "revenue", label: "Revenue" },
      { key: "expenses", label: "Expenses" },
      { key: "payroll", label: "Payroll" },
    ],
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
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const KeyboardCrosshair: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("application", { name: "Revenue vs spend" });
    // Tab order: legend toggles, Table view, then the plot as one stop.
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(plot).toHaveFocus();
    await userEvent.keyboard("{Home}");
    const readout = canvasElement.querySelector(
      '[data-slot="line-chart-readout"]',
    );
    await expect(readout).toHaveTextContent(
      "Jan: Revenue $42.1K, Expenses $31.2K, Payroll $18.4K",
    );
    await userEvent.keyboard("{ArrowRight}");
    await expect(readout).toHaveTextContent("Feb:");
    await expect(
      canvasElement.querySelector('[data-slot="chart-tooltip"]'),
    ).toHaveTextContent("$44.8K");
  },
};

export const LegendFilter: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expenses = canvas.getByRole("button", { name: "Expenses" });
    await userEvent.hover(expenses);
    await expect(
      canvasElement.querySelector('[data-series="revenue"]'),
    ).toHaveAttribute("data-dimmed");
    await userEvent.click(expenses);
    await expect(expenses).toHaveAttribute("aria-pressed", "false");
    await expect(
      canvasElement.querySelector('[data-series="expenses"]'),
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
    series: [{ key: "revenue", label: "Revenue" }],
    includeZero: false,
  },
};

export const Gaps: Story = {
  args: {
    data: data.map((row, i) =>
      i === 3 || i === 4 ? { ...row, revenue: null } : row,
    ),
  },
};

export const Empty: Story = { args: { data: [] } };

export const Refetching: Story = { args: { loading: true } };
