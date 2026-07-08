import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  DethinkProvider,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Form,
  Grid,
  Input,
  NumberInput,
  Textarea,
} from "@dethink/components";

const meta = {
  title: "Components/InputControls",
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const NativeFormComposition: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <Card as="section">
          <CardHeader>
            <CardTitle>Project settings</CardTitle>
            <CardDescription>
              The suite keeps native form submission and FieldControl wiring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form action="/projects" method="post">
              <div className="grid min-w-0 gap-4">
                <Field id="project-name" className="min-w-0">
                  <FieldLabel>Project name</FieldLabel>
                  <FieldControl asChild>
                    <Input name="name" defaultValue="Operations Console" />
                  </FieldControl>
                </Field>
                <Field id="project-quota" className="min-w-0">
                  <FieldLabel>Monthly quota</FieldLabel>
                  <FieldControl asChild>
                    <NumberInput
                      name="quota"
                      numberMode="numeric"
                      defaultValue="250"
                    />
                  </FieldControl>
                  <FieldDescription>
                    Submitted as a string value.
                  </FieldDescription>
                </Field>
                <Field id="project-summary" className="min-w-0">
                  <FieldLabel>Summary</FieldLabel>
                  <FieldControl asChild>
                    <Textarea
                      name="summary"
                      defaultValue="Coordinates operational workflows for support teams."
                      rows={4}
                    />
                  </FieldControl>
                </Field>
                <Button type="submit" className="w-full">
                  Save project
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </DethinkProvider>
  ),
};

export const CRUDFilterAndEditor: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="lg">
        <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Card as="aside">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Search and numeric filters stay native.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form>
                <Field id="filter-query">
                  <FieldLabel>Query</FieldLabel>
                  <FieldControl asChild>
                    <Input name="query" placeholder="Owner, project, or slug" />
                  </FieldControl>
                </Field>
                <Field id="filter-min-errors">
                  <FieldLabel>Minimum errors</FieldLabel>
                  <FieldControl asChild>
                    <NumberInput name="minErrors" numberMode="numeric" />
                  </FieldControl>
                </Field>
              </Form>
            </CardContent>
          </Card>
          <Card as="section">
            <CardHeader>
              <CardTitle>Edit incident</CardTitle>
              <CardDescription>
                Textarea remains plain native text entry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form>
                <Field id="incident-title" required>
                  <FieldLabel>Title</FieldLabel>
                  <FieldControl asChild>
                    <Input name="title" defaultValue="Checkout latency" />
                  </FieldControl>
                </Field>
                <Field id="incident-impact" invalid>
                  <FieldLabel>Impact</FieldLabel>
                  <FieldControl asChild>
                    <Textarea name="impact" defaultValue="Slow" rows={5} />
                  </FieldControl>
                  <FieldError>
                    Describe affected customers and owner action.
                  </FieldError>
                </Field>
              </Form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <div className="grid gap-4">
      {(["light", "dark"] as const).map((theme) => (
        <DethinkProvider
          key={theme}
          density={theme === "light" ? "compact" : "comfortable"}
          dir={theme === "dark" ? "rtl" : "ltr"}
          theme={theme}
          className="border-border rounded-lg border p-6"
        >
          <Container size="md">
            <Form>
              <Grid columns="3" gap="4">
                <Field id={`suite-name-${theme}`}>
                  <FieldLabel>{theme === "dark" ? "שם" : "Name"}</FieldLabel>
                  <FieldControl asChild>
                    <Input
                      defaultValue={theme === "dark" ? "פעולות" : "Operations"}
                    />
                  </FieldControl>
                </Field>
                <Field id={`suite-quota-${theme}`}>
                  <FieldLabel>{theme === "dark" ? "מכסה" : "Quota"}</FieldLabel>
                  <FieldControl asChild>
                    <NumberInput
                      defaultValue={theme === "dark" ? "250" : "125"}
                      numberMode="numeric"
                    />
                  </FieldControl>
                </Field>
                <Field id={`suite-notes-${theme}`}>
                  <FieldLabel>
                    {theme === "dark" ? "הערות" : "Notes"}
                  </FieldLabel>
                  <FieldControl asChild>
                    <Textarea
                      defaultValue={
                        theme === "dark"
                          ? "כתיבה מרובת שורות"
                          : "All controls share density and theme contracts."
                      }
                      rows={3}
                    />
                  </FieldControl>
                </Field>
              </Grid>
            </Form>
          </Container>
        </DethinkProvider>
      ))}
    </div>
  ),
};
