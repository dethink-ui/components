import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ToolCallCard, ChatActivity } from "./chat-activity";
import { MessageActions } from "./chat-message";
import type { ChatActivityItem, ChatMessageData } from "./types";
const approval: ChatActivityItem = {
  id: "a",
  runId: "r",
  kind: "approval",
  status: "needs-input",
  label: "Read project documents",
  approvalId: "p",
  summary: "Read-only access to three sample documents.",
};
describe("activity and message actions", () => {
  it("prevents duplicate decisions and waits for host acknowledgement", async () => {
    let accept!: () => void;
    const decide = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          accept = resolve;
        }),
    );
    render(<ToolCallCard activity={approval} onApproval={decide} />);
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(
      screen
        .getAllByRole("button")
        .every((button) => button.hasAttribute("disabled")),
    ).toBe(true);
    await act(async () => accept());
    expect(decide).toHaveBeenCalledWith({
      runId: "r",
      activityId: "a",
      approvalId: "p",
      approved: true,
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "awaiting acknowledgement",
    );
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });
  it("allows retry after a rejected decision and exposes approval without expanding history", async () => {
    const decide = vi.fn(() => false);
    const { container } = render(
      <ChatActivity
        run={{ id: "r", conversationId: "c", status: "running" }}
        items={[approval]}
        onApproval={decide}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Deny" }));
    expect(screen.getByRole("alert")).toHaveTextContent("not accepted");
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
    expect((await axe(container)).violations).toEqual([]);
  });
  it("reports clipboard rejection and only presents supported actions", async () => {
    const message: ChatMessageData = {
      id: "m",
      conversationId: "c",
      role: "assistant",
      parts: [{ id: "t", type: "text", text: "Source text" }],
    };
    const copy = vi.fn(() => Promise.reject(new Error("Clipboard denied")));
    render(<MessageActions message={message} onCopy={copy} />);
    expect(
      screen.queryByRole("button", { name: "Regenerate response" }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Copy message" }));
    expect(copy).toHaveBeenCalledWith("Source text", message);
    expect(screen.getByRole("alert")).toHaveTextContent("Clipboard denied");
  });
});
