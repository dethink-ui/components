import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Avatar } from ".";

describe("Avatar motion", () => {
  it("uses transform and opacity behavior for enabled motion presets", () => {
    render(
      <Avatar data-testid="avatar" motion="standard" name="AI reviewer" />,
    );

    const avatar = screen.getByTestId("avatar");

    expect(avatar).toHaveAttribute("data-motion", "standard");
    expect(avatar).toHaveAttribute("data-motion-behavior", "transform-opacity");
    expect(avatar).not.toHaveAttribute("data-reduced-motion");
    expect(avatar.className).toContain("[scale:1]");
    expect(avatar.className).toContain("[translate:0_0]");
    expect(avatar.className).toContain("[rotate:0deg]");
  });

  it("disables gesture targets for motion='none'", () => {
    render(<Avatar data-testid="avatar" motion="none" name="Static user" />);

    const avatar = screen.getByTestId("avatar");

    expect(avatar).toHaveAttribute("data-motion", "none");
    expect(avatar).toHaveAttribute("data-motion-behavior", "disabled");
    expect(avatar).toHaveAttribute("data-reduced-motion", "true");
  });

  it("switches to opacity-only behavior under reduced motion", async () => {
    render(
      <Avatar
        data-testid="avatar"
        motion="standard"
        name="Reduced user"
        reducedMotion
      />,
    );

    const avatar = screen.getByTestId("avatar");

    expect(avatar).toHaveAttribute("data-motion", "standard");
    await waitFor(() => {
      expect(avatar).toHaveAttribute("data-motion-behavior", "opacity");
      expect(avatar).toHaveAttribute("data-reduced-motion", "true");
    });
  });

  it("marks hover and focus state without relying on layout-changing motion", async () => {
    const user = userEvent.setup();

    render(<Avatar data-testid="avatar" name="Focusable user" tabIndex={0} />);

    const avatar = screen.getByTestId("avatar");

    expect(avatar).toHaveAttribute("data-motion-state", "idle");

    await user.hover(avatar);
    expect(avatar).toHaveAttribute("data-motion-state", "active");

    await user.unhover(avatar);
    expect(avatar).toHaveAttribute("data-motion-state", "idle");

    await user.tab();
    expect(avatar).toHaveFocus();
    expect(avatar).toHaveAttribute("data-motion-state", "active");

    await user.tab();
    expect(avatar).not.toHaveFocus();
    expect(avatar).toHaveAttribute("data-motion-state", "idle");
  });

  it("does not treat touch pointer entry as hover motion state", () => {
    render(<Avatar data-testid="avatar" name="Touch user" />);

    const avatar = screen.getByTestId("avatar");

    fireEvent.pointerEnter(avatar, { pointerType: "touch" });

    expect(avatar).toHaveAttribute("data-motion-state", "idle");
  });
});
