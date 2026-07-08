import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  IconButton,
  iconButtonClassNames,
  type IconButtonProps,
  type IconButtonShape,
  type IconButtonSize,
  type IconButtonVariant,
} from ".";

const variants: IconButtonVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];

const sizes: IconButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
const shapes: IconButtonShape[] = ["square", "circle"];

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

const validAriaLabelProps = {
  "aria-label": "Create item",
  children: <PlusIcon />,
} satisfies IconButtonProps;

const validAriaLabelledbyProps = {
  "aria-labelledby": "create-item-label",
  children: <PlusIcon />,
} satisfies IconButtonProps;

// @ts-expect-error IconButton requires aria-label or aria-labelledby.
const missingAccessibleNameProps: IconButtonProps = {
  children: <PlusIcon />,
};

void validAriaLabelProps;
void validAriaLabelledbyProps;
void missingAccessibleNameProps;

describe("IconButton", () => {
  it("renders a native icon-only button with safe defaults", () => {
    render(
      <IconButton aria-label="Create item">
        <PlusIcon />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Create item" });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-slot", "icon-button");
    expect(button).toHaveAttribute("data-variant", "ghost");
    expect(button).toHaveAttribute("data-size", "md");
    expect(button).toHaveAttribute("data-shape", "square");
    expect(
      button.querySelector('[data-slot="icon-button-icon"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("supports aria-labelledby as the accessible name", () => {
    render(
      <div>
        <span id="refresh-label">Refresh metrics</span>
        <IconButton aria-labelledby="refresh-label">
          <PlusIcon />
        </IconButton>
      </div>,
    );

    expect(
      screen.getByRole("button", { name: "Refresh metrics" }),
    ).toBeInTheDocument();
  });

  it.each(variants)("renders the %s variant attribute", (variant) => {
    render(
      <IconButton aria-label={variant} variant={variant}>
        <PlusIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: variant })).toHaveAttribute(
      "data-variant",
      variant,
    );
  });

  it.each(sizes)("renders the %s size attribute", (size) => {
    render(
      <IconButton aria-label={size} size={size}>
        <PlusIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: size })).toHaveAttribute(
      "data-size",
      size,
    );
  });

  it.each(shapes)("renders the %s shape attribute", (shape) => {
    render(
      <IconButton aria-label={shape} shape={shape}>
        <PlusIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: shape })).toHaveAttribute(
      "data-shape",
      shape,
    );
  });

  it("handles pointer activation through the public click prop", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton aria-label="Create item" onClick={onClick}>
        <PlusIcon />
      </IconButton>,
    );

    await user.click(screen.getByRole("button", { name: "Create item" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not activate when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton aria-label="Disabled action" disabled onClick={onClick}>
        <PlusIcon />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Disabled action" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-disabled", "true");

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("communicates loading state and prevents activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton aria-label="Refresh metrics" loading onClick={onClick}>
        <PlusIcon />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Refresh metrics" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-loading", "true");
    expect(button).toHaveAttribute("data-disabled", "true");
    expect(
      button.querySelector('[data-slot="icon-button-spinner"]'),
    ).toBeTruthy();
    expect(button.querySelector('[data-slot="icon-button-icon"]')).toBeNull();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("allows explicit submit behavior", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <form onSubmit={onSubmit}>
        <IconButton aria-label="Default action">
          <PlusIcon />
        </IconButton>
        <IconButton aria-label="Submit action" type="submit">
          <PlusIcon />
        </IconButton>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Default action" }));

    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Submit action" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("passes aria-pressed through for toggle use cases", () => {
    render(
      <IconButton aria-label="Bold" aria-pressed="true">
        <PlusIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("composes class names through the helper and component prop", () => {
    expect(
      iconButtonClassNames({
        variant: "outline",
        size: "sm",
        shape: "circle",
        className: "custom-class",
      }),
    ).toContain("custom-class");

    render(
      <IconButton aria-label="Custom" className="custom-class">
        <PlusIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Custom" })).toHaveClass(
      "custom-class",
    );
  });

  it("forwards refs to the native button", () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <IconButton aria-label="Ref target" ref={ref}>
        <PlusIcon />
      </IconButton>,
    );

    expect(ref.current).toBe(
      screen.getByRole("button", { name: "Ref target" }),
    );
  });
});
