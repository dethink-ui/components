"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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
  return (
    <Carousel
      aria-label="Horizon collection"
      staging="flat"
      className="mx-auto max-w-5xl"
    >
      <CarouselContent>
        {collection.map((entry, index) => (
          <CarouselItem key={entry.title}>
            <figure className="border-border bg-card relative h-[clamp(20rem,54vw,32rem)] w-full overflow-hidden rounded-2xl border shadow-xl shadow-black/10">
              <Image
                alt={entry.alt}
                className="size-full object-cover"
                decoding="async"
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 92vw, 544px"
                src={entry.image}
              />
              <figcaption className="from-foreground/85 via-foreground/20 text-primary-foreground absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-6 pt-20 pb-6 sm:px-8 sm:pb-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase opacity-75">
                      {entry.category}
                    </p>
                    <p className="font-heading mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {entry.title}
                    </p>
                  </div>
                  <p className="hidden text-right text-xs font-medium opacity-80 sm:block">
                    {entry.location}
                  </p>
                </div>
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex items-center justify-center gap-3">
        <CarouselPrevious />
        <CarouselDots label={(index) => `Show ${collection[index].title}`} />
        <CarouselNext />
      </div>
    </Carousel>
  );
}
