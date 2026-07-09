"use client";

import { AvatarGroup, Badge } from "@dethink/components";
import { avatarMembers } from "@/examples/_shared/avatar-members";

const rosterMembers = avatarMembers.slice(0, 5);

export function AvatarGroupReveal() {
  return (
    <div className="grid w-full gap-6">
      <div className="border-border grid gap-3 rounded-md border p-5">
        <p className="text-sm font-medium">Spread reveal</p>
        <AvatarGroup
          label="Spread reveal reviewers"
          max={4}
          members={avatarMembers}
          overflowLabel={({ count }) => `${count} more reviewers`}
          reveal="spread"
          ring="ring"
          size="lg"
        />
      </div>
      <div className="border-border grid gap-3 rounded-md border p-5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-[var(--dt-space-4)]">
          <div className="min-w-0">
            <p className="text-sm font-medium">Persistent roster</p>
            <p className="text-muted-foreground text-xs">
              Names stay in the row instead of floating below the avatar stack.
            </p>
          </div>
          <AvatarGroup
            label="Persistent roster reviewers"
            max={4}
            members={rosterMembers}
            overflowLabel={({ count }) => `${count} more reviewer`}
            ring="border"
            size="md"
          />
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {rosterMembers.map((member) => (
            <li
              key={member.id}
              className="border-border/70 flex min-w-0 items-center justify-between gap-[var(--dt-space-3)] rounded-md border px-3 py-2"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {member.name}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {member.metadata}
                </span>
              </span>
              <Badge size="xs" tone={member.tone ?? "neutral"} variant="subtle">
                Reviewer
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
