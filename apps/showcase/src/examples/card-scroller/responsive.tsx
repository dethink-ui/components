"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardScroller,
  CardScrollerItem,
  CardTitle,
} from "@dethink/components";

const routes = [
  ["overview", "Overview", "A quick read on workspace health."],
  ["activity", "Activity", "Recent events across every project."],
  ["insights", "Insights", "Trends and recommendations for the team."],
  ["reports", "Reports", "Shareable summaries for stakeholders."],
] as const;

function RouteItems() {
  return routes.map(([value, title, description]) => (
    <CardScrollerItem key={value} value={value} label={`Select ${title}`}>
      <Card as="article" className="min-h-48" shadow="none">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Workspace view
          </p>
        </CardContent>
      </Card>
    </CardScrollerItem>
  ));
}

export function CardScrollerResponsive() {
  return (
    <div className="grid items-start gap-8 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <section className="space-y-3" aria-labelledby="narrow-frame-title">
        <div>
          <h4 id="narrow-frame-title" className="font-heading font-semibold">
            Narrow container
          </h4>
          <p className="text-muted-foreground text-sm">
            One card per snap point, independent of viewport width.
          </p>
        </div>
        <div className="border-border bg-muted/30 rounded-xl border p-3">
          <CardScroller
            aria-label="Workspace views in a narrow container"
            defaultValue="activity"
            maxVisibleCards={4}
          >
            {RouteItems()}
          </CardScroller>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="roomy-frame-title">
        <div>
          <h4 id="roomy-frame-title" className="font-heading font-semibold">
            Roomy container, two-card ceiling
          </h4>
          <p className="text-muted-foreground text-sm">
            The component fills its host but honors maxVisibleCards.
          </p>
        </div>
        <div className="border-border bg-muted/30 rounded-xl border p-3">
          <CardScroller
            aria-label="Workspace views in a roomy container"
            defaultValue="activity"
            maxVisibleCards={2}
          >
            {RouteItems()}
          </CardScroller>
        </div>
      </section>
    </div>
  );
}
