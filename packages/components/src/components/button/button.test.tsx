import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormEvent, MouseEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  buttonClassNames,
  type ButtonSize,
  type ButtonVariant,
} from ".";

const variants: ButtonVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "link",
  "destructive",
];

const sizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl", "icon"];

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4 8h8M9 5l3 3-3 3" />
    </svg>
  );
}

describe("Button", () => {
  it("renders a native button with safe defaults", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-slot", "button");
    expect(button).toHaveAttribute("data-variant", "solid");
    expect(button).toHaveAttribute("data-size", "md");
  });

  it("allows explicit native button types", () => {
    render(<Button type="submit">Submit</Button>);

    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("does not submit forms by default", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <form onSubmit={onSubmit}>
        <Button>Default action</Button>
        <Button type="submit">Submit</Button>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Default action" }));

    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("supports explicit reset behavior", async () => {
    const user = userEvent.setup();

    render(
      <form>
        <label htmlFor="project-name">Project name</label>
        <input id="project-name" name="project" defaultValue="Original" />
        <Button type="reset">Reset</Button>
      </form>,
    );

    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.type(input, "Updated");

    expect(input).toHaveValue("Updated");

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(input).toHaveValue("Original");
  });

  it.each(variants)("renders the %s variant attribute", (variant) => {
    render(<Button variant={variant}>Variant</Button>);

    expect(screen.getByRole("button", { name: "Variant" })).toHaveAttribute(
      "data-variant",
      variant,
    );
  });

  it.each(sizes)("renders the %s size attribute", (size) => {
    render(
      <Button aria-label={size} size={size}>
        {size === "icon" ? "+" : "Size"}
      </Button>,
    );

    expect(screen.getByRole("button", { name: size })).toHaveAttribute(
      "data-size",
      size,
    );
  });

  it("handles pointer activation through the public click prop", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Create</Button>);

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not activate when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Disabled" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-disabled", "true");

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("communicates loading state and prevents activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-loading", "true");
    expect(button).toHaveAttribute("data-disabled", "true");
    expect(button.querySelector('[data-slot="button-spinner"]')).toBeTruthy();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports a custom loading indicator without the default CSS spinner", () => {
    render(
      <Button
        loading
        loadingIndicator={<span data-testid="custom-loading">Busy</span>}
      >
        Saving
      </Button>,
    );

    const indicator = screen
      .getByTestId("custom-loading")
      .closest('[data-slot="button-spinner"]');

    expect(indicator).toBeInTheDocument();
    expect(indicator).not.toHaveClass("animate-spin");
  });

  it("renders left and right icon affordances as decorative slots", () => {
    render(
      <Button leftIcon={<PlusIcon />} rightIcon={<ArrowRightIcon />}>
        Create project
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Create project" });

    expect(button.querySelector('[data-slot="button-left-icon"]')).toBeTruthy();
    expect(
      button.querySelector('[data-slot="button-right-icon"]'),
    ).toBeTruthy();
    expect(button).toHaveAccessibleName("Create project");
  });

  it("replaces the left icon with the loading spinner", () => {
    render(
      <Button leftIcon={<PlusIcon />} loading>
        Saving
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving" });

    expect(button.querySelector('[data-slot="button-spinner"]')).toBeTruthy();
    expect(button.querySelector('[data-slot="button-left-icon"]')).toBeNull();
  });

  it("composes classes and behavior onto a child element", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const childClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Button asChild onClick={onClick} variant="outline">
        <a href="/docs" onClick={childClick}>
          Read docs
        </a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Read docs" });

    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link).toHaveAttribute("data-variant", "outline");
    expect(link).not.toHaveAttribute("disabled");
    expect(link).not.toHaveAttribute("type");

    await user.click(link);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("prevents child activation when an asChild button is loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const childClick = vi.fn();

    render(
      <Button asChild loading onClick={onClick}>
        <a href="/docs" onClick={childClick}>
          Read docs
        </a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Read docs" });

    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("data-loading", "true");

    await user.click(link);

    expect(onClick).not.toHaveBeenCalled();
    expect(childClick).not.toHaveBeenCalled();
  });

  it("does not submit while loading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <form onSubmit={onSubmit}>
        <Button loading type="submit">
          Saving
        </Button>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Saving" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps native keyboard activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Create</Button>);

    const button = screen.getByRole("button", { name: "Create" });
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("merges consumer classes after baseline classes", () => {
    expect(buttonClassNames({ className: "px-8" })).toContain("px-8");
  });

  it("uses tokenized focus-visible and state selectors", () => {
    const className = buttonClassNames();

    expect(className).toContain("focus-visible:ring-ring");
    expect(className).toContain("focus-visible:ring-offset-background");
    expect(className).toContain("data-[loading=true]:cursor-wait");
    expect(className).toContain("data-[disabled=true]:opacity-50");
  });
});
