import {
  createRef,
  useState,
} from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  AsyncSelect,
  asyncSelectClassNames,
} from ".";

const accountItems = [
  { label: "Acme Operations", value: "acme" },
  { label: "Dethink Labs", value: "dethink" },
  { label: "Northstar Systems", value: "northstar" },
];

describe("AsyncSelect", () => {
  it("renders a single-select async combobox with refs, classes, and app-owned query", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();

    function ControlledAsyncSelect() {
      const [query, setQuery] = useState("");
      const items = accountItems.filter((item) =>
        item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      );

      return (
        <AsyncSelect
          ref={ref}
          className="custom-async-select"
          inputValue={query}
          items={items}
          label="Account"
          name="account"
          onInputValueChange={setQuery}
          placeholder="Search accounts"
        />
      );
    }

    const { container } = render(<ControlledAsyncSelect />);

    const root = container.querySelector('[data-slot="async-select"]');
    const input = screen.getByRole("combobox", { name: /Account/ });

    expect(root).toHaveClass("custom-async-select");
    expect(ref.current).toBe(root);
    expect(asyncSelectClassNames({ className: "custom-async-select" })).toContain(
      "custom-async-select",
    );

    await user.type(input, "north");

    expect(screen.getByRole("option", { name: "Northstar Systems" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Acme Operations" })).not.toBeInTheDocument();
  });

  it("supports controlled single value changes and form serialization", async () => {
    const user = userEvent.setup();

    function ControlledSingle() {
      const [value, setValue] = useState<string | null>("dethink");
      const [query, setQuery] = useState("Dethink Labs");

      return (
        <form aria-label="Async single form">
          <AsyncSelect
            inputValue={query}
            items={accountItems}
            label="Account"
            name="account"
            onInputValueChange={setQuery}
            onValueChange={(nextValue) => {
              setValue(nextValue as string | null);
              setQuery(
                accountItems.find((item) => item.value === nextValue)?.label ?? "",
              );
            }}
            value={value}
          />
          <output>{value ?? "none"}</output>
        </form>
      );
    }

    render(<ControlledSingle />);

    const form = screen.getByRole("form", { name: "Async single form" });

    expect(new FormData(form as HTMLFormElement).get("account")).toBe("dethink");

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.click(screen.getByRole("option", { name: "Acme Operations" }));

    expect(screen.getByText("acme")).toBeInTheDocument();
    expect(new FormData(form as HTMLFormElement).get("account")).toBe("acme");
  });

  it("shows the default selected label in single mode", () => {
    render(
      <form aria-label="Async default form">
        <AsyncSelect
          defaultValue="acme"
          items={accountItems}
          label="Account"
          name="account"
        />
      </form>,
    );

    const form = screen.getByRole("form", { name: "Async default form" });

    expect(screen.getByRole("combobox", { name: /Account/ })).toHaveValue(
      "Acme Operations",
    );
    expect(new FormData(form as HTMLFormElement).get("account")).toBe("acme");
  });

  it("shows loading, empty, min-query, and error states with retry", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const { rerender } = render(
      <AsyncSelect
        inputValue=""
        items={[]}
        label="Customer"
        minQueryLength={3}
        minQueryMessage="Type 3 characters to search customers."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Type 3 characters to search customers.",
    );

    rerender(
      <AsyncSelect
        inputValue="acm"
        items={[]}
        label="Customer"
        loading
        loadingMessage="Finding customers..."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Finding customers...");

    rerender(
      <AsyncSelect
        inputValue="acm"
        items={[]}
        label="Customer"
        emptyMessage="No customer found."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("No customer found.");

    rerender(
      <AsyncSelect
        error="Customer search failed."
        inputValue="acm"
        items={[]}
        label="Customer"
        onRetry={retry}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Customer search failed.");

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("keeps selected values visible when async results change", () => {
    const { container } = render(
      <AsyncSelect
        selectionMode="multiple"
        label="Owners"
        items={[{ label: "New result", value: "new" }]}
        selectedItems={[{ label: "Acme Operations", value: "acme" }]}
        value={["acme"]}
      />,
    );

    expect(container.querySelector('[data-slot="multi-select-chip"]')).toHaveTextContent(
      "Acme Operations",
    );
  });

  it("announces multiple-mode async status while closed", () => {
    render(
      <AsyncSelect
        selectionMode="multiple"
        inputValue="ari"
        items={[]}
        label="Owners"
        loading
        loadingMessage="Finding owners..."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Finding owners...");
  });

  it("supports multiple selection form serialization", async () => {
    const user = userEvent.setup();

    render(
      <form aria-label="Async multi form">
        <AsyncSelect
          selectionMode="multiple"
          label="Accounts"
          name="accounts"
          items={accountItems}
          defaultValue={["dethink"] as string[]}
        />
      </form>,
    );

    const form = screen.getByRole("form", { name: "Async multi form" });

    expect(new FormData(form as HTMLFormElement).getAll("accounts")).toEqual([
      "dethink",
    ]);

    await user.click(screen.getByRole("button", { name: /Show options/ }));
    await user.click(screen.getByRole("option", { name: "Acme Operations" }));

    expect(new FormData(form as HTMLFormElement).getAll("accounts")).toEqual([
      "dethink",
      "acme",
    ]);
  });
});
