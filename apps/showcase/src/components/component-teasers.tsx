"use client";

import {
  Button,
  Calendar,
  Card,
  CardContent,
  CardStack,
  Checkbox,
  Combobox,
  ComboboxItem,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  Field,
  FieldControl,
  FieldLabel,
  Input,
  NumberInput,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@dethink/components";
import { CalendarDate, CalendarDateTime } from "@internationalized/date";
import { ArrowRight } from "lucide-react";

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
        <p className="mt-1 font-heading text-2xl font-bold text-primary">24,310</p>
      </CardContent>
    </Card>
  );
}

export function InputTeaser() {
  return (
    <div className="w-full space-y-2">
      <Input controlSize="sm" placeholder="you@company.com" aria-label="Email teaser" />
      <Input controlSize="sm" invalid defaultValue="not an email" aria-label="Invalid teaser" />
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
    <CardStack aria-label="Card stack teaser" showControls={false} stackOffset={6}>
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
          <NumberInput controlSize="sm" type="number" min={1} defaultValue={12} />
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
      <p className="text-xs text-destructive">This key was revoked.</p>
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
      <Combobox
        label="Assignee"
        placeholder="Type to filter"
        controlSize="sm"
      >
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
