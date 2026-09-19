import type { ReactNode } from "react";

export type ChatRunStatus =
  | "idle"
  | "submitted"
  | "running"
  | "stopping"
  | "completed"
  | "stopped"
  | "error";
export type ChatActivityKind = "thinking" | "tool" | "writing" | "approval";
export type ChatActivityStatus =
  "pending" | "running" | "needs-input" | "completed" | "error" | "cancelled";
export interface ChatRun {
  id: string;
  conversationId: string;
  status: ChatRunStatus;
  messageId?: string;
  /** Human-readable, public status. Never put private reasoning here. */
  label?: string;
  error?: string;
  retryOf?: string;
}
export interface ChatActivityItem {
  id: string;
  runId: string;
  kind: ChatActivityKind;
  status: ChatActivityStatus;
  label: string;
  summary?: string;
  error?: string;
  approvalId?: string;
  decision?: "approved" | "denied";
}
export interface ChatCitation {
  id: string;
  title: string;
  url: string;
  description?: string;
  source?: string;
}
export interface ChatAttachment {
  id: string;
  name: string;
  mediaType: string;
  size?: number;
  status: "selected" | "uploading" | "ready" | "error";
  url?: string;
  /** Local file; not a server-side validation or authorization boundary. */
  file?: File;
  progress?: number;
  error?: string;
}
export type ChatMessagePart =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "citation"; citation: ChatCitation }
  | { id: string; type: "attachment"; attachment: ChatAttachment }
  | { id: string; type: "custom"; name: string; data: unknown };
export interface ChatMessageData {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  name?: string;
  parts: readonly ChatMessagePart[];
  runId?: string;
  status?: "streaming" | "complete" | "stopped" | "error";
  createdAt?: string;
  metadata?: Readonly<Record<string, unknown>>;
  versions?: readonly { id: string; label?: string }[];
  versionId?: string;
}
export interface ChatPrompt {
  conversationId: string;
  text: string;
  attachments: readonly ChatAttachment[];
  modelId?: string;
}
/** Returning false (or rejecting) keeps the draft / reports an action error. */
export type ChatActionResult = void | boolean | Promise<void | boolean>;
export interface ChatApproval {
  runId: string;
  activityId: string;
  approvalId: string;
  approved: boolean;
}
export interface ChatModel {
  id: string;
  name: string;
  description?: string;
  disabledReason?: string;
  supportsAttachments?: boolean;
  supportsImages?: boolean;
}
export interface ChatConversation {
  id: string;
  title: string;
  description?: string;
  unread?: number;
  running?: boolean;
}
export type ChatPartRenderer = (
  part: ChatMessagePart,
  message: ChatMessageData,
) => ReactNode;
export interface ChatMessageActionHandlers {
  onCopy?: (text: string, message: ChatMessageData) => ChatActionResult;
  onFeedback?: (
    message: ChatMessageData,
    value: "up" | "down",
  ) => ChatActionResult;
  onEdit?: (message: ChatMessageData, text: string) => ChatActionResult;
  onRetry?: (message: ChatMessageData) => ChatActionResult;
  onRegenerate?: (message: ChatMessageData) => ChatActionResult;
  onVersionChange?: (
    message: ChatMessageData,
    versionId: string,
  ) => ChatActionResult;
}
