"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardStack,
  CardTitle,
} from "@dethink/components";

const designs = [
  {
    name: "Command center",
    recipe: "command-center-dashboard",
    description: "A clear view of the signals that matter.",
  },
  {
    name: "Release room",
    recipe: "release-readiness",
    description: "A shared space for your next big launch.",
  },
  {
    name: "AI workspace",
    recipe: "ai-workspace",
    description: "A thoughtful home for research and ideas.",
  },
];

export function CardStackOpen() {
  return (
    <CardStack
      aria-label="Design shortlist"
      getCardLabel={(index) => designs[index]?.name ?? ""}
      mode="open"
      angle={6}
      defaultActiveIndex={1}
      showControls
    >
      {designs.map((design) => (
        <Card
          key={design.name}
          as="article"
          shadow="md"
          className="overflow-hidden"
        >
          <Image
            src={`/recipe-captures/${design.recipe}--teal-light-default@1x.png`}
            alt={`${design.name} preview`}
            width={1200}
            height={675}
            sizes="(max-width: 640px) 70vw, 400px"
            className="border-border aspect-video w-full border-b object-cover object-top"
          />
          <CardHeader>
            <CardTitle>{design.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">{design.description}</p>
            <a
              href={`/recipes/${design.recipe}`}
              className="text-primary focus-visible:ring-ring inline-flex rounded-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
            >
              Open {design.name.toLowerCase()}
            </a>
          </CardContent>
        </Card>
      ))}
    </CardStack>
  );
}
