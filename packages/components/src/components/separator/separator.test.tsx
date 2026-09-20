import { createRef, forwardRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Divider,
  Separator,
  separatorClassNames,
  type SeparatorElement,
  type SeparatorOrientation,
  type SeparatorSpacing,
  type SeparatorThickness,
  type SeparatorTone,
} from ".";

const elements: SeparatorElement[] = ["hr", "div", "span"];
const orientations: SeparatorOrientation[] = ["horizontal", "vertical"];
const thicknesses: SeparatorThickness[] = ["1", "2"];
const tones: SeparatorTone[] = ["default", "muted", "strong"];
const spacings: SeparatorSpacing[] = ["none", "1", "2", "3", "4", "6", "8"];

const toneClasses: Record<SeparatorTone, string> = {
  default: "bg-border",
  muted: "bg-muted-foreground/25",
  strong: "bg-foreground/40",
};

const RouterSpan = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { to: string }
>(({ to: _to, ...props }, ref) => <span ref={ref} {...props} />);
RouterSpan.displayName = "RouterSpan";

function spacingClass(
  orientation: SeparatorOrientation,
  spacing: SeparatorSpacing,
) {
  if (spacing === "none") {
    return undefined;
  }

  return `${orientation === "horizontal" ? "my" : "mx"}-[var(--dt-space-${spacing})]`;
}

describe("Separator", () => {
  it("renders a semantic hr with safe defaults", () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId("separator");

    expect(separator.tagName).toBe("HR");
    expect(separator).toHaveAttribute("data-slot", "separator");
    expect(separator).toHaveAttribute("data-element", "hr");
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    expect(separator).toHaveAttribute("data-decorative", "false");
    expect(separator).toHaveAttribute("data-thickness", "1");
    expect(separator).toHaveAttribute("data-tone", "default");
    expect(separator).toHaveAttribute("data-spacing", "none");
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    expect(separator).not.toHaveAttribute("role");
    expect(separator).not.toHaveAttribute("tabindex");
    expect(separator).toHaveClass(
      "block",
      "shrink-0",
      "border-0",
      "w-full",
      "h-px",
      "bg-border",
    );
  });

  it.each(elements)("renders a supported %s element", (as) => {
    render(<Separator as={as} data-testid={as} />);

    expect(screen.getByTestId(as).tagName).toBe(as.toUpperCase());
  });

  it.each(orientations)(
    "applies %s orientation data and classes",
    (orientation) => {
      render(<Separator data-testid={orientation} orientation={orientation} />);

      const separator = screen.getByTestId(orientation);

      expect(separator).toHaveAttribute("data-orientation", orientation);
      expect(separator).toHaveAttribute("aria-orientation", orientation);

      if (orientation === "horizontal") {
        expect(separator).toHaveClass("w-full", "h-px");
      } else {
        expect(separator).toHaveClass(
          "h-full",
          "min-h-4",
          "self-stretch",
          "w-px",
        );
      }
    },
  );

  it.each(thicknesses)(
    "applies %s thickness for both orientations",
    (thickness) => {
      render(
        <>
          <Separator
            data-testid={`horizontal-${thickness}`}
            thickness={thickness}
          />
          <Separator
            data-testid={`vertical-${thickness}`}
            orientation="vertical"
            thickness={thickness}
          />
        </>,
      );

      expect(screen.getByTestId(`horizontal-${thickness}`)).toHaveAttribute(
        "data-thickness",
        thickness,
      );
      expect(screen.getByTestId(`vertical-${thickness}`)).toHaveAttribute(
        "data-thickness",
        thickness,
      );

      if (thickness === "1") {
        expect(screen.getByTestId(`horizontal-${thickness}`)).toHaveClass(
          "h-px",
        );
        expect(screen.getByTestId(`vertical-${thickness}`)).toHaveClass("w-px");
      } else {
        expect(screen.getByTestId(`horizontal-${thickness}`)).toHaveClass(
          "h-0.5",
        );
        expect(screen.getByTestId(`vertical-${thickness}`)).toHaveClass(
          "w-0.5",
        );
      }
    },
  );

  it.each(tones)("applies %s tone data and class", (tone) => {
    render(<Separator data-testid={tone} tone={tone} />);

    const separator = screen.getByTestId(tone);

    expect(separator).toHaveAttribute("data-tone", tone);
    expect(separator).toHaveClass(toneClasses[tone]);
  });

  it.each(spacings)("applies %s spacing for both orientations", (spacing) => {
    render(
      <>
        <Separator data-testid={`horizontal-${spacing}`} spacing={spacing} />
        <Separator
          data-testid={`vertical-${spacing}`}
          orientation="vertical"
          spacing={spacing}
        />
      </>,
    );

    const horizontal = screen.getByTestId(`horizontal-${spacing}`);
    const vertical = screen.getByTestId(`vertical-${spacing}`);

    expect(horizontal).toHaveAttribute("data-spacing", spacing);
    expect(vertical).toHaveAttribute("data-spacing", spacing);

    const horizontalClass = spacingClass("horizontal", spacing);
    const verticalClass = spacingClass("vertical", spacing);

    if (horizontalClass && verticalClass) {
      expect(horizontal).toHaveClass(horizontalClass);
      expect(vertical).toHaveClass(verticalClass);
    } else {
      expect(horizontal).not.toHaveClass("my-[var(--dt-space-1)]");
      expect(vertical).not.toHaveClass("mx-[var(--dt-space-1)]");
    }
  });

  it("adds separator role for semantic non-hr rendering", () => {
    render(
      <Separator as="div" data-testid="semantic-div" orientation="vertical" />,
    );

    const separator = screen.getByTestId("semantic-div");

    expect(separator.tagName).toBe("DIV");
    expect(separator).toHaveAttribute("role", "separator");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).not.toHaveAttribute("aria-hidden");
  });

  it("hides decorative separators from assistive technologies", () => {
    render(
      <Separator
        as="div"
        data-testid="decorative"
        decorative
        orientation="vertical"
      />,
    );

    const separator = screen.getByTestId("decorative");

    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator).not.toHaveAttribute("role");
    expect(separator).not.toHaveAttribute("aria-orientation");
  });

  it("composes consumer classes after baseline classes", () => {
    expect(separatorClassNames({ className: "custom-separator" })).toContain(
      "custom-separator",
    );
  });

  it("uses orientation, thickness, tone, and spacing utilities", () => {
    const className = separatorClassNames({
      orientation: "vertical",
      spacing: "4",
      thickness: "2",
      tone: "strong",
    });

    expect(className).toContain("h-full");
    expect(className).toContain("w-0.5");
    expect(className).toContain("bg-foreground/40");
    expect(className).toContain("mx-[var(--dt-space-4)]");
  });

  it("rejects unsupported public props at the TypeScript boundary", () => {
    const valid = <Separator orientation="vertical" spacing="4" tone="muted" />;
    const validAlias = <Divider decorative />;
    // @ts-expect-error Separator spacing uses constrained token values.
    const invalidSpacing = <Separator spacing="5" />;
    // @ts-expect-error Separator does not expose content-bearing children.
    const invalidChildren = <Separator>Section break</Separator>;
    // @ts-expect-error Separator does not expose focusable splitter props.
    const invalidTabIndex = <Separator tabIndex={0} />;
    // @ts-expect-error Separator owns the separator role contract.
    const invalidRole = <Separator role="presentation" />;
    // @ts-expect-error Separator does not expose splitter value semantics.
    const invalidValueNow = <Separator aria-valuenow={50} />;
    // @ts-expect-error Separator does not expose splitter value semantics.
    const invalidValueMin = <Separator aria-valuemin={0} />;
    // @ts-expect-error Separator does not expose splitter value semantics.
    const invalidValueMax = <Separator aria-valuemax={100} />;
    // @ts-expect-error Separator does not expose splitter value semantics.
    const invalidValueText = <Separator aria-valuetext="50 percent" />;

    expect(valid).toBeTruthy();
    expect(validAlias).toBeTruthy();
    expect(invalidSpacing).toBeTruthy();
    expect(invalidChildren).toBeTruthy();
    expect(invalidTabIndex).toBeTruthy();
    expect(invalidRole).toBeTruthy();
    expect(invalidValueNow).toBeTruthy();
    expect(invalidValueMin).toBeTruthy();
    expect(invalidValueMax).toBeTruthy();
    expect(invalidValueText).toBeTruthy();
  });

  it("strips splitter value semantics from native and child props", () => {
    const splitterProps = {
      "aria-valuemax": 100,
      "aria-valuemin": 0,
      "aria-valuenow": 50,
      "aria-valuetext": "50 percent",
      tabIndex: 0,
    } as Record<string, unknown>;

    render(
      <>
        <Separator data-testid="native" {...splitterProps} />
        <Separator asChild data-testid="child" {...splitterProps}>
          {/* eslint-disable jsx-a11y/role-supports-aria-props, jsx-a11y/no-noninteractive-tabindex -- Deliberately invalid child props verify Separator sanitization. */}
          <span
            aria-valuemax={90}
            aria-valuemin={10}
            aria-valuenow={75}
            aria-valuetext="75 percent"
            role="presentation"
            tabIndex={0}
          />
          {/* eslint-enable jsx-a11y/role-supports-aria-props, jsx-a11y/no-noninteractive-tabindex */}
        </Separator>
      </>,
    );

    const native = screen.getByTestId("native");
    const child = screen.getByTestId("child");

    for (const separator of [native, child]) {
      expect(separator).not.toHaveAttribute("aria-valuemax");
      expect(separator).not.toHaveAttribute("aria-valuemin");
      expect(separator).not.toHaveAttribute("aria-valuenow");
      expect(separator).not.toHaveAttribute("aria-valuetext");
      expect(separator).not.toHaveAttribute("tabindex");
    }

    expect(native).not.toHaveAttribute("role");
    expect(child).toHaveAttribute("role", "separator");
    expect(child).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("forwards refs to the native element", () => {
    const ref = createRef<HTMLElement>();

    render(<Separator ref={ref} as="div" />);

    expect(ref.current?.tagName).toBe("DIV");
  });

  it("composes classes, refs, events, and attributes onto a child element", async () => {
    const user = userEvent.setup();
    const separatorRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLSpanElement>();
    const separatorClick = vi.fn();
    const childClick = vi.fn((event: MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
    });

    render(
      <Separator
        ref={separatorRef}
        asChild
        data-testid="child-separator"
        onClick={separatorClick}
        orientation="vertical"
      >
        <RouterSpan
          ref={childRef}
          className="custom-child"
          onClick={childClick}
          to="/docs"
        />
      </Separator>,
    );

    const separator = screen.getByTestId("child-separator");

    expect(separator.tagName).toBe("SPAN");
    expect(separator).toHaveAttribute("data-slot", "separator");
    expect(separator).toHaveAttribute("data-as-child", "true");
    expect(separator).toHaveAttribute("data-orientation", "vertical");
    expect(separator).toHaveAttribute("role", "separator");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator.className).toContain("custom-child");
    expect(separatorRef.current).toBe(separator);
    expect(childRef.current).toBe(separator);

    await user.click(separator);

    expect(separatorClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });
});

describe("Divider", () => {
  it("renders the same separator contract through the alias", () => {
    const ref = createRef<HTMLElement>();

    render(<Divider ref={ref} data-testid="divider" decorative tone="muted" />);

    const divider = screen.getByTestId("divider");

    expect(divider.tagName).toBe("HR");
    expect(divider).toHaveAttribute("data-slot", "separator");
    expect(divider).toHaveAttribute("data-decorative", "true");
    expect(divider).toHaveAttribute("aria-hidden", "true");
    expect(divider).toHaveClass("bg-muted-foreground/25");
    expect(ref.current).toBe(divider);
  });
});
