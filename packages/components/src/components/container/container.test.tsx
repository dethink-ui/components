import { createRef, forwardRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Container,
  containerClassNames,
  type ContainerAlign,
  type ContainerElement,
  type ContainerGutter,
  type ContainerSize,
} from ".";

const elements: ContainerElement[] = [
  "div",
  "main",
  "section",
  "article",
  "header",
  "footer",
  "aside",
  "nav",
];
const sizes: ContainerSize[] = ["sm", "md", "lg", "xl", "2xl", "full"];
const gutters: ContainerGutter[] = ["none", "sm", "md", "lg", "xl"];
const alignments: ContainerAlign[] = ["start", "center", "end"];

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-[40rem]",
  md: "max-w-[48rem]",
  lg: "max-w-[64rem]",
  xl: "max-w-[80rem]",
  "2xl": "max-w-[96rem]",
  full: "max-w-none",
};

const gutterClasses: Record<ContainerGutter, string[]> = {
  none: ["[--container-gutter:var(--dt-space-0)]", "px-[var(--dt-space-0)]"],
  sm: [
    "[--container-gutter:var(--dt-space-3)]",
    "sm:[--container-gutter:var(--dt-space-4)]",
    "px-[var(--container-gutter)]",
  ],
  md: [
    "[--container-gutter:var(--dt-space-4)]",
    "sm:[--container-gutter:var(--dt-space-6)]",
    "px-[var(--container-gutter)]",
  ],
  lg: [
    "[--container-gutter:var(--dt-space-5)]",
    "sm:[--container-gutter:var(--dt-space-8)]",
    "px-[var(--container-gutter)]",
  ],
  xl: [
    "[--container-gutter:var(--dt-space-6)]",
    "sm:[--container-gutter:var(--dt-space-10)]",
    "px-[var(--container-gutter)]",
  ],
};

const alignClasses: Record<ContainerAlign, string> = {
  start: "me-auto",
  center: "mx-auto",
  end: "ms-auto",
};

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterAnchor.displayName = "RouterAnchor";

describe("Container", () => {
  it("renders a neutral centered container with safe defaults", () => {
    render(<Container>Content</Container>);

    const container = screen.getByText("Content");

    expect(container.tagName).toBe("DIV");
    expect(container).toHaveAttribute("data-slot", "container");
    expect(container).toHaveAttribute("data-element", "div");
    expect(container).toHaveAttribute("data-size", "xl");
    expect(container).toHaveAttribute("data-gutter", "md");
    expect(container).toHaveAttribute("data-align", "center");
    expect(container).toHaveAttribute("data-fluid", "false");
    expect(container).toHaveAttribute("data-safe-area", "false");
    expect(container).toHaveClass(
      "box-border",
      "w-full",
      "min-w-0",
      "max-w-[80rem]",
      "mx-auto",
    );
  });

  it.each(elements)("renders a semantic %s element", (as) => {
    render(<Container as={as}>Semantic {as}</Container>);

    expect(screen.getByText(`Semantic ${as}`).tagName).toBe(as.toUpperCase());
  });

  it.each(sizes)("applies %s size data and max-width class", (size) => {
    render(<Container size={size}>size {size}</Container>);

    const container = screen.getByText(`size ${size}`);

    expect(container).toHaveAttribute("data-size", size);
    expect(container).toHaveClass(sizeClasses[size]);
  });

  it.each(gutters)("applies %s gutter data and classes", (gutter) => {
    render(<Container gutter={gutter}>gutter {gutter}</Container>);

    const container = screen.getByText(`gutter ${gutter}`);

    expect(container).toHaveAttribute("data-gutter", gutter);
    for (const className of gutterClasses[gutter]) {
      expect(container.className).toContain(className);
    }
  });

  it("uses max-width none when fluid", () => {
    render(
      <Container fluid size="sm">
        Fluid
      </Container>,
    );

    const container = screen.getByText("Fluid");

    expect(container).toHaveAttribute("data-fluid", "true");
    expect(container).toHaveAttribute("data-size", "sm");
    expect(container).toHaveClass("max-w-none");
    expect(container).not.toHaveClass("max-w-[40rem]");
  });

  it.each(alignments)("applies %s inline alignment", (align) => {
    render(<Container align={align}>align {align}</Container>);

    const container = screen.getByText(`align ${align}`);

    expect(container).toHaveAttribute("data-align", align);
    expect(container).toHaveClass(alignClasses[align]);
  });

  it("uses safe-area padding classes without dropping the gutter variable", () => {
    const className = containerClassNames({ gutter: "lg", safeArea: true });

    expect(className).toContain("[--container-gutter:var(--dt-space-5)]");
    expect(className).toContain("sm:[--container-gutter:var(--dt-space-8)]");
    expect(className).toContain(
      "pl-[max(var(--container-gutter),env(safe-area-inset-left))]",
    );
    expect(className).toContain(
      "pr-[max(var(--container-gutter),env(safe-area-inset-right))]",
    );
    expect(className).not.toContain("px-[var(--container-gutter)]");
  });

  it("composes consumer classes after baseline classes", () => {
    expect(containerClassNames({ className: "custom-container" })).toContain(
      "custom-container",
    );
  });

  it("rejects unsupported token values at the TypeScript boundary", () => {
    const valid = <Container align="center" gutter="md" size="xl" />;
    // @ts-expect-error Container sizes use constrained token values.
    const invalidSize = <Container size="3xl" />;
    // @ts-expect-error Container gutters use constrained token values.
    const invalidGutter = <Container gutter="2" />;
    // @ts-expect-error Container alignment uses constrained token values.
    const invalidAlign = <Container align="middle" />;
    // @ts-expect-error Container does not support arbitrary elements.
    const invalidElement = <Container as="span" />;
    // @ts-expect-error Container does not expose arbitrary CSS prop parsing.
    const invalidStyleProp = <Container backgroundColor="red" />;

    expect(valid).toBeTruthy();
    expect(invalidSize).toBeTruthy();
    expect(invalidGutter).toBeTruthy();
    expect(invalidAlign).toBeTruthy();
    expect(invalidElement).toBeTruthy();
    expect(invalidStyleProp).toBeTruthy();
  });

  it("forwards refs to the native element", () => {
    const ref = createRef<HTMLElement>();

    render(
      <Container ref={ref} as="main">
        Ref container
      </Container>,
    );

    expect(ref.current?.tagName).toBe("MAIN");
  });

  it("composes classes, refs, events, and data attributes onto a child element", async () => {
    const user = userEvent.setup();
    const containerRef = createRef<HTMLElement>();
    const containerClick = vi.fn();
    const childRef = createRef<HTMLAnchorElement>();
    const childClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Container
        ref={containerRef}
        asChild
        data-testid="container-link"
        onClick={containerClick}
        size="lg"
        gutter="sm"
      >
        <RouterAnchor
          ref={childRef}
          className="custom-child"
          onClick={childClick}
          to="/docs"
        >
          Container child
        </RouterAnchor>
      </Container>,
    );

    const link = screen.getByRole("link", { name: "Container child" });

    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-slot", "container");
    expect(link).toHaveAttribute("data-as-child", "true");
    expect(link).toHaveAttribute("data-size", "lg");
    expect(link).toHaveAttribute("data-gutter", "sm");
    expect(link).toHaveAttribute("data-testid", "container-link");
    expect(link.className).toContain("custom-child");
    expect(containerRef.current).toBe(link);
    expect(childRef.current).toBe(link);

    await user.click(link);

    expect(containerClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("composes matching asChild event handlers beyond click", async () => {
    const user = userEvent.setup();
    const containerFocus = vi.fn();
    const childFocus = vi.fn();

    render(
      <Container asChild onFocus={containerFocus}>
        <button onFocus={childFocus} type="button">
          Focus container child
        </button>
      </Container>,
    );

    await user.tab();

    expect(
      screen.getByRole("button", { name: "Focus container child" }),
    ).toHaveFocus();
    expect(containerFocus).toHaveBeenCalledTimes(1);
    expect(childFocus).toHaveBeenCalledTimes(1);
  });
});
