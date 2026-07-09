"use client";

import { AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dethink/components";

const services = [
  {
    icon: CheckCircle2,
    label: "Healthy",
    name: "Billing worker",
    tone: "success" as const,
    variant: "soft" as const,
  },
  {
    icon: Clock3,
    label: "Queued",
    name: "Registry smoke",
    tone: "info" as const,
    variant: "outline" as const,
  },
  {
    icon: AlertTriangle,
    label: "Needs review",
    name: "Import pipeline",
    tone: "warning" as const,
    variant: "outline" as const,
  },
  {
    icon: XCircle,
    label: "Failed",
    name: "Email sender",
    tone: "destructive" as const,
    variant: "solid" as const,
  },
];

export function BadgeStatusList() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Service health</CardTitle>
        <CardDescription>
          Compact badges keep operational state scannable in repeated rows.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {services.map(({ icon: Icon, label, name, tone, variant }) => (
          <div
            key={name}
            className="flex min-w-0 items-center justify-between gap-[var(--dt-space-4)]"
          >
            <span className="truncate text-sm font-medium">{name}</span>
            <Badge icon={<Icon />} size="xs" tone={tone} variant={variant}>
              {label}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
