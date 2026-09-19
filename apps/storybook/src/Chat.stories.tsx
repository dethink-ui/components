import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Chat,
  DethinkProvider,
  type ChatMessageData,
  type ChatActivityItem,
} from "@dethink/components";

const meta = {
  title: "AI/Chat",
  component: Chat,
  args: { conversationId: "story", messages: [] },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Chat>;
export default meta;
type Story = StoryObj<typeof meta>;
function Conversation({
  theme = "light",
  density = "comfortable",
  dir = "ltr",
}: {
  theme?: "light" | "dark";
  density?: "compact" | "comfortable";
  dir?: "ltr" | "rtl";
}) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  return (
    <DethinkProvider theme={theme} density={density} dir={dir}>
      <Chat
        conversationId="story"
        messages={messages}
        className="border-border max-w-3xl rounded-xl border"
        emptyState={<p>How can I help?</p>}
        prompt={{
          onSend: ({ text }) =>
            setMessages((current) => [
              ...current,
              {
                id: String(current.length),
                conversationId: "story",
                role: "user",
                parts: [{ id: "text", type: "text", text }],
              },
            ]),
        }}
      />
    </DethinkProvider>
  );
}
export const ConversationFlow: Story = {
  render: () => <Conversation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox"), "Plan my day{Enter}");
    await expect(canvas.getByText("Plan my day")).toBeVisible();
    await expect(canvas.getByRole("textbox")).toHaveValue("");
  },
};
export const Dark: Story = { render: () => <Conversation theme="dark" /> };
export const CompactRTL: Story = {
  render: () => <Conversation density="compact" dir="rtl" />,
};

function ActivityScenario() {
  const [items, setItems] = useState<ChatActivityItem[]>([
    {
      id: "think",
      runId: "r",
      kind: "thinking",
      status: "completed",
      label: "Understood your request",
    },
    {
      id: "tool",
      runId: "r",
      kind: "approval",
      status: "needs-input",
      label: "Read project notes?",
      summary: "Read-only access to two sample documents.",
      approvalId: "approval",
    },
  ]);
  return (
    <DethinkProvider>
      <Chat
        conversationId="activity"
        messages={[]}
        run={{ id: "r", conversationId: "activity", status: "running" }}
        activity={{
          items,
          onApproval: ({ approved }) =>
            setItems((current) =>
              current.map((item) =>
                item.id === "tool"
                  ? {
                      ...item,
                      status: approved ? "completed" : "cancelled",
                      decision: approved ? "approved" : "denied",
                    }
                  : item,
              ),
            ),
        }}
        prompt={{ onSend: () => {}, onStop: () => false }}
      />
    </DethinkProvider>
  );
}
export const ToolApproval: Story = {
  render: () => <ActivityScenario />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Approve" }));
    await expect(canvas.getByText("Approved", { exact: true })).toBeVisible();
  },
};
export const UploadError: Story = {
  render: () => (
    <DethinkProvider>
      <Chat
        conversationId="uploads"
        messages={[]}
        prompt={{
          onSend: () => false,
          defaultValue: "Review the attachment",
          attachments: [
            {
              id: "file",
              name: "launch-notes.pdf",
              mediaType: "application/pdf",
              status: "error",
              error: "Upload interrupted. Remove or retry the file.",
            },
          ],
          onAttachmentRetry: () => false,
          onAttachmentRemove: () => false,
        }}
      />
    </DethinkProvider>
  ),
};
export const Stopped: Story = {
  render: () => (
    <DethinkProvider>
      <Chat
        conversationId="stopped"
        messages={[
          {
            id: "partial",
            conversationId: "stopped",
            role: "assistant",
            status: "stopped",
            parts: [
              {
                id: "text",
                type: "text",
                text: "Start with a focused audience and one clear outcome…",
              },
            ],
          },
        ]}
        run={{ id: "r", conversationId: "stopped", status: "stopped" }}
        messageActions={{ onRetry: () => false }}
        prompt={{ onSend: () => {} }}
      />
    </DethinkProvider>
  ),
};
