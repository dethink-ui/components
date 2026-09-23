import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ChatBubble, DethinkProvider } from "@dethink/components";

const meta = {
  title: "AI/ChatBubble",
  component: ChatBubble,
  parameters: { layout: "fullscreen" },
  args: {
    chat: {
      conversationId: "bubble-story",
      messages: [],
      prompt: { onSend: () => true },
    },
  },
} satisfies Meta<typeof ChatBubble>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
export const Unread: Story = { args: { triggerProps: { unreadCount: 4 } } };
export const Dark: Story = {
  render: (args) => (
    <DethinkProvider theme="dark">
      <ChatBubble {...args} defaultOpen />
    </DethinkProvider>
  ),
};
export const CompactRTL: Story = {
  render: (args) => (
    <DethinkProvider density="compact" dir="rtl">
      <ChatBubble {...args} defaultOpen position="bottom-left" />
    </DethinkProvider>
  ),
};
export const ReducedMotion: Story = {
  args: { motion: "none", defaultOpen: true },
};
export const DraftSurvivesMinimize: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "Open chat" }));
    await userEvent.type(page.getByRole("textbox"), "Keep this draft");
    await userEvent.click(page.getByRole("button", { name: "Minimize chat" }));
    await userEvent.click(page.getByRole("button", { name: "Open chat" }));
    await expect(page.getByRole("textbox")).toHaveValue("Keep this draft");
  },
};
