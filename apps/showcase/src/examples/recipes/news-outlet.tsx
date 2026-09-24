"use client";

import { useId } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Globe2,
  Play,
  Radio,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Heading,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  Separator,
  Tabs,
  Text,
  cn,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import {
  getNewsStory,
  newsStories,
  newsVideos,
  type NewsStory,
} from "./news-outlet-data";
import {
  NewsReaderProvider,
  ReaderTools,
  SaveStoryButton,
  StoryLink,
  VideoPreview,
} from "./news-outlet-reader";
import { NewsNewsletter } from "./news-outlet-newsletter";
import "./news-outlet.css";

export function NewsImage({
  story,
  className = "",
  eager = false,
}: {
  story: NewsStory;
  className?: string;
  eager?: boolean;
}) {
  return (
    <Image
      src={`/recipes/news-outlet/${story.image}.webp`}
      alt={story.alt}
      width={1672}
      height={941}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className={cn(
        "bg-muted block aspect-video w-full object-cover",
        className,
      )}
    />
  );
}

function Category({ children }: { children: string }) {
  return (
    <Text
      as="span"
      size="xs"
      className="text-primary block text-[10px] font-bold tracking-[0.1em] uppercase"
    >
      {children}
    </Text>
  );
}

function StoryMeta({ story }: { story: NewsStory }) {
  return (
    <div className="text-muted-foreground mt-auto flex items-center justify-between gap-2 pt-2 text-[11px]">
      <span className="inline-flex items-center gap-1.5">
        <Clock3 aria-hidden="true" className="size-3" />
        {story.minutes} min read
      </span>
      <SaveStoryButton story={story} />
    </div>
  );
}

function StoryCard({
  story,
  compact = false,
  id,
}: {
  story: NewsStory;
  compact?: boolean;
  id?: string;
}) {
  return (
    <Card
      as="article"
      id={id}
      surface="transparent"
      border="none"
      shadow="none"
      className={`scroll-mt-32 rounded-none ${compact ? "grid grid-cols-[0.85fr_1.15fr] gap-3" : "gap-2"}`}
    >
      <NewsImage story={story} className={compact ? "h-full min-h-28" : ""} />
      <div className="flex min-w-0 flex-col">
        <Category>{story.category}</Category>
        <Heading
          level={3}
          className="mt-1 font-sans text-[18px] leading-[1.15] font-bold tracking-[-0.035em]"
        >
          <StoryLink story={story}>{story.title}</StoryLink>
        </Heading>
        <Text size="sm" tone="muted" className="mt-2 text-[12px] leading-[1.5]">
          {story.summary}
        </Text>
        <StoryMeta story={story} />
      </div>
    </Card>
  );
}

function SectionHeading({
  title,
  eyebrow,
  href,
  link = "Explore more",
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        {eyebrow && <Category>{eyebrow}</Category>}
        <Heading
          level={2}
          className="font-sans text-2xl leading-none font-extrabold tracking-[-0.045em]"
        >
          {title}
        </Heading>
      </div>
      {href && (
        <a
          href={href}
          className="inline-flex items-center gap-2 text-[11px] font-semibold hover:underline"
        >
          {link}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </a>
      )}
    </div>
  );
}

function NewsFeed() {
  const latest = ["public-space", "materials", "rail", "markets", "football"];
  const popular = ["coastal-cities", "wild", "art", "ocean", "markets"];
  return (
    <aside
      aria-label="News briefing"
      className="border-border min-w-0 lg:border-s lg:ps-5"
    >
      <Tabs defaultValue="latest" variant="line" motionPreset="none" size="sm">
        <Tabs.List aria-label="News order" className="w-full justify-between">
          <Tabs.Trigger value="latest" className="flex-1">
            Latest
          </Tabs.Trigger>
          <Tabs.Trigger value="popular" className="flex-1">
            Most read
          </Tabs.Trigger>
        </Tabs.List>
        {[
          { value: "latest", items: latest },
          { value: "popular", items: popular },
        ].map(({ value, items }) => (
          <Tabs.Panel value={value} key={value} className="pt-0">
            <ol className="divide-border divide-y">
              {items.map((storyId, index) => {
                const story = getNewsStory(storyId);
                return (
                  <li
                    key={story.id}
                    className="grid grid-cols-[2rem_1fr] gap-2 py-3.5"
                  >
                    <span
                      className={`text-muted-foreground pt-0.5 tabular-nums ${value === "popular" ? "text-2xl font-light" : "text-[10px]"}`}
                    >
                      {value === "popular"
                        ? `0${index + 1}`
                        : ["12:24", "11:03", "09:41", "08:17", "06:55"][index]}
                    </span>
                    <div>
                      <h3 className="text-[12px] leading-[1.4] font-bold">
                        <StoryLink story={story}>{story.title}</StoryLink>
                      </h3>
                      <div className="mt-1 flex items-center justify-between">
                        <Category>{story.category}</Category>
                        <SaveStoryButton story={story} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Tabs.Panel>
        ))}
      </Tabs>
      <p className="text-muted-foreground border-border border-t pt-3 text-[10px]">
        The daily briefing · Sample edition
      </p>
    </aside>
  );
}

export function NewsOutletRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const id = useId();
  const target = (section: string) => `${id}-${section}`;
  const href = (section: string) => `#${target(section)}`;
  const lead = getNewsStory("coastal-cities");
  const feature = getNewsStory("wild");
  const topics = [
    "World",
    "Politics",
    "Business",
    "Science",
    "Culture",
    "Sport",
  ];
  return (
    <NewsReaderProvider>
      <div
        data-recipe-surface="news-outlet"
        data-presentation={presentation}
        className="sc-news-theme bg-background text-foreground min-w-0"
      >
        <a
          href={href("lead")}
          className="sr-only focus:not-sr-only focus:block focus:p-4"
        >
          Skip to the lead story
        </a>
        <header
          id={target("top")}
          className="sc-news-inverse bg-background text-foreground"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-7">
            <a
              href={href("top")}
              aria-label="The Current home"
              className="text-[25px] leading-none font-black tracking-[-0.065em]"
            >
              THE CURRENT<span className="text-primary">.</span>
            </a>
            <span className="text-muted-foreground hidden text-[8px] font-medium tracking-[0.16em] uppercase xl:block">
              A more informed tomorrow
            </span>
            <NavigationMenu
              aria-label="News sections"
              motion="none"
              variant="quiet"
              size="sm"
              className="hidden lg:block"
            >
              <NavigationMenuList className="gap-0">
                {topics.map((topic) => (
                  <NavigationMenuItem key={topic}>
                    <NavigationMenuLink
                      href={href(topic.toLowerCase())}
                      className="px-2 text-[11px] font-normal"
                    >
                      {topic}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <div className="ms-auto flex items-center gap-1 sm:gap-2">
              <ReaderTools />
              <Button
                asChild
                size="sm"
                className="rounded-none border-0 bg-[var(--news-red)] px-3 text-[11px] text-[var(--news-on-night)] hover:bg-[var(--news-red)]/90"
              >
                <a href={href("newsletter")}>Subscribe</a>
              </Button>
            </div>
          </div>
          <NavigationMenu
            aria-label="Mobile news sections"
            motion="none"
            variant="quiet"
            size="sm"
            className="border-border block w-full border-t px-3 py-1 lg:hidden"
          >
            <NavigationMenuList className="flex-wrap justify-center gap-0">
              {topics.map((topic) => (
                <NavigationMenuItem key={topic}>
                  <NavigationMenuLink
                    href={href(topic.toLowerCase())}
                    className="px-2 text-xs"
                  >
                    {topic}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </header>

        <div className="border-border bg-muted/60 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 text-[10px] sm:px-7">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-primary font-bold">In focus</span>
            {[
              { text: "Modern cities", story: lead },
              { text: "The future of travel", story: getNewsStory("rail") },
              { text: "Our changing planet", story: feature },
            ].map(({ text, story }) => (
              <StoryLink key={text} story={story}>
                {text}
              </StoryLink>
            ))}
          </div>
          <span className="text-muted-foreground inline-flex items-center gap-1.5">
            <Globe2 aria-hidden="true" className="size-3" />
            International · Demo edition
          </span>
        </div>

        <div className="px-4 pt-5 pb-7 sm:px-7">
          <div className="border-border mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-y py-2 text-[11px]">
            <Badge
              variant="solid"
              tone="primary"
              size="sm"
              className="rounded-none px-2.5 py-2 text-[10px] font-bold uppercase"
              icon={<Radio aria-hidden="true" className="size-3" />}
            >
              Developing
            </Badge>
            <div className="min-w-0 flex-1 font-semibold">
              <StoryLink story={getNewsStory("public-space")}>
                Coastal communities imagine a new future for the waterfront
              </StoryLink>
            </div>
            <ArrowRight aria-hidden="true" className="size-4" />
          </div>

          <section
            id={target("lead")}
            aria-label="Lead story and latest news"
            className="grid scroll-mt-32 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(200px,1fr)]"
          >
            <div className="min-w-0">
              <article className="grid gap-4 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)]">
                <div className="flex flex-col items-start">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="bg-primary size-1.5 rounded-full" />
                    <Category>World / The changing city</Category>
                  </div>
                  <Heading
                    level={1}
                    className="font-sans text-[clamp(2rem,3.5vw,2.7rem)] leading-[1.04] font-extrabold tracking-[-0.055em]"
                  >
                    <StoryLink story={lead}>{lead.title}</StoryLink>
                  </Heading>
                  <Text
                    tone="muted"
                    className="mt-3 text-[13px] leading-[1.55]"
                  >
                    {lead.summary}
                  </Text>
                  <div className="mt-3 w-full">
                    <StoryMeta story={lead} />
                  </div>
                </div>
                <figure className="flex min-w-0 flex-col">
                  <NewsImage
                    story={lead}
                    eager
                    className="min-h-52 flex-1 sm:aspect-[4/3] sm:min-h-72"
                  />
                  <figcaption className="text-muted-foreground mt-1.5 text-[9px] leading-4">
                    The waterfront, reimagined. AI-generated illustration.
                  </figcaption>
                </figure>
              </article>
              <div className="border-border mt-5 grid gap-5 border-t pt-4 sm:grid-cols-2">
                <article className="flex items-start gap-3">
                  <NewsImage
                    story={getNewsStory("public-space")}
                    className="aspect-square w-20 shrink-0"
                  />
                  <div>
                    <Category>Politics</Category>
                    <h2 className="mt-1 text-sm leading-tight font-bold">
                      <StoryLink story={getNewsStory("public-space")}>
                        Who gets to shape the city’s next chapter?
                      </StoryLink>
                    </h2>
                    <p className="text-muted-foreground mt-2 text-[10px]">
                      Analysis · 7 min read
                    </p>
                  </div>
                </article>
                <article className="flex items-start gap-3">
                  <NewsImage
                    story={getNewsStory("ocean")}
                    className="aspect-square w-20 shrink-0"
                  />
                  <div>
                    <Category>Planet</Category>
                    <h2 className="mt-1 text-sm leading-tight font-bold">
                      <StoryLink story={getNewsStory("ocean")}>
                        Beneath the surface, a world worth protecting
                      </StoryLink>
                    </h2>
                    <p className="text-muted-foreground mt-2 text-[10px]">
                      Environment · 5 min read
                    </p>
                  </div>
                </article>
              </div>
            </div>
            <NewsFeed />
          </section>

          <Separator className="my-6" />
          <section
            id={target("business")}
            aria-label="Top stories"
            className="scroll-mt-32"
          >
            <SectionHeading
              title="Top stories"
              href={href("world")}
              link="Around the world"
            />
            <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {["rail", "materials", "markets", "football"].map((storyId) => (
                <StoryCard
                  key={storyId}
                  story={getNewsStory(storyId)}
                  id={storyId === "football" ? target("sport") : undefined}
                />
              ))}
            </div>
          </section>

          <Separator className="my-6" />
          <section
            id={target("world")}
            aria-label="The big picture"
            className="scroll-mt-32"
          >
            <SectionHeading
              title="The big picture"
              eyebrow="A little perspective"
            />
            <article className="grid items-center gap-5 sm:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
              <NewsImage story={feature} className="aspect-[2.1/1]" />
              <div>
                <Category>World / Environment</Category>
                <h3 className="mt-2 text-3xl leading-[1.08] font-extrabold tracking-[-0.045em]">
                  <StoryLink story={feature}>{feature.title}</StoryLink>
                </h3>
                <Text
                  size="sm"
                  tone="muted"
                  className="mt-3 text-[13px] leading-relaxed"
                >
                  {feature.summary} Our new series explores how people and
                  nature can flourish together.
                </Text>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <StoryLink
                    story={feature}
                    className="text-primary text-xs font-bold"
                  >
                    Read the story{" "}
                    <ArrowRight
                      aria-hidden="true"
                      className="ms-2 inline size-3.5"
                    />
                  </StoryLink>
                  <SaveStoryButton story={feature} />
                </div>
              </div>
            </article>
          </section>
        </div>

        <section
          id={target("watch")}
          aria-label="Watch"
          className="sc-news-inverse bg-background text-foreground scroll-mt-32 px-4 py-6 sm:px-7"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Heading
              level={2}
              className="flex items-center gap-2 font-sans text-2xl font-extrabold tracking-tight"
            >
              <span className="bg-primary text-primary-foreground inline-flex size-6 items-center justify-center">
                <Play aria-hidden="true" className="size-3.5 fill-current" />
              </span>
              Watch
            </Heading>
            <p className="text-muted-foreground text-[11px]">
              A closer look at the stories that matter
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {newsVideos.map((video) => (
              <article key={video.storyId}>
                <VideoPreview video={video} />
                <div className="mt-3">
                  <Category>{video.label}</Category>
                  <h3 className="mt-1 text-lg leading-tight font-bold tracking-tight">
                    {video.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-[12px] leading-relaxed">
                    {getNewsStory(video.storyId).summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="px-4 py-7 sm:px-7">
          <div className="grid gap-7 lg:grid-cols-3">
            <section
              id={target("culture")}
              aria-label="Culture"
              className="scroll-mt-32"
            >
              <SectionHeading title="Culture" />
              <StoryCard story={getNewsStory("art")} compact />
            </section>
            <section
              id={target("science")}
              aria-label="Science"
              className="scroll-mt-32"
            >
              <SectionHeading title="Science" />
              <StoryCard story={getNewsStory("ocean")} compact />
            </section>
            <section aria-label="Opinion">
              <SectionHeading title="Opinion" />
              <div className="divide-border divide-y">
                {newsStories
                  .filter((story) => story.category === "Opinion")
                  .map((story) => (
                    <article
                      key={story.id}
                      className="flex items-start gap-3 py-3 first:pt-0"
                    >
                      <Avatar
                        name={story.author}
                        size="md"
                        tone="neutral"
                        motion="none"
                        decorative
                      />
                      <div>
                        <Text size="xs" className="text-[11px] font-bold">
                          {story.author}
                        </Text>
                        <h3 className="mt-0.5 text-[12px] leading-snug">
                          <StoryLink story={story}>{story.title}</StoryLink>
                        </h3>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          </div>
          <Separator className="my-7" />
          <section
            id={target("politics")}
            aria-label="Politics and public life"
            className="grid scroll-mt-32 items-center gap-5 sm:grid-cols-[1fr_1.4fr]"
          >
            <div>
              <Category>Politics / Public life</Category>
              <Heading
                level={2}
                className="mt-2 font-sans text-2xl leading-tight font-extrabold tracking-tight"
              >
                <StoryLink story={getNewsStory("public-space")}>
                  The future is a public conversation.
                </StoryLink>
              </Heading>
            </div>
            <div>
              <Text size="sm" tone="muted" className="text-[13px]">
                Whose voice is heard? Whose experience shapes a place? Follow
                the ideas bringing everyday people into the decisions that
                matter.
              </Text>
              <div className="mt-3">
                <StoryLink
                  story={getNewsStory("public-space")}
                  className="text-xs font-bold"
                >
                  Explore the story{" "}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="ms-1 inline size-3"
                  />
                </StoryLink>
              </div>
            </div>
          </section>
        </div>

        <NewsNewsletter id={target("newsletter")} />

        <footer className="sc-news-inverse bg-background text-foreground px-4 pt-8 pb-5 sm:px-7">
          <div className="grid gap-7 sm:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <a
                href={href("top")}
                className="text-2xl font-black tracking-[-0.06em]"
              >
                THE CURRENT.
              </a>
              <p className="text-muted-foreground mt-3 max-w-56 text-xs leading-relaxed">
                A wider world. A closer look.
                <br />
                Stories for a more informed tomorrow.
              </p>
            </div>
            <nav aria-label="Footer sections">
              <p className="mb-3 text-xs font-bold">Explore</p>
              <ul className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
                {topics.map((topic) => (
                  <li key={topic}>
                    <a
                      className="hover:text-foreground hover:underline"
                      href={href(topic.toLowerCase())}
                    >
                      {topic}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <p className="mb-3 text-xs font-bold">Stay curious</p>
              <div className="text-muted-foreground flex flex-col items-start gap-2 text-xs">
                <a className="hover:underline" href={href("watch")}>
                  Watch & discover
                </a>
                <a className="hover:underline" href={href("newsletter")}>
                  The daily newsletter
                </a>
                <span className="mt-2 flex items-center gap-2">
                  <Globe2 aria-hidden="true" className="size-4" />
                  International edition
                </span>
              </div>
            </div>
          </div>
          <Separator className="my-5" />
          <div className="text-muted-foreground flex flex-wrap justify-between gap-2 text-[10px]">
            <span>The Current · A Dethink recipe</span>
            <span>
              Fictional stories · AI-generated imagery · Local demo interactions
            </span>
          </div>
        </footer>
      </div>
    </NewsReaderProvider>
  );
}
