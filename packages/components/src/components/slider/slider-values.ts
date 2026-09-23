export interface SliderStep {
  value: number;
  label: string;
  showLabel?: boolean;
}

function fractionDigits(value: number) {
  const [coefficient, exponent = "0"] = value.toString().split("e");
  return Math.max(
    0,
    (coefficient.split(".")[1]?.length ?? 0) - Number(exponent),
  );
}

export function sliderFormatOptions(
  step: number,
  min: number,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormatOptions {
  // Explicit digit settings remain the consumer's formatting contract.
  if (
    options &&
    [
      options.minimumFractionDigits,
      options.maximumFractionDigits,
      options.minimumSignificantDigits,
      options.maximumSignificantDigits,
    ].some((value) => value !== undefined)
  )
    return options;
  return {
    maximumFractionDigits: Math.min(
      100,
      Math.max(3, fractionDigits(step), fractionDigits(min)),
    ),
    ...options,
  };
}

export function validateSliderSteps(steps: readonly SliderStep[]) {
  if (
    steps.length < 2 ||
    steps.some(
      (step, index) =>
        !Number.isFinite(step.value) ||
        !step.label.trim() ||
        (index > 0 && step.value <= steps[index - 1].value),
    )
  ) {
    throw new Error(
      "Slider steps require at least two finite, strictly increasing values with non-empty labels.",
    );
  }
}

/** Off-stop values resolve to the nearest backing value; ties use the lower stop. */
export function sliderStepIndex(value: number, steps: readonly SliderStep[]) {
  let nearest = 0;
  for (let index = 1; index < steps.length; index++) {
    if (
      Math.abs(steps[index].value - value) <
      Math.abs(steps[nearest].value - value)
    )
      nearest = index;
  }
  return nearest;
}

export function validateSliderValue(
  value: number | [number, number] | undefined,
) {
  if (value === undefined) return;
  const values = Array.isArray(value) ? value : [value];
  if (
    values.some((number) => !Number.isFinite(number)) ||
    (Array.isArray(value) && (value.length !== 2 || value[0] > value[1]))
  ) {
    throw new Error(
      "Slider values must be finite scalars or ordered two-value ranges.",
    );
  }
}
