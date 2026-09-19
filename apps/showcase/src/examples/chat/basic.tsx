"use client";

import { useState } from "react";
import { Chat, Button, type ChatMessageData } from "@dethink/components";

export function ChatBasic() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [draft, setDraft] = useState("");
  return (
    <Chat
      conversationId="basic"
      messages={messages}
      className="border-border h-[440px] rounded-2xl border"
      header={
        <div className="border-border border-b px-6 py-4 text-sm font-semibold">
          Your thinking partner
        </div>
      }
      emptyState={
        <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
          <h3 className="text-lg font-semibold">
            A little help goes a long way.
          </h3>
          <p className="text-muted-foreground max-w-xs text-sm">
            Turn a rough idea into a clear next step.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDraft("Help me plan a product launch")}
          >
            Plan a product launch
          </Button>
        </div>
      }
      prompt={{
        value: draft,
        onValueChange: setDraft,
        onSend: ({ text }) => {
          const id = crypto.randomUUID();
          setMessages((current) => [
            ...current,
            {
              id,
              conversationId: "basic",
              role: "user",
              parts: [{ id: "text", type: "text", text }],
            },
            {
              id: `${id}-reply`,
              conversationId: "basic",
              role: "assistant",
              name: "Dethink",
              parts: [
                {
                  id: "text",
                  type: "text",
                  text: "Start with the outcome you want to create, then choose the smallest next step. Who is this for, and what should become easier for them?",
                },
              ],
            },
          ]);
        },
        footer: "Local example · responses are sample content",
      }}
    />
  );
}
