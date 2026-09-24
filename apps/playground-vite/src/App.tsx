import { CalendarDate, parseDateTime } from "@internationalized/date";
import { useState } from "react";
import {
  ChatBubble,
  ShaderHeroText,
  LiquidMeshBackground,
  SilkFlowBackground,
  CausticLightBackground,
  ContourFieldBackground,
  OrbitalGlowBackground,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Accordion,
  Box,
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardStack,
  CardScroller,
  CardScrollerItem,
  CardTitle,
  Calendar,
  Checkbox,
  Chat,
  type ChatMessageData,
  Combobox,
  ComboboxItem,
  Container,
  DataTable,
  DatePicker,
  DateRangePicker,
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
  DotMatrixBackground,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuItemShortcut,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  AuroraBackground,
  GridBeamsBackground,
  GridItem,
  LightStreaksBackground,
  MagneticBeamsBackground,
  ScanGridBackground,
  StarfieldBackground,
  Heading,
  HorizontalAccordion,
  IconButton,
  Input,
  Link,
  Divider,
  NumberInput,
  Slider,
  ExpressiveSlider,
  ResizableWorkspace,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  RangeCalendar,
  Select,
  SelectItem,
  Separator,
  SlotPicker,
  SlotPlanner,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  Text,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type DataTableColumnDef,
  type SlotPlannerSlotData,
} from "@dethink/components";

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M3.5 8h9M9 4.5 12.5 8 9 11.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M13 4.5V1.75h-2.75M3 11.5v2.75h2.75M12.15 6A4.5 4.5 0 0 0 4.2 3.7L3 5M3.85 10A4.5 4.5 0 0 0 11.8 12.3L13 11"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

type PlaygroundInvoice = {
  id: string;
  account: string;
  owner: string;
  status: string;
  total: number;
};

const playgroundInvoices: PlaygroundInvoice[] = [
  {
    id: "INV-3001",
    account: "Acme Operations",
    owner: "ops@example.com",
    status: "Paid",
    total: 12400,
  },
  {
    id: "INV-3002",
    account: "Dethink Labs",
    owner: "finance@example.com",
    status: "Open",
    total: 8750,
  },
  {
    id: "INV-3003",
    account: "Northstar Systems",
    owner: "revops@example.com",
    status: "Review",
    total: 3120,
  },
];

const playgroundInvoiceColumns: DataTableColumnDef<PlaygroundInvoice>[] = [
  {
    accessorKey: "account",
    header: "Account",
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ getValue }) =>
      new Intl.NumberFormat("en-US", {
        currency: "USD",
        style: "currency",
      }).format(getValue<number>()),
  },
];

// Deterministic slot data and "now" keep the SlotPlanner smoke stable.
const playgroundSlots: SlotPlannerSlotData[] = [
  {
    id: "smoke-architecture-review",
    date: "2026-07-06",
    startTime: "14:15",
    durationMinutes: 60,
    timeZone: "Europe/London",
    state: "requestable",
    recurrence: { frequency: "weekly" },
    data: { tags: ["Architecture Review"] },
  },
  {
    id: "smoke-pairing",
    date: "2026-07-07",
    startTime: "09:30",
    durationMinutes: 45,
    timeZone: "Europe/London",
    state: "requestable",
    capacity: 2,
    bookedCount: 1,
    data: { tags: ["Pair Programming"], note: "Bring a draft." },
  },
];

function ChatSmoke() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  return (
    <Chat
      conversationId="playground"
      messages={messages}
      className="border-border h-96 rounded-xl border"
      emptyState={<p>Send a prompt to verify the installed chat package.</p>}
      prompt={{
        onSend: ({ text }) =>
          setMessages((current) => [
            ...current,
            {
              id: String(current.length),
              conversationId: "playground",
              role: "user",
              parts: [{ id: "text", type: "text", text }],
            },
          ]),
      }}
    />
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
          <ChatSmoke />
          <section aria-label="Shader backgrounds smoke" className="grid gap-4">
            <LiquidMeshBackground animate={false} className="rounded-xl p-6">
              <h2>LiquidMesh background</h2>
            </LiquidMeshBackground>
            <SilkFlowBackground animate={false} className="rounded-xl p-6">
              <h2>SilkFlow background</h2>
            </SilkFlowBackground>
            <CausticLightBackground animate={false} className="rounded-xl p-6">
              <h2>CausticLight background</h2>
            </CausticLightBackground>
            <ContourFieldBackground animate={false} className="rounded-xl p-6">
              <h2>ContourField background</h2>
            </ContourFieldBackground>
            <OrbitalGlowBackground animate={false} className="rounded-xl p-6">
              <h2>OrbitalGlow background</h2>
            </OrbitalGlowBackground>
          </section>
          <section
            aria-label="Shader hero text smoke"
            className="border-border space-y-4 rounded-xl border p-6"
          >
            {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The text prop renders an accessible text span inside this polymorphic heading; axe coverage verifies it. */}
            <ShaderHeroText
              as="h2"
              text="A thousand points. One idea."
              animation="particle-follow"
              className="text-5xl font-semibold"
            />
            {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The text prop renders an accessible text span inside this polymorphic heading; axe coverage verifies it. */}
            <ShaderHeroText
              as="h2"
              text="Make waves."
              animation="liquid-ripple"
              className="text-4xl font-semibold"
            />
          </section>
          <Text tone="muted">
            This app verifies package imports, style imports, Tailwind tokens,
            the foundation provider, and the first wrapper, container, layout,
            action, navigation, typography, and date/time components.
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
            <ButtonGroup aria-label="Playground document actions">
              <Button variant="outline">Preview</Button>
              <ButtonGroupSeparator />
              <Button variant="outline">Publish</Button>
              <IconButton
                aria-label="Refresh grouped document"
                variant="outline"
              >
                <RefreshIcon />
              </IconButton>
            </ButtonGroup>
          </Flex>
          <Flex
            gap="3"
            align="center"
            className="border-border rounded-lg border p-3"
          >
            <FlexItem shrink="0">
              <Text size="sm" weight="medium">
                Flex smoke
              </Text>
            </FlexItem>
            <FlexItem grow="1" minInlineSize="0">
              <Text className="truncate" size="sm" tone="muted">
                Long content can shrink inside a FlexItem without forcing row
                overflow.
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
          <GridBeamsBackground
            className="border-border h-40 rounded-lg border"
            seed={2}
            tone="primary"
          >
            <Flex align="center" className="h-40" justify="center">
              <Text size="sm" weight="medium">
                GridBeamsBackground smoke
              </Text>
            </Flex>
          </GridBeamsBackground>
          <ScanGridBackground
            className="border-border h-40 rounded-lg border"
            seed={2}
            tone="primary"
          >
            <Flex align="center" className="h-40" justify="center">
              <Text size="sm" weight="medium">
                ScanGridBackground smoke
              </Text>
            </Flex>
          </ScanGridBackground>
          <DotMatrixBackground
            className="border-border h-40 rounded-lg border"
            seed={2}
            tone="primary"
          >
            <Flex align="center" className="h-40" justify="center">
              <Text size="sm" weight="medium">
                DotMatrixBackground smoke
              </Text>
            </Flex>
          </DotMatrixBackground>
          <LightStreaksBackground
            className="border-border h-40 rounded-lg border"
            seed={2}
            tone="primary"
          >
            <Flex align="center" className="h-40" justify="center">
              <Text size="sm" weight="medium">
                LightStreaksBackground smoke
              </Text>
            </Flex>
          </LightStreaksBackground>
          <MagneticBeamsBackground
            className="border-border h-40 rounded-lg border"
            seed={2}
            tone="foreground"
          >
            <Flex align="center" className="h-40" justify="center">
              <Text size="sm" weight="medium">
                MagneticBeamsBackground smoke
              </Text>
            </Flex>
          </MagneticBeamsBackground>
          <MagneticBeamsBackground
            className="border-border h-40 rounded-lg border"
            mode="follow"
            seed={2}
            tone="foreground"
          >
            <Flex align="center" className="h-40" justify="center">
              <Text size="sm" weight="medium">
                MagneticBeamsBackground follow smoke
              </Text>
            </Flex>
          </MagneticBeamsBackground>
          <StarfieldBackground
            className="border-border h-40 rounded-lg border"
            seed={2}
            tone="foreground"
          >
            <Flex align="center" className="h-40" justify="center">
              <Text size="sm" weight="medium">
                StarfieldBackground smoke
              </Text>
            </Flex>
          </StarfieldBackground>
          <AuroraBackground
            className="border-border h-40 rounded-lg border"
            seed={2}
            tone="primary"
          >
            <Flex align="center" className="h-40" justify="center">
              <Text size="sm" weight="medium">
                AuroraBackground smoke
              </Text>
            </Flex>
          </AuroraBackground>
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
                  Verifies the package export path for the interactive Card
                  deck.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Text size="sm" tone="muted">
                  The active card exposes controls while the inactive card is
                  inert.
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
          <CardScroller
            aria-label="Playground card scroller"
            defaultValue="overview"
          >
            <CardScrollerItem label="Overview card" value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>CardScroller smoke</CardTitle>
                  <CardDescription>
                    Verifies package selection and responsive scroll snap.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Text size="sm" tone="muted">
                    The whole static card selects its native radio.
                  </Text>
                </CardContent>
              </Card>
            </CardScrollerItem>
            <CardScrollerItem label="Activity card" value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                  <CardDescription>Second selectable card.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text size="sm" tone="muted">
                    Scrolling remains independent from selection.
                  </Text>
                </CardContent>
              </Card>
            </CardScrollerItem>
          </CardScroller>
          <Accordion
            aria-label="Playground accordion"
            defaultValue="setup"
            motionPreset="none"
          >
            <Accordion.Item value="setup">
              <Accordion.Blade>
                <Accordion.BladeText>Accordion smoke</Accordion.BladeText>
              </Accordion.Blade>
              <Accordion.Content>
                <Text size="sm" tone="muted">
                  Accordion smoke: a rounded vertical blade keeps content inside
                  the opened item and verifies the package export path.
                </Text>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="details">
              <Accordion.Blade>
                <Accordion.BladeText>Details</Accordion.BladeText>
              </Accordion.Blade>
              <Accordion.Content>
                <Text size="sm" tone="muted">
                  Multiple and single open modes are covered by component tests.
                </Text>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
          <HorizontalAccordion
            aria-label="Playground horizontal accordion"
            className="border-border rounded-lg border"
            defaultValue="overview"
            height={280}
          >
            <HorizontalAccordion.Item value="overview">
              <HorizontalAccordion.Blade aria-label="Overview">
                <HorizontalAccordion.BladeLabel>
                  Overview
                </HorizontalAccordion.BladeLabel>
              </HorizontalAccordion.Blade>
              <HorizontalAccordion.Panel className="p-[var(--dt-space-4)]">
                <Text size="sm" tone="muted">
                  HorizontalAccordion smoke: one expanded panel in a
                  fixed-height band, verified through the package export path.
                </Text>
              </HorizontalAccordion.Panel>
            </HorizontalAccordion.Item>
            <HorizontalAccordion.Item value="details">
              <HorizontalAccordion.Blade aria-label="Details">
                <HorizontalAccordion.BladeLabel>
                  Details
                </HorizontalAccordion.BladeLabel>
              </HorizontalAccordion.Blade>
              <HorizontalAccordion.Panel className="p-[var(--dt-space-4)]">
                <Text size="sm" tone="muted">
                  Inactive panels stay mounted by default.
                </Text>
              </HorizontalAccordion.Panel>
            </HorizontalAccordion.Item>
          </HorizontalAccordion>
          <Tabs defaultValue="overview" motionPreset="none">
            <Tabs.List aria-label="Playground tabs">
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="usage">Usage</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="overview">
              <Text size="sm" tone="muted">
                Tabs smoke: APG tab semantics, package exports, and static
                reduced-motion active layer.
              </Text>
            </Tabs.Panel>
            <Tabs.Panel value="usage">
              <Text size="sm" tone="muted">
                Usage panel content is associated with its trigger.
              </Text>
            </Tabs.Panel>
            <Tabs.Panel value="settings">
              <Text size="sm" tone="muted">
                Settings panel verifies additional trigger and panel wiring.
              </Text>
            </Tabs.Panel>
          </Tabs>
          <Card as="section">
            <CardHeader>
              <CardTitle>Table smoke</CardTitle>
              <CardDescription>
                Verifies semantic table slots, density, caption, row headers,
                and responsive overflow through the package export path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table density="compact" className="min-w-[36rem]">
                <TableCaption>Workspace request volume</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead align="end">Requests</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow selected>
                    <TableHead scope="row">Production</TableHead>
                    <TableCell>Healthy</TableCell>
                    <TableCell align="end" numeric>
                      12,400
                    </TableCell>
                  </TableRow>
                  <TableRow tone="muted">
                    <TableHead scope="row">Staging</TableHead>
                    <TableCell>Review</TableCell>
                    <TableCell align="end" numeric>
                      4,280
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow hoverable={false}>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell align="end" numeric>
                      16,680
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>DataTable smoke</CardTitle>
              <CardDescription>
                Verifies DataTable sorting, filtering, pagination, selection,
                and row actions through the package export path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                aria-label="Playground invoices"
                columns={playgroundInvoiceColumns}
                data={playgroundInvoices}
                defaultPagination={{ pageIndex: 0, pageSize: 2 }}
                density="compact"
                enableColumnVisibility
                enableGlobalFilter
                enablePagination
                getRowId={(row) => row.id}
                pageSizeOptions={[2, 3]}
                renderRowActions={(row) => (
                  <Button size="sm" variant="outline">
                    Open {row.original.id}
                  </Button>
                )}
                selectionMode="multiple"
              />
            </CardContent>
          </Card>
          <Box
            border="default"
            p="4"
            radius="lg"
            surface="muted"
            className="focus-within:ring-ring focus-within:ring-2"
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
          <Card as="section">
            <CardHeader>
              <CardTitle>Date suite smoke</CardTitle>
              <CardDescription>
                Verifies Calendar, RangeCalendar, DatePicker, DateRangePicker,
                and DateTimePicker through the package export path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 lg:grid-cols-2">
                <DatePicker
                  clearable
                  defaultValue={new CalendarDate(2026, 7, 14)}
                  description="Date-only field smoke."
                  label="Smoke date"
                  name="smokeDate"
                />
                <DateRangePicker
                  clearable
                  defaultValue={{
                    end: new CalendarDate(2026, 7, 18),
                    start: new CalendarDate(2026, 7, 14),
                  }}
                  description="Date range field smoke."
                  label="Smoke date range"
                  name="smokeDateRange"
                />
                <DateTimePicker
                  clearable
                  defaultValue={parseDateTime("2026-07-14T09:30")}
                  description="Date/time field smoke with selectable slots."
                  label="Smoke date and time"
                  name="smokeDateTime"
                  timeSelector
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Calendar
                    aria-label="Smoke calendar"
                    defaultValue={new CalendarDate(2026, 7, 14)}
                  />
                  <RangeCalendar
                    aria-label="Smoke range calendar"
                    defaultValue={{
                      end: new CalendarDate(2026, 7, 18),
                      start: new CalendarDate(2026, 7, 14),
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>SlotPlanner smoke</CardTitle>
              <CardDescription>
                Verifies the manage-mode planner, editor dialog dependencies,
                constraints, and Motion path through the package export.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SlotPlanner
                title="Availability"
                defaultSlots={playgroundSlots}
                defaultFocusedDate="2026-07-06"
                now="2026-07-06T00:30:00"
                constraints={{ dailyRequestableCap: 3 }}
              />
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>SlotPicker smoke</CardTitle>
              <CardDescription>
                Verifies the book-mode picker and viewer-zone projection through
                the package export.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SlotPicker
                title="Book a session"
                slots={playgroundSlots}
                viewerTimeZone="America/New_York"
                defaultFocusedDate="2026-07-06"
                now="2026-07-06T04:30:00Z"
                onBookRequest={() => undefined}
              />
            </CardContent>
          </Card>
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
              <CardTitle>Popover smoke</CardTitle>
              <CardDescription>
                Verifies anchored overlay exports, provider-aware portals, and
                token-backed content styling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger variant="outline">Open popover</PopoverTrigger>
                <PopoverContent showArrow>
                  <PopoverHeader>
                    <PopoverTitle>Refresh filters</PopoverTitle>
                    <PopoverDescription>
                      Queue a refresh after changing report filters.
                    </PopoverDescription>
                  </PopoverHeader>
                  <PopoverFooter>
                    <PopoverClose>Done</PopoverClose>
                  </PopoverFooter>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>Tooltip smoke</CardTitle>
              <CardDescription>
                Verifies hover and focus help through provider-aware portals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tooltip delay={0} closeDelay={0}>
                <TooltipTrigger aria-label="Refresh report" size="icon">
                  <RefreshIcon />
                </TooltipTrigger>
                <TooltipContent showArrow>Refresh report data</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>DropdownButton smoke</CardTitle>
              <CardDescription>
                Verifies the package export, one-button menu composition,
                controlled-ready state, positioning, and Motion-backed shared
                menu path.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <DropdownButton
                label="Create project"
                menuLabel="More create options"
                mode="split"
                motionPreset="subtle"
                onPrimaryAction={() => undefined}
                placement="bottom end"
                showArrow
              >
                <DropdownMenuSection>
                  <DropdownMenuLabel>Create</DropdownMenuLabel>
                  <DropdownMenuItem>Project</DropdownMenuItem>
                  <DropdownMenuItem>Workspace</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>Template</DropdownMenuItem>
                </DropdownMenuSection>
              </DropdownButton>
              <DropdownButton
                actions={[
                  {
                    description: "Add every commit through a merge commit.",
                    id: "merge",
                    label: "Create a merge commit",
                    onAction: () => undefined,
                  },
                  {
                    description: "Combine this branch into one commit.",
                    id: "squash",
                    label: "Squash and merge",
                    onAction: () => undefined,
                  },
                ]}
                defaultSelectedActionId="merge"
                menuLabel="Choose merge method"
                mode="selectable"
                motionPreset="subtle"
              />
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>DropdownMenu smoke</CardTitle>
              <CardDescription>
                Verifies action-menu exports, menu semantics, shortcuts, and the
                provider-aware portal path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DropdownMenu motionPreset="standard">
                <DropdownMenuTrigger variant="outline">
                  Open action menu
                </DropdownMenuTrigger>
                <DropdownMenuContent showArrow>
                  <DropdownMenuSection>
                    <DropdownMenuLabel>Report</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <DropdownMenuItemLabel>
                        Refresh report
                      </DropdownMenuItemLabel>
                      <DropdownMenuItemShortcut>R</DropdownMenuItemShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Duplicate report</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive>
                      Delete report
                    </DropdownMenuItem>
                  </DropdownMenuSection>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>Dialog smoke</CardTitle>
              <CardDescription>
                Verifies the package export, modal focus trap, and
                provider-aware portal path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger>Open dialog</DialogTrigger>
                <DialogContent
                  showCloseButton
                  closeButtonLabel="Close dialog smoke"
                >
                  <DialogHeader>
                    <DialogTitle>Deploy workspace changes</DialogTitle>
                    <DialogDescription>
                      Dialog content renders through the provider portal while
                      preserving tokens and focus behavior.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)]">
                    <Text size="sm" tone="muted">
                      This smoke path exercises the package entrypoint and
                      copied registry files in a consumer app.
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
              <CardTitle>AlertDialog smoke</CardTitle>
              <CardDescription>
                Verifies confirmation semantics, cancel/action slots, and the
                provider-aware portal path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger variant="destructive">
                  Delete smoke report
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete smoke report</AlertDialogTitle>
                    <AlertDialogDescription>
                      This confirmation exercises alertdialog semantics through
                      the package entrypoint.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    {/* eslint-disable jsx-a11y/no-autofocus -- Initial focus belongs in this newly opened modal. */}
                    <AlertDialogCancel autoFocus={true}>
                      {/* eslint-enable jsx-a11y/no-autofocus */}
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction variant="destructive">
                      Delete report
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>Drawer smoke</CardTitle>
              <CardDescription>
                Verifies the package export, spring drag-to-dismiss, and the
                provider-aware portal path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Drawer direction="right">
                <DrawerTrigger>Open drawer</DrawerTrigger>
                <DrawerContent
                  showCloseButton
                  closeButtonLabel="Close drawer smoke"
                >
                  <DrawerHeader>
                    <DrawerTitle>Deploy workspace changes</DrawerTitle>
                    <DrawerDescription>
                      Drawer content renders through the provider portal while
                      preserving tokens and drag/dismiss behavior.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)]">
                    <Text size="sm" tone="muted">
                      This smoke path exercises the package entrypoint and
                      copied registry files in a consumer app.
                    </Text>
                  </div>
                  <DrawerFooter>
                    <DrawerClose variant="outline">Cancel</DrawerClose>
                    <DrawerClose>Confirm</DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
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
                    <Input name="workspace" placeholder="Acme Ops" />
                  </FieldControl>
                  <FieldDescription>
                    Visible helper text is wired to the input.
                  </FieldDescription>
                </Field>
                <Field id="playground-owner" invalid>
                  <FieldLabel>Owner email</FieldLabel>
                  <FieldControl asChild>
                    <Input name="owner" defaultValue="owner" />
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
                    Numeric-entry controls keep string values until app
                    validation.
                  </FieldDescription>
                </Field>
                <FieldSet>
                  <ResizableWorkspace
                    id="playground-panes"
                    label="Resizable smoke"
                    className="h-80"
                    panes={[
                      {
                        id: "sources",
                        title: "Sources",
                        children: "Evidence",
                        collapsible: true,
                      },
                      {
                        id: "draft",
                        title: "Draft",
                        children: <input aria-label="Pane draft" />,
                      },
                    ]}
                  />
                  <Slider
                    label="Vertical smoke"
                    orientation="vertical"
                    defaultValue={45}
                  />
                  <ExpressiveSlider
                    label="Expressive smoke"
                    size="xl"
                    defaultValue={50}
                  />
                  <Slider
                    label="Stepper smoke"
                    mode="stepper"
                    steps={[
                      { value: 0, label: "Off" },
                      { value: 5, label: "On" },
                    ]}
                    defaultValue={5}
                    name="stepperSmoke"
                  />
                  <Slider
                    label="Slider smoke"
                    name="sliderSmoke"
                    defaultValue={40}
                  />
                  <Slider<[number, number]>
                    label="Range smoke"
                    defaultValue={[20, 70]}
                  />
                  <FieldLegend>Channels</FieldLegend>
                  <FieldGroup>
                    <Field id="playground-email" orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Email</FieldTitle>
                        <FieldDescription>
                          Send operational reports.
                        </FieldDescription>
                      </FieldContent>
                      <FieldControl asChild>
                        <Checkbox
                          name="channels"
                          value="email"
                          defaultChecked
                        />
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
                      <Field
                        id="playground-mode-balanced"
                        orientation="horizontal"
                      >
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
                    <FieldDescription>
                      Require a second verification step.
                    </FieldDescription>
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
      <ChatBubble
        contentProps={{
          title: "Playground chat",
          subtitle: "Package smoke check",
        }}
        chat={{
          conversationId: "playground-bubble",
          messages: [],
          emptyState: <p>ChatBubble is installed and ready.</p>,
          prompt: { onSend: () => false },
        }}
      />
    </DethinkProvider>
  );
}
