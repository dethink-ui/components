"use client";

import { Box, Stack, Text } from "@dethink/components";

export function StackBasic() {
  return (
    <div className="mx-auto grid max-w-md gap-6 sm:grid-cols-2">
      <Stack gap="3">
        <Box p="2" radius="sm" surface="muted">
          <Text size="sm">vertical</Text>
        </Box>
        <Box p="2" radius="sm" surface="muted">
          <Text size="sm">gap=3</Text>
        </Box>
        <Box p="2" radius="sm" surface="muted">
          <Text size="sm">stacked</Text>
        </Box>
      </Stack>
      <Stack direction="horizontal" gap="2" align="center" justify="between">
        <Box p="2" radius="sm" surface="muted">
          <Text size="sm">horizontal</Text>
        </Box>
        <Box p="2" radius="sm" surface="muted">
          <Text size="sm">between</Text>
        </Box>
      </Stack>
    </div>
  );
}
