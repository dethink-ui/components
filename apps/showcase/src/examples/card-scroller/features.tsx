"use client";

import { Boxes, Gauge, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardScroller,
  CardScrollerItem,
  CardTitle,
} from "@dethink/components";

const featureGroups = [
  {
    value: "automation",
    title: "Automation",
    description: "Turn repeatable work into dependable flows.",
    detail: "Rules, approvals, scheduled runs",
    icon: Sparkles,
  },
  {
    value: "performance",
    title: "Performance",
    description: "See bottlenecks before customers feel them.",
    detail: "Live traces, budgets, anomaly alerts",
    icon: Gauge,
  },
  {
    value: "security",
    title: "Security",
    description: "Keep access and policy under one roof.",
    detail: "SSO, audit logs, scoped roles",
    icon: ShieldCheck,
  },
  {
    value: "platform",
    title: "Platform",
    description: "Compose the product around your workflow.",
    detail: "API, webhooks, reusable modules",
    icon: Boxes,
  },
  {
    value: "global",
    title: "Global scale",
    description: "Stay close to every customer and team.",
    detail: "Regions, localization, edge delivery",
    icon: Globe2,
  },
] as const;

export function CardScrollerFeatures() {
  return (
    <CardScroller
      aria-label="Explore product capabilities"
      defaultValue="security"
      maxVisibleCards={4}
      nextLabel="Show later capabilities"
      previousLabel="Show earlier capabilities"
    >
      {featureGroups.map((feature) => {
        const Icon = feature.icon;

        return (
          <CardScrollerItem
            key={feature.value}
            value={feature.value}
            label={`Explore ${feature.title}`}
          >
            <Card as="article" className="min-h-64" shadow="none">
              <CardHeader>
                <span className="border-border bg-muted text-primary mb-3 flex size-10 items-center justify-center rounded-lg border">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-muted-foreground border-border border-t pt-4 text-sm leading-6">
                  {feature.detail}
                </p>
              </CardContent>
            </Card>
          </CardScrollerItem>
        );
      })}
    </CardScroller>
  );
}
