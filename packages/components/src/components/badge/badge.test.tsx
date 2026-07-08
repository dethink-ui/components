import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Badge,
  badgeClassNames,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant,
} from ".";

const variants: BadgeVariant[] = ["solid", "soft", "outline", "subtle"];
const tones: BadgeTone[] = [
  "neutral",
  "primary",
  "success",
  "warning",
  "destructive",
  "info",
];
const sizes: BadgeSize[] = ["xs", "sm", "md", "lg"];

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="m4 8 2.5 2.5L12 5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 3v5l3 2" />
    </svg>
  );
}

describe("Badge", () => {
  it("renders a non-interactive inline primitive with safe defaults", () => {
    render(<Badge data-testid="badge">Queued</Badge>);

    const badge = screen.getByTestId("badge");

    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveTextContent("Queued");
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge).toHaveAttribute("data-tone", "neutral");
    expect(badge).toHaveAttribute("data-variant", "soft");
    expect(badge).toHaveAttribute("data-size", "md");
    expect(badge).not.toHaveAttribute("role");
    expect(badge).not.toHaveAttribute("tabindex");
  });

  it.each(variants)("renders the %s variant attribute", (variant) => {
    render(<Badge variant={variant}>Variant</Badge>);

    expect(screen.getByText("Variant")).toHaveAttribute(
      "data-variant",
      variant,
    );
  });

  it.each(tones)("renders the %s tone attribute", (tone) => {
    render(<Badge tone={tone}>Tone</Badge>);

    expect(screen.getByText("Tone")).toHaveAttribute("data-tone", tone);
  });

  it.each(sizes)("renders the %s size attribute", (size) => {
    render(<Badge size={size}>Size</Badge>);

    expect(screen.getByText("Size")).toHaveAttribute("data-size", size);
  });

  it("merges consumer classes and native span attributes", () => {
    render(
      <Badge
        className="custom-badge"
        id="release-status"
        title="Release status"
      >
        Ready
      </Badge>,
    );

    const badge = screen.getByText("Ready");

    expect(badge).toHaveAttribute("id", "release-status");
    expect(badge).toHaveAttribute("title", "Release status");
    expect(badge).toHaveClass("custom-badge");
    expect(badgeClassNames({ className: "custom-badge" })).toContain(
      "custom-badge",
    );
  });

  it("forwards refs to the root span", () => {
    const ref = createRef<HTMLSpanElement>();

    render(<Badge ref={ref}>Ref target</Badge>);

    expect(ref.current).toBe(screen.getByText("Ref target"));
  });

  it("renders decorative icon slots without changing visible status text", () => {
    render(
      <div>
        <Badge icon={<CheckIcon />} tone="success">
          Synced
        </Badge>
        <Badge icon={<ClockIcon />} iconPlacement="trailing" tone="warning">
          Pending review
        </Badge>
        <Badge
          leadingIcon={<CheckIcon />}
          trailingIcon={<ClockIcon />}
          tone="info"
        >
          Two icons
        </Badge>
      </div>,
    );

    const synced = screen.getByText("Synced");
    const pending = screen.getByText("Pending review");
    const twoIcons = screen.getByText("Two icons");

    expect(synced).toHaveAttribute("data-icon-placement", "leading");
    expect(
      synced.querySelector('[data-slot="badge-leading-icon"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(pending).toHaveAttribute("data-icon-placement", "trailing");
    expect(
      pending.querySelector('[data-slot="badge-trailing-icon"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(
      twoIcons.querySelector('[data-slot="badge-leading-icon"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(
      twoIcons.querySelector('[data-slot="badge-trailing-icon"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes tokenized density, contrast, and static tone classes", () => {
    const className = badgeClassNames({
      size: "sm",
      tone: "success",
      variant: "solid",
    });

    expect(className).toContain("[--badge-min-height:");
    expect(className).toContain("var(--dt-density-control)");
    expect(className).toContain("contrast-more:border-current");
    expect(className).toContain("bg-success");
    expect(className).toContain("text-success-foreground");
  });

  it("rejects unsupported public values at the TypeScript boundary", () => {
    const valid = (
      <Badge icon={<CheckIcon />} iconPlacement="trailing" size="xs">
        Active
      </Badge>
    );
    // @ts-expect-error Badge variants use constrained token values.
    const invalidVariant = <Badge variant="ghost">Ghost</Badge>;
    // @ts-expect-error Badge tones use constrained semantic token values.
    const invalidTone = <Badge tone="brand">Brand</Badge>;
    // @ts-expect-error Badge sizes use constrained density-friendly values.
    const invalidSize = <Badge size="xl">Large</Badge>;
    // @ts-expect-error Badge icon placement is intentionally constrained.
    const invalidIconPlacement = <Badge iconPlacement="start">Start</Badge>;

    expect(valid).toBeTruthy();
    expect(invalidVariant).toBeTruthy();
    expect(invalidTone).toBeTruthy();
    expect(invalidSize).toBeTruthy();
    expect(invalidIconPlacement).toBeTruthy();
  });
});
