import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DethinkProvider, OrbitalGlowBackground } from "@dethink/components";

const meta = {
  title: "Backgrounds/OrbitalGlowBackground",
  component: OrbitalGlowBackground,
  args: {
    className: "rounded-2xl p-16",
    intensity: "bold",
    children: (
      <div className="bg-background/80 max-w-md rounded-xl p-6">
        <h1 className="text-4xl font-semibold">
          Make room for your next idea.
        </h1>
        <button
          type="button"
          className="bg-primary text-primary-foreground mt-6 rounded px-4 py-2"
        >
          Explore the preview
        </button>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <DethinkProvider>
        <Story />
      </DethinkProvider>
    ),
  ],
} satisfies Meta<typeof OrbitalGlowBackground>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = {
  decorators: [
    (Story) => (
      <DethinkProvider theme="dark">
        <Story />
      </DethinkProvider>
    ),
  ],
};
export const Static: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvasElement.querySelector("canvas")).toBeNull();
    await expect(canvas.getByRole("heading")).toBeVisible();
  },
};
export const Interactive: Story = { args: { interactive: true } };
export const Subtle: Story = { args: { speed: "slow", intensity: "faint" } };
export const Responsive: Story = {
  args: { className: "max-w-sm rounded-xl p-6" },
};
