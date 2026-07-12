import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { cn } from "../../utils/cn";

declare const process:
  | {
      env?: {
        NODE_ENV?: string;
      };
    }
  | undefined;

export type AccordionType = "single" | "multiple";
export type AccordionValue = string | undefined;
export type AccordionMultipleValue = string[];
export type AccordionMotionPreset =
  "none" | "subtle" | "standard" | "expressive";
export type AccordionBladeIconPosition = "start" | "end";

type AccordionBaseProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue"
> & {
  collapsible?: boolean;
  disabled?: boolean;
  motionPreset?: AccordionMotionPreset;
};

export type AccordionSingleProps = AccordionBaseProps & {
  type?: "single";
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  onValueChange?: (value: AccordionValue) => void;
};

export type AccordionMultipleProps = AccordionBaseProps & {
  type: "multiple";
  value?: AccordionMultipleValue;
  defaultValue?: AccordionMultipleValue;
  onValueChange?: (value: AccordionMultipleValue) => void;
};

type MotionBackedDragProps =
  | "onAnimationEnd"
  | "onAnimationEndCapture"
  | "onAnimationIteration"
  | "onAnimationIterationCapture"
  | "onAnimationStart"
  | "onAnimationStartCapture"
  | "onDrag"
  | "onDragCapture"
  | "onDragEnd"
  | "onDragEndCapture"
  | "onDragEnter"
  | "onDragEnterCapture"
  | "onDragExit"
  | "onDragExitCapture"
  | "onDragLeave"
  | "onDragLeaveCapture"
  | "onDragOver"
  | "onDragOverCapture"
  | "onDragStart"
  | "onDragStartCapture";

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export interface AccordionItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  MotionBackedDragProps
> {
  value: string;
  disabled?: boolean;
}

export interface AccordionBladeProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  MotionBackedDragProps
> {
  iconPosition?: AccordionBladeIconPosition;
}

export type AccordionBladeIconProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  MotionBackedDragProps
>;
export type AccordionBladeTextProps = HTMLAttributes<HTMLSpanElement>;

export interface AccordionContentProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  MotionBackedDragProps
> {
  forceMount?: boolean;
}

type AccordionMotionConfig = {
  contentEnabled: boolean;
  itemTransition: Transition;
  contentEnterTransition: Transition;
  contentExitTransition: Transition;
  iconTransition: Transition;
  hoverScale: number;
  tapScale: number;
};

type BladeRegistryEntry = {
  disabled: boolean;
};

type AccordionContextValue = {
  disabled: boolean;
  isOpen: (value: string) => boolean;
  motionConfig: AccordionMotionConfig;
  motionPreset: AccordionMotionPreset;
  reducedMotion: boolean;
  registerBlade: (value: string, disabled: boolean) => () => void;
  setFocusedValue: (value: string) => void;
  toggleValue: (value: string) => void;
};

type ItemContextValue = {
  bladeId: string;
  contentId: string;
  disabled: boolean;
  open: boolean;
  value: string;
};

type AccordionPartName = "Item" | "Blade" | "Content";
type MarkedAccordionPart = {
  [ACCORDION_PART]?: AccordionPartName;
};

const ACCORDION_PART = Symbol.for("@dethink/accordion.part");
const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

const accordionRootClasses =
  "w-full space-y-[var(--dt-space-3)] text-foreground";

const accordionItemClasses =
  "group/accordion-item overflow-hidden rounded-xl border border-border bg-background shadow-sm outline-none data-[disabled]:opacity-60";

const accordionBladeClasses =
  "relative flex min-h-density-control w-full cursor-pointer items-center justify-between gap-[var(--dt-space-3)] bg-background px-[var(--dt-space-5)] py-[var(--dt-space-4)] text-start text-foreground outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 data-[state=open]:bg-muted/70";

const accordionBladeContentClasses =
  "pointer-events-none inline-flex min-w-0 flex-1 items-center gap-[var(--dt-space-3)]";

const accordionBladeIconClasses =
  "pointer-events-none inline-flex shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4";

const accordionBladeTextClasses =
  "pointer-events-none min-w-0 flex-1 text-sm font-semibold leading-6 text-foreground";

const accordionContentClasses =
  "overflow-hidden border-t border-border bg-muted/35";

const accordionContentInnerClasses =
  "px-[var(--dt-space-5)] py-[var(--dt-space-4)] text-sm leading-6 text-foreground";

const accordionMotionSettings: Record<
  AccordionMotionPreset,
  {
    duration: number;
    offset: number;
    hoverScale: number;
    tapScale: number;
  }
> = {
  none: { duration: 0, offset: 0, hoverScale: 1, tapScale: 1 },
  subtle: { duration: 0.18, offset: 6, hoverScale: 1.002, tapScale: 0.998 },
  standard: { duration: 0.24, offset: 10, hoverScale: 1.004, tapScale: 0.996 },
  expressive: {
    duration: 0.34,
    offset: 14,
    hoverScale: 1.006,
    tapScale: 0.994,
  },
};

export function accordionClassNames({
  className,
}: Pick<AccordionProps, "className"> = {}) {
  return cn(accordionRootClasses, className);
}

export function accordionItemClassNames({
  className,
}: Pick<AccordionItemProps, "className"> = {}) {
  return cn(accordionItemClasses, className);
}

export function accordionBladeClassNames({
  className,
}: Pick<AccordionBladeProps, "className"> = {}) {
  return cn(accordionBladeClasses, className);
}

export function accordionBladeIconClassNames({
  className,
}: Pick<AccordionBladeIconProps, "className"> = {}) {
  return cn(accordionBladeIconClasses, className);
}

export function accordionBladeTextClassNames({
  className,
}: Pick<AccordionBladeTextProps, "className"> = {}) {
  return cn(accordionBladeTextClasses, className);
}

export function accordionContentClassNames({
  className,
}: Pick<AccordionContentProps, "className"> = {}) {
  return cn(accordionContentClasses, className);
}

function useAccordionContext(component: string) {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error(`${component} must be used within Accordion.`);
  }

  return context;
}

function useItemContext(component: string) {
  const context = useContext(ItemContext);

  if (!context) {
    throw new Error(`${component} must be used within Accordion.Item.`);
  }

  return context;
}

function isDevelopment() {
  return (
    typeof process === "undefined" || process.env?.NODE_ENV !== "production"
  );
}

function getAccordionPartName(type: unknown) {
  if (
    typeof type === "function" ||
    (typeof type === "object" && type !== null)
  ) {
    return (type as MarkedAccordionPart)[ACCORDION_PART];
  }

  return undefined;
}

function countDirectChildrenOfPart(
  children: ReactNode,
  partName: AccordionPartName,
  type: unknown,
) {
  let count = 0;

  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type === type || getAccordionPartName(child.type) === partName)
    ) {
      count += 1;
    }
  });

  return count;
}

function getDirectItemValues(children: ReactNode) {
  const values: string[] = [];

  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type === AccordionItem ||
        getAccordionPartName(child.type) === "Item")
    ) {
      values.push((child.props as AccordionItemProps).value);
    }
  });

  return values;
}

function validateRootComposition(children: ReactNode) {
  if (!isDevelopment()) {
    return;
  }

  const seen = new Set<string>();

  for (const itemValue of getDirectItemValues(children)) {
    if (seen.has(itemValue)) {
      throw new Error(`Duplicate Accordion.Item value "${itemValue}".`);
    }

    seen.add(itemValue);
  }
}

function validateItemComposition(children: ReactNode, value: string) {
  if (!isDevelopment()) {
    return;
  }

  const bladeCount = countDirectChildrenOfPart(
    children,
    "Blade",
    AccordionBlade,
  );
  const contentCount = countDirectChildrenOfPart(
    children,
    "Content",
    AccordionContent,
  );

  if (bladeCount !== 1 || contentCount !== 1) {
    throw new Error(
      `Accordion.Item "${value}" must contain exactly one Blade and one Content.`,
    );
  }
}

function markAccordionPart(component: unknown, partName: AccordionPartName) {
  Object.defineProperty(component, ACCORDION_PART, {
    configurable: true,
    value: partName,
  });
}

function normalizeMultipleValue(value: unknown): string[] {
  return Array.isArray(value) ? value : [];
}

function createMotionConfig(
  motionPreset: AccordionMotionPreset,
  reducedMotion: boolean,
): AccordionMotionConfig {
  const settings = reducedMotion
    ? accordionMotionSettings.none
    : accordionMotionSettings[motionPreset];
  const duration = settings.duration;
  const ease = [0.2, 0, 0, 1] as [number, number, number, number];
  const springTransition: Transition =
    duration === 0
      ? { duration: 0 }
      : {
          type: "spring",
          visualDuration: duration,
          bounce: motionPreset === "expressive" ? 0.14 : 0.04,
        };
  // Collapsing feels crisper than expanding, so the exit runs a touch faster.
  const exitDuration = duration * 0.85;

  return {
    contentEnabled: duration > 0,
    itemTransition: springTransition,
    contentEnterTransition: {
      height: { duration, ease },
      // Fade the content in before the panel finishes opening so text is
      // fully legible as it settles.
      opacity: { duration: Math.max(duration * 0.6, 0.01), ease },
    },
    contentExitTransition: {
      height: { duration: exitDuration, ease },
      // Fade out early so the panel reads as empty before it fully collapses.
      opacity: { duration: Math.max(exitDuration * 0.5, 0.01), ease },
    },
    iconTransition: {
      duration,
      ease,
    },
    hoverScale: settings.hoverScale,
    tapScale: settings.tapScale,
  };
}

function renderBladeChildren(children: ReactNode) {
  return Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <span
          className={accordionBladeTextClasses}
          data-slot="accordion-blade-text"
        >
          {child}
        </span>
      );
    }

    return child;
  });
}

function getEnabledBladeButtons(bladeId: string) {
  if (typeof document === "undefined") {
    return [];
  }

  const root = document
    .getElementById(bladeId)
    ?.closest('[data-slot="accordion"]');

  return Array.from(
    root?.querySelectorAll<HTMLButtonElement>(
      'button[data-slot="accordion-blade"]:not(:disabled)',
    ) ?? [],
  );
}

function focusBladeAtOffset(bladeId: string, offset: number) {
  const blades = getEnabledBladeButtons(bladeId);
  const currentIndex = blades.findIndex((blade) => blade.id === bladeId);

  if (currentIndex === -1 || blades.length === 0) {
    return;
  }

  const nextIndex = (currentIndex + offset + blades.length) % blades.length;

  blades[nextIndex]?.focus();
}

function focusBladeAtIndex(bladeId: string, index: number) {
  const blades = getEnabledBladeButtons(bladeId);
  const targetIndex = index < 0 ? blades.length + index : index;

  blades[targetIndex]?.focus();
}

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(
  (props, ref) => {
    const {
      type = "single",
      value,
      defaultValue,
      onValueChange,
      collapsible = true,
      disabled = false,
      motionPreset = "standard",
      className,
      children,
      ...rootProps
    } = props;
    const controlled = Object.hasOwn(props, "value");
    const prefersReducedMotion = useReducedMotion();
    const reducedMotion =
      motionPreset === "none" || prefersReducedMotion === true;
    const [uncontrolledValue, setUncontrolledValue] = useState<
      AccordionValue | AccordionMultipleValue
    >(
      defaultValue ??
        (type === "multiple" ? ([] as AccordionMultipleValue) : undefined),
    );
    const currentValue = controlled ? value : uncontrolledValue;
    const itemValues = useMemo(() => getDirectItemValues(children), [children]);
    const [focusedValue, setFocusedValue] = useState<AccordionValue>();
    const bladeRegistryRef = useRef(new Map<string, BladeRegistryEntry>());
    const [bladeRegistryVersion, setBladeRegistryVersion] = useState(0);
    const motionConfig = useMemo(
      () => createMotionConfig(motionPreset, reducedMotion),
      [motionPreset, reducedMotion],
    );

    validateRootComposition(children);

    const registerBlade = useCallback(
      (nextValue: string, nextDisabled: boolean) => {
        const current = bladeRegistryRef.current.get(nextValue);

        if (!current || current.disabled !== nextDisabled) {
          bladeRegistryRef.current.set(nextValue, { disabled: nextDisabled });
          setBladeRegistryVersion((version) => version + 1);
        }

        return () => {
          bladeRegistryRef.current.delete(nextValue);
          setBladeRegistryVersion((version) => version + 1);
        };
      },
      [],
    );

    const enabledItemValues = useMemo(
      () =>
        itemValues.filter(
          (itemValue) => !bladeRegistryRef.current.get(itemValue)?.disabled,
        ),
      [bladeRegistryVersion, itemValues],
    );

    const isOpen = useCallback(
      (itemValue: string) =>
        type === "multiple"
          ? normalizeMultipleValue(currentValue).includes(itemValue)
          : currentValue === itemValue,
      [currentValue, type],
    );

    const toggleValue = useCallback(
      (itemValue: string) => {
        if (disabled || !enabledItemValues.includes(itemValue)) {
          return;
        }

        if (type === "multiple") {
          const current = normalizeMultipleValue(currentValue);
          const next = current.includes(itemValue)
            ? current.filter((valueItem) => valueItem !== itemValue)
            : [...current, itemValue];

          if (!controlled) {
            setUncontrolledValue(next);
          }

          (
            onValueChange as
              ((value: AccordionMultipleValue) => void) | undefined
          )?.(next);
          return;
        }

        const next =
          currentValue === itemValue
            ? collapsible
              ? undefined
              : currentValue
            : itemValue;

        if (next === currentValue) {
          return;
        }

        if (!controlled) {
          setUncontrolledValue(next);
        }

        (onValueChange as ((value: AccordionValue) => void) | undefined)?.(
          next,
        );
      },
      [
        collapsible,
        controlled,
        currentValue,
        disabled,
        enabledItemValues,
        onValueChange,
        type,
      ],
    );

    const contextValue = useMemo<AccordionContextValue>(
      () => ({
        disabled,
        isOpen,
        motionConfig,
        motionPreset,
        reducedMotion,
        registerBlade,
        setFocusedValue,
        toggleValue,
      }),
      [
        disabled,
        isOpen,
        motionConfig,
        motionPreset,
        reducedMotion,
        registerBlade,
        toggleValue,
      ],
    );

    return (
      <AccordionContext.Provider value={contextValue}>
        <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
          <div
            {...rootProps}
            ref={ref}
            data-slot="accordion"
            data-orientation="vertical"
            data-motion-preset={motionPreset}
            data-reduced-motion={reducedMotion ? "true" : undefined}
            data-disabled={disabled ? "" : undefined}
            className={accordionClassNames({ className })}
          >
            {children}
          </div>
        </MotionConfig>
      </AccordionContext.Provider>
    );
  },
);

AccordionRoot.displayName = "Accordion";

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, disabled = false, className, children, ...props }, ref) => {
    const {
      disabled: rootDisabled,
      isOpen,
      motionPreset,
    } = useAccordionContext("Accordion.Item");
    const generatedId = useId();
    const open = isOpen(value);
    const resolvedDisabled = rootDisabled || disabled;
    const bladeId = `accordion-blade-${generatedId}`;
    const contentId = `accordion-content-${generatedId}`;
    const itemContextValue = useMemo<ItemContextValue>(
      () => ({
        bladeId,
        contentId,
        disabled: resolvedDisabled,
        open,
        value,
      }),
      [bladeId, contentId, open, resolvedDisabled, value],
    );

    validateItemComposition(children, value);

    return (
      <ItemContext.Provider value={itemContextValue}>
        <motion.div
          {...props}
          ref={ref}
          data-slot="accordion-item"
          data-state={open ? "open" : "closed"}
          data-disabled={resolvedDisabled ? "" : undefined}
          data-motion-preset={motionPreset}
          data-orientation="vertical"
          className={accordionItemClassNames({ className })}
        >
          {children}
        </motion.div>
      </ItemContext.Provider>
    );
  },
);

AccordionItem.displayName = "AccordionItem";

export const AccordionBlade = forwardRef<
  HTMLButtonElement,
  AccordionBladeProps
>(
  (
    {
      className,
      children,
      disabled = false,
      iconPosition = "start",
      onClick,
      onFocus,
      onKeyDown,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const {
      motionConfig,
      motionPreset,
      registerBlade,
      setFocusedValue,
      toggleValue,
    } = useAccordionContext("Accordion.Blade");
    const {
      bladeId,
      contentId,
      disabled: itemDisabled,
      open,
      value,
    } = useItemContext("Accordion.Blade");
    const resolvedDisabled = itemDisabled || disabled;

    useEffect(
      () => registerBlade(value, resolvedDisabled),
      [registerBlade, resolvedDisabled, value],
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusBladeAtOffset(bladeId, -1);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusBladeAtOffset(bladeId, 1);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusBladeAtIndex(bladeId, 0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusBladeAtIndex(bladeId, -1);
      }
    };

    return (
      <motion.button
        {...props}
        ref={ref}
        id={bladeId}
        aria-controls={contentId}
        aria-expanded={open}
        data-slot="accordion-blade"
        data-state={open ? "open" : "closed"}
        data-disabled={resolvedDisabled ? "" : undefined}
        data-icon-position={iconPosition}
        data-motion-preset={motionPreset}
        data-orientation="vertical"
        className={accordionBladeClassNames({ className })}
        disabled={resolvedDisabled}
        type={type}
        whileHover={{ scale: motionConfig.hoverScale }}
        whileTap={{ scale: motionConfig.tapScale }}
        transition={motionConfig.itemTransition}
        onClick={(event) => {
          onClick?.(event);

          if (!event.defaultPrevented) {
            setFocusedValue(value);
            toggleValue(value);
          }
        }}
        onFocus={(event) => {
          onFocus?.(event);

          if (!event.defaultPrevented) {
            setFocusedValue(value);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <span className={accordionBladeContentClasses}>
          {renderBladeChildren(children)}
        </span>
      </motion.button>
    );
  },
);

AccordionBlade.displayName = "AccordionBlade";

export const AccordionBladeIcon = forwardRef<
  HTMLSpanElement,
  AccordionBladeIconProps
>(({ className, ...props }, ref) => {
  const { motionConfig, motionPreset } = useAccordionContext(
    "Accordion.BladeIcon",
  );
  const { open } = useItemContext("Accordion.BladeIcon");

  return (
    <motion.span
      {...props}
      ref={ref}
      aria-hidden={props["aria-hidden"] ?? true}
      animate={{ rotate: open ? 90 : 0 }}
      data-slot="accordion-blade-icon"
      data-state={open ? "open" : "closed"}
      data-motion-preset={motionPreset}
      data-orientation="vertical"
      className={accordionBladeIconClassNames({ className })}
      transition={motionConfig.iconTransition}
    />
  );
});

AccordionBladeIcon.displayName = "AccordionBladeIcon";

export const AccordionBladeText = forwardRef<
  HTMLSpanElement,
  AccordionBladeTextProps
>(({ className, ...props }, ref) => {
  const { motionPreset } = useAccordionContext("Accordion.BladeText");
  const { open } = useItemContext("Accordion.BladeText");

  return (
    <span
      {...props}
      ref={ref}
      data-slot="accordion-blade-text"
      data-state={open ? "open" : "closed"}
      data-motion-preset={motionPreset}
      data-orientation="vertical"
      className={accordionBladeTextClassNames({ className })}
    />
  );
});

AccordionBladeText.displayName = "AccordionBladeText";

export const AccordionContent = forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ className, children, forceMount = false, ...props }, ref) => {
  const { motionConfig, motionPreset } =
    useAccordionContext("Accordion.Content");
  const { bladeId, contentId, disabled, open } =
    useItemContext("Accordion.Content");
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousOpenRef = useRef(open);
  const shouldReturnFocusRef = useRef(false);
  const [contentSettled, setContentSettled] = useState(!open);
  const { contentEnabled, contentEnterTransition, contentExitTransition } =
    motionConfig;
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  if (
    previousOpenRef.current &&
    !open &&
    contentRef.current &&
    typeof document !== "undefined" &&
    contentRef.current.contains(document.activeElement)
  ) {
    shouldReturnFocusRef.current = true;
  }

  useEffect(() => {
    if (open) {
      setContentSettled(false);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (shouldReturnFocusRef.current && !open) {
      document.getElementById(bladeId)?.focus();
      shouldReturnFocusRef.current = false;
    }

    previousOpenRef.current = open;
  }, [bladeId, open]);

  const hidden = contentEnabled ? !open && contentSettled : !open;

  // Static path (reduced motion / motionPreset="none"): non-force-mounted
  // content is removed from the DOM when closed, matching the previous
  // behavior and the component's documented contract.
  const inner =
    contentEnabled || open || forceMount ? (
      <div
        data-slot="accordion-content-inner"
        className={accordionContentInnerClasses}
      >
        {children}
      </div>
    ) : null;

  // Animate the region's height from 0 to its natural size with overflow
  // clipping, which reveals the static inner content without scaling or
  // reflow jumps. Opacity is layered on for a soft fade.
  const animationProps = contentEnabled
    ? {
        initial: false,
        animate: open ? "open" : "closed",
        variants: {
          open: {
            height: "auto",
            opacity: 1,
            transition: contentEnterTransition,
          },
          closed: {
            height: 0,
            opacity: 0,
            transition: contentExitTransition,
          },
        },
        onAnimationComplete: (definition: unknown) => {
          if (definition === "closed") {
            setContentSettled(true);
          }
        },
      }
    : {};

  return (
    <motion.div
      {...props}
      ref={mergedRef}
      id={contentId}
      role="region"
      aria-labelledby={bladeId}
      data-slot="accordion-content"
      data-state={open ? "open" : "closed"}
      data-disabled={disabled ? "" : undefined}
      data-motion-preset={motionPreset}
      data-orientation="vertical"
      className={accordionContentClassNames({ className })}
      hidden={hidden}
      {...animationProps}
    >
      {inner}
    </motion.div>
  );
});

AccordionContent.displayName = "AccordionContent";

markAccordionPart(AccordionItem, "Item");
markAccordionPart(AccordionBlade, "Blade");
markAccordionPart(AccordionContent, "Content");

type AccordionComponent = typeof AccordionRoot & {
  Item: typeof AccordionItem;
  Blade: typeof AccordionBlade;
  BladeIcon: typeof AccordionBladeIcon;
  BladeText: typeof AccordionBladeText;
  Content: typeof AccordionContent;
};

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Blade: AccordionBlade,
  BladeIcon: AccordionBladeIcon,
  BladeText: AccordionBladeText,
  Content: AccordionContent,
}) as AccordionComponent;
