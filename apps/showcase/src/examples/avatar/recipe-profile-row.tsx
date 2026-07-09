"use client";

import { Clock3, ShieldCheck } from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dethink/components";
import { avatarImagePaths } from "@/examples/_shared/avatar-members";

const reviewers = [
  {
    image: avatarImagePaths.noah,
    lastSeen: "2 min ago",
    name: "Noah Reyes",
    role: "Design systems",
    tone: "primary" as const,
  },
  {
    image: avatarImagePaths.mira,
    lastSeen: "15 min ago",
    name: "Mira Patel",
    role: "Release operations",
    tone: "success" as const,
  },
  {
    image: avatarImagePaths.leo,
    lastSeen: "1 hr ago",
    name: "Leo Novak",
    role: "Product lead",
    tone: "warning" as const,
  },
];

export function AvatarProfileRow() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Access review</CardTitle>
        <CardDescription>
          Identity rows pair avatars with status metadata and compact badges.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {reviewers.map((reviewer) => (
          <div
            key={reviewer.name}
            className="flex min-w-0 items-center justify-between gap-[var(--dt-space-4)]"
          >
            <div className="flex min-w-0 items-center gap-[var(--dt-space-3)]">
              <Avatar
                name={reviewer.name}
                src={reviewer.image}
                tone={reviewer.tone}
                ring="border"
                size="lg"
                decoding="async"
                loading="lazy"
                sizes="48px"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{reviewer.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {reviewer.role}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge icon={<ShieldCheck />} size="xs" tone={reviewer.tone}>
                Verified
              </Badge>
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <Clock3 aria-hidden="true" className="size-3" />
                {reviewer.lastSeen}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
