import {
  createElement,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export type TypographyElement =
  "p" | "span" | "div" | "small" | "strong" | "em" | "label" | "figcaption";

export type TypographyVariant =
  "display" | "heading" | "title" | "subtitle" | "body" | "caption" | "label";

export type TypographySize =
  "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

export type TypographyTone =
  | "default"
  | "muted"
  | "subtle"
  | "primary"
  | "success"
  | "warning"
  | "destructive";

export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";
export type TypographyAlign = "start" | "center" | "end" | "justify";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingVisualLevel = HeadingLevel;
export type TypographyLineClamp = 1 | 2 | 3 | 4 | 5 | 6;

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: TypographyElement;
  align?: TypographyAlign;
  children?: ReactNode;
  lineClamp?: TypographyLineClamp;
  size?: TypographySize;
  tone?: TypographyTone;
  truncate?: boolean;
  variant?: TypographyVariant;
  weight?: TypographyWeight;
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  align?: TypographyAlign;
  children?: ReactNode;
  level?: HeadingLevel;
  lineClamp?: TypographyLineClamp;
  tone?: Extract<
    TypographyTone,
    "default" | "muted" | "subtle" | "primary" | "destructive"
  >;
  truncate?: boolean;
  visualLevel?: HeadingVisualLevel;
}

export type TextElement =
  "p" | "span" | "div" | "small" | "label" | "strong" | "em";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  align?: TypographyAlign;
  children?: ReactNode;
  htmlFor?: string;
  lineClamp?: TypographyLineClamp;
  size?: TextSize;
  tone?: TypographyTone;
  truncate?: boolean;
  weight?: TypographyWeight;
}

const typographyBaseClasses = "min-w-0 max-w-full font-sans text-foreground";

const typographyVariantClasses: Record<TypographyVariant, string> = {
  display: "font-heading text-4xl font-semibold leading-tight",
  heading: "font-heading text-2xl font-semibold leading-tight",
  title: "font-heading text-lg font-semibold leading-snug",
  subtitle: "text-base font-medium leading-6",
  body: "text-base font-normal leading-7",
  caption: "text-xs font-normal leading-5",
  label: "text-sm font-medium leading-none",
};

const typographySizeClasses: Record<TypographySize, string> = {
  xs: "text-xs leading-5",
  sm: "text-sm leading-6",
  md: "text-base leading-7",
  lg: "text-lg leading-8",
  xl: "text-xl leading-8",
  "2xl": "text-2xl leading-tight",
  "3xl": "text-3xl leading-tight",
  "4xl": "text-4xl leading-tight",
};

const typographyToneClasses: Record<TypographyTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  subtle: "text-muted-foreground/80",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const typographyWeightClasses: Record<TypographyWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const typographyAlignClasses: Record<TypographyAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
  justify: "text-justify",
};

const headingVisualLevelClasses: Record<HeadingVisualLevel, string> = {
  1: "font-heading text-4xl font-semibold leading-tight",
  2: "font-heading text-3xl font-semibold leading-tight",
  3: "font-heading text-2xl font-semibold leading-tight",
  4: "font-heading text-xl font-semibold leading-snug",
  5: "font-heading text-lg font-semibold leading-snug",
  6: "font-heading text-base font-semibold leading-6",
};

const headingToneClasses: Record<NonNullable<HeadingProps["tone"]>, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  subtle: "text-muted-foreground/80",
  primary: "text-primary",
  destructive: "text-destructive",
};

const textSizeClasses: Record<TextSize, string> = {
  xs: "text-xs leading-5",
  sm: "text-sm leading-6",
  md: "text-base leading-7",
  lg: "text-lg leading-8",
  xl: "text-xl leading-8",
};

const lineClampClasses: Record<TypographyLineClamp, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

const headingElements: Record<HeadingLevel, `h${HeadingLevel}`> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};

function getOverflowClass({
  lineClamp,
  truncate,
}: {
  lineClamp?: TypographyLineClamp;
  truncate?: boolean;
}) {
  if (lineClamp !== undefined) {
    return lineClampClasses[lineClamp];
  }

  return truncate ? "truncate" : undefined;
}

export function typographyClassNames({
  align = "start",
  className,
  lineClamp,
  size,
  tone = "default",
  truncate = false,
  variant = "body",
  weight,
}: Pick<
  TypographyProps,
  | "align"
  | "className"
  | "lineClamp"
  | "size"
  | "tone"
  | "truncate"
  | "variant"
  | "weight"
> = {}) {
  return cn(
    typographyBaseClasses,
    typographyVariantClasses[variant],
    size ? typographySizeClasses[size] : undefined,
    typographyToneClasses[tone],
    weight ? typographyWeightClasses[weight] : undefined,
    typographyAlignClasses[align],
    getOverflowClass({ lineClamp, truncate }),
    className,
  );
}

export function headingClassNames({
  align = "start",
  className,
  lineClamp,
  tone = "default",
  truncate = false,
  visualLevel = 2,
}: Pick<
  HeadingProps,
  "align" | "className" | "lineClamp" | "tone" | "truncate" | "visualLevel"
> = {}) {
  return cn(
    typographyBaseClasses,
    headingVisualLevelClasses[visualLevel],
    headingToneClasses[tone],
    typographyAlignClasses[align],
    getOverflowClass({ lineClamp, truncate }),
    className,
  );
}

export function textClassNames({
  align = "start",
  className,
  lineClamp,
  size = "md",
  tone = "default",
  truncate = false,
  weight = "regular",
}: Pick<
  TextProps,
  "align" | "className" | "lineClamp" | "size" | "tone" | "truncate" | "weight"
> = {}) {
  return cn(
    typographyBaseClasses,
    textSizeClasses[size],
    typographyToneClasses[tone],
    typographyWeightClasses[weight],
    typographyAlignClasses[align],
    getOverflowClass({ lineClamp, truncate }),
    className,
  );
}

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      align = "start",
      as = "p",
      children,
      className,
      lineClamp,
      size,
      tone = "default",
      truncate = false,
      variant = "body",
      weight,
      ...props
    },
    ref,
  ) =>
    createElement(
      as,
      {
        ...props,
        ref,
        "data-slot": "typography",
        "data-align": align,
        "data-line-clamp": lineClamp,
        "data-size": size,
        "data-tone": tone,
        "data-truncate":
          truncate && lineClamp === undefined ? "true" : undefined,
        "data-variant": variant,
        "data-weight": weight,
        className: typographyClassNames({
          align,
          className,
          lineClamp,
          size,
          tone,
          truncate,
          variant,
          weight,
        }),
      },
      children,
    ),
);

Typography.displayName = "Typography";

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      align = "start",
      children,
      className,
      level = 2,
      lineClamp,
      tone = "default",
      truncate = false,
      visualLevel = level,
      ...props
    },
    ref,
  ) =>
    createElement(
      headingElements[level],
      {
        ...props,
        ref,
        "data-slot": "heading",
        "data-align": align,
        "data-level": level,
        "data-line-clamp": lineClamp,
        "data-tone": tone,
        "data-truncate":
          truncate && lineClamp === undefined ? "true" : undefined,
        "data-visual-level": visualLevel,
        className: headingClassNames({
          align,
          className,
          lineClamp,
          tone,
          truncate,
          visualLevel,
        }),
      },
      children,
    ),
);

Heading.displayName = "Heading";

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      align = "start",
      as = "p",
      children,
      className,
      lineClamp,
      size = "md",
      tone = "default",
      truncate = false,
      weight = "regular",
      ...props
    },
    ref,
  ) =>
    createElement(
      as,
      {
        ...props,
        ref,
        "data-slot": "text",
        "data-align": align,
        "data-line-clamp": lineClamp,
        "data-size": size,
        "data-tone": tone,
        "data-truncate":
          truncate && lineClamp === undefined ? "true" : undefined,
        "data-weight": weight,
        className: textClassNames({
          align,
          className,
          lineClamp,
          size,
          tone,
          truncate,
          weight,
        }),
      },
      children,
    ),
);

Text.displayName = "Text";
