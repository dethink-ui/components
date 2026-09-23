import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { axe } from "jest-axe";
import { useState } from "react";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import {
  ChatBubble,
  ChatBubbleClose,
  ChatBubbleContent,
  ChatBubbleTrigger,
} from "./chat-bubble";

function widget(props: Partial<Parameters<typeof ChatBubble>[0]> = {}) {
  return (
    <ChatBubble
      motion="none"
      chat={{
        conversationId: "test",
        messages: [],
        prompt: { onSend: () => true },
      }}
      {...props}
    />
  );
}

describe("ChatBubble", () => {
  it.each(["model", "popover"])(
    "dismisses a nested %s on controlled close and preserves the draft",
    async (kind) => {
      function Example() {
        const [open, setOpen] = useState(true);
        return (
          <>
            <button onClick={() => setOpen(false)}>External close</button>
            <ChatBubble
              open={open}
              onOpenChange={setOpen}
              motion="none"
              chat={{
                conversationId: "nested",
                messages: [],
                prompt: {
                  onSend: () => true,
                  models: [
                    { id: "a", name: "Alpha" },
                    { id: "b", name: "Beta" },
                  ],
                  modelId: "a",
                  onModelChange: () => {},
                  actions: (
                    <Popover>
                      <PopoverTrigger>Details</PopoverTrigger>
                      <PopoverContent aria-label="Extra details">
                        Nested content
                      </PopoverContent>
                    </Popover>
                  ),
                },
              }}
            />
          </>
        );
      }
      const user = userEvent.setup();
      render(<Example />);
      const close = screen.getByRole("button", { name: "External close" });
      await user.type(
        screen.getByRole("textbox", { name: "Message" }),
        "Keep my draft",
      );
      await user.click(
        screen.getByRole("button", {
          name: kind === "model" ? "Alpha Model" : "Details",
        }),
      );
      expect(
        kind === "model"
          ? screen.getByRole("listbox")
          : screen.getByRole("dialog", { name: "Extra details" }),
      ).toBeInTheDocument();
      // ModelPicker is modal; the host may still change the controlled prop.
      fireEvent.click(close);
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Open chat" })).toHaveFocus();
      });
      await user.click(screen.getByRole("button", { name: "Open chat" }));
      expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue(
        "Keep my draft",
      );
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("dialog", { name: "Extra details" }),
      ).not.toBeInTheDocument();
      await user.click(
        screen.getByRole("button", {
          name: kind === "model" ? "Alpha Model" : "Details",
        }),
      );
      expect(
        kind === "model"
          ? screen.getByRole("listbox")
          : screen.getByRole("dialog", { name: "Extra details" }),
      ).toBeInTheDocument();
    },
  );
  it("opens with a keyboard, preserves the draft, and restores focus on Escape", async () => {
    const user = userEvent.setup();
    render(widget());
    const trigger = screen.getByRole("button", { name: "Open chat" });
    trigger.focus();
    await user.keyboard("{Enter}");
    const dialog = screen.getByRole("dialog", { name: "Let’s talk" });
    expect(dialog).toHaveFocus();
    const input = within(dialog).getByRole("textbox", { name: "Message" });
    await user.type(input, "Keep this draft");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(dialog).toHaveAttribute("inert");
    await user.click(trigger);
    expect(screen.getByRole("textbox")).toHaveValue("Keep this draft");
    expect(dialog).not.toHaveAttribute("inert");
  });

  it("honors controlled open state and does not steal focus from outside controls", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <>
        <button>Outside</button>
        {widget({ open: false, onOpenChange })}
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    rerender(
      <>
        <button>Outside</button>
        {widget({ open: true, onOpenChange })}
      </>,
    );
    expect(screen.getByRole("dialog")).toHaveFocus();
    screen.getByRole("button", { name: "Outside" }).focus();
    rerender(
      <>
        <button>Outside</button>
        {widget({ open: false, onOpenChange })}
      </>,
    );
    expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
  });

  it("lets nested widgets consume Escape and custom handlers cancel opening", () => {
    render(
      <ChatBubble motion="none">
        <ChatBubbleTrigger onClick={(event) => event.preventDefault()}>
          Cancelled
        </ChatBubbleTrigger>
        <ChatBubbleContent>
          <input
            aria-label="Nested"
            onKeyDown={(event) => event.preventDefault()}
          />
        </ChatBubbleContent>
      </ChatBubble>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the dialog open when a child consumes Escape", () => {
    render(
      <ChatBubble motion="none" defaultOpen>
        <ChatBubbleTrigger />
        <ChatBubbleContent>
          <input
            aria-label="Nested"
            onKeyDown={(event) => event.preventDefault()}
          />
        </ChatBubbleContent>
      </ChatBubble>,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("preserves rejected sends and only clears an accepted draft", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const user = userEvent.setup();
    render(
      widget({
        defaultOpen: true,
        chat: {
          conversationId: "test",
          messages: [],
          prompt: { onSend: send },
        },
      }),
    );
    const input = screen.getByRole("textbox");
    await user.type(input, "Please help{Enter}");
    await screen.findByText("Message was not sent. Your draft is saved here.");
    expect(input).toHaveValue("Please help");
    await user.click(screen.getByRole("button", { name: "Minimize chat" }));
    await user.click(screen.getByRole("button", { name: "Open chat" }));
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(input).toHaveValue(""));
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("isolates instances, localized labels, refs and unread descriptions", async () => {
    const user = userEvent.setup();
    render(
      <>
        {widget({
          triggerProps: {
            "aria-label": "First",
            unreadCount: 3,
            unreadLabel: "3 nouveaux messages",
          },
        })}
        {widget({
          position: "bottom-left",
          triggerProps: { "aria-label": "Second" },
          contentProps: { title: "Second chat" },
        })}
      </>,
    );
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    expect(first).toHaveAccessibleDescription("3 nouveaux messages");
    expect(first.getAttribute("aria-controls")).not.toBe(
      second.getAttribute("aria-controls"),
    );
    await user.click(first);
    expect(second).toBeVisible();
    await user.click(second);
    expect(screen.getAllByRole("dialog")).toHaveLength(2);
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Second chat" }), {
      key: "Escape",
    });
    expect(
      screen.getByRole("dialog", { name: "Let’s talk" }),
    ).toBeInTheDocument();
  });

  it("inherits provider theme, density and direction into the portal", () => {
    render(
      <DethinkProvider theme="dark" density="compact" dir="rtl">
        {widget({ defaultOpen: true })}
      </DethinkProvider>,
    );
    const portal = screen
      .getByRole("dialog")
      .closest('[data-slot="chat-bubble-portal"]');
    expect(portal).toHaveAttribute("data-theme", "dark");
    expect(portal).toHaveAttribute("data-density", "compact");
    expect(portal).toHaveAttribute("dir", "rtl");
  });

  it("has accessible default and custom compositions", async () => {
    const { unmount } = render(widget({ defaultOpen: true }));
    expect((await axe(document.body)).violations).toEqual([]);
    unmount();
    render(
      <ChatBubble motion="none" defaultOpen>
        <ChatBubbleTrigger />
        <ChatBubbleContent aria-label="Support" header={<ChatBubbleClose />}>
          <p>Custom support</p>
        </ChatBubbleContent>
      </ChatBubble>,
    );
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it("hydrates safely and cleans up its portal on unmount", async () => {
    const ui = widget({ defaultOpen: true });
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.appendChild(container);
    const error = vi.fn();
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, ui, { onRecoverableError: error });
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    expect(
      document.querySelector('[data-slot="chat-bubble-portal"]'),
    ).toBeNull();
    container.remove();
  });
});
