"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import { cn } from "../../utils/cn";
import { IconButton } from "../icon-button";
import { Textarea } from "../textarea";
import { isChatRunning } from "./chat-state";
import type {
  ChatActionResult,
  ChatAttachment,
  ChatModel,
  ChatPrompt,
  ChatRun,
} from "./types";
import {
  AttachmentBubble,
  validateChatFiles,
  type ChatFileRules,
} from "./chat-attachment";
import { ModelPicker } from "./model-picker";

export interface PromptInputProps {
  conversationId: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSend: (prompt: ChatPrompt) => ChatActionResult;
  run?: ChatRun;
  onStop?: (run: ChatRun) => ChatActionResult;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  placeholder?: string;
  maxHeight?: number;
  /** Explicit send remains available on touch keyboards. */
  submitOnEnter?: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  attachments?: readonly ChatAttachment[];
  onFiles?: (files: readonly File[]) => ChatActionResult;
  onAttachmentRemove?: (attachment: ChatAttachment) => ChatActionResult;
  onAttachmentRetry?: (attachment: ChatAttachment) => ChatActionResult;
  fileRules?: ChatFileRules;
  allowAttachmentOnly?: boolean;
  models?: readonly ChatModel[];
  modelId?: string;
  onModelChange?: (id: string) => void;
}

const noAttachments: readonly ChatAttachment[] = [];
export function PromptInput({
  conversationId,
  value,
  defaultValue = "",
  onValueChange,
  onSend,
  run,
  onStop,
  disabled = false,
  readOnly = false,
  label = "Message",
  placeholder = "Ask anything, or describe a task…",
  maxHeight = 192,
  submitOnEnter = true,
  actions,
  footer,
  className,
  attachments = noAttachments,
  onFiles,
  onAttachmentRemove,
  onAttachmentRetry,
  fileRules,
  allowAttachmentOnly = false,
  models,
  modelId,
  onModelChange,
}: PromptInputProps) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const text = value ?? localValue;
  const input = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const addingFiles = useRef(false);
  const [filesPending, setFilesPending] = useState(false);
  const busy = useRef(false);
  const alive = useRef(true);
  const composing = useRef(false);
  const revision = useRef(0);
  const id = useId();
  const running = isChatRunning(run);
  const model = models?.find((item) => item.id === modelId);
  const incompatible =
    attachments.length > 0 &&
    (model?.supportsAttachments === false ||
      (model?.supportsImages === false &&
        attachments.some((file) => file.mediaType.startsWith("image/"))));
  const modelUnavailable =
    !!models?.length && (!model || !!model.disabledReason);
  const unfinished = attachments.some((file) => file.status !== "ready");
  const canSend =
    !disabled &&
    !readOnly &&
    !running &&
    !pending &&
    !filesPending &&
    !incompatible &&
    !modelUnavailable &&
    !unfinished &&
    (!!text.trim() || (allowAttachmentOnly && attachments.length > 0));
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    const field = input.current;
    if (!field) return;
    const resize = () => {
      field.style.height = "0px";
      field.style.height = `${Math.min(Math.max(field.scrollHeight, 56), maxHeight)}px`;
    };
    resize();
    // Only width changes require reflow: observing height here would create a feedback loop.
    let width = field.clientWidth;
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (width !== field.clientWidth) {
        width = field.clientWidth;
        resize();
      }
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [text, maxHeight]);
  function change(next: string) {
    revision.current++;
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
  }
  async function submit() {
    if (busy.current || addingFiles.current || !canSend) return;
    busy.current = true;
    setPending(true);
    setError("");
    const submittedRevision = revision.current;
    try {
      if (
        (await onSend({
          conversationId,
          text: text.trim(),
          attachments,
          ...(modelId ? { modelId } : {}),
        })) === false
      )
        throw new Error("Message was not sent. Your draft is saved here.");
      if (alive.current && submittedRevision === revision.current) change("");
    } catch (reason) {
      if (alive.current)
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not send. Please try again.",
        );
    } finally {
      busy.current = false;
      if (alive.current) setPending(false);
    }
  }
  async function stop() {
    if (!run || !onStop || busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      if ((await onStop(run)) === false)
        throw new Error("Could not stop the response. Try again.");
    } catch (reason) {
      if (alive.current)
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not stop the response.",
        );
    } finally {
      busy.current = false;
      if (alive.current) setPending(false);
    }
  }
  async function addFiles(files: readonly File[]) {
    if (!onFiles || disabled || readOnly || addingFiles.current) return;
    const result = validateChatFiles(files, attachments.length, fileRules);
    setError(result.errors.join(" "));
    if (!result.accepted.length) return;
    addingFiles.current = true;
    setFilesPending(true);
    try {
      if ((await onFiles(result.accepted)) === false)
        throw new Error("Files were not accepted. Try again.");
    } catch (reason) {
      if (alive.current)
        setError(
          reason instanceof Error ? reason.message : "Could not add files.",
        );
    } finally {
      addingFiles.current = false;
      if (alive.current) setFilesPending(false);
    }
  }
  return (
    <form
      data-slot="prompt-input"
      className={cn("w-full min-w-0", className)}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      onDragOver={(event) => {
        if (onFiles && event.dataTransfer.types.includes("Files"))
          event.preventDefault();
      }}
      onDrop={(event) => {
        if (onFiles && event.dataTransfer.files.length) {
          event.preventDefault();
          void addFiles(Array.from(event.dataTransfer.files));
        }
      }}
    >
      <div className="border-border bg-background focus-within:border-ring/60 rounded-2xl border p-2 shadow-sm focus-within:shadow-md motion-safe:transition-[border-color,box-shadow] motion-safe:duration-[var(--dt-motion-fast)]">
        {attachments.length > 0 && (
          <ul
            aria-label="Attachments"
            className="grid list-none gap-2 p-1 sm:grid-cols-2"
          >
            {attachments.map((attachment) => (
              <li key={attachment.id} className="min-w-0">
                <AttachmentBubble
                  attachment={attachment}
                  onRemove={
                    disabled || readOnly ? undefined : onAttachmentRemove
                  }
                  onRetry={disabled || readOnly ? undefined : onAttachmentRetry}
                />
              </li>
            ))}
          </ul>
        )}
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <Textarea
          ref={input}
          id={id}
          value={text}
          onChange={(event) => change(event.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          resize="none"
          rows={1}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}${incompatible || modelUnavailable || unfinished ? ` ${id}-constraint` : ""}`}
          aria-invalid={!!error}
          className="min-h-14 rounded-xl border-0 bg-transparent px-3 py-3 leading-6 shadow-none focus-visible:ring-0"
          style={{ maxHeight }}
          onPaste={(event) => {
            if (onFiles && event.clipboardData.files.length) {
              event.preventDefault();
              void addFiles(Array.from(event.clipboardData.files));
            }
          }}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={(event) => {
            if (
              submitOnEnter &&
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              !composing.current &&
              event.keyCode !== 229
            ) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        <div className="flex min-w-0 items-center justify-between gap-2 px-1 pb-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {onFiles && (
              <>
                <input
                  ref={fileInput}
                  type="file"
                  aria-label="Attach files"
                  multiple
                  accept={fileRules?.accept}
                  className="hidden"
                  disabled={disabled || readOnly || filesPending}
                  onChange={(event) => {
                    void addFiles(Array.from(event.target.files ?? []));
                    event.target.value = "";
                  }}
                />
                <IconButton
                  aria-label="Add attachments"
                  title="Add attachments"
                  size="sm"
                  disabled={disabled || readOnly || filesPending}
                  onClick={() => fileInput.current?.click()}
                >
                  <Paperclip />
                </IconButton>
              </>
            )}
            {models && onModelChange && (
              <ModelPicker
                models={models}
                value={modelId}
                onValueChange={onModelChange}
                disabled={disabled || readOnly || running}
                className="max-w-40"
              />
            )}
            {actions}
          </div>
          {running && onStop ? (
            <IconButton
              aria-label={
                run?.status === "stopping"
                  ? "Stopping response"
                  : "Stop response"
              }
              title="Stop response"
              variant="outline"
              shape="circle"
              disabled={
                disabled || readOnly || pending || run?.status === "stopping"
              }
              onClick={() => void stop()}
            >
              <Square className="size-3 fill-current" />
            </IconButton>
          ) : (
            <IconButton
              type="submit"
              aria-label="Send message"
              title="Send message"
              shape="circle"
              variant="solid"
              disabled={!canSend}
            >
              <ArrowUp />
            </IconButton>
          )}
        </div>
      </div>
      <div
        id={`${id}-hint`}
        className="text-muted-foreground mt-2 px-2 text-center text-xs leading-5"
      >
        {footer ??
          (running
            ? "You can prepare your next message while the assistant works."
            : "Enter to send · Shift + Enter for a new line")}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-destructive mt-2 px-2 text-sm"
        >
          {error}
        </p>
      )}
      {(incompatible || modelUnavailable || unfinished) && (
        <p
          id={`${id}-constraint`}
          className="text-muted-foreground mt-2 px-2 text-xs"
          role="status"
        >
          {incompatible
            ? "This model cannot use these attachments. Choose a compatible model or remove the files."
            : modelUnavailable
              ? "Choose an available model to send this message."
              : "Wait for uploads to finish, retry failed files, or remove them before sending."}
        </p>
      )}
    </form>
  );
}
