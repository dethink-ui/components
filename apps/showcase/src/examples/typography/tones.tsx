"use client";

import { Text, Typography } from "@dethink/components";

export function TypographyTones() {
  return (
    <div className="mx-auto grid max-w-md gap-2">
      <Typography variant="title">Deployment summary</Typography>
      <Text tone="success">All 14 checks passed.</Text>
      <Text tone="warning">p99 latency is trending up.</Text>
      <Text tone="destructive">2 regions failed to converge.</Text>
      <Text tone="primary" weight="medium">
        View the full report →
      </Text>
      <Typography variant="caption" tone="muted">
        Updated 4 minutes ago · caption variant
      </Typography>
      <Text truncate className="max-w-56">
        Truncation keeps long single-line values tidy without layout breaks.
      </Text>
    </div>
  );
}
