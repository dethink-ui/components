"use client";

import { Avatar, Badge } from "@dethink/components";
import { avatarImagePaths } from "@/examples/_shared/avatar-members";

const people = [
  {
    image: avatarImagePaths.noah,
    meta: "Design systems",
    name: "Noah Reyes",
    status: "Owner",
    tone: "primary" as const,
  },
  {
    image: avatarImagePaths.mira,
    meta: "Data operations",
    name: "Mira Patel",
    status: "Active",
    tone: "success" as const,
  },
  {
    image: undefined,
    meta: "Identity falls back to initials",
    name: "June Okafor",
    status: "Fallback",
    tone: "info" as const,
  },
];

export function AvatarBasic() {
  return (
    <div className="grid w-full max-w-md gap-4">
      {people.map((person) => (
        <div
          key={person.name}
          className="flex min-w-0 items-center gap-[var(--dt-space-3)]"
        >
          <Avatar
            name={person.name}
            src={person.image}
            tone={person.tone}
            ring="border"
            size="lg"
            decoding="async"
            loading="lazy"
            sizes="48px"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium">{person.name}</p>
              <Badge size="xs" tone={person.tone}>
                {person.status}
              </Badge>
            </div>
            <p className="text-muted-foreground truncate text-xs">
              {person.meta}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
