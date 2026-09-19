import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { MarkdownMessage } from "../../chat-markdown";
describe("optional Markdown renderer", () => {
  it("does not execute raw HTML, unsafe links, or remote image requests", () => {
    const { container } = render(
      <MarkdownMessage
        text={
          "<script>alert(1)</script>\n\n[unsafe](javascript:alert%281%29)\n\n![tracking](https://example.test/pixel)\n\n[safe](https://example.com)"
        }
      />,
    );
    expect(container.querySelector("script, iframe, img")).toBeNull();
    expect(screen.getByText("unsafe").closest("a")).toBeNull();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });
  it("renders incomplete code and copies only the original code text", async () => {
    const copy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: copy },
    });
    const { rerender, container } = render(
      <MarkdownMessage text={"```ts\nconst answer = 42;"} />,
    );
    expect(screen.getByLabelText("Code block")).toHaveTextContent(
      "const answer = 42;",
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() =>
      expect(copy).toHaveBeenCalledWith("const answer = 42;\n"),
    );
    rerender(
      <MarkdownMessage
        text={
          "```ts\nconst answer = 42;\n```\n\n| Name | Value |\n| --- | --- |\n| Answer | 42 |"
        }
      />,
    );
    expect(screen.getByRole("table")).toHaveTextContent("Answer");
    expect((await axe(container)).violations).toEqual([]);
  });
});
