"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Chat,
  ResizableWorkspace,
  type ChatMessageData,
} from "@dethink/components";

const conversationId = "launch-studio-chat";

export function ResizableChat() {
  const [draft, setDraft] = useState("");
  const [brief, setBrief] = useState(
    "A calmer place to do focused work.\n\nLaunch a workspace that keeps conversation and the work itself side by side. Start with a small customer pilot, learn from real sessions, and expand when the experience feels right.",
  );
  const [checklist, setChecklist] = useState(false);
  const [request, setRequest] = useState("");
  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: "welcome",
      conversationId,
      role: "assistant",
      name: "Studio",
      parts: [
        {
          id: "text",
          type: "text",
          text: "Your launch brief is ready on the right. Ask for a checklist, or edit the brief directly. Give either pane more room whenever you need it.",
        },
      ],
    },
  ]);

  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            Studio / Chat and canvas
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            Talk it through. Shape it here.
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            A conversation on the left. Room for the work on the right.
          </p>
        </div>
        <Badge variant="soft">Interactive demo</Badge>
      </div>
      <ResizableWorkspace
        id="chat-studio"
        label="Launch studio"
        compactAt={640}
        className="h-[40rem] [--dt-resizable-compact-height:32rem] data-[compact]:h-auto [&_#chat-studio-conversation_[data-slot=resizable-panel-body]]:overflow-hidden [&_#chat-studio-conversation_[data-slot=resizable-panel-body]]:p-0"
        panes={[
          {
            id: "conversation",
            title: "Chat",
            description: "Think alongside your draft",
            defaultSize: "48%",
            minSize: "40%",
            children: (
              <Chat
                conversationId={conversationId}
                messages={messages}
                aria-label="Launch assistant"
                className="h-full"
                prompt={{
                  value: draft,
                  onValueChange: setDraft,
                  label: "Message the launch assistant",
                  placeholder: "Try: Add a launch checklist",
                  footer: "Local demo · sample replies · nothing is sent",
                  onSend: ({ text }) => {
                    const addsChecklist = /checklist/i.test(text);
                    if (addsChecklist) setChecklist(true);
                    setRequest(text);
                    const id = crypto.randomUUID();
                    setMessages((current) => [
                      ...current,
                      {
                        id,
                        conversationId,
                        role: "user",
                        parts: [{ id: "text", type: "text", text }],
                      },
                      {
                        id: `${id}-reply`,
                        conversationId,
                        role: "assistant",
                        name: "Studio",
                        parts: [
                          {
                            id: "text",
                            type: "text",
                            text: addsChecklist
                              ? "I added a launch checklist beside your brief. Your edits are still in place; tick off each step as you go."
                              : "I added your request to the canvas so you can keep it in view while editing. This demo uses sample replies; your brief remains yours to shape.",
                          },
                        ],
                      },
                    ]);
                  },
                }}
              />
            ),
          },
          {
            id: "canvas",
            title: "Launch brief",
            description: "An editable canvas",
            defaultSize: "52%",
            minSize: "30%",
            footer: (
              <span>Session draft · resize without losing your edits</span>
            ),
            children: (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-mono text-xs">
                    BRIEF / 001
                  </span>
                  <Badge variant="soft">Draft</Badge>
                </div>
                <div>
                  <label
                    htmlFor="launch-brief"
                    className="mb-3 block text-lg font-semibold tracking-tight"
                  >
                    The next chapter of work
                  </label>
                  <textarea
                    id="launch-brief"
                    value={brief}
                    onChange={(event) => setBrief(event.target.value)}
                    className="focus-visible:ring-ring min-h-56 w-full resize-y rounded-lg bg-transparent p-1 text-sm leading-7 outline-none focus-visible:ring-2"
                  />
                </div>
                {checklist ? (
                  <fieldset className="border-border space-y-3 rounded-xl border p-4">
                    <legend className="px-1 text-sm font-medium">
                      Launch checklist
                    </legend>
                    {[
                      "Invite the pilot team",
                      "Schedule customer feedback",
                      "Review readiness together",
                    ].map((item) => (
                      <label
                        key={item}
                        className="flex items-start gap-3 text-sm leading-6"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary mt-1 size-4 shrink-0"
                        />
                        {item}
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDraft("Add a launch checklist")}
                  >
                    Ask for a launch checklist
                  </Button>
                )}
                {request && (
                  <div className="border-border border-t pt-4">
                    <p className="text-muted-foreground text-xs font-medium">
                      Latest request
                    </p>
                    <p className="mt-2 text-sm leading-relaxed break-words">
                      {request}
                    </p>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
