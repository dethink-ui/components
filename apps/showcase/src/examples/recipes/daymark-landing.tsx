"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardCheck,
  Flower2,
  KeyRound,
  MapPin,
  PartyPopper,
  Plus,
  ReceiptText,
  Store,
  Sun,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardScroller,
  CardScrollerItem,
  CardDescription,
  CardHeader,
  CardStack,
  CardTitle,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  LightStreaksBackground,
  Progress,
  RevealButton,
  Separator,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

const roomStatus = [
  {
    icon: Store,
    label: "Front of house",
    note: "The welcome is ready.",
    progress: 92,
    tone: "success" as const,
  },
  {
    icon: ReceiptText,
    label: "Kitchen & supply",
    note: "Every place has a plan.",
    progress: 78,
    tone: "warning" as const,
  },
  {
    icon: Users,
    label: "Team & service",
    note: "Roles land with clarity.",
    progress: 86,
    tone: "primary" as const,
  },
] as const;

const guestNotes = [
  {
    value: "preview-dinner",
    source: "Preview dinner",
    date: "16 May · 21:14",
    note: "The whole room felt like it was waiting for us in the best way.",
    signature: "Mira & friends",
    accentClassName: "bg-primary/15 text-primary",
    paperClassName: "sc-daymark-note-card--terracotta",
  },
  {
    value: "neighbourhood-list",
    source: "Neighbourhood list",
    date: "17 May · 09:02",
    note: "It already feels like a place we want to come back to.",
    signature: "The Saturday List",
    accentClassName: "bg-success/15 text-success",
    paperClassName: "sc-daymark-note-card--olive",
  },
  {
    value: "friends-family",
    source: "Friends & family",
    date: "18 May · 18:46",
    note: "Every little detail made the welcome feel effortless.",
    signature: "Sami, opening guest",
    accentClassName: "bg-warning/20 text-warning",
    paperClassName: "sc-daymark-note-card--saffron",
  },
  {
    value: "service-team",
    source: "Service team",
    date: "20 May · 15:20",
    note: "We knew exactly what the room needed from us, without overthinking it.",
    signature: "Ari, floor lead",
    accentClassName: "bg-info/15 text-info",
    paperClassName: "sc-daymark-note-card--cobalt",
  },
  {
    value: "first-regular",
    source: "First regular",
    date: "24 May · 22:08",
    note: "It feels like it has always belonged here.",
    signature: "Nina, local guest",
    accentClassName: "bg-primary/15 text-primary",
    paperClassName: "sc-daymark-note-card--terracotta",
  },
] as const;

const openingWalkthrough = [
  {
    time: "06:30",
    title: "First light",
    body: "Warm the room before the team arrives.",
    icon: Sun,
    accentClassName: "bg-warning/20 text-warning",
  },
  {
    time: "14:30",
    title: "The handoff",
    body: "Move every small certainty into service.",
    icon: ClipboardCheck,
    accentClassName: "bg-primary/15 text-primary",
  },
  {
    time: "17:45",
    title: "Doors open",
    body: "Let the welcome carry the rest.",
    icon: KeyRound,
    accentClassName: "bg-success/15 text-success",
  },
] as const;

function DaymarkMark() {
  return (
    <a
      href="#daymark-home"
      className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full shadow-sm"
      >
        <Sun className="size-4" strokeWidth={2.3} />
      </span>
      <span className="font-heading text-lg font-semibold tracking-[-0.04em]">
        Daymark
      </span>
    </a>
  );
}

function OpeningRoom() {
  return (
    <Card
      aria-label="Daymark opening room preview"
      className="border-border/80 bg-background/88 overflow-hidden shadow-[0_1.5rem_4rem_color-mix(in_oklab,var(--dt-color-primary)_13%,transparent)]"
      shadow="none"
    >
      <div className="border-border/80 bg-background/70 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="bg-success size-2 rounded-full" />
          <span className="text-muted-foreground text-xs font-medium">
            Opening room live
          </span>
        </div>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          Saturday · 24 May
        </span>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-primary text-[0.65rem] font-semibold tracking-[0.15em] uppercase">
              Seven days to open
            </p>
            <h3 className="font-heading mt-2 text-2xl font-semibold tracking-tight">
              Your opening, in one place.
            </h3>
          </div>
          <RevealButton
            icon={<Plus />}
            label="Add a moment"
            labelVisibility="always"
            size="sm"
            variant="soft"
          />
        </div>

        <div className="sc-daymark-room-art border-border/70 mt-6 rounded-2xl border p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground text-sm font-semibold">
              Opening day readiness
            </span>
            <Badge tone="success" variant="soft">
              On track
            </Badge>
          </div>
          <Progress
            className="mt-4"
            label="Launch room ready"
            showValue
            size="sm"
            tone="primary"
            value={86}
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {roomStatus.map((room) => {
              const Icon = room.icon;

              return (
                <div
                  key={room.label}
                  className="border-border/70 bg-background/70 rounded-xl border p-3"
                >
                  <span
                    aria-hidden="true"
                    className="bg-muted text-primary grid size-9 place-items-center rounded-lg"
                  >
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-4 text-sm font-semibold">{room.label}</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {room.note}
                  </p>
                  <Progress
                    aria-label={room.label + " readiness"}
                    className="mt-4"
                    size="sm"
                    tone={room.tone}
                    value={room.progress}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function DaymarkLandingRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";

  return (
    <HeroTextAnimationProvider>
      <div
        data-recipe-surface="daymark-landing"
        className={
          "sc-daymark-theme overflow-hidden border " +
          (fullPage
            ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0"
            : "rounded-xl")
        }
      >
        <section id="daymark-home" aria-labelledby="daymark-hero-heading">
          <LightStreaksBackground
            animate
            density="normal"
            intensity="subtle"
            seed={24}
            speed="slow"
            tone="primary"
            className="sc-daymark-hero"
          >
            <header className="relative z-20 mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
              <DaymarkMark />
              <nav
                aria-label="Daymark page navigation"
                className="hidden items-center gap-1 md:flex"
              >
                {[
                  ["Guest notes", "#daymark-notes"],
                  ["The room", "#daymark-room"],
                  ["Opening day", "#daymark-walkthrough"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    className="text-muted-foreground hover:bg-background/60 hover:text-foreground focus-visible:ring-ring rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2"
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <RevealButton
                icon={<Plus />}
                label="Build your opening room"
                labelVisibility="always"
                onClick={() => {
                  document.getElementById("daymark-room")?.scrollIntoView();
                }}
                size="sm"
                variant="solid"
              />
            </header>

            <div className="relative z-10 mx-auto max-w-7xl px-5 pt-14 pb-8 sm:px-8 sm:pt-20 lg:px-10">
              <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="max-w-4xl">
                  <p className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                    <span
                      aria-hidden="true"
                      className="bg-primary size-2 rounded-full"
                    />
                    The launch room for remarkable places
                  </p>
                  <HeroTextAnimation
                    animation="masked-curtain"
                    ariaLabel="Make every opening a beginning."
                    id="daymark-hero-heading"
                    text="Make every opening a beginning."
                    className="font-heading mt-5 max-w-4xl text-5xl leading-[1.04] font-semibold tracking-[-0.06em] text-balance sm:text-6xl lg:text-[clamp(4rem,5.8vw,4.75rem)]"
                  />
                  <p className="text-muted-foreground mt-7 max-w-xl text-base leading-7 sm:text-lg">
                    Daymark brings people, spaces, and the small decisive
                    details into one opening room—so the first day feels like
                    the start of something lasting.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      rightIcon={<ArrowRight />}
                      size="lg"
                      onClick={() => {
                        document
                          .getElementById("daymark-room")
                          ?.scrollIntoView();
                      }}
                    >
                      Build your opening room
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        document
                          .getElementById("daymark-notes")
                          ?.scrollIntoView();
                      }}
                    >
                      Read the guest notes
                    </Button>
                  </div>
                </div>

                <aside className="border-border/80 bg-background/70 rounded-2xl border p-4 shadow-[0_1.5rem_4rem_color-mix(in_oklab,var(--dt-color-primary)_10%,transparent)]">
                  <p className="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
                    For the people opening
                  </p>
                  <ul className="mt-4 space-y-3">
                    {[
                      [
                        "Restaurants",
                        "From soft launch to first full service.",
                      ],
                      ["Hospitality", "One generous welcome, made repeatable."],
                      ["Retail", "A room that knows how to receive people."],
                    ].map(([title, body]) => (
                      <li key={title} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="bg-primary/10 text-primary grid size-6 shrink-0 place-items-center rounded-full"
                        >
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">
                            {title}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                            {body}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </div>
          </LightStreaksBackground>
        </section>

        <section
          id="daymark-notes"
          aria-labelledby="daymark-notes-heading"
          className="border-border/70 bg-muted/40 border-t"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                  Guest notes
                </p>
                <h2
                  id="daymark-notes-heading"
                  className="font-heading mt-4 max-w-xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl"
                >
                  The first messages tell you when the room is already alive.
                </h2>
              </div>
              <div className="border-border/70 bg-background/75 max-w-2xl rounded-2xl border p-5 shadow-sm">
                <p className="text-muted-foreground text-base leading-7">
                  More than a review surface: a moving record of what people
                  noticed, remembered, and wanted to return for.
                </p>
                <p className="text-primary mt-4 flex items-center gap-2 text-sm font-semibold">
                  <ArrowRight aria-hidden="true" className="size-4" />
                  Scroll through the notes to hear the opening back.
                </p>
              </div>
            </div>

            <div className="sc-daymark-notes-stage border-border/70 mt-10 rounded-3xl border p-2 sm:p-5">
              <CardScroller
                aria-label="Guest notes from Daymark openings"
                defaultValue="preview-dinner"
                maxVisibleCards={3}
                nextLabel="Show later guest notes"
                previousLabel="Show earlier guest notes"
                showControls
              >
                {guestNotes.map((item, index) => {
                  const Icon =
                    index % 3 === 0
                      ? Flower2
                      : index % 3 === 1
                        ? MapPin
                        : PartyPopper;

                  return (
                    <CardScrollerItem
                      key={item.value}
                      label={item.source}
                      value={item.value}
                    >
                      <Card
                        as="article"
                        className={
                          "sc-daymark-note-card border-border min-h-[21rem] overflow-hidden shadow-none " +
                          item.paperClassName
                        }
                        shadow="none"
                      >
                        <CardHeader className="pb-0">
                          <div className="flex items-start justify-between gap-4">
                            <span
                              aria-hidden="true"
                              className={
                                "grid size-11 place-items-center rounded-2xl " +
                                item.accentClassName
                              }
                            >
                              <Icon className="size-5" />
                            </span>
                            <span className="text-muted-foreground text-xs font-medium">
                              {item.date}
                            </span>
                          </div>
                          <CardTitle className="mt-7 text-sm tracking-[0.12em] uppercase">
                            {item.source}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-auto pt-4">
                          <p className="font-heading text-2xl leading-tight font-semibold tracking-tight">
                            “{item.note}”
                          </p>
                          <div className="border-border/70 mt-7 flex items-center justify-between border-t pt-4">
                            <span className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                              {item.signature}
                            </span>
                            <span className="bg-success/15 text-success grid size-6 place-items-center rounded-full">
                              <Check aria-hidden="true" className="size-3.5" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </CardScrollerItem>
                  );
                })}
              </CardScroller>
            </div>
          </div>
        </section>

        <section
          id="daymark-room"
          aria-labelledby="daymark-room-heading"
          className="border-border/70 bg-background border-t"
        >
          <h2 id="daymark-room-heading" className="sr-only">
            Daymark opening room
          </h2>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <OpeningRoom />
          </div>
        </section>

        <section
          id="daymark-walkthrough"
          aria-labelledby="daymark-walkthrough-heading"
          className="border-border/70 bg-background border-t"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.82fr)] lg:items-center lg:px-10 lg:py-28">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                Opening day walkthrough
              </p>
              <h2
                id="daymark-walkthrough-heading"
                className="font-heading mt-4 max-w-xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl"
              >
                The right detail, at the right moment, with the right person.
              </h2>
              <p className="text-muted-foreground mt-6 max-w-xl text-base leading-7">
                Daymark holds the opening sequence in a format the whole team
                can walk through together—before the room fills up.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button rightIcon={<ArrowRight />} size="lg">
                  Start your Daymark
                </Button>
                <Button size="lg" variant="ghost">
                  Read the opening guide
                </Button>
              </div>
              <Separator className="my-10 max-w-xl" />
              <div className="grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["7 days", "to align the opening"],
                  ["1 room", "for every detail"],
                  ["0 drift", "on the big day"],
                ].map(([value, label]) => (
                  <div key={value} className="min-w-0">
                    <p className="font-heading text-xl font-semibold tracking-tight">
                      {value}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <span
                aria-hidden="true"
                className="bg-warning/30 absolute inset-x-12 top-12 h-72 rounded-full blur-3xl"
              />
              <CardStack
                aria-label="Opening day walkthrough"
                angle={7}
                defaultActiveIndex={1}
                loop
                stackOffset={14}
              >
                {openingWalkthrough.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Card
                      key={item.time}
                      className="sc-daymark-walkthrough-card border-border bg-background min-h-72 overflow-hidden shadow-[0_1.5rem_3.5rem_color-mix(in_oklab,var(--dt-color-primary)_16%,transparent)]"
                      shadow="none"
                    >
                      <CardHeader>
                        <span
                          aria-hidden="true"
                          className={
                            "grid size-11 place-items-center rounded-2xl " +
                            item.accentClassName
                          }
                        >
                          <Icon className="size-5" />
                        </span>
                        <CardTitle className="mt-6 text-sm tracking-[0.12em] uppercase">
                          {item.time}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="mt-auto">
                        <h3 className="font-heading text-2xl leading-tight font-semibold tracking-tight">
                          {item.title}
                        </h3>
                        <CardDescription className="mt-3 text-sm leading-6">
                          {item.body}
                        </CardDescription>
                        <p className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                          <ClipboardCheck
                            aria-hidden="true"
                            className="size-4"
                          />
                          Briefed and ready
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardStack>
            </div>
          </div>
        </section>

        <footer className="border-border/70 border-t">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <DaymarkMark />
            <p className="text-muted-foreground max-w-md text-sm leading-6 sm:text-right">
              Make space for the opening you want everyone to remember.
            </p>
          </div>
        </footer>
      </div>
    </HeroTextAnimationProvider>
  );
}
