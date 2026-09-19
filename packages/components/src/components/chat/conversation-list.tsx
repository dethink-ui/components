"use client";

import { useId, useRef, useState } from "react";
import { MessageSquare, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { useChatAction } from "./use-chat-action";
import type { ChatActionResult, ChatConversation } from "./types";

export interface ConversationListProps {
  conversations: readonly ChatConversation[];
  value?: string;
  onValueChange: (id: string) => ChatActionResult;
  onNew?: () => ChatActionResult;
  onRename?: (id: string, title: string) => ChatActionResult;
  /** The host chooses the next selection; the first remaining conversation is a useful fallback. */
  onDelete?: (id: string) => ChatActionResult;
  loading?: boolean;
  error?: string;
  onLoadMore?: () => ChatActionResult;
  className?: string;
}
export function ConversationList({
  conversations,
  value,
  onValueChange,
  onNew,
  onRename,
  onDelete,
  loading,
  error: loadError,
  onLoadMore,
  className,
}: ConversationListProps) {
  const [query, setQuery] = useState("");
  const [operation, setOperation] = useState<{
    type: "rename" | "delete";
    conversation: ChatConversation;
  }>();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const { pending, error, notice, perform } = useChatAction();
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const results = conversations.filter((conversation) =>
    `${conversation.title} ${conversation.description ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  function begin(type: "rename" | "delete", conversation: ChatConversation) {
    setOperation({ type, conversation });
    setTitle(conversation.title);
    setOpen(true);
  }
  return (
    <nav
      ref={root}
      data-slot="conversation-list"
      aria-label="Conversations"
      className={cn("flex min-h-0 min-w-0 flex-col", className)}
    >
      {onNew && (
        <Button
          size="sm"
          variant="outline"
          className="mb-4 w-full justify-start"
          leftIcon={<Plus />}
          disabled={pending}
          onClick={() => void perform(onNew)}
        >
          New conversation
        </Button>
      )}
      <label htmlFor={`${id}-search`} className="sr-only">
        Search conversations
      </label>
      <div className="relative mb-5">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute start-3 top-2.5 size-3.5"
        />
        <Input
          id={`${id}-search`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conversations"
          controlSize="sm"
          className="bg-background/60 ps-8"
        />
      </div>
      <p className="text-muted-foreground mb-2 px-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
        Recent conversations
      </p>
      <ul className="min-h-0 space-y-1 overflow-y-auto overscroll-contain">
        {results.map((conversation) => (
          <li
            key={conversation.id}
            className={cn(
              "group flex items-center gap-0.5 rounded-lg p-1 motion-safe:transition-colors",
              value === conversation.id ? "bg-primary/10" : "hover:bg-muted",
            )}
          >
            <button
              type="button"
              aria-current={value === conversation.id ? "page" : undefined}
              disabled={pending}
              onClick={() => void perform(() => onValueChange(conversation.id))}
              className="focus-visible:ring-ring flex min-w-0 flex-1 items-start gap-2 rounded-md px-1.5 py-2 text-start outline-none focus-visible:ring-2"
            >
              <MessageSquare
                aria-hidden="true"
                className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
              />
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium">
                  {conversation.title}
                </span>
                {conversation.running ? (
                  <span className="text-primary mt-1 block text-[10px]">
                    Working…
                  </span>
                ) : (
                  conversation.description && (
                    <span className="text-muted-foreground mt-1 block truncate text-[10px]">
                      {conversation.description}
                    </span>
                  )
                )}
              </span>
              {!!conversation.unread && (
                <span
                  className="bg-primary text-primary-foreground ms-auto rounded-full px-1.5 py-0.5 text-[10px]"
                  aria-label={`${conversation.unread} unread messages`}
                >
                  {conversation.unread}
                </span>
              )}
            </button>
            <div className="flex shrink-0 items-center">
              {onRename && (
                <IconButton
                  size="xs"
                  aria-label={`Rename ${conversation.title}`}
                  title="Rename conversation"
                  disabled={pending}
                  onClick={() => begin("rename", conversation)}
                >
                  <Pencil />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="xs"
                  aria-label={`Delete ${conversation.title}`}
                  title="Delete conversation"
                  disabled={pending}
                  onClick={() => begin("delete", conversation)}
                >
                  <Trash2 />
                </IconButton>
              )}
            </div>
          </li>
        ))}
      </ul>
      {!results.length && (
        <p className="text-muted-foreground px-2 py-4 text-xs">
          {query
            ? "No conversations match your search."
            : loading
              ? "Loading conversations…"
              : "Your conversations will appear here."}
        </p>
      )}
      {onLoadMore && (
        <Button
          variant="ghost"
          size="sm"
          disabled={pending || loading}
          onClick={() => void perform(onLoadMore)}
        >
          {loading ? "Loading…" : "Load more conversations"}
        </Button>
      )}
      {(loadError || error) && !open && (
        <p role="alert" className="text-destructive mt-2 text-xs">
          {loadError || error}
        </p>
      )}
      <span role="status" className="sr-only">
        {notice}
      </span>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
      >
        <DialogContent size="sm" dismissible={!pending}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (
                !operation ||
                pending ||
                (operation.type === "rename" && !title.trim())
              )
                return;
              void perform(
                () =>
                  operation.type === "rename"
                    ? onRename?.(operation.conversation.id, title.trim())
                    : onDelete?.(operation.conversation.id),
                operation.type === "rename"
                  ? "Conversation renamed"
                  : "Conversation deleted",
              ).then((ok) => {
                if (ok) {
                  setOpen(false);
                  if (operation.type === "delete")
                    requestAnimationFrame(() =>
                      root.current
                        ?.querySelector<HTMLElement>(
                          '[aria-current="page"], button',
                        )
                        ?.focus(),
                    );
                }
              });
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {operation?.type === "delete"
                  ? "Delete conversation?"
                  : "Rename conversation"}
              </DialogTitle>
              <DialogDescription>
                {operation?.type === "delete"
                  ? `“${operation.conversation.title}” will be removed. This cannot be undone.`
                  : "Give this conversation a name you can find later."}
              </DialogDescription>
            </DialogHeader>
            {operation?.type === "rename" && (
              <div className="px-6 py-3">
                <label
                  htmlFor={`${id}-title`}
                  className="mb-2 block text-sm font-medium"
                >
                  Conversation name
                </label>
                <Input
                  id={`${id}-title`}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  disabled={pending}
                />
              </div>
            )}
            {error && (
              <p role="alert" className="text-destructive px-6 py-2 text-sm">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={operation?.type === "delete" ? "destructive" : "solid"}
                disabled={
                  pending || (operation?.type === "rename" && !title.trim())
                }
              >
                {pending
                  ? "Saving…"
                  : operation?.type === "delete"
                    ? "Delete conversation"
                    : "Save name"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
