"use client";

import { Card, CardContent } from "@dethink/components";

export function CardOptions() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card surface="default" shadow="md">
        <CardContent className="text-sm">
          <code className="font-mono text-xs text-primary">shadow=&quot;md&quot;</code>
          <p className="mt-1 text-muted-foreground">Elevated surface.</p>
        </CardContent>
      </Card>
      <Card surface="muted" border="muted" shadow="none">
        <CardContent className="text-sm">
          <code className="font-mono text-xs text-primary">surface=&quot;muted&quot;</code>
          <p className="mt-1 text-muted-foreground">Quiet, recessed section.</p>
        </CardContent>
      </Card>
      <Card radius="md" spacing="sm">
        <CardContent className="text-sm">
          <code className="font-mono text-xs text-primary">spacing=&quot;sm&quot;</code>
          <p className="mt-1 text-muted-foreground">Dense dashboards.</p>
        </CardContent>
      </Card>
      <Card surface="transparent" border="none" shadow="none">
        <CardContent className="text-sm">
          <code className="font-mono text-xs text-primary">
            surface=&quot;transparent&quot;
          </code>
          <p className="mt-1 text-muted-foreground">Structure without chrome.</p>
        </CardContent>
      </Card>
    </div>
  );
}
