"use client";

import { HorizontalAccordion } from "@dethink/components";

function CompassIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m14.8 9.2-1.9 4.7-3.7 1.9 1.9-4.7 3.7-1.9Z" />
    </svg>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 bg-background p-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function HorizontalAccordionBladeContent() {
  return (
    <HorizontalAccordion
      aria-label="Blade content mixes"
      className="rounded-lg border border-border"
      defaultValue="rotated"
      height={300}
    >
      <HorizontalAccordion.Item value="rotated">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeLabel>
            Rotated
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <Panel
            body="The default label orientation rotates text to read bottom to top."
            title="Rotated label"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="vertical">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeLabel
            direction="top-to-bottom"
            orientation="vertical"
          >
            Vertical
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <Panel
            body="True vertical writing mode reading top to bottom."
            title="Vertical label"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="icon-only">
        <HorizontalAccordion.Blade aria-label="Icon only">
          <HorizontalAccordion.BladeIcon>
            <CompassIcon />
          </HorizontalAccordion.BladeIcon>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <Panel
            body="Icon-only blades take an aria-label for their accessible name."
            title="Icon only"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="mixed">
        <HorizontalAccordion.Blade iconPosition="end">
          <HorizontalAccordion.BladeIcon>
            <CompassIcon />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel>
            Icon end
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <Panel
            body="Icon plus label with the icon anchored to the end of the blade."
            title="Mixed blade"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
    </HorizontalAccordion>
  );
}
