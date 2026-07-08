import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { AvatarGroup, type AvatarGroupMember } from ".";

expect.extend(toHaveNoViolations);

const reviewers: AvatarGroupMember[] = [
  { metadata: "Design systems", name: "Ada Lovelace", src: "/avatars/ada.png" },
  { metadata: "Runtime", name: "Grace Hopper", tone: "success" },
  { metadata: "Architecture", name: "Maya Lin", tone: "warning" },
  { metadata: "Security", name: "Alan Turing", tone: "info" },
];

describe("AvatarGroup accessibility", () => {
  it("has no axe violations and exposes group, member, and overflow names without hover", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="AvatarGroup accessibility smoke">
          <section aria-labelledby="reviewers-heading">
            <h2 id="reviewers-heading">Reviewers</h2>
            <AvatarGroup
              label="Reviewers"
              max={2}
              members={reviewers}
              overflowLabel={({ count }) => `${count} more reviewers`}
              reveal="spread"
            />
            <p>Ada Lovelace, Grace Hopper, Maya Lin, and Alan Turing</p>
          </section>
          <table>
            <caption>Compact review rows</caption>
            <thead>
              <tr>
                <th scope="col">Pull request</th>
                <th scope="col">Reviewers</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Registry metadata</th>
                <td>
                  <AvatarGroup
                    label="Registry metadata reviewers"
                    max={3}
                    members={reviewers}
                    overlap="sm"
                    size="xs"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </DethinkProvider>,
    );

    const group = screen.getByRole("group", { name: "Reviewers" });
    const list = screen.getByRole("list", { name: "Reviewers members" });

    expect(group).toHaveAccessibleDescription(/Ada Lovelace/);
    expect(group).toHaveAccessibleDescription(/2 more reviewers/);
    expect(group).toHaveAttribute("data-reveal", "spread");
    expect(group).toHaveAttribute("tabindex", "0");
    expect(list).toHaveTextContent("Grace Hopper");
    expect(list).toHaveTextContent("Alan Turing");
    expect(
      group.querySelector('[data-slot="avatar-group-stack"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(
      group.querySelector('[data-slot="avatar-group-reveal-label"]'),
    ).toHaveAttribute("aria-hidden", "true");
    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
