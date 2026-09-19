import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type ButtonGroupMode = "attached" | "separated";
export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupSeparatorOrientation = "horizontal" | "vertical";

export interface ButtonGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "role"
> {
  "data-slot"?: string;
  mode?: ButtonGroupMode;
  orientation?: ButtonGroupOrientation;
}

export type ButtonGroupSeparatorProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "aria-hidden" | "children" | "role"
>;

const buttonGroupBaseClasses =
  "isolate inline-flex w-fit max-w-full items-stretch";

const buttonGroupModeClasses: Record<ButtonGroupMode, string> = {
  attached: "gap-0 [--dt-control-press-scale:1]",
  separated: "gap-density-gap",
};

const buttonGroupOrientationClasses: Record<ButtonGroupOrientation, string> = {
  horizontal: cn(
    "flex-row",
    "[&>:is(button,[data-slot=button],[data-slot=icon-button])]:relative",
    "[&>:is(button,[data-slot=button],[data-slot=icon-button]):focus-visible]:z-10",
    "[&[data-mode=attached]>:is(button,[data-slot=button],[data-slot=icon-button])]:rounded-none",
    "[&[data-mode=attached]>:is(button,[data-slot=button],[data-slot=icon-button]):first-child]:rounded-s-md",
    "[&[data-mode=attached]>:is(button,[data-slot=button],[data-slot=icon-button]):last-child]:rounded-e-md",
    "[&[data-mode=attached]>:is(button,[data-slot=button],[data-slot=icon-button]):not(:first-child)]:-ms-px",
    "[&>[data-slot=button-group-separator]]:h-auto",
    "[&>[data-slot=button-group-separator]]:w-px",
  ),
  vertical: cn(
    "flex-col",
    "[&>:is(button,[data-slot=button],[data-slot=icon-button])]:relative",
    "[&>:is(button,[data-slot=button],[data-slot=icon-button]):focus-visible]:z-10",
    "[&[data-mode=attached]>:is(button,[data-slot=button],[data-slot=icon-button])]:rounded-none",
    "[&[data-mode=attached]>:is(button,[data-slot=button],[data-slot=icon-button]):first-child]:rounded-t-md",
    "[&[data-mode=attached]>:is(button,[data-slot=button],[data-slot=icon-button]):last-child]:rounded-b-md",
    "[&[data-mode=attached]>:is(button,[data-slot=button],[data-slot=icon-button]):not(:first-child)]:-mt-px",
    "[&>[data-slot=button-group-separator]]:h-px",
    "[&>[data-slot=button-group-separator]]:w-auto",
  ),
};

const buttonGroupSeparatorOrientationClasses: Record<
  ButtonGroupSeparatorOrientation,
  string
> = {
  horizontal: "h-px w-auto self-stretch",
  vertical: "h-auto w-px self-stretch",
};

export function buttonGroupClassNames({
  className,
  mode = "attached",
  orientation = "horizontal",
}: Pick<ButtonGroupProps, "className" | "mode" | "orientation"> = {}) {
  return cn(
    buttonGroupBaseClasses,
    buttonGroupModeClasses[mode],
    buttonGroupOrientationClasses[orientation],
    className,
  );
}

export function buttonGroupSeparatorClassNames({
  className,
  orientation = "vertical",
}: {
  className?: string;
  orientation?: ButtonGroupSeparatorOrientation;
} = {}) {
  return cn(
    "pointer-events-none relative z-10 shrink-0 bg-border forced-colors:bg-[CanvasText]",
    buttonGroupSeparatorOrientationClasses[orientation],
    className,
  );
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      "data-slot": dataSlot = "button-group",
      children,
      className,
      mode = "attached",
      orientation = "horizontal",
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      role="group"
      data-slot={dataSlot}
      data-mode={mode}
      data-orientation={orientation}
      className={buttonGroupClassNames({ className, mode, orientation })}
    >
      {children}
    </div>
  ),
);

ButtonGroup.displayName = "ButtonGroup";

export const ButtonGroupSeparator = forwardRef<
  HTMLSpanElement,
  ButtonGroupSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <span
      {...props}
      ref={ref}
      aria-hidden="true"
      role="presentation"
      data-slot="button-group-separator"
      className={buttonGroupSeparatorClassNames({ className })}
    />
  );
});

ButtonGroupSeparator.displayName = "ButtonGroupSeparator";
