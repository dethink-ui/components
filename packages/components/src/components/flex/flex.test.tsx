import { createRef, forwardRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Flex,
  FlexItem,
  flexClassNames,
  flexItemClassNames,
  type FlexAlign,
  type FlexContent,
  type FlexDirection,
  type FlexDisplay,
  type FlexElement,
  type FlexGap,
  type FlexItemAlign,
  type FlexItemBasis,
  type FlexItemElement,
  type FlexItemGrow,
  type FlexItemMinInlineSize,
  type FlexItemShrink,
  type FlexJustify,
  type FlexWrap,
} from ".";

const elements: FlexElement[] = [
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
const itemElements: FlexItemElement[] = [
  "div",
  "span",
  "li",
  "section",
  "article",
  "aside",
];
const displays: FlexDisplay[] = ["flex", "inline-flex"];
const directions: FlexDirection[] = ["row", "column"];
const wraps: FlexWrap[] = ["nowrap", "wrap"];
const gaps: FlexGap[] = ["none", "1", "2", "3", "4", "5", "6", "8", "10", "12"];
const aligns: FlexAlign[] = ["stretch", "start", "center", "end", "baseline"];
const justifies: FlexJustify[] = [
  "start",
  "center",
  "end",
  "between",
  "around",
  "evenly",
];
const contents: FlexContent[] = [
  "start",
  "center",
  "end",
  "between",
  "around",
  "evenly",
  "stretch",
];
const itemGrows: FlexItemGrow[] = ["0", "1"];
const itemShrinks: FlexItemShrink[] = ["0", "1"];
const itemBases: FlexItemBasis[] = [
  "auto",
  "0",
  "full",
  "xs",
  "sm",
  "md",
  "lg",
];
const itemAligns: FlexItemAlign[] = [
  "auto",
  "stretch",
  "start",
  "center",
  "end",
  "baseline",
];
const itemMinInlineSizes: FlexItemMinInlineSize[] = ["auto", "0"];

const displayClasses: Record<FlexDisplay, string> = {
  flex: "flex",
  "inline-flex": "inline-flex",
};
const directionClasses: Record<FlexDirection, string> = {
  row: "flex-row",
  column: "flex-col",
};
const wrapClasses: Record<FlexWrap, string> = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
};
const alignClasses: Record<FlexAlign, string> = {
  stretch: "items-stretch",
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
};
const justifyClasses: Record<FlexJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};
const contentClasses: Record<FlexContent, string> = {
  start: "content-start",
  center: "content-center",
  end: "content-end",
  between: "content-between",
  around: "content-around",
  evenly: "content-evenly",
  stretch: "content-stretch",
};
const itemGrowClasses: Record<FlexItemGrow, string> = {
  0: "grow-0",
  1: "grow",
};
const itemShrinkClasses: Record<FlexItemShrink, string> = {
  0: "shrink-0",
  1: "shrink",
};
const itemBasisClasses: Record<FlexItemBasis, string> = {
  auto: "basis-auto",
  0: "basis-0",
  full: "basis-full",
  xs: "basis-32",
  sm: "basis-48",
  md: "basis-64",
  lg: "basis-80",
};
const itemAlignClasses: Record<FlexItemAlign, string> = {
  auto: "self-auto",
  stretch: "self-stretch",
  start: "self-start",
  center: "self-center",
  end: "self-end",
  baseline: "self-baseline",
};

const RouterAnchor = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} {...props}>
    {children}
  </a>
));
RouterAnchor.displayName = "RouterAnchor";

function gapClass(gap: FlexGap) {
  return `gap-[var(--dt-space-${gap === "none" ? "0" : gap})]`;
}

function rowGapClass(gap: FlexGap) {
  return `gap-y-[var(--dt-space-${gap === "none" ? "0" : gap})]`;
}

function columnGapClass(gap: FlexGap) {
  return `gap-x-[var(--dt-space-${gap === "none" ? "0" : gap})]`;
}

describe("Flex", () => {
  it("renders a neutral div with safe defaults", () => {
    render(
      <Flex>
        <span>Flex content</span>
      </Flex>,
    );

    const flex = screen.getByText("Flex content").parentElement;

    expect(flex?.tagName).toBe("DIV");
    expect(flex).toHaveAttribute("data-slot", "flex");
    expect(flex).toHaveAttribute("data-element", "div");
    expect(flex).toHaveAttribute("data-display", "flex");
    expect(flex).toHaveAttribute("data-direction", "row");
    expect(flex).toHaveAttribute("data-wrap", "nowrap");
    expect(flex).toHaveAttribute("data-gap", "none");
    expect(flex).toHaveAttribute("data-align", "stretch");
    expect(flex).toHaveAttribute("data-justify", "start");
    expect(flex).toHaveAttribute("data-content", "stretch");
    expect(flex).toHaveClass(
      "flex",
      "flex-row",
      "flex-nowrap",
      "gap-[var(--dt-space-0)]",
      "items-stretch",
    );
  });

  it.each(elements)("renders a semantic %s element", (as) => {
    render(<Flex as={as}>Semantic {as}</Flex>);

    expect(screen.getByText(`Semantic ${as}`).tagName).toBe(as.toUpperCase());
  });

  it.each(displays)("applies %s display data and class", (display) => {
    render(<Flex display={display}>{display}</Flex>);

    const flex = screen.getByText(display);

    expect(flex).toHaveAttribute("data-display", display);
    expect(flex).toHaveClass(displayClasses[display]);
  });

  it.each(directions)("applies %s direction data and class", (direction) => {
    render(<Flex direction={direction}>{direction}</Flex>);

    const flex = screen.getByText(direction);

    expect(flex).toHaveAttribute("data-direction", direction);
    expect(flex).toHaveClass(directionClasses[direction]);
  });

  it.each(wraps)("applies %s wrap data and class", (wrap) => {
    render(<Flex wrap={wrap}>wrap {wrap}</Flex>);

    const flex = screen.getByText(`wrap ${wrap}`);

    expect(flex).toHaveAttribute("data-wrap", wrap);
    expect(flex).toHaveClass(wrapClasses[wrap]);
  });

  it.each(gaps)("applies %s gap token data and class", (gap) => {
    render(<Flex gap={gap}>gap {gap}</Flex>);

    const flex = screen.getByText(`gap ${gap}`);

    expect(flex).toHaveAttribute("data-gap", gap);
    expect(flex).toHaveClass(gapClass(gap));
  });

  it.each(gaps)("applies %s row and column gap overrides", (gap) => {
    render(
      <Flex columnGap={gap} gap="4" rowGap={gap}>
        axis gap {gap}
      </Flex>,
    );

    const flex = screen.getByText(`axis gap ${gap}`);

    expect(flex).toHaveAttribute("data-row-gap", gap);
    expect(flex).toHaveAttribute("data-column-gap", gap);
    expect(flex).toHaveClass(rowGapClass(gap));
    expect(flex).toHaveClass(columnGapClass(gap));
  });

  it.each(aligns)("applies %s alignment data and class", (align) => {
    render(<Flex align={align}>{align}</Flex>);

    const flex = screen.getByText(align);

    expect(flex).toHaveAttribute("data-align", align);
    expect(flex).toHaveClass(alignClasses[align]);
  });

  it.each(justifies)("applies %s justification data and class", (justify) => {
    render(<Flex justify={justify}>{justify}</Flex>);

    const flex = screen.getByText(justify);

    expect(flex).toHaveAttribute("data-justify", justify);
    expect(flex).toHaveClass(justifyClasses[justify]);
  });

  it.each(contents)("applies %s content data and class", (content) => {
    render(<Flex content={content}>{content}</Flex>);

    const flex = screen.getByText(content);

    expect(flex).toHaveAttribute("data-content", content);
    expect(flex).toHaveClass(contentClasses[content]);
  });

  it("composes consumer classes after baseline classes", () => {
    expect(flexClassNames({ className: "custom-flex" })).toContain(
      "custom-flex",
    );
  });

  it("uses flexbox, axis gap, alignment, justification, and content utilities", () => {
    const className = flexClassNames({
      align: "center",
      columnGap: "6",
      content: "between",
      direction: "column",
      display: "inline-flex",
      gap: "4",
      justify: "around",
      rowGap: "2",
      wrap: "wrap",
    });

    expect(className).toContain("inline-flex");
    expect(className).toContain("flex-col");
    expect(className).toContain("flex-wrap");
    expect(className).toContain("gap-[var(--dt-space-4)]");
    expect(className).toContain("gap-y-[var(--dt-space-2)]");
    expect(className).toContain("gap-x-[var(--dt-space-6)]");
    expect(className).toContain("items-center");
    expect(className).toContain("justify-around");
    expect(className).toContain("content-between");
  });

  it("rejects unsupported token values at the TypeScript boundary", () => {
    const valid = <Flex gap="4" align="center" />;
    const validForm = (
      <Flex as="form" action="/search" method="get" noValidate />
    );
    const validFieldset = <Flex as="fieldset" disabled />;
    // @ts-expect-error Flex gaps use constrained token values.
    const invalidGap = <Flex gap="7" />;
    // @ts-expect-error Flex does not expose reverse direction.
    const invalidDirection = <Flex direction="row-reverse" />;
    // @ts-expect-error Flex does not expose arbitrary CSS prop parsing.
    const invalidStyleProp = <Flex backgroundColor="red" />;

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
      <Flex ref={ref} as="section">
        Ref flex
      </Flex>,
    );

    expect(ref.current?.tagName).toBe("SECTION");
  });

  it("composes classes, refs, events, and data attributes onto a child element", async () => {
    const user = userEvent.setup();
    const flexRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLAnchorElement>();
    const flexClick = vi.fn();
    const childClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Flex ref={flexRef} asChild gap="3" onClick={flexClick} wrap="wrap">
        <RouterAnchor
          ref={childRef}
          className="custom-child"
          onClick={childClick}
          to="/docs"
        >
          Flex child
        </RouterAnchor>
      </Flex>,
    );

    const link = screen.getByRole("link", { name: "Flex child" });

    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-slot", "flex");
    expect(link).toHaveAttribute("data-as-child", "true");
    expect(link).toHaveAttribute("data-direction", "row");
    expect(link).toHaveAttribute("data-gap", "3");
    expect(link).toHaveAttribute("data-wrap", "wrap");
    expect(link.className).toContain("custom-child");
    expect(flexRef.current).toBe(link);
    expect(childRef.current).toBe(link);

    await user.click(link);

    expect(flexClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("keeps child DOM order unchanged", () => {
    render(
      <Flex>
        <button type="button">First</button>
        <button type="button">Second</button>
        <button type="button">Third</button>
      </Flex>,
    );

    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["First", "Second", "Third"]);
  });
});

describe("FlexItem", () => {
  it("renders a neutral div with safe defaults", () => {
    render(<FlexItem>Flex item</FlexItem>);

    const item = screen.getByText("Flex item");

    expect(item.tagName).toBe("DIV");
    expect(item).toHaveAttribute("data-slot", "flex-item");
    expect(item).toHaveAttribute("data-element", "div");
    expect(item).toHaveAttribute("data-basis", "auto");
    expect(item).toHaveAttribute("data-align", "auto");
    expect(item).toHaveAttribute("data-min-inline-size", "auto");
    expect(item).toHaveClass("basis-auto", "self-auto");
  });

  it.each(itemElements)("renders a semantic %s item element", (as) => {
    render(<FlexItem as={as}>Semantic item {as}</FlexItem>);

    expect(screen.getByText(`Semantic item ${as}`).tagName).toBe(
      as.toUpperCase(),
    );
  });

  it.each(itemGrows)("applies %s grow data and class", (grow) => {
    render(<FlexItem grow={grow}>grow {grow}</FlexItem>);

    const item = screen.getByText(`grow ${grow}`);

    expect(item).toHaveAttribute("data-grow", grow);
    expect(item).toHaveClass(itemGrowClasses[grow]);
  });

  it.each(itemShrinks)("applies %s shrink data and class", (shrink) => {
    render(<FlexItem shrink={shrink}>shrink {shrink}</FlexItem>);

    const item = screen.getByText(`shrink ${shrink}`);

    expect(item).toHaveAttribute("data-shrink", shrink);
    expect(item).toHaveClass(itemShrinkClasses[shrink]);
  });

  it.each(itemBases)("applies %s basis data and class", (basis) => {
    render(<FlexItem basis={basis}>basis {basis}</FlexItem>);

    const item = screen.getByText(`basis ${basis}`);

    expect(item).toHaveAttribute("data-basis", basis);
    expect(item).toHaveClass(itemBasisClasses[basis]);
  });

  it.each(itemAligns)("applies %s self-alignment data and class", (align) => {
    render(<FlexItem align={align}>item align {align}</FlexItem>);

    const item = screen.getByText(`item align ${align}`);

    expect(item).toHaveAttribute("data-align", align);
    expect(item).toHaveClass(itemAlignClasses[align]);
  });

  it.each(itemMinInlineSizes)(
    "applies %s min inline size data",
    (minInlineSize) => {
      render(
        <FlexItem minInlineSize={minInlineSize}>
          min inline {minInlineSize}
        </FlexItem>,
      );

      const item = screen.getByText(`min inline ${minInlineSize}`);

      expect(item).toHaveAttribute("data-min-inline-size", minInlineSize);

      if (minInlineSize === "0") {
        expect(item).toHaveClass("min-w-0");
      } else {
        expect(item).not.toHaveClass("min-w-0");
      }
    },
  );

  it("composes item classes after baseline classes", () => {
    expect(flexItemClassNames({ className: "custom-item" })).toContain(
      "custom-item",
    );
  });

  it("uses item grow, shrink, basis, alignment, and long-content utilities", () => {
    const className = flexItemClassNames({
      align: "center",
      basis: "md",
      grow: "1",
      minInlineSize: "0",
      shrink: "0",
    });

    expect(className).toContain("grow");
    expect(className).toContain("shrink-0");
    expect(className).toContain("basis-64");
    expect(className).toContain("self-center");
    expect(className).toContain("min-w-0");
  });

  it("rejects unsupported item token values at the TypeScript boundary", () => {
    const valid = <FlexItem basis="md" grow="1" minInlineSize="0" shrink="0" />;
    // @ts-expect-error FlexItem basis uses constrained token values.
    const invalidBasis = <FlexItem basis="2xl" />;
    // @ts-expect-error FlexItem does not expose item ordering.
    const invalidOrder = <FlexItem order="1" />;
    // @ts-expect-error FlexItem does not expose arbitrary flex shorthand strings.
    const invalidFlex = <FlexItem flex="1 1 250px" />;

    expect(valid).toBeTruthy();
    expect(invalidBasis).toBeTruthy();
    expect(invalidOrder).toBeTruthy();
    expect(invalidFlex).toBeTruthy();
  });

  it("forwards refs to the native item element", () => {
    const ref = createRef<HTMLElement>();

    render(
      <FlexItem ref={ref} as="section">
        Ref item
      </FlexItem>,
    );

    expect(ref.current?.tagName).toBe("SECTION");
  });

  it("composes item classes, refs, events, and data attributes onto a child element", async () => {
    const user = userEvent.setup();
    const itemRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLButtonElement>();
    const itemClick = vi.fn();
    const childClick = vi.fn();

    render(
      <FlexItem
        ref={itemRef}
        asChild
        basis="sm"
        grow="1"
        minInlineSize="0"
        onClick={itemClick}
      >
        <button
          ref={childRef}
          className="custom-item-child"
          onClick={childClick}
          type="button"
        >
          Flex item child
        </button>
      </FlexItem>,
    );

    const button = screen.getByRole("button", { name: "Flex item child" });

    expect(button).toHaveAttribute("data-slot", "flex-item");
    expect(button).toHaveAttribute("data-as-child", "true");
    expect(button).toHaveAttribute("data-grow", "1");
    expect(button).toHaveAttribute("data-basis", "sm");
    expect(button).toHaveAttribute("data-min-inline-size", "0");
    expect(button.className).toContain("custom-item-child");
    expect(itemRef.current).toBe(button);
    expect(childRef.current).toBe(button);

    await user.click(button);

    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });
});
