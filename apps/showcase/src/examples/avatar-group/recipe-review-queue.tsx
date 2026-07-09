"use client";

import { CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import {
  AvatarGroup,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dethink/components";
import { avatarMembers } from "@/examples/_shared/avatar-members";

const queues = [
  {
    icon: CheckCircle2,
    members: avatarMembers.slice(0, 3),
    name: "Registry smoke",
    status: "Ready",
    tone: "success" as const,
  },
  {
    icon: Clock3,
    members: avatarMembers.slice(1, 6),
    name: "Token migration",
    status: "Reviewing",
    tone: "warning" as const,
  },
  {
    icon: ShieldAlert,
    members: avatarMembers,
    name: "Access policy",
    status: "Blocked",
    tone: "destructive" as const,
  },
];

export function AvatarGroupReviewQueue() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Review queue</CardTitle>
        <CardDescription>
          AvatarGroup summarizes owners while Badge communicates workflow state.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {queues.map(({ icon: Icon, members, name, status, tone }) => (
          <div
            key={name}
            className="flex min-w-0 flex-wrap items-center justify-between gap-[var(--dt-space-4)]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {members.length} assigned reviewers
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-[var(--dt-space-3)]">
              <AvatarGroup
                label={`${name} reviewers`}
                max={3}
                members={members}
                overflowLabel={({ count }) => `${count} more reviewers`}
                size="sm"
              />
              <Badge icon={<Icon />} size="xs" tone={tone}>
                {status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
