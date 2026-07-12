import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useState } from "react";
import {
  Accordion,
  DethinkProvider,
  type AccordionMultipleValue,
  type AccordionProps,
  type AccordionSingleProps,
  type AccordionValue,
} from "@dethink/components";

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M12 3 5 6v5c0 4.2 2.8 7.7 7 10 4.2-2.3 7-5.8 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.7-4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M4 19V5M4 19h16M8 15v-4m4 4V8m4 7V9" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

const sections = [
  {
    value: "overview",
    label: "Overview",
    icon: <ChevronIcon />,
    title: "Workspace overview",
    body: "A rounded blade keeps the trigger and content together, so the opened section reads as one object.",
  },
  {
    value: "security",
    label: "Security",
    icon: <ShieldIcon />,
    title: "Security controls",
    body: "Use arbitrary content inside the blade: forms, status lists, media, or richer workflow panels.",
  },
  {
    value: "analytics",
    label: "Analytics",
    icon: <ChartIcon />,
    title: "Analytics detail",
    body: "Single mode keeps one blade open at a time. Multiple mode lets users compare several open blades.",
  },
] as const;

function PanelBody({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid gap-2">
      <h3 className="text-foreground text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground max-w-xl text-sm leading-6">{body}</p>
      <div className="border-border bg-background mt-2 grid gap-2 rounded-md border p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Readiness</span>
          <span className="text-primary text-sm font-semibold">92%</span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div className="bg-primary h-full w-[92%]" />
        </div>
      </div>
    </div>
  );
}

function DemoAccordion(props: Partial<AccordionSingleProps>) {
  return (
    <Accordion
      aria-label="Workspace sections"
      className="max-w-2xl"
      defaultValue="overview"
      {...props}
    >
      {sections.map((section) => (
        <Accordion.Item key={section.value} value={section.value}>
          <Accordion.Blade>
            <Accordion.BladeIcon>{section.icon}</Accordion.BladeIcon>
            <Accordion.BladeText>{section.label}</Accordion.BladeText>
          </Accordion.Blade>
          <Accordion.Content>
            <PanelBody body={section.body} title={section.title} />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

function getSingleStoryArgs(
  args: Partial<AccordionProps>,
): Partial<AccordionSingleProps> {
  const {
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    type: _type,
    value: _value,
    ...rest
  } = args;

  return rest as Partial<AccordionSingleProps>;
}

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  args: {
    collapsible: true,
    motionPreset: "standard",
    type: "single",
  },
  argTypes: {
    collapsible: { control: "boolean" },
    motionPreset: {
      control: "inline-radio",
      options: ["none", "subtle", "standard", "expressive"],
    },
    type: {
      control: "inline-radio",
      options: ["single", "multiple"],
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => <DemoAccordion {...getSingleStoryArgs(args)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const securityBlade = canvas.getByRole("button", { name: "Security" });

    await userEvent.click(securityBlade);
    await waitFor(() =>
      expect(canvas.getByText("Security controls")).toBeVisible(),
    );
    await expect(securityBlade).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(securityBlade);
    await expect(securityBlade).toHaveAttribute("aria-expanded", "false");
  },
};

export const MultipleOpen: Story = {
  render: (args) => (
    <Accordion
      aria-label="Comparable sections"
      className="max-w-2xl"
      defaultValue={["overview", "analytics"]}
      disabled={args.disabled}
      motionPreset={args.motionPreset}
      type="multiple"
    >
      {sections.map((section) => (
        <Accordion.Item key={section.value} value={section.value}>
          <Accordion.Blade>
            <Accordion.BladeIcon>{section.icon}</Accordion.BladeIcon>
            <Accordion.BladeText>{section.label}</Accordion.BladeText>
          </Accordion.Blade>
          <Accordion.Content>
            <PanelBody body={section.body} title={section.title} />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("button", { name: "Overview" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      canvas.getByRole("button", { name: "Analytics" }),
    ).toHaveAttribute("aria-expanded", "true");
  },
};

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [value, setValue] = useState<AccordionValue>("security");

    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.value}
              className="border-border text-foreground data-[active=true]:bg-muted rounded-md border px-3 py-1 text-sm"
              data-active={value === section.value}
              onClick={() => setValue(section.value)}
              type="button"
            >
              {section.label}
            </button>
          ))}
          <button
            className="border-border text-muted-foreground rounded-md border px-3 py-1 text-sm"
            onClick={() => setValue(undefined)}
            type="button"
          >
            Close all
          </button>
        </div>
        <DemoAccordion
          {...getSingleStoryArgs(args)}
          onValueChange={setValue}
          value={value}
        />
      </div>
    );
  },
};

export const DisabledAndIconOnly: Story = {
  render: (args) => (
    <Accordion
      aria-label="Icon-only blades"
      className="max-w-xl"
      defaultValue="health"
      disabled={args.disabled}
      motionPreset={args.motionPreset}
    >
      <Accordion.Item value="health">
        <Accordion.Blade aria-label="Health">
          <Accordion.BladeIcon>
            <ShieldIcon />
          </Accordion.BladeIcon>
        </Accordion.Blade>
        <Accordion.Content>
          <p>Health checks are active and monitored.</p>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item disabled value="layers">
        <Accordion.Blade>
          <Accordion.BladeIcon>
            <LayersIcon />
          </Accordion.BladeIcon>
          <Accordion.BladeText>Layers</Accordion.BladeText>
        </Accordion.Blade>
        <Accordion.Content>
          <p>This disabled blade cannot be opened.</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export const ForceMounted: Story = {
  render: (args) => (
    <Accordion
      aria-label="Force-mounted sections"
      className="max-w-2xl"
      defaultValue={undefined}
      motionPreset={args.motionPreset}
    >
      {sections.map((section) => (
        <Accordion.Item key={section.value} value={section.value}>
          <Accordion.Blade>
            <Accordion.BladeIcon>{section.icon}</Accordion.BladeIcon>
            <Accordion.BladeText>{section.label}</Accordion.BladeText>
          </Accordion.Blade>
          <Accordion.Content forceMount>
            <PanelBody body={section.body} title={section.title} />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  ),
  args: {
    motionPreset: "none",
  },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <DemoAccordion {...getSingleStoryArgs(args)} motionPreset="none" />
  ),
};

export const DarkAndCompactDensity: Story = {
  render: (args) => (
    <DethinkProvider
      className="bg-background rounded-xl p-6"
      density="compact"
      theme="dark"
    >
      <DemoAccordion {...getSingleStoryArgs(args)} />
    </DethinkProvider>
  ),
};

export const ControlledMultiple: Story = {
  render: function ControlledMultipleStory(args) {
    const [value, setValue] = useState<AccordionMultipleValue>([
      "overview",
      "security",
    ]);

    return (
      <Accordion
        aria-label="Controlled multiple sections"
        className="max-w-2xl"
        disabled={args.disabled}
        motionPreset={args.motionPreset}
        onValueChange={setValue}
        type="multiple"
        value={value}
      >
        {sections.map((section) => (
          <Accordion.Item key={section.value} value={section.value}>
            <Accordion.Blade>
              <Accordion.BladeIcon>{section.icon}</Accordion.BladeIcon>
              <Accordion.BladeText>{section.label}</Accordion.BladeText>
            </Accordion.Blade>
            <Accordion.Content forceMount>
              <PanelBody body={section.body} title={section.title} />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  },
};
