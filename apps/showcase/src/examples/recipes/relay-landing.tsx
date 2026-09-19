"use client";

import { useId, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  BookOpen,
  Check,
  ChevronRight,
  FileText,
  Link2,
  Plus,
  Search,
  Users,
} from "lucide-react";
import {
  Accordion,
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
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Input,
  Tabs,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import "./relay-landing.css";

type ResearchSource = {
  id: string;
  title: string;
  detail: string;
  author: string;
  before: string;
  excerpt: string;
  after: string;
  finding: string;
  explanation: string;
};

type ResearchTopic = {
  id: string;
  label: string;
  question: string;
  answer: string;
  nextStep: string;
  nextDetail: string;
  sources: ResearchSource[];
};

const topics: ResearchTopic[] = [
  {
    id: "feedback",
    label: "Customer feedback",
    question: "What should we build next?",
    answer: "Make onboarding the priority.",
    nextStep: "Test a guided first-run experience.",
    nextDetail: "Start with a small prototype. Learn before you commit.",
    sources: [
      {
        id: "feedback-interviews",
        title: "Interview notes",
        detail: "Customer conversations",
        author: "Interview 07 · Sample research",
        before: "The setup felt confusing at first. ",
        excerpt:
          "I wasn’t sure what to do after creating my account. A guided walkthrough would have helped.",
        after: " Once I got past that, the product started to make sense.",
        finding: "People want a faster path to value.",
        explanation:
          "New customers describe their first session as the hardest part of getting started.",
      },
      {
        id: "feedback-support",
        title: "Support themes",
        detail: "Help-desk review",
        author: "Customer care · Sample research",
        before: "We reviewed the most common questions this month. ",
        excerpt:
          "Getting a workspace set up and inviting a first teammate kept coming up together.",
        after: " A clearer first-run checklist could answer both in context.",
        finding: "The same setup questions keep coming back.",
        explanation:
          "Support conversations point to workspace setup and first invitations.",
      },
      {
        id: "feedback-usage",
        title: "Usage report",
        detail: "Activation observations",
        author: "Product insights · Sample research",
        before: "Looking at the sample activation journeys, ",
        excerpt:
          "people who completed a first shared task returned to the workspace with a clearer purpose.",
        after:
          " The next experiment should make that first task easier to find.",
        finding: "A shared first task creates momentum.",
        explanation:
          "The sample journeys suggest testing activation around one useful team action.",
      },
    ],
  },
  {
    id: "market",
    label: "Market signals",
    question: "Where is there room to stand out?",
    answer: "Make the reasoning visible.",
    nextStep: "Prototype an answer with a clear paper trail.",
    nextDetail: "Let a research team check each claim against its source.",
    sources: [
      {
        id: "market-landscape",
        title: "Landscape review",
        detail: "Category observations",
        author: "Strategy desk · Sample research",
        before: "The category makes similar promises about speed. ",
        excerpt:
          "Few of the examples make it easy to follow a conclusion back to the passage that supports it.",
        after: " Evidence navigation is a useful direction to explore.",
        finding: "Speed alone is a crowded promise.",
        explanation:
          "The sample landscape points to traceable reasoning as a clearer difference.",
      },
      {
        id: "market-buyers",
        title: "Buyer interviews",
        detail: "Research team needs",
        author: "Interview 03 · Sample research",
        before: "I don’t just need an answer for myself. ",
        excerpt:
          "I need to show my team why we should trust it, without rebuilding the research in a slide deck.",
        after: " A source-linked summary would help us have that conversation.",
        finding: "Confidence has to travel with the answer.",
        explanation:
          "Buyers want to share the evidence as easily as the recommendation.",
      },
      {
        id: "market-pilot",
        title: "Pilot reflections",
        detail: "Early concept feedback",
        author: "Pilot team · Sample research",
        before: "When we compared the two concepts, ",
        excerpt:
          "the source preview gave reviewers a useful way to challenge the conclusion and improve it.",
        after: " Keep that interaction prominent in the next prototype.",
        finding: "Inspection is part of the workflow.",
        explanation:
          "Reviewers used the source preview to discuss and improve the recommendation.",
      },
    ],
  },
  {
    id: "decisions",
    label: "Product decisions",
    question: "How should we share the next decision?",
    answer: "Give the decision a shared home.",
    nextStep: "Try a short, source-linked decision brief.",
    nextDetail:
      "Include the owner, the rationale, and what would change your mind.",
    sources: [
      {
        id: "decisions-retro",
        title: "Team retrospective",
        detail: "Cross-team reflections",
        author: "Product team · Sample research",
        before: "We could find the final decision in the meeting notes. ",
        excerpt:
          "The reasoning was scattered across messages, so each new teammate had to ask the same questions again.",
        after: " Keep the reasoning beside the decision next time.",
        finding: "Context gets lost between conversations.",
        explanation:
          "The team can find a decision more easily than the reasoning behind it.",
      },
      {
        id: "decisions-handoff",
        title: "Handoff notes",
        detail: "Design and engineering",
        author: "Delivery team · Sample research",
        before: "Our smoothest handoff had a small but useful difference. ",
        excerpt:
          "One person owned the brief, and every open question had a link back to the original evidence.",
        after: " We spent less time reconstructing context.",
        finding: "A named owner makes the brief useful.",
        explanation:
          "The sample handoff connects clear ownership with accessible evidence.",
      },
      {
        id: "decisions-log",
        title: "Decision log",
        detail: "Experiment follow-up",
        author: "Experiment review · Sample research",
        before: "We agreed to revisit the decision after the pilot. ",
        excerpt:
          "Writing down what would change our minds made the follow-up discussion much more focused.",
        after: " Keep assumptions and review criteria visible.",
        finding: "Good decisions leave room to learn.",
        explanation:
          "Explicit review criteria make it easier to revisit the recommendation.",
      },
    ],
  },
];

const faqs = [
  {
    id: "sources",
    question: "Can I inspect the sources?",
    answer:
      "Yes. Open any source or numbered citation to read the exact passage behind a finding. The highlighted excerpt stays connected to its source and research topic.",
  },
  {
    id: "team",
    question: "Can my team work together?",
    answer:
      "Relay imagines a shared place for research and decisions. This interactive recipe demonstrates that idea locally; collaboration, accounts, and sharing services are not connected.",
  },
  {
    id: "demo",
    question: "Is this a live AI workspace?",
    answer:
      "This is a Dethink Components recipe with three authored, fictional research samples. You can explore sources and name a sample workspace. Nothing is uploaded or sent, and refreshing the page resets the demo.",
  },
];

const textLink =
  "rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";
const dialogClass =
  "sc-relay-theme [&>[data-slot=dialog-panel]]:grid [&>[data-slot=dialog-panel]]:min-w-0";

function RelayMark() {
  return (
    <span className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight">
      <Asterisk
        aria-hidden="true"
        className="text-primary size-8"
        strokeWidth={3}
      />
      Relay
    </span>
  );
}

function SourceExcerpt({ source }: { source: ResearchSource }) {
  return (
    <blockquote className="text-muted-foreground leading-7">
      “{source.before}
      <mark className="bg-primary/15 text-foreground rounded-sm px-0.5">
        {source.excerpt}
      </mark>
      {source.after}”
    </blockquote>
  );
}

function EvidenceDialog({
  source,
  number,
  children,
  className,
  label,
}: {
  source: ResearchSource;
  number: number;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        size="sm"
        variant="ghost"
        className={className}
        aria-label={label}
      >
        {children}
      </DialogTrigger>
      <DialogContent
        size="md"
        className={dialogClass}
        overlayClassName="sc-relay-theme"
        showCloseButton
      >
        <DialogHeader>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Source {String(number).padStart(2, "0")} · Fictional sample
          </p>
          <DialogTitle>{source.title}</DialogTitle>
          <DialogDescription>
            {source.detail}. The highlighted passage supports this finding.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 px-6 pb-6">
          <div className="bg-muted/50 rounded-lg p-5">
            <SourceExcerpt source={source} />
          </div>
          <p className="text-muted-foreground text-xs">{source.author}</p>
          <div className="border-border border-t pt-4">
            <p className="text-muted-foreground mb-1 text-xs">Linked finding</p>
            <p className="font-medium">{source.finding}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose variant="outline">Back to research</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WorkspaceDialog({
  topic,
  workspaceName,
  onCreate,
  className,
  variant = "solid",
}: {
  topic: ResearchTopic;
  workspaceName: string;
  onCreate: (name: string) => void;
  className?: string;
  variant?: "solid" | "outline";
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(workspaceName);
          setError("");
          setComplete(false);
        }
      }}
    >
      <DialogTrigger className={className} variant={variant}>
        Try the workspace
        <ArrowUpRight aria-hidden="true" className="ms-2 size-4" />
      </DialogTrigger>
      <DialogContent
        size="md"
        className={dialogClass}
        overlayClassName="sc-relay-theme"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Try the workspace</DialogTitle>
          <DialogDescription>
            A little context. A clearer next step. Explore an authored sample
            with your own workspace name.
          </DialogDescription>
        </DialogHeader>
        {complete ? (
          <>
            <div className="space-y-5 px-6 pb-6">
              <div role="status" className="bg-primary/10 rounded-lg p-5">
                <Check
                  aria-hidden="true"
                  className="text-primary mb-3 size-6"
                />
                <h3 className="font-serif text-2xl">
                  Your sample workspace is ready.
                </h3>
                <p className="mt-2 text-sm">
                  {name.trim()} · {topic.label}
                </p>
              </div>
              <p className="font-medium">{topic.nextStep}</p>
              <p className="text-muted-foreground text-sm">
                Your research canvas now carries this name. All three sources
                are ready to explore. This local demo resets on refresh.
              </p>
            </div>
            <DialogFooter>
              <DialogClose>Back to the workspace</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (name.trim().length < 2) {
                setError(
                  "Use at least two characters for your workspace name.",
                );
                return;
              }
              onCreate(name.trim());
              setComplete(true);
            }}
          >
            <div className="space-y-5 px-6 pb-6">
              <Field id={`${id}-workspace`} invalid={Boolean(error)}>
                <FieldLabel>Workspace name</FieldLabel>
                <FieldControl asChild>
                  <Input
                    required
                    maxLength={60}
                    placeholder="e.g. Product team"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError("");
                    }}
                  />
                </FieldControl>
                {error && <FieldError role="alert">{error}</FieldError>}
              </Field>
              <div className="border-border rounded-lg border p-4">
                <p className="text-muted-foreground mb-2 text-xs">
                  Included sample · {topic.label}
                </p>
                <p className="font-serif text-xl">{topic.question}</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Three findings, three linked sources, one next step.
                </p>
              </div>
              <p className="text-muted-foreground text-xs">
                Fictional research. No account, upload, or AI connection needed.
              </p>
            </div>
            <DialogFooter>
              <DialogClose variant="outline">Cancel</DialogClose>
              <Button
                type="submit"
                rightIcon={<ArrowRight aria-hidden="true" className="size-4" />}
              >
                Create sample workspace
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResearchPanel({
  topic,
  query,
  onQueryChange,
}: {
  topic: ResearchTopic;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const id = useId();
  const sources = topic.sources.filter((source) =>
    source.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <div className="grid min-w-0 md:grid-cols-[14.5rem_minmax(0,1fr)]">
      <div className="min-w-0 p-5 md:col-start-2 md:row-start-1 md:p-8">
        <p className="text-muted-foreground text-xs">Question</p>
        <h3 className="border-border mt-1 border-b pb-5 font-serif text-2xl tracking-tight">
          {topic.question}
        </h3>
        <p className="text-muted-foreground mt-5 text-xs">Answer</p>
        <p className="mt-1 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
          {topic.answer}
        </p>
        <ol className="mt-6 space-y-5">
          {topic.sources.map((source, index) => (
            <li key={source.id} className="flex gap-3">
              <span
                aria-hidden="true"
                className="bg-primary text-primary-foreground mt-0.5 grid size-6 shrink-0 place-items-center rounded text-xs"
              >
                {index + 1}
              </span>
              <div>
                <h4 className="font-medium">{source.finding}</h4>
                <div className="text-muted-foreground mt-1 text-sm leading-6">
                  {source.explanation}{" "}
                  <EvidenceDialog
                    source={source}
                    number={index + 1}
                    label={`View source ${index + 1}: ${source.title}`}
                    className="text-primary inline-flex h-auto min-h-7 px-1 py-0 align-baseline text-xs"
                  >
                    [{index + 1}]
                  </EvidenceDialog>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="bg-primary/6 mt-6 flex gap-3 rounded-lg p-4 sm:p-5">
          <span className="bg-background text-primary grid size-10 shrink-0 place-items-center rounded-full">
            <ArrowUpRight aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-muted-foreground text-xs">
              Recommended next step
            </p>
            <p className="mt-1 font-serif text-xl leading-snug">
              {topic.nextStep}
            </p>
            <p className="text-muted-foreground mt-2 text-xs leading-5">
              {topic.nextDetail}
            </p>
          </div>
        </div>
      </div>
      <aside
        aria-label={`${topic.label} sources`}
        className="border-border bg-muted/15 border-t p-4 md:col-start-1 md:row-start-1 md:border-e md:border-t-0"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Sources ({topic.sources.length})
          </h3>
          <span className="text-muted-foreground font-mono text-[0.65rem] tracking-wider uppercase">
            Sample set
          </span>
        </div>
        <label
          htmlFor={`${id}-search`}
          className="text-muted-foreground mb-2 block text-xs"
        >
          Search sources
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute start-3 top-3 size-4"
          />
          <Input
            id={`${id}-search`}
            type="search"
            className="ps-9 text-sm"
            placeholder="Find a source…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        {sources.length ? (
          <ul className="mt-4 space-y-1">
            {sources.map((source) => (
              <li key={source.id}>
                <EvidenceDialog
                  source={source}
                  number={topic.sources.indexOf(source) + 1}
                  className="h-auto w-full justify-start gap-2.5 px-2.5 py-3 text-start whitespace-normal"
                  label={`Read ${source.title}`}
                >
                  <FileText
                    aria-hidden="true"
                    className="text-primary size-5 shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {source.title}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-[0.7rem] leading-4">
                      {source.detail}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="text-muted-foreground size-3.5 shrink-0"
                  />
                </EvidenceDialog>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-5">
            <p className="text-sm">No sources found.</p>
            <Button
              variant="link"
              className="mt-2 px-0"
              onClick={() => onQueryChange("")}
            >
              Clear search
            </Button>
          </div>
        )}
        <p role="status" className="text-muted-foreground mt-4 text-xs">
          {query
            ? `${sources.length} of ${topic.sources.length} sources shown`
            : "All sources are fictional examples."}
        </p>
      </aside>
    </div>
  );
}

export function RelayLandingRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const [topicId, setTopicId] = useState(topics[0]!.id);
  const [query, setQuery] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const topic = topics.find((item) => item.id === topicId) ?? topics[0]!;
  const source = topic.sources[0]!;
  const workspaceProps = { topic, workspaceName, onCreate: setWorkspaceName };

  return (
    <div
      data-recipe-surface="relay-landing"
      className={`sc-relay-theme bg-background text-foreground ${presentation === "full-page" ? "min-h-[calc(100dvh-7rem)]" : "border-border overflow-hidden rounded-xl border"}`}
    >
      <header
        id="relay-home"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-5 sm:px-8 lg:px-12"
      >
        <a href="#relay-home" className={textLink} aria-label="Relay home">
          <RelayMark />
        </a>
        <nav
          aria-label="Relay"
          className="border-border order-last flex w-full justify-center gap-6 border-t pt-3 text-xs sm:order-none sm:w-auto sm:border-0 sm:pt-0 sm:text-sm"
        >
          <a href="#relay-research" className={textLink}>
            Product
          </a>
          <a href="#relay-capabilities" className={textLink}>
            Use cases
          </a>
          <a href="#relay-evidence" className={textLink}>
            How it works
          </a>
        </nav>
        <WorkspaceDialog {...workspaceProps} className="text-xs sm:text-sm" />
      </header>

      <section className="mx-auto max-w-5xl px-5 pt-12 pb-10 text-center sm:px-8 sm:pt-16 sm:pb-12">
        <p className="text-muted-foreground font-mono text-[0.65rem] tracking-[0.24em] uppercase">
          Answers with a paper trail
        </p>
        <h1 className="mt-5 font-serif text-[clamp(2.4rem,5.8vw,4.6rem)] leading-[1.02] tracking-[-0.045em]">
          From scattered sources.
          <br />
          <span className="text-primary">To a clear next move.</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg">
          Bring your research together. Find the answer,
          <br className="hidden sm:block" /> and see what supports it.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            rightIcon={<ArrowRight aria-hidden="true" className="size-4" />}
          >
            <a href="#relay-research">Explore a sample</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#relay-evidence">See how it works</a>
          </Button>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">
          A little less searching. A lot more understanding.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
        <section
          id="relay-research"
          aria-labelledby="relay-research-title"
          tabIndex={-1}
          className="focus-visible:outline-ring scroll-mt-36 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Card
            shadow="none"
            className="border-border overflow-hidden rounded-xl shadow-[0_12px_50px_-24px_var(--dt-color-border)]"
          >
            <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
              <h2
                id="relay-research-title"
                className="flex min-w-0 items-center gap-2.5 text-sm font-medium"
              >
                <BookOpen aria-hidden="true" className="size-4 shrink-0" />
                <span className="min-w-0 break-words">
                  {workspaceName || "Research workspace"}
                </span>
              </h2>
              <Badge variant="soft">Sample project</Badge>
            </div>
            <Tabs
              value={topicId}
              onValueChange={(value) => {
                setTopicId(value);
                setQuery("");
              }}
              motionPreset="none"
              className="gap-0"
            >
              <div className="border-border overflow-x-auto border-b px-4 py-3">
                <Tabs.List
                  aria-label="Research topics"
                  className="border-0 bg-transparent p-0 shadow-none"
                >
                  <>
                    {topics.map((item) => (
                      <Tabs.Trigger
                        key={item.id}
                        value={item.id}
                        className="rounded-full text-xs sm:text-sm [&_[data-slot=tabs-active-layer]]:rounded-full"
                      >
                        {item.label}
                      </Tabs.Trigger>
                    ))}
                  </>
                </Tabs.List>
              </div>
              {topics.map((item) => (
                <Tabs.Panel
                  key={item.id}
                  value={item.id}
                  className="rounded-none"
                >
                  <ResearchPanel
                    topic={item}
                    query={query}
                    onQueryChange={setQuery}
                  />
                </Tabs.Panel>
              ))}
            </Tabs>
            <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
              <span className="text-primary inline-flex items-center gap-2 text-xs">
                <Link2 aria-hidden="true" className="size-4" />
                {topic.sources.length} sources linked
              </span>
              <EvidenceDialog
                source={source}
                number={1}
                label="View evidence"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-xs"
              >
                View evidence
                <ArrowRight aria-hidden="true" className="ms-2 size-4" />
              </EvidenceDialog>
            </div>
          </Card>
        </section>

        <section
          id="relay-capabilities"
          className="border-border mt-10 scroll-mt-36 border-y py-7 sm:mt-12"
        >
          <h2 className="sr-only">From context to a shared decision</h2>
          <ul className="grid gap-7 md:grid-cols-3 md:gap-0">
            {[
              {
                icon: FileText,
                title: "Collect the context",
                text: "Bring together notes, reports, and conversations in one place.",
              },
              {
                icon: Search,
                title: "Trace every claim",
                text: "See exactly which sources support each answer.",
              },
              {
                icon: Users,
                title: "Share the decision",
                text: "Turn insights into a clear next step for your team.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className={`flex gap-4 ${index ? "md:border-border md:border-s md:ps-6" : ""} md:pe-5`}
              >
                <Icon aria-hidden="true" className="mt-1 size-6 shrink-0" />
                <div>
                  <h3 className="font-serif text-xl tracking-tight">{title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="relay-evidence"
          className="grid scroll-mt-36 items-center gap-8 py-12 md:grid-cols-[0.85fr_1.15fr] md:gap-12 md:py-16"
        >
          <div>
            <p className="text-muted-foreground font-mono text-[0.6rem] tracking-[0.2em] uppercase">
              Built for higher confidence
            </p>
            <h2 className="mt-4 max-w-sm font-serif text-4xl leading-[1.05] tracking-[-0.035em] sm:text-5xl">
              Every answer has
              <br />a way back.
            </h2>
            <p className="text-muted-foreground mt-5 max-w-sm text-sm leading-7">
              Open a citation. Read the passage. Make up your own mind. The
              reasoning is always there when you need it.
            </p>
          </div>
          <div className="border-border rounded-lg border p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium">
              <FileText aria-hidden="true" className="size-4" />
              Source 01 · {source.title}
            </div>
            <div className="bg-muted/40 rounded-md p-4 text-sm">
              <SourceExcerpt source={source} />
            </div>
            <p className="text-muted-foreground mt-4 text-xs">
              {source.author}
            </p>
            <EvidenceDialog
              source={source}
              number={1}
              label="Inspect this source"
              className="text-primary mt-4 h-8 px-0 text-xs hover:bg-transparent"
            >
              Inspect this source
              <ArrowUpRight aria-hidden="true" className="ms-2 size-3.5" />
            </EvidenceDialog>
          </div>
        </section>

        <section className="pb-12">
          <h2 className="sr-only">Questions about Relay</h2>
          <Accordion
            aria-label="Questions about Relay"
            motionPreset="none"
            className="gap-0"
          >
            {faqs.map((faq) => (
              <Accordion.Item
                key={faq.id}
                value={faq.id}
                className="border-border rounded-none border-x-0 border-t border-b-0 bg-transparent shadow-none"
              >
                <Accordion.Blade iconPosition="end" className="px-0 py-5">
                  <Accordion.BladeText className="font-serif text-lg font-normal">
                    {faq.question}
                  </Accordion.BladeText>
                  <Accordion.BladeIcon>
                    <Plus aria-hidden="true" className="size-4" />
                  </Accordion.BladeIcon>
                </Accordion.Blade>
                <Accordion.Content className="px-0">
                  <p className="text-muted-foreground max-w-3xl pb-4 text-sm leading-7">
                    {faq.answer}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion>
        </section>

        <section className="bg-primary text-primary-foreground flex flex-wrap items-center justify-between gap-6 rounded-lg px-6 py-8 sm:px-8">
          <h2 className="max-w-lg font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            A clearer answer starts here.
          </h2>
          <WorkspaceDialog
            {...workspaceProps}
            className="border-primary-foreground/20 bg-background text-foreground hover:bg-background/90"
          />
        </section>
        <footer className="flex flex-wrap items-center justify-between gap-5 py-7">
          <div className="flex flex-wrap items-center gap-4">
            <a href="#relay-home" aria-label="Relay home" className={textLink}>
              <RelayMark />
            </a>
            <span className="text-muted-foreground text-xs">
              A more thoughtful way to do research.
            </span>
          </div>
          <div className="text-muted-foreground flex gap-5 text-xs">
            <a href="#relay-research" className={textLink}>
              Product
            </a>
            <a href="#relay-evidence" className={textLink}>
              How it works
            </a>
            <span>Relay · A fictional product</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
