"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardStack,
  CardTitle,
  NavDock,
  type NavDockItemData,
} from "@dethink/components";
import { BarChart3, CreditCard, Map, Users } from "lucide-react";

const iconProps = {
  "aria-hidden": true,
  absoluteStrokeWidth: true,
  strokeWidth: 2.1,
};

const panels = [
  {
    value: "metrics",
    title: "Metrics",
    icon: <BarChart3 {...iconProps} />,
    heading: "Weekly active teams",
    detail: "Up 12% week over week",
    body: "Activation is driven by the new onboarding checklist. Retention holds at 86% for teams that finish it.",
  },
  {
    value: "roadmap",
    title: "Roadmap",
    icon: <Map {...iconProps} />,
    heading: "Q3 delivery plan",
    detail: "3 of 5 epics on track",
    body: "Realtime collaboration ships next sprint. The audit-log epic is waiting on the retention policy decision.",
  },
  {
    value: "team",
    title: "Team",
    icon: <Users {...iconProps} />,
    heading: "Hiring pipeline",
    detail: "2 offers out",
    body: "Platform engineer and product designer offers are pending. Support rotation is fully staffed through August.",
  },
  {
    value: "billing",
    title: "Billing",
    icon: <CreditCard {...iconProps} />,
    heading: "Subscription health",
    detail: "Net revenue retention 108%",
    body: "Annual plan upgrades outpace churn. Two enterprise renewals close this month.",
  },
];

export function NavDockCardStackSwitcher() {
  const [activeIndex, setActiveIndex] = useState(0);
  const items: NavDockItemData[] = panels.map((panel, index) => ({
    icon: panel.icon,
    onAction: () => setActiveIndex(index),
    title: panel.title,
    value: panel.value,
  }));

  return (
    <div className="grid gap-2">
      <CardStack
        aria-label="Workspace panels"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        showControls={false}
      >
        {panels.map((panel) => (
          <Card key={panel.value}>
            <CardHeader>
              <CardTitle>{panel.heading}</CardTitle>
              <CardDescription>{panel.detail}</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-6">
              {panel.body}
            </CardContent>
          </Card>
        ))}
      </CardStack>

      <div className="flex justify-center">
        <NavDock
          aria-label="Workspace panel navigation"
          currentValue={panels[activeIndex].value}
          items={items}
          showTitle="hover"
          variant="glass"
        />
      </div>
    </div>
  );
}
