import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Slider } from ".";

describe("Slider", () => {
  it("announces step labels but changes, commits, and submits backing values", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const commit = vi.fn();
    render(
      <form data-testid="step-form">
        <Slider
          label="Movement"
          mode="stepper"
          steps={[
            { value: 0, label: "Still" },
            { value: 1, label: "Steady", showLabel: false },
            { value: 4, label: "Rapid" },
          ]}
          defaultValue={1}
          name="speed"
          onValueChange={change}
          onValueCommit={commit}
        />
      </form>,
    );
    const input = screen.getByRole("slider", { name: "Movement" });
    expect(input).toHaveAttribute("aria-valuetext", "Steady");
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(input).toHaveAttribute("aria-valuetext", "Rapid");
    expect(change).toHaveBeenLastCalledWith(4);
    expect(commit).toHaveBeenLastCalledWith(4);
    expect(
      new FormData(screen.getByTestId("step-form") as HTMLFormElement).getAll(
        "speed",
      ),
    ).toEqual(["4"]);
    await user.keyboard("{Home}");
    expect(input).toHaveAttribute("aria-valuetext", "Still");
  });
  it("maps a controlled step range without crossing", async () => {
    function Fixture() {
      const [value, setValue] = useState<[number, number]>([1, 4]);
      return (
        <Slider<[number, number]>
          label="Range"
          mode="stepper"
          steps={[
            { value: 0, label: "Still" },
            { value: 1, label: "Steady" },
            { value: 4, label: "Rapid" },
          ]}
          value={value}
          onValueChange={setValue}
        />
      );
    }
    const user = userEvent.setup();
    render(<Fixture />);
    await user.tab();
    await user.keyboard("{End}{ArrowRight}");
    expect(
      screen
        .getAllByRole("slider")
        .map((el) => el.getAttribute("aria-valuetext")),
    ).toEqual(["Rapid", "Rapid"]);
  });
  it("supports decimal keyboard changes, commit callbacks and bounds", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const commit = vi.fn();
    render(
      <Slider
        label="Speed"
        min={0}
        max={2}
        step={0.25}
        defaultValue={1}
        onValueChange={change}
        onValueCommit={commit}
        description="Playback speed"
      />,
    );
    const input = screen.getByRole("slider", { name: "Speed" });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(input).toHaveValue("1.25");
    expect(change).toHaveBeenLastCalledWith(1.25);
    expect(commit).toHaveBeenLastCalledWith(1.25);
    await user.keyboard("{End}{ArrowRight}");
    expect(input).toHaveValue("2");
    await user.keyboard("{Home}{ArrowLeft}");
    expect(input).toHaveValue("0");
    expect(input).toHaveAccessibleDescription("Playback speed");
  });
  it("controls an ordered range and submits independently named values", async () => {
    function Fixture() {
      const [value, setValue] = useState<[number, number]>([20, 40]);
      return (
        <form data-testid="form">
          <Slider<[number, number]>
            label="Budget"
            value={value}
            onValueChange={setValue}
            name={["low", "high"]}
          />
        </form>
      );
    }
    const user = userEvent.setup();
    render(<Fixture />);
    const inputs = screen.getAllByRole("slider");
    expect(inputs[0]).toHaveAccessibleName(/Minimum/);
    expect(inputs[1]).toHaveAccessibleName(/Maximum/);
    await user.tab();
    await user.keyboard("{End}");
    expect(inputs[0]).toHaveValue("40");
    expect(inputs[1]).toHaveValue("40");
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.get("low")).toBe("40");
    expect(data.get("high")).toBe("40");
    await user.tab();
    await user.keyboard("{Home}");
    expect(inputs[1]).toHaveValue("40");
  });
  it("disables input and excludes it from submitted values", () => {
    render(
      <form data-testid="form">
        <Slider label="Locked" name="locked" defaultValue={30} disabled />
      </form>,
    );
    expect(screen.getByRole("slider")).toBeDisabled();
    expect(
      new FormData(screen.getByTestId("form") as HTMLFormElement).has("locked"),
    ).toBe(false);
  });
  it("does not change a controlled value without consumer updates", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<Slider label="Controlled" value={25} onValueChange={change} />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(change).toHaveBeenCalledWith(26);
    expect(screen.getByRole("slider")).toHaveValue("25");
  });
  it("supports an aria-only label and formatted value text", () => {
    render(
      <Slider
        aria-label="Price"
        defaultValue={20}
        formatOptions={{ style: "currency", currency: "USD" }}
        valueDisplay="none"
      />,
    );
    expect(screen.getByRole("slider", { name: "Price" })).toHaveAttribute(
      "aria-valuetext",
      "$20.00",
    );
  });
});
