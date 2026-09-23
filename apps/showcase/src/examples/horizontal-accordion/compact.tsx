"use client";

/* eslint-disable jsx-a11y/no-redundant-roles -- Safari needs explicit list roles when list markers are removed. */

import { useState } from "react";
import { Archive, Check, Inbox, Sun } from "lucide-react";
import { Button, HorizontalAccordion } from "@dethink/components";

const messages = [
  { id: 1, title: "Final screens are ready", sender: "Maya Chen", today: true },
  {
    id: 2,
    title: "A note on the launch brief",
    sender: "Alex Morgan",
    today: true,
  },
  {
    id: 3,
    title: "Last week's review notes",
    sender: "Sam Rivera",
    today: false,
  },
];
const folders = [
  { value: "inbox", label: "Inbox", icon: Inbox },
  { value: "today", label: "Today", icon: Sun },
  { value: "archive", label: "Archive", icon: Archive },
];

export function HorizontalAccordionCompact() {
  const [archived, setArchived] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const inFolder = (folder: string) =>
    messages.filter((message) =>
      folder === "archive"
        ? archived.includes(message.id)
        : !archived.includes(message.id) &&
          (folder !== "today" || message.today),
    );
  return (
    <div className="mx-auto max-w-sm">
      <HorizontalAccordion
        aria-label="Project inbox"
        className="border-border bg-background outline-border rounded-xl border shadow-md outline-1"
        collapsible={false}
        defaultValue="inbox"
        height={380}
      >
        {folders.map(({ value, label, icon: Icon }) => (
          <HorizontalAccordion.Item key={value} value={value}>
            <HorizontalAccordion.Blade
              aria-label={`${label}, ${inFolder(value).length} ${inFolder(value).length === 1 ? "message" : "messages"}`}
            >
              <HorizontalAccordion.BladeIcon>
                <Icon aria-hidden="true" className="size-4" />
              </HorizontalAccordion.BladeIcon>
              <HorizontalAccordion.BladeLabel className="gap-1.5">
                {label}
                <span aria-hidden="true" className="text-xs tabular-nums">
                  {inFolder(value).length}
                </span>
              </HorizontalAccordion.BladeLabel>
            </HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel className="overflow-y-auto">
              <div className="flex h-full flex-col p-5">
                <p className="text-primary text-xs font-medium tracking-widest uppercase">
                  Website refresh
                </p>
                <h3 className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
                  {label}
                </h3>
                <ul className="divide-border mt-4 divide-y" role="list">
                  {inFolder(value).map((message) => (
                    <li
                      className="flex flex-wrap items-center justify-between gap-2 py-3"
                      key={message.id}
                    >
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {message.title}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {message.sender}
                        </p>
                      </div>
                      <Button
                        aria-label={`${value === "archive" ? "Restore" : "Archive"}: ${message.title}`}
                        onClick={(event) => {
                          // The clicked row will disappear. Keep focus in this
                          // inbox instead of letting it fall back to the page.
                          event.currentTarget
                            .closest('[data-slot="horizontal-accordion"]')
                            ?.querySelector<HTMLButtonElement>(
                              '[data-slot="horizontal-accordion-blade"][data-state="active"]',
                            )
                            ?.focus();
                          setArchived((current) =>
                            value === "archive"
                              ? current.filter((id) => id !== message.id)
                              : [...current, message.id],
                          );
                          setNotice(
                            `${message.title} ${value === "archive" ? "restored to inbox" : "archived"}.`,
                          );
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        {value === "archive" ? "Restore" : "Archive"}
                      </Button>
                    </li>
                  ))}
                </ul>
                {inFolder(value).length === 0 ? (
                  <div className="text-muted-foreground my-auto py-8 text-center">
                    <Check aria-hidden="true" className="mx-auto mb-3 size-6" />
                    <p className="text-sm">
                      {value === "archive"
                        ? "No archived messages yet."
                        : "You're all caught up."}
                    </p>
                  </div>
                ) : null}
              </div>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        ))}
      </HorizontalAccordion>
      <p
        className="text-muted-foreground mt-3 min-h-8 text-xs leading-5"
        role="status"
      >
        {notice || "Archive a message, then restore it from Archive."}
      </p>
    </div>
  );
}
