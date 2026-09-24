import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import { axe } from "jest-axe";
import { Slider } from ".";

it.each(["ltr", "rtl"] as const)(
  "vertical keyboard, commit and form values in %s",
  async (dir) => {
    const user = userEvent.setup();
    const commit = vi.fn();
    const { container } = render(
      <form>
        <Slider
          label="Level"
          orientation="vertical"
          dir={dir}
          defaultValue={40}
          name="level"
          onValueCommit={commit}
        />
      </form>,
    );
    const input = screen.getByRole("slider");
    expect(input).toHaveAttribute("aria-orientation", "vertical");
    input.focus();
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("41");
    expect(commit).toHaveBeenLastCalledWith(41);
    await user.keyboard("{ArrowDown}{Home}");
    expect(input).toHaveValue("0");
    await user.keyboard("{End}");
    expect(new FormData(container.querySelector("form")!).get("level")).toBe(
      "100",
    );
    expect((await axe(container)).violations).toEqual([]);
  },
);

it("retains non-crossing vertical ranges and named step values", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <form>
      <Slider<[number, number]>
        label="Pace"
        orientation="vertical"
        mode="stepper"
        defaultValue={[0, 4]}
        steps={[
          { value: 0, label: "Still" },
          { value: 1, label: "Steady" },
          { value: 4, label: "Rapid" },
        ]}
        name={["low", "high"]}
      />
    </form>,
  );
  const [low, high] = screen.getAllByRole("slider");
  low.focus();
  await user.keyboard("{End}{ArrowUp}");
  expect(low).toHaveAttribute("aria-valuetext", "Rapid");
  high.focus();
  await user.keyboard("{Home}{ArrowDown}");
  expect(high).toHaveAttribute("aria-valuetext", "Rapid");
  expect([...new FormData(container.querySelector("form")!).values()]).toEqual([
    "4",
    "4",
  ]);
});

it("changes orientation without losing value or enabling disabled controls", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<Slider label="Level" defaultValue={40} />);
  screen.getByRole("slider").focus();
  await user.keyboard("{ArrowRight}");
  rerender(<Slider label="Level" orientation="vertical" defaultValue={40} />);
  await user.keyboard("{ArrowUp}");
  expect(screen.getByRole("slider")).toHaveValue("42");
  rerender(
    <Slider label="Level" orientation="vertical" disabled defaultValue={40} />,
  );
  expect(screen.getByRole("slider")).toBeDisabled();
});
