"use client";

import { useState } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardStack,
} from "@dethink/components";

const quotes = [
  {
    author: "Mira",
    role: "Platform lead",
    image: "mira-ops",
    quote: "We rethemed the whole library in an afternoon.",
    detail: "One shared visual language, from the first screen to the last.",
  },
  {
    author: "Eli",
    role: "Frontend engineer",
    image: "eli-engineering",
    quote: "Open code means no more fighting a black box.",
    detail:
      "The freedom to adapt the details that make a product feel like ours.",
  },
  {
    author: "Noah",
    role: "Design systems",
    image: "noah-design",
    quote: "The tokens map one-to-one onto our brand.",
    detail: "A consistent foundation that still leaves room for character.",
  },
];

export function CardStackControlled() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="space-y-5">
      <CardStack
        aria-label="Customer quotes"
        getCardLabel={(index) => quotes[index]?.author ?? ""}
        mode="open"
        angle={6}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      >
        {quotes.map((entry) => (
          <Card key={entry.author} as="article" shadow="md">
            <CardContent className="pt-6">
              <Quote aria-hidden="true" className="text-primary mb-5 size-7" />
              <blockquote className="text-xl leading-snug font-medium tracking-tight sm:text-2xl">
                “{entry.quote}”
              </blockquote>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                {entry.detail}
              </p>
            </CardContent>
            <CardFooter className="border-border flex-row items-center border-t pt-5">
              <Image
                src={`/avatars/showcase/${entry.image}.png`}
                width={40}
                height={40}
                alt=""
                className="size-10 rounded-full object-cover"
              />
              <div className="ml-3 text-sm">
                <p className="font-medium">{entry.author}</p>
                <p className="text-muted-foreground text-xs">{entry.role}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </CardStack>
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        aria-label="Choose a customer quote"
        role="group"
      >
        {quotes.map((entry, index) => (
          <Button
            key={entry.author}
            size="sm"
            variant={index === activeIndex ? "solid" : "outline"}
            aria-label={`Show quote from ${entry.author}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground text-center text-xs">
        Illustrative customer stories · fictional people and quotes
      </p>
    </div>
  );
}
