import {
  chatReducer,
  chatRunLabel,
  safeChatUrl,
  type ChatState,
} from "./chat-state";
const empty: ChatState = {
  conversationId: "c",
  messages: [],
  activity: [],
  sequence: -1,
};
const start = () =>
  chatReducer(empty, {
    type: "start",
    run: { id: "r", conversationId: "c", status: "submitted" },
    message: {
      id: "m",
      conversationId: "c",
      runId: "r",
      role: "assistant",
      parts: [],
    },
  });
const identity = { conversationId: "c", runId: "r" };
describe("chat transport boundary", () => {
  it("rejects duplicate message identity and invalid event sequence numbers", () => {
    const state = start();
    expect(
      chatReducer(state, {
        ...identity,
        type: "status",
        status: "completed",
        sequence: NaN,
      }),
    ).toBe(state);
    const finished = chatReducer(state, {
      ...identity,
      type: "status",
      status: "completed",
      sequence: 1,
    });
    expect(
      chatReducer(finished, {
        type: "start",
        run: { id: "new", conversationId: "c", status: "submitted" },
        message: { ...state.messages[0]!, runId: "new" },
      }),
    ).toBe(finished);
  });
  it("rejects foreign, duplicate, and terminal events while retaining partial text", () => {
    let state = start();
    const event = {
      ...identity,
      type: "text" as const,
      sequence: 1,
      messageId: "m",
      partId: "t",
      delta: "Hello",
    };
    state = chatReducer(state, event);
    expect(chatReducer(state, event)).toBe(state);
    expect(chatReducer(state, { ...event, sequence: 2, runId: "old" })).toBe(
      state,
    );
    expect(
      chatReducer(state, { ...event, sequence: 2, conversationId: "other" }),
    ).toBe(state);
    state = chatReducer(state, {
      ...identity,
      type: "status",
      status: "stopping",
      sequence: 2,
    });
    expect(chatReducer(state, { ...event, sequence: 3 })).toBe(state);
    state = chatReducer(state, {
      ...identity,
      type: "status",
      status: "stopped",
      sequence: 4,
    });
    expect(state.messages[0]?.parts).toEqual([
      { id: "t", type: "text", text: "Hello" },
    ]);
    expect(chatReducer(state, { ...event, sequence: 5 })).toBe(state);
    expect(state.messages[0]?.status).toBe("stopped");
  });
  it("supports stop before a token, tool cancellation, and completion winning a stop race", () => {
    let state = start();
    state = chatReducer(state, {
      ...identity,
      type: "activity",
      sequence: 1,
      item: {
        id: "tool",
        runId: "r",
        kind: "tool",
        status: "running",
        label: "Searching documents…",
      },
    });
    expect(chatRunLabel(state.run, state.activity)).toBe(
      "Searching documents…",
    );
    state = chatReducer(state, {
      ...identity,
      type: "status",
      status: "stopping",
      sequence: 2,
    });
    expect(
      chatReducer(state, {
        ...identity,
        type: "status",
        status: "running",
        sequence: 3,
      }),
    ).toBe(state);
    const stopped = chatReducer(state, {
      ...identity,
      type: "status",
      status: "stopped",
      sequence: 4,
    });
    expect(stopped.activity[0]?.status).toBe("cancelled");
    expect(stopped.messages[0]?.parts).toEqual([]);
    expect(
      chatReducer(state, {
        ...identity,
        type: "status",
        status: "completed",
        sequence: 4,
      }).run?.status,
    ).toBe("completed");
  });
  it("keeps completed rows referentially stable during streaming and isolates new runs", () => {
    const previous = {
      id: "old",
      conversationId: "c",
      role: "user" as const,
      parts: [{ id: "t", type: "text" as const, text: "Question" }],
    };
    const state = { ...start(), messages: [previous, ...start().messages] };
    const updated = chatReducer(state, {
      ...identity,
      type: "text",
      sequence: 1,
      messageId: "m",
      partId: "t",
      delta: "A",
    });
    expect(updated.messages[0]).toBe(previous);
    const failed = chatReducer(updated, {
      ...identity,
      type: "status",
      sequence: 2,
      status: "error",
      error: "Offline",
    });
    const retry = chatReducer(failed, {
      type: "start",
      run: { id: "r2", conversationId: "c", retryOf: "r", status: "submitted" },
      message: {
        id: "m2",
        conversationId: "c",
        runId: "r2",
        role: "assistant",
        parts: [],
      },
    });
    expect(
      chatReducer(retry, {
        ...identity,
        type: "text",
        sequence: 100,
        messageId: "m",
        partId: "t",
        delta: "late",
      }),
    ).toBe(retry);
  });
  it("never treats private payloads or guessed stages as activity", () => {
    expect(chatRunLabel(start().run)).toBe("Thinking…");
    expect(
      chatRunLabel(start().run, [
        {
          id: "a",
          runId: "other",
          kind: "tool",
          status: "running",
          label: "Not this run",
        },
      ]),
    ).toBe("Thinking…");
  });
  it.each([
    "javascript:alert(1)",
    "data:text/html,hi",
    "//evil.test",
    "https:\\evil.test",
    "java\nscript:alert(1)",
  ])("rejects unsafe link %s", (url) => {
    expect(safeChatUrl(url)).toBeUndefined();
  });
});
