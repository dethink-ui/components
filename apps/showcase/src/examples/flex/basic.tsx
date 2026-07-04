"use client";

import { Box, Flex, FlexItem, Text } from "@dethink/components";

export function FlexBasic() {
  return (
    <Flex gap="3" align="center" className="mx-auto max-w-md">
      <FlexItem>
        <Box p="3" radius="md" surface="muted">
          <Text size="sm">fixed</Text>
        </Box>
      </FlexItem>
      <FlexItem grow="1">
        <Box p="3" radius="md" surface="info">
          <Text size="sm">grow=1 — takes the remaining space</Text>
        </Box>
      </FlexItem>
      <FlexItem>
        <Box p="3" radius="md" surface="muted">
          <Text size="sm">fixed</Text>
        </Box>
      </FlexItem>
    </Flex>
  );
}
