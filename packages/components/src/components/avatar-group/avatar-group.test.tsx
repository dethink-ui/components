import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AvatarGroup,
  avatarGroupClassNames,
  type AvatarGroupMember,
  type AvatarGroupOverlap,
  type AvatarGroupProps,
} from ".";

const members: AvatarGroupMember[] = [
  {
    id: "ada",
    metadata: "Design systems",
    name: "Ada Lovelace",
    src: "/avatars/ada.png",
    tone: "primary",
  },
  {
    id: "grace",
    metadata: "Runtime",
    name: "Grace Hopper",
    tone: "success",
  },
  {
    id: "maya",
    metadata: "Architecture",
    name: "Maya Lin",
    tone: "warning",
  },
  {
    id: "alan",
    metadata: "Security",
    name: "Alan Turing",
    tone: "info",
  },
  {
    id: "katherine",
    metadata: "Analytics",
    name: "Katherine Johnson",
    tone: "destructive",
  },
];

function TeamIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M6.5 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM11.5 8a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM2.5 13a4 4 0 0 1 8 0M9.5 13a3 3 0 0 1 4-2.83" />
    </svg>
  );
}

describe("AvatarGroup", () => {
  it("renders a compact decorative Avatar stack with max visible members and overflow", () => {
    render(
      <AvatarGroup
        data-testid="group"
        label="Reviewers"
        max={3}
        members={members}
        size="sm"
      />,
    );

    const group = screen.getByRole("group", { name: "Reviewers" });
    const stack = group.querySelector('[data-slot="avatar-group-stack"]');
    const visualAvatars = group.querySelectorAll('[data-slot="avatar"]');

    expect(group).toBe(screen.getByTestId("group"));
    expect(group).toHaveAttribute("data-slot", "avatar-group");
    expect(group).toHaveAttribute("data-count", "5");
    expect(group).toHaveAttribute("data-visible-count", "3");
    expect(group).toHaveAttribute("data-overflow", "true");
    expect(group).toHaveAttribute("data-overflow-count", "2");
    expect(group).toHaveAttribute("data-size", "sm");
    expect(group).toHaveAttribute("data-shape", "circle");
    expect(group).toHaveAttribute("data-ring", "border");
    expect(group).toHaveAttribute("data-overlap", "md");
    expect(stack).toHaveAttribute("aria-hidden", "true");
    expect(visualAvatars).toHaveLength(4);
    expect(visualAvatars[0]).toHaveAttribute("data-slot", "avatar");
    expect(visualAvatars[0]).toHaveAttribute("data-motion", "none");
    expect(visualAvatars[0]).toHaveAttribute("data-size", "sm");
    expect(visualAvatars[0]).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("exposes group and member names through a hidden native member list", () => {
    render(<AvatarGroup label="Reviewers" max={3} members={members} />);

    const group = screen.getByRole("group", { name: "Reviewers" });
    const list = screen.getByRole("list", { name: "Reviewers members" });

    expect(group).toHaveAccessibleDescription(/Ada Lovelace/);
    expect(group).toHaveAccessibleDescription(/2 more reviewers/);
    expect(
      within(list).getByText("Ada Lovelace - Design systems"),
    ).toHaveAttribute("data-slot", "avatar-group-member");
    expect(
      within(list).getByText("Katherine Johnson - Analytics"),
    ).toBeInTheDocument();
    expect(within(list).getByText("2 more reviewers")).toHaveAttribute(
      "data-slot",
      "avatar-group-overflow-label",
    );
  });

  it("supports custom member and overflow label formatting", () => {
    render(
      <AvatarGroup
        label="Approvers"
        max={2}
        members={members}
        overflowLabel={({ count }) => `${count} hidden approvers`}
        visibleMemberLabel={(member, index) =>
          `${index + 1}. ${member.name ?? "Unnamed member"}`
        }
      />,
    );

    const list = screen.getByRole("list", { name: "Approvers members" });

    expect(
      within(list).getByText("1. Ada Lovelace - Design systems"),
    ).toBeInTheDocument();
    expect(
      within(list).getByText("5. Katherine Johnson - Analytics"),
    ).toBeInTheDocument();
    expect(within(list).getByText("3 hidden approvers")).toBeInTheDocument();
  });

  it("passes constrained Avatar props through member data without forking Avatar", () => {
    render(
      <AvatarGroup
        label="Organizations"
        max={2}
        members={[
          {
            avatarClassName: "custom-avatar",
            fallbackIcon: <TeamIcon />,
            label: "Platform team",
            metadata: "Six members",
            name: "Platform team",
            ring: "ring",
            shape: "rounded",
            size: "lg",
            tone: "primary",
          },
          {
            initials: "AO",
            label: "Acme Operations",
            metadata: "Enterprise account",
            name: "Acme Operations",
            shape: "square",
            tone: "success",
          },
        ]}
        ring="border"
        shape="circle"
        size="sm"
      />,
    );

    const visualAvatars = screen
      .getByRole("group", { name: "Organizations" })
      .querySelectorAll('[data-slot="avatar"]');

    expect(visualAvatars[0]).toHaveAttribute("data-ring", "ring");
    expect(visualAvatars[0]).toHaveAttribute("data-shape", "rounded");
    expect(visualAvatars[0]).toHaveAttribute("data-size", "lg");
    expect(visualAvatars[0]).toHaveAttribute("data-tone", "primary");
    expect(visualAvatars[0]).toHaveClass("custom-avatar");
    expect(
      visualAvatars[0].querySelector('[data-slot="avatar-icon"]'),
    ).toBeTruthy();
    expect(visualAvatars[1]).toHaveAttribute("data-shape", "square");
    expect(visualAvatars[1]).toHaveAttribute("data-size", "sm");
    expect(visualAvatars[1]).toHaveTextContent("AO");
  });

  it("uses logical overlap spacing and stable stack order in RTL", () => {
    render(
      <AvatarGroup
        dir="rtl"
        label="RTL reviewers"
        max={2}
        members={members}
        overlap="lg"
      />,
    );

    const group = screen.getByRole("group", { name: "RTL reviewers" });
    const items = group.querySelectorAll(
      '[data-slot^="avatar-group-"][data-stack-index]',
    );

    expect(group).toHaveAttribute("dir", "rtl");
    expect(group).toHaveAttribute("data-direction", "rtl");
    expect(group).toHaveAttribute("data-overlap", "lg");
    expect(group.className).toContain("[--avatar-group-overlap:");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute("data-stack-index", "1");
    expect(items[1]).toHaveAttribute("data-stack-index", "2");
    expect(items[2]).toHaveAttribute("data-stack-index", "3");
    expect(items[1].className).toContain("margin-inline-start");
  });

  it("merges consumer classes, native attributes, external descriptions, and refs", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <div>
        <p id="external-description">
          Visible names follow in the adjacent row.
        </p>
        <AvatarGroup
          ref={ref}
          aria-describedby="external-description"
          className="custom-group"
          id="reviewer-group"
          label="Reviewers"
          members={members.slice(0, 2)}
          title="Reviewer group"
        />
      </div>,
    );

    const group = screen.getByRole("group", { name: "Reviewers" });

    expect(group).toHaveAttribute("id", "reviewer-group");
    expect(group).toHaveAttribute("title", "Reviewer group");
    expect(group).toHaveClass("custom-group");
    expect(group).toHaveAccessibleDescription(/Visible names follow/);
    expect(ref.current).toBe(group);
    expect(avatarGroupClassNames({ className: "custom-group" })).toContain(
      "custom-group",
    );
  });

  it.each<AvatarGroupOverlap>(["none", "sm", "md", "lg"])(
    "renders %s overlap as a stable data attribute",
    (overlap) => {
      render(
        <AvatarGroup
          label={`${overlap} overlap`}
          members={members.slice(0, 2)}
          overlap={overlap}
        />,
      );

      expect(
        screen.getByRole("group", { name: `${overlap} overlap` }),
      ).toHaveAttribute("data-overlap", overlap);
    },
  );

  it("rejects unsupported public values at the TypeScript boundary", () => {
    const validMember = {
      metadata: "Owner",
      name: "Valid user",
      tone: "info",
    } satisfies AvatarGroupMember;
    const validProps = {
      label: "Valid group",
      max: 2,
      members: [validMember],
      overlap: "sm",
    } satisfies AvatarGroupProps;
    const valid = <AvatarGroup {...validProps} />;
    // @ts-expect-error AvatarGroup overlap values are intentionally constrained.
    const invalidOverlap = <AvatarGroup members={[]} overlap="xl" />;
    const invalidMemberTone: AvatarGroupMember = {
      name: "Invalid user",
      // @ts-expect-error AvatarGroup member tones use Avatar's constrained tokens.
      tone: "brand",
    };
    // @ts-expect-error AvatarGroup is data-driven and does not accept children.
    const invalidChildren = <AvatarGroup members={[]}>Children</AvatarGroup>;

    expect(valid).toBeTruthy();
    expect(invalidOverlap).toBeTruthy();
    expect(invalidMemberTone).toBeTruthy();
    expect(invalidChildren).toBeTruthy();
  });

  it("declares Avatar-backed registry metadata without a direct Motion dependency", () => {
    const registryItem = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "../../registry/items/avatar-group.json"),
        "utf8",
      ),
    ) as {
      dependencies: string[];
      devDependencies: string[];
      files: Array<{ path: string; type: string }>;
      name: string;
      registryDependencies: string[];
    };

    expect(registryItem.name).toBe("avatar-group");
    expect(registryItem.dependencies).toEqual([]);
    expect(registryItem.devDependencies).toEqual([]);
    expect(registryItem.registryDependencies).toEqual([
      "dethink-base",
      "avatar",
    ]);
    expect(registryItem.files).toEqual([
      {
        path: "packages/components/src/components/avatar-group/avatar-group.tsx",
        type: "registry:component",
      },
      {
        path: "packages/components/src/components/avatar-group/index.ts",
        type: "registry:component",
      },
      {
        path: "packages/components/src/utils/cn.ts",
        type: "registry:lib",
      },
    ]);
    expect(JSON.stringify(registryItem)).not.toContain("motion");
    expect(JSON.stringify(registryItem)).toContain("avatar");
  });
});
