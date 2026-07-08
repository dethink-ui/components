import { createRef, forwardRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { Link } from "../link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardClassNames,
  cardFooterClassNames,
  type CardBorder,
  type CardElement,
  type CardFooterJustify,
  type CardRadius,
  type CardShadow,
  type CardSpacing,
  type CardSurface,
  type CardTitleElement,
} from ".";

const elements: CardElement[] = ["div", "article", "section", "aside", "li"];
const surfaces: CardSurface[] = ["default", "muted", "transparent"];
const borders: CardBorder[] = ["default", "muted", "none"];
const radii: CardRadius[] = ["md", "lg"];
const shadows: CardShadow[] = ["none", "sm", "md"];
const spacings: CardSpacing[] = ["sm", "md", "lg"];
const titleElements: CardTitleElement[] = ["div", "h2", "h3", "h4", "h5", "h6"];
const footerJustify: CardFooterJustify[] = ["start", "between", "end"];

const surfaceClasses: Record<CardSurface, string> = {
  default: "bg-background",
  muted: "bg-muted",
  transparent: "bg-transparent",
};

const borderClasses: Record<CardBorder, string> = {
  default: "border-border",
  muted: "border-muted",
  none: "border-0",
};

const shadowClasses: Record<CardShadow, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
};

const RouterArticle = forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { to: string }
>(({ to: _to, ...props }, ref) => <article ref={ref} {...props} />);
RouterArticle.displayName = "RouterArticle";

describe("Card", () => {
  it("renders a static card surface with safe defaults", () => {
    render(<Card>Card body</Card>);

    const card = screen.getByText("Card body");

    expect(card.tagName).toBe("DIV");
    expect(card).toHaveAttribute("data-slot", "card");
    expect(card).toHaveAttribute("data-element", "div");
    expect(card).toHaveAttribute("data-surface", "default");
    expect(card).toHaveAttribute("data-border", "default");
    expect(card).toHaveAttribute("data-radius", "lg");
    expect(card).toHaveAttribute("data-shadow", "sm");
    expect(card).toHaveAttribute("data-spacing", "md");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
    expect(card).toHaveClass(
      "box-border",
      "flex",
      "min-w-0",
      "flex-col",
      "text-foreground",
      "bg-background",
      "border",
      "border-border",
      "rounded-lg",
      "shadow-sm",
    );
  });

  it.each(elements)("renders a supported %s root element", (as) => {
    render(
      as === "li" ? (
        <ul>
          <Card as={as}>Semantic {as}</Card>
        </ul>
      ) : (
        <Card as={as}>Semantic {as}</Card>
      ),
    );

    expect(screen.getByText(`Semantic ${as}`).tagName).toBe(as.toUpperCase());
  });

  it.each(surfaces)("applies the %s surface", (surface) => {
    render(<Card surface={surface}>{surface}</Card>);

    const card = screen.getByText(surface);

    expect(card).toHaveAttribute("data-surface", surface);
    expect(card).toHaveClass(surfaceClasses[surface]);
  });

  it.each(borders)("applies the %s border", (border) => {
    render(<Card border={border}>{border}</Card>);

    const card = screen.getByText(border);

    expect(card).toHaveAttribute("data-border", border);
    expect(card).toHaveClass(borderClasses[border]);
  });

  it.each(radii)("applies the %s radius", (radius) => {
    render(<Card radius={radius}>{radius}</Card>);

    expect(screen.getByText(radius)).toHaveAttribute("data-radius", radius);
  });

  it.each(shadows)("applies the %s shadow", (shadow) => {
    render(<Card shadow={shadow}>{shadow}</Card>);

    const card = screen.getByText(shadow);

    expect(card).toHaveAttribute("data-shadow", shadow);
    expect(card).toHaveClass(shadowClasses[shadow]);
  });

  it.each(spacings)("applies the %s spacing tokens", (spacing) => {
    render(<Card spacing={spacing}>{spacing}</Card>);

    const card = screen.getByText(spacing);

    expect(card).toHaveAttribute("data-spacing", spacing);
    expect(card.className).toContain("--card-padding");
    expect(card.className).toContain("--card-gap");
  });

  it("composes consumer classes after baseline classes", () => {
    expect(cardClassNames({ className: "custom-card" })).toContain(
      "custom-card",
    );
  });

  it("uses tokenized surface, border, radius, shadow, and spacing classes", () => {
    const className = cardClassNames({
      border: "muted",
      radius: "md",
      shadow: "md",
      spacing: "lg",
      surface: "muted",
    });

    expect(className).toContain("bg-muted");
    expect(className).toContain("border-muted");
    expect(className).toContain("rounded-md");
    expect(className).toContain("shadow-md");
    expect(className).toContain("--card-padding");
  });

  it("renders the approved card anatomy slots", () => {
    render(
      <Card as="article">
        <CardHeader as="header">
          <CardTitle as="h2">Usage</CardTitle>
          <CardDescription>Requests in the last hour.</CardDescription>
          <CardAction>
            <Button size="sm" variant="outline">
              Export
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent as="section">2,481 requests</CardContent>
        <CardFooter as="footer" justify="between">
          <span>Updated now</span>
          <Link href="/reports">View report</Link>
        </CardFooter>
      </Card>,
    );

    const card = screen.getByRole("article");
    const title = screen.getByRole("heading", { level: 2, name: "Usage" });
    const description = screen.getByText("Requests in the last hour.");
    const content = screen.getByText("2,481 requests");
    const footer = screen.getByText("Updated now").parentElement;

    expect(card).toHaveAttribute("data-slot", "card");
    expect(title).toHaveAttribute("data-slot", "card-title");
    expect(title).toHaveAttribute("data-element", "h2");
    expect(description).toHaveAttribute("data-slot", "card-description");
    expect(
      screen.getByRole("button", { name: "Export" }).parentElement,
    ).toHaveAttribute("data-slot", "card-action");
    expect(content).toHaveAttribute("data-slot", "card-content");
    expect(footer).toHaveAttribute("data-slot", "card-footer");
    expect(footer).toHaveAttribute("data-justify", "between");
  });

  it.each(titleElements)("renders CardTitle as %s", (as) => {
    render(<CardTitle as={as}>Title {as}</CardTitle>);

    expect(screen.getByText(`Title ${as}`).tagName).toBe(as.toUpperCase());
  });

  it.each(footerJustify)("applies %s footer justification", (justify) => {
    render(<CardFooter justify={justify}>{justify}</CardFooter>);

    expect(screen.getByText(justify)).toHaveAttribute("data-justify", justify);
    expect(cardFooterClassNames({ justify })).toContain(
      justify === "between" ? "justify-between" : `justify-${justify}`,
    );
  });

  it("rejects unsupported public values at the TypeScript boundary", () => {
    const valid = <Card as="article" radius="md" spacing="lg" />;
    const validTitle = <CardTitle as="h4">Title</CardTitle>;
    // @ts-expect-error Card root elements are intentionally constrained.
    const invalidElement = <Card as="button" />;
    // @ts-expect-error Card surface uses constrained token values.
    const invalidSurface = <Card surface="primary" />;
    // @ts-expect-error Card spacing uses constrained token values.
    const invalidSpacing = <Card spacing="xl" />;
    // @ts-expect-error CardTitle supports only heading-safe element choices.
    const invalidTitle = <CardTitle as="a">Title</CardTitle>;
    // @ts-expect-error Card does not expose arbitrary CSS prop parsing.
    const invalidStyleProp = <Card backgroundColor="red" />;

    expect(valid).toBeTruthy();
    expect(validTitle).toBeTruthy();
    expect(invalidElement).toBeTruthy();
    expect(invalidSurface).toBeTruthy();
    expect(invalidSpacing).toBeTruthy();
    expect(invalidTitle).toBeTruthy();
    expect(invalidStyleProp).toBeTruthy();
  });

  it("forwards refs to root and slot elements", () => {
    const cardRef = createRef<HTMLElement>();
    const titleRef = createRef<HTMLElement>();
    const footerRef = createRef<HTMLElement>();

    render(
      <Card ref={cardRef} as="section">
        <CardTitle ref={titleRef}>Ref title</CardTitle>
        <CardFooter ref={footerRef}>Ref footer</CardFooter>
      </Card>,
    );

    expect(cardRef.current?.tagName).toBe("SECTION");
    expect(titleRef.current?.tagName).toBe("H3");
    expect(footerRef.current?.getAttribute("data-slot")).toBe("card-footer");
  });

  it("composes classes, refs, events, and data attributes onto a child element", async () => {
    const user = userEvent.setup();
    const cardRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLElement>();
    const cardClick = vi.fn();
    const childClick = vi.fn((event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
    });

    render(
      <Card
        ref={cardRef}
        asChild
        data-testid="child-card"
        onClick={cardClick}
        spacing="sm"
        surface="muted"
      >
        <RouterArticle
          ref={childRef}
          className="custom-child"
          onClick={childClick}
          to="/cards"
        >
          Child card
        </RouterArticle>
      </Card>,
    );

    const card = screen.getByTestId("child-card");

    expect(card.tagName).toBe("ARTICLE");
    expect(card).toHaveAttribute("data-slot", "card");
    expect(card).toHaveAttribute("data-as-child", "true");
    expect(card).toHaveAttribute("data-spacing", "sm");
    expect(card).toHaveAttribute("data-surface", "muted");
    expect(card.className).toContain("custom-child");
    expect(cardRef.current).toBe(card);
    expect(childRef.current).toBe(card);

    await user.click(card);

    expect(cardClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });
});
