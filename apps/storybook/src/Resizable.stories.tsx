import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  DethinkProvider,
  ResizableWorkspace,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@dethink/components";

const meta = {
  title: "Components/Resizable",
  component: ResizableWorkspace,
  decorators: [
    (Story) => (
      <DethinkProvider className="p-6">
        <Story />
      </DethinkProvider>
    ),
  ],
  args: {
    id: "story-workspace",
    label: "Workspace",
    className: "h-96",
    panes: [
      {
        id: "sources",
        title: "Sources",
        collapsible: true,
        children: <button type="button">Read source</button>,
      },
      {
        id: "draft",
        title: "Draft",
        children: (
          <textarea
            aria-label="Draft text"
            defaultValue="Keep this thought"
            className="bg-background w-full"
          />
        ),
      },
    ],
  },
} satisfies Meta<typeof ResizableWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Workspace: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Focus Draft" }));
    await expect(
      canvas.getByRole("button", { name: "Restore layout" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Read source" }),
    ).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", { name: "Restore layout" }),
    );
    await expect(canvas.getByRole("textbox")).toHaveValue("Keep this thought");
  },
};
export const DarkCompact: Story = {
  decorators: [
    (Story) => (
      <DethinkProvider theme="dark" density="compact">
        <Story />
      </DethinkProvider>
    ),
  ],
};
export const Responsive: Story = {
  args: { compactAt: 600, className: "h-96 max-w-sm data-[compact]:h-auto" },
};
export const Vertical: Story = {
  args: { orientation: "vertical", className: "h-[32rem]" },
};
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <DethinkProvider dir="rtl">
        <Story />
      </DethinkProvider>
    ),
  ],
};
export const Nested: Story = {
  render: () => (
    <div className="h-96">
      <ResizablePanelGroup>
        <ResizablePanel minSize="20%">Navigation</ResizablePanel>
        <ResizableHandle aria-label="Navigation" />
        <ResizablePanel>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel>Editor</ResizablePanel>
            <ResizableHandle aria-label="Editor" />
            <ResizablePanel>Output</ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};
