"use client";

/* eslint-disable jsx-a11y/no-redundant-roles -- Safari needs explicit list roles when list markers are removed. */

import { useId, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Check,
  FileText,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { Button, HorizontalAccordion } from "@dethink/components";

const activity = [
  {
    title: "Checkout flow approved",
    person: "Maya Chen",
    time: "12 min ago",
    type: "Design",
  },
  {
    title: "Preview build is ready",
    person: "Alex Morgan",
    time: "38 min ago",
    type: "Engineering",
  },
  {
    title: "Navigation review complete",
    person: "Sam Rivera",
    time: "1 hour ago",
    type: "Design",
  },
];
const files = [
  {
    title: "Launch brief",
    meta: "Updated today · 3 min read",
    body: "A calmer checkout, clearer navigation, and a faster path from discovery to purchase. The release is ready for the final accessibility review.",
  },
  {
    title: "Review checklist",
    meta: "Updated yesterday · 2 min read",
    body: "Verify keyboard navigation, review payment errors, check the mobile layout, and confirm that every order confirmation includes a receipt.",
  },
];
const team = [
  { name: "Maya Chen", initials: "MC", role: "Product design" },
  { name: "Alex Morgan", initials: "AM", role: "Engineering" },
  { name: "Sam Rivera", initials: "SR", role: "Quality assurance" },
];
const panelClass = "flex h-full flex-col gap-5 p-6 sm:p-8";

function OverviewPanel() {
  const [following, setFollowing] = useState(false);
  return (
    <div className={panelClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Website refresh
        </p>
        <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
          <Check aria-hidden="true" className="size-3" /> On track
        </span>
      </div>
      <div>
        <h3 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Good work.
          <br />
          Coming together.
        </h3>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
          One final review before the next chapter goes live.
        </p>
      </div>
      <div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-foreground text-5xl font-semibold tracking-tighter tabular-nums">
            24
            <span className="text-muted-foreground text-xl font-normal">
              {" "}
              / 32
            </span>
          </span>
          <span className="text-muted-foreground text-xs">tasks complete</span>
        </div>
        <progress
          aria-label="Launch progress"
          className="[&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary mt-3 h-1.5 w-full overflow-hidden rounded-full"
          max={32}
          value={24}
        />
      </div>
      <div className="border-border mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div>
          <p className="text-muted-foreground text-xs">Next milestone</p>
          <p className="text-foreground mt-1 text-sm font-medium">
            Design sign-off · 26 Sep
          </p>
        </div>
        <Button
          aria-pressed={following}
          leftIcon={<Bell aria-hidden="true" />}
          onClick={() => setFollowing(!following)}
          size="sm"
          variant={following ? "soft" : "outline"}
        >
          {following ? "Following" : "Follow project"}
        </Button>
      </div>
    </div>
  );
}

function ActivityPanel() {
  const [filter, setFilter] = useState("All updates");
  const id = useId();
  const entries = activity.filter(
    (entry) => filter === "All updates" || entry.type === filter,
  );
  return (
    <div className={panelClass}>
      <div>
        <p className="text-primary text-xs font-medium tracking-widest uppercase">
          The latest
        </p>
        <h3 className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
          Small steps. Real progress.
        </h3>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-muted-foreground text-sm" htmlFor={id}>
          Show activity
        </label>
        <select
          className="border-border bg-background text-foreground focus-visible:outline-ring min-h-9 rounded-md border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          id={id}
          onChange={(event) => setFilter(event.target.value)}
          value={filter}
        >
          <option>All updates</option>
          <option>Design</option>
          <option>Engineering</option>
        </select>
      </div>
      <ul className="divide-border divide-y" role="list">
        {entries.map((entry) => (
          <li className="flex items-start gap-3 py-3" key={entry.title}>
            <span className="bg-primary/10 text-primary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
              <Check aria-hidden="true" className="size-3.5" />
            </span>
            <div>
              <p className="text-foreground text-sm font-medium">
                {entry.title}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {entry.person} · {entry.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-auto text-xs" role="status">
        {entries.length} {entries.length === 1 ? "update" : "updates"} ·{" "}
        {filter}
      </p>
    </div>
  );
}

function FilesPanel() {
  const [selected, setSelected] = useState<string>();
  return (
    <div className={panelClass}>
      <div>
        <p className="text-primary text-xs font-medium tracking-widest uppercase">
          Shared knowledge
        </p>
        <h3 className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
          Everything in its place.
        </h3>
      </div>
      <ul className="space-y-2" role="list">
        {files.map((file) => (
          <li key={file.title}>
            <button
              aria-expanded={selected === file.title}
              className="border-border bg-background text-foreground hover:bg-muted focus-visible:outline-ring flex w-full items-center gap-3 rounded-lg border p-3 text-start focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() =>
                setSelected(selected === file.title ? undefined : file.title)
              }
              type="button"
            >
              <FileText
                aria-hidden="true"
                className="text-primary size-5 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{file.title}</span>
                <span className="text-muted-foreground mt-1 block text-xs">
                  {file.meta}
                </span>
              </span>
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            </button>
            {selected === file.title ? (
              <p className="border-border text-muted-foreground mt-2 border-s-2 ps-3 text-sm leading-6">
                {file.body}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-auto text-xs">
        Select a document to read its summary.
      </p>
    </div>
  );
}

function TeamPanel() {
  const [owner, setOwner] = useState("Maya Chen");
  return (
    <div className={panelClass}>
      <div>
        <p className="text-primary text-xs font-medium tracking-widest uppercase">
          Better together
        </p>
        <h3 className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
          A small, focused team.
        </h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Choose who leads the next review.
        </p>
      </div>
      <ul className="divide-border divide-y" role="list">
        {team.map((person) => (
          <li
            className="flex flex-wrap items-center gap-3 py-3"
            key={person.name}
          >
            <span
              aria-hidden="true"
              className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              {person.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground text-sm font-medium">
                {person.name}
              </p>
              <p className="text-muted-foreground text-xs">{person.role}</p>
            </div>
            <Button
              aria-label={`Assign ${person.name} as review lead`}
              aria-pressed={owner === person.name}
              onClick={() => setOwner(person.name)}
              size="sm"
              variant={owner === person.name ? "soft" : "ghost"}
            >
              {owner === person.name ? "Lead" : "Assign"}
            </Button>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-auto text-xs" role="status">
        {owner} leads the next review.
      </p>
    </div>
  );
}

const sections = [
  {
    value: "overview",
    label: "Overview",
    summary: "75% complete",
    badge: "75%",
    icon: LayoutDashboard,
    panel: OverviewPanel,
  },
  {
    value: "activity",
    label: "Activity",
    summary: "3 recent updates",
    badge: "03",
    icon: Activity,
    panel: ActivityPanel,
  },
  {
    value: "files",
    label: "Files",
    summary: "2 documents",
    badge: "02",
    icon: FileText,
    panel: FilesPanel,
  },
  {
    value: "team",
    label: "Team",
    summary: "3 members",
    badge: "03",
    icon: Users,
    panel: TeamPanel,
  },
];

export function HorizontalAccordionBasic() {
  return (
    <HorizontalAccordion
      aria-label="Website refresh project"
      bladeWidth={56}
      className="border-border bg-background rounded-xl border shadow-sm"
      collapsible={false}
      compactBreakpoint={600}
      defaultValue="overview"
      height={440}
    >
      {sections.map(
        ({ value, label, summary, badge, icon: Icon, panel: Panel }) => (
          <HorizontalAccordion.Item key={value} value={value}>
            <HorizontalAccordion.Blade
              aria-label={`${label}, ${summary}`}
              className="bg-muted/50 data-[layout=compact]:px-1"
            >
              <HorizontalAccordion.BladeIcon>
                <Icon aria-hidden="true" className="size-4" />
              </HorizontalAccordion.BladeIcon>
              <HorizontalAccordion.BladeLabel className="data-[layout=compact]:text-xs">
                {label}
              </HorizontalAccordion.BladeLabel>
              <span
                aria-hidden="true"
                className="order-3 rounded-full border border-current/20 px-1.5 py-0.5 text-[0.625rem] font-medium tabular-nums"
              >
                {badge}
              </span>
            </HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel className="overflow-y-auto">
              <Panel />
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        ),
      )}
    </HorizontalAccordion>
  );
}
