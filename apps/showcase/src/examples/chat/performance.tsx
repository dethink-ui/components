"use client";

import { Profiler, useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Chat,
  type ChatMessageData,
  type ChatPartRenderer,
  type ChatMessageActionHandlers,
} from "@dethink/components";
const messageActions: ChatMessageActionHandlers = {
  onCopy: (text) => navigator.clipboard.writeText(text),
};

function history(count: number): ChatMessageData[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `message-${index}`,
    conversationId: "performance",
    role: index % 2 ? "assistant" : "user",
    parts: [
      {
        id: "text",
        type: "text",
        text: `Message ${index + 1}. ${"A readable conversation with stable message identity. ".repeat((index % 5) + 1)}`,
      },
    ],
  }));
}
function Fixture({ count }: { count: number }) {
  const [messages, setMessages] = useState(() => history(count));
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");
  const [windowed, setWindowed] = useState(count > 500);
  const [hasOlder, setHasOlder] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const stats = useRef({ completed: 0, commits: 0, duration: 0 });
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearInterval(timer.current), []);
  const renderPart = useCallback<ChatPartRenderer>((part, message) => {
    if (message.id !== "live") stats.current.completed++;
    return part.type === "text" ? (
      <p className="whitespace-pre-wrap">{part.text}</p>
    ) : undefined;
  }, []);
  function start() {
    if (running) return;
    const before = stats.current.completed;
    stats.current.commits = 0;
    stats.current.duration = 0;
    const started = performance.now();
    let updates = 0;
    setRunning(true);
    setResult("");
    setMessages((current) => [
      ...current.filter((message) => message.id !== "live"),
      {
        id: "live",
        conversationId: "performance",
        role: "assistant",
        status: "streaming",
        parts: [{ id: "text", type: "text", text: "Streaming: " }],
      },
    ]);
    timer.current = setInterval(() => {
      setMessages((current) =>
        current.map((message) =>
          message.id === "live"
            ? {
                ...message,
                parts: message.parts.map((part) =>
                  part.type === "text"
                    ? { ...part, text: part.text + "another small update. " }
                    : part,
                ),
              }
            : message,
        ),
      );
      if (++updates >= 90) {
        clearInterval(timer.current);
        setRunning(false);
        setMessages((current) =>
          current.map((message) =>
            message.id === "live"
              ? { ...message, status: "complete" }
              : message,
          ),
        );
        setResult(
          JSON.stringify({
            messages: count,
            updates,
            elapsedMs: Math.round(performance.now() - started),
            completedRowRenders: stats.current.completed - before,
            commits: stats.current.commits,
            totalReactMs: Math.round(stats.current.duration),
            mountedRows:
              root.current?.querySelectorAll("[data-chat-row]").length,
            windowed,
          }),
        );
      }
    }, 1000 / 30);
  }
  return (
    <div ref={root} data-testid="chat-performance" className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={start} disabled={running}>
          Stream 90 updates at 30/sec
        </Button>
        <Button
          variant="outline"
          onClick={() => setWindowed((value) => !value)}
          disabled={running}
        >
          {windowed ? "Use full transcript" : "Use windowing"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setMessages((current) => [
              ...history(20).map((message) => ({
                ...message,
                id: `older-${message.id}`,
              })),
              ...current,
            ]);
            setHasOlder(false);
          }}
          disabled={!hasOlder}
        >
          Prepend 20 messages
        </Button>
      </div>
      <output
        data-testid="performance-result"
        className="block min-h-8 font-mono text-xs"
      >
        {result || (running ? "Streaming…" : `${count} messages ready`)}
      </output>
      <Profiler
        id="chat"
        onRender={(_id, _phase, duration) => {
          stats.current.commits++;
          stats.current.duration += duration;
        }}
      >
        <Chat
          conversationId="performance"
          className="border-border h-[600px] rounded-xl border"
          messages={messages}
          renderPart={renderPart}
          messageActions={messageActions}
          history={{
            windowed,
            hasOlder,
            onLoadOlder: () => {
              setMessages((current) => [
                ...history(20).map((message) => ({
                  ...message,
                  id: `older-${message.id}`,
                })),
                ...current,
              ]);
              setHasOlder(false);
            },
          }}
          prompt={{
            onSend: () => true,
            footer:
              "Performance fixture · use the controls above to stream and prepend history",
          }}
        />
      </Profiler>
    </div>
  );
}
export function ChatPerformance() {
  const [count, setCount] = useState(500);
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setCount(500)}>
          500 messages
        </Button>
        <Button variant="outline" onClick={() => setCount(5000)}>
          5,000 messages
        </Button>
      </div>
      <Fixture key={count} count={count} />
    </div>
  );
}
