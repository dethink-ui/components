import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { Slider } from ".";
it("hydrates labelled range inputs without mismatches", async () => {
  const element = (
    <Slider<[number, number]>
      label="Budget"
      defaultValue={[20, 80]}
      name={["min", "max"]}
      description="Choose a range"
    />
  );
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  expect(container.querySelectorAll('input[type="range"]')).toHaveLength(2);
  const errors: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, element, {
      onRecoverableError: (error) => errors.push(error),
    });
  });
  expect(errors).toEqual([]);
  await act(async () => root.unmount());
});
