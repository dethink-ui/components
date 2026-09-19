import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { axe } from "jest-axe";
import { Chat } from "./chat";
import { PromptInput } from "./prompt-input";

describe("Chat conversation", () => {
  it("sends by Enter, keeps Shift+Enter and IME text, and clears an accepted draft", async () => {
    const send = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput conversationId="c" onSend={send} />);
    const input = screen.getByRole("textbox", { name: "Message" });
    await user.type(input, "First{Shift>}{Enter}{/Shift}second");
    expect(send).not.toHaveBeenCalled();
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(send).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    await user.keyboard("{Enter}");
    expect(send).toHaveBeenCalledWith({
      conversationId: "c",
      text: "First\nsecond",
      attachments: [],
    });
    await waitFor(() => expect(input).toHaveValue(""));
  });
  it("retains rejected drafts and prevents duplicate requests", async () => {
    let reject!: (value: boolean) => void;
    const send = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          reject = resolve;
        }),
    );
    render(
      <PromptInput conversationId="c" defaultValue="Keep this" onSend={send} />,
    );
    const button = screen.getByRole("button", { name: "Send message" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(send).toHaveBeenCalledTimes(1);
    await act(async () => reject(false));
    expect(screen.getByRole("textbox")).toHaveValue("Keep this");
    expect(screen.getByRole("alert")).toHaveTextContent("not sent");
  });
  it("does not discard a new draft typed while send acknowledgement is pending", async () => {
    let accept!: () => void;
    render(
      <PromptInput
        conversationId="c"
        defaultValue="First"
        onSend={() =>
          new Promise<void>((resolve) => {
            accept = resolve;
          })
        }
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Next draft" },
    });
    await act(async () => accept());
    expect(screen.getByRole("textbox")).toHaveValue("Next draft");
  });
  it("has accessible labels and server markup hydrates without mismatch", async () => {
    const ui = (
      <Chat
        conversationId="c"
        messages={[
          {
            id: "m",
            conversationId: "c",
            role: "assistant",
            parts: [{ id: "t", type: "text", text: "Hello" }],
          },
        ]}
        prompt={{ onSend: () => {} }}
      />
    );
    const { container } = render(ui);
    expect((await axe(container)).violations).toEqual([]);
    const host = document.createElement("div");
    host.innerHTML = renderToString(ui);
    document.body.append(host);
    const recover = vi.fn();
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(host, ui, { onRecoverableError: recover });
    });
    expect(recover).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    host.remove();
  });
});
