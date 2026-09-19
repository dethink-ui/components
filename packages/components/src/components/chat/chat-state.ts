import type { ChatActivityItem, ChatMessageData, ChatRun } from "./types";

export function isChatRunning(run?: ChatRun) {
  return (
    run?.status === "submitted" ||
    run?.status === "running" ||
    run?.status === "stopping"
  );
}
export function chatRunLabel(
  run?: ChatRun,
  activity: readonly ChatActivityItem[] = [],
) {
  if (!run || run.status === "idle") return "";
  if (run.status === "stopping") return "Stopping…";
  if (run.status === "stopped") return "Response stopped";
  if (run.status === "error")
    return run.error || "Something went wrong. You can try again.";
  if (run.status === "completed") return "Response complete";
  const current = activity.filter((item) => item.runId === run.id);
  if (current.some((item) => item.status === "needs-input" && !item.decision))
    return "Needs your approval";
  const active = [...current]
    .reverse()
    .find((item) => item.status === "running");
  return (
    active?.label ||
    run.label ||
    (run.status === "submitted" ? "Thinking…" : "Working…")
  );
}
export interface ChatState {
  conversationId: string;
  messages: readonly ChatMessageData[];
  activity: readonly ChatActivityItem[];
  run?: ChatRun;
  sequence: number;
}
type RunEvent = { conversationId: string; runId: string; sequence: number };
export type ChatEvent =
  | {
      type: "start";
      run: ChatRun;
      message: ChatMessageData;
      userMessage?: ChatMessageData;
    }
  | (RunEvent & {
      type: "text";
      messageId: string;
      partId: string;
      delta: string;
    })
  | (RunEvent & { type: "activity"; item: ChatActivityItem })
  | (RunEvent & {
      type: "status";
      status: Exclude<ChatRun["status"], "idle" | "submitted">;
      error?: string;
      label?: string;
    });

/** Optional host reducer. Identity + monotonic sequence numbers reject stale transport events. */
export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  if (event.type === "start") {
    if (
      isChatRunning(state.run) ||
      event.run.id === state.run?.id ||
      event.run.conversationId !== state.conversationId ||
      event.message.conversationId !== state.conversationId ||
      event.message.runId !== event.run.id ||
      state.messages.some(
        (message) =>
          message.id === event.message.id ||
          message.id === event.userMessage?.id,
      ) ||
      (event.userMessage &&
        event.userMessage.conversationId !== state.conversationId)
    )
      return state;
    return {
      ...state,
      run: event.run,
      sequence: -1,
      activity: [],
      messages: [
        ...state.messages,
        ...(event.userMessage ? [event.userMessage] : []),
        event.message,
      ],
    };
  }
  if (
    !state.run ||
    event.conversationId !== state.conversationId ||
    event.runId !== state.run.id ||
    !isChatRunning(state.run) ||
    !Number.isFinite(event.sequence) ||
    event.sequence <= state.sequence
  )
    return state;
  if (event.type === "status") {
    // A stop request cannot be undone by a late running event. Completion is a valid race winner.
    if (state.run.status === "stopping" && event.status === "running")
      return state;
    const terminal = ["completed", "stopped", "error"].includes(event.status);
    return {
      ...state,
      sequence: event.sequence,
      run: {
        ...state.run,
        status: event.status,
        error: event.error,
        label: event.label,
      },
      activity: terminal
        ? state.activity.map((item) =>
            ["running", "pending", "needs-input"].includes(item.status)
              ? {
                  ...item,
                  status:
                    event.status === "completed" ? "completed" : "cancelled",
                }
              : item,
          )
        : state.activity,
      messages: terminal
        ? state.messages.map((message) =>
            message.runId === event.runId
              ? {
                  ...message,
                  status:
                    event.status === "completed"
                      ? "complete"
                      : (event.status as "stopped" | "error"),
                }
              : message,
          )
        : state.messages,
    };
  }
  if (event.type === "activity") {
    if (event.item.runId !== event.runId) return state;
    const exists = state.activity.some((item) => item.id === event.item.id);
    return {
      ...state,
      sequence: event.sequence,
      activity: exists
        ? state.activity.map((item) =>
            item.id === event.item.id ? event.item : item,
          )
        : [...state.activity, event.item],
    };
  }
  if (state.run.status === "stopping") return state;
  return {
    ...state,
    sequence: event.sequence,
    run: { ...state.run, status: "running" },
    messages: state.messages.map((message) => {
      if (message.id !== event.messageId || message.runId !== event.runId)
        return message;
      const part = message.parts.find((item) => item.id === event.partId);
      if (part && part.type !== "text") return message;
      return {
        ...message,
        status: "streaming",
        parts: part
          ? message.parts.map((item) =>
              item === part ? { ...part, text: part.text + event.delta } : item,
            )
          : [
              ...message.parts,
              { type: "text", id: event.partId, text: event.delta },
            ],
      };
    }),
  };
}

/** Links are deliberately stricter than arbitrary Markdown URLs. Relative same-site links are allowed. */
export function safeChatUrl(
  value?: string,
  allowBlob = false,
): string | undefined {
  if (
    !value ||
    [...value].some(
      (character) =>
        character.charCodeAt(0) <= 32 ||
        character.charCodeAt(0) === 127 ||
        character === "\\",
    )
  )
    return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:", ...(allowBlob ? ["blob:"] : [])].includes(
      url.protocol,
    )
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}
