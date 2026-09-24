"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Image from "next/image";
import { ArrowRight, Check, ShoppingBag, Trash2, Truck } from "lucide-react";
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Field,
  FieldControl,
  FieldLabel,
  IconButton,
  NumberInput,
  Progress,
} from "@dethink/components";
import {
  bagKey,
  bagSubtotal,
  getFragrance,
  money,
  sampleDelivery,
  type SillageBagLine,
} from "./maison-sillage-data";

export function SillageBag({
  lines,
  setLines,
  motionEnabled,
}: {
  lines: SillageBagLine[];
  setLines: Dispatch<SetStateAction<SillageBagLine[]>>;
  motionEnabled: boolean;
}) {
  const [step, setStep] = useState<"bag" | "review" | "complete">("bag");
  const [announcement, setAnnouncement] = useState("");
  const [receipt, setReceipt] = useState({ count: 0, total: 0 });
  const heading = useRef<HTMLHeadingElement>(null);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = bagSubtotal(lines);
  const delivery = sampleDelivery(subtotal);
  const total = subtotal + delivery;
  useEffect(() => {
    if (step !== "bag") heading.current?.focus();
  }, [step]);
  return (
    <Drawer
      direction="right"
      size="md"
      motionPreset={motionEnabled ? "standard" : "none"}
      reducedMotion={!motionEnabled}
      onOpenChange={() => {
        setStep("bag");
        setAnnouncement("");
      }}
    >
      <DrawerTrigger
        variant="ghost"
        size="sm"
        className="gap-2 text-xs"
        aria-label={`Open shopping bag, ${count} items`}
      >
        <ShoppingBag aria-hidden className="size-4" />
        <span>Bag ({count})</span>
      </DrawerTrigger>
      <DrawerContent
        className="sc-sillage-theme"
        data-motion={motionEnabled ? "enabled" : "paused"}
        showCloseButton
        closeButtonLabel="Close shopping bag"
        scrollBehavior="inside"
      >
        <DrawerHeader>
          <DrawerTitle className="font-serif text-3xl font-normal">
            Your bag
          </DrawerTitle>
          <DrawerDescription>
            {step === "complete"
              ? "A little moment of luxury, imagined."
              : "A few things worth keeping close."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-6 px-6 pb-6">
          <h3
            ref={heading}
            tabIndex={-1}
            className="text-sm font-medium outline-none"
          >
            {step === "complete"
              ? "Your demo checkout is complete."
              : step === "review"
                ? "Review your sample order"
                : count
                  ? `${count} ${count === 1 ? "item" : "items"} in your bag`
                  : "Your next signature is waiting."}
          </h3>
          <p role="status" className="sr-only">
            {announcement}
          </p>
          {step === "complete" ? (
            <div className="space-y-5 py-6">
              <span className="bg-primary/10 text-primary grid size-14 place-items-center rounded-full">
                <Check aria-hidden className="size-7" />
              </span>
              <p className="font-serif text-3xl">A beautiful choice.</p>
              <p className="text-muted-foreground text-sm leading-7">
                You explored {receipt.count}{" "}
                {receipt.count === 1 ? "item" : "items"}, totalling{" "}
                {money(receipt.total)} in this sample checkout.
              </p>
              <p
                role="status"
                className="border-border border p-4 text-sm leading-6"
              >
                No order was placed and no payment was taken. Your demo bag has
                been cleared.
              </p>
              <DrawerClose variant="outline" className="w-full">
                Continue exploring
              </DrawerClose>
            </div>
          ) : lines.length === 0 ? (
            <div className="flex flex-col items-center gap-5 py-12 text-center">
              <ShoppingBag aria-hidden className="text-primary size-12" />
              <p className="text-muted-foreground max-w-64 text-sm leading-7">
                Begin with a feeling. Explore the collection and add a fragrance
                that speaks to you.
              </p>
              <DrawerClose className="rounded-none">
                Explore the collection
              </DrawerClose>
            </div>
          ) : (
            <>
              {step === "bag" && (
                <div className="border-border bg-muted/40 space-y-3 border p-4">
                  <p className="flex items-center gap-2 text-xs">
                    <Truck aria-hidden className="size-4" />
                    {subtotal >= 15000
                      ? "Complimentary sample delivery unlocked."
                      : `${money(15000 - subtotal)} away from complimentary delivery.`}
                  </p>
                  <Progress
                    aria-label="Complimentary delivery progress"
                    value={Math.min(subtotal, 15000)}
                    max={15000}
                    size="sm"
                  />
                </div>
              )}
              <ul
                aria-label={
                  step === "review"
                    ? "Order review items"
                    : "Shopping bag items"
                }
                className="space-y-5"
              >
                {lines.map((line) => {
                  const product = getFragrance(line.productId);
                  const key = bagKey(line);
                  const label = `${product.name} ${product.number}, ${line.size} ml`;
                  return (
                    <li
                      key={key}
                      className="border-border grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-b pb-5"
                    >
                      <Image
                        src={`/recipes/maison-sillage/${product.image}`}
                        alt=""
                        width={72}
                        height={90}
                        className="aspect-[4/5] w-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-serif text-xl">
                              {product.name} {product.number}
                            </h4>
                            <p className="text-muted-foreground mt-1 text-[10px]">
                              {line.size} ml · Eau de parfum
                            </p>
                          </div>
                          <p className="shrink-0 text-xs">
                            {money(product.prices[line.size] * line.quantity)}
                          </p>
                        </div>
                        {step === "bag" ? (
                          <div className="mt-3 flex items-end justify-between gap-3">
                            <Field>
                              <FieldLabel className="text-[10px]">
                                Quantity
                                <span className="sr-only"> for {label}</span>
                              </FieldLabel>
                              <FieldControl>
                                <NumberInput
                                  aria-label={`Quantity for ${label}`}
                                  type="number"
                                  numberMode="numeric"
                                  min={1}
                                  max={9}
                                  step={1}
                                  value={line.quantity}
                                  className="w-20"
                                  controlSize="sm"
                                  onChange={(event) => {
                                    const quantity = Math.max(
                                      1,
                                      Math.min(
                                        9,
                                        Math.trunc(
                                          Number(event.target.value),
                                        ) || 1,
                                      ),
                                    );
                                    setLines((current) =>
                                      current.map((item) =>
                                        bagKey(item) === key
                                          ? { ...item, quantity }
                                          : item,
                                      ),
                                    );
                                    setAnnouncement(
                                      `${label}, quantity ${quantity}.`,
                                    );
                                  }}
                                />
                              </FieldControl>
                            </Field>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              aria-label={`Remove ${label}`}
                              onClick={() => {
                                setLines((current) =>
                                  current.filter(
                                    (item) => bagKey(item) !== key,
                                  ),
                                );
                                setAnnouncement(`${label} removed.`);
                                heading.current?.focus();
                              }}
                            >
                              <Trash2 aria-hidden className="size-4" />
                            </IconButton>
                          </div>
                        ) : (
                          <p className="text-muted-foreground mt-3 text-xs">
                            Quantity: {line.quantity} ×{" "}
                            {money(product.prices[line.size])}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <dl data-sillage-totals className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Sample delivery</dt>
                  <dd>{delivery ? money(delivery) : "Complimentary"}</dd>
                </div>
                <div className="border-border flex justify-between border-t pt-3 font-medium">
                  <dt>Total</dt>
                  <dd aria-live="polite">{money(total)}</dd>
                </div>
              </dl>
              <p className="text-muted-foreground text-xs leading-6">
                Fictional shopping demo. No payment, personal details or real
                order are collected. Quantities are limited to 9 per fragrance
                and size.
              </p>
            </>
          )}
        </div>
        {lines.length > 0 && step !== "complete" && (
          <DrawerFooter className="flex-col items-stretch">
            {step === "review" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("bag");
                    heading.current?.focus();
                  }}
                >
                  Back to bag
                </Button>
                <Button
                  rightIcon={<Check aria-hidden />}
                  onClick={() => {
                    setReceipt({ count, total });
                    setLines([]);
                    setStep("complete");
                  }}
                >
                  Complete demo checkout
                </Button>
              </>
            ) : (
              <Button
                rightIcon={<ArrowRight aria-hidden />}
                onClick={() => setStep("review")}
              >
                Review sample order
              </Button>
            )}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
