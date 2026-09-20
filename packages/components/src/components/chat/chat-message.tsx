"use client";

import { memo, useId, useState, type ReactNode } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Textarea } from "../textarea";
import { safeChatUrl } from "./chat-state";
import { useChatAction } from "./use-chat-action";
import { AttachmentBubble } from "./chat-attachment";
import type {
  ChatCitation,
  ChatMessageActionHandlers,
  ChatMessageData,
  ChatPartRenderer,
} from "./types";

export interface CitationCardProps {
  citation: ChatCitation;
  index?: number;
  className?: string;
}
export function CitationCard({
  citation,
  index,
  className,
}: CitationCardProps) {
  const href = safeChatUrl(citation.url);
  const content = (
    <>
      <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium">
        {index ?? "↗"}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">
          {citation.title}
        </span>
        <span className="text-muted-foreground block truncate text-xs">
          {citation.source ??
            (href
              ? new URL(href, "https://local.invalid").hostname
              : "Source unavailable")}
        </span>
        {citation.description && (
          <span className="text-muted-foreground mt-1 block text-xs leading-5">
            {citation.description}
          </span>
        )}
      </span>
    </>
  );
  const classes = cn(
    "border-border bg-background flex min-w-0 items-start gap-3 rounded-xl border p-3 text-start",
    className,
  );
  return href ? (
    <a
      data-slot="citation-card"
      className={cn(
        classes,
        "hover:bg-muted/50 focus-visible:ring-ring outline-none focus-visible:ring-2 motion-safe:transition-colors",
      )}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${index ? `Source ${index}: ` : ""}${citation.title} (opens in a new tab)`}
    >
      {content}
    </a>
  ) : (
    <div data-slot="citation-card" className={classes}>
      {content}
    </div>
  );
}

export interface MessageContentProps {
  message: ChatMessageData;
  renderPart?: ChatPartRenderer;
  className?: string;
}
export function MessageContent({
  message,
  renderPart,
  className,
}: MessageContentProps) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "min-w-0 space-y-3 text-sm leading-7 [overflow-wrap:anywhere]",
        className,
      )}
    >
      {message.parts.map((part) => {
        const custom = renderPart?.(part, message);
        if (custom !== undefined) return <div key={part.id}>{custom}</div>;
        if (part.type === "text")
          return (
            <div key={part.id} className="whitespace-pre-wrap">
              {part.text}
            </div>
          );
        if (part.type === "citation")
          return <CitationCard key={part.id} citation={part.citation} />;
        if (part.type === "attachment")
          return (
            <AttachmentBubble key={part.id} attachment={part.attachment} />
          );
        return (
          <p key={part.id} className="text-muted-foreground text-xs">
            {part.name}
          </p>
        );
      })}
    </div>
  );
}

export interface MessageActionsProps extends ChatMessageActionHandlers {
  message: ChatMessageData;
  className?: string;
}
export function MessageActions({
  message,
  onCopy,
  onFeedback,
  onEdit,
  onRetry,
  onRegenerate,
  onVersionChange,
  className,
}: MessageActionsProps) {
  const { pending, error, notice, perform } = useChatAction();
  const [editing, setEditing] = useState(false);
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n\n");
  const [edited, setEdited] = useState(text);
  const [feedback, setFeedback] = useState<"up" | "down">();
  const editId = useId();
  if (message.status === "streaming") return null;
  const versions = message.versions ?? [];
  const versionIndex = Math.max(
    0,
    versions.findIndex((version) => version.id === message.versionId),
  );
  const hasActions =
    onCopy ||
    onFeedback ||
    onEdit ||
    onRetry ||
    onRegenerate ||
    onVersionChange;
  if (!hasActions) return null;
  return (
    <div data-slot="message-actions" className={cn("mt-3", className)}>
      <div className="text-muted-foreground flex flex-wrap items-center gap-0.5">
        {onCopy && (
          <IconButton
            size="sm"
            aria-label="Copy message"
            title="Copy message"
            disabled={pending}
            onClick={() => void perform(() => onCopy(text, message), "Copied")}
          >
            {notice === "Copied" ? <Check /> : <Copy />}
          </IconButton>
        )}
        {onFeedback &&
          (["up", "down"] as const).map((value) => (
            <IconButton
              key={value}
              size="sm"
              aria-label={
                value === "up" ? "Helpful response" : "Unhelpful response"
              }
              title={value === "up" ? "Helpful" : "Unhelpful"}
              aria-pressed={feedback === value}
              disabled={pending}
              onClick={() =>
                void perform(
                  () => onFeedback(message, value),
                  "Feedback saved",
                ).then((ok) => {
                  if (ok) setFeedback(value);
                })
              }
            >
              {value === "up" ? <ThumbsUp /> : <ThumbsDown />}
            </IconButton>
          ))}
        {onEdit && (
          <IconButton
            size="sm"
            aria-label="Edit message"
            title="Edit message"
            disabled={pending}
            onClick={() => {
              setEdited(text);
              setEditing(!editing);
            }}
          >
            <Pencil />
          </IconButton>
        )}
        {onRegenerate && (
          <IconButton
            size="sm"
            aria-label="Regenerate response"
            title="Regenerate response"
            disabled={pending}
            onClick={() =>
              void perform(
                () => onRegenerate(message),
                "Regeneration requested",
              )
            }
          >
            <RotateCcw />
          </IconButton>
        )}
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() =>
              void perform(() => onRetry(message), "Retry requested")
            }
          >
            Try again
          </Button>
        )}
        {onVersionChange && versions.length > 1 && (
          <div
            role="group"
            className="ms-2 flex items-center gap-1"
            aria-label="Response versions"
          >
            <IconButton
              size="sm"
              aria-label="Previous response version"
              disabled={pending || versionIndex === 0}
              onClick={() =>
                void perform(() =>
                  onVersionChange(message, versions[versionIndex - 1]!.id),
                )
              }
            >
              <ChevronLeft className="rtl:rotate-180" />
            </IconButton>
            <span className="text-xs">
              {versionIndex + 1} / {versions.length}
            </span>
            <IconButton
              size="sm"
              aria-label="Next response version"
              disabled={pending || versionIndex === versions.length - 1}
              onClick={() =>
                void perform(() =>
                  onVersionChange(message, versions[versionIndex + 1]!.id),
                )
              }
            >
              <ChevronRight className="rtl:rotate-180" />
            </IconButton>
          </div>
        )}
      </div>
      {editing && onEdit && (
        <form
          className="mt-2 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (edited.trim())
              void perform(
                () => onEdit(message, edited.trim()),
                "Message updated",
              ).then((ok) => {
                if (ok) setEditing(false);
              });
          }}
        >
          <label htmlFor={editId} className="text-xs font-medium">
            Edit message
          </label>
          <Textarea
            id={editId}
            value={edited}
            onChange={(event) => setEdited(event.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={pending || !edited.trim()}
            >
              Save edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      <span className="text-muted-foreground text-xs" role="status">
        {notice}
      </span>
      {error && (
        <p role="alert" className="text-destructive mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export interface ChatMessageProps extends MessageContentProps {
  actions?: ChatMessageActionHandlers;
  avatar?: ReactNode;
}
export const ChatMessage = memo(function ChatMessage({
  message,
  renderPart,
  actions,
  avatar,
  className,
}: ChatMessageProps) {
  const labelId = useId();
  const name =
    message.name ??
    (message.role === "user"
      ? "You"
      : message.role === "assistant"
        ? "Assistant"
        : "System");
  return (
    <article
      data-slot="chat-message"
      data-message-id={message.id}
      data-role={message.role}
      aria-labelledby={labelId}
      className={cn("min-w-0", className)}
    >
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden="true">{avatar}</span>
        <span id={labelId} className="text-foreground text-xs font-semibold">
          {name}
        </span>
        {message.createdAt && (
          <time
            dateTime={message.createdAt}
            className="text-muted-foreground text-[11px]"
          >
            {message.createdAt}
          </time>
        )}
      </div>
      <div
        className={cn(
          "min-w-0",
          message.role === "user" &&
            "bg-muted/65 rounded-2xl rounded-ss-md px-4 py-3",
          message.role === "system" &&
            "border-border text-muted-foreground border-s-2 ps-4",
        )}
      >
        <MessageContent message={message} renderPart={renderPart} />
      </div>
      {(message.status === "stopped" || message.status === "error") && (
        <p className="text-muted-foreground mt-2 text-xs">
          {message.status === "stopped"
            ? "Stopped · partial response saved"
            : "Response interrupted · partial response saved"}
        </p>
      )}
      {actions && (
        <MessageActions
          key={message.id}
          message={message}
          {...actions}
          onEdit={message.role === "user" ? actions.onEdit : undefined}
          onFeedback={
            message.role === "assistant" ? actions.onFeedback : undefined
          }
          onRegenerate={
            message.role === "assistant" &&
            message.status !== "error" &&
            message.status !== "stopped"
              ? actions.onRegenerate
              : undefined
          }
          onRetry={
            message.status === "error" || message.status === "stopped"
              ? actions.onRetry
              : undefined
          }
        />
      )}
    </article>
  );
});
