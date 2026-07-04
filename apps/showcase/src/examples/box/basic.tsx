"use client";

import { Box, Text } from "@dethink/components";

export function BoxBasic() {
  return (
    <div className="mx-auto grid max-w-md gap-3 sm:grid-cols-2">
      <Box p="4" radius="md" border="default" surface="background">
        <Text size="sm">border=default, surface=background</Text>
      </Box>
      <Box p="4" radius="lg" surface="muted">
        <Text size="sm">surface=muted, radius=lg</Text>
      </Box>
      <Box p="4" radius="md" border="primary">
        <Text size="sm" tone="primary">
          border=primary
        </Text>
      </Box>
      <Box p="4" radius="md" surface="info">
        <Text size="sm">surface=info</Text>
      </Box>
    </div>
  );
}
