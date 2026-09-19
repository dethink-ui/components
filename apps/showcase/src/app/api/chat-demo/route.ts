import {
  createUIMessageStreamResponse,
  isToolUIPart,
  safeValidateUIMessages,
  type UIMessageChunk,
} from "ai";

/** Deterministic protocol fixture. It never calls a model, executes a tool, or persists a prompt. */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 1_000_000)
    return new Response("Sample request too large", { status: 413 });
  let body: { messages?: unknown; recover?: boolean };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (!body || !Array.isArray(body.messages) || body.messages.length > 100)
    return new Response("Invalid messages", { status: 400 });
  const validated = await safeValidateUIMessages({ messages: body.messages });
  if (!validated.success)
    return new Response("Invalid message contract", { status: 400 });
  const messages = validated.data;
  const last = messages.at(-1);
  const user = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const prompt =
    user?.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ") ?? "";
  const decision =
    last?.role === "assistant"
      ? last.parts
          .filter(isToolUIPart)
          .find((part) => part.state === "approval-responded")
      : undefined;
  const messageId = decision ? last!.id : crypto.randomUUID();
  const toolCallId = decision?.toolCallId ?? crypto.randomUUID();
  const abort = new AbortController();
  const abortRequest = () => abort.abort();
  request.signal.addEventListener("abort", abortRequest, { once: true });
  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      if (abort.signal.aborted) {
        resolve();
        return;
      }
      const done = () => {
        clearTimeout(timer);
        abort.signal.removeEventListener("abort", done);
        resolve();
      };
      const timer = setTimeout(done, ms);
      abort.signal.addEventListener("abort", done, { once: true });
    });
  async function* chunks(): AsyncGenerator<UIMessageChunk> {
    yield { type: "start", messageId };
    yield { type: "start-step" };
    await wait(500);
    if (abort.signal.aborted) return;
    if (/error/i.test(prompt) && !body.recover) {
      yield {
        type: "error",
        errorText: "Sample stream interrupted. Retry to recover.",
      };
      return;
    }
    if (!decision) {
      yield {
        type: "tool-input-available",
        toolCallId,
        toolName: "readSampleDocument",
        title: "Read sample document",
        input: { document: "launch-notes" },
        dynamic: true,
      };
      await wait(600);
      if (abort.signal.aborted) return;
      if (/approval|approve/i.test(prompt)) {
        yield {
          type: "tool-approval-request",
          toolCallId,
          approvalId: `approval-${toolCallId}`,
        };
        yield { type: "finish-step" };
        yield { type: "finish", finishReason: "tool-calls" };
        return;
      }
    }
    const denied = decision?.approval?.approved === false;
    yield denied
      ? { type: "tool-output-denied", toolCallId }
      : {
          type: "tool-output-available",
          toolCallId,
          output: { documentsRead: 1 },
          dynamic: true,
        };
    yield { type: "text-start", id: "answer" };
    const answer = denied
      ? "I’ll continue without accessing that document. Choose one audience, define a useful outcome, and start with a small launch."
      : "### A clear next step\n\nStart with **20 design partners**, one measurable outcome, and a short feedback loop. The sample document and source below arrived through the AI SDK stream.\n\n```tsx\n<Chat messages={messages} run={run} />\n```\n\nKeep transport and persistence in your application; the components handle the conversation surface.";
    for (const delta of answer.match(/.{1,14}/gs) ?? []) {
      await wait(40);
      if (abort.signal.aborted) return;
      yield { type: "text-delta", id: "answer", delta };
    }
    yield { type: "text-end", id: "answer" };
    if (!denied) {
      yield {
        type: "source-url",
        sourceId: "sample-guide",
        url: "https://example.com/launch-playbook",
        title: "Sample launch playbook",
      };
      yield {
        type: "file",
        url: "/chat-demo-notes.txt",
        mediaType: "text/plain",
      };
    }
    yield { type: "finish-step" };
    yield { type: "finish", finishReason: "stop" };
  }
  const iterator = chunks();
  const cleanup = () =>
    request.signal.removeEventListener("abort", abortRequest);
  return createUIMessageStreamResponse({
    stream: new ReadableStream<UIMessageChunk>({
      async pull(controller) {
        try {
          const next = await iterator.next();
          if (next.done || abort.signal.aborted) {
            cleanup();
            controller.close();
          } else controller.enqueue(next.value);
        } catch (error) {
          cleanup();
          controller.error(error);
        }
      },
      async cancel() {
        abort.abort();
        await iterator.return(undefined);
        cleanup();
      },
    }),
  });
}
