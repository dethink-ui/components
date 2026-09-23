import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DethinkProvider, Slider, ExpressiveSlider } from "@dethink/components";
function NumericSliderStory(props: { label: string; defaultValue: number }) {
  return <Slider {...props} />;
}
const meta = {
  title: "Components/Slider",
  component: NumericSliderStory,
  args: { label: "Volume", defaultValue: 40 },
  decorators: [
    (Story) => (
      <DethinkProvider className="max-w-lg p-8">
        <Story />
      </DethinkProvider>
    ),
  ],
} satisfies Meta<typeof NumericSliderStory>;
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
export const Stepper: Story = {
  render: () => (
    <Slider
      label="Speed"
      mode="stepper"
      steps={[
        { value: 0, label: "Still" },
        { value: 1, label: "Steady" },
        { value: 4, label: "Rapid" },
      ]}
      defaultValue={1}
    />
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("slider");
    input.focus();
    await userEvent.keyboard("{End}");
    await expect(input).toHaveAttribute("aria-valuetext", "Rapid");
  },
};
export const Sizes: Story = {
  render: () => (
    <div className="grid gap-5">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Slider key={size} label={size} size={size} defaultValue={65} />
      ))}
    </div>
  ),
};
export const Expressive: Story = {
  render: () => (
    <ExpressiveSlider
      label="Pace"
      mode="stepper"
      steps={[
        { value: 0, label: "Still" },
        { value: 1, label: "Steady" },
        { value: 4, label: "Rapid" },
      ]}
      defaultValue={1}
      size="xl"
    />
  ),
};
