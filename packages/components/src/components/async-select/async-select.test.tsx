import { createRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AsyncSelect, asyncSelectClassNames } from ".";

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
    expect(
      asyncSelectClassNames({ className: "custom-async-select" }),
    ).toContain("custom-async-select");

    await user.type(input, "north");

    expect(
      screen.getByRole("option", { name: "Northstar Systems" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Acme Operations" }),
    ).not.toBeInTheDocument();
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
                accountItems.find((item) => item.value === nextValue)?.label ??
                  "",
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

    expect(new FormData(form as HTMLFormElement).get("account")).toBe(
      "dethink",
    );

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

    expect(screen.getByRole("status")).toHaveTextContent(
      "Finding customers...",
    );

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

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Customer search failed.",
    );

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

    expect(
      container.querySelector('[data-slot="multi-select-chip"]'),
    ).toHaveTextContent("Acme Operations");
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

it("preserves authoritative server matches in multiple mode", async () => {
  const user = userEvent.setup();
  render(
    <AsyncSelect
      selectionMode="multiple"
      label="People"
      inputValue="engineering"
      items={[{ value: "ari", label: "Ari Chen" }]}
    />,
  );
  await user.click(screen.getByRole("button", { name: /Show options/ }));
  expect(screen.getByRole("option", { name: "Ari Chen" })).toBeInTheDocument();
});
it("synchronizes controlled single selection labels", () => {
  const items = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];
  const { rerender } = render(
    <AsyncSelect label="Account" items={items} value="a" />,
  );
  rerender(<AsyncSelect label="Account" items={items} value="b" />);
  expect(screen.getByRole("combobox")).toHaveValue("Beta");
});
it("resolves labels arriving after the selected key", () => {
  const { rerender } = render(
    <AsyncSelect label="Account" value="a" items={[]} loading />,
  );
  rerender(
    <AsyncSelect
      label="Account"
      value="a"
      items={[{ value: "a", label: "Alpha" }]}
    />,
  );
  expect(screen.getByRole("combobox")).toHaveValue("Alpha");
});

it("keeps a typed query when refreshed labels arrive", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <AsyncSelect
      label="Account"
      value="a"
      items={[{ value: "a", label: "Alpha" }]}
    />,
  );
  await user.clear(screen.getByRole("combobox"));
  await user.type(screen.getByRole("combobox"), "beta");
  rerender(
    <AsyncSelect
      label="Account"
      value="a"
      items={[{ value: "a", label: "Alpha updated" }]}
    />,
  );
  expect(screen.getByRole("combobox")).toHaveValue("beta");
});
it("shows one accessible loading message inside an open single popup", async () => {
  const user = userEvent.setup();
  render(<AsyncSelect label="Account" loading items={[]} />);
  await user.click(screen.getByRole("button", { name: /Show options/ }));
  expect(screen.getAllByRole("status")).toHaveLength(1);
  expect(
    document.querySelector('[data-slot="combobox-popover"]'),
  ).toHaveTextContent("Loading options...");
});
it.each([{ invalid: true }, { "aria-invalid": true as const }])(
  "shows empty search feedback in an open invalid field (%j)",
  async (validation) => {
    const user = userEvent.setup();
    render(
      <AsyncSelect
        {...validation}
        label="Account"
        inputValue="missing"
        items={[]}
        emptyMessage="No matching accounts"
      />,
    );
    await user.click(screen.getByRole("button", { name: /Show options/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "No matching accounts",
    );
  },
);
it("does not insert cached selected items into the result window", async () => {
  const user = userEvent.setup();
  render(
    <AsyncSelect
      label="Account"
      value="a"
      selectedItems={[{ value: "a", label: "Alpha" }]}
      items={[{ value: "b", label: "Beta" }]}
    />,
  );
  await user.click(screen.getByRole("button", { name: /Show options/ }));
  expect(screen.queryByRole("option", { name: "Alpha" })).toBeNull();
  expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
});

it("tabs from an open error to Retry and returns focus to the input on retry", async () => {
  const user = userEvent.setup();
  const retry = vi.fn();
  render(<AsyncSelect label="Account" error="Unavailable" onRetry={retry} />);
  await user.click(screen.getByRole("button", { name: /Show options/ }));
  await user.tab();
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Retry" })).toHaveFocus(),
  );
  await user.keyboard("{Enter}");
  expect(retry).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
});

it("renders one open multiple-mode status and never offers cached selections as results", async () => {
  const user = userEvent.setup();
  render(
    <AsyncSelect
      selectionMode="multiple"
      label="Owners"
      value={["a"]}
      selectedItems={[{ value: "a", label: "Alpha" }]}
      items={[]}
      loading
    />,
  );
  await user.click(screen.getByRole("button", { name: /Show options/ }));
  expect(screen.getAllByRole("status")).toHaveLength(1);
  expect(screen.queryByRole("option")).toBeNull();
});

it("does not render retry actions for disabled or read-only fields", () => {
  render(
    <>
      <AsyncSelect
        label="Disabled"
        disabled
        error="Unavailable"
        onRetry={() => undefined}
      />
      <AsyncSelect
        label="Read only"
        readOnly
        error="Unavailable"
        onRetry={() => undefined}
      />
    </>,
  );
  expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
});

it("clears the label when a controlled selection becomes null", () => {
  const items = [{ value: "a", label: "Alpha" }];
  const { rerender } = render(
    <AsyncSelect label="Account" value="a" items={items} />,
  );
  rerender(<AsyncSelect label="Account" value={null} items={items} />);
  expect(screen.getByRole("combobox")).toHaveValue("");
});
