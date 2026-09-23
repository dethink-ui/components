import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { Slider } from ".";
import { ExpressiveSlider } from "../slider-expressive";
it.each(["range", "expressive"])(
  "hydrates %s inputs without mismatches",
  async (kind) => {
    const element =
      kind === "expressive" ? (
        <ExpressiveSlider
          label="Pace"
          mode="stepper"
          steps={[
            { value: 0, label: "Still" },
            { value: 4, label: "Rapid" },
          ]}
          defaultValue={4}
          size="xl"
        />
      ) : (
        <Slider<[number, number]>
          label="Budget"
          defaultValue={[20, 80]}
          name={["min", "max"]}
          description="Choose a range"
        />
      );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    expect(container.querySelectorAll('input[type="range"]')).toHaveLength(
      kind === "range" ? 2 : 1,
    );
    const errors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, element, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(errors).toEqual([]);
    await act(async () => root.unmount());
  },
);
