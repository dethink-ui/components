"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Bookmark, Check, Play, Search } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  Field,
  FieldControl,
  FieldLabel,
  IconButton,
  Input,
  LiveRegion,
  Separator,
} from "@dethink/components";
import {
  getNewsStory,
  newsStories,
  type NewsStory,
  type newsVideos,
} from "./news-outlet-data";

interface ReaderState {
  saved: string[];
  toggle: (story: NewsStory) => void;
}
const ReaderContext = createContext<ReaderState | null>(null);

function useReader() {
  const value = useContext(ReaderContext);
  if (!value) throw new Error("News reader controls need NewsReaderProvider.");
  return value;
}

export function NewsReaderProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  function toggle(story: NewsStory) {
    const wasSaved = saved.includes(story.id);
    setSaved((current) =>
      current.includes(story.id)
        ? current.filter((id) => id !== story.id)
        : [...current, story.id],
    );
    setMessage(`${wasSaved ? "Removed" : "Saved"}: ${story.title}.`);
  }
  return (
    <ReaderContext.Provider value={{ saved, toggle }}>
      {children}
      <LiveRegion>{message}</LiveRegion>
    </ReaderContext.Provider>
  );
}

export function SaveStoryButton({ story }: { story: NewsStory }) {
  const { saved, toggle } = useReader();
  const active = saved.includes(story.id);
  return (
    <IconButton
      aria-label={`${active ? "Unsave" : "Save"} ${story.title}`}
      aria-pressed={active}
      variant="ghost"
      size="sm"
      className="rounded-none"
      onClick={() => toggle(story)}
    >
      <Bookmark aria-hidden="true" className={active ? "fill-current" : ""} />
    </IconButton>
  );
}

function ReaderImage({ story }: { story: NewsStory }) {
  return (
    <Image
      src={`/recipes/news-outlet/${story.image}.webp`}
      alt={story.alt}
      width={1672}
      height={941}
      sizes="(max-width: 640px) 90vw, 650px"
      className="aspect-video w-full object-cover"
    />
  );
}

export function StoryLink({
  story,
  children,
  className = "",
}: {
  story: NewsStory;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        variant="ghost"
        className={`inline h-auto! min-h-0 rounded-none border-0 bg-transparent p-0 text-start whitespace-normal text-inherit [font:inherit] hover:bg-transparent hover:underline active:bg-transparent ${className}`}
      >
        {children}
      </DialogTrigger>
      <DialogContent
        size="lg"
        scrollBehavior="inside"
        closeButtonLabel="Close article"
      >
        <DialogHeader>
          <p className="text-primary text-xs font-bold tracking-widest uppercase">
            {story.category} · The Current
          </p>
          <DialogTitle className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
            {story.title}
          </DialogTitle>
          <DialogDescription>{story.summary}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 px-6 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Avatar name={story.author} size="sm" motion="none" decorative />
            <p className="text-muted-foreground text-xs">
              By {story.author} · {story.minutes} min read
            </p>
            <SaveStoryButton story={story} />
          </div>
          <figure>
            <ReaderImage story={story} />
            <figcaption className="text-muted-foreground mt-1 text-[11px]">
              AI-generated illustration. Fictional sample reporting.
            </figcaption>
          </figure>
          <div className="space-y-4 text-sm leading-7">
            {story.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose variant="outline">Back to the news</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReaderTools() {
  const id = useId();
  const { saved, toggle } = useReader();
  const [query, setQuery] = useState("");
  const savedTitle = useRef<HTMLHeadingElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const normalized = query.trim().toLocaleLowerCase();
  const results = newsStories.filter((story) =>
    `${story.title} ${story.summary} ${story.category} ${story.author}`
      .toLocaleLowerCase()
      .includes(normalized),
  );
  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) setQuery("");
        }}
      >
        <DialogTrigger
          aria-label="Search stories"
          variant="ghost"
          className="size-9 rounded-none p-0"
        >
          <Search aria-hidden="true" className="size-4" />
        </DialogTrigger>
        <DialogContent
          size="lg"
          scrollBehavior="inside"
          closeButtonLabel="Close search"
        >
          <DialogHeader>
            <DialogTitle>Search The Current</DialogTitle>
            <DialogDescription>
              Find a story, topic or writer in this sample edition.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 pb-6">
            <Field id={`${id}-search`}>
              <FieldLabel>Search stories</FieldLabel>
              <FieldControl asChild>
                <Input
                  ref={searchInput}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try science, cities or culture"
                />
              </FieldControl>
            </Field>
            <p role="status" className="text-muted-foreground text-xs">
              {results.length} {results.length === 1 ? "story" : "stories"}
              {normalized ? " found" : " in this edition"}
            </p>
            {results.length ? (
              <ul
                className="divide-border divide-y"
                aria-label="Search results"
              >
                {results.map((story) => (
                  <li
                    className="flex items-start justify-between gap-3 py-3"
                    key={story.id}
                  >
                    <div>
                      <p className="text-primary mb-1 text-[10px] font-bold uppercase">
                        {story.category}
                      </p>
                      <h3 className="text-sm font-semibold">
                        <StoryLink story={story}>{story.title}</StoryLink>
                      </h3>
                    </div>
                    <SaveStoryButton story={story} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                variant="compact"
                visual={<Search />}
                title="No matching stories"
                description="Try a topic such as science, culture or cities."
                primaryAction={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      searchInput.current?.focus();
                    }}
                  >
                    Clear search
                  </Button>
                }
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger
          aria-label={`Saved stories (${saved.length})`}
          variant="ghost"
          className="relative size-9 rounded-none p-0"
        >
          <Bookmark aria-hidden="true" className="size-4" />
          {saved.length > 0 && (
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[9px]"
            >
              {saved.length}
            </span>
          )}
        </DialogTrigger>
        <DialogContent
          size="lg"
          scrollBehavior="inside"
          closeButtonLabel="Close saved stories"
        >
          <DialogHeader>
            <DialogTitle ref={savedTitle} tabIndex={-1}>
              Your saved stories
            </DialogTitle>
            <DialogDescription>
              Your reading list for this visit. It resets when you refresh.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            {saved.length ? (
              <ul aria-label="Saved stories" className="divide-border divide-y">
                {saved.map((storyId) => {
                  const story = getNewsStory(storyId);
                  return (
                    <li
                      key={storyId}
                      className="flex items-start justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="text-primary mb-1 text-[10px] font-bold uppercase">
                          {story.category}
                        </p>
                        <h3 className="text-sm font-semibold">
                          <StoryLink story={story}>{story.title}</StoryLink>
                        </h3>
                      </div>
                      <IconButton
                        size="sm"
                        aria-label={`Remove ${story.title}`}
                        onClick={() => {
                          savedTitle.current?.focus();
                          toggle(story);
                        }}
                      >
                        <Check aria-hidden="true" />
                      </IconButton>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                variant="compact"
                visual={<Bookmark />}
                title="Make room for a good read"
                description="Tap the bookmark beside any story to keep it here."
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose variant="outline">Keep exploring</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function VideoPreview({
  video,
}: {
  video: (typeof newsVideos)[number];
}) {
  const story = getNewsStory(video.storyId);
  return (
    <Dialog>
      <DialogTrigger
        variant="ghost"
        aria-label={`Preview ${video.title}`}
        className="relative block h-auto! w-full overflow-hidden rounded-none border-0 p-0"
      >
        <ReaderImage story={story} />
        <span className="absolute inset-0 flex items-center justify-center bg-[var(--news-night)]/10">
          <span className="flex size-11 items-center justify-center rounded-full border border-[var(--news-on-night)] bg-[var(--news-night)]/70 text-[var(--news-on-night)]">
            <Play aria-hidden="true" className="ms-0.5 size-5 fill-current" />
          </span>
        </span>
        <span className="absolute end-2 bottom-2 bg-[var(--news-night)] px-1.5 py-0.5 text-[10px] text-[var(--news-on-night)]">
          {video.duration} · Preview
        </span>
      </DialogTrigger>
      <DialogContent
        size="lg"
        scrollBehavior="inside"
        closeButtonLabel="Close video preview"
      >
        <DialogHeader>
          <Badge className="w-fit" size="sm">
            Film concept
          </Badge>
          <DialogTitle>{video.title}</DialogTitle>
          <DialogDescription>
            A still preview and sample transcript. Video playback is not
            included in this demo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-6">
          <ReaderImage story={story} />
          <Separator />
          <h3 className="font-semibold">Sample transcript</h3>
          {story.body.map((paragraph, index) => (
            <p key={paragraph} className="text-sm leading-7">
              <span className="text-muted-foreground me-2 text-xs tabular-nums">
                {["00:00", "00:24", "00:48"][index]}
              </span>
              {paragraph}
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose variant="outline">Back to Watch</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
