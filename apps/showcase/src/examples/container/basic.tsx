"use client";

import { Box, Container, Text } from "@dethink/components";

const sizes = ["sm", "md", "lg"] as const;

export function ContainerBasic() {
  return (
    <div className="space-y-3">
      {sizes.map((size) => (
        <Container key={size} size={size} gutter="md">
          <Box p="2" radius="sm" surface="muted">
            <Text size="sm" align="center">
              size=&quot;{size}&quot; — centered with a max width and gutters
            </Text>
          </Box>
        </Container>
      ))}
    </div>
  );
}
