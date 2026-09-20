import { createRef, forwardRef, type MouseEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Link, linkClassNames, type LinkUnderline, type LinkVariant } from ".";

const variants: LinkVariant[] = ["default", "muted", "nav", "destructive"];
const underlines: LinkUnderline[] = ["hover", "always", "none"];

const RouterLink = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} {...props}>
    {children}
  </a>
));
RouterLink.displayName = "RouterLink";

describe("Link", () => {
  it("renders a native anchor with safe defaults", () => {
    render(<Link href="/docs">Read docs</Link>);

    const link = screen.getByRole("link", { name: "Read docs" });

    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-slot", "link");
    expect(link).toHaveAttribute("data-variant", "default");
    expect(link).toHaveAttribute("data-underline", "hover");
  });

  it("requires href in native mode at the TypeScript boundary", () => {
    const valid = <Link href="/docs">Docs</Link>;
    // @ts-expect-error Native Link mode requires href.
    const invalid = <Link>Missing href</Link>;

    expect(valid).toBeTruthy();
    expect(invalid).toBeTruthy();
  });

  it.each(variants)("renders the %s variant attribute", (variant) => {
    render(
      <Link href="/docs" variant={variant}>
        Variant
      </Link>,
    );

    expect(screen.getByRole("link", { name: "Variant" })).toHaveAttribute(
      "data-variant",
      variant,
    );
  });

  it.each(underlines)("renders the %s underline attribute", (underline) => {
    render(
      <Link href="/docs" underline={underline}>
        Underline
      </Link>,
    );

    expect(screen.getByRole("link", { name: "Underline" })).toHaveAttribute(
      "data-underline",
      underline,
    );
  });

  it("composes consumer classes after baseline classes", () => {
    expect(linkClassNames({ className: "text-lg" })).toContain("text-lg");
  });

  it("uses tokenized focus-visible and link state selectors", () => {
    const className = linkClassNames({ variant: "nav" });

    expect(className).toContain("focus-visible:ring-ring");
    expect(className).toContain("focus-visible:ring-offset-background");
    expect(className).toContain("data-[current=true]:text-foreground");
  });

  it("preserves aria-current and exposes a stable current data attribute", () => {
    render(
      <Link aria-current="page" href="/docs" variant="nav">
        Docs
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Docs" });

    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-current", "true");
  });

  it("does not mark false aria-current as current", () => {
    render(
      <Link aria-current={false} href="/docs" variant="nav">
        Docs
      </Link>,
    );

    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute(
      "data-current",
    );
  });

  it("adds noopener to new-tab links while preserving existing rel tokens", () => {
    render(
      <Link
        href="https://example.com"
        rel="nofollow noreferrer"
        target="_blank"
      >
        External
      </Link>,
    );

    const link = screen.getByRole("link", { name: "External" });

    expect(link).toHaveAttribute("rel", "nofollow noreferrer noopener");
  });

  it("does not add rel tokens to same-tab links", () => {
    render(
      <Link href="/docs" rel="author">
        Author
      </Link>,
    );

    expect(screen.getByRole("link", { name: "Author" })).toHaveAttribute(
      "rel",
      "author",
    );
  });

  it("forwards refs to the native anchor", () => {
    const ref = createRef<HTMLAnchorElement>();

    render(
      <Link ref={ref} href="/docs">
        Docs
      </Link>,
    );

    expect(ref.current?.tagName).toBe("A");
  });

  it("composes classes, refs, events, and safety behavior onto a child element", async () => {
    const user = userEvent.setup();
    const linkClick = vi.fn();
    const childClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <Link asChild onClick={linkClick} target="_blank" variant="nav">
        <RouterLink className="custom-link" onClick={childClick} to="/docs">
          Router docs
        </RouterLink>
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Router docs" });

    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-slot", "link");
    expect(link).toHaveAttribute("data-variant", "nav");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(link.className).toContain("custom-link");

    await user.click(link);

    expect(linkClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("lets child props win in asChild composition", () => {
    render(
      <Link asChild href="/from-link" rel="author" target="_self">
        <a href="/from-child" rel="nofollow" target="_blank">
          Child wins
        </a>
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Child wins" });

    expect(link).toHaveAttribute("href", "/from-child");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "nofollow noopener");
  });
});
