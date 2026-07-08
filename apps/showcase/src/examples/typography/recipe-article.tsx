"use client";

import { Heading, Separator, Text } from "@dethink/components";

/**
 * An article header and lede built from the semantic pieces: heading levels
 * follow the outline while visualLevel controls the size, and tones carry
 * the byline hierarchy without ad hoc classes.
 */
export function TypographyRecipeArticle() {
  return (
    <article className="mx-auto max-w-md">
      <Text
        size="xs"
        tone="primary"
        weight="medium"
        className="tracking-wider uppercase"
      >
        Engineering
      </Text>
      <Heading level={3} visualLevel={2} className="mt-2">
        Theming a component library with nothing but CSS variables
      </Heading>
      <Text tone="muted" size="sm" className="mt-2">
        How the token contract keeps every component rebrandable — including
        this page's teal.
      </Text>
      <div className="mt-3 flex items-center gap-2">
        <Text as="span" size="sm" weight="medium">
          Dana Okafor
        </Text>
        <Text as="span" size="sm" tone="subtle">
          · Jul 4, 2026 · 8 min read
        </Text>
      </div>
      <Separator spacing="4" />
      <Text lineClamp={3} tone="muted">
        Every color, radius, font, and density value in Dethink Components is a
        CSS custom property. That single decision means a theme is data, not
        code: hand the provider a palette and the whole tree — buttons,
        calendars, data tables — re-skins itself with no forked styles and no
        specificity fights.
      </Text>
    </article>
  );
}
