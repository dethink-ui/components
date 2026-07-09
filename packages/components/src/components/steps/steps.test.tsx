import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Steps, type StepItemData } from ".";

const items: StepItemData[] = [
  { id: "account", label: "Account", description: "Create your account." },
  { id: "profile", label: "Profile", description: "Add profile details." },
  { id: "review", label: "Review", optional: true },
];

describe("Steps horizontal indicator", () => {
  it("uses the first item as current by default", () => {
    render(<Steps items={items} aria-label="Onboarding progress" />);

    const list = screen.getByRole("list", { name: "Onboarding progress" });
    const renderedItems = screen.getAllByRole("listitem");

    expect(list).toHaveAttribute("data-slot", "steps-list");
    expect(renderedItems).toHaveLength(3);
    expect(renderedItems[0]).toHaveAttribute("data-status", "current");
    expect(renderedItems[1]).toHaveAttribute("data-status", "upcoming");
    expect(
      renderedItems[0]?.querySelector('[aria-current="step"]'),
    ).toBeTruthy();
  });

  it("derives complete, current, and upcoming status from a controlled value", () => {
    render(<Steps items={items} value="profile" />);

    const renderedItems = screen.getAllByRole("listitem");

    expect(renderedItems[0]).toHaveAttribute("data-status", "complete");
    expect(renderedItems[1]).toHaveAttribute("data-status", "current");
    expect(renderedItems[2]).toHaveAttribute("data-status", "upcoming");
    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });

  it("supports uncontrolled default state and explicit status overrides", () => {
    render(
      <Steps
        defaultValue="profile"
        items={[
          items[0]!,
          { ...items[1]!, status: "error" },
          { ...items[2]!, status: "skipped" },
        ]}
      />,
    );

    const renderedItems = screen.getAllByRole("listitem");

    expect(renderedItems[1]).toHaveAttribute("data-status", "error");
    expect(renderedItems[1]).toHaveAttribute("data-current", "true");
    expect(renderedItems[2]).toHaveAttribute("data-status", "skipped");
    expect(screen.getByText("Error, current step")).toHaveClass("sr-only");
  });

  it("composes root refs and class names", () => {
    const ref = createRef<HTMLDivElement>();

    render(<Steps ref={ref} className="custom-steps" items={items} />);

    expect(ref.current).toHaveAttribute("data-slot", "steps");
    expect(ref.current).toHaveAttribute("data-orientation", "horizontal");
    expect(ref.current).toHaveClass("custom-steps");
  });

  it("renders an empty labelled list without a current item", () => {
    render(<Steps items={[]} aria-label="Empty workflow" />);

    expect(
      screen.getByRole("list", { name: "Empty workflow" }),
    ).toBeEmptyDOMElement();
    expect(document.querySelector('[aria-current="step"]')).toBeNull();
  });
});

describe("Steps branch and navigation behavior", () => {
  it("activates any enabled item with a native button", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Steps
        interactive
        defaultValue="account"
        items={items}
        onValueChange={onValueChange}
      />,
    );

    const profile = screen.getByRole("button", { name: /Profile/ });
    await user.click(profile);

    expect(profile).toHaveAttribute("aria-current", "step");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("profile");
  });

  it("keeps controlled state parent-owned and blocks disabled items", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Steps
        interactive
        value="account"
        items={[items[0]!, items[1]!, { ...items[2]!, disabled: true }]}
        onValueChange={onValueChange}
      />,
    );

    const profile = screen.getByRole("button", { name: /Profile/ });
    const review = screen.getByRole("button", { name: /Review/ });

    await user.click(profile);
    await user.click(review);

    expect(screen.getByRole("button", { name: /Account/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(review).toBeDisabled();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("profile");
  });

  it("preserves current identity when the future branch changes", () => {
    const { rerender } = render(
      <Steps value="profile" items={[items[0]!, items[1]!, items[2]!]} />,
    );

    rerender(
      <Steps
        value="profile"
        items={[
          items[0]!,
          items[1]!,
          { id: "security", label: "Security questions" },
          { id: "approval", label: "Approval" },
        ]}
      />,
    );

    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    expect(
      screen.getByText("Profile").closest("[aria-current='step']"),
    ).toBeTruthy();
    expect(screen.queryByText("Review")).not.toBeInTheDocument();
    expect(screen.getByText("Security questions")).toBeInTheDocument();
  });

  it("warns without selecting a fallback when current is removed", () => {
    const consoleWarn = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    render(<Steps value="missing" items={items} />);

    expect(document.querySelector('[aria-current="step"]')).toBeNull();
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("Removing the current step is unsupported"),
    );
    consoleWarn.mockRestore();
  });

  it("warns when item ids are duplicated", () => {
    const consoleWarn = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    render(
      <Steps
        items={[
          { id: "duplicate", label: "One" },
          { id: "duplicate", label: "Two" },
        ]}
      />,
    );

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("Duplicate ids: duplicate"),
    );
    consoleWarn.mockRestore();
  });
});

describe("Steps layout, progress, and rendering", () => {
  it("renders an explicit vertical layout with size data", () => {
    render(<Steps items={items} orientation="vertical" size="lg" />);

    const root = screen.getByRole("list").closest('[data-slot="steps"]');
    const list = screen.getByRole("list");

    expect(root).toHaveAttribute("data-orientation", "vertical");
    expect(root).toHaveAttribute("data-size", "lg");
    expect(list).toHaveAttribute("data-orientation", "vertical");
    expect(list).toHaveClass("flex-col");
  });

  it("derives and recalculates progress from the visible branch", () => {
    const { rerender } = render(
      <Steps showProgress value="profile" items={items} />,
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "66.66666666666666",
    );
    expect(screen.getByText("67%")).toBeInTheDocument();

    rerender(
      <Steps
        showProgress
        value="profile"
        items={[
          items[0]!,
          items[1]!,
          { id: "security", label: "Security" },
          { id: "review", label: "Review" },
        ]}
      />,
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("clamps explicit progress and formats visible and accessible text", () => {
    render(
      <Steps
        showProgress
        items={items}
        progressValue={132}
        formatProgress={(percentage, context) =>
          `Milestone ${context.currentIndex + 1} · ${percentage}%`
        }
      />,
    );

    const progress = screen.getByRole("progressbar", {
      name: "Progress steps progress",
    });
    expect(progress).toHaveAttribute("aria-valuenow", "100");
    expect(progress).toHaveAttribute("aria-valuetext", "Milestone 1 · 100%");
    expect(screen.getByText("Milestone 1 · 100%")).toBeInTheDocument();
  });

  it("keeps semantics and activation around typed custom content", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const typedItems: StepItemData<{ owner: string }>[] = [
      { id: "design", label: "Design", data: { owner: "Mina" } },
      { id: "review", label: "Review", data: { owner: "Arun" } },
    ];

    render(
      <Steps
        interactive
        items={typedItems}
        onValueChange={onValueChange}
        renderItem={(item, state) => (
          <span>
            {item.label} · {item.data?.owner} · {state.status}
          </span>
        )}
      />,
    );

    const review = screen.getByRole("button", {
      name: /Review · Arun · upcoming/,
    });
    await user.click(review);

    expect(review.closest("li")).toHaveAttribute("data-status", "current");
    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    expect(onValueChange).toHaveBeenCalledWith("review");
  });

  it("uses distinct visual and readable states for error and skipped items", () => {
    render(
      <Steps
        value="profile"
        items={[
          items[0]!,
          { ...items[1]!, status: "error" },
          { ...items[2]!, status: "skipped" },
        ]}
      />,
    );

    expect(screen.getByText("!")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("–")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Error, current step")).toHaveClass("sr-only");
    expect(screen.getByText("Skipped")).toHaveClass("sr-only");
  });
});
