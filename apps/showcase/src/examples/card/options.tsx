"use client";

import { Card, CardContent } from "@dethink/components";

export function CardOptions() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card surface="default" shadow="md">
        <CardContent className="text-sm">
          <code className="text-primary font-mono text-xs">
            shadow=&quot;md&quot;
          </code>
          <p className="text-muted-foreground mt-1">Elevated surface.</p>
        </CardContent>
      </Card>
      <Card surface="muted" border="muted" shadow="none">
        <CardContent className="text-sm">
          <code className="text-primary font-mono text-xs">
            surface=&quot;muted&quot;
          </code>
          <p className="text-muted-foreground mt-1">Quiet, recessed section.</p>
        </CardContent>
      </Card>
      <Card radius="md" spacing="sm">
        <CardContent className="text-sm">
          <code className="text-primary font-mono text-xs">
            spacing=&quot;sm&quot;
          </code>
          <p className="text-muted-foreground mt-1">Dense dashboards.</p>
        </CardContent>
      </Card>
      <Card surface="transparent" border="none" shadow="none">
        <CardContent className="text-sm">
          <code className="text-primary font-mono text-xs">
            surface=&quot;transparent&quot;
          </code>
          <p className="text-muted-foreground mt-1">
            Structure without chrome.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
