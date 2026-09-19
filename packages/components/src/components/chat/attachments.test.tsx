import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AttachmentBubble, validateChatFiles } from "./chat-attachment";
import { PromptInput } from "./prompt-input";
describe("chat attachments", () => {
  const file = new File(["hello"], "notes.txt", { type: "text/plain" });
  it("validates count, MIME/extension, and file size at the shared boundary", () => {
    expect(validateChatFiles([file], 0, { accept: ".txt" }).accepted).toEqual([
      file,
    ]);
    expect(
      validateChatFiles([file], 0, { accept: "image/*" }).errors[0],
    ).toContain("type");
    expect(validateChatFiles([file], 1, { maxFiles: 1 }).errors[0]).toContain(
      "maximum 1",
    );
    expect(
      validateChatFiles([file], 0, { maxFileSize: 1 }).errors[0],
    ).toContain("file size");
  });
  it.each(["picker", "paste", "drop"])(
    "validates %s attachments before calling the host",
    async (method) => {
      const onFiles = vi.fn();
      const { container } = render(
        <PromptInput
          conversationId="c"
          onSend={() => {}}
          onFiles={onFiles}
          fileRules={{ accept: "image/*" }}
        />,
      );
      if (method === "picker")
        fireEvent.change(screen.getByLabelText("Attach files"), {
          target: { files: [file] },
        });
      if (method === "paste")
        fireEvent.paste(screen.getByRole("textbox"), {
          clipboardData: { files: [file] },
        });
      if (method === "drop")
        fireEvent.drop(container.querySelector("form")!, {
          dataTransfer: { files: [file] },
        });
      expect(onFiles).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent("not supported");
    },
  );
  it("blocks unfinished uploads and incompatible models without discarding the draft", () => {
    const props = {
      conversationId: "c",
      onSend: vi.fn(),
      defaultValue: "Read this",
      models: [{ id: "text", name: "Text", supportsAttachments: false }],
      modelId: "text",
    };
    const { rerender } = render(
      <PromptInput
        {...props}
        attachments={[
          {
            id: "a",
            name: "notes.txt",
            mediaType: "text/plain",
            status: "uploading",
          },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    rerender(
      <PromptInput
        {...props}
        attachments={[
          {
            id: "a",
            name: "notes.txt",
            mediaType: "text/plain",
            status: "ready",
          },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(screen.getByRole("textbox")).toHaveValue("Read this");
    expect(screen.getByRole("status")).toHaveTextContent("cannot use");
  });
  it("revokes local preview URLs on replacement and unmount", async () => {
    const create = vi
      .fn()
      .mockReturnValueOnce("blob:first")
      .mockReturnValueOnce("blob:second");
    const revoke = vi.fn();
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
    const attachment = {
      id: "a",
      name: "photo.png",
      mediaType: "image/png",
      status: "selected" as const,
      file: new File(["a"], "photo.png", { type: "image/png" }),
    };
    const { rerender, unmount } = render(
      <AttachmentBubble attachment={attachment} />,
    );
    await waitFor(() =>
      expect(screen.getByRole("img")).toHaveAttribute("src", "blob:first"),
    );
    rerender(
      <AttachmentBubble
        attachment={{
          ...attachment,
          file: new File(["b"], "new.png", { type: "image/png" }),
        }}
      />,
    );
    expect(revoke).toHaveBeenCalledWith("blob:first");
    await act(async () => unmount());
    expect(revoke).toHaveBeenCalledWith("blob:second");
  });
});
