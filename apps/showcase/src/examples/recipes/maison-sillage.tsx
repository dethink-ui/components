"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Gift,
  Leaf,
  Pause,
  Play,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import {
  Accordion,
  Avatar,
  Button,
  Card,
  CardScroller,
  CardScrollerItem,
  IconButton,
  Separator,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import {
  fragrances,
  sillageFaq,
  sillageReviews,
  type SillageBagLine,
  type SillageSize,
} from "./maison-sillage-data";
import { SillageReveal } from "./maison-sillage-motion";
import { useSillageReducedMotion } from "./maison-sillage-preferences";
import { SillageProduct } from "./maison-sillage-product";
import { SillageBag } from "./maison-sillage-bag";
import "./maison-sillage.css";

export function MaisonSillageRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const id = useId();
  const target = (name: string) => `${id}-sillage-${name}`;
  const [lines, setLines] = useState<SillageBagLine[]>([]);
  const quantityFor = (productId: string, size: SillageSize) =>
    lines.find((line) => line.productId === productId && line.size === size)
      ?.quantity ?? 0;
  const addToBag = (productId: string, size: SillageSize) =>
    setLines((current) => {
      const exists = current.some(
        (line) => line.productId === productId && line.size === size,
      );
      return exists
        ? current.map((line) =>
            line.productId === productId && line.size === size
              ? { ...line, quantity: Math.min(9, line.quantity + 1) }
              : line,
          )
        : [...current, { productId, size, quantity: 1 }];
    });
  const [filter, setFilter] = useState("All scents");
  const [paused, setPaused] = useState(false);
  const reduced = useSillageReducedMotion();
  const motionEnabled = !reduced && !paused;
  const visible = fragrances.filter(
    (product) => filter === "All scents" || product.family === filter,
  );
  return (
    <MotionConfig
      reducedMotion={motionEnabled ? "user" : "always"}
      transition={motionEnabled ? undefined : { duration: 0 }}
    >
      <div
        data-recipe-surface="maison-sillage"
        data-presentation={presentation}
        data-motion={motionEnabled ? "enabled" : "paused"}
        className="sc-sillage-theme bg-background text-foreground overflow-hidden"
      >
        <div className="bg-[var(--sillage-wine)] px-5 py-2 text-center text-[10px] tracking-[0.12em] text-[var(--sillage-paper)]">
          A little luxury, beautifully delivered. Complimentary delivery from
          £150.
        </div>
        <header className="border-border grid grid-cols-2 items-center gap-5 border-b px-6 py-6 sm:px-10 md:grid-cols-[1fr_auto_1fr]">
          <nav
            aria-label="Perfume house navigation"
            className="order-3 col-span-2 flex justify-center gap-6 text-[11px] md:order-none md:col-span-1 md:justify-start"
          >
            <a href={`#${target("collection")}`}>The collection</a>
            <a href={`#${target("house")}`}>Our maison</a>
            <a href={`#${target("reviews")}`}>Kind words</a>
          </nav>
          <a
            href={`#${target("home")}`}
            aria-label="Maison Sillage home"
            className="text-center font-serif text-xl leading-[0.9] tracking-[0.13em] sm:text-2xl"
          >
            MAISON
            <br />
            <span className="text-[1.35em] tracking-[0.09em]">SILLAGE</span>
          </a>
          <div className="flex items-center justify-end gap-2">
            <IconButton
              aria-label={
                reduced
                  ? "Motion disabled by system preference"
                  : paused
                    ? "Enable page motion"
                    : "Pause page motion"
              }
              disabled={reduced}
              aria-pressed={!motionEnabled}
              size="sm"
              variant="ghost"
              onClick={() => setPaused((value) => !value)}
            >
              {motionEnabled ? <Pause aria-hidden /> : <Play aria-hidden />}
            </IconButton>
            <SillageBag
              lines={lines}
              setLines={setLines}
              motionEnabled={motionEnabled}
            />
          </div>
        </header>
        <section
          id={target("home")}
          aria-labelledby={target("hero-title")}
          className="grid md:min-h-[550px] md:grid-cols-[0.9fr_1.1fr]"
        >
          <SillageReveal
            enabled={motionEnabled}
            className="flex flex-col justify-center px-7 py-12 sm:px-12 md:py-14"
          >
            <p className="text-muted-foreground mb-7 text-[10px] tracking-[0.2em] uppercase">
              Fine fragrance. Lasting feeling.
            </p>
            <h2
              id={target("hero-title")}
              className="font-serif text-[clamp(3.4rem,5.5vw,4.8rem)] leading-[0.98] tracking-[-0.055em]"
            >
              Some things
              <br />
              stay <span className="text-primary italic">with you.</span>
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xs text-sm leading-7">
              A place. A person. A fleeting moment.
              <br />
              Discover fragrances that become part of your story.
            </p>
            <Button
              asChild
              className="mt-8 h-11 w-fit rounded-none px-6 text-xs"
              rightIcon={<ArrowUpRight aria-hidden />}
            >
              <a href={`#${target("collection")}`}>Find your signature</a>
            </Button>
            <div className="text-muted-foreground mt-9 flex items-center gap-3 text-[10px]">
              <span role="img" className="flex gap-0.5" aria-label="Five stars">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star
                    key={star}
                    aria-hidden
                    className="size-3 fill-current"
                  />
                ))}
              </span>
              <span>Small collection. Endless possibilities.</span>
            </div>
          </SillageReveal>
          <figure className="relative min-h-80 md:min-h-full">
            <Image
              src="/recipes/maison-sillage/hero.webp"
              alt="Ambre 01 perfume on travertine with burgundy silk in golden afternoon light"
              fill
              priority
              sizes="(max-width: 767px) 100vw, 660px"
              className="object-cover object-[65%_center]"
            />
            <figcaption className="absolute right-5 bottom-5 left-5 flex items-center justify-between border border-[var(--sillage-paper)]/30 bg-[var(--sillage-wine)]/75 px-4 py-3 text-[var(--sillage-paper)] backdrop-blur-sm">
              <div>
                <p className="text-[9px] tracking-[0.16em] uppercase">
                  The signature scent
                </p>
                <p className="mt-1 font-serif text-xl">Ambre 01</p>
              </div>
              <a
                href={`#${target("collection")}`}
                aria-label="Explore the fragrance collection"
                className="grid size-9 place-items-center rounded-full border border-current"
              >
                <ArrowDown aria-hidden className="size-4" />
              </a>
            </figcaption>
          </figure>
        </section>
        <div className="border-border grid grid-cols-1 gap-4 border-y px-7 py-5 text-[10px] sm:grid-cols-3 sm:px-12">
          {[
            [Gift, "Considered down to the last detail"],
            [Leaf, "Inspired by the natural world"],
            [Sparkles, "Made to become your signature"],
          ].map(([Icon, label]) => {
            const Mark = Icon as typeof Gift;
            return (
              <div
                key={label as string}
                className="flex items-center justify-center gap-3"
              >
                <Mark aria-hidden className="text-primary size-4" />
                <span>{label as string}</span>
              </div>
            );
          })}
        </div>
        <div className="px-6 sm:px-10 lg:px-14">
          <SillageReveal enabled={motionEnabled}>
            <section
              id={target("collection")}
              aria-labelledby={target("collection-title")}
              className="py-14 sm:py-20"
            >
              <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="text-muted-foreground mb-3 text-[10px] tracking-[0.2em] uppercase">
                    The collection / Eau de parfum
                  </p>
                  <h2
                    id={target("collection-title")}
                    className="font-serif text-4xl tracking-tight sm:text-5xl"
                  >
                    Find a feeling.{" "}
                    <span className="italic">Make it yours.</span>
                  </h2>
                </div>
                <p className="text-muted-foreground max-w-56 text-xs leading-6">
                  Three distinct worlds. One intimate ritual.
                  <br />
                  Fragrances for the way you want to feel.
                </p>
              </div>
              <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                <div
                  role="group"
                  aria-label="Scent family"
                  className="flex flex-wrap gap-2"
                >
                  {["All scents", "Amber", "Floral", "Woody"].map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={filter === value ? "solid" : "outline"}
                      aria-pressed={filter === value}
                      className="rounded-full px-4 text-xs"
                      onClick={() => setFilter(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
                <p className="text-muted-foreground text-[10px]" role="status">
                  {visible.length}{" "}
                  {visible.length === 1 ? "fragrance" : "fragrances"}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence initial={false}>
                  {visible.map((product) => (
                    <motion.div
                      key={product.id}
                      layout={motionEnabled ? "position" : false}
                      initial={motionEnabled ? { opacity: 0, y: 12 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: motionEnabled ? 0.25 : 0 }}
                    >
                      <SillageProduct
                        product={product}
                        motionEnabled={motionEnabled}
                        onAdd={addToBag}
                        quantityFor={quantityFor}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </SillageReveal>
          <Separator />
          <SillageReveal enabled={motionEnabled}>
            <section
              id={target("house")}
              aria-labelledby={target("house-title")}
              className="grid items-center gap-10 py-14 sm:py-20 md:grid-cols-2"
            >
              <div className="relative overflow-hidden">
                <Image
                  src="/recipes/maison-sillage/hero.webp"
                  alt="Golden light illuminating the Maison Sillage amber bottle and silk"
                  width={1600}
                  height={1067}
                  sizes="(max-width: 767px) 90vw, 520px"
                  className="aspect-[4/3] w-full object-cover object-right"
                />
                <span
                  aria-hidden
                  className="absolute right-5 bottom-4 font-serif text-5xl text-[var(--sillage-paper)] italic"
                >
                  Sillage.
                </span>
              </div>
              <div className="md:pl-7">
                <p className="text-muted-foreground mb-5 text-[10px] tracking-[0.2em] uppercase">
                  The art of leaving an impression
                </p>
                <h2
                  id={target("house-title")}
                  className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl"
                >
                  Not just worn.
                  <br />
                  <span className="text-primary italic">Remembered.</span>
                </h2>
                <p className="text-muted-foreground mt-6 text-sm leading-7">
                  Sillage is the trace a fragrance leaves behind. We believe the
                  most beautiful things are the ones you feel before you can
                  explain them.
                </p>
                <p className="text-muted-foreground mt-4 text-sm leading-7">
                  Our small, considered collection is an invitation to slow
                  down. To notice. To find a scent that feels unmistakably like
                  you.
                </p>
                <Button
                  asChild
                  variant="link"
                  className="mt-5 px-0"
                  rightIcon={<ArrowRight aria-hidden />}
                >
                  <a href={`#${target("collection")}`}>
                    Explore your next chapter
                  </a>
                </Button>
              </div>
            </section>
          </SillageReveal>
          <section
            id={target("reviews")}
            aria-labelledby={target("reviews-title")}
            className="border-border border-t py-14"
          >
            <div className="mb-8 text-center">
              <p className="text-muted-foreground mb-3 text-[10px] tracking-[0.2em] uppercase">
                Scent is personal. So are these stories.
              </p>
              <h2
                id={target("reviews-title")}
                className="font-serif text-4xl sm:text-5xl"
              >
                A lasting <span className="italic">impression.</span>
              </h2>
            </div>
            <CardScroller
              aria-label="Fragrance reviews"
              maxVisibleCards={2}
              defaultValue="Clara M."
              nextLabel="Next review"
              previousLabel="Previous review"
              overlap
              className="-mx-4"
            >
              {sillageReviews.map((review) => (
                <CardScrollerItem
                  key={review.name}
                  value={review.name}
                  label={`Review by ${review.name}`}
                >
                  <Card
                    shadow="none"
                    className="bg-muted min-h-64 rounded-none p-7"
                  >
                    <div
                      role="img"
                      className="text-primary flex gap-1"
                      aria-label="Five stars"
                    >
                      {[0, 1, 2, 3, 4].map((star) => (
                        <Star
                          key={star}
                          aria-hidden
                          className="size-3 fill-current"
                        />
                      ))}
                    </div>
                    <blockquote className="flex-1 font-serif text-2xl leading-snug">
                      “{review.quote}”
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <Avatar name={review.name} size="sm" motion="none" />
                      <div>
                        <p className="text-xs font-medium">{review.name}</p>
                        <p className="text-muted-foreground mt-1 text-[10px]">
                          {review.scent} · Sample review
                        </p>
                      </div>
                    </div>
                  </Card>
                </CardScrollerItem>
              ))}
            </CardScroller>
          </section>
          <section
            aria-labelledby={target("faq-title")}
            className="border-border grid gap-8 border-t py-14 md:grid-cols-[1fr_1.3fr]"
          >
            <div>
              <p className="text-muted-foreground mb-4 text-[10px] tracking-[0.2em] uppercase">
                A few things to know
              </p>
              <h2
                id={target("faq-title")}
                className="font-serif text-4xl leading-tight"
              >
                The little
                <br />
                <span className="italic">details.</span>
              </h2>
            </div>
            <Accordion
              type="single"
              collapsible
              motionPreset={motionEnabled ? "subtle" : "none"}
            >
              {sillageFaq.map(([question, answer], index) => (
                <Accordion.Item value={`faq-${index}`} key={question}>
                  <Accordion.Blade className="py-5 text-sm">
                    <Accordion.BladeText>{question}</Accordion.BladeText>
                    <Accordion.BladeIcon>
                      <Plus aria-hidden className="size-4" />
                    </Accordion.BladeIcon>
                  </Accordion.Blade>
                  <Accordion.Content className="text-muted-foreground text-sm leading-7">
                    {answer}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion>
          </section>
        </div>
        <footer className="bg-[var(--sillage-wine)] px-7 py-12 text-[var(--sillage-paper)] sm:px-14">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="text-[10px] tracking-[0.18em] uppercase">
                Find what stays with you.
              </p>
              <p className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">
                Maison Sillage
                <span className="text-[var(--sillage-gold)]">.</span>
              </p>
            </div>
            <a
              href={`#${target("collection")}`}
              className="flex items-center gap-3 border-b border-current pb-2 text-xs"
            >
              Explore the collection
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
          <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-[var(--sillage-paper)]/20 pt-6 text-[10px]">
            <span>© 2026 Maison Sillage · A Dethink recipe</span>
            <span>
              Fictional store, products and reviews. No orders are placed.
            </span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
