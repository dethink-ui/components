"use client";

import { useEffect, useState } from "react";
import { FileText, RotateCcw, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { IconButton } from "../icon-button";
import { safeChatUrl } from "./chat-state";
import { useChatAction } from "./use-chat-action";
import type { ChatActionResult, ChatAttachment } from "./types";

export interface ChatFileRules {
  maxFiles?: number;
  maxFileSize?: number;
  accept?: string;
}
export function validateChatFiles(
  files: readonly File[],
  existingCount: number,
  {
    maxFiles = 5,
    maxFileSize = 10 * 1024 * 1024,
    accept = "",
  }: ChatFileRules = {},
) {
  const accepted: File[] = [];
  const errors: string[] = [];
  const patterns = accept
    .toLowerCase()
    .split(",")
    .map((pattern) => pattern.trim())
    .filter(Boolean);
  for (const file of files) {
    if (existingCount + accepted.length >= maxFiles) {
      errors.push(`${file.name}: maximum ${maxFiles} files per message.`);
      continue;
    }
    if (file.size > maxFileSize) {
      errors.push(
        `${file.name}: maximum file size is ${Math.round(maxFileSize / 1024 / 1024)} MB.`,
      );
      continue;
    }
    if (
      patterns.length &&
      !patterns.some((pattern) =>
        pattern.startsWith(".")
          ? file.name.toLowerCase().endsWith(pattern)
          : pattern.endsWith("/*")
            ? file.type.toLowerCase().startsWith(pattern.slice(0, -1))
            : file.type.toLowerCase() === pattern,
      )
    ) {
      errors.push(`${file.name}: this file type is not supported.`);
      continue;
    }
    accepted.push(file);
  }
  return { accepted, errors };
}
export interface AttachmentBubbleProps {
  attachment: ChatAttachment;
  onRemove?: (attachment: ChatAttachment) => ChatActionResult;
  onRetry?: (attachment: ChatAttachment) => ChatActionResult;
  className?: string;
}
export function AttachmentBubble({
  attachment,
  onRemove,
  onRetry,
  className,
}: AttachmentBubbleProps) {
  const [preview, setPreview] = useState<{ file: File; url: string }>();
  const { pending, error, perform } = useChatAction();
  const image = /^image\/(png|jpeg|webp|gif|avif)$/.test(attachment.mediaType);
  useEffect(() => {
    if (!image || !attachment.file || typeof URL.createObjectURL !== "function")
      return;
    const url = URL.createObjectURL(attachment.file);
    // A browser-owned object URL must be created after hydration and revoked with the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview({ file: attachment.file, url });
    return () => URL.revokeObjectURL(url);
  }, [attachment.file, image]);
  const url = safeChatUrl(attachment.url, true);
  const imageUrl =
    preview && preview.file === attachment.file ? preview.url : url;
  const status =
    attachment.status === "uploading"
      ? attachment.progress === undefined
        ? "Uploading…"
        : `Uploading ${Math.round(Math.min(100, Math.max(0, attachment.progress)))}%`
      : attachment.status === "selected"
        ? "Waiting to upload"
        : attachment.status === "error"
          ? attachment.error || "Upload failed"
          : attachment.size !== undefined
            ? `${Math.max(1, Math.round(attachment.size / 1024))} KB · Ready`
            : "Ready";
  return (
    <div
      data-slot="attachment-bubble"
      data-state={attachment.status}
      className={cn(
        "border-border bg-background flex min-w-0 items-center gap-2 rounded-xl border p-2 text-xs",
        attachment.status === "error" && "border-destructive/50",
        className,
      )}
    >
      {image && imageUrl ? (
        <img
          src={imageUrl}
          width={40}
          height={40}
          alt={`Preview of ${attachment.name}`}
          className="size-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg"
        >
          <FileText className="size-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {url && attachment.status === "ready" ? (
          <a
            className="block truncate font-medium underline-offset-4 hover:underline"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {attachment.name}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <span className="block truncate font-medium">{attachment.name}</span>
        )}
        <span
          className={cn(
            "mt-1 block truncate",
            attachment.status === "error"
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {status}
        </span>
        {attachment.status === "uploading" && (
          <progress
            aria-label={`Uploading ${attachment.name}`}
            max={100}
            value={attachment.progress}
            className="accent-primary mt-1 h-1 w-full"
          />
        )}
        {error && (
          <span role="alert" className="text-destructive">
            {error}
          </span>
        )}
      </div>
      {attachment.status === "error" && onRetry && (
        <IconButton
          size="sm"
          aria-label={`Retry ${attachment.name}`}
          disabled={pending}
          onClick={() => void perform(() => onRetry(attachment))}
        >
          <RotateCcw />
        </IconButton>
      )}
      {onRemove && (
        <IconButton
          size="sm"
          aria-label={`Remove ${attachment.name}`}
          disabled={pending}
          onClick={() => void perform(() => onRemove(attachment))}
        >
          <X />
        </IconButton>
      )}
    </div>
  );
}
