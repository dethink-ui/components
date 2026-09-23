import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  DethinkProvider,
  Sidebar,
  SidebarActivity,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@dethink/components";

const meta = {
  title: "Components/SidebarActivity",
  component: SidebarActivity,
  args: {
    items: [
      {
        id: "brief",
        title: "Launch brief",
        status: "attention",
        action: { label: "Review brief", href: "#review" },
      },
      {
        id: "index",
        title: "Indexing documents",
        status: "running",
        progress: 62,
      },
      { id: "export", title: "Weekly export", status: "queued" },
    ],
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Sidebar className="h-[30rem] rounded-lg border">
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <Story />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof SidebarActivity>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BackgroundWork: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: /Open activity/ }),
    );
    await expect(
      canvas.getByRole("region", { name: "Activity" }),
    ).toHaveFocus();
  },
};
export const Empty: Story = { args: { items: [] } };
export const Complete: Story = {
  args: {
    items: [{ id: "done", title: "Import complete", status: "complete" }],
  },
};
export const Indeterminate: Story = {
  args: {
    items: [{ id: "run", title: "Preparing your export", status: "running" }],
  },
};
export const CompactDarkRtl: Story = {
  decorators: [
    (Story) => (
      <DethinkProvider theme="dark" density="compact" dir="rtl">
        <Story />
      </DethinkProvider>
    ),
  ],
};
