"use client";

import { AvatarGroup, Badge } from "@dethink/components";
import { avatarMembers } from "@/examples/_shared/avatar-members";

export function AvatarGroupBasic() {
  return (
    <div className="grid w-full max-w-lg gap-5">
      <div className="border-border flex min-w-0 flex-wrap items-center justify-between gap-[var(--dt-space-4)] rounded-md border p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Launch readiness</p>
          <p className="text-muted-foreground truncate text-xs">
            Four reviewers assigned
          </p>
        </div>
        <AvatarGroup
          label="Launch readiness reviewers"
          max={4}
          members={avatarMembers.slice(0, 4)}
          ring="border"
          size="md"
        />
      </div>
      <div className="border-border flex min-w-0 flex-wrap items-center justify-between gap-[var(--dt-space-4)] rounded-md border p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">Security audit</p>
            <Badge size="xs" tone="warning">
              Overflow
            </Badge>
          </div>
          <p className="text-muted-foreground truncate text-xs">
            Six members with three visible avatars
          </p>
        </div>
        <AvatarGroup
          label="Security audit reviewers"
          max={3}
          members={avatarMembers}
          overflowLabel={({ count }) => `${count} more reviewers`}
          ring="ring"
          size="md"
        />
      </div>
    </div>
  );
}
