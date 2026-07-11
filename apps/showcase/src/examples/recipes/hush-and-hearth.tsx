"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  Feather,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  MoonStar,
  Shell,
  Sparkles,
  Sprout,
  SunMedium,
  Users,
  Wine,
} from "lucide-react";
import {
  Accordion,
  AvatarGroup,
  type AvatarGroupMember,
  Badge,
  Button,
  Card,
  CardContent,
  DateRangePicker,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldControl,
  FieldLabel,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  Input,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuFeaturedItem,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuTrigger,
  Select,
  SelectItem,
  Separator,
  Tabs,
  ToastProvider,
  ToastViewport,
  useToast,
} from "@dethink/components";
import alentejoHarvest from "../../../public/recipes/hush-and-hearth/alentejo-harvest.png";
import alentejoHero from "../../../public/recipes/hush-and-hearth/alentejo-hero.png";
import vicentineSeaAir from "../../../public/recipes/hush-and-hearth/vicentine-sea-air.png";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

const curators: AvatarGroupMember[] = [
  {
    id: "ines",
    name: "Inês Martins",
    initials: "IM",
    tone: "warning",
    metadata: "Portugal",
  },
  {
    id: "maya",
    name: "Maya Finch",
    initials: "MF",
    tone: "primary",
    metadata: "Mediterranean",
  },
  {
    id: "leo",
    name: "Léo Bernard",
    initials: "LB",
    tone: "info",
    metadata: "Food & wine",
  },
  {
    id: "sara",
    name: "Sara Costa",
    initials: "SC",
    tone: "success",
    metadata: "Coast",
  },
];

const editorialMenu = [
  {
    icon: Wine,
    title: "Harvest",
    body: "Vineyard kitchens, makers, and generous September tables.",
  },
  {
    icon: Shell,
    title: "Sea air",
    body: "Quiet Atlantic edges with space to walk, swim, and linger.",
  },
  {
    icon: MoonStar,
    title: "Stillness",
    body: "Restorative houses where the landscape sets the pace.",
  },
] as const;

const faqs = [
  {
    value: "different",
    q: "How is a curated stay different from a package holiday?",
    a: "Every stay begins with how you want the days to feel. Your curator then shapes a considered route, remarkable places, and a handful of local rituals around you—without filling every hour.",
  },
  {
    value: "included",
    q: "What is included in the guide price?",
    a: "The guide price includes the stay, your private planning session, itinerary design, reservations, and curator support. Flights and discretionary spending remain separate, and every proposal is transparent before you confirm.",
  },
  {
    value: "families",
    q: "Can you plan for families or small groups?",
    a: "Yes. We select houses and pacing around the whole group, including accessibility, food preferences, quieter time, and age-appropriate experiences.",
  },
  {
    value: "timing",
    q: "When should we begin planning?",
    a: "Eight to twelve weeks gives us the best choice of small stays and local hosts. We can also shape thoughtful last-minute escapes when dates are flexible.",
  },
];

function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="border-primary text-primary grid size-8 place-items-center rounded-full border">
        <Feather className="size-4" aria-hidden="true" />
      </span>
      <span className="font-serif text-lg font-semibold tracking-tight">
        Hush &amp; Hearth
      </span>
    </span>
  );
}

function CuratorDialog({
  trigger,
  className,
  variant = "solid",
  size = "lg",
}: {
  trigger: ReactNode;
  className?: string;
  variant?: "solid" | "outline" | "soft" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("");
  const [mood, setMood] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger size={size} variant={variant} className={className}>
        {trigger}
      </DialogTrigger>
      <DialogContent size="md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Plan with a curator</DialogTitle>
          <DialogDescription>
            Share the shape of the escape. We will return with a thoughtful
            first direction within two working days.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
            toast({
              title: "Your curator is listening",
              description: `A first note will arrive${
                email ? ` at ${email}` : ""
              } within two working days.`,
              tone: "success",
            });
            setEmail("");
            setGuests("");
            setMood("");
          }}
        >
          <div className="space-y-4 px-[var(--dt-space-6)] py-[var(--dt-space-2)]">
            <DateRangePicker
              label="Travel dates"
              description="Choose a start and end date; approximate dates are perfectly fine."
              clearable
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Guests"
                placeholder="Choose party size"
                value={guests || undefined}
                onValueChange={setGuests}
                required
              >
                <SelectItem value="2">2 guests</SelectItem>
                <SelectItem value="3-4">3–4 guests</SelectItem>
                <SelectItem value="5-6">5–6 guests</SelectItem>
                <SelectItem value="7+">7+ guests</SelectItem>
              </Select>
              <Select
                label="The feeling"
                placeholder="Choose a mood"
                value={mood || undefined}
                onValueChange={setMood}
                required
              >
                <SelectItem value="harvest">Harvest & table</SelectItem>
                <SelectItem value="sea">Sea air & movement</SelectItem>
                <SelectItem value="stillness">Stillness & rest</SelectItem>
                <SelectItem value="surprise">Surprise us</SelectItem>
              </Select>
            </div>
            <Field id="hush-curator-email">
              <FieldLabel>Email</FieldLabel>
              <FieldControl asChild>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </FieldControl>
            </Field>
          </div>
          <DialogFooter>
            <DialogClose variant="outline">Not yet</DialogClose>
            <Button type="submit" rightIcon={<ArrowRight />}>
              Send my note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MobileNavigation() {
  const links = [
    ["Seasonal stays", "hush-season"],
    ["How it works", "hush-process"],
    ["Our curators", "hush-curators"],
    ["Questions", "hush-faq"],
  ] as const;

  return (
    <Dialog>
      <DialogTrigger
        aria-label="Open primary navigation"
        size="icon"
        variant="ghost"
        className="lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent size="sm" showCloseButton>
        <DialogHeader>
          <DialogTitle>Hush &amp; Hearth</DialogTitle>
          <DialogDescription>
            Find the season, process, and people behind each stay.
          </DialogDescription>
        </DialogHeader>
        <nav aria-label="Mobile primary" className="grid gap-2 px-6 pb-6">
          {links.map(([label, id]) => (
            <DialogClose
              key={id}
              variant="ghost"
              className="justify-between"
              onPress={() => {
                window.location.hash = id;
              }}
            >
              {label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </DialogClose>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

function SeasonPlanner() {
  return (
    <Card
      shadow="md"
      className="border-primary/25 bg-background relative z-10 -mt-20 overflow-hidden sm:-mt-24"
    >
      <CardContent className="p-0">
        <Tabs defaultValue="harvest" size="sm" motionPreset="subtle">
          <div className="border-border border-b px-5 pt-5 sm:px-6">
            <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-[0.16em] uppercase">
              This season
            </p>
            <Tabs.List aria-label="Seasonal travel moods">
              <Tabs.Trigger value="harvest" icon={<Wine />}>
                Harvest
              </Tabs.Trigger>
              <Tabs.Trigger value="sea" icon={<Shell />}>
                Sea air
              </Tabs.Trigger>
              <Tabs.Trigger value="stillness" icon={<MoonStar />}>
                Stillness
              </Tabs.Trigger>
            </Tabs.List>
          </div>

          <Tabs.Panel value="harvest">
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="warning" variant="subtle">
                    September favourite
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    4 nights · from £1,180
                  </span>
                </div>
                <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                  Alentejo, Portugal
                </h2>
                <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
                  A limewashed quinta, slow vineyard lunches, and a route
                  designed around the gentlest light of the year.
                </p>
              </div>
              <CuratorDialog
                size="md"
                trigger={
                  <span className="inline-flex items-center gap-2">
                    Plan with a curator
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                }
              />
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="sea">
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <Badge tone="info" variant="subtle">
                  Atlantic quiet
                </Badge>
                <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                  Vicentine Coast, Portugal
                </h2>
                <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
                  Cliff paths, wild beaches, and a small house where windows
                  stay open to the salt air.
                </p>
              </div>
              <CuratorDialog size="md" trigger="Shape this stay" />
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="stillness">
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <Badge tone="success" variant="subtle">
                  Restorative
                </Badge>
                <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                  Serra de São Mamede
                </h2>
                <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
                  A hill house, shaded swims, and days with just enough shape to
                  help the noise fall away.
                </p>
              </div>
              <CuratorDialog size="md" trigger="Shape this stay" />
            </div>
          </Tabs.Panel>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ProcessCard({
  number,
  icon: Icon,
  title,
  body,
}: {
  number: string;
  icon: typeof MessageCircle;
  title: string;
  body: string;
}) {
  return (
    <Card className="h-full p-6">
      <div className="flex items-center justify-between">
        <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-full">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <span className="text-muted-foreground font-mono text-xs">
          {number}
        </span>
      </div>
      <h3 className="mt-6 font-serif text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-3 text-sm leading-6">{body}</p>
    </Card>
  );
}

export function HushAndHearthRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";

  return (
    <HeroTextAnimationProvider>
      <ToastProvider motion="subtle">
        <div
          data-recipe-surface="hush-and-hearth"
          className={`sc-hush-theme bg-background text-foreground relative overflow-hidden border ${
            fullPage
              ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0"
              : "rounded-xl"
          }`}
        >
          <header className="border-border bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
            <div className="mx-auto flex min-h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6 lg:px-10">
              <a
                href="#hush-hero"
                className="focus-visible:ring-ring focus-visible:ring-offset-background rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <BrandMark />
              </a>

              <NavigationMenu
                aria-label="Primary"
                className="ml-auto hidden lg:flex"
                size="sm"
                variant="quiet"
              >
                <NavigationMenuList>
                  <NavigationMenuItem value="stays">
                    <NavigationMenuTrigger>Ways to go</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuFeaturedItem href="#hush-season">
                        September, thoughtfully edited
                        <NavigationMenuDescription>
                          Three ways to follow the season without overfilling
                          the days.
                        </NavigationMenuDescription>
                      </NavigationMenuFeaturedItem>
                      <NavigationMenuSection>
                        <NavigationMenuLabel>
                          Seasonal moods
                        </NavigationMenuLabel>
                        {editorialMenu.map(({ icon: Icon, title, body }) => (
                          <NavigationMenuLink
                            key={title}
                            href="#hush-season"
                            icon={<Icon aria-hidden="true" />}
                          >
                            {title}
                            <NavigationMenuDescription>
                              {body}
                            </NavigationMenuDescription>
                          </NavigationMenuLink>
                        ))}
                      </NavigationMenuSection>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#hush-process">
                      How it works
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#hush-curators">
                      Our curators
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#hush-faq">
                      Journal
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuIndicator />
                </NavigationMenuList>
              </NavigationMenu>

              <div className="ml-auto flex items-center gap-2 lg:ml-4">
                <CuratorDialog
                  trigger="Begin a stay"
                  size="sm"
                  className="hidden sm:inline-flex"
                />
                <MobileNavigation />
              </div>
            </div>
          </header>

          <div>
            <section id="hush-hero" className="border-border border-b">
              <div className="mx-auto grid max-w-[1200px] lg:grid-cols-[minmax(0,0.95fr)_minmax(28rem,1.05fr)]">
                <div className="flex flex-col justify-center px-4 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
                  <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                    The art of going away
                  </p>
                  {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
                  <HeroTextAnimation
                    as="h1"
                    animation="masked-curtain"
                    text="Leave room for wonder."
                    className="mt-6 max-w-xl font-serif text-5xl leading-[0.96] font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-[4.6rem]"
                  />
                  <p className="text-muted-foreground mt-6 max-w-lg text-base leading-7 text-pretty sm:text-lg">
                    Remarkable places, local rituals, and unhurried days—shaped
                    into a stay that feels entirely yours.
                  </p>
                  <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                    <CuratorDialog
                      trigger={
                        <span className="inline-flex items-center gap-2">
                          Plan with a curator
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </span>
                      }
                    />
                    <Button asChild size="lg" variant="ghost">
                      <a href="#hush-season">
                        Explore September
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                  <div className="text-muted-foreground mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                    <span className="inline-flex items-center gap-2">
                      <Compass
                        className="text-primary size-4"
                        aria-hidden="true"
                      />
                      Personal itinerary
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Heart
                        className="text-primary size-4"
                        aria-hidden="true"
                      />
                      Human curation
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Sparkles
                        className="text-primary size-4"
                        aria-hidden="true"
                      />
                      Quietly remarkable
                    </span>
                  </div>
                </div>

                <div className="relative min-h-[30rem] overflow-hidden lg:min-h-[43rem]">
                  <Image
                    src={alentejoHero}
                    alt="Whitewashed hillside retreat surrounded by olive trees in Alentejo"
                    fill
                    fetchPriority="high"
                    placeholder="blur"
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    className="object-cover"
                  />
                  <div className="from-foreground/75 text-background absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-6 pt-24 sm:p-8">
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                      Alentejo · Portugal
                    </p>
                    <p className="mt-2 max-w-sm font-serif text-xl leading-snug">
                      A house built for long shadows and open windows.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="px-4 sm:px-6 lg:px-10">
              <div className="mx-auto max-w-[1060px]">
                <SeasonPlanner />
              </div>
            </section>

            <section
              id="hush-season"
              aria-labelledby="hush-season-heading"
              className="px-4 py-20 sm:px-6 lg:px-10 lg:py-28"
            >
              <div className="mx-auto max-w-[1200px]">
                <div className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-end">
                  <div>
                    <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                      This season
                    </p>
                    <h2
                      id="hush-season-heading"
                      className="mt-4 font-serif text-4xl leading-none font-semibold tracking-tight text-balance sm:text-5xl"
                    >
                      September, thoughtfully edited.
                    </h2>
                  </div>
                  <p className="text-muted-foreground max-w-2xl text-base leading-7 lg:justify-self-end">
                    Follow the harvest inland or the salt air west. Each stay
                    leaves generous gaps for the unexpected—the conversation,
                    the swim, the second coffee.
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
                  <Card className="group overflow-hidden p-0">
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <Image
                        src={alentejoHarvest}
                        alt="Whitewashed Alentejo quinta beside a vineyard in September"
                        fill
                        placeholder="blur"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="grid gap-5 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <div>
                        <Badge tone="warning" variant="subtle" icon={<Wine />}>
                          Harvest
                        </Badge>
                        <h3 className="mt-4 font-serif text-2xl font-semibold">
                          The long-table Alentejo
                        </h3>
                        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
                          Four nights between vineyard paths, ceramic studios,
                          and lunches that turn gently into evening.
                        </p>
                      </div>
                      <Button asChild variant="outline">
                        <a href="#hush-process">See the shape</a>
                      </Button>
                    </div>
                  </Card>

                  <Card className="group overflow-hidden p-0">
                    <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-[17rem]">
                      <Image
                        src={vicentineSeaAir}
                        alt="Chalk-white guesthouse overlooking Portugal's Vicentine Coast"
                        fill
                        placeholder="blur"
                        sizes="(max-width: 1024px) 100vw, 34vw"
                        className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="p-6">
                      <Badge tone="info" variant="subtle" icon={<Shell />}>
                        Sea air
                      </Badge>
                      <h3 className="mt-4 font-serif text-2xl font-semibold">
                        The open Atlantic
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-6">
                        Cliff walks, empty coves, and a small house tuned to the
                        sound of the coast.
                      </p>
                      <Button asChild variant="link" className="mt-3 px-0">
                        <a href="#hush-process">
                          Follow the coast
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="hush-included-heading"
              className="border-border bg-muted/30 border-y px-4 py-16 sm:px-6 lg:px-10"
            >
              <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
                <div>
                  <Badge tone="success" variant="subtle" icon={<Sprout />}>
                    Less itinerary. More experience.
                  </Badge>
                  <h2
                    id="hush-included-heading"
                    className="mt-5 font-serif text-4xl leading-tight font-semibold tracking-tight text-balance"
                  >
                    The useful details disappear. The memorable ones remain.
                  </h2>
                  <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7">
                    We take care of the invisible work while keeping enough
                    openness for a place to surprise you.
                  </p>
                </div>
                <Card className="p-6 sm:p-8">
                  <ul className="grid gap-5 sm:grid-cols-2">
                    {[
                      ["A remarkable place to stay", MapPin],
                      ["A personal route and rhythm", Compass],
                      ["Reservations worth making", Wine],
                      ["A curator on hand", MessageCircle],
                      ["Time deliberately left open", CalendarDays],
                      ["Clear, considered pricing", Check],
                    ].map(([label, Icon]) => (
                      <li
                        key={label as string}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="bg-primary/10 text-primary grid size-8 shrink-0 place-items-center rounded-full">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span>{label as string}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </section>

            <section
              id="hush-process"
              aria-labelledby="hush-process-heading"
              className="px-4 py-20 sm:px-6 lg:px-10 lg:py-28"
            >
              <div className="mx-auto max-w-[1200px]">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                  <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                    Made around you
                  </p>
                  <h2
                    id="hush-process-heading"
                    className="mt-4 font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
                  >
                    A little conversation. A beautifully shaped escape.
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <ProcessCard
                    number="01"
                    icon={MessageCircle}
                    title="Tell us the feeling"
                    body="Share the pace, people, and moments you are craving—not a spreadsheet of destinations."
                  />
                  <ProcessCard
                    number="02"
                    icon={Compass}
                    title="Receive a first shape"
                    body="Your curator returns with a point of view: one place, one rhythm, and the details that make it sing."
                  />
                  <ProcessCard
                    number="03"
                    icon={CalendarDays}
                    title="Leave room to wander"
                    body="We make the meaningful reservations and leave deliberate space for weather, appetite, and wonder."
                  />
                </div>
              </div>
            </section>

            <section
              id="hush-curators"
              aria-labelledby="hush-curators-heading"
              className="border-border border-y px-4 py-16 sm:px-6 lg:px-10"
            >
              <div className="mx-auto max-w-[1000px]">
                <Card className="border-primary/25 overflow-hidden p-0">
                  <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)]">
                    <div className="p-7 sm:p-10">
                      <Badge tone="primary" variant="subtle">
                        A note from a traveller
                      </Badge>
                      <blockquote>
                        <p
                          id="hush-curators-heading"
                          className="mt-5 font-serif text-2xl leading-snug font-semibold text-balance sm:text-3xl"
                        >
                          “It felt less like following an itinerary and more
                          like being quietly introduced to a place by someone
                          who truly knew it.”
                        </p>
                      </blockquote>
                      <p className="text-muted-foreground mt-5 text-sm">
                        Clara &amp; James · Alentejo, May 2026
                      </p>
                    </div>
                    <div className="bg-primary text-primary-foreground flex flex-col justify-center p-7 sm:p-10">
                      <AvatarGroup
                        label="Hush & Hearth curators"
                        members={curators}
                        max={4}
                        size="md"
                        ring="border"
                      />
                      <p className="mt-6 font-serif text-xl font-semibold">
                        Local knowledge, held lightly.
                      </p>
                      <p className="mt-2 text-sm leading-6 opacity-80">
                        Our curators know the good room, the quieter road, and
                        when a day is already full enough.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <section
              id="hush-faq"
              aria-labelledby="hush-faq-heading"
              className="px-4 py-20 sm:px-6 lg:px-10"
            >
              <div className="mx-auto grid max-w-[1000px] gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div>
                  <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                    Before you go
                  </p>
                  <h2
                    id="hush-faq-heading"
                    className="mt-4 font-serif text-4xl font-semibold tracking-tight"
                  >
                    A few useful things.
                  </h2>
                </div>
                <Accordion
                  aria-label="Hush & Hearth frequently asked questions"
                  defaultValue="different"
                >
                  {faqs.map((faq) => (
                    <Accordion.Item key={faq.value} value={faq.value}>
                      <Accordion.Blade>
                        <Accordion.BladeIcon>
                          <ChevronRight aria-hidden="true" />
                        </Accordion.BladeIcon>
                        <Accordion.BladeText>{faq.q}</Accordion.BladeText>
                      </Accordion.Blade>
                      <Accordion.Content>
                        <p className="text-muted-foreground leading-6">
                          {faq.a}
                        </p>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
            </section>

            <section
              aria-label="Begin a curated stay"
              className="bg-primary text-primary-foreground px-4 py-20 text-center sm:px-6 lg:py-24"
            >
              <div className="mx-auto max-w-2xl">
                <SunMedium className="mx-auto size-8" aria-hidden="true" />
                <h2 className="mt-5 font-serif text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
                  Go somewhere that gives something back.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 opacity-80">
                  Tell us how you want to feel when you return. We will begin
                  with the place that understands it.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <CuratorDialog
                    trigger={
                      <span className="inline-flex items-center gap-2">
                        Begin a stay
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </span>
                    }
                    className="border-primary-foreground bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  />
                  <span className="inline-flex items-center gap-2 text-sm opacity-80">
                    <Users className="size-4" aria-hidden="true" />A human reply
                    within two working days
                  </span>
                </div>
              </div>
            </section>
          </div>

          <footer className="px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1200px]">
              <div className="flex flex-wrap items-start justify-between gap-8">
                <div>
                  <BrandMark />
                  <p className="text-muted-foreground mt-3 max-w-xs text-sm leading-6">
                    Remarkable places and unhurried days, shaped entirely around
                    you.
                  </p>
                </div>
                <nav
                  aria-label="Footer"
                  className="text-muted-foreground grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-4"
                >
                  {[
                    ["This season", "hush-season"],
                    ["How it works", "hush-process"],
                    ["Curators", "hush-curators"],
                    ["Questions", "hush-faq"],
                  ].map(([label, id]) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="hover:text-foreground focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
              <Separator className="mt-8" />
              <div className="text-muted-foreground mt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <p>© 2026 Hush &amp; Hearth.</p>
                <p>Made for slower ways of seeing.</p>
              </div>
            </div>
          </footer>

          <ToastViewport />
        </div>
      </ToastProvider>
    </HeroTextAnimationProvider>
  );
}
