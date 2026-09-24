export interface FileUploadRules {
  /** Comma-separated extensions, MIME types, or MIME wildcards. */
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  /** Inclusive per-file limit in bytes. */
  maxFileSize?: number;
}

export type FileUploadRejectionCode =
  "type" | "size" | "count" | "duplicate" | "directory" | "unreadable";

export interface FileUploadRejection {
  name: string;
  code: FileUploadRejectionCode;
  message: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Number((bytes / 1024).toFixed(1))} KiB`;
  return `${Number((bytes / (1024 * 1024)).toFixed(1))} MiB`;
}

function identity(file: File) {
  return JSON.stringify([file.name, file.size, file.lastModified, file.type]);
}

/** Metadata validation for UX only. The server must validate file contents. */
export function validateUploadFiles(
  files: readonly File[],
  existing: readonly File[] = [],
  {
    accept = "",
    multiple = false,
    maxFiles,
    maxFileSize,
  }: FileUploadRules = {},
): { accepted: File[]; rejected: FileUploadRejection[] } {
  const accepted: File[] = [];
  const rejected: FileUploadRejection[] = [];
  const patterns = accept
    .toLowerCase()
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const capacity = multiple ? Math.max(0, Math.floor(maxFiles ?? Infinity)) : 1;
  const seen = new Set(existing.map(identity));
  for (const file of files) {
    let error: Omit<FileUploadRejection, "name"> | undefined;
    if (!multiple && files.length > 1) {
      error = { code: "count", message: "Choose one file at a time." };
    } else if (
      patterns.length &&
      !patterns.some((pattern) =>
        pattern.startsWith(".")
          ? file.name.toLowerCase().endsWith(pattern)
          : pattern.endsWith("/*")
            ? file.type.toLowerCase().startsWith(pattern.slice(0, -1))
            : file.type.toLowerCase() === pattern,
      )
    ) {
      error = {
        code: "type",
        message: `File type not supported. Choose ${accept}.`,
      };
    } else if (maxFileSize !== undefined && file.size > maxFileSize) {
      error = {
        code: "size",
        message: `Too large — maximum ${formatFileSize(maxFileSize)} per file.`,
      };
    } else if (seen.has(identity(file))) {
      error = {
        code: "duplicate",
        message: "This file is already in the list.",
      };
    } else if (existing.length + accepted.length >= capacity) {
      error = {
        code: "count",
        message: `Maximum ${capacity} ${capacity === 1 ? "file" : "files"}. Remove a file first.`,
      };
    }
    if (error) rejected.push({ name: file.name, ...error });
    else {
      accepted.push(file);
      seen.add(identity(file));
    }
  }
  return { accepted, rejected };
}
