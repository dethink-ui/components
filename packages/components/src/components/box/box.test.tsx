import { createRef, forwardRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Box,
  boxClassNames,
  type BoxBorder,
  type BoxDisplay,
  type BoxElement,
  type BoxOverflow,
  type BoxRadius,
  type BoxSpacing,
  type BoxSurface,
} from ".";

const elements: BoxElement[] = [
  "div",
  "section",
  "article",
  "main",
  "aside",
  "nav",
  "header",
  "footer",
  "ul",
  "ol",
  "li",
  "span",
];
const displays: BoxDisplay[] = [
  "block",
  "inline",
  "inline-block",
  "contents",
  "flex",
  "inline-flex",
  "grid",
];
const displayClasses: Record<BoxDisplay, string> = {
  block: "block",
  inline: "inline",
  "inline-block": "inline-block",
  contents: "contents",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
};
const spacings: BoxSpacing[] = [
  "none",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
];
const surfaces: BoxSurface[] = [
  "transparent",
  "background",
  "muted",
  "primary",
  "destructive",
  "success",
  "warning",
  "info",
];
const borders: BoxBorder[] = [
  "none",
  "default",
  "muted",
  "input",
  "primary",
  "destructive",
  "success",
  "warning",
  "info",
];
const radii: BoxRadius[] = ["none", "sm", "md", "lg", "full"];
const overflows: BoxOverflow[] = ["visible", "hidden", "clip", "auto"];

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterAnchor.displayName = "RouterAnchor";

function spacingClass(prefix: string, spacing: BoxSpacing) {
  return `${prefix}-[var(--dt-space-${spacing === "none" ? "0" : spacing})]`;
}

describe("Box", () => {
  it("renders a neutral div with safe defaults", () => {
    render(<Box>Panel</Box>);

    const box = screen.getByText("Panel");

    expect(box.tagName).toBe("DIV");
    expect(box).toHaveAttribute("data-slot", "box");
    expect(box).toHaveAttribute("data-element", "div");
    expect(box).toHaveAttribute("data-surface", "transparent");
    expect(box).toHaveAttribute("data-border", "none");
    expect(box).toHaveAttribute("data-radius", "none");
  });

  it.each(elements)("renders a semantic %s element", (as) => {
    render(<Box as={as}>Semantic {as}</Box>);

    expect(screen.getByText(`Semantic ${as}`).tagName).toBe(as.toUpperCase());
  });

  it.each(displays)("applies %s display data and class", (display) => {
    render(<Box display={display}>{display}</Box>);

    const box = screen.getByText(display);

    expect(box).toHaveAttribute("data-display", display);
    expect(box).toHaveClass(displayClasses[display]);
  });

  it.each(spacings)("applies %s spacing token data", (spacing) => {
    render(
      <Box
        gap={spacing}
        m={spacing}
        mb={spacing}
        me={spacing}
        ms={spacing}
        mt={spacing}
        mx={spacing}
        my={spacing}
        p={spacing}
        pb={spacing}
        pe={spacing}
        ps={spacing}
        pt={spacing}
        px={spacing}
        py={spacing}
      >
        spacing {spacing}
      </Box>,
    );

    const box = screen.getByText(`spacing ${spacing}`);

    expect(box).toHaveAttribute("data-p", spacing);
    expect(box).toHaveAttribute("data-px", spacing);
    expect(box).toHaveAttribute("data-py", spacing);
    expect(box).toHaveAttribute("data-ps", spacing);
    expect(box).toHaveAttribute("data-pe", spacing);
    expect(box).toHaveAttribute("data-m", spacing);
    expect(box).toHaveAttribute("data-mx", spacing);
    expect(box).toHaveAttribute("data-my", spacing);
    expect(box).toHaveAttribute("data-ms", spacing);
    expect(box).toHaveAttribute("data-me", spacing);
    expect(box).toHaveAttribute("data-gap", spacing);
    expect(box).toHaveClass(spacingClass("p", spacing));
    expect(box).toHaveClass(spacingClass("px", spacing));
    expect(box).toHaveClass(spacingClass("py", spacing));
    expect(box).toHaveClass(spacingClass("ps", spacing));
    expect(box).toHaveClass(spacingClass("pe", spacing));
    expect(box).toHaveClass(spacingClass("pt", spacing));
    expect(box).toHaveClass(spacingClass("pb", spacing));
    expect(box).toHaveClass(spacingClass("m", spacing));
    expect(box).toHaveClass(spacingClass("mx", spacing));
    expect(box).toHaveClass(spacingClass("my", spacing));
    expect(box).toHaveClass(spacingClass("ms", spacing));
    expect(box).toHaveClass(spacingClass("me", spacing));
    expect(box).toHaveClass(spacingClass("mt", spacing));
    expect(box).toHaveClass(spacingClass("mb", spacing));
    expect(box).toHaveClass(spacingClass("gap", spacing));
  });

  it("uses logical spacing utilities for start and end", () => {
    const className = boxClassNames({ me: "4", ps: "3" });

    expect(className).toContain("ps-[var(--dt-space-3)]");
    expect(className).toContain("me-[var(--dt-space-4)]");
  });

  it.each(surfaces)("applies the %s surface", (surface) => {
    render(<Box surface={surface}>{surface}</Box>);

    expect(screen.getByText(surface)).toHaveAttribute("data-surface", surface);
  });

  it.each(borders)("applies the %s border", (border) => {
    render(<Box border={border}>{border}</Box>);

    expect(screen.getByText(border)).toHaveAttribute("data-border", border);
  });

  it.each(radii)("applies the %s radius", (radius) => {
    render(<Box radius={radius}>{radius}</Box>);

    expect(screen.getByText(radius)).toHaveAttribute("data-radius", radius);
  });

  it.each(overflows)("applies the %s overflow mode", (overflow) => {
    render(<Box overflow={overflow}>{overflow}</Box>);

    expect(screen.getByText(overflow)).toHaveAttribute(
      "data-overflow",
      overflow,
    );
  });

  it("composes consumer classes after baseline classes", () => {
    expect(boxClassNames({ className: "custom-wrapper" })).toContain(
      "custom-wrapper",
    );
  });

  it("uses tokenized surface, border, radius, and overflow classes", () => {
    const className = boxClassNames({
      border: "input",
      overflow: "clip",
      radius: "md",
      surface: "muted",
    });

    expect(className).toContain("bg-muted");
    expect(className).toContain("border-input");
    expect(className).toContain("rounded-md");
    expect(className).toContain("overflow-clip");
  });

  it("rejects unsupported token values at the TypeScript boundary", () => {
    const valid = <Box p="4" radius="md" />;
    // @ts-expect-error Box spacing uses constrained token values.
    const invalidSpacing = <Box p="7" />;
    // @ts-expect-error Box does not expose arbitrary CSS prop parsing.
    const invalidStyleProp = <Box backgroundColor="red" />;

    expect(valid).toBeTruthy();
    expect(invalidSpacing).toBeTruthy();
    expect(invalidStyleProp).toBeTruthy();
  });

  it("forwards refs to the native element", () => {
    const ref = createRef<HTMLElement>();

    render(
      <Box ref={ref} as="section">
        Ref box
      </Box>,
    );

    expect(ref.current?.tagName).toBe("SECTION");
  });

  it("composes classes, refs, events, and data attributes onto a child element", async () => {
    const user = userEvent.setup();
    const boxClick = vi.fn();
    const childClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Box asChild onClick={boxClick} p="3" radius="md" surface="muted">
        <RouterAnchor className="custom-child" onClick={childClick} to="/docs">
          Box child
        </RouterAnchor>
      </Box>,
    );

    const link = screen.getByRole("link", { name: "Box child" });

    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-slot", "box");
    expect(link).toHaveAttribute("data-as-child", "true");
    expect(link).toHaveAttribute("data-p", "3");
    expect(link).toHaveAttribute("data-radius", "md");
    expect(link).toHaveAttribute("data-surface", "muted");
    expect(link.className).toContain("custom-child");

    await user.click(link);

    expect(boxClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("composes matching asChild event handlers beyond click", async () => {
    const user = userEvent.setup();
    const boxFocus = vi.fn();
    const childFocus = vi.fn();

    render(
      <Box asChild onFocus={boxFocus}>
        <button onFocus={childFocus} type="button">
          Focus child
        </button>
      </Box>,
    );

    await user.tab();

    expect(screen.getByRole("button", { name: "Focus child" })).toHaveFocus();
    expect(boxFocus).toHaveBeenCalledTimes(1);
    expect(childFocus).toHaveBeenCalledTimes(1);
  });
});
