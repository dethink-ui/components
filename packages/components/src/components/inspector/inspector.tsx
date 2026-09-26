import {
  createContext,
  createElement,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  version as reactVersion,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { EmptyState } from "../empty-state";
import {
  getInspectorValue,
  setInspectorValue,
  type InspectorValue,
} from "./inspector-path";

export type InspectorHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface InspectorChangeDetails {
  /** Dot-notation path of the property that changed. */
  path: string;
  /** The committed value for that path. */
  value: unknown;
}

export interface InspectorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  children?: ReactNode;
  disabled?: boolean;
  /** Rendered instead of the sections when `value` is null or undefined. */
  emptyState?: ReactNode;
  onValueChange?: (
    next: InspectorValue,
    details: InspectorChangeDetails,
  ) => void;
  readOnly?: boolean;
  /**
   * Identifies the selected object. Uncommitted drafts are discarded when it
   * changes. Defaults to the `value` object's identity, so pass a stable id
   * when `value` is rebuilt on renders that do not change the selection.
   */
  selectionKey?: string | number;
  value: InspectorValue | null | undefined;
}

export interface InspectorSectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  /** Controls rendered beside the heading, outside the toggle button. */
  actions?: ReactNode;
  children?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  description?: ReactNode;
  headingLevel?: InspectorHeadingLevel;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title: ReactNode;
}

export interface InspectorPropertyProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  children?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** Explains why the property is disabled or read-only. */
  disabledReason?: ReactNode;
  /** Consumer-supplied error. Takes precedence over errors a control reports. */
  error?: ReactNode;
  label: ReactNode;
  path: string;
  readOnly?: boolean;
}

export interface InspectorPropertyContextValue {
  controlId: string;
  describedBy: string | undefined;
  disabled: boolean;
  invalid: boolean;
  labelId: string;
  path: string;
  readOnly: boolean;
  /** Identity of the selected object; changes when the selection changes. */
  selection: unknown;
  /** Controls call this with a message to reject a draft, or null to clear it. */
  reportError: (message: string | null) => void;
  setValue: (value: unknown) => void;
  value: unknown;
}

type InspectorContextValue = {
  commit: (path: string, value: unknown) => void;
  disabled: boolean;
  readOnly: boolean;
  selection: unknown;
  value: InspectorValue;
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// React 18 serializes unknown attributes; React 19 supports boolean inert.
const inertAttribute = (
  Number.parseInt(reactVersion, 10) < 19 ? "" : true
) as true;

const InspectorContext = createContext<InspectorContextValue | null>(null);
const InspectorPropertyContext =
  createContext<InspectorPropertyContextValue | null>(null);

const inspectorBaseClasses =
  "@container/inspector grid min-w-0 content-start text-sm text-foreground";

const inspectorSectionClasses =
  "grid min-w-0 border-b border-border last:border-b-0";

const inspectorSectionHeaderClasses =
  "flex min-h-10 min-w-0 items-center gap-[var(--dt-space-2)] px-[var(--dt-space-3)]";

const inspectorSectionHeadingClasses =
  "m-0 flex min-w-0 flex-1 text-xs font-semibold leading-5 text-foreground";

const inspectorSectionTriggerClasses =
  "-mx-[var(--dt-space-1)] flex min-h-8 min-w-0 flex-1 items-center gap-[var(--dt-space-1-5)] rounded-sm px-[var(--dt-space-1)] text-start outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&[aria-expanded=false]_[data-slot=inspector-section-chevron]]:-rotate-90 rtl:[&[aria-expanded=false]_[data-slot=inspector-section-chevron]]:rotate-90";

const inspectorSectionChevronClasses =
  "size-3.5 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control";

const inspectorSectionActionsClasses =
  "flex shrink-0 items-center gap-[var(--dt-space-1)]";

const inspectorSectionDescriptionClasses =
  "-mt-[var(--dt-space-1)] px-[var(--dt-space-3)] pb-[var(--dt-space-2)] text-xs leading-5 text-muted-foreground";

// Animates between 0fr and 1fr rows so the content can collapse to its
// intrinsic height without measuring it.
const inspectorSectionRegionClasses =
  "grid grid-rows-[1fr] data-[state=closed]:grid-rows-[0fr] motion-safe:transition-[grid-template-rows] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control";

const inspectorSectionContentClasses =
  "grid min-h-0 min-w-0 gap-[var(--dt-density-gap)] overflow-hidden px-[var(--dt-space-3)] data-[state=open]:pb-[var(--dt-space-3)]";

const inspectorPropertyClasses =
  "grid min-w-0 grid-cols-1 items-center gap-x-[var(--dt-density-gap)] gap-y-[var(--dt-space-1)] @min-[17rem]/inspector:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] data-[disabled=true]:opacity-60";

const inspectorPropertyLabelClasses =
  "min-w-0 truncate text-xs leading-5 text-muted-foreground data-[invalid=true]:text-destructive";

const inspectorPropertyControlClasses = "min-w-0";

const inspectorPropertyMessageClasses =
  "min-w-0 text-xs leading-5 @min-[17rem]/inspector:col-start-2";

export function inspectorClassNames({
  className,
}: Pick<InspectorProps, "className"> = {}) {
  return cn(inspectorBaseClasses, className);
}

export function inspectorSectionClassNames({
  className,
}: Pick<InspectorSectionProps, "className"> = {}) {
  return cn(inspectorSectionClasses, className);
}

export function inspectorPropertyClassNames({
  className,
}: Pick<InspectorPropertyProps, "className"> = {}) {
  return cn(inspectorPropertyClasses, className);
}

function useInspectorContext(component: string) {
  const context = useContext(InspectorContext);

  if (!context) {
    throw new Error(`${component} must be rendered inside <Inspector>.`);
  }

  return context;
}

/**
 * Wires a custom control to the surrounding InspectorProperty: ids for
 * labelling, the current value, and a setter that commits the change.
 */
export function useInspectorProperty() {
  const context = useContext(InspectorPropertyContext);

  if (!context) {
    throw new Error(
      "Inspector controls must be rendered inside <InspectorProperty>.",
    );
  }

  return context;
}

function toTitle(content: ReactNode) {
  return typeof content === "string" || typeof content === "number"
    ? String(content)
    : undefined;
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      data-slot="inspector-section-chevron"
      className={inspectorSectionChevronClasses}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export const Inspector = forwardRef<HTMLDivElement, InspectorProps>(
  (
    {
      children,
      className,
      disabled = false,
      emptyState,
      onValueChange,
      readOnly = false,
      selectionKey,
      value,
      ...props
    },
    ref,
  ) => {
    // Several controls can commit before the parent re-renders (for example
    // both axes of a vector), so commits in the same task build on each other.
    // Once that task ends, the working copy falls back to the rendered value:
    // a parent that rejected the change never re-renders, and later edits
    // must not resurrect it.
    const renderedValue = useRef<InspectorValue>(value ?? {});
    const latestValue = useRef<InspectorValue>(value ?? {});
    const resyncScheduled = useRef(false);

    useIsomorphicLayoutEffect(() => {
      renderedValue.current = value ?? {};
      latestValue.current = value ?? {};
    });

    const commit = useCallback(
      (path: string, nextPropertyValue: unknown) => {
        const next = setInspectorValue(
          latestValue.current,
          path,
          nextPropertyValue,
        );

        if (next === latestValue.current) {
          return;
        }

        latestValue.current = next;

        if (!resyncScheduled.current) {
          resyncScheduled.current = true;
          queueMicrotask(() => {
            resyncScheduled.current = false;
            latestValue.current = renderedValue.current;
          });
        }

        onValueChange?.(next, { path, value: nextPropertyValue });
      },
      [onValueChange],
    );

    const contextValue = useMemo<InspectorContextValue>(
      () => ({
        commit,
        disabled,
        readOnly,
        selection: selectionKey ?? value,
        value: value ?? {},
      }),
      [commit, disabled, readOnly, selectionKey, value],
    );
    const empty = value === null || value === undefined;

    return (
      <div
        {...props}
        ref={ref}
        data-slot="inspector"
        data-empty={empty ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        className={inspectorClassNames({ className })}
      >
        {empty ? (
          (emptyState ?? (
            <EmptyState
              variant="compact"
              title="Nothing selected"
              description="Select an item to edit its properties."
            />
          ))
        ) : (
          <InspectorContext.Provider value={contextValue}>
            {children}
          </InspectorContext.Provider>
        )}
      </div>
    );
  },
);

Inspector.displayName = "Inspector";

export const InspectorSection = forwardRef<HTMLElement, InspectorSectionProps>(
  (
    {
      actions,
      children,
      className,
      collapsible = true,
      defaultOpen = true,
      description,
      headingLevel = 3,
      onOpenChange,
      open,
      title,
      ...props
    },
    ref,
  ) => {
    const baseId = useId();
    const headingId = `${baseId}-heading`;
    const regionId = `${baseId}-content`;
    const descriptionId = `${baseId}-description`;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const resolvedOpen = !collapsible || (open ?? uncontrolledOpen);
    const state = resolvedOpen ? "open" : "closed";

    const toggle = () => {
      const next = !resolvedOpen;

      if (open === undefined) {
        setUncontrolledOpen(next);
      }

      onOpenChange?.(next);
    };

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={headingId}
        data-slot="inspector-section"
        data-state={state}
        className={inspectorSectionClassNames({ className })}
      >
        <div
          data-slot="inspector-section-header"
          className={inspectorSectionHeaderClasses}
        >
          {createElement(
            `h${headingLevel}`,
            {
              id: headingId,
              "data-slot": "inspector-section-title",
              className: inspectorSectionHeadingClasses,
            },
            collapsible ? (
              <button
                type="button"
                aria-controls={regionId}
                aria-expanded={resolvedOpen}
                data-slot="inspector-section-trigger"
                className={inspectorSectionTriggerClasses}
                onClick={toggle}
              >
                <ChevronIcon />
                <span className="min-w-0 truncate">{title}</span>
              </button>
            ) : (
              <span className="min-w-0 truncate">{title}</span>
            ),
          )}
          {actions ? (
            <div
              data-slot="inspector-section-actions"
              className={inspectorSectionActionsClasses}
            >
              {actions}
            </div>
          ) : null}
        </div>
        {description && resolvedOpen ? (
          <p
            id={descriptionId}
            data-slot="inspector-section-description"
            className={inspectorSectionDescriptionClasses}
          >
            {description}
          </p>
        ) : null}
        <div
          id={regionId}
          data-slot="inspector-section-region"
          data-state={state}
          className={inspectorSectionRegionClasses}
          // Spread so React 18 types, which lack inert, still accept it.
          {...{ inert: resolvedOpen ? undefined : inertAttribute }}
        >
          <div
            role="group"
            aria-labelledby={headingId}
            aria-describedby={
              description && resolvedOpen ? descriptionId : undefined
            }
            data-slot="inspector-section-content"
            data-state={state}
            className={inspectorSectionContentClasses}
          >
            {children}
          </div>
        </div>
      </section>
    );
  },
);

InspectorSection.displayName = "InspectorSection";

export const InspectorProperty = forwardRef<
  HTMLDivElement,
  InspectorPropertyProps
>(
  (
    {
      children,
      className,
      description,
      disabled,
      disabledReason,
      error,
      label,
      path,
      readOnly,
      ...props
    },
    ref,
  ) => {
    const inspector = useInspectorContext("InspectorProperty");
    const baseId = useId();
    const controlId = `${baseId}-control`;
    const labelId = `${baseId}-label`;
    const descriptionId = `${baseId}-description`;
    const reasonId = `${baseId}-reason`;
    const errorId = `${baseId}-error`;
    const [reportedError, setReportedError] = useState<string | null>(null);
    const resolvedDisabled = inspector.disabled || Boolean(disabled);
    const resolvedReadOnly = inspector.readOnly || Boolean(readOnly);
    const resolvedError = error ?? reportedError;
    const invalid = Boolean(resolvedError);
    const reason = resolvedDisabled || resolvedReadOnly ? disabledReason : null;
    const describedBy =
      [
        description ? descriptionId : null,
        reason ? reasonId : null,
        invalid ? errorId : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;
    const { commit } = inspector;
    const value = getInspectorValue(inspector.value, path);

    const setValue = useCallback(
      (nextValue: unknown) => commit(path, nextValue),
      [commit, path],
    );

    const contextValue = useMemo<InspectorPropertyContextValue>(
      () => ({
        controlId,
        describedBy,
        disabled: resolvedDisabled,
        invalid,
        labelId,
        path,
        readOnly: resolvedReadOnly,
        reportError: setReportedError,
        selection: inspector.selection,
        setValue,
        value,
      }),
      [
        controlId,
        describedBy,
        invalid,
        labelId,
        path,
        resolvedDisabled,
        resolvedReadOnly,
        inspector.selection,
        setValue,
        value,
      ],
    );

    return (
      <div
        {...props}
        ref={ref}
        data-slot="inspector-property"
        data-path={path}
        data-disabled={resolvedDisabled ? "true" : undefined}
        data-readonly={resolvedReadOnly ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
        className={inspectorPropertyClassNames({ className })}
      >
        <label
          id={labelId}
          htmlFor={controlId}
          title={toTitle(label)}
          data-slot="inspector-property-label"
          data-invalid={invalid ? "true" : undefined}
          className={inspectorPropertyLabelClasses}
        >
          {label}
        </label>
        <div
          data-slot="inspector-property-control"
          className={inspectorPropertyControlClasses}
        >
          <InspectorPropertyContext.Provider value={contextValue}>
            {children}
          </InspectorPropertyContext.Provider>
        </div>
        {description ? (
          <p
            id={descriptionId}
            data-slot="inspector-property-description"
            className={cn(
              inspectorPropertyMessageClasses,
              "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
        {reason ? (
          <p
            id={reasonId}
            data-slot="inspector-property-reason"
            className={cn(
              inspectorPropertyMessageClasses,
              "text-muted-foreground",
            )}
          >
            {reason}
          </p>
        ) : null}
        {invalid ? (
          <p
            id={errorId}
            data-slot="inspector-property-error"
            className={cn(
              inspectorPropertyMessageClasses,
              "text-destructive font-medium",
            )}
          >
            {resolvedError}
          </p>
        ) : null}
      </div>
    );
  },
);

InspectorProperty.displayName = "InspectorProperty";
