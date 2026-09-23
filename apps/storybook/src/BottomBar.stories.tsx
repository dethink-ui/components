import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  BottomBar,
  BottomBarHeader,
  BottomBarTrigger,
  BottomBarContent,
  DethinkProvider,
} from "@dethink/components";
const meta = {
  title: "Components/BottomBar",
  component: BottomBar,
  args: { size: "sm" },
  render: (args) => (
    <BottomBar {...args} className="rounded-xl border">
      <BottomBarHeader>
        <strong>Workbench</strong>
        <BottomBarTrigger className="ms-auto" />
      </BottomBarHeader>
      <BottomBarContent aria-label="Work">
        <label>
          Notes
          <input
            aria-label="Notes"
            className="border-border m-2 rounded border p-2"
          />
        </label>
      </BottomBarContent>
    </BottomBar>
  ),
} satisfies Meta<typeof BottomBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Notes"), "Keep my work");
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.queryByRole("region")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByLabelText("Notes")).toHaveValue("Keep my work");
  },
};
export const Closed: Story = { args: { defaultOpen: false } };
export const Large: Story = { args: { size: "lg" } };
export const CustomHeight: Story = {
  args: { height: 180, maxHeight: "50dvh" },
};
export const CompactDarkRTL: Story = {
  decorators: [
    (Story) => (
      <DethinkProvider theme="dark" density="compact">
        <div dir="rtl">
          <Story />
        </div>
      </DethinkProvider>
    ),
  ],
};
