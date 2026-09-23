"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle, Sparkles } from "lucide-react";
import {
  Button,
  ChatBubble,
  type ChatAttachment,
  type ChatMessageData,
  type ChatPrompt,
  type ChatRun,
  type ChatBubblePosition,
} from "@dethink/components";

const conversationId = "chat-bubble-demo";
const response =
  "Absolutely. Start with one small step: choose a conversation your customers have every day, and make that experience feel effortless. You can customize this widget’s appearance and connect it to your own support team or AI service.";

/** Local simulation only. Replace these handlers with your application's transport. */
export function ChatBubbleBasic() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<ChatBubblePosition>("bottom-right");
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [run, setRun] = useState<ChatRun>();
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [unread, setUnread] = useState(0);
  const [failNext, setFailNext] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  function stream() {
    if (timer.current) clearInterval(timer.current);
    const id = crypto.randomUUID();
    let cursor = 0;
    setRun({ id, conversationId, status: "submitted", label: "Thinking…" });
    timer.current = setInterval(() => {
      cursor = Math.min(cursor + 12, response.length);
      const complete = cursor === response.length;
      setRun({
        id,
        conversationId,
        status: complete ? "completed" : "running",
        label: complete ? "Response complete" : "Writing…",
        messageId: id,
      });
      setMessages((current) => {
        const reply: ChatMessageData = {
          id,
          conversationId,
          role: "assistant",
          name: "Dethink",
          status: complete ? "complete" : "streaming",
          parts: [
            { id: "text", type: "text", text: response.slice(0, cursor) },
          ],
        };
        return current.some((message) => message.id === id)
          ? current.map((message) => (message.id === id ? reply : message))
          : [...current, reply];
      });
      if (complete) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        if (!openRef.current) setUnread((count) => count + 1);
      }
    }, 100);
  }
  function send(prompt: ChatPrompt) {
    if (failNext) {
      setFailNext(false);
      throw new Error(
        "Demo connection interrupted. Your draft is safe — send again to retry.",
      );
    }
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        conversationId,
        role: "user",
        name: "You",
        createdAt: new Date().toISOString(),
        parts: [
          ...(prompt.text
            ? [{ id: "text", type: "text" as const, text: prompt.text }]
            : []),
          ...prompt.attachments.map((attachment) => ({
            id: attachment.id,
            type: "attachment" as const,
            attachment,
          })),
        ],
      },
    ]);
    setAttachments([]);
    stream();
  }
  function changeOpen(next: boolean) {
    setOpen(next);
    if (next) setUnread(0);
  }
  return (
    <div className="w-full" data-slot="chat-bubble-demo">
      <div className="bg-muted/30 border-border relative overflow-hidden rounded-2xl border p-6 sm:p-10">
        <div className="text-muted-foreground mb-8 flex items-center gap-2 text-xs font-medium tracking-widest uppercase">
          <span className="bg-primary size-1.5 rounded-full" /> A little closer
          to your customers
        </div>
        <div className="max-w-md">
          <h3 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Good conversations
            <br />
            start with a hello.
          </h3>
          <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-6">
            A quiet presence in the corner. A helpful conversation, one click
            away.
          </p>
          <Button
            className="mt-6"
            onClick={() => changeOpen(true)}
            rightIcon={<ArrowUpRight aria-hidden="true" />}
          >
            Try the chat
          </Button>
        </div>
        <div className="border-border mt-10 flex flex-wrap items-center gap-3 border-t pt-5">
          <label className="text-muted-foreground flex items-center gap-2 text-xs">
            Position
            <select
              aria-label="Chat position"
              value={position}
              onChange={(event) =>
                setPosition(event.target.value as ChatBubblePosition)
              }
              className="border-border bg-background text-foreground rounded-lg border px-2 py-1.5"
            >
              <option value="bottom-right">Bottom right</option>
              <option value="bottom-left">Bottom left</option>
            </select>
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFailNext(true)}
            disabled={failNext}
          >
            {failNext ? "Next send will fail" : "Simulate a send failure"}
          </Button>
          <span className="text-muted-foreground text-xs">
            Local demo · no messages or files are uploaded
          </span>
        </div>
      </div>
      <ChatBubble
        open={open}
        onOpenChange={changeOpen}
        position={position}
        offset="1rem"
        triggerProps={{
          unreadCount: unread,
          "aria-label": "Chat with Dethink",
        }}
        contentProps={{
          title: "Dethink",
          subtitle: "A little help, right here",
          footer: "Demo conversation · sample responses",
        }}
        chat={{
          conversationId,
          messages,
          run,
          scroll: { contentClassName: "px-4 sm:px-4" },
          className: "[&>div:last-of-type]:px-4 [&>div:last-of-type]:sm:px-4",
          emptyState: (
            <div className="flex min-h-52 flex-col items-start justify-center gap-4 py-5">
              <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
                <Sparkles aria-hidden="true" className="size-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Hi there. What’s on your mind?
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  Ask a question, share an idea, or tell us what you’re working
                  on.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDraft("How can I get started?")}
                leftIcon={<MessageCircle aria-hidden="true" />}
              >
                Help me get started
              </Button>
            </div>
          ),
          children:
            run?.status === "stopped" || run?.status === "error" ? (
              <Button size="sm" variant="outline" onClick={stream}>
                Try again
              </Button>
            ) : null,
          messageActions: {
            onCopy: (text) => navigator.clipboard.writeText(text),
          },
          prompt: {
            value: draft,
            onValueChange: setDraft,
            onSend: send,
            placeholder: "Write a message…",
            maxHeight: 112,
            onStop: () => {
              if (timer.current) clearInterval(timer.current);
              timer.current = null;
              setRun((current) =>
                current
                  ? {
                      ...current,
                      status: "stopped",
                      label: "Stopped · partial response saved",
                    }
                  : current,
              );
              setMessages((current) =>
                current.map((message) =>
                  message.status === "streaming"
                    ? { ...message, status: "stopped" }
                    : message,
                ),
              );
            },
            attachments,
            allowAttachmentOnly: true,
            fileRules: { maxFiles: 3, maxFileSize: 5 * 1024 * 1024 },
            onFiles: (files) =>
              setAttachments((current) => [
                ...current,
                ...files.map((file) => ({
                  id: crypto.randomUUID(),
                  name: file.name,
                  mediaType: file.type || "application/octet-stream",
                  size: file.size,
                  status: "ready" as const,
                })),
              ]),
            onAttachmentRemove: (attachment) =>
              setAttachments((current) =>
                current.filter((item) => item.id !== attachment.id),
              ),
          },
        }}
      />
    </div>
  );
}
