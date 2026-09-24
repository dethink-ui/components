"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Button as AriaButton,
  DropZone,
  FileTrigger,
  type DropZoneProps,
} from "react-aria-components";
import { FileText, Trash2, Upload, X } from "lucide-react";
import { Button, buttonClassNames } from "../button";
import { cn } from "../../utils/cn";
import {
  formatFileSize,
  type FileUploadRejection,
} from "./file-upload-validation";
import { useFileUpload, type FileUploadOptions } from "./use-file-upload";

export interface FileUploadProps extends FileUploadOptions {
  label?: string;
  description?: string;
  className?: string;
}

function FilePreview({ file }: { file: File }) {
  const [preview, setPreview] = useState<{ file: File; url: string }>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (
      !/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type) ||
      typeof URL.createObjectURL !== "function"
    )
      return;
    const url = URL.createObjectURL(file);
    // Object URLs are browser resources and must be created after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return preview?.file === file && !failed ? (
    <img
      src={preview.url}
      alt=""
      width={24}
      height={24}
      onError={() => setFailed(true)}
      className="size-6 shrink-0 rounded object-cover"
    />
  ) : (
    <FileText
      aria-hidden="true"
      className="text-muted-foreground size-6 shrink-0"
    />
  );
}

function FileName({ name }: { name: string }) {
  const dot = name.lastIndexOf(".");
  const split = dot > 0 && name.length - dot < 16 ? dot : name.length;
  return (
    <p title={name} className="flex min-w-0">
      <span className="truncate">{name.slice(0, split)}</span>
      <span className="shrink-0">{name.slice(split)}</span>
    </p>
  );
}

export function FileUpload({
  label = "Attachments",
  description,
  className,
  ...options
}: FileUploadProps) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const fileDrag = useRef(false);
  const dropSequence = useRef(Promise.resolve());
  const queue = useFileUpload(options, id);
  const {
    multiple = false,
    accept,
    maxFiles,
    maxFileSize,
    disabled = false,
    onUpload,
  } = options;
  const restrictions = [
    accept
      ? accept
          .split(",")
          .map((type) =>
            type.trim().startsWith(".")
              ? type.trim().slice(1).toUpperCase()
              : type.trim(),
          )
          .filter(Boolean)
          .join(", ")
      : "All file types",
    maxFileSize === undefined ? "" : `Max ${formatFileSize(maxFileSize)} each`,
    multiple
      ? maxFiles === undefined
        ? "Multiple files"
        : `Up to ${maxFiles} files`
      : "One file",
  ]
    .filter(Boolean)
    .join(" · ");
  const selected = queue.entries.filter(
    (entry) => entry.status === "selected",
  ).length;
  const uploading = queue.entries.some(
    (entry) => entry.status === "uploading" || entry.status === "queued",
  );
  const failures =
    queue.entries.filter((entry) => entry.status === "error").length +
    queue.errors.length;
  const handleDrop: NonNullable<DropZoneProps["onDrop"]> = (event) => {
    // Begin reading while event data is accessible; apply separate drops in order.
    const read = Promise.all(
      event.items.map(
        async (item): Promise<File | FileUploadRejection | null> => {
          if (item.kind === "directory")
            return {
              name: item.name,
              code: "directory",
              message: "Folders are not supported. Choose individual files.",
            };
          if (item.kind !== "file") return null;
          try {
            return await item.getFile();
          } catch {
            return {
              name: item.name,
              code: "unreadable",
              message: "This file could not be read. Choose it again.",
            };
          }
        },
      ),
    );
    dropSequence.current = dropSequence.current
      .then(async () => {
        const items = await read;
        const files: File[] = [];
        const rejected: FileUploadRejection[] = [];
        for (const item of items) {
          if (!item) continue;
          if ("code" in item) rejected.push(item);
          else files.push(item);
        }
        queue.add(files, false, rejected);
      })
      .catch(() =>
        queue.add([], false, [
          {
            name: "Dropped files",
            code: "unreadable",
            message: "Files could not be read. Please choose them again.",
          },
        ]),
      );
  };
  return (
    <section
      onDragEnterCapture={(event) => {
        fileDrag.current = event.dataTransfer.types.includes("Files");
      }}
      aria-labelledby={`${id}-label`}
      data-slot="file-upload"
      className={cn("text-foreground min-w-0 space-y-3 text-sm", className)}
    >
      <div>
        <h3 id={`${id}-label`} className="font-medium">
          {label}
        </h3>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      <DropZone
        aria-label={`Add files to ${label}`}
        aria-describedby={`${id}-rules`}
        isDisabled={disabled}
        getDropOperation={() => (fileDrag.current ? "copy" : "cancel")}
        onDrop={handleDrop}
        data-slot="file-upload-drop-zone"
        className="border-border bg-muted/20 data-[drop-target]:border-primary data-[drop-target]:bg-primary/5 data-[focus-visible]:ring-ring grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-lg border px-4 py-3 data-[disabled]:opacity-50 data-[focus-visible]:ring-2 sm:grid-cols-[1.25rem_minmax(0,1fr)_auto]"
      >
        {({ isDropTarget }) => (
          <>
            <Upload
              aria-hidden="true"
              className="text-primary size-5 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p>
                {isDropTarget
                  ? "Drop to add files"
                  : !multiple && queue.entries.length
                    ? "Remove or replace your file"
                    : `Drop ${multiple ? "files" : "a file"} here`}
              </p>
              <p
                id={`${id}-rules`}
                className="text-muted-foreground mt-1 text-xs [overflow-wrap:anywhere]"
              >
                {restrictions}
              </p>
            </div>
            <FileTrigger
              allowsMultiple={multiple}
              acceptedFileTypes={accept
                ?.split(",")
                .map((p) => p.trim())
                .filter(Boolean)}
              onSelect={(files) => {
                if (files?.length) queue.add(Array.from(files), !multiple);
              }}
            >
              <AriaButton
                ref={trigger}
                isDisabled={disabled}
                aria-describedby={`${id}-rules`}
                className={buttonClassNames({
                  variant: "outline",
                  size: "sm",
                  className:
                    "col-start-2 justify-self-start sm:col-start-auto pointer-coarse:min-h-11",
                })}
              >
                {!multiple && queue.entries.length
                  ? "Replace file"
                  : multiple
                    ? "Choose files"
                    : "Choose file"}
              </AriaButton>
            </FileTrigger>
          </>
        )}
      </DropZone>
      {queue.entries.length > 0 && (
        // Safari needs an explicit list role when Tailwind removes list markers.
        // eslint-disable-next-line jsx-a11y/no-redundant-roles
        <ul
          aria-label="Selected files"
          role="list"
          className="border-border divide-border divide-y rounded-lg border"
        >
          {queue.entries.map((entry) => {
            const active =
              entry.status === "uploading" || entry.status === "queued";
            const retryable =
              entry.status === "error" || entry.status === "cancelled";
            const status =
              entry.status === "selected"
                ? ""
                : entry.status === "uploading"
                  ? entry.progress === undefined
                    ? "Uploading…"
                    : entry.progress === 100
                      ? "Finishing…"
                      : `${Math.round(entry.progress)}%`
                  : entry.status === "uploaded"
                    ? "Uploaded"
                    : entry.status === "queued"
                      ? "Queued"
                      : entry.status === "cancelled"
                        ? "Cancelled"
                        : "Upload failed";
            return (
              <li
                key={entry.id}
                data-state={entry.status}
                data-slot="file-upload-item"
                className="flex min-w-0 items-center gap-3 px-3 py-[max(0.625rem,var(--dt-density-gap))]"
              >
                <FilePreview file={entry.file} />
                <div className="min-w-0 flex-1">
                  <FileName name={entry.file.name} />
                  {entry.status === "uploading" && (
                    <div
                      role="progressbar"
                      aria-label={`Uploading ${entry.file.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={entry.progress}
                      aria-valuetext={
                        entry.progress === undefined
                          ? "Uploading"
                          : entry.progress === 100
                            ? "Finishing upload"
                            : `${Math.round(entry.progress)} percent`
                      }
                      data-slot="file-upload-progress"
                      className="bg-muted mt-1.5 h-[3px] w-full max-w-48 overflow-hidden rounded-full"
                    >
                      <div
                        className={cn(
                          "bg-primary h-full rounded-full",
                          entry.progress === undefined && "opacity-60",
                        )}
                        style={{ width: `${entry.progress ?? 100}%` }}
                      />
                    </div>
                  )}
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      entry.status === "error"
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatFileSize(entry.file.size)}
                    {status && ` · ${status}`}
                  </p>
                  {entry.error && (
                    <p className="text-destructive mt-1 text-xs [overflow-wrap:anywhere]">
                      {entry.error}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {/* Keep this control mounted as its action changes so async completion preserves focus. */}
                  <Button
                    variant={
                      active || (retryable && onUpload) ? "link" : "ghost"
                    }
                    size={active || (retryable && onUpload) ? "xs" : "sm"}
                    disabled={!active && disabled}
                    aria-label={`${active ? "Cancel" : retryable && onUpload ? "Retry" : "Remove"} ${entry.file.name}`}
                    className="pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                    onClick={() => {
                      if (active) queue.cancel(entry.id);
                      else if (retryable && onUpload) queue.start(entry.id);
                      else queue.remove(entry.id);
                      trigger.current?.focus();
                    }}
                  >
                    {active ? (
                      "Cancel"
                    ) : retryable && onUpload ? (
                      "Retry"
                    ) : (
                      <Trash2 aria-hidden="true" className="size-3.5" />
                    )}
                  </Button>
                  {!active && retryable && onUpload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      aria-label={`Remove ${entry.file.name}`}
                      className="pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                      onClick={() => {
                        queue.remove(entry.id);
                        trigger.current?.focus();
                      }}
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {queue.errors.length > 0 && (
        // Safari needs an explicit list role when Tailwind removes list markers.
        // eslint-disable-next-line jsx-a11y/no-redundant-roles
        <ul aria-label="Files not added" role="list" className="space-y-2">
          {queue.errors.map((error) => (
            <li key={error.id} className="flex items-start gap-2 text-xs">
              <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                <p className="font-medium">{error.name}</p>
                <p className="text-destructive mt-0.5">{error.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                aria-label={`Dismiss error for ${error.name}`}
                onClick={() => {
                  queue.dismiss(error.id);
                  trigger.current?.focus();
                }}
              >
                <X aria-hidden="true" className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {queue.entries.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            {queue.entries.length}{" "}
            {queue.entries.length === 1 ? "file" : "files"} ·{" "}
            {formatFileSize(
              queue.entries.reduce(
                (total, entry) => total + entry.file.size,
                0,
              ),
            )}{" "}
            total
            {failures > 0 && (
              <span className="text-destructive">
                {" "}
                · {failures} need attention
              </span>
            )}
          </p>
          {onUpload && !options.autoUpload && (
            <Button
              size="sm"
              disabled={disabled || !selected}
              onClick={() => queue.start()}
            >
              {selected
                ? `Upload ${selected === 1 ? "file" : `${selected} files`}`
                : uploading
                  ? "Uploading…"
                  : "No files to upload"}
            </Button>
          )}
        </div>
      )}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {queue.announcement}
      </p>
    </section>
  );
}
