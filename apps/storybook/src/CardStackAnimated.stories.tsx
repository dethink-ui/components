import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardStackAnimated,
  CardTitle,
  DethinkProvider,
} from "@dethink/components";

const meta = {
  title: "Data Display/CardStackAnimated",
  component: CardStackAnimated,
  parameters: { layout: "centered" },
} satisfies Meta<typeof CardStackAnimated>;
export default meta;
type Story = StoryObj<typeof meta>;

function Fixture({ rtl = false }: { rtl?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <DethinkProvider
      theme={rtl ? "dark" : "light"}
      density={rtl ? "compact" : "comfortable"}
      className="bg-background w-80 p-4"
    >
      <Button onClick={() => setActiveIndex(2)}>Select final card</Button>
      <CardStackAnimated
        swipe
        dir={rtl ? "rtl" : "ltr"}
        aria-label="Animated findings"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      >
        {["Observe", "Explore", "Decide"].map((title, index) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {index === 1
                  ? "A longer finding demonstrates a stable deck height while browsing through content of different lengths."
                  : "A concise finding."}
              </p>
              <input
                aria-label={`${title} note`}
                className="border-border mt-3 w-full rounded border p-2"
              />
            </CardContent>
          </Card>
        ))}
      </CardStackAnimated>
    </DethinkProvider>
  );
}
export const Directional: Story = {
  render: () => <Fixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Show next card" }),
    );
    await expect(
      canvas.getByRole("textbox", { name: "Explore note" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Select final card" }),
    );
    await expect(
      canvas.getByRole("textbox", { name: "Decide note" }),
    ).toBeVisible();
  },
};
export const DarkCompactRTL: Story = { render: () => <Fixture rtl /> };
