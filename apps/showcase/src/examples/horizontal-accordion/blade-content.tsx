"use client";

import { Button, HorizontalAccordion, Link } from "@dethink/components";

function TypeIcon() {
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
      <path d="M5 7V5h14v2M12 5v14m-3 0h6" />
    </svg>
  );
}

function CompassIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="m14.8 9.2-1.9 4.7-3.7 1.9 1.9-4.7 3.7-1.9Z" />
    </svg>
  );
}

function SparklesIcon() {
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
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

function Panel({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <div className="flex h-full flex-col justify-center gap-3 bg-background p-8">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        {body}{" "}
        <Link href="#blade-content" variant="muted" underline="always">
          See the API
        </Link>
        .
      </p>
      <div>
        <Button size="sm" variant="outline">
          {cta}
        </Button>
      </div>
    </div>
  );
}

export function HorizontalAccordionBladeContent() {
  return (
    <HorizontalAccordion
      aria-label="Blade content mixes"
      className="rounded-lg border border-border"
      compactBreakpoint={480}
      defaultValue="rotated"
      height={320}
    >
      <HorizontalAccordion.Item value="rotated">
        <HorizontalAccordion.Blade>
          <HorizontalAccordion.BladeIcon>
            <TypeIcon />
          </HorizontalAccordion.BladeIcon>
          <HorizontalAccordion.BladeLabel>
            Rotated
          </HorizontalAccordion.BladeLabel>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <Panel
            body="The default label orientation rotates text to read bottom to top, with a supporting icon at the start of the blade."
            cta="Copy rotated recipe"
            title="Rotated label with icon"
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
            body="True vertical writing mode reading top to bottom keeps glyphs upright, which suits short wayfinding labels."
            cta="Copy vertical recipe"
            title="Vertical writing mode"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
      <HorizontalAccordion.Item value="icon-only">
        <HorizontalAccordion.Blade aria-label="Highlights">
          <HorizontalAccordion.BladeIcon>
            <SparklesIcon />
          </HorizontalAccordion.BladeIcon>
        </HorizontalAccordion.Blade>
        <HorizontalAccordion.Panel>
          <Panel
            body="Icon-only blades stay ultra compact and take an aria-label so assistive technology still announces a meaningful name."
            cta="Copy icon-only recipe"
            title="Icon-only blade"
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
            body="Icon plus label with the icon anchored to the end of the blade axis via iconPosition."
            cta="Copy mixed recipe"
            title="Icon anchored to the end"
          />
        </HorizontalAccordion.Panel>
      </HorizontalAccordion.Item>
    </HorizontalAccordion>
  );
}
