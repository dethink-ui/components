import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Avatar,
  avatarClassNames,
  getAvatarInitials,
  type AvatarMotion,
  type AvatarProps,
  type AvatarRing,
  type AvatarShape,
  type AvatarSize,
  type AvatarTone,
} from ".";

const sizes: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const shapes: AvatarShape[] = ["circle", "rounded", "square"];
const tones: AvatarTone[] = [
  "neutral",
  "primary",
  "success",
  "warning",
  "destructive",
  "info",
];
const rings: AvatarRing[] = ["none", "border", "ring"];
const motions: AvatarMotion[] = ["none", "subtle", "standard"];

function TeamIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M6.5 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM11.5 8a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM2.5 13a4 4 0 0 1 8 0M9.5 13a3 3 0 0 1 4-2.83" />
    </svg>
  );
}

describe("getAvatarInitials", () => {
  it("generates deterministic initials for common whitespace and punctuation cases", () => {
    expect(getAvatarInitials("  Ada Lovelace  ")).toBe("AL");
    expect(getAvatarInitials("Grace Brewster Hopper")).toBe("GH");
    expect(getAvatarInitials("Grace Brewster Hopper", 3)).toBe("GBH");
    expect(getAvatarInitials("Mary-Jane O'Connor")).toBe("MO");
    expect(getAvatarInitials("platform")).toBe("PL");
    expect(getAvatarInitials("!!!")).toBe("");
    expect(getAvatarInitials("No Initials", 0)).toBe("");
  });
});

describe("Avatar", () => {
  it("renders a named fallback avatar with generated initials and stable defaults", () => {
    render(<Avatar data-testid="avatar" name="Parvesh Malhotra" />);

    const avatar = screen.getByRole("img", { name: "Parvesh Malhotra" });

    expect(avatar).toBe(screen.getByTestId("avatar"));
    expect(avatar.tagName).toBe("SPAN");
    expect(avatar).toHaveAttribute("data-slot", "avatar");
    expect(avatar).toHaveAttribute("data-size", "md");
    expect(avatar).toHaveAttribute("data-shape", "circle");
    expect(avatar).toHaveAttribute("data-tone", "neutral");
    expect(avatar).toHaveAttribute("data-ring", "none");
    expect(avatar).toHaveAttribute("data-motion", "standard");
    expect(avatar).toHaveAttribute("data-motion-behavior", "transform-opacity");
    expect(avatar).toHaveAttribute("data-motion-state", "idle");
    expect(avatar).toHaveAttribute("data-state", "fallback");
    expect(avatar).toHaveTextContent("PM");
    expect(
      avatar.querySelector('[data-slot="avatar-fallback"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(avatar.querySelector('[data-slot="avatar-image"]')).toBeNull();
  });

  it("renders native image attributes and uses the image alt as the accessible name", () => {
    render(
      <Avatar
        alt="Customer success lead"
        crossOrigin="anonymous"
        data-testid="avatar"
        decoding="async"
        fetchPriority="low"
        imageProps={{ draggable: false }}
        loading="lazy"
        name="Ada Lovelace"
        referrerPolicy="no-referrer"
        sizes="40px"
        src="/avatars/ada.png"
        srcSet="/avatars/ada-2x.png 2x"
      />,
    );

    const image = screen.getByRole("img", { name: "Customer success lead" });
    const avatar = screen.getByTestId("avatar");

    expect(image).toHaveAttribute("data-slot", "avatar-image");
    expect(image).toHaveAttribute("alt", "Customer success lead");
    expect(image).toHaveAttribute("crossorigin", "anonymous");
    expect(image).toHaveAttribute("decoding", "async");
    expect(image).toHaveAttribute("draggable", "false");
    expect(image).toHaveAttribute("fetchpriority", "low");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(image).toHaveAttribute("sizes", "40px");
    expect(image).toHaveAttribute("src", "/avatars/ada.png");
    expect(image).toHaveAttribute("srcset", "/avatars/ada-2x.png 2x");
    expect(avatar).toHaveAttribute("data-state", "image");
    expect(avatar).not.toHaveAttribute("role");
    expect(avatar).not.toHaveAttribute("aria-label");
  });

  it("uses decorative image and fallback semantics for adjacent visible names", () => {
    render(
      <div>
        <Avatar
          alt=""
          data-testid="empty-alt-avatar"
          name="Ada Lovelace"
          src="/avatars/ada.png"
        />
        <span>Ada Lovelace</span>
        <Avatar
          data-testid="decorative-fallback"
          decorative
          initials="ML"
          name="Model Lab"
        />
        <span>Model Lab</span>
      </div>,
    );

    const emptyAltAvatar = screen.getByTestId("empty-alt-avatar");
    const decorativeFallback = screen.getByTestId("decorative-fallback");

    expect(emptyAltAvatar).toHaveAttribute("aria-hidden", "true");
    expect(
      emptyAltAvatar.querySelector('[data-slot="avatar-image"]'),
    ).toHaveAttribute("alt", "");
    expect(decorativeFallback).toHaveAttribute("aria-hidden", "true");
    expect(decorativeFallback).not.toHaveAttribute("role");
    expect(screen.getAllByText("Ada Lovelace")).toHaveLength(1);
    expect(screen.getAllByText("Model Lab")).toHaveLength(1);
  });

  it("switches failed images to a named fallback without changing root sizing", () => {
    const onImageError = vi.fn();

    render(
      <Avatar
        data-testid="avatar"
        name="Grace Hopper"
        onImageError={onImageError}
        src="/avatars/missing.png"
      />,
    );

    const image = screen.getByRole("img", { name: "Grace Hopper" });
    const avatar = screen.getByTestId("avatar");
    const classNameBefore = avatar.className;

    fireEvent.error(image);

    expect(onImageError).toHaveBeenCalledTimes(1);
    expect(avatar).toHaveAttribute("data-state", "failed");
    expect(avatar).toHaveAttribute("role", "img");
    expect(avatar).toHaveAttribute("aria-label", "Grace Hopper");
    expect(avatar).toHaveTextContent("GH");
    expect(avatar.querySelector('[data-slot="avatar-image"]')).toBeNull();
    expect(avatar.className).toBe(classNameBefore);
  });

  it("uses explicit initials before icon fallback and normalizes the visible token", () => {
    render(
      <div>
        <Avatar data-testid="initials" initials="a i" name="AI assistant" />
        <Avatar
          data-testid="icon"
          fallbackIcon={<TeamIcon />}
          name="Platform team"
        />
      </div>,
    );

    const initials = screen.getByTestId("initials");
    const icon = screen.getByTestId("icon");

    expect(initials).toHaveTextContent("AI");
    expect(initials.querySelector('[data-slot="avatar-icon"]')).toBeNull();
    expect(icon.querySelector('[data-slot="avatar-icon"]')).toBeTruthy();
    expect(icon.querySelector('[data-slot="avatar-initials"]')).toBeNull();
    expect(icon).toHaveAccessibleName("Platform team");
  });

  it.each(sizes)("renders the %s size attribute", (size) => {
    render(<Avatar name={`${size} person`} size={size} />);

    expect(screen.getByRole("img", { name: `${size} person` })).toHaveAttribute(
      "data-size",
      size,
    );
  });

  it.each(shapes)("renders the %s shape attribute", (shape) => {
    render(<Avatar name={`${shape} person`} shape={shape} />);

    expect(
      screen.getByRole("img", { name: `${shape} person` }),
    ).toHaveAttribute("data-shape", shape);
  });

  it.each(tones)("renders the %s tone attribute", (tone) => {
    render(<Avatar name={`${tone} entity`} tone={tone} />);

    expect(screen.getByRole("img", { name: `${tone} entity` })).toHaveAttribute(
      "data-tone",
      tone,
    );
  });

  it.each(rings)("renders the %s ring attribute", (ring) => {
    render(<Avatar name={`${ring} entity`} ring={ring} />);

    expect(screen.getByRole("img", { name: `${ring} entity` })).toHaveAttribute(
      "data-ring",
      ring,
    );
  });

  it.each(motions)("renders the %s motion attribute", (motion) => {
    render(<Avatar motion={motion} name={`${motion} entity`} />);

    const avatar = screen.getByRole("img", { name: `${motion} entity` });

    expect(avatar).toHaveAttribute("data-motion", motion);

    if (motion === "none") {
      expect(avatar).toHaveAttribute("data-motion-behavior", "disabled");
      expect(avatar).toHaveAttribute("data-reduced-motion", "true");
    }
  });

  it("merges consumer classes and native span attributes", () => {
    render(
      <Avatar
        className="custom-avatar"
        id="current-user-avatar"
        name="Current user"
        title="Current user"
      />,
    );

    const avatar = screen.getByRole("img", { name: "Current user" });

    expect(avatar).toHaveAttribute("id", "current-user-avatar");
    expect(avatar).toHaveAttribute("title", "Current user");
    expect(avatar).toHaveClass("custom-avatar");
    expect(avatarClassNames({ className: "custom-avatar" })).toContain(
      "custom-avatar",
    );
  });

  it("forwards refs to the root span", () => {
    const ref = createRef<HTMLSpanElement>();

    render(<Avatar name="Ref target" ref={ref} />);

    expect(ref.current).toBe(screen.getByRole("img", { name: "Ref target" }));
  });

  it("exposes tokenized stable size, high-contrast, and identity transform classes", () => {
    const className = avatarClassNames({
      ring: "ring",
      shape: "rounded",
      size: "lg",
      tone: "success",
    });

    expect(className).toContain("[--avatar-size:");
    expect(className).toContain("size-[var(--avatar-size)]");
    expect(className).toContain("bg-success/10");
    expect(className).toContain("ring-ring/35");
    expect(className).toContain("contrast-more:bg-background");
    expect(className).toContain("[scale:1]");
    expect(className).toContain("[translate:0_0]");
  });

  it("rejects unsupported public values at the TypeScript boundary", () => {
    const valid = (
      <Avatar
        imageProps={{ draggable: false }}
        name="Valid user"
        ring="border"
        shape="rounded"
        size="sm"
        tone="info"
      />
    );
    const validProps = {
      initials: "PM",
      motion: "subtle",
      name: "Parvesh Malhotra",
    } satisfies AvatarProps;
    // @ts-expect-error Avatar sizes use constrained stable dimensions.
    const invalidSize = <Avatar size="3xl" />;
    // @ts-expect-error Avatar tones use constrained semantic token values.
    const invalidTone = <Avatar tone="brand" />;
    // @ts-expect-error Avatar shapes are intentionally constrained.
    const invalidShape = <Avatar shape="pill" />;
    // @ts-expect-error Avatar ring treatments are intentionally constrained.
    const invalidRing = <Avatar ring="outline" />;
    // @ts-expect-error Avatar motion presets are intentionally constrained.
    const invalidMotion = <Avatar motion="bounce" />;
    // @ts-expect-error Avatar does not render arbitrary children.
    const invalidChildren = <Avatar>PM</Avatar>;

    expect(valid).toBeTruthy();
    expect(validProps).toBeTruthy();
    expect(invalidSize).toBeTruthy();
    expect(invalidTone).toBeTruthy();
    expect(invalidShape).toBeTruthy();
    expect(invalidRing).toBeTruthy();
    expect(invalidMotion).toBeTruthy();
    expect(invalidChildren).toBeTruthy();
  });
});
