import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Heading,
  Text,
  Typography,
  headingClassNames,
  textClassNames,
  typographyClassNames,
  type HeadingLevel,
  type HeadingVisualLevel,
  type TextSize,
  type TypographyAlign,
  type TypographyLineClamp,
  type TypographySize,
  type TypographyTone,
  type TypographyVariant,
  type TypographyWeight,
} from ".";

const headingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];
const visualLevels: HeadingVisualLevel[] = [1, 2, 3, 4, 5, 6];
const variants: TypographyVariant[] = [
  "display",
  "heading",
  "title",
  "subtitle",
  "body",
  "caption",
  "label",
];
const sizes: TypographySize[] = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
];
const textSizes: TextSize[] = ["xs", "sm", "md", "lg", "xl"];
const tones: TypographyTone[] = [
  "default",
  "muted",
  "subtle",
  "primary",
  "success",
  "warning",
  "destructive",
];
const weights: TypographyWeight[] = ["regular", "medium", "semibold", "bold"];
const alignments: TypographyAlign[] = ["start", "center", "end", "justify"];
const lineClamps: TypographyLineClamp[] = [1, 2, 3, 4, 5, 6];

describe("Typography", () => {
  it("renders a paragraph with safe defaults", () => {
    render(<Typography>Body copy</Typography>);

    const text = screen.getByText("Body copy");

    expect(text.tagName).toBe("P");
    expect(text).toHaveAttribute("data-slot", "typography");
    expect(text).toHaveAttribute("data-variant", "body");
    expect(text).toHaveAttribute("data-tone", "default");
    expect(text).toHaveAttribute("data-align", "start");
  });

  it("renders controlled text-oriented elements", () => {
    render(
      <Typography as="figcaption" variant="caption">
        Figure note
      </Typography>,
    );

    const text = screen.getByText("Figure note");

    expect(text.tagName).toBe("FIGCAPTION");
    expect(text).toHaveAttribute("data-variant", "caption");
  });

  it.each(variants)(
    "renders the %s typography variant attribute",
    (variant) => {
      render(<Typography variant={variant}>{variant}</Typography>);

      expect(screen.getByText(variant)).toHaveAttribute(
        "data-variant",
        variant,
      );
    },
  );

  it.each(sizes)("renders the %s typography size attribute", (size) => {
    render(<Typography size={size}>{size}</Typography>);

    expect(screen.getByText(size)).toHaveAttribute("data-size", size);
  });

  it.each(tones)("renders the %s tone attribute", (tone) => {
    render(<Text tone={tone}>{tone}</Text>);

    expect(screen.getByText(tone)).toHaveAttribute("data-tone", tone);
  });

  it.each(weights)("renders the %s weight attribute", (weight) => {
    render(<Text weight={weight}>{weight}</Text>);

    expect(screen.getByText(weight)).toHaveAttribute("data-weight", weight);
  });

  it.each(alignments)("renders logical %s alignment", (align) => {
    render(<Text align={align}>{align}</Text>);

    expect(screen.getByText(align)).toHaveAttribute("data-align", align);
  });

  it("composes consumer classes after baseline classes", () => {
    expect(typographyClassNames({ className: "custom-copy" })).toContain(
      "custom-copy",
    );
    expect(headingClassNames({ className: "custom-heading" })).toContain(
      "custom-heading",
    );
    expect(textClassNames({ className: "custom-text" })).toContain(
      "custom-text",
    );
  });

  it("uses tokenized tones and logical alignment classes", () => {
    const className = typographyClassNames({
      align: "end",
      tone: "primary",
      variant: "title",
    });

    expect(className).toContain("text-primary");
    expect(className).toContain("text-end");
  });

  it("supports single-line truncation", () => {
    render(<Text truncate>Very long project name</Text>);

    const text = screen.getByText("Very long project name");

    expect(text).toHaveAttribute("data-truncate", "true");
    expect(text.className).toContain("truncate");
  });

  it.each(lineClamps)("supports %s-line clamping", (lineClamp) => {
    render(<Text lineClamp={lineClamp}>{lineClamp} line clamp</Text>);

    const text = screen.getByText(`${lineClamp} line clamp`);

    expect(text).toHaveAttribute("data-line-clamp", String(lineClamp));
    expect(text.className).toContain(`line-clamp-${lineClamp}`);
  });

  it("lets line clamp win over truncate when both are provided", () => {
    render(
      <Text lineClamp={2} truncate>
        Clamped copy
      </Text>,
    );

    const text = screen.getByText("Clamped copy");

    expect(text).toHaveAttribute("data-line-clamp", "2");
    expect(text).not.toHaveAttribute("data-truncate");
    expect(text.className).toContain("line-clamp-2");
    expect(text.className).not.toContain("truncate");
  });

  it("forwards refs from the Typography primitive", () => {
    const ref = createRef<HTMLElement>();

    render(
      <Typography ref={ref} as="span">
        Ref copy
      </Typography>,
    );

    expect(ref.current?.tagName).toBe("SPAN");
  });
});

describe("Heading", () => {
  it("renders a level two heading by default", () => {
    render(<Heading>Section heading</Heading>);

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Section heading",
    });

    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveAttribute("data-slot", "heading");
    expect(heading).toHaveAttribute("data-level", "2");
    expect(heading).toHaveAttribute("data-visual-level", "2");
  });

  it.each(headingLevels)("renders a native h%s element", (level) => {
    render(<Heading level={level}>Heading {level}</Heading>);

    const heading = screen.getByRole("heading", {
      level,
      name: `Heading ${level}`,
    });

    expect(heading.tagName).toBe(`H${level}`);
    expect(heading).toHaveAttribute("data-level", String(level));
  });

  it.each(visualLevels)(
    "styles a heading with visual level %s independently from semantics",
    (visualLevel) => {
      render(
        <Heading level={3} visualLevel={visualLevel}>
          Visual heading
        </Heading>,
      );

      const heading = screen.getByRole("heading", {
        level: 3,
        name: "Visual heading",
      });

      expect(heading.tagName).toBe("H3");
      expect(heading).toHaveAttribute("data-visual-level", String(visualLevel));
    },
  );

  it("forwards refs to the native heading", () => {
    const ref = createRef<HTMLHeadingElement>();

    render(<Heading ref={ref}>Ref heading</Heading>);

    expect(ref.current?.tagName).toBe("H2");
  });
});

describe("Text", () => {
  it("renders a paragraph with safe defaults", () => {
    render(<Text>Body text</Text>);

    const text = screen.getByText("Body text");

    expect(text.tagName).toBe("P");
    expect(text).toHaveAttribute("data-slot", "text");
    expect(text).toHaveAttribute("data-size", "md");
    expect(text).toHaveAttribute("data-tone", "default");
  });

  it("renders inline and label text elements", () => {
    render(
      <>
        <Text as="span">Inline label</Text>
        <Text as="label" htmlFor="email">
          Email address
        </Text>
      </>,
    );

    expect(screen.getByText("Inline label").tagName).toBe("SPAN");
    expect(screen.getByText("Email address").tagName).toBe("LABEL");
    expect(screen.getByText("Email address")).toHaveAttribute("for", "email");
  });

  it.each(textSizes)("renders the %s text size attribute", (size) => {
    render(<Text size={size}>{size}</Text>);

    expect(screen.getByText(size)).toHaveAttribute("data-size", size);
  });
});
