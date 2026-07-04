"use client";

import { Heading, Text } from "@dethink/components";

export function TypographyScale() {
  return (
    <div className="mx-auto max-w-md space-y-3">
      <Heading level={2} visualLevel={1}>
        Visual h1, semantic h2
      </Heading>
      <Heading level={3}>Section heading</Heading>
      <Text size="lg">Large body text for standfirst paragraphs.</Text>
      <Text>Default body text with a comfortable reading rhythm.</Text>
      <Text size="sm" tone="muted">
        Small muted text for secondary detail.
      </Text>
      <Text size="xs" tone="subtle">
        Extra-small subtle text for fine print.
      </Text>
    </div>
  );
}
