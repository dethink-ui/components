"use client";

import { useEffect, useRef, useState } from "react";
import {
  validateUploadFiles,
  type FileUploadRules,
  type FileUploadRejection,
} from "./file-upload-validation";

export type FileUploadStatus =
  "selected" | "queued" | "uploading" | "uploaded" | "error" | "cancelled";
export interface FileUploadEntry {
  id: string;
  file: File;
  status: FileUploadStatus;
  progress?: number;
  error?: string;
}
export interface FileUploadContext {
  id: string;
  signal: AbortSignal;
  /** Transfer percent. Omit calls if progress is unknown. */
  onProgress: (percent: number) => void;
}
export type FileUploadHandler = (
  file: File,
  context: FileUploadContext,
) => Promise<void>;
export interface FileUploadOptions extends FileUploadRules {
  disabled?: boolean;
  autoUpload?: boolean;
  onUpload?: FileUploadHandler;
  onFilesChange?: (files: readonly FileUploadEntry[]) => void;
}

export function useFileUpload(options: FileUploadOptions, prefix: string) {
  const [entries, setEntries] = useState<FileUploadEntry[]>([]);
  const [errors, setErrors] = useState<
    (FileUploadRejection & { id: string })[]
  >([]);
  const [announcement, setAnnouncement] = useState("");
  const current = useRef<FileUploadEntry[]>([]);
  const config = useRef(options);
  const serial = useRef(0);
  const mounted = useRef(true);
  const attempts = useRef(new Map<string, AbortController>());
  useEffect(() => {
    config.current = options;
    // Resume pending transfers when the host re-enables the field or restores its transport.
    pump();
  });
  useEffect(() => {
    mounted.current = true;
    const active = attempts.current;
    return () => {
      mounted.current = false;
      for (const controller of active.values()) controller.abort();
      active.clear();
    };
  }, []);

  function publish(next: FileUploadEntry[]) {
    if (!mounted.current) return;
    current.current = next;
    setEntries(next);
    config.current.onFilesChange?.(next);
  }
  function update(id: string, patch: Partial<FileUploadEntry>) {
    publish(
      current.current.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    );
  }
  function cancelAttempt(id: string) {
    const controller = attempts.current.get(id);
    attempts.current.delete(id);
    controller?.abort();
  }
  function pump() {
    const upload = config.current.onUpload;
    if (!mounted.current || !upload || config.current.disabled) return;
    while (attempts.current.size < 3) {
      const entry = current.current.find((item) => item.status === "queued");
      if (!entry) break;
      const controller = new AbortController();
      attempts.current.set(entry.id, controller);
      update(entry.id, {
        status: "uploading",
        progress: undefined,
        error: undefined,
      });
      const isCurrent = () =>
        mounted.current &&
        attempts.current.get(entry.id) === controller &&
        !controller.signal.aborted;
      // The async boundary handles callbacks that throw synchronously as well as rejected promises.
      void (async () => {
        try {
          await upload(entry.file, {
            id: entry.id,
            signal: controller.signal,
            onProgress: (percent) => {
              if (isCurrent() && Number.isFinite(percent))
                update(entry.id, {
                  progress: Math.min(100, Math.max(0, percent)),
                });
            },
          });
          if (isCurrent()) {
            update(entry.id, { status: "uploaded", progress: 100 });
            setAnnouncement(`${entry.file.name} uploaded.`);
          }
        } catch (error) {
          if (isCurrent()) {
            const message =
              error instanceof Error && error.message.trim()
                ? error.message
                : "Upload failed. Try again.";
            update(entry.id, {
              status: "error",
              error: message,
              progress: undefined,
            });
            setAnnouncement(`${entry.file.name}: ${message}`);
          }
        } finally {
          if (attempts.current.get(entry.id) === controller) {
            attempts.current.delete(entry.id);
            pump();
          }
        }
      })();
    }
  }
  function reject(rejected: FileUploadRejection[]) {
    if (!mounted.current) return;
    setErrors(
      rejected.map((error) => ({
        ...error,
        id: `${prefix}-error-${++serial.current}`,
      })),
    );
  }
  function add(
    files: readonly File[],
    replace = false,
    extraErrors: FileUploadRejection[] = [],
  ) {
    const rules = config.current;
    if (
      !mounted.current ||
      rules.disabled ||
      (!files.length && !extraErrors.length)
    )
      return;
    const existing =
      replace && !rules.multiple
        ? []
        : current.current.map((entry) => entry.file);
    const result = validateUploadFiles(files, existing, rules);
    const rejected = [...result.rejected, ...extraErrors];
    reject(rejected);
    if (result.accepted.length) {
      if (replace && !rules.multiple)
        for (const entry of current.current) cancelAttempt(entry.id);
      const added = result.accepted.map((file): FileUploadEntry => ({
        id: `${prefix}-file-${++serial.current}`,
        file,
        status: rules.autoUpload && rules.onUpload ? "queued" : "selected",
      }));
      publish([
        ...(replace && !rules.multiple ? [] : current.current),
        ...added,
      ]);
    }
    setAnnouncement(
      `${result.accepted.length} added. ${rejected.length} not added.${rejected.length ? " Review errors below the file list." : ""}`,
    );
    pump();
  }
  function remove(id: string) {
    if (config.current.disabled) return;
    const entry = current.current.find((item) => item.id === id);
    cancelAttempt(id);
    publish(current.current.filter((item) => item.id !== id));
    setAnnouncement(`${entry?.file.name ?? "File"} removed.`);
    pump();
  }
  function cancel(id: string) {
    cancelAttempt(id);
    update(id, { status: "cancelled", progress: undefined });
    setAnnouncement("Upload cancelled. You can retry when ready.");
    pump();
  }
  function start(id?: string) {
    if (config.current.disabled || !config.current.onUpload) return;
    publish(
      current.current.map((entry) =>
        (
          id
            ? entry.id === id &&
              ["error", "cancelled", "selected"].includes(entry.status)
            : entry.status === "selected"
        )
          ? {
              ...entry,
              status: "queued",
              error: undefined,
              progress: undefined,
            }
          : entry,
      ),
    );
    pump();
  }
  return {
    entries,
    errors,
    announcement,
    add,
    remove,
    cancel,
    start,
    dismiss: (id: string) =>
      setErrors((list) => list.filter((error) => error.id !== id)),
  };
}
