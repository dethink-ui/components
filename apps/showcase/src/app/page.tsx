import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import {
  BoxTeaser,
  ButtonTeaser,
  CalendarTeaser,
  CardStackTeaser,
  CardTeaser,
  CheckboxTeaser,
  ComboboxTeaser,
  ContainerTeaser,
  DataTableTeaser,
  DatePickerTeaser,
  DateRangePickerTeaser,
  DateTimePickerTeaser,
  DialogTeaser,
  DropdownMenuTeaser,
  FlexTeaser,
  FormFieldTeaser,
  GridTeaser,
  IconButtonTeaser,
  InputTeaser,
  LinkTeaser,
  NumberInputTeaser,
  PopoverTeaser,
  RadioGroupTeaser,
  SelectTeaser,
  SeparatorTeaser,
  StackTeaser,
  SwitchTeaser,
  TableTeaser,
  TextareaTeaser,
  TimelineTeaser,
  TooltipTeaser,
  TypographyTeaser,
} from "@/components/component-teasers";
import { LandingHero } from "@/components/landing-hero";
import { componentCatalog } from "@/lib/components-meta";

const teasers: Record<string, ReactNode> = {
  box: <BoxTeaser />,
  button: <ButtonTeaser />,
  calendar: <CalendarTeaser />,
  card: <CardTeaser />,
  "card-stack": <CardStackTeaser />,
  checkbox: <CheckboxTeaser />,
  combobox: <ComboboxTeaser />,
  container: <ContainerTeaser />,
  "data-table": <DataTableTeaser />,
  "date-picker": <DatePickerTeaser />,
  "date-range-picker": <DateRangePickerTeaser />,
  "date-time-picker": <DateTimePickerTeaser />,
  dialog: <DialogTeaser />,
  "dropdown-menu": <DropdownMenuTeaser />,
  flex: <FlexTeaser />,
  "form-field": <FormFieldTeaser />,
  grid: <GridTeaser />,
  "icon-button": <IconButtonTeaser />,
  input: <InputTeaser />,
  link: <LinkTeaser />,
  "number-input": <NumberInputTeaser />,
  popover: <PopoverTeaser />,
  "radio-group": <RadioGroupTeaser />,
  select: <SelectTeaser />,
  separator: <SeparatorTeaser />,
  stack: <StackTeaser />,
  switch: <SwitchTeaser />,
  table: <TableTeaser />,
  textarea: <TextareaTeaser />,
  timeline: <TimelineTeaser />,
  tooltip: <TooltipTeaser />,
  typography: <TypographyTeaser />,
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="sc-hero-backdrop border-border/70 border-b">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <LandingHero />
        </div>
      </section>

      <section
        aria-labelledby="catalog-heading"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h2
              id="catalog-heading"
              className="font-heading text-3xl font-bold tracking-tight"
            >
              Documented components
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Each page pairs live previews with the exact source behind them,
              installation steps, and a full props reference.
            </p>
          </div>
          <Link
            href="/components"
            className="text-primary inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {componentCatalog.map((component) => (
            <li key={component.slug} className="h-full">
              <article className="group border-border bg-background hover:border-primary/50 flex h-full flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <div className="sc-preview-surface border-border/70 flex min-h-36 flex-1 items-center justify-center border-b p-6">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none w-full max-w-60"
                    // Teasers are decorative previews; the link text carries meaning.
                    inert
                  >
                    {teasers[component.slug]}
                  </div>
                </div>
                <div className="space-y-1.5 p-5">
                  <h3 className="font-heading flex items-center justify-between text-lg font-semibold">
                    <Link
                      href={`/components/${component.slug}`}
                      className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      {component.name}
                      <ArrowRight
                        aria-hidden="true"
                        className="text-muted-foreground group-hover:text-primary size-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </h3>
                  <p className="text-muted-foreground text-sm leading-6">
                    {component.description}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="principles-heading"
        className="border-border/70 bg-muted/40 border-t"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="principles-heading" className="sr-only">
            Principles
          </h2>
          <dl className="grid gap-10 md:grid-cols-3">
            <div className="space-y-2">
              <dt className="font-heading text-lg font-semibold">
                <span aria-hidden="true" className="text-primary mr-2">
                  01
                </span>
                Own the code
              </dt>
              <dd className="text-muted-foreground text-sm leading-6">
                Components install as readable source through a
                shadcn-compatible registry. No black-box package — edit
                anything.
              </dd>
            </div>
            <div className="space-y-2">
              <dt className="font-heading text-lg font-semibold">
                <span aria-hidden="true" className="text-primary mr-2">
                  02
                </span>
                Themed by tokens
              </dt>
              <dd className="text-muted-foreground text-sm leading-6">
                Every color, radius, font, and density value is a CSS variable.
                This site&apos;s teal brand is a pure token override — zero
                component changes.
              </dd>
            </div>
            <div className="space-y-2">
              <dt className="font-heading text-lg font-semibold">
                <span aria-hidden="true" className="text-primary mr-2">
                  03
                </span>
                Accessible by default
              </dt>
              <dd className="text-muted-foreground text-sm leading-6">
                Keyboard support, focus rings, ARIA states, and reduced-motion
                behavior are built in and covered by automated a11y tests.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
