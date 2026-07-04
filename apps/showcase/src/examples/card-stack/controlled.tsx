"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardStack,
  CardTitle,
} from "@dethink/components";

const quotes = [
  { author: "Dana, platform lead", quote: "We rethemed the whole library in an afternoon." },
  { author: "Miguel, frontend dev", quote: "Open code means no more fighting a black box." },
  { author: "Priya, design systems", quote: "The tokens map one-to-one onto our brand." },
];

export function CardStackControlled() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-4">
      <CardStack
        aria-label="Customer quotes"
        mode="open"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      >
        {quotes.map((entry) => (
          <Card key={entry.author}>
            <CardHeader>
              <CardTitle>“{entry.quote}”</CardTitle>
              <CardDescription>{entry.author}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Quote {quotes.indexOf(entry) + 1} of {quotes.length}
            </CardContent>
          </Card>
        ))}
      </CardStack>
      <div className="flex justify-center gap-2">
        {quotes.map((entry, index) => (
          <Button
            key={entry.author}
            size="sm"
            variant={index === activeIndex ? "solid" : "outline"}
            onClick={() => setActiveIndex(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
