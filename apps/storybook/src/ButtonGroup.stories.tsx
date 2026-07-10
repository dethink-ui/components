import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  DethinkProvider,
  IconButton,
  type ButtonGroupMode,
  type ButtonGroupOrientation,
  type ButtonSize,
  type ButtonVariant,
} from "@dethink/components";
import { MoreHorizontal } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  args: {
    "aria-label": "Document actions",
    mode: "attached",
    orientation: "horizontal",
    children: (
      <>
        <Button variant="outline">Save</Button>
        <Button variant="outline">Publish</Button>
        <IconButton aria-label="More document actions" variant="outline">
          <MoreHorizontal />
        </IconButton>
      </>
    ),
  },
  argTypes: {
    mode: {
      control: "inline-radio",
      options: ["attached", "separated"],
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const modes: ButtonGroupMode[] = ["attached", "separated"];
const orientations: ButtonGroupOrientation[] = ["horizontal", "vertical"];
const variants: ButtonVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "link",
  "destructive",
];
const sizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl", "icon"];

const highContrastStyle = {
  "--dt-color-background-light": "oklch(1 0 0)",
  "--dt-color-foreground-light": "oklch(0 0 0)",
  "--dt-color-muted-light": "oklch(0.94 0 0)",
  "--dt-color-muted-foreground-light": "oklch(0.16 0 0)",
  "--dt-color-border-light": "oklch(0 0 0)",
  "--dt-color-ring-light": "oklch(0 0 0)",
  "--dt-color-primary-light": "oklch(0.2 0.18 260)",
  "--dt-color-primary-foreground-light": "oklch(1 0 0)",
  "--dt-color-destructive-light": "oklch(0.4 0.22 28)",
  "--dt-color-destructive-foreground-light": "oklch(1 0 0)",
} as CSSProperties;

function StoryFrame({
  children,
  ...props
}: { children: ReactNode } & ComponentProps<typeof DethinkProvider>) {
  return (
    <DethinkProvider
      theme="light"
      className="border-border bg-background rounded-lg border p-6"
      {...props}
    >
      {children}
    </DethinkProvider>
  );
}

export const Base: Story = {};

export const ModesAndOrientations: Story = {
  render: () => (
    <StoryFrame>
      <div className="grid gap-6 sm:grid-cols-2">
        {modes.flatMap((mode) =>
          orientations.map((orientation) => (
            <div key={`${mode}-${orientation}`} className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                {mode} · {orientation}
              </p>
              <ButtonGroup
                aria-label={`${mode} ${orientation} actions`}
                mode={mode}
                orientation={orientation}
              >
                <Button variant="outline">Duplicate</Button>
                <Button variant="outline">Archive</Button>
                <Button variant="outline">Publish</Button>
              </ButtonGroup>
            </div>
          )),
        )}
      </div>
    </StoryFrame>
  ),
};

export const VariantsAndSizes: Story = {
  render: () => (
    <StoryFrame>
      <div className="space-y-6">
        {variants.map((variant) => (
          <ButtonGroup
            key={variant}
            aria-label={`${variant} actions`}
            className="me-4"
          >
            <Button variant={variant}>Preview</Button>
            <Button variant={variant}>Share</Button>
            {variant === "link" ? (
              <Button variant={variant}>Open details</Button>
            ) : (
              <IconButton
                aria-label={`More ${variant} actions`}
                variant={variant}
              >
                <MoreHorizontal />
              </IconButton>
            )}
          </ButtonGroup>
        ))}
        <div className="flex flex-wrap items-end gap-4">
          {sizes.map((size) => (
            <ButtonGroup key={size} aria-label={`${size} actions`}>
              <Button
                aria-label={size === "icon" ? "First icon action" : undefined}
                size={size}
                variant="outline"
              >
                {size === "icon" ? <MoreHorizontal /> : size}
              </Button>
              <Button
                aria-label={size === "icon" ? "Second icon action" : undefined}
                size={size}
                variant="outline"
              >
                {size === "icon" ? <MoreHorizontal /> : "Action"}
              </Button>
            </ButtonGroup>
          ))}
        </div>
      </div>
    </StoryFrame>
  ),
};

export const MixedStatesAndSeparator: Story = {
  render: () => (
    <StoryFrame>
      <div className="space-y-6">
        <ButtonGroup aria-label="Deployment actions">
          <Button variant="outline">Preview</Button>
          <ButtonGroupSeparator />
          <Button disabled variant="outline">
            Disabled
          </Button>
          <Button loading variant="outline">
            Publishing
          </Button>
          <Button variant="destructive">Delete</Button>
        </ButtonGroup>
        <p className="text-muted-foreground max-w-xl text-sm">
          Tab follows the native document order. Disabled and loading buttons
          are skipped; arrow keys do not move focus inside the group.
        </p>
      </div>
    </StoryFrame>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <StoryFrame key={theme} theme={theme}>
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm font-medium capitalize">
              {theme}
            </p>
            <ButtonGroup aria-label={`${theme} document actions`}>
              <Button variant="outline">Save</Button>
              <Button variant="outline">Publish</Button>
              <IconButton aria-label="More document actions" variant="outline">
                <MoreHorizontal />
              </IconButton>
            </ButtonGroup>
          </div>
        </StoryFrame>
      ))}
    </div>
  ),
};

export const DensityMatrix: Story = {
  render: () => (
    <div className="grid gap-4">
      {(["compact", "default", "comfortable"] as const).map((density) => (
        <StoryFrame key={density} density={density}>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-muted-foreground min-w-24 text-sm font-medium">
              {density}
            </span>
            <ButtonGroup
              aria-label={`${density} separated actions`}
              mode="separated"
            >
              <Button variant="outline">Preview</Button>
              <Button variant="outline">Share</Button>
            </ButtonGroup>
          </div>
        </StoryFrame>
      ))}
    </div>
  ),
};

export const HighContrastAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <StoryFrame style={highContrastStyle}>
        <div className="space-y-3">
          <p className="text-sm font-medium">High-contrast tokens</p>
          <ButtonGroup aria-label="High contrast actions">
            <Button variant="outline">Approve</Button>
            <Button variant="outline">Request changes</Button>
          </ButtonGroup>
        </div>
      </StoryFrame>
      <StoryFrame dir="rtl">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium">
            Right to left
          </p>
          <ButtonGroup aria-label="إجراءات المستند">
            <Button variant="outline">حفظ</Button>
            <Button variant="outline">نشر</Button>
            <IconButton aria-label="المزيد من الإجراءات" variant="outline">
              <MoreHorizontal />
            </IconButton>
          </ButtonGroup>
        </div>
      </StoryFrame>
    </div>
  ),
};
