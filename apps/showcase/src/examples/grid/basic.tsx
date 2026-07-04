"use client";

import { Box, Grid, GridItem, Text } from "@dethink/components";

export function GridBasic() {
  return (
    <Grid columns="3" gap="3" className="mx-auto max-w-md">
      <GridItem colSpan="2">
        <Box p="3" radius="md" surface="info">
          <Text size="sm">colSpan=2</Text>
        </Box>
      </GridItem>
      <GridItem>
        <Box p="3" radius="md" surface="muted">
          <Text size="sm">1</Text>
        </Box>
      </GridItem>
      <GridItem>
        <Box p="3" radius="md" surface="muted">
          <Text size="sm">1</Text>
        </Box>
      </GridItem>
      <GridItem colSpan="full">
        <Box p="3" radius="md" surface="muted">
          <Text size="sm">colSpan=full</Text>
        </Box>
      </GridItem>
    </Grid>
  );
}
