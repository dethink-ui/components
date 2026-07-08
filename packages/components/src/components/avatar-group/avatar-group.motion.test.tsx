import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AvatarGroup, type AvatarGroupMember } from ".";

const members: AvatarGroupMember[] = [
  {
    id: "ada",
    metadata: "Design systems",
    name: "Ada Lovelace",
    tone: "primary",
  },
  {
    id: "grace",
    metadata: "Runtime",
    name: "Grace Hopper",
    tone: "success",
  },
  {
    id: "katherine",
    metadata: "Analytics",
    name: "Katherine Johnson",
    tone: "warning",
  },
];

function getVisualItems(group: HTMLElement) {
  return group.querySelectorAll(
    '[data-slot="avatar-group-item"], [data-slot="avatar-group-overflow"]',
  );
}

describe("AvatarGroup reveal motion", () => {
  it("adds opt-in spread reveal labels without making names animation-only", () => {
    render(
      <AvatarGroup
        label="Reviewers"
        max={2}
        members={members}
        reveal="spread"
      />,
    );

    const group = screen.getByRole("group", { name: "Reviewers" });
    const list = screen.getByRole("list", { name: "Reviewers members" });
    const items = getVisualItems(group);
    const labels = group.querySelectorAll(
      '[data-slot="avatar-group-reveal-label"]',
    );

    expect(group).toHaveAttribute("data-reveal", "spread");
    expect(group).toHaveAttribute("data-motion", "standard");
    expect(group).toHaveAttribute("data-motion-behavior", "transform-opacity");
    expect(group).toHaveAttribute("data-state", "collapsed");
    expect(group).toHaveAttribute("tabindex", "0");
    expect(group).not.toHaveAttribute("data-reduced-motion");
    expect(group).toHaveAccessibleDescription(/Ada Lovelace/);
    expect(
      within(list).getByText("Ada Lovelace - Design systems"),
    ).toBeInTheDocument();
    expect(within(list).getByText("1 more reviewer")).toBeInTheDocument();

    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute("data-reveal-offset", "-14");
    expect(items[1]).toHaveAttribute("data-reveal-offset", "0");
    expect(items[2]).toHaveAttribute("data-reveal-offset", "14");
    expect(items[0].className).toContain("[translate:0_0]");
    expect(items[0].className).toContain("[rotate:0deg]");
    expect(items[0].className).toContain("[scale:1]");

    expect(labels).toHaveLength(3);
    expect(labels[0]).toHaveAttribute("aria-hidden", "true");
    expect(labels[0]).toHaveTextContent("Ada Lovelace");
    expect(labels[2]).toHaveTextContent("1 more reviewer");
  });

  it("reveals on pointer hover, collapses on leave, and ignores touch hover", async () => {
    const user = userEvent.setup();

    render(
      <AvatarGroup
        label="Hover reviewers"
        max={2}
        members={members}
        reveal="spread"
      />,
    );

    const group = screen.getByRole("group", { name: "Hover reviewers" });

    await user.hover(group);
    await waitFor(() => {
      expect(group).toHaveAttribute("data-state", "revealed");
    });
    expect(getVisualItems(group)[0]).toHaveAttribute("data-state", "revealed");

    await user.unhover(group);
    await waitFor(() => {
      expect(group).toHaveAttribute("data-state", "collapsed");
    });

    fireEvent.pointerEnter(group, { pointerType: "touch" });
    expect(group).toHaveAttribute("data-state", "collapsed");
  });

  it("reveals on keyboard focus and collapses on blur", async () => {
    const user = userEvent.setup();

    render(
      <>
        <AvatarGroup
          label="Keyboard reviewers"
          max={2}
          members={members}
          reveal="spread"
        />
        <button type="button">Next focus target</button>
      </>,
    );

    const group = screen.getByRole("group", { name: "Keyboard reviewers" });

    await user.tab();
    expect(group).toHaveFocus();
    expect(group).toHaveAttribute("data-state", "revealed");

    await user.tab();
    expect(group).not.toHaveFocus();
    expect(group).toHaveAttribute("data-state", "collapsed");
  });

  it("disables transform spread for motion='none' and reduced-motion override", () => {
    render(
      <>
        <AvatarGroup
          label="Static reviewers"
          max={2}
          members={members}
          motion="none"
          reveal="spread"
        />
        <AvatarGroup
          label="Reduced reviewers"
          max={2}
          members={members}
          reducedMotion
          reveal="spread"
        />
      </>,
    );

    const staticGroup = screen.getByRole("group", {
      name: "Static reviewers",
    });
    const reducedGroup = screen.getByRole("group", {
      name: "Reduced reviewers",
    });

    expect(staticGroup).toHaveAttribute("data-motion", "none");
    expect(staticGroup).toHaveAttribute("data-motion-behavior", "disabled");
    expect(staticGroup).toHaveAttribute("data-reduced-motion", "true");
    getVisualItems(staticGroup).forEach((item) => {
      expect(item).toHaveAttribute("data-reveal-offset", "0");
    });

    expect(reducedGroup).toHaveAttribute("data-motion", "standard");
    expect(reducedGroup).toHaveAttribute("data-motion-behavior", "opacity");
    expect(reducedGroup).toHaveAttribute("data-reduced-motion", "true");
    getVisualItems(reducedGroup).forEach((item) => {
      expect(item).toHaveAttribute("data-reveal-offset", "0");
    });
    expect(reducedGroup).toHaveAccessibleDescription(/Grace Hopper/);
  });

  it("supports a names summary reveal without transform spread", async () => {
    const user = userEvent.setup();

    render(
      <AvatarGroup
        label="Named reviewers"
        max={2}
        members={members}
        reveal="names"
      />,
    );

    const group = screen.getByRole("group", { name: "Named reviewers" });
    const summary = group.querySelector(
      '[data-slot="avatar-group-reveal-summary"]',
    );

    expect(group).toHaveAttribute("data-motion-behavior", "opacity");
    expect(summary).toHaveAttribute("aria-hidden", "true");
    expect(summary).toHaveTextContent(
      "Ada Lovelace, Grace Hopper, 1 more named reviewer",
    );
    getVisualItems(group).forEach((item) => {
      expect(item).toHaveAttribute("data-reveal-offset", "0");
    });

    await user.hover(group);
    await waitFor(() => {
      expect(group).toHaveAttribute("data-state", "revealed");
      expect(summary).toHaveAttribute("data-state", "revealed");
    });
  });
});
