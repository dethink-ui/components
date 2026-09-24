"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { MotionConfig } from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Asterisk,
  Download,
  Globe2,
  Pause,
  Play,
  Plus,
  Quote,
} from "lucide-react";
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  CardScroller,
  CardScrollerItem,
  IconButton,
  Separator,
  Timeline,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import { cvExperience, cvSkills, cvTestimonials } from "./professional-cv-data";
import { CvProjects } from "./professional-cv-projects";
import { CvContact } from "./professional-cv-contact";
import { CvReveal } from "./professional-cv-motion";
import { useCvReducedMotion } from "./professional-cv-preferences";
import "./professional-cv.css";

export function ProfessionalCvRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const id = useId();
  const reducedMotion = useCvReducedMotion();
  const [paused, setPaused] = useState(false);
  const motionEnabled = !reducedMotion && !paused;
  const target = (section: string) => `${id}-cv-${section}`;
  return (
    <MotionConfig
      reducedMotion={motionEnabled ? "user" : "always"}
      transition={motionEnabled ? undefined : { duration: 0 }}
    >
      <div
        data-recipe-surface="professional-cv"
        data-presentation={presentation}
        data-motion={motionEnabled ? "enabled" : "paused"}
        className="sc-cv-theme bg-background text-foreground overflow-hidden"
      >
        <div className="mx-auto max-w-[1120px] px-6 sm:px-10 lg:px-14">
          <header className="border-border flex flex-wrap items-center justify-between gap-5 border-b py-6">
            <a
              href={`#${target("home")}`}
              aria-label="Alex Morgan home"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <Asterisk aria-hidden className="text-primary size-7" />
              alex morgan<span className="text-primary">.</span>
            </a>
            <nav
              aria-label="Portfolio navigation"
              className="flex items-center gap-5 text-xs font-medium"
            >
              <a href={`#${target("work")}`}>Work</a>
              <a href={`#${target("about")}`}>About</a>
              <a href={`#${target("experience")}`}>Experience</a>
              <a href={`#${target("contact")}`}>Contact ↗</a>
            </nav>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground hidden items-center gap-2 text-[10px] lg:flex">
                <Globe2 aria-hidden className="size-3.5" /> London, UK
              </span>
              <IconButton
                aria-label={
                  reducedMotion
                    ? "Motion disabled by system preference"
                    : paused
                      ? "Enable page motion"
                      : "Pause page motion"
                }
                aria-pressed={!motionEnabled}
                disabled={reducedMotion}
                variant="ghost"
                size="sm"
                onClick={() => setPaused((value) => !value)}
              >
                {motionEnabled ? <Pause aria-hidden /> : <Play aria-hidden />}
              </IconButton>
            </div>
          </header>
          <section
            id={target("home")}
            aria-labelledby={target("intro")}
            className="grid items-center gap-10 py-12 md:grid-cols-[1.3fr_1fr] lg:gap-16 lg:py-14"
          >
            <CvReveal enabled={motionEnabled}>
              <Badge
                variant="outline"
                className="mb-5 rounded-full px-3 py-1 text-[10px]"
              >
                <span className="bg-primary mr-1.5 size-1.5 rounded-full" />
                Available for select projects
              </Badge>
              <p className="text-muted-foreground mb-3 text-xs font-medium tracking-[0.15em] uppercase">
                Independent product designer
              </p>
              <h2
                id={target("intro")}
                className="text-[clamp(3.2rem,5.9vw,4.6rem)] leading-[0.98] font-medium tracking-[-0.075em]"
              >
                Thoughtful
                <br />
                design.
                <br />
                <span className="text-primary font-serif text-[0.88em] tracking-[-0.055em] italic sm:whitespace-nowrap">
                  Human impact.
                </span>
              </h2>
              <p className="text-muted-foreground mt-5 max-w-sm text-sm leading-6">
                I’m Alex. I turn complex problems into clear, considered digital
                experiences. A little strategy. A lot of curiosity. Always
                people first.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full px-5"
                  rightIcon={<ArrowUpRight aria-hidden />}
                >
                  <a href={`#${target("work")}`}>Explore selected work</a>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-full"
                  rightIcon={<ArrowDown aria-hidden />}
                >
                  <a href={`#${target("about")}`}>A little about me</a>
                </Button>
              </div>
            </CvReveal>
            <figure className="relative mx-auto w-full max-w-[380px] pb-5 pl-3">
              <div
                aria-hidden
                className="absolute top-4 right-3 bottom-1 left-0 rotate-[-4deg] rounded-[140px_140px_16px_16px] bg-[var(--cv-lilac)]"
              />
              <Image
                src="/recipes/professional-cv/portrait.webp"
                alt="Alex Morgan seated in a sunlit design studio"
                width={900}
                height={1125}
                priority
                sizes="(max-width: 767px) 85vw, 380px"
                className="relative aspect-[4/5] w-full rounded-[140px_140px_16px_16px] object-cover"
              />
              <figcaption className="bg-background border-border absolute right-[-8px] bottom-0 flex items-center gap-3 rounded-xl border p-4 shadow-lg">
                <Asterisk aria-hidden className="text-primary size-8" />
                <span className="text-xs font-medium">
                  Good design starts
                  <br />
                  <span className="text-muted-foreground font-normal">
                    with a good conversation.
                  </span>
                </span>
              </figcaption>
            </figure>
          </section>
          <div className="border-border flex flex-wrap items-center justify-between gap-5 border-t py-6">
            <p className="text-muted-foreground max-w-32 text-[10px] leading-5">
              GOOD PEOPLE.
              <br />
              MEANINGFUL WORK.
            </p>
            <div
              aria-label="Sample collaborators"
              className="text-muted-foreground flex flex-wrap items-center gap-x-8 gap-y-3 text-lg font-semibold tracking-tight"
            >
              <span>chapter®</span>
              <span className="font-serif italic">north.</span>
              <span className="tracking-[0.18em]">STILL</span>
              <span className="font-serif font-normal">Fieldnotes</span>
            </div>
            <ArrowDown
              aria-hidden
              className="text-primary hidden size-5 sm:block"
            />
          </div>
          <Separator />
          <CvReveal enabled={motionEnabled}>
            <section
              id={target("about")}
              aria-labelledby={target("about-title")}
              className="grid gap-8 py-14 md:grid-cols-[1fr_2fr]"
            >
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                01 / A little about me
              </p>
              <div>
                <h2
                  id={target("about-title")}
                  className="max-w-xl text-3xl leading-tight font-medium tracking-tight sm:text-4xl"
                >
                  A curious mind.
                  <br />A practical pair of hands.
                </h2>
                <p className="text-muted-foreground mt-5 text-sm leading-7">
                  For the past nine years, I’ve helped teams find the sweet spot
                  between what people need and what a business can become. I’m
                  happiest connecting the dots — between research and intuition,
                  systems and stories, the big picture and the tiny details.
                </p>
                <dl className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    ["9+", "Years of practice"],
                    ["32", "Products shaped"],
                    ["12", "Lovely teams"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <dt className="text-muted-foreground text-[10px]">
                        {label}
                      </dt>
                      <dd className="mt-1 text-3xl font-medium tracking-tight">
                        {value}
                        <span className="text-primary">.</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          </CvReveal>
          <Separator />
          <CvReveal enabled={motionEnabled}>
            <section
              id={target("work")}
              aria-labelledby={target("work-title")}
              className="py-14"
            >
              <CvProjects
                headingId={target("work-title")}
                motionEnabled={motionEnabled}
              />
            </section>
          </CvReveal>
          <Separator />
          <CvReveal enabled={motionEnabled}>
            <section
              id={target("experience")}
              aria-labelledby={target("experience-title")}
              className="grid gap-10 py-14 md:grid-cols-[1.2fr_1fr]"
            >
              <div>
                <p className="text-muted-foreground mb-4 text-xs tracking-widest uppercase">
                  03 / The journey so far
                </p>
                <h2
                  id={target("experience-title")}
                  className="mb-8 text-4xl font-medium tracking-tight"
                >
                  Experience, earned.
                </h2>
                <Timeline
                  aria-label="Career experience"
                  items={cvExperience}
                  presentation="flow"
                  orientation="vertical"
                  layout="stacked"
                  mode="events"
                  reveal="none"
                  interactive={false}
                />
                <Button
                  asChild
                  variant="outline"
                  className="mt-6 rounded-full"
                  leftIcon={<Download aria-hidden />}
                >
                  <a
                    href="/recipes/professional-cv/alex-morgan-cv.txt"
                    download="alex-morgan-cv.txt"
                  >
                    Download CV · TXT
                  </a>
                </Button>
              </div>
              <Card
                shadow="none"
                className="bg-muted/40 self-start rounded-2xl p-7"
              >
                <p className="text-muted-foreground text-xs tracking-widest uppercase">
                  My toolkit
                </p>
                <h3 className="text-xl font-medium">Thinking meets making.</h3>
                <div className="flex flex-wrap gap-2">
                  {cvSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="rounded-full px-3 py-1.5"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">
                    BA (Hons) Graphic Communication
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Westbridge School of Art · 2014–2017
                  </p>
                </div>
              </Card>
            </section>
          </CvReveal>
          <CvReveal enabled={motionEnabled}>
            <section
              aria-labelledby={target("testimonials-title")}
              className="py-8"
            >
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-muted-foreground mb-3 text-xs tracking-widest uppercase">
                    Kind words / Shared successes
                  </p>
                  <h2
                    id={target("testimonials-title")}
                    className="text-3xl font-medium tracking-tight sm:text-4xl"
                  >
                    Better work.{" "}
                    <span className="text-primary font-serif italic">
                      Together.
                    </span>
                  </h2>
                </div>
                <p className="text-muted-foreground text-xs">
                  A few words from the other side of the table.
                </p>
              </div>
              <CardScroller
                aria-label="Testimonials"
                defaultValue="jamie"
                maxVisibleCards={2}
                overlap
                showControls
                previousLabel="Previous testimonial"
                nextLabel="Next testimonial"
                className="-mx-4"
              >
                {cvTestimonials.map(
                  ({ id: testimonialId, name, role, quote }) => (
                    <CardScrollerItem
                      key={testimonialId}
                      value={testimonialId}
                      label={`Testimonial from ${name}`}
                    >
                      <Card
                        shadow="none"
                        className="min-h-80 rounded-2xl border-transparent bg-[var(--cv-lilac)] p-6 text-[var(--cv-ink)] sm:p-8"
                      >
                        <figure className="flex h-full flex-col">
                          <Quote aria-hidden className="mb-5 size-7 shrink-0" />
                          <blockquote className="flex-1 text-xl leading-snug font-medium tracking-tight sm:text-2xl">
                            “{quote}”
                          </blockquote>
                          <figcaption className="mt-7 flex items-center gap-3">
                            <Avatar name={name} size="sm" motion="none" />
                            <div>
                              <p className="text-xs font-semibold">{name}</p>
                              <p className="mt-1 text-[10px]">{role}</p>
                            </div>
                          </figcaption>
                        </figure>
                      </Card>
                    </CardScrollerItem>
                  ),
                )}
              </CardScroller>
              <p className="text-muted-foreground mt-2 text-[10px]">
                Fictional sample testimonials. Swipe, use the arrows, or focus a
                card and use your arrow keys.
              </p>
            </section>
          </CvReveal>
          <section
            aria-labelledby={target("approach-title")}
            className="grid gap-8 py-14 md:grid-cols-[1fr_1.5fr]"
          >
            <div>
              <p className="text-muted-foreground mb-4 text-xs tracking-widest uppercase">
                04 / A thoughtful process
              </p>
              <h2
                id={target("approach-title")}
                className="text-3xl font-medium tracking-tight"
              >
                Good questions.
                <br />
                Better outcomes.
              </h2>
            </div>
            <Accordion
              type="single"
              collapsible
              defaultValue="discover"
              motionPreset={motionEnabled ? "subtle" : "none"}
            >
              {[
                [
                  "discover",
                  "01",
                  "Start with the right problem",
                  "Every collaboration starts with listening. We map what matters to your customers, your team and your business before jumping into solutions.",
                ],
                [
                  "explore",
                  "02",
                  "Make space to explore",
                  "I turn promising directions into tangible prototypes. We test early, ask better questions, and use what we learn to focus the design.",
                ],
                [
                  "deliver",
                  "03",
                  "Sweat the details, together",
                  "From accessible states to responsive layouts, I work closely with engineering so the experience feels considered all the way through.",
                ],
              ].map(([value, number, title, body]) => (
                <Accordion.Item key={value} value={value!}>
                  <Accordion.Blade className="py-5 text-sm">
                    <Accordion.BladeText>
                      <span className="text-muted-foreground mr-4 text-xs">
                        {number}
                      </span>
                      {title}
                    </Accordion.BladeText>
                    <Accordion.BladeIcon>
                      <Plus aria-hidden className="size-4" />
                    </Accordion.BladeIcon>
                  </Accordion.Blade>
                  <Accordion.Content className="text-muted-foreground pb-5 pl-8 text-sm leading-7">
                    {body}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion>
          </section>
          <CvReveal enabled={motionEnabled}>
            <section
              id={target("contact")}
              aria-labelledby={target("contact-title")}
              className="border-border flex flex-col items-center border-t py-16 text-center sm:py-20"
            >
              <Badge variant="outline" className="mb-6 rounded-full">
                Open to good conversations
              </Badge>
              <h2
                id={target("contact-title")}
                className="text-5xl leading-[1.05] font-medium tracking-[-0.055em] sm:text-7xl"
              >
                Have something
                <br />
                <span className="text-primary font-serif italic">in mind?</span>
              </h2>
              <p className="text-muted-foreground mt-5 mb-8 max-w-sm text-sm leading-7">
                A new product, a fresh perspective, or a challenge worth
                figuring out. I’d love to hear about it.
              </p>
              <CvContact motionEnabled={motionEnabled} />
            </section>
          </CvReveal>
          <footer className="border-border text-muted-foreground flex flex-wrap justify-between gap-3 border-t py-6 text-[10px]">
            <span>© 2026 Alex Morgan · Made with care.</span>
            <span>Fictional portfolio · Dethink recipe</span>
          </footer>
        </div>
      </div>
    </MotionConfig>
  );
}
