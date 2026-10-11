import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  DethinkProvider,
  Sparkline,
  type ChartTokenColor,
} from "@dethink/components";

const revenue = [42, 48, 45, 53, 51, 58, 64, 61, 70, 74, 72, 81];
const slots: ChartTokenColor[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
  "chart-8",
];

const meta = {
  title: "Components/Sparkline",
  component: Sparkline,
  args: {
    data: revenue,
    variant: "line",
    color: "chart-1",
    label: "Weekly revenue",
    className: "h-12 w-64",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["line", "area", "bar"] },
    color: { control: "select", options: slots },
    curve: { control: "inline-radio", options: ["monotone", "linear", "step"] },
  },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", {
        name: "Weekly revenue: 12 values, from 42 to 81; low 42, high 81",
      }),
    ).toBeVisible();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="grid w-72 gap-6">
      <Sparkline {...args} variant="line" markers />
      <Sparkline {...args} variant="area" color="chart-3" />
      <Sparkline {...args} variant="bar" color="chart-7" />
    </div>
  ),
};

export const GapsAndEdgeCases: Story = {
  render: (args) => (
    <div className="grid w-72 gap-6">
      <Sparkline
        {...args}
        data={[4, 6, null, null, 9, 7, 11]}
        label="With gaps"
      />
      <Sparkline {...args} data={[5]} label="Single value" />
      <Sparkline {...args} data={[]} label="No data" />
      <Sparkline {...args} data={[3, 3, 3, 3]} label="Flat" />
      <Sparkline
        {...args}
        data={[4, -2, 6, -5, 3]}
        variant="bar"
        label="Negative values"
      />
    </div>
  ),
};

function Palette(args: Story["args"]) {
  return (
    <div className="grid w-80 gap-3">
      {slots.map((slot, index) => (
        <Sparkline
          key={slot}
          {...args}
          data={revenue.map((v, i) => v + ((i * (index + 3)) % 11))}
          variant="area"
          color={slot}
          label={slot}
          className="h-9 w-full"
        />
      ))}
    </div>
  );
}

export const PaletteLightAndDark: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-6">
      <DethinkProvider theme="light" className="bg-background rounded-lg p-4">
        <Palette {...args} />
      </DethinkProvider>
      <DethinkProvider theme="dark" className="bg-background rounded-lg p-4">
        <Palette {...args} />
      </DethinkProvider>
    </div>
  ),
};

export const ReducedMotionOff: Story = {
  args: { animate: false, variant: "area", markers: true },
};
