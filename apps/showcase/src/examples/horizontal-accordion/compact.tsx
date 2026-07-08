"use client";

import { Button, HorizontalAccordion } from "@dethink/components";

function InboxIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M4 13h4l2 3h4l2-3h4M6 5h12l2 8v6H4v-6l2-8Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10-1.4 1.4" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M4 5h16v4H4V5Zm1 4h14v10H5V9Zm5 4h4" />
    </svg>
  );
}

const folders = [
  {
    value: "inbox",
    label: "Inbox",
    icon: <InboxIcon />,
    count: 12,
    body: "Triage new messages without leaving the band — the blade tray keeps every folder one tap away.",
  },
  {
    value: "today",
    label: "Today",
    icon: <SunIcon />,
    count: 4,
    body: "Below the compact breakpoint the active panel moves above a horizontal blade tray sized for touch.",
  },
  {
    value: "archive",
    label: "Archive",
    icon: <ArchiveIcon />,
    count: 218,
    body: "Labels flatten to horizontal writing in compact mode, so short names and icons work best here.",
  },
];

export function HorizontalAccordionCompact() {
  return (
    <div className="mx-auto max-w-sm">
      <HorizontalAccordion
        aria-label="Compact layout demo"
        className="border-border rounded-lg border"
        defaultValue="inbox"
        height={300}
      >
        {folders.map((folder) => (
          <HorizontalAccordion.Item key={folder.value} value={folder.value}>
            <HorizontalAccordion.Blade>
              <HorizontalAccordion.BladeIcon>
                {folder.icon}
              </HorizontalAccordion.BladeIcon>
              <HorizontalAccordion.BladeLabel>
                {folder.label}
              </HorizontalAccordion.BladeLabel>
            </HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>
              <div className="bg-background flex h-full flex-col justify-center gap-3 p-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-foreground text-lg font-semibold">
                    {folder.label}
                  </h3>
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                    {folder.count}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-6">
                  {folder.body}
                </p>
                <div>
                  <Button size="sm" variant="soft">
                    Open {folder.label.toLowerCase()}
                  </Button>
                </div>
              </div>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        ))}
      </HorizontalAccordion>
    </div>
  );
}
