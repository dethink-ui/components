"use client";

import { AvatarGroup, type AvatarGroupOverlap } from "@dethink/components";
import { avatarMembers } from "@/examples/_shared/avatar-members";

const overlaps: AvatarGroupOverlap[] = ["none", "sm", "md", "lg"];

export function AvatarGroupOverlapExample() {
  return (
    <div className="grid w-full gap-5 sm:grid-cols-2">
      {overlaps.map((overlap) => (
        <div
          key={overlap}
          className="border-border grid justify-items-start gap-3 rounded-md border p-4"
        >
          <AvatarGroup
            label={`${overlap} overlap reviewers`}
            max={4}
            members={avatarMembers}
            overlap={overlap}
            overflowLabel={({ count }) => `${count} more`}
            size="lg"
          />
          <span className="text-muted-foreground text-xs">
            overlap: {overlap}
          </span>
        </div>
      ))}
    </div>
  );
}
