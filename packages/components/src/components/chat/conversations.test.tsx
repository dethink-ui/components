import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ConversationList } from "./conversation-list";
const conversations = [
  { id: "a", title: "Launch plan", unread: 2 },
  { id: "b", title: "Design notes", running: true },
];
describe("ConversationList", () => {
  it("searches and selects without conflating rename/delete actions", async () => {
    const select = vi.fn();
    render(
      <ConversationList
        conversations={conversations}
        value="a"
        onValueChange={select}
      />,
    );
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Design" },
    });
    expect(screen.queryByRole("button", { name: /Launch plan/ })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /Design notes/ }));
    expect(select).toHaveBeenCalledWith("b");
    expect(screen.getByText("Working…")).toBeInTheDocument();
  });
  it("requires delete confirmation and retains a rejected operation", async () => {
    const remove = vi.fn(() => false);
    const { container } = render(
      <ConversationList
        conversations={conversations}
        value="a"
        onValueChange={() => {}}
        onDelete={remove}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
    await userEvent.click(
      screen.getByRole("button", { name: "Delete Launch plan" }),
    );
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole("button", { name: "Delete conversation" }),
    );
    expect(remove).toHaveBeenCalledWith("a");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("not accepted");
  });
  it("renames through a labelled dialog", async () => {
    const rename = vi.fn();
    render(
      <ConversationList
        conversations={conversations}
        value="a"
        onValueChange={() => {}}
        onRename={rename}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Rename Launch plan" }),
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "Conversation name" }),
      { target: { value: "Clearer plan" } },
    );
    await userEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(rename).toHaveBeenCalledWith("a", "Clearer plan");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
