"use client";

import {
  Box,
  Button,
  Calendar,
  Card,
  CardContent,
  CardStack,
  Checkbox,
  Container,
  Combobox,
  ComboboxItem,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  FieldControl,
  FieldLabel,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Link as DethinkLink,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Input,
  NumberInput,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectItem,
  Separator,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  Textarea,
  Timeline,
  type TimelineItemData,
} from "@dethink/components";
import { CalendarDate, CalendarDateTime } from "@internationalized/date";
import { ArrowRight, Bell, Play, Search } from "lucide-react";

export function ButtonTeaser() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Solid</Button>
      <Button size="sm" variant="soft">
        Soft
      </Button>
      <Button size="sm" variant="outline" rightIcon={<ArrowRight />}>
        Outline
      </Button>
    </div>
  );
}

export function CardTeaser() {
  return (
    <Card spacing="sm" shadow="none" className="w-full">
      <CardContent className="text-sm">
        <p className="font-heading font-semibold">Monthly active users</p>
        <p className="font-heading text-primary mt-1 text-2xl font-bold">
          24,310
        </p>
      </CardContent>
    </Card>
  );
}

export function InputTeaser() {
  return (
    <div className="w-full space-y-2">
      <Input
        controlSize="sm"
        placeholder="you@company.com"
        aria-label="Email teaser"
      />
      <Input
        controlSize="sm"
        invalid
        defaultValue="not an email"
        aria-label="Invalid teaser"
      />
    </div>
  );
}

export function CalendarTeaser() {
  return (
    <div className="flex h-36 w-full items-start justify-center overflow-hidden">
      <Calendar
        aria-label="Calendar teaser"
        defaultValue={new CalendarDate(2026, 7, 14)}
        className="origin-top scale-[0.7]"
      />
    </div>
  );
}

export function CardStackTeaser() {
  return (
    <CardStack
      aria-label="Card stack teaser"
      showControls={false}
      stackOffset={6}
    >
      {["Deck", "Layered", "Cards"].map((word) => (
        <Card key={word} spacing="sm" shadow="none">
          <CardContent className="text-sm">
            <p className="font-heading font-semibold">{word}</p>
          </CardContent>
        </Card>
      ))}
    </CardStack>
  );
}

export function DatePickerTeaser() {
  return (
    <div className="w-full">
      <DatePicker
        label="Ship date"
        defaultValue={new CalendarDate(2026, 7, 14)}
      />
    </div>
  );
}

export function DateRangePickerTeaser() {
  return (
    <div className="w-full origin-center scale-90">
      <DateRangePicker
        label="Stay"
        defaultValue={{
          start: new CalendarDate(2026, 7, 6),
          end: new CalendarDate(2026, 7, 17),
        }}
      />
    </div>
  );
}

export function BoxTeaser() {
  return (
    <div className="grid w-full grid-cols-2 gap-2">
      <Box p="3" radius="md" border="default" surface="background">
        <Text size="xs">border</Text>
      </Box>
      <Box p="3" radius="md" surface="muted">
        <Text size="xs">muted</Text>
      </Box>
      <Box p="3" radius="md" surface="info">
        <Text size="xs">info</Text>
      </Box>
      <Box p="3" radius="md" border="primary">
        <Text size="xs" tone="primary">
          primary
        </Text>
      </Box>
    </div>
  );
}

export function ContainerTeaser() {
  return (
    <div className="w-full space-y-1.5">
      {(["sm", "md"] as const).map((size) => (
        <Container key={size} size={size} gutter="none" className="max-w-full">
          <Box p="1" radius="sm" surface="muted">
            <Text size="xs" align="center">
              {size}
            </Text>
          </Box>
        </Container>
      ))}
    </div>
  );
}

export function StackTeaser() {
  return (
    <Stack gap="2" className="w-full">
      {["one", "two", "three"].map((label) => (
        <Box key={label} p="1" px="3" radius="sm" surface="muted">
          <Text size="xs">{label}</Text>
        </Box>
      ))}
    </Stack>
  );
}

export function FlexTeaser() {
  return (
    <Flex gap="2" className="w-full">
      <FlexItem>
        <Box p="2" radius="sm" surface="muted">
          <Text size="xs">fixed</Text>
        </Box>
      </FlexItem>
      <FlexItem grow="1">
        <Box p="2" radius="sm" surface="info">
          <Text size="xs">grow</Text>
        </Box>
      </FlexItem>
    </Flex>
  );
}

export function GridTeaser() {
  return (
    <Grid columns="3" gap="2" className="w-full">
      <GridItem colSpan="2">
        <Box p="2" radius="sm" surface="info">
          <Text size="xs">2</Text>
        </Box>
      </GridItem>
      <GridItem>
        <Box p="2" radius="sm" surface="muted">
          <Text size="xs">1</Text>
        </Box>
      </GridItem>
      <GridItem colSpan="full">
        <Box p="2" radius="sm" surface="muted">
          <Text size="xs">full</Text>
        </Box>
      </GridItem>
    </Grid>
  );
}

export function SeparatorTeaser() {
  return (
    <div className="w-full">
      <Text size="xs">Above</Text>
      <Separator spacing="2" />
      <Stack direction="horizontal" gap="2" align="center">
        <Text size="xs">Docs</Text>
        <Separator orientation="vertical" spacing="none" className="h-3" />
        <Text size="xs">Registry</Text>
      </Stack>
    </div>
  );
}

export function IconButtonTeaser() {
  return (
    <div className="flex items-center justify-center gap-2">
      <IconButton aria-label="Search" size="sm" variant="outline">
        <Search />
      </IconButton>
      <IconButton aria-label="Play" size="sm" shape="circle">
        <Play />
      </IconButton>
      <IconButton aria-label="Notifications" size="sm" variant="soft">
        <Bell />
      </IconButton>
    </div>
  );
}

export function LinkTeaser() {
  return (
    <Text size="sm">
      Read the <DethinkLink href="#">theming guide</DethinkLink> or the{" "}
      <DethinkLink href="#" variant="muted">
        changelog
      </DethinkLink>
      .
    </Text>
  );
}

export function TypographyTeaser() {
  return (
    <div className="w-full">
      <Heading level={3} visualLevel={4}>
        Heading
      </Heading>
      <Text size="sm" tone="muted">
        Body text with a muted tone.
      </Text>
      <Text size="xs" tone="primary" weight="medium">
        Caption in primary →
      </Text>
    </div>
  );
}

export function TableTeaser() {
  return (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>Version</TableHead>
          <TableHead align="end">Downloads</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono text-xs">1.4.0</TableCell>
          <TableCell align="end" className="text-xs tabular-nums">
            12,410
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono text-xs">1.3.2</TableCell>
          <TableCell align="end" className="text-xs tabular-nums">
            31,876
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export function DataTableTeaser() {
  return (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow selected>
          <TableCell className="text-xs">api-gateway</TableCell>
          <TableCell className="text-success text-xs">success</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-xs">billing</TableCell>
          <TableCell className="text-destructive text-xs">failed</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

const teaserTimelineItems: TimelineItemData[] = [
  { id: "t1", title: "Queued", status: "complete" },
  { id: "t2", title: "Building", status: "current" },
  { id: "t3", title: "Live", status: "upcoming" },
];

export function TimelineTeaser() {
  return (
    <div className="w-full origin-center scale-90">
      <Timeline
        aria-label="Timeline teaser"
        mode="progress"
        layout="stacked"
        interactive={false}
        items={teaserTimelineItems}
      />
    </div>
  );
}

export function DialogTeaser() {
  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger size="sm" variant="outline">
          Workspace settings
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Workspace settings</DialogTitle>
            <DialogDescription>Applies to every dashboard.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose variant="outline">Cancel</DialogClose>
            <DialogClose>Save</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PopoverTeaser() {
  return (
    <div className="flex justify-center">
      <Popover>
        <PopoverTrigger size="sm" variant="outline">
          Share dashboard
        </PopoverTrigger>
        <PopoverContent showArrow>
          <PopoverDescription className="px-[var(--dt-space-4)] py-[var(--dt-space-3)]">
            Anyone in the workspace can view.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function TooltipTeaser() {
  return (
    <div className="flex justify-center">
      <Tooltip delay={0}>
        <TooltipTrigger size="sm" variant="soft">
          Hover me
        </TooltipTrigger>
        <TooltipContent>Shows on hover and focus</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function DropdownMenuTeaser() {
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger size="sm" variant="outline">
          Actions
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSection>
            <DropdownMenuItem>
              <DropdownMenuItemLabel>Duplicate</DropdownMenuItemLabel>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>
              <DropdownMenuItemLabel>Delete</DropdownMenuItemLabel>
            </DropdownMenuItem>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function TextareaTeaser() {
  return (
    <Textarea
      aria-label="Textarea teaser"
      controlSize="sm"
      rows={3}
      resize="none"
      defaultValue="Shipping the new onboarding flow this week."
    />
  );
}

export function NumberInputTeaser() {
  return (
    <div className="w-full space-y-2">
      <Field id="teaser-ni">
        <FieldLabel className="text-sm">Seats</FieldLabel>
        <FieldControl asChild>
          <NumberInput
            controlSize="sm"
            type="number"
            min={1}
            defaultValue={12}
          />
        </FieldControl>
      </Field>
    </div>
  );
}

export function FormFieldTeaser() {
  return (
    <div className="w-full space-y-2">
      <Field id="teaser-ff" invalid>
        <FieldLabel className="text-sm">API key</FieldLabel>
        <FieldControl asChild>
          <Input controlSize="sm" defaultValue="sk_live_…" />
        </FieldControl>
      </Field>
      <p className="text-destructive text-xs">This key was revoked.</p>
    </div>
  );
}

export function CheckboxTeaser() {
  return (
    <div className="space-y-2.5">
      <Field id="teaser-cb-1" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox controlSize="sm" defaultChecked />
        </FieldControl>
        <FieldLabel className="text-sm">Unit tests</FieldLabel>
      </Field>
      <Field id="teaser-cb-2" orientation="horizontal">
        <FieldControl asChild>
          <Checkbox controlSize="sm" checked="indeterminate" readOnly />
        </FieldControl>
        <FieldLabel className="text-sm">Visual tests</FieldLabel>
      </Field>
    </div>
  );
}

export function RadioGroupTeaser() {
  return (
    <RadioGroup aria-label="Plan teaser" defaultValue="team" controlSize="sm">
      <div className="space-y-2.5">
        <Field id="teaser-rg-1" orientation="horizontal">
          <FieldControl asChild>
            <RadioGroupItem value="starter" />
          </FieldControl>
          <FieldLabel className="text-sm">Starter</FieldLabel>
        </Field>
        <Field id="teaser-rg-2" orientation="horizontal">
          <FieldControl asChild>
            <RadioGroupItem value="team" />
          </FieldControl>
          <FieldLabel className="text-sm">Team</FieldLabel>
        </Field>
      </div>
    </RadioGroup>
  );
}

export function SwitchTeaser() {
  return (
    <div className="space-y-2.5">
      <Field id="teaser-sw-1" orientation="horizontal">
        <FieldControl asChild>
          <Switch controlSize="sm" defaultChecked />
        </FieldControl>
        <FieldLabel className="text-sm">Autosave</FieldLabel>
      </Field>
      <Field id="teaser-sw-2" orientation="horizontal">
        <FieldControl asChild>
          <Switch controlSize="sm" />
        </FieldControl>
        <FieldLabel className="text-sm">Usage data</FieldLabel>
      </Field>
    </div>
  );
}

export function SelectTeaser() {
  return (
    <div className="w-full">
      <Select label="Region" defaultValue="eu-west" controlSize="sm">
        <SelectItem value="us-east">US East</SelectItem>
        <SelectItem value="eu-west">EU West</SelectItem>
        <SelectItem value="ap-south">AP South</SelectItem>
      </Select>
    </div>
  );
}

export function ComboboxTeaser() {
  return (
    <div className="w-full">
      <Combobox label="Assignee" placeholder="Type to filter" controlSize="sm">
        <ComboboxItem value="amara">Amara Okafor</ComboboxItem>
        <ComboboxItem value="jonas">Jonas Weber</ComboboxItem>
      </Combobox>
    </div>
  );
}

export function DateTimePickerTeaser() {
  return (
    <div className="w-full origin-center scale-90">
      <DateTimePicker
        label="Kickoff"
        defaultValue={new CalendarDateTime(2026, 7, 14, 9, 30)}
      />
    </div>
  );
}
