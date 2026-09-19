"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Lightbulb,
  MessageSquare,
  PanelLeft,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Chat,
  CitationCard,
  ConversationList,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  IconButton,
  type ChatMessageActionHandlers,
  type ChatPartRenderer,
} from "@dethink/components";
import { MarkdownMessage } from "@dethink/components/chat-markdown";
import { chatModels, useChatDemo } from "./use-chat-demo";

const renderPart: ChatPartRenderer = (part) => {
  if (part.type === "text") return <MarkdownMessage text={part.text} />;
  if (part.type === "citation")
    return <CitationCard citation={part.citation} />;
  return undefined;
};
const suggestions = [
  {
    icon: BookOpen,
    title: "Find a clearer direction",
    prompt: "Help me plan a thoughtful product launch",
  },
  {
    icon: Terminal,
    title: "Build something useful",
    prompt: "Show me code for a chat component",
  },
  {
    icon: ShieldCheck,
    title: "Keep me in control",
    prompt: "Ask for approval before reading the launch documents",
  },
];
export function ChatWorkspace({
  embedded = false,
  startEmpty = false,
}: {
  embedded?: boolean;
  startEmpty?: boolean;
}) {
  const demo = useChatDemo(startEmpty);
  const Heading = embedded ? "h3" : "h2";
  const { current, update, retry, version } = demo;
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const conversations = Object.values(demo.records).map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    description:
      conversation.id === "launch"
        ? "Launch strategy & next steps"
        : "A little space to think",
    unread: conversation.unread,
    running: ["running", "submitted", "stopping"].includes(
      conversation.state.run?.status ?? "",
    ),
  }));
  const actions = useMemo<ChatMessageActionHandlers>(
    () => ({
      onCopy: async (text) => {
        if (!navigator.clipboard)
          throw new Error(
            "Clipboard unavailable. Select and copy the text instead.",
          );
        await navigator.clipboard.writeText(text);
      },
      onFeedback: () => true,
      onEdit: (message, text) =>
        update(message.conversationId, (conversation) => ({
          ...conversation,
          state: {
            ...conversation.state,
            messages: conversation.state.messages.map((item) =>
              item.id === message.id
                ? { ...item, parts: [{ id: "text", type: "text", text }] }
                : item,
            ),
          },
        })),
      onRetry: retry,
      onRegenerate: retry,
      onVersionChange: version,
    }),
    [update, retry, version],
  );
  function setDraft(text: string) {
    demo.update(current.id, (conversation) => ({
      ...conversation,
      draft: text,
    }));
  }
  const history = (
    <ConversationList
      conversations={conversations}
      value={current.id}
      onValueChange={(id) => {
        demo.select(id);
        setHistoryOpen(false);
      }}
      onNew={() => {
        demo.create();
        setHistoryOpen(false);
      }}
      onRename={(id, title) =>
        demo.update(id, (conversation) => ({ ...conversation, title }))
      }
      onDelete={demo.remove}
      className="h-full"
    />
  );
  return (
    <div
      data-slot="chat-workspace"
      className={`border-border bg-background flex min-h-0 min-w-0 overflow-hidden rounded-2xl border shadow-sm ${embedded ? "h-[660px]" : "h-[min(860px,calc(100dvh-9rem))] min-h-[580px]"}`}
    >
      {!embedded && (
        <aside className="border-border bg-muted/25 hidden w-64 shrink-0 flex-col border-e p-4 lg:flex">
          <div className="mb-8 flex items-center gap-2.5 px-1 pt-2">
            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl">
              <Sparkles className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              dethink
              <span className="text-muted-foreground ms-1.5 font-normal">
                assistant
              </span>
            </span>
          </div>
          <div className="min-h-0 flex-1">{history}</div>
          <div className="border-border mt-5 border-t pt-4">
            <div className="bg-background/70 border-border/70 rounded-xl border p-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Lightbulb className="text-primary size-3.5" />
                Room for a good idea
              </div>
              <p className="text-muted-foreground mt-2 text-[11px] leading-5">
                A calm space to explore, make connections, and move things
                forward.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2.5 px-1">
              <Avatar name="Alex Morgan" size="sm" />
              <div className="min-w-0 text-xs">
                <p className="font-medium">Alex Morgan</p>
                <p className="text-muted-foreground mt-0.5 text-[10px]">
                  Personal workspace
                </p>
              </div>
              <Badge variant="soft" className="ms-auto text-[10px]">
                Demo
              </Badge>
            </div>
          </div>
        </aside>
      )}
      <Chat
        conversationId={current.id}
        messages={current.state.messages}
        run={current.state.run}
        renderPart={renderPart}
        messageActions={actions}
        className="h-full min-w-0 flex-1"
        activity={{ items: current.state.activity, onApproval: demo.approve }}
        scroll={{
          initialPosition: demo.scroll.current.get(current.id),
          onPositionChange: (position) =>
            demo.scroll.current.set(current.id, position),
        }}
        header={
          <header className="border-border flex min-h-16 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className={embedded ? "" : "lg:hidden"}>
                <Drawer
                  open={historyOpen}
                  onOpenChange={setHistoryOpen}
                  direction="left"
                >
                  <DrawerTrigger
                    variant="ghost"
                    size="icon"
                    aria-label="Open conversation history"
                  >
                    <PanelLeft className="size-4" />
                  </DrawerTrigger>
                  <DrawerContent
                    dismissible
                    showCloseButton
                    closeButtonLabel="Close history"
                  >
                    <DrawerHeader>
                      <DrawerTitle>Your conversations</DrawerTitle>
                      <DrawerDescription>
                        Pick up where you left off.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="min-h-0 flex-1 p-5">{history}</div>
                  </DrawerContent>
                </Drawer>
              </div>
              <div className="min-w-0">
                <Heading className="truncate text-sm font-semibold">
                  {current.title}
                </Heading>
                <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[10px]">
                  <span className="bg-success size-1.5 rounded-full" />
                  Your space to think things through
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground hidden text-[10px] sm:block">
                Sample conversation
              </span>
              <IconButton
                aria-label="Copy conversation"
                title="Copy conversation"
                size="sm"
                onClick={() => {
                  const text = current.state.messages
                    .map(
                      (message) =>
                        `${message.role}: ${message.parts
                          .filter((part) => part.type === "text")
                          .map((part) => part.text)
                          .join("\n")}`,
                    )
                    .join("\n\n");
                  if (!navigator.clipboard) {
                    setCopied("Clipboard unavailable");
                    return;
                  }
                  void navigator.clipboard.writeText(text).then(
                    () => setCopied("Conversation copied"),
                    () => setCopied("Clipboard permission denied"),
                  );
                }}
              >
                {copied === "Conversation copied" ? <Check /> : <Copy />}
              </IconButton>
            </div>
          </header>
        }
        emptyState={
          <div className="flex min-h-64 flex-col items-center justify-center py-8 text-center">
            <div className="border-primary/15 bg-primary/5 text-primary mb-5 flex size-14 items-center justify-center rounded-2xl border">
              <Sparkles className="size-6" />
            </div>
            <p className="text-muted-foreground mb-2 text-xs">
              A little clarity starts here
            </p>
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What’s on your mind?
            </h3>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-6">
              Bring a question, an unfinished idea, or something you’d like to
              make better.
            </p>
            <div className="mt-8 grid w-full max-w-lg gap-2 text-start">
              {suggestions.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setDraft(item.prompt)}
                  className="border-border bg-background hover:border-primary/30 hover:bg-primary/5 focus-visible:ring-ring group flex items-center gap-3 rounded-xl border p-3 text-start outline-none focus-visible:ring-2 motion-safe:transition-[background-color,border-color]"
                >
                  <item.icon
                    aria-hidden="true"
                    className="text-primary size-4"
                  />
                  <span className="flex-1 text-xs font-medium">
                    {item.title}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="text-muted-foreground size-3.5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 rtl:rotate-270"
                  />
                </button>
              ))}
            </div>
          </div>
        }
        prompt={{
          value: current.draft,
          onValueChange: setDraft,
          onSend: demo.begin,
          onStop: demo.stop,
          attachments: current.attachments,
          onFiles: (files) => demo.addFiles(current.id, files),
          onAttachmentRemove: (attachment) => {
            demo.clearTimers(attachment.id);
            demo.update(current.id, (conversation) => ({
              ...conversation,
              attachments: conversation.attachments.filter(
                (item) => item.id !== attachment.id,
              ),
            }));
          },
          onAttachmentRetry: (attachment) =>
            demo.upload(current.id, attachment, true),
          fileRules: {
            accept: "image/png,image/jpeg,image/webp,.txt,.md,.pdf",
            maxFiles: 4,
            maxFileSize: 10 * 1024 * 1024,
          },
          allowAttachmentOnly: true,
          models: chatModels,
          modelId: current.modelId,
          onModelChange: (modelId) =>
            demo.update(current.id, (conversation) => ({
              ...conversation,
              modelId,
            })),
          footer: "Sample responses · no messages or files leave this demo",
        }}
      />
      {!embedded && (
        <aside className="border-border bg-muted/10 hidden w-56 shrink-0 flex-col border-s p-5 xl:flex">
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold">
            <BookOpen className="size-3.5" />A little context
          </div>
          <p className="text-muted-foreground text-[11px] leading-5">
            Good answers start with the right context. Try a document-backed
            request.
          </p>
          <button
            type="button"
            onClick={() =>
              setDraft("Ask for approval before reading the launch documents")
            }
            className="border-border bg-background hover:border-primary/40 focus-visible:ring-ring mt-4 rounded-xl border p-3 text-start outline-none focus-visible:ring-2 motion-safe:transition-colors"
          >
            <FileText className="text-primary mb-3 size-5" />
            <p className="text-xs font-medium">Launch playbook</p>
            <p className="text-muted-foreground mt-1 text-[10px]">
              6 pages · Sample document
            </p>
            <span className="text-primary mt-3 inline-flex items-center gap-1 text-[10px] font-medium">
              Explore with approval <ChevronRight className="size-3" />
            </span>
          </button>
          <div className="border-border mt-7 border-t pt-5">
            <p className="mb-3 text-xs font-semibold">Try the interactions</p>
            <div className="space-y-1">
              {[
                {
                  label: "Thinking & slow streaming",
                  text: "Give me a slow response about our launch",
                },
                {
                  label: "Code & formatted answers",
                  text: "Show me code for a chat component",
                },
                {
                  label: "Recover from an error",
                  text: "Simulate a connection error",
                },
              ].map((item) => (
                <Button
                  key={item.label}
                  size="xs"
                  variant="ghost"
                  className="h-auto w-full justify-start px-0 py-2 text-start text-[11px] whitespace-normal"
                  onClick={() => setDraft(item.text)}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                size="xs"
                variant="ghost"
                className="h-auto w-full justify-start px-0 py-2 text-[11px]"
                onClick={() =>
                  demo.addFiles(current.id, [
                    new File(["Sample upload"], "reference-fail.txt", {
                      type: "text/plain",
                    }),
                  ])
                }
              >
                Recover a failed upload
              </Button>
            </div>
          </div>
          <div className="text-muted-foreground mt-auto pt-8 text-[10px] leading-5">
            <MessageSquare className="mb-2 size-4" />
            Switch conversations while a response is running. Your draft and
            progress stay with each one.
          </div>
        </aside>
      )}
      <span className="sr-only" role="status">
        {copied}
      </span>
    </div>
  );
}

export function EmbeddedCopilot() {
  return (
    <div className="mx-auto max-w-xl">
      <ChatWorkspace embedded startEmpty />
    </div>
  );
}
