"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, ShoppingBag } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  RadioGroup,
  RadioGroupItem,
  Separator,
} from "@dethink/components";
import {
  bottleSizes,
  money,
  type SillageFragrance,
  type SillageSize,
} from "./maison-sillage-data";

export function SillageProduct({
  product,
  motionEnabled,
  onAdd,
  quantityFor,
}: {
  product: SillageFragrance;
  motionEnabled: boolean;
  onAdd: (productId: string, size: SillageSize) => void;
  quantityFor: (productId: string, size: SillageSize) => number;
}) {
  const id = useId();
  const [size, setSize] = useState<SillageSize>("50");
  const [message, setMessage] = useState("");
  const atLimit = quantityFor(product.id, size) >= 9;
  return (
    <Card
      as="article"
      aria-label={`${product.name} ${product.number}`}
      surface="transparent"
      border="none"
      shadow="none"
      className="gap-0 rounded-none"
    >
      <Dialog
        onOpenChange={() => {
          setSize("50");
          setMessage("");
        }}
      >
        <DialogTrigger
          variant="ghost"
          className="group block h-auto! w-full rounded-none border-0 p-0 text-left whitespace-normal hover:bg-transparent"
          aria-label={`Discover ${product.name} ${product.number}`}
        >
          <span className="bg-muted relative block overflow-hidden">
            <Image
              src={`/recipes/maison-sillage/${product.image}`}
              alt={`${product.name} ${product.number} eau de parfum with a burgundy spherical cap`}
              width={900}
              height={900}
              sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 360px"
              className="aspect-square w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.035]"
            />
            <span className="absolute top-4 left-4 rounded-full bg-[var(--sillage-paper)]/95 px-3 py-1 text-[9px] tracking-wide text-[var(--sillage-wine)]">
              {product.family}
            </span>
            <span className="absolute right-4 bottom-4 grid size-9 place-items-center rounded-full bg-[var(--sillage-paper)] text-[var(--sillage-wine)]">
              <ArrowUpRight aria-hidden className="size-4" />
            </span>
          </span>
          <span className="mt-5 flex items-baseline justify-between gap-3">
            <span className="font-serif text-3xl font-normal">
              {product.name}{" "}
              <span className="text-muted-foreground text-lg">
                {product.number}
              </span>
            </span>
            <span className="text-xs font-normal">
              From {money(product.prices["30"])}
            </span>
          </span>
          <span className="text-muted-foreground mt-2 block text-xs font-normal">
            {product.line}
          </span>
          <span className="text-muted-foreground mt-3 block text-[9px] font-normal tracking-[0.12em] uppercase">
            Eau de parfum / 30, 50 & 100 ml
          </span>
        </DialogTrigger>
        <DialogContent
          size="lg"
          scrollBehavior="inside"
          showCloseButton
          closeButtonLabel={`Close ${product.name} details`}
          className="sc-sillage-theme"
          data-motion={motionEnabled ? "enabled" : "paused"}
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl font-normal">
              {product.name} {product.number}
            </DialogTitle>
            <DialogDescription>{product.line}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 px-6 pb-6 sm:grid-cols-2">
            <Image
              src={`/recipes/maison-sillage/${product.image}`}
              alt={`${product.name} ${product.number} perfume bottle`}
              width={900}
              height={900}
              sizes="(max-width: 639px) 85vw, 350px"
              className="w-full object-cover"
            />
            <div className="space-y-5">
              <Badge variant="outline" className="rounded-full">
                {product.family} · Eau de parfum
              </Badge>
              <p className="text-muted-foreground text-sm leading-7">
                {product.description}
              </p>
              <p className="text-primary text-[10px] tracking-wide">
                {product.mood}
              </p>
              <Separator />
              <dl className="space-y-3">
                {["Top notes", "Heart notes", "Base notes"].map(
                  (label, index) => (
                    <div key={label}>
                      <dt className="text-muted-foreground text-[9px] tracking-widest uppercase">
                        {label}
                      </dt>
                      <dd className="mt-1 text-xs">{product.notes[index]}</dd>
                    </div>
                  ),
                )}
              </dl>
            </div>
          </div>
          <div className="space-y-4 px-6 pb-6">
            <fieldset>
              <legend className="mb-3 text-xs font-medium">Bottle size</legend>
              <RadioGroup
                aria-label="Bottle size"
                value={size}
                onValueChange={(value) => {
                  setSize(value as SillageSize);
                  setMessage("");
                }}
                className="grid grid-cols-3 gap-2"
              >
                {bottleSizes.map((option) => (
                  <label
                    key={option}
                    htmlFor={`${id}-${option}`}
                    className="border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer flex-col gap-2 border p-3 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <RadioGroupItem
                        id={`${id}-${option}`}
                        value={option}
                        aria-label={`${option} ml`}
                      />
                      {option} ml
                    </span>
                    <span>{money(product.prices[option])}</span>
                  </label>
                ))}
              </RadioGroup>
            </fieldset>
            <div className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-xs">
                {size} ml · Eau de parfum
              </p>
              <p aria-live="polite" className="font-serif text-2xl">
                {money(product.prices[size])}
              </p>
            </div>
            <p role="status" className="text-primary min-h-5 text-xs">
              {message ||
                (atLimit ? "Maximum 9 of this size in your bag." : "")}
            </p>
          </div>
          <DialogFooter className="flex-wrap">
            <DialogClose variant="outline">Continue exploring</DialogClose>
            <Button
              disabled={atLimit}
              rightIcon={
                message ? <Check aria-hidden /> : <ShoppingBag aria-hidden />
              }
              onClick={() => {
                onAdd(product.id, size);
                setMessage(
                  `Added ${product.name} ${product.number}, ${size} ml to your bag.`,
                );
              }}
            >
              Add to bag — {money(product.prices[size])}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
