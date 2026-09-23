"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardStack,
  CardTitle,
} from "@dethink/components";

const releases = [
  {
    version: "02.8",
    title: "A calmer way to ship.",
    category: "Release operations",
    summary:
      "One shared checklist. Clear ownership. Every detail ready for the next release.",
    recipe: "release-readiness",
    action: "Explore the release room",
  },
  {
    version: "02.7",
    title: "Make room for deep work.",
    category: "AI workspace",
    summary:
      "Bring research, conversations, and your next decision into one focused workspace.",
    recipe: "ai-workspace",
    action: "Explore the workspace",
  },
  {
    version: "02.6",
    title: "Your day, thoughtfully arranged.",
    category: "Scheduling",
    summary:
      "Find the right time, see availability, and turn a busy calendar into a clear plan.",
    recipe: "scheduler-and-booking",
    action: "Explore scheduling",
  },
];

export function CardStackBasic() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-2 text-xs">
        <span className="text-muted-foreground font-medium tracking-widest uppercase">
          From the release room
        </span>
        <span className="text-muted-foreground tabular-nums">
          {String(activeIndex + 1).padStart(2, "0")} / 03
        </span>
      </div>
      <CardStack
        className="[--card-stack-max-width:28rem]"
        aria-label="Release stories"
        getCardLabel={(index) => releases[index]?.title ?? ""}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      >
        {releases.map((release) => (
          <Card
            key={release.version}
            as="article"
            shadow="md"
            className="overflow-hidden"
          >
            <div className="bg-muted border-border overflow-hidden border-b">
              <Image
                src={`/recipe-captures/${release.recipe}--teal-light-default@1x.png`}
                alt={`${release.category} recipe preview`}
                width={1200}
                height={675}
                sizes="(max-width: 640px) 75vw, 350px"
                className="aspect-video w-full object-cover object-top"
              />
            </div>
            <CardHeader>
              <div className="text-primary mb-2 flex items-center justify-between gap-3 text-xs font-medium">
                <span>{release.category}</span>
                <span className="bg-primary/10 rounded-full px-2 py-1 tabular-nums">
                  {release.version}
                </span>
              </div>
              <CardTitle className="text-xl leading-tight tracking-tight">
                {release.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              {release.summary}
            </CardContent>
            <CardFooter>
              <a
                href={`/recipes/${release.recipe}`}
                className="text-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
              >
                {release.action}
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </a>
            </CardFooter>
          </Card>
        ))}
      </CardStack>
      <p className="text-muted-foreground text-center text-xs">
        Sample release stories · live recipe previews
      </p>
    </div>
  );
}
