"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import {
  Button,
  Chat,
  type ChatRun,
  type ChatMessageActionHandlers,
  type ChatPartRenderer,
} from "@dethink/components";
import { MarkdownMessage } from "@dethink/components/chat-markdown";
import { mapSdkActivity, createSdkMessageMapper } from "./sdk-adapter";

const transport = new DefaultChatTransport({ api: "/api/chat-demo" });
const renderPart: ChatPartRenderer = (part) =>
  part.type === "text" ? <MarkdownMessage text={part.text} /> : undefined;
export function ChatSdkExample() {
  const [attempt, setAttempt] = useState<ChatRun>({
    id: "initial",
    conversationId: "sdk",
    status: "idle",
  });
  const [draft, setDraft] = useState("");
  const sdk = useChat({
    id: "dethink-sdk-demo",
    transport,
    experimental_throttle: 32,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onError: (error) =>
      setAttempt((run) => ({ ...run, status: "error", error: error.message })),
    onFinish: ({ isAbort, isError }) =>
      setAttempt((run) => ({
        ...run,
        status: isAbort ? "stopped" : isError ? "error" : "completed",
      })),
  });
  const last = sdk.messages.at(-1);
  const approvalPending =
    last?.role === "assistant" &&
    last.parts.some(
      (part) => isToolUIPart(part) && part.state === "approval-requested",
    );
  const run = useMemo<ChatRun>(
    () => ({
      ...attempt,
      status:
        attempt.status === "stopping" || attempt.status === "stopped"
          ? attempt.status
          : sdk.status === "error"
            ? "error"
            : approvalPending
              ? "running"
              : sdk.status === "submitted"
                ? "submitted"
                : sdk.status === "streaming"
                  ? "running"
                  : attempt.status,
      label:
        sdk.status === "streaming" &&
        last?.parts.some((part) => part.type === "text")
          ? "Writing…"
          : undefined,
    }),
    [attempt, sdk.status, approvalPending, last],
  );
  const mapMessage = useMemo(() => createSdkMessageMapper(), []);
  const messages = useMemo(
    () =>
      sdk.messages.map((message) => {
        const active = message === last && message.role === "assistant";
        return mapMessage(message, "sdk", active ? run : undefined);
      }),
    [sdk.messages, last, run, mapMessage],
  );
  const { clearError, regenerate } = sdk;
  const messageActions = useMemo<ChatMessageActionHandlers>(() => {
    const retry = () => {
      clearError();
      setAttempt({
        id: crypto.randomUUID(),
        conversationId: "sdk",
        status: "submitted",
      });
      void regenerate({ body: { recover: true } });
    };
    return { onRetry: retry, onRegenerate: retry };
  }, [clearError, regenerate]);
  const activity = mapSdkActivity(
    last?.role === "assistant" ? last : undefined,
    run,
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setDraft("Ask for approval before reading the sample document")
          }
        >
          Try approval
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDraft("Simulate an error")}
        >
          Try an error
        </Button>
      </div>
      <Chat
        className="border-border h-[560px] rounded-2xl border"
        conversationId="sdk"
        messages={messages}
        run={run}
        renderPart={renderPart}
        activity={{
          items: activity,
          onApproval: async (decision) => {
            await sdk.addToolApprovalResponse({
              id: decision.approvalId,
              approved: decision.approved,
            });
          },
        }}
        emptyState={
          <p className="text-muted-foreground py-8 text-center text-sm">
            Send a message to exercise a real AI SDK stream using local sample
            data.
          </p>
        }
        prompt={{
          value: draft,
          onValueChange: setDraft,
          onSend: ({ text }) => {
            sdk.clearError();
            setAttempt({
              id: crypto.randomUUID(),
              conversationId: "sdk",
              status: "submitted",
            });
            void sdk.sendMessage({ text });
            return true;
          },
          onStop: async () => {
            setAttempt((current) => ({ ...current, status: "stopping" }));
            await sdk.stop();
            setAttempt((current) => ({ ...current, status: "stopped" }));
          },
          footer: "AI SDK 6 · local streaming endpoint · no model credentials",
        }}
        messageActions={messageActions}
      />
    </div>
  );
}
