"use client";

import {
  Box,
  Container,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Heading,
  Separator,
  Stack,
  Text,
} from "@dethink/components";

const stats = [
  { label: "Requests", value: "1.2M", delta: "+8.1%" },
  { label: "p99 latency", value: "212 ms", delta: "−4.3%" },
  { label: "Error rate", value: "0.04%", delta: "−0.01%" },
];

/**
 * A dashboard skeleton built only from the layout and typography
 * primitives — no custom CSS. Container centers, Flex lays out the header,
 * Grid places the stat tiles, Stack handles vertical rhythm, and Box
 * provides every surface.
 */
export function LayoutRecipeDashboard() {
  return (
    <Container size="md" gutter="none">
      <Stack gap="4">
        <Flex align="center" justify="between" gap="4">
          <Stack gap="1">
            <Heading level={3}>Operations</Heading>
            <Text size="sm" tone="muted">
              Production · last 24 hours
            </Text>
          </Stack>
          <Box px="3" py="1" radius="full" surface="muted">
            <Text size="xs" weight="medium">
              All systems normal
            </Text>
          </Box>
        </Flex>
        <Separator spacing="none" />
        <Grid columns="3" gap="3">
          {stats.map((stat) => (
            <GridItem key={stat.label}>
              <Box p="4" radius="md" border="default" surface="background">
                <Stack gap="1">
                  <Text size="xs" tone="muted">
                    {stat.label}
                  </Text>
                  <Text size="xl" weight="semibold">
                    {stat.value}
                  </Text>
                  <Text size="xs" tone="subtle">
                    {stat.delta} vs yesterday
                  </Text>
                </Stack>
              </Box>
            </GridItem>
          ))}
          <GridItem colSpan="full">
            <Box p="4" radius="md" surface="muted">
              <Flex align="center" gap="3">
                <FlexItem grow="1">
                  <Text size="sm">
                    Traffic is shifting to EU West — consider raising the
                    regional capacity floor.
                  </Text>
                </FlexItem>
                <Text size="xs" tone="primary" weight="medium">
                  Review →
                </Text>
              </Flex>
            </Box>
          </GridItem>
        </Grid>
      </Stack>
    </Container>
  );
}
