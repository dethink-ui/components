"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useHydrated } from "../../utils/use-hydrated";
import { LiveRegionProvider, Announcer } from "../live-region";
import { chatRunLabel } from "./chat-state";
import {
  MessageList,
  MessageScroller,
  type MessageListProps,
  type MessageScrollerProps,
} from "./message-scroller";
import { PromptInput, type PromptInputProps } from "./prompt-input";
import { ChatActivity, type ChatActivityProps } from "./chat-activity";
import type {
  ChatMessageActionHandlers,
  ChatMessageData,
  ChatPartRenderer,
  ChatRun,
} from "./types";

export interface ChatProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "onSubmit"
> {
  conversationId: string;
  messages: readonly ChatMessageData[];
  run?: ChatRun;
  header?: ReactNode;
  emptyState?: ReactNode;
  composer?: ReactNode;
  prompt?: Omit<PromptInputProps, "conversationId" | "run">;
  renderPart?: ChatPartRenderer;
  messageActions?: ChatMessageActionHandlers;
  activity?: Omit<ChatActivityProps, "run">;
  scroll?: Omit<MessageScrollerProps, "children" | "revision" | "messageCount">;
  history?: Omit<MessageListProps, "messages" | "renderPart" | "actions">;
}
export function Chat({
  conversationId,
  messages,
  run,
  header,
  emptyState,
  composer,
  prompt,
  renderPart,
  messageActions,
  activity,
  scroll,
  history,
  children,
  className,
  "aria-label": label = "AI conversation",
  ...props
}: ChatProps) {
  const status = chatRunLabel(run, activity?.items);
  const hydrated = useHydrated();
  return (
    <section
      {...props}
      data-slot="chat"
      data-hydrated={hydrated}
      aria-label={label}
      className={cn(
        "bg-background text-foreground flex h-[640px] min-h-0 min-w-0 flex-col overflow-hidden",
        className,
      )}
    >
      <LiveRegionProvider>
        {header}
        <MessageScroller
          key={conversationId}
          {...scroll}
          revision={messages}
          messageCount={messages.length}
          lastMessageId={messages[messages.length - 1]?.id}
        >
          {messages.length ? (
            <MessageList
              {...history}
              messages={messages}
              renderPart={renderPart}
              actions={messageActions}
            />
          ) : (
            emptyState
          )}
          {run && <ChatActivity {...activity} run={run} />}
          {children}
        </MessageScroller>
        <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pt-2 pb-4 sm:px-8">
          {composer ??
            (prompt && (
              <PromptInput
                key={conversationId}
                {...prompt}
                conversationId={conversationId}
                run={run}
              />
            ))}
        </div>
        <Announcer
          coalesceKey={`chat:${conversationId}`}
          message={status}
          debounceMs={180}
        />
      </LiveRegionProvider>
    </section>
  );
}
