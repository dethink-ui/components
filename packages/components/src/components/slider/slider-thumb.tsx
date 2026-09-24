import { useContext, useRef, type ReactNode, type RefObject } from "react";
import { SliderStateContext } from "react-aria-components";
import { mergeProps, useFocusRing, useHover, useSliderThumb } from "react-aria";

export interface SliderThumbVisualState {
  isDragging: boolean;
  isFocused: boolean;
  isHovered: boolean;
}

/** Keep React Aria's mechanics while exposing formatted value text on the native input. */
export function SliderThumbControl({
  index,
  trackRef,
  orientation,
  name,
  label,
  valueText,
  className,
  children,
}: {
  index: number;
  trackRef: RefObject<HTMLDivElement | null>;
  orientation: "horizontal" | "vertical";
  name?: string;
  label?: string;
  valueText: string;
  className: string;
  children: (state: SliderThumbVisualState) => ReactNode;
}) {
  const state = useContext(SliderStateContext)!;
  const inputRef = useRef<HTMLInputElement>(null);
  const { thumbProps, inputProps, isDragging, isFocused, isDisabled } =
    useSliderThumb(
      { index, trackRef, inputRef, name, orientation, "aria-label": label },
      state,
    );
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled });
  return (
    <div
      {...mergeProps(thumbProps, hoverProps)}
      data-slot="slider-thumb"
      className={className}
      data-dragging={isDragging || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
    >
      <input
        {...mergeProps(inputProps, focusProps)}
        type="range"
        ref={inputRef}
        aria-valuetext={valueText}
        className="sr-only"
      />
      {children({ isDragging, isFocused, isHovered })}
    </div>
  );
}
