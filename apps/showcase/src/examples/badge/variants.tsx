"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Info,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Badge, type BadgeTone, type BadgeVariant } from "@dethink/components";

const variants: BadgeVariant[] = ["solid", "soft", "outline", "subtle"];
const tones: Array<{
  icon: typeof CircleDot;
  label: string;
  tone: BadgeTone;
}> = [
  { icon: CircleDot, label: "Neutral", tone: "neutral" },
  { icon: Sparkles, label: "Featured", tone: "primary" },
  { icon: CheckCircle2, label: "Healthy", tone: "success" },
  { icon: AlertTriangle, label: "Review", tone: "warning" },
  { icon: XCircle, label: "Failed", tone: "destructive" },
  { icon: Info, label: "AI assisted", tone: "info" },
];

export function BadgeVariants() {
  return (
    <div className="grid w-full gap-5">
      {variants.map((variant) => (
        <div key={variant} className="grid gap-2">
          <p className="text-muted-foreground text-sm font-medium capitalize">
            {variant}
          </p>
          <div className="flex flex-wrap items-center gap-[var(--dt-space-2)]">
            {tones.map(({ icon: Icon, label, tone }) => (
              <Badge key={tone} icon={<Icon />} tone={tone} variant={variant}>
                {label}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
