import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TagInput, tagInputClassNames } from ".";

describe("TagInput", () => {
  it("renders labels, refs, classes, and uncontrolled tag creation", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();

    const { container } = render(
      <TagInput
        ref={ref}
        className="custom-tag-input"
        label="Labels"
        name="labels"
        placeholder="Add labels"
      />,
    );

    const root = container.querySelector('[data-slot="tag-input"]');
    const input = screen.getByRole("textbox", { name: /Labels/ });

    expect(root).toHaveClass("custom-tag-input");
    expect(ref.current).toBe(root);
    expect(tagInputClassNames({ className: "custom-tag-input" })).toContain(
      "custom-tag-input",
    );
    expect(input).toHaveAttribute("placeholder", "Add labels");

    await user.type(input, "urgent{enter}");

    expect(screen.getByText("urgent")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("supports controlled values, comma and tab creation, and form serialization", async () => {
    const user = userEvent.setup();

    function ControlledTags() {
      const [tags, setTags] = useState(["finance"]);

      return (
        <form aria-label="Tag form">
          <TagInput
            label="Segments"
            name="segments"
            onValueChange={setTags}
            value={tags}
          />
          <output>{tags.join(",")}</output>
        </form>
      );
    }

    render(<ControlledTags />);

    const form = screen.getByRole("form", { name: "Tag form" });
    const input = screen.getByRole("textbox", { name: /Segments/ });

    expect(new FormData(form as HTMLFormElement).getAll("segments")).toEqual([
      "finance",
    ]);

    await user.type(input, "ops,");
    await user.type(input, "vip{tab}");

    expect(screen.getByText("finance,ops,vip")).toBeInTheDocument();
    expect(new FormData(form as HTMLFormElement).getAll("segments")).toEqual([
      "finance",
      "ops",
      "vip",
    ]);
  });

  it("parses pasted comma and newline separated tags", async () => {
    const user = userEvent.setup();

    render(<TagInput label="Recipients" />);

    await user.click(screen.getByRole("textbox", { name: /Recipients/ }));
    await user.paste("alpha, beta\ngamma");

    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(screen.getByText("gamma")).toBeInTheDocument();
  });

  it("removes tags with buttons and backspace", async () => {
    const user = userEvent.setup();

    render(
      <TagInput
        label="Tags"
        defaultValue={["alpha", "beta"]}
        removeLabel="Delete"
      />,
    );

    const input = screen.getByRole("textbox", { name: /Tags/ });

    await user.click(screen.getByRole("button", { name: "Delete alpha" }));

    expect(screen.queryByText("alpha")).not.toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();

    await user.click(input);
    await user.keyboard("{Backspace}");

    expect(screen.queryByText("beta")).not.toBeInTheDocument();
  });

  it("prevents duplicates and validates max count, max length, and custom rules", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    const { rerender } = render(
      <TagInput
        label="Keywords"
        defaultValue={["finance"]}
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByRole("textbox", { name: /Keywords/ });

    await user.type(input, "Finance{enter}");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Finance is already added.",
    );
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(<TagInput label="Keywords" maxTags={1} />);
    await user.clear(input);
    await user.type(input, "one{enter}");
    await user.type(input, "two{enter}");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Add no more than 1 tags.",
    );

    rerender(<TagInput label="Keywords" maxTagLength={3} />);
    await user.clear(input);
    await user.type(input, "toolong{enter}");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Keep tags to 3 characters or fewer.",
    );

    rerender(
      <TagInput
        label="Keywords"
        validateTag={(value) =>
          value.startsWith("#") ? null : "Tags must start with #."
        }
      />,
    );
    await user.clear(input);
    await user.type(input, "plain{enter}");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tags must start with #.",
    );
  });

  it("keeps disabled and read-only tag inputs from changing", async () => {
    const user = userEvent.setup();
    const disabledChange = vi.fn();
    const readOnlyChange = vi.fn();

    const { rerender } = render(
      <TagInput
        disabled
        label="Disabled tags"
        onValueChange={disabledChange}
        defaultValue={["locked"]}
      />,
    );

    expect(
      screen.getByRole("textbox", { name: /Disabled tags/ }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /Remove locked/ }),
    ).toBeDisabled();

    rerender(
      <TagInput
        readOnly
        label="Read only tags"
        onValueChange={readOnlyChange}
        defaultValue={["locked"]}
      />,
    );

    const readOnlyInput = screen.getByRole("textbox", {
      name: /Read only tags/,
    });

    expect(readOnlyInput).toHaveAttribute("readonly");

    await user.click(readOnlyInput);
    await user.keyboard("{Backspace}");

    expect(readOnlyChange).not.toHaveBeenCalled();
  });
});
