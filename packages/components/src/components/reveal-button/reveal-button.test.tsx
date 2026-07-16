import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type FormEvent, type SVGProps } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  RevealButton,
  revealButtonClassNames,
  type RevealButtonLabelVisibility,
  type RevealButtonMotion,
  type RevealButtonProps,
  type RevealButtonSize,
  type RevealButtonVariant,
} from ".";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../dialog";

const variants: RevealButtonVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: RevealButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
const motions: RevealButtonMotion[] = ["none", "subtle", "standard"];
const labelVisibilities: RevealButtonLabelVisibility[] = ["hover", "always"];

function PlusIcon({ className }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 16 16">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

const validProps = {
  icon: <PlusIcon />,
  label: "Create item",
} satisfies RevealButtonProps;

const ariaLabelProps = {
  // @ts-expect-error RevealButton owns its accessible name through label.
  "aria-label": "Create item",
  icon: <PlusIcon />,
  label: "Create item",
} satisfies RevealButtonProps;

const childrenProps = {
  // @ts-expect-error RevealButton does not render arbitrary children.
  children: "Create item",
  icon: <PlusIcon />,
  label: "Create item",
} satisfies RevealButtonProps;

void validProps;
void ariaLabelProps;
void childrenProps;

describe("RevealButton", () => {
  it("renders a native reveal button with safe defaults", () => {
    render(<RevealButton icon={<PlusIcon />} label="Create item" />);

    const button = screen.getByRole("button", { name: "Create item" });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-label", "Create item");
    expect(button).toHaveAttribute("data-slot", "reveal-button");
    expect(button).toHaveAttribute("data-variant", "ghost");
    expect(button).toHaveAttribute("data-size", "md");
    expect(button).toHaveAttribute("data-motion", "standard");
    expect(button).toHaveAttribute("data-label-visibility", "hover");
    expect(button).toHaveAttribute("data-state", "collapsed");
    expect(
      button.querySelector('[data-slot="reveal-button-icon"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(
      button.querySelector('[data-slot="reveal-button-icon-motion"]'),
    ).toBeTruthy();
    expect(button.querySelector("svg")).toHaveClass("size-full");
    expect(
      button.querySelector('[data-slot="reveal-button-label"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it.each(variants)("renders the %s variant attribute", (variant) => {
    render(
      <RevealButton
        icon={<PlusIcon />}
        label={`${variant} action`}
        variant={variant}
      />,
    );

    expect(
      screen.getByRole("button", { name: `${variant} action` }),
    ).toHaveAttribute("data-variant", variant);
  });

  it.each(sizes)("renders the %s size attribute", (size) => {
    render(
      <RevealButton icon={<PlusIcon />} label={`${size} action`} size={size} />,
    );

    expect(
      screen.getByRole("button", { name: `${size} action` }),
    ).toHaveAttribute("data-size", size);
  });

  it.each(motions)("renders the %s motion attribute", (motion) => {
    render(
      <RevealButton
        icon={<PlusIcon />}
        label={`${motion} action`}
        motion={motion}
      />,
    );

    const button = screen.getByRole("button", { name: `${motion} action` });

    expect(button).toHaveAttribute("data-motion", motion);

    if (motion === "none") {
      expect(button).toHaveAttribute("data-reduced-motion", "true");
    }
  });

  it.each(labelVisibilities)(
    "renders the %s label visibility attribute",
    (mode) => {
      render(
        <RevealButton
          icon={<PlusIcon />}
          label={`${mode} action`}
          labelVisibility={mode}
        />,
      );

      const button = screen.getByRole("button", { name: `${mode} action` });

      expect(button).toHaveAttribute("data-label-visibility", mode);
      expect(button).toHaveAttribute(
        "data-state",
        mode === "always" ? "revealed" : "collapsed",
      );
    },
  );

  it("reveals the label on hover and collapses on unhover", async () => {
    const user = userEvent.setup();

    render(<RevealButton icon={<PlusIcon />} label="Create item" />);

    const button = screen.getByRole("button", { name: "Create item" });

    await user.hover(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("data-state", "revealed"),
    );

    await user.unhover(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("data-state", "collapsed"),
    );
  });

  it("reveals the label on keyboard focus and collapses on blur", async () => {
    const user = userEvent.setup();

    render(<RevealButton icon={<PlusIcon />} label="Create item" />);

    const button = screen.getByRole("button", { name: "Create item" });

    await user.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("data-state", "revealed");

    await user.tab();
    expect(button).not.toHaveFocus();
    expect(button).toHaveAttribute("data-state", "collapsed");
  });

  it("handles pointer activation through the public click prop", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <RevealButton
        icon={<PlusIcon />}
        label="Create item"
        onClick={onClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create item" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("acts as a keyboard-operable React Aria dialog trigger", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <RevealButton icon={<PlusIcon />} label="Open details" />
        <DialogContent>
          <DialogTitle>Item details</DialogTitle>
          <DialogClose>Close details</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole("button", { name: "Open details" });

    await user.tab();
    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "Item details" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Close details" }));
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.keyboard(" ");
    expect(screen.getByRole("dialog", { name: "Item details" })).toBeVisible();
  });

  it("does not activate a React Aria trigger while loading", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <RevealButton icon={<PlusIcon />} label="Open details" loading />
        <DialogContent>
          <DialogTitle>Item details</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole("button", { name: "Open details" });

    await user.click(trigger);
    expect(screen.queryByRole("dialog", { name: "Item details" })).toBeNull();

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("dialog", { name: "Item details" })).toBeNull();
  });

  it("does not activate when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <RevealButton
        disabled
        icon={<PlusIcon />}
        label="Disabled action"
        onClick={onClick}
      />,
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
      <RevealButton
        icon={<PlusIcon />}
        label="Refresh metrics"
        loading
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button", { name: "Refresh metrics" });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("data-loading", "true");
    expect(button).not.toHaveAttribute("data-disabled");
    expect(
      button.querySelector('[data-slot="reveal-button-spinner"]'),
    ).toBeTruthy();
    expect(
      button.querySelector('[data-slot="reveal-button-spinner-glyph"]'),
    ).toBeTruthy();
    expect(button.querySelector('[data-slot="reveal-button-icon"]')).toBeNull();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("reveals the loading label on hover while blocking activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <RevealButton
        icon={<PlusIcon />}
        label="Refresh metrics"
        loading
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button", { name: "Refresh metrics" });

    await user.hover(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("data-state", "revealed"),
    );

    await user.unhover(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("data-state", "collapsed"),
    );

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("reveals the loading label on keyboard focus", async () => {
    const user = userEvent.setup();

    render(
      <RevealButton icon={<PlusIcon />} label="Refresh metrics" loading />,
    );

    const button = screen.getByRole("button", { name: "Refresh metrics" });

    await user.tab();

    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("data-state", "revealed");
  });

  it("allows explicit submit behavior", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <form onSubmit={onSubmit}>
        <RevealButton icon={<PlusIcon />} label="Default action" />
        <RevealButton icon={<PlusIcon />} label="Submit action" type="submit" />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Default action" }));

    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Submit action" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("passes aria-pressed through for toggle use cases", () => {
    render(
      <RevealButton aria-pressed="true" icon={<PlusIcon />} label="Bold" />,
    );

    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("composes class names through the helper and component prop", () => {
    expect(
      revealButtonClassNames({
        variant: "outline",
        size: "sm",
        className: "custom-class",
      }),
    ).toContain("custom-class");

    render(
      <RevealButton
        className="custom-class"
        icon={<PlusIcon />}
        label="Custom action"
      />,
    );

    expect(screen.getByRole("button", { name: "Custom action" })).toHaveClass(
      "custom-class",
    );
  });

  it("forwards refs to the native button", () => {
    const ref = createRef<HTMLButtonElement>();

    render(<RevealButton icon={<PlusIcon />} label="Ref target" ref={ref} />);

    expect(ref.current).toBe(
      screen.getByRole("button", { name: "Ref target" }),
    );
  });
});
