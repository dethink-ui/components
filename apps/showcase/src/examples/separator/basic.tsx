"use client";

import { Separator, Stack, Text } from "@dethink/components";

export function SeparatorBasic() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <Text size="sm">Content above a default separator.</Text>
      <Separator spacing="2" />
      <Text size="sm" tone="muted">
        Content below. Decorative separators are hidden from assistive tech.
      </Text>
      <Stack direction="horizontal" gap="3" align="center">
        <Text size="sm">Docs</Text>
        <Separator orientation="vertical" spacing="none" className="h-4" />
        <Text size="sm">Registry</Text>
        <Separator orientation="vertical" spacing="none" className="h-4" />
        <Text size="sm">GitHub</Text>
      </Stack>
      <Separator tone="strong" thickness="2" spacing="2" />
      <Text size="sm" tone="muted">
        tone=strong, thickness=2
      </Text>
    </div>
  );
}
