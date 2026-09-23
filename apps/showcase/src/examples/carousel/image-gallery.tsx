"use client";

import { useId, useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
  type CarouselStaging,
} from "@dethink/components";

const collection = [
  {
    alt: "Pale stone coastal retreat with an olive tree facing a deep blue sea.",
    category: "Architecture",
    image: "/components/carousel/coastal-retreat.png",
    location: "Alentejo coast",
    title: "Limestone edge",
  },
  {
    alt: "Sculptural glasshouse surrounded by lush plants and misty greenery.",
    category: "Botanical",
    image: "/components/carousel/glasshouse.png",
    location: "Cloud forest",
    title: "Rain room",
  },
  {
    alt: "Misty alpine lake, wooden dock, wild grass, and dark mountain peaks at dawn.",
    category: "Landscape",
    image: "/components/carousel/alpine-lake.png",
    location: "Julian Alps",
    title: "Quiet water",
  },
  {
    alt: "Warm reading room with a cream lounge chair and walnut bookcase in afternoon light.",
    category: "Interiors",
    image: "/components/carousel/reading-room.png",
    location: "Copenhagen",
    title: "A place to pause",
  },
] as const;

export function CarouselImageGallery() {
  const [index, setIndex] = useState(1);
  const [staging, setStaging] = useState<CarouselStaging>("arc");
  const selected = collection[index];
  return (
    <div className="space-y-7">
      <div className="text-center">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Horizon collection
        </p>
        <h3 className="font-heading mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          A new angle on every space.
        </h3>
      </div>
      <CarouselModeControls value={staging} onChange={setStaging} />
      <Carousel
        aria-label="Horizon collection"
        staging={staging}
        index={index}
        onIndexChange={setIndex}
        className="mx-auto max-w-5xl"
      >
        <CarouselContent>
          {collection.map((entry, itemIndex) => (
            <CarouselItem key={entry.title}>
              <figure className="border-border bg-background shadow-foreground/10 relative aspect-[3/4] w-full overflow-hidden rounded-2xl border shadow-xl">
                <Image
                  alt={entry.alt}
                  className="size-full object-cover"
                  decoding="async"
                  fill
                  priority={itemIndex === 1}
                  sizes="(max-width: 640px) 84vw, 384px"
                  src={entry.image}
                />
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-3 text-center" aria-live="polite" aria-atomic="true">
          <h4 className="font-heading text-2xl font-semibold tracking-tight">
            {selected.title}
          </h4>
          <p className="text-muted-foreground mt-2 text-sm">
            {selected.location} · {selected.category}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3">
          <CarouselPrevious size="lg" />
          <CarouselDots
            label={(itemIndex) => `Show ${collection[itemIndex].title}`}
          />
          <CarouselNext size="lg" />
        </div>
        <CarouselPosition />
      </Carousel>
    </div>
  );
}

function CarouselModeControls({
  value,
  onChange,
}: {
  value: CarouselStaging;
  onChange: (value: CarouselStaging) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <label htmlFor={id} className="text-muted-foreground text-sm">
        Presentation
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as CarouselStaging)}
        className="border-border bg-background text-foreground focus-visible:outline-ring min-h-11 rounded-lg border px-3 text-sm focus-visible:outline-2"
      >
        <option value="fan">Fanned deck</option>
        <option value="arc">Curved gallery</option>
        <option value="ribbon">Kinetic ribbon</option>
        <option value="flat">Flat</option>
        <option value="tilt">Tilt</option>
        <option value="floor">Floor</option>
      </select>
    </div>
  );
}

function CarouselPosition() {
  const { index, count } = useCarousel();
  return (
    <p
      className="text-muted-foreground mt-3 text-center text-xs tabular-nums"
      aria-hidden="true"
    >
      {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
    </p>
  );
}
