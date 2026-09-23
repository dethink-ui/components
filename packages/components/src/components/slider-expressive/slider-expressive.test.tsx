import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ExpressiveSlider } from ".";

it("preserves backing values, keyboard mechanics and forwarded refs", async () => {
  const change = vi.fn();
  const ref = { current: null as HTMLDivElement | null };
  const user = userEvent.setup();
  render(
    <ExpressiveSlider
      label="Speed"
      ref={ref}
      mode="stepper"
      size="xl"
      steps={[
        { value: 0, label: "Still" },
        { value: 4, label: "Rapid" },
      ]}
      defaultValue={0}
      onValueChange={change}
    />,
  );
  await user.tab();
  await user.keyboard("{End}");
  expect(change).toHaveBeenLastCalledWith(4);
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "Rapid");
  expect(ref.current).toHaveAttribute("data-variant", "expressive");
});
