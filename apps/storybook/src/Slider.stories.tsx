import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DethinkProvider, Slider } from "@dethink/components";
const meta = {
  title: "Components/Slider",
  component: Slider,
  args: { label: "Volume", defaultValue: 40 },
  decorators: [
    (Story) => (
      <DethinkProvider className="max-w-lg p-8">
        <Story />
      </DethinkProvider>
    ),
  ],
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Numeric: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("slider");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveValue("41");
  },
};
export const Range: Story = {
  render: () => (
    <Slider<[number, number]> label="Budget" defaultValue={[20, 80]} />
  ),
};
export const DarkCompact: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" className="p-8">
      <Slider label="Intensity" defaultValue={65} />
      <Slider label="Disabled" disabled defaultValue={30} />
    </DethinkProvider>
  ),
};
export const RightToLeft: Story = {
  render: () => (
    <DethinkProvider dir="rtl">
      <Slider label="Volume" defaultValue={40} />
    </DethinkProvider>
  ),
};
