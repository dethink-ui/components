import {
  Box,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardStack,
  CardTitle,
  Checkbox,
  Combobox,
  ComboboxItem,
  Container,
  DateTimePicker,
  DethinkProvider,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
  Flex,
  FlexItem,
  Form,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Input,
  Link,
  Divider,
  NumberInput,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectItem,
  Separator,
  Stack,
  Switch,
  Text,
  Textarea,
} from "@dethink/components";

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path
        d="M13 4.5V1.75h-2.75M3 11.5v2.75h2.75M12.15 6A4.5 4.5 0 0 0 4.2 3.7L3 5M3.85 10A4.5 4.5 0 0 0 11.8 12.3L13 11"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function App() {
  return (
    <DethinkProvider className="min-h-screen p-8" theme="light">
      <Container as="main" size="md">
        <Stack gap="4">
          <Text size="sm" tone="muted" weight="medium">
            @dethink/components playground
          </Text>
          <Heading level={1} visualLevel={2}>
            Foundation scaffold is active
          </Heading>
          <Text tone="muted">
            This app verifies package imports, style imports, Tailwind tokens, the
            foundation provider, and the first wrapper, container, layout, action,
            navigation, typography, and date/time components.
          </Text>
          <Flex gap="2" align="center" wrap="wrap">
            <Button>Primary action</Button>
            <Button variant="outline">Secondary action</Button>
            <Button variant="ghost">Quiet action</Button>
            <Button loading>Saving</Button>
            <Button asChild rightIcon={<ArrowRightIcon />}>
              <a href="#smoke-input">Jump to input</a>
            </Button>
            <Link href="#smoke-link-target" underline="always">
              Smoke link
            </Link>
            <IconButton aria-label="Refresh playground" variant="outline">
              <RefreshIcon />
            </IconButton>
          </Flex>
          <Flex gap="3" align="center" className="rounded-lg border border-border p-3">
            <FlexItem shrink="0">
              <Text size="sm" weight="medium">
                Flex smoke
              </Text>
            </FlexItem>
            <FlexItem grow="1" minInlineSize="0">
              <Text className="truncate" size="sm" tone="muted">
                Long content can shrink inside a FlexItem without forcing row overflow.
              </Text>
            </FlexItem>
            <FlexItem shrink="0">
              <Button size="sm" variant="outline">
                Inspect
              </Button>
            </FlexItem>
          </Flex>
          <Grid columns="auto-fit-xs" gap="3">
            {["Grid smoke", "Auto-fit tracks", "Token gaps"].map((label) => (
              <GridItem key={label} minInlineSize="0">
                <Box border="default" p="3" radius="md" surface="background">
                  <Text size="sm" weight="medium">
                    {label}
                  </Text>
                </Box>
              </GridItem>
            ))}
          </Grid>
          <Separator spacing="1" />
          <Flex align="center" gap="3">
            <Text size="sm" weight="medium">
              Separator smoke
            </Text>
            <Separator as="div" orientation="vertical" decorative />
            <Text size="sm" tone="muted">
              Divider alias follows the same contract.
            </Text>
          </Flex>
          <Divider decorative spacing="1" tone="muted" />
          <Card as="section">
            <CardHeader>
              <CardTitle>Card smoke</CardTitle>
              <CardDescription>
                Verifies the package export path for Card and its anatomy slots.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text size="sm" tone="muted">
                Card composes existing layout, text, and action primitives.
              </Text>
            </CardContent>
            <CardFooter justify="end">
              <Button size="sm" variant="outline">
                Inspect card
              </Button>
            </CardFooter>
          </Card>
          <CardStack aria-label="Playground card stack">
            <Card as="article">
              <CardHeader>
                <CardTitle>CardStack smoke</CardTitle>
                <CardDescription>
                  Verifies the package export path for the interactive Card deck.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Text size="sm" tone="muted">
                  The active card exposes controls while the inactive card is inert.
                </Text>
              </CardContent>
            </Card>
            <Card as="article">
              <CardHeader>
                <CardTitle>Second stacked card</CardTitle>
                <CardDescription>Navigation loops by default.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" variant="outline">
                  Active only
                </Button>
              </CardContent>
            </Card>
          </CardStack>
          <Box
            border="default"
            p="4"
            radius="lg"
            surface="muted"
            className="focus-within:ring-2 focus-within:ring-ring"
          >
            <label className="block text-sm font-medium" htmlFor="smoke-input">
              Smoke input
            </label>
            <Input
              id="smoke-input"
              className="mt-2"
              placeholder="Token-backed field"
            />
          </Box>
          <Text id="smoke-link-target" size="sm" tone="muted">
            Link smoke target reached through native anchor behavior.
          </Text>
          <DateTimePicker
            clearable
            description="Verifies the date/time registry dependency path."
            label="Smoke date and time"
            name="smokeDateTime"
          />
          <Select
            description="Verifies the Select package export and React Aria dependency path."
            label="Smoke workspace"
            name="smokeWorkspace"
            defaultValue="production"
          >
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="sandbox">Sandbox</SelectItem>
          </Select>
          <Combobox
            description="Verifies the Combobox package export and React Aria autocomplete path."
            label="Smoke searchable workspace"
            name="smokeSearchableWorkspace"
            defaultValue="production"
          >
            <ComboboxItem value="production">Production</ComboboxItem>
            <ComboboxItem value="staging">Staging</ComboboxItem>
            <ComboboxItem value="sandbox">Sandbox</ComboboxItem>
          </Combobox>
          <Card as="section">
            <CardHeader>
              <CardTitle>Dialog smoke</CardTitle>
              <CardDescription>
                Verifies the package export, modal focus trap, and provider-aware
                portal path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger>Open dialog</DialogTrigger>
                <DialogContent showCloseButton closeButtonLabel="Close dialog smoke">
                  <DialogHeader>
                    <DialogTitle>Deploy workspace changes</DialogTitle>
                    <DialogDescription>
                      Dialog content renders through the provider portal while
                      preserving tokens and focus behavior.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)]">
                    <Text size="sm" tone="muted">
                      This smoke path exercises the package entrypoint and copied
                      registry files in a consumer app.
                    </Text>
                  </div>
                  <DialogFooter>
                    <DialogClose variant="outline">Cancel</DialogClose>
                    <DialogClose>Confirm</DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>Form field smoke</CardTitle>
              <CardDescription>
                Verifies package exports for Form, Field, labels, descriptions,
                errors, fieldsets, legends, and grouped rows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form action="/settings" method="post">
                <Field id="playground-workspace" required>
                  <FieldLabel>Workspace</FieldLabel>
                  <FieldControl asChild>
                    <Input
                      name="workspace"
                      placeholder="Acme Ops"
                    />
                  </FieldControl>
                  <FieldDescription>Visible helper text is wired to the input.</FieldDescription>
                </Field>
                <Field id="playground-owner" invalid>
                  <FieldLabel>Owner email</FieldLabel>
                  <FieldControl asChild>
                    <Input
                      name="owner"
                      defaultValue="owner"
                    />
                  </FieldControl>
                  <FieldError>Enter a valid owner email.</FieldError>
                </Field>
                <Field id="playground-summary">
                  <FieldLabel>Summary</FieldLabel>
                  <FieldControl asChild>
                    <Textarea
                      name="summary"
                      defaultValue="Textarea smoke through the package export path."
                      rows={3}
                    />
                  </FieldControl>
                  <FieldDescription>
                    Multiline controls share the same Field wiring.
                  </FieldDescription>
                </Field>
                <Field id="playground-quota">
                  <FieldLabel>Quota</FieldLabel>
                  <FieldControl asChild>
                    <NumberInput
                      name="quota"
                      numberMode="numeric"
                      defaultValue="25"
                    />
                  </FieldControl>
                  <FieldDescription>
                    Numeric-entry controls keep string values until app validation.
                  </FieldDescription>
                </Field>
                <FieldSet>
                  <FieldLegend>Channels</FieldLegend>
                  <FieldGroup>
                    <Field id="playground-email" orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Email</FieldTitle>
                        <FieldDescription>Send operational reports.</FieldDescription>
                      </FieldContent>
                      <FieldControl asChild>
                        <Checkbox name="channels" value="email" defaultChecked />
                      </FieldControl>
                    </Field>
                  </FieldGroup>
                </FieldSet>
                <FieldSet>
                  <FieldLegend>Response mode</FieldLegend>
                  <RadioGroup name="responseMode" defaultValue="balanced">
                    <FieldGroup>
                      <Field id="playground-mode-fast" orientation="horizontal">
                        <FieldControl asChild>
                          <RadioGroupItem value="fast" />
                        </FieldControl>
                        <FieldLabel>Fast</FieldLabel>
                      </Field>
                      <Field id="playground-mode-balanced" orientation="horizontal">
                        <FieldControl asChild>
                          <RadioGroupItem value="balanced" />
                        </FieldControl>
                        <FieldLabel>Balanced</FieldLabel>
                      </Field>
                    </FieldGroup>
                  </RadioGroup>
                </FieldSet>
                <Field id="playground-mfa" orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Multi-factor authentication</FieldTitle>
                    <FieldDescription>Require a second verification step.</FieldDescription>
                  </FieldContent>
                  <FieldControl asChild>
                    <Switch name="multiFactor" value="enabled" defaultChecked />
                  </FieldControl>
                </Field>
                <Button type="submit" size="sm">
                  Save fields
                </Button>
              </Form>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </DethinkProvider>
  );
}
