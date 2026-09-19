"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  chatReducer,
  isChatRunning,
  type ChatActivityItem,
  type ChatApproval,
  type ChatAttachment,
  type ChatMessageData,
  type ChatPrompt,
  type ChatRun,
  type ChatState,
  type MessageScrollPosition,
} from "@dethink/components";

export const chatModels = [
  {
    id: "thoughtful",
    name: "Thoughtful",
    description: "A little more time, a clearer answer",
    supportsAttachments: true,
    supportsImages: true,
  },
  {
    id: "quick",
    name: "Quick",
    description: "Fast, text-only conversations",
    supportsAttachments: false,
  },
  {
    id: "team",
    name: "Team",
    disabledReason: "Available on the sample Team plan",
  },
];
export const researchAnswer = `Here's a focused plan for your next launch. The best starting point is a small, confident release that gives your team room to learn.

### Make the first week count

1. **Choose one audience.** Start with the customers who already feel the problem most clearly.
2. **Lead with the outcome.** Show the moment their work becomes easier, then explain the details.
3. **Create a feedback loop.** Pair a short onboarding checklist with a check-in after their first success.

**My recommendation:** invite 20 design partners, track activation, and review what you learn before widening access.`;
export const conciseAnswer =
  "Start with 20 design partners. Focus on one valuable outcome, measure activation, and use their feedback to shape the wider launch. Keep the first release small enough to learn quickly.";
const codeAnswer =
  "### A small, accessible starting point\n\nKeep the conversation data in your app and let the components handle presentation.\n\n```tsx\n<Chat\n  conversationId={conversation.id}\n  messages={messages}\n  run={run}\n  prompt={{ onSend: sendMessage, onStop: stop }}\n/>\n```\n\n| State | What people see |\n| --- | --- |\n| Submitted | Thinking… |\n| Tool running | Working… |\n| Streaming | Writing… |\n\nUse stable message IDs and keep completed messages unchanged as new text arrives.";
const sources = [
  {
    id: "guide",
    title: "Launch playbook",
    source: "Sample workspace · 6 pages",
    url: "https://example.com/launch-playbook",
    description: "Audience, positioning, and the first week.",
  },
  {
    id: "notes",
    title: "Customer discovery notes",
    source: "Sample workspace · 12 interviews",
    url: "https://example.com/customer-notes",
    description: "The moments that matter to early customers.",
  },
];
export interface DemoConversation {
  id: string;
  title: string;
  draft: string;
  modelId: string;
  attachments: ChatAttachment[];
  state: ChatState;
  unread: number;
  versions: Record<string, readonly ChatMessageData[]>;
}
function emptyConversation(id: string, title: string): DemoConversation {
  return {
    id,
    title,
    draft: "",
    modelId: "thoughtful",
    attachments: [],
    state: { conversationId: id, messages: [], activity: [], sequence: -1 },
    unread: 0,
    versions: {},
  };
}
function initialRecords(): Record<string, DemoConversation> {
  const launch = emptyConversation("launch", "Launch strategy");
  const message: ChatMessageData = {
    id: "welcome-answer",
    conversationId: "launch",
    role: "assistant",
    name: "Dethink",
    status: "complete",
    parts: [
      {
        id: "text",
        type: "text",
        text: "Let’s make the first week count. Start small, learn quickly, and give your team a clear path forward.\n\n### Three things to focus on\n\n1. **One audience.** Invite 20 design partners who feel the problem.\n2. **One outcome.** Help them reach their first success.\n3. **A feedback loop.** Review activation and what you learn after a week.",
      },
      ...sources.slice(0, 1).map((citation) => ({
        id: citation.id,
        type: "citation" as const,
        citation,
      })),
    ],
    versions: [{ id: "original" }, { id: "concise" }],
    versionId: "original",
  };
  launch.state.messages = [
    {
      id: "welcome-question",
      conversationId: "launch",
      role: "user",
      parts: [
        {
          id: "text",
          type: "text",
          text: "Help me turn our launch ideas into a clear plan for the first week.",
        },
      ],
    },
    message,
  ];
  launch.versions[message.id] = [
    message,
    {
      ...message,
      versionId: "concise",
      parts: [{ id: "text", type: "text", text: conciseAnswer }],
    },
  ];
  launch.state.run = {
    id: "welcome",
    conversationId: "launch",
    status: "completed",
  };
  launch.state.activity = [
    {
      id: "read",
      runId: "welcome",
      kind: "tool",
      status: "completed",
      label: "Reviewed launch context",
      summary: "Two sample documents used.",
    },
  ];
  const design = emptyConversation("design", "Calmer interfaces");
  design.draft = "How can motion make this interface feel calmer?";
  return {
    launch,
    design,
    ideas: emptyConversation("ideas", "A place for ideas"),
  };
}

/** A deterministic host, deliberately separate from the public components. No model or upload service is called. */
export function useChatDemo(startEmpty = false) {
  const [records, setRecords] = useState<Record<string, DemoConversation>>(
    () =>
      startEmpty
        ? { draft: emptyConversation("draft", "New conversation") }
        : initialRecords(),
  );
  const data = useRef(records);
  const [selected, setSelected] = useState(startEmpty ? "draft" : "launch");
  const selectedRef = useRef(selected);
  const timers = useRef(new Map<string, Set<ReturnType<typeof setTimeout>>>());
  const scroll = useRef(new Map<string, MessageScrollPosition>());
  const mounted = useRef(true);
  const update = useCallback(
    (
      id: string,
      transform: (conversation: DemoConversation) => DemoConversation,
    ) => {
      const current = data.current[id];
      if (!current || !mounted.current) return;
      const next = { ...data.current, [id]: transform(current) };
      data.current = next;
      setRecords(next);
    },
    [],
  );
  const clearTimers = useCallback((key: string) => {
    for (const timer of timers.current.get(key) ?? []) clearTimeout(timer);
    timers.current.delete(key);
  }, []);
  const later = useCallback(
    (key: string, delay: number, action: () => void) => {
      const group = timers.current.get(key) ?? new Set();
      timers.current.set(key, group);
      const timer = setTimeout(() => {
        group.delete(timer);
        if (mounted.current) action();
        if (!group.size) timers.current.delete(key);
      }, delay);
      group.add(timer);
    },
    [],
  );
  useEffect(() => {
    mounted.current = true;
    const all = timers.current;
    return () => {
      mounted.current = false;
      for (const group of all.values())
        for (const timer of group) clearTimeout(timer);
      all.clear();
    };
  }, []);
  const event = useCallback(
    (
      id: string,
      runId: string,
      change:
        | {
            type: "status";
            status: "running" | "stopping" | "stopped" | "completed" | "error";
            label?: string;
            error?: string;
          }
        | { type: "activity"; item: ChatActivityItem }
        | { type: "text"; messageId: string; partId: string; delta: string },
    ) =>
      update(id, (conversation) => ({
        ...conversation,
        state: chatReducer(conversation.state, {
          ...change,
          conversationId: id,
          runId,
          sequence: conversation.state.sequence + 1,
        }),
      })),
    [update],
  );
  const write = useCallback(
    (
      id: string,
      runId: string,
      messageId: string,
      text: string,
      withSources: boolean,
      slow = false,
    ) => {
      event(id, runId, {
        type: "activity",
        item: {
          id: "write",
          runId,
          kind: "writing",
          status: "running",
          label: "Writing…",
        },
      });
      const chunks = text.match(/.{1,18}(?:\s|$)|.{1,18}/gs) ?? [text];
      let index = 0;
      const tick = () => {
        const run = data.current[id]?.state.run;
        if (
          run?.id !== runId ||
          !isChatRunning(run) ||
          run.status === "stopping"
        )
          return;
        if (index < chunks.length) {
          event(id, runId, {
            type: "text",
            messageId,
            partId: "text",
            delta: chunks[index++]!,
          });
          later(runId, slow ? 110 : 30, tick);
        } else {
          if (withSources)
            update(id, (conversation) => ({
              ...conversation,
              state: {
                ...conversation.state,
                messages: conversation.state.messages.map((message) =>
                  message.id === messageId
                    ? {
                        ...message,
                        parts: [
                          ...message.parts,
                          ...sources.map((citation) => ({
                            id: citation.id,
                            type: "citation" as const,
                            citation,
                          })),
                        ],
                      }
                    : message,
                ),
              },
            }));
          event(id, runId, { type: "status", status: "completed" });
          update(id, (conversation) => ({
            ...conversation,
            unread: selectedRef.current === id ? 0 : conversation.unread + 1,
          }));
        }
      };
      later(runId, 350, tick);
    },
    [event, later, update],
  );
  const begin = useCallback(
    (prompt: ChatPrompt, retryOf?: string, skipUser = false) => {
      const conversation = data.current[prompt.conversationId];
      if (!conversation || isChatRunning(conversation.state.run)) return false;
      const runId = crypto.randomUUID();
      const messageId = `${runId}-answer`;
      const id = conversation.id;
      const text = prompt.text.toLowerCase();
      const kind = /approval|approve/.test(text)
        ? "approval"
        : /fail|error|offline/.test(text)
          ? "error"
          : /code|component/.test(text)
            ? "code"
            : /slow/.test(text)
              ? "slow"
              : "research";
      update(id, (current) => ({
        ...current,
        attachments: [],
        state: chatReducer(current.state, {
          type: "start",
          run: {
            id: runId,
            conversationId: id,
            messageId,
            status: "submitted",
            retryOf,
          },
          userMessage: skipUser
            ? undefined
            : {
                id: `${runId}-question`,
                conversationId: id,
                role: "user",
                parts: [
                  { id: "text", type: "text", text: prompt.text },
                  ...prompt.attachments.map((attachment) => ({
                    id: attachment.id,
                    type: "attachment" as const,
                    attachment,
                  })),
                ],
              },
          message: {
            id: messageId,
            conversationId: id,
            runId,
            role: "assistant",
            name: "Dethink",
            status: "streaming",
            parts: [],
            metadata: { prompt: prompt.text },
          },
        }),
      }));
      later(runId, 700, () => {
        event(id, runId, { type: "status", status: "running" });
        event(id, runId, {
          type: "activity",
          item: {
            id: "understand",
            runId,
            kind: "thinking",
            status: "completed",
            label: "Understood your request",
            summary: "Public activity summary: preparing a useful next step.",
          },
        });
        event(id, runId, {
          type: "activity",
          item: {
            id: "search",
            runId,
            kind: "tool",
            status: "running",
            label: "Searching workspace…",
            summary: "Looking through two sample documents.",
          },
        });
        later(runId, kind === "slow" ? 2400 : 1200, () => {
          event(id, runId, {
            type: "activity",
            item: {
              id: "search",
              runId,
              kind: "tool",
              status: kind === "error" ? "error" : "completed",
              label: "Searched workspace",
              summary:
                kind === "error"
                  ? "The sample connection was interrupted."
                  : "Found the launch playbook and discovery notes.",
            },
          });
          if (kind === "error") {
            event(id, runId, {
              type: "status",
              status: "error",
              error:
                "The sample connection was interrupted. Try again to recover this response.",
            });
            return;
          }
          if (kind === "approval") {
            event(id, runId, {
              type: "activity",
              item: {
                id: "approval",
                runId,
                kind: "approval",
                status: "needs-input",
                label: "Read the launch documents?",
                summary:
                  "Read-only access to two sample files. Nothing will be changed or shared.",
                approvalId: `${runId}-approval`,
              },
            });
            return;
          }
          write(
            id,
            runId,
            messageId,
            kind === "code" ? codeAnswer : researchAnswer,
            kind !== "code",
            kind === "slow",
          );
        });
      });
      return true;
    },
    [event, later, update, write],
  );
  const approve = useCallback(
    (decision: ChatApproval) => {
      const conversation = Object.values(data.current).find(
        (item) => item.state.run?.id === decision.runId,
      );
      const item = conversation?.state.activity.find(
        (activity) =>
          activity.id === decision.activityId &&
          activity.approvalId === decision.approvalId,
      );
      if (
        !conversation ||
        !item ||
        item.status !== "needs-input" ||
        item.decision ||
        !isChatRunning(conversation.state.run)
      )
        return false;
      event(conversation.id, decision.runId, {
        type: "activity",
        item: {
          ...item,
          decision: decision.approved ? "approved" : "denied",
          status: decision.approved ? "completed" : "cancelled",
        },
      });
      write(
        conversation.id,
        decision.runId,
        conversation.state.run!.messageId!,
        decision.approved
          ? researchAnswer
          : "I’ll continue without opening those documents. Start with a small audience, one measurable outcome, and a short feedback loop. You can approve access in a future request if you’d like a plan grounded in your workspace.",
        decision.approved,
      );
      return true;
    },
    [event, write],
  );
  const stop = useCallback(
    (run: ChatRun) => {
      if (
        data.current[run.conversationId]?.state.run?.id !== run.id ||
        !isChatRunning(run)
      )
        return false;
      clearTimers(run.id);
      event(run.conversationId, run.id, { type: "status", status: "stopping" });
      later(run.id, 180, () =>
        event(run.conversationId, run.id, {
          type: "status",
          status: "stopped",
        }),
      );
      return true;
    },
    [clearTimers, event, later],
  );
  const upload = useCallback(
    (id: string, attachment: ChatAttachment, retry = false) => {
      update(id, (conversation) => ({
        ...conversation,
        attachments: conversation.attachments.map((item) =>
          item.id === attachment.id
            ? { ...item, status: "uploading", progress: 10, error: undefined }
            : item,
        ),
      }));
      later(attachment.id, 450, () =>
        update(id, (conversation) => ({
          ...conversation,
          attachments: conversation.attachments.map((item) =>
            item.id === attachment.id ? { ...item, progress: 65 } : item,
          ),
        })),
      );
      later(attachment.id, 1000, () =>
        update(id, (conversation) => ({
          ...conversation,
          attachments: conversation.attachments.map((item) =>
            item.id === attachment.id
              ? {
                  ...item,
                  status: /fail/i.test(item.name) && !retry ? "error" : "ready",
                  progress: 100,
                  error: "Sample upload failed. Retry to recover.",
                }
              : item,
          ),
        })),
      );
    },
    [later, update],
  );
  const addFiles = useCallback(
    (id: string, files: readonly File[]) => {
      const attachments = files.map((file): ChatAttachment => ({
        id: crypto.randomUUID(),
        name: file.name,
        mediaType: file.type,
        size: file.size,
        file,
        status: "selected",
      }));
      update(id, (conversation) => ({
        ...conversation,
        attachments: [...conversation.attachments, ...attachments],
      }));
      for (const attachment of attachments) upload(id, attachment);
    },
    [update, upload],
  );
  const select = useCallback(
    (id: string) => {
      if (!data.current[id]) return false;
      selectedRef.current = id;
      setSelected(id);
      update(id, (conversation) => ({ ...conversation, unread: 0 }));
    },
    [update],
  );
  const create = useCallback(() => {
    const id = crypto.randomUUID();
    const next = {
      ...data.current,
      [id]: emptyConversation(id, "New conversation"),
    };
    data.current = next;
    setRecords(next);
    select(id);
  }, [select]);
  const remove = useCallback(
    (id: string) => {
      const conversation = data.current[id];
      if (!conversation) return false;
      if (conversation.state.run) clearTimers(conversation.state.run.id);
      for (const attachment of conversation.attachments)
        clearTimers(attachment.id);
      const next = { ...data.current };
      delete next[id];
      data.current = next;
      setRecords(next);
      scroll.current.delete(id);
      if (selectedRef.current === id) {
        const fallback = Object.keys(next)[0];
        if (fallback) select(fallback);
        else create();
      }
    },
    [clearTimers, create, select],
  );
  const retry = useCallback(
    (message: ChatMessageData) =>
      begin(
        {
          conversationId: message.conversationId,
          text:
            typeof message.metadata?.prompt === "string"
              ? message.metadata.prompt.replace(
                  /fail|error|offline/gi,
                  "recover",
                )
              : "Help me plan the launch",
          attachments: [],
        },
        message.runId,
        true,
      ),
    [begin],
  );
  const version = useCallback(
    (message: ChatMessageData, versionId: string) => {
      const original = data.current[message.conversationId]?.versions[
        message.id
      ]?.find((item) => item.versionId === versionId);
      if (!original) return false;
      update(message.conversationId, (conversation) => ({
        ...conversation,
        state: {
          ...conversation.state,
          messages: conversation.state.messages.map((item) =>
            item.id === message.id
              ? { ...item, parts: original.parts, versionId }
              : item,
          ),
        },
      }));
    },
    [update],
  );
  return {
    records,
    selected,
    current: records[selected]!,
    scroll,
    update,
    begin,
    stop,
    approve,
    addFiles,
    upload,
    select,
    create,
    remove,
    retry,
    version,
    clearTimers,
  };
}
