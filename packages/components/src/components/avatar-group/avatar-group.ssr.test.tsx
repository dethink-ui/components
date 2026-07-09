import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AvatarGroup, type AvatarGroupMember } from ".";

const members: AvatarGroupMember[] = [
  { metadata: "Design systems", name: "Ada Lovelace", src: "/avatars/ada.png" },
  { metadata: "Runtime", name: "Grace Hopper", tone: "success" },
  { metadata: "Architecture", name: "Maya Lin", tone: "warning" },
];

describe("AvatarGroup SSR", () => {
  it("renders deterministic group, Avatar, member list, and overflow markup on the server", () => {
    const html = renderToString(
      <AvatarGroup label="Reviewers" max={2} members={members} />,
    );

    expect(html).toContain('data-slot="avatar-group"');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Reviewers"');
    expect(html).toContain('data-count="3"');
    expect(html).toContain('data-motion="standard"');
    expect(html).toContain('data-motion-behavior="disabled"');
    expect(html).toContain('data-visible-count="2"');
    expect(html).toContain('data-overflow-count="1"');
    expect(html).toContain('data-reveal="none"');
    expect(html).toContain('data-slot="avatar"');
    expect(html).toContain('data-motion="none"');
    expect(html).toContain('data-slot="avatar-group-member-list"');
    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("1 more reviewer");
  });

  it("server-renders deterministic reveal markup without layout-changing attributes", () => {
    const html = renderToString(
      <AvatarGroup
        label="Reveal reviewers"
        max={2}
        members={members}
        overflowLabel={({ count }) => `${count} more reviewer`}
        reveal="spread"
      />,
    );

    expect(html).toContain('data-reveal="spread"');
    expect(html).toContain('data-motion-behavior="transform-opacity"');
    expect(html).toContain('data-magnify="true"');
    expect(html).toContain('data-state="collapsed"');
    expect(html).toContain('tabindex="0"');
    // The dock wave magnifies in place, so the server emits a neutral offset
    // instead of a fanned-out layout that would shift on hydration.
    expect(html).toContain('data-reveal-offset="0"');
    expect(html).toContain('data-slot="avatar-group-reveal-label"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("1 more reviewer");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const element = (
      <AvatarGroup
        dir="rtl"
        label="Hydrate reviewers"
        max={2}
        members={members}
        overlap="lg"
        size="sm"
      />
    );
    const container = document.createElement("div");

    container.innerHTML = renderToString(element);

    await act(async () => {
      hydrateRoot(container, element);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
