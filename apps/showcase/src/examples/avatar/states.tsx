"use client";

import { Building2, Bot, UserRound } from "lucide-react";
import { Avatar, Badge } from "@dethink/components";
import { avatarImagePaths } from "@/examples/_shared/avatar-members";

export function AvatarStates() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-[var(--dt-space-3)]">
        <Avatar
          name="Mira Patel"
          src={avatarImagePaths.mira}
          ring="ring"
          size="lg"
          decoding="async"
          loading="lazy"
          sizes="48px"
        />
        <div>
          <p className="text-sm font-medium">Image loaded</p>
          <p className="text-muted-foreground text-xs">Accessible image alt</p>
        </div>
      </div>
      <div className="flex items-center gap-[var(--dt-space-3)]">
        <Avatar name="Sam Rivera" tone="warning" ring="border" size="lg" />
        <div>
          <p className="text-sm font-medium">Generated initials</p>
          <p className="text-muted-foreground text-xs">Name-derived fallback</p>
        </div>
      </div>
      <div className="flex items-center gap-[var(--dt-space-3)]">
        <Avatar
          fallbackIcon={<Bot />}
          name="AI reviewer"
          tone="info"
          shape="rounded"
          ring="border"
          size="lg"
        />
        <div>
          <p className="text-sm font-medium">Icon fallback</p>
          <p className="text-muted-foreground text-xs">System identity</p>
        </div>
      </div>
      <div className="flex items-center gap-[var(--dt-space-3)]">
        <Avatar
          fallbackIcon={<Building2 />}
          name="Northstar Audit"
          shape="square"
          tone="success"
          ring="border"
          size="lg"
        />
        <div>
          <p className="text-sm font-medium">Organization</p>
          <p className="text-muted-foreground text-xs">Square brand shape</p>
        </div>
      </div>
      <div className="flex items-center gap-[var(--dt-space-3)] sm:col-span-2">
        <Avatar
          fallbackIcon={<UserRound />}
          name="Missing profile"
          src="/avatars/showcase/missing-profile.png"
          loading="lazy"
          tone="destructive"
          ring="border"
          size="lg"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">Failed image fallback</p>
            <Badge size="xs" tone="destructive" variant="outline">
              onError
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            The image source intentionally fails and returns to fallback
            content.
          </p>
        </div>
      </div>
    </div>
  );
}
