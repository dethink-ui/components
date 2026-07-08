import { createRef, forwardRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Stack,
  stackClassNames,
  type StackAlign,
  type StackDirection,
  type StackElement,
  type StackGap,
  type StackJustify,
  type StackWrap,
} from ".";

const elements: StackElement[] = [
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
  "form",
  "fieldset",
  "span",
];
const directions: StackDirection[] = ["vertical", "horizontal"];
const directionClasses: Record<StackDirection, string> = {
  vertical: "flex-col",
  horizontal: "flex-row",
};
const gaps: StackGap[] = [
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
const aligns: StackAlign[] = ["stretch", "start", "center", "end", "baseline"];
const alignClasses: Record<StackAlign, string> = {
  stretch: "items-stretch",
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
};
const justifies: StackJustify[] = ["start", "center", "end", "between"];
const justifyClasses: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};
const wraps: StackWrap[] = ["nowrap", "wrap"];
const wrapClasses: Record<StackWrap, string> = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
};

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterAnchor.displayName = "RouterAnchor";

function gapClass(gap: StackGap) {
  return `gap-[var(--dt-space-${gap === "none" ? "0" : gap})]`;
}

describe("Stack", () => {
  it("renders a neutral div with safe defaults", () => {
    render(
      <Stack>
        <span>Stack content</span>
      </Stack>,
    );

    const stack = screen.getByText("Stack content").parentElement;

    expect(stack?.tagName).toBe("DIV");
    expect(stack).toHaveAttribute("data-slot", "stack");
    expect(stack).toHaveAttribute("data-element", "div");
    expect(stack).toHaveAttribute("data-direction", "vertical");
    expect(stack).toHaveAttribute("data-gap", "4");
    expect(stack).toHaveAttribute("data-align", "stretch");
    expect(stack).toHaveAttribute("data-justify", "start");
    expect(stack).toHaveAttribute("data-wrap", "nowrap");
    expect(stack).toHaveClass(
      "flex",
      "flex-col",
      "gap-[var(--dt-space-4)]",
      "items-stretch",
    );
  });

  it.each(elements)("renders a semantic %s element", (as) => {
    render(<Stack as={as}>Semantic {as}</Stack>);

    expect(screen.getByText(`Semantic ${as}`).tagName).toBe(as.toUpperCase());
  });

  it.each(directions)("applies %s direction data and class", (direction) => {
    render(<Stack direction={direction}>{direction}</Stack>);

    const stack = screen.getByText(direction);

    expect(stack).toHaveAttribute("data-direction", direction);
    expect(stack).toHaveClass(directionClasses[direction]);
  });

  it.each(gaps)("applies %s gap token data and class", (gap) => {
    render(<Stack gap={gap}>gap {gap}</Stack>);

    const stack = screen.getByText(`gap ${gap}`);

    expect(stack).toHaveAttribute("data-gap", gap);
    expect(stack).toHaveClass(gapClass(gap));
  });

  it.each(aligns)("applies %s alignment data and class", (align) => {
    render(<Stack align={align}>{align}</Stack>);

    const stack = screen.getByText(align);

    expect(stack).toHaveAttribute("data-align", align);
    expect(stack).toHaveClass(alignClasses[align]);
  });

  it.each(justifies)("applies %s justification data and class", (justify) => {
    render(<Stack justify={justify}>{justify}</Stack>);

    const stack = screen.getByText(justify);

    expect(stack).toHaveAttribute("data-justify", justify);
    expect(stack).toHaveClass(justifyClasses[justify]);
  });

  it.each(wraps)("applies %s wrap data and class", (wrap) => {
    render(<Stack wrap={wrap}>wrap {wrap}</Stack>);

    const stack = screen.getByText(`wrap ${wrap}`);

    expect(stack).toHaveAttribute("data-wrap", wrap);
    expect(stack).toHaveClass(wrapClasses[wrap]);
  });

  it("composes consumer classes after baseline classes", () => {
    expect(stackClassNames({ className: "custom-stack" })).toContain(
      "custom-stack",
    );
  });

  it("uses flexbox, gap, alignment, justification, and wrap utilities", () => {
    const className = stackClassNames({
      align: "center",
      direction: "horizontal",
      gap: "6",
      justify: "between",
      wrap: "wrap",
    });

    expect(className).toContain("flex");
    expect(className).toContain("flex-row");
    expect(className).toContain("gap-[var(--dt-space-6)]");
    expect(className).toContain("items-center");
    expect(className).toContain("justify-between");
    expect(className).toContain("flex-wrap");
  });

  it("rejects unsupported token values at the TypeScript boundary", () => {
    const valid = <Stack gap="4" align="center" />;
    const validForm = (
      <Stack as="form" action="/search" method="get" noValidate />
    );
    const validFieldset = <Stack as="fieldset" disabled />;
    // @ts-expect-error Stack gaps use constrained token values.
    const invalidGap = <Stack gap="7" />;
    // @ts-expect-error Stack does not expose reverse direction.
    const invalidDirection = <Stack direction="vertical-reverse" />;
    // @ts-expect-error Stack does not expose arbitrary CSS prop parsing.
    const invalidStyleProp = <Stack backgroundColor="red" />;

    expect(valid).toBeTruthy();
    expect(validForm).toBeTruthy();
    expect(validFieldset).toBeTruthy();
    expect(invalidGap).toBeTruthy();
    expect(invalidDirection).toBeTruthy();
    expect(invalidStyleProp).toBeTruthy();
  });

  it("forwards refs to the native element", () => {
    const ref = createRef<HTMLElement>();

    render(
      <Stack ref={ref} as="section">
        Ref stack
      </Stack>,
    );

    expect(ref.current?.tagName).toBe("SECTION");
  });

  it("composes classes, refs, events, and data attributes onto a child element", async () => {
    const user = userEvent.setup();
    const stackClick = vi.fn();
    const childClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Stack
        asChild
        onClick={stackClick}
        direction="horizontal"
        gap="3"
        wrap="wrap"
      >
        <RouterAnchor className="custom-child" onClick={childClick} to="/docs">
          Stack child
        </RouterAnchor>
      </Stack>,
    );

    const link = screen.getByRole("link", { name: "Stack child" });

    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-slot", "stack");
    expect(link).toHaveAttribute("data-as-child", "true");
    expect(link).toHaveAttribute("data-direction", "horizontal");
    expect(link).toHaveAttribute("data-gap", "3");
    expect(link).toHaveAttribute("data-wrap", "wrap");
    expect(link.className).toContain("custom-child");

    await user.click(link);

    expect(stackClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("composes matching asChild event handlers beyond click", async () => {
    const user = userEvent.setup();
    const stackFocus = vi.fn();
    const childFocus = vi.fn();

    render(
      <Stack asChild onFocus={stackFocus}>
        <button onFocus={childFocus} type="button">
          Focus child
        </button>
      </Stack>,
    );

    await user.tab();

    expect(screen.getByRole("button", { name: "Focus child" })).toHaveFocus();
    expect(stackFocus).toHaveBeenCalledTimes(1);
    expect(childFocus).toHaveBeenCalledTimes(1);
  });

  it("keeps child DOM order unchanged", () => {
    render(
      <Stack>
        <button type="button">First</button>
        <button type="button">Second</button>
        <button type="button">Third</button>
      </Stack>,
    );

    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["First", "Second", "Third"]);
  });
});
