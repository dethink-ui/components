import { getToolName, isToolUIPart, type UIMessage } from "ai";
import type {
  ChatActivityItem,
  ChatMessageData,
  ChatMessagePart,
  ChatRun,
} from "@dethink/components";

/** SDK-specific mapping belongs to the host. Private reasoning and raw tool payloads are omitted. */
export function mapSdkMessage(
  message: UIMessage,
  conversationId: string,
  run?: ChatRun,
): ChatMessageData {
  const parts: ChatMessagePart[] = [];
  for (const [index, part] of message.parts.entries()) {
    const id = `${message.id}-${index}`;
    if (part.type === "text") parts.push({ id, type: "text", text: part.text });
    if (part.type === "source-url")
      parts.push({
        id: part.sourceId,
        type: "citation",
        citation: {
          id: part.sourceId,
          title: part.title || "Source",
          url: part.url,
        },
      });
    if (part.type === "source-document")
      parts.push({
        id: part.sourceId,
        type: "custom",
        name: part.title,
        data: { mediaType: part.mediaType, filename: part.filename },
      });
    if (part.type === "file")
      parts.push({
        id,
        type: "attachment",
        attachment: {
          id,
          name: part.filename || "Generated file",
          mediaType: part.mediaType,
          url: part.url,
          status: "ready",
        },
      });
  }
  return {
    id: message.id,
    conversationId,
    role: message.role,
    name: message.role === "assistant" ? "SDK assistant" : undefined,
    parts,
    status: run
      ? run.status === "error"
        ? "error"
        : run.status === "stopped"
          ? "stopped"
          : ["running", "submitted", "stopping"].includes(run.status)
            ? "streaming"
            : "complete"
      : "complete",
    runId: run?.id,
  };
}

/** One cache per mounted integration; retain completed message identity and terminal status. */
export function createSdkMessageMapper() {
  const cache = new WeakMap<UIMessage, ChatMessageData>();
  return (message: UIMessage, conversationId: string, run?: ChatRun) => {
    const existing = !run ? cache.get(message) : undefined;
    if (existing) return existing;
    const mapped = mapSdkMessage(message, conversationId, run);
    cache.set(message, mapped);
    return mapped;
  };
}
export function mapSdkActivity(
  message: UIMessage | undefined,
  run: ChatRun,
): ChatActivityItem[] {
  return (
    message?.parts.filter(isToolUIPart).map((part) => ({
      id: part.toolCallId,
      runId: run.id,
      kind: part.state === "approval-requested" ? "approval" : "tool",
      status:
        ["stopped", "error"].includes(run.status) &&
        !["output-available", "output-error", "output-denied"].includes(
          part.state,
        )
          ? "cancelled"
          : part.state === "approval-requested"
            ? "needs-input"
            : part.state === "output-available"
              ? "completed"
              : part.state === "output-error"
                ? "error"
                : part.state === "output-denied"
                  ? "cancelled"
                  : "running",
      label: part.title || getToolName(part),
      summary:
        part.state === "output-available"
          ? "Tool completed. The response uses its result below."
          : undefined,
      error: part.state === "output-error" ? part.errorText : undefined,
      approvalId: part.approval?.id,
      decision:
        part.approval?.approved === true
          ? "approved"
          : part.approval?.approved === false
            ? "denied"
            : undefined,
    })) ?? []
  );
}
