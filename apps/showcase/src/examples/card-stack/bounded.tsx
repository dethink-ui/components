"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardStack,
  CardTitle,
} from "@dethink/components";

const chapters = [
  "Start with the question",
  "Gather the evidence",
  "Compare alternatives",
  "Make the decision",
  "Share the reasoning",
  "Measure the outcome",
  "Reflect and improve",
];

export function CardStackBounded() {
  return (
    <CardStack
      aria-label="Research chapters"
      mode="open"
      angle={5}
      visibleCount={3}
      showControls
      getCardLabel={(index) => chapters[index] ?? ""}
    >
      {chapters.map((chapter, index) => (
        <Card key={chapter}>
          <CardHeader>
            <p className="text-primary text-xs font-medium">
              CHAPTER {String(index + 1).padStart(2, "0")}
            </p>
            <CardTitle>{chapter}</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="text-muted-foreground grid gap-2 text-sm">
              Your note
              <input
                className="border-input bg-background text-foreground focus-visible:ring-ring min-w-0 rounded-md border px-3 py-2 focus-visible:ring-2"
                placeholder="What matters here?"
              />
            </label>
          </CardContent>
        </Card>
      ))}
    </CardStack>
  );
}
