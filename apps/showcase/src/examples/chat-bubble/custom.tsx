"use client";

import { useState } from "react";
import { Headphones } from "lucide-react";
import {
  Button,
  Chat,
  ChatBubble,
  ChatBubbleClose,
  ChatBubbleContent,
  ChatBubbleTrigger,
} from "@dethink/components";

export function ChatBubbleCustom() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm leading-6">
        A wider support panel on the left, with a custom header and launcher.
        Enable it to compare two independent widgets.
      </p>
      <Button variant="outline" onClick={() => setEnabled(!enabled)}>
        {enabled ? "Remove support widget" : "Enable support widget"}
      </Button>
      {enabled && (
        <ChatBubble
          position="bottom-left"
          width="28rem"
          height="32rem"
          offset="1rem"
          defaultOpen
        >
          <ChatBubbleTrigger aria-label="Open support" unreadCount={2}>
            <Headphones aria-hidden="true" className="size-6" />
          </ChatBubbleTrigger>
          <ChatBubbleContent
            aria-label="Customer support"
            header={
              <div className="bg-primary text-primary-foreground flex items-center gap-3 px-5 py-4">
                <Headphones aria-hidden="true" className="size-5" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold">Customer support</h2>
                  <p className="mt-1 text-xs opacity-80">We’re here to help</p>
                </div>
                <ChatBubbleClose
                  aria-label="Minimize support"
                  className="hover:bg-primary-foreground/10"
                />
              </div>
            }
            footer="Your team. Your conversation."
          >
            <Chat
              conversationId="support-example"
              messages={[]}
              emptyState={
                <p className="text-muted-foreground py-8 text-sm">
                  Connect this panel to your support service. This preview shows
                  a read-only empty state.
                </p>
              }
            />
          </ChatBubbleContent>
        </ChatBubble>
      )}
    </div>
  );
}
