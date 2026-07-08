import {
  Children,
  cloneElement,
  createContext,
  createElement,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type FieldsetHTMLAttributes,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type FieldElement = "div" | "section";
export type FieldOrientation = "vertical" | "horizontal";
export type FieldDescriptionElement = "p" | "div" | "span";
export type FieldErrorElement = "div" | "p";
export type FieldGroupElement = "div" | "section";
export type FieldGroupGap = "sm" | "md" | "lg";
export type FieldLegendVariant = "legend" | "label";
export type FieldTitleElement = "div" | "span" | "p";
export type FormSpacing = "sm" | "md" | "lg";
export type FieldErrorItem =
  | string
  | {
      message?: ReactNode;
    }
  | null
  | undefined;

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children?: ReactNode;
  spacing?: FormSpacing;
}

export interface FieldProps extends HTMLAttributes<HTMLElement> {
  as?: FieldElement;
  children?: ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  orientation?: FieldOrientation;
  readOnly?: boolean;
  required?: boolean;
}

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
  requiredMarker?: ReactNode | false;
}

export interface FieldControlProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  asChild?: boolean;
  children?: ReactElement<FieldControlSlotProps>;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

export interface FieldDescriptionProps extends HTMLAttributes<HTMLElement> {
  as?: FieldDescriptionElement;
  children?: ReactNode;
}

export interface FieldErrorProps extends HTMLAttributes<HTMLElement> {
  as?: FieldErrorElement;
  children?: ReactNode;
  errors?: FieldErrorItem[];
}

export interface FieldGroupProps extends HTMLAttributes<HTMLElement> {
  as?: FieldGroupElement;
  children?: ReactNode;
  gap?: FieldGroupGap;
}

export interface FieldSetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  children?: ReactNode;
}

export interface FieldLegendProps extends HTMLAttributes<HTMLLegendElement> {
  children?: ReactNode;
  variant?: FieldLegendVariant;
}

export interface FieldContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface FieldTitleProps extends HTMLAttributes<HTMLElement> {
  as?: FieldTitleElement;
  children?: ReactNode;
}

type FieldControlSlotProps = Record<string, unknown> & {
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  readOnly?: boolean;
  ref?: Ref<HTMLElement>;
  required?: boolean;
};

type FieldContextValue = {
  allocateDescriptionId: (
    id: string | undefined,
    hasContent: boolean,
  ) => string;
  allocateErrorId: (id: string | undefined, hasContent: boolean) => string;
  controlId: string;
  descriptionIds: string[];
  disabled: boolean;
  errorIds: string[];
  invalid: boolean;
  orientation: FieldOrientation;
  readOnly: boolean;
  registerDescription: (id: string) => () => void;
  registerError: (id: string) => () => void;
  required: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

const formBaseClasses = "grid w-full min-w-0 text-foreground";

const formSpacingClasses: Record<FormSpacing, string> = {
  sm: "gap-[calc(var(--dt-density-gap)*2)]",
  md: "gap-[calc(var(--dt-density-gap)*3)]",
  lg: "gap-[calc(var(--dt-density-gap)*4)]",
};

const fieldBaseClasses =
  "group/field grid min-w-0 gap-[var(--dt-space-2)] text-foreground data-[disabled=true]:opacity-60 data-[orientation=horizontal]:grid-cols-[minmax(0,1fr)_auto] data-[orientation=horizontal]:items-start data-[orientation=horizontal]:gap-x-density-gap data-[orientation=horizontal]:gap-y-[var(--dt-space-1-5)] data-[orientation=horizontal]:[&:has(>[data-slot=field-control]:first-child)]:grid-cols-[auto_minmax(0,1fr)] data-[orientation=horizontal]:[&:has(>[data-slot=field-control]:first-child+[data-slot=field-label])]:items-center";

const fieldLabelBaseClasses =
  "text-sm font-medium leading-none text-foreground data-[disabled=true]:cursor-not-allowed data-[invalid=true]:text-destructive";

const fieldRequiredMarkerClasses = "ms-[var(--dt-space-1)] text-destructive";

const fieldControlBaseClasses =
  "min-w-0 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/15";

const fieldDescriptionBaseClasses =
  "text-xs leading-5 text-muted-foreground data-[disabled=true]:opacity-70";

const fieldErrorBaseClasses = "text-xs font-medium leading-5 text-destructive";

const fieldGroupBaseClasses = "grid min-w-0";

const fieldGroupGapClasses: Record<FieldGroupGap, string> = {
  sm: "gap-[var(--dt-density-gap)]",
  md: "gap-[calc(var(--dt-density-gap)*2)]",
  lg: "gap-[calc(var(--dt-density-gap)*3)]",
};

const fieldSetBaseClasses =
  "group/field-set min-w-0 border-0 p-0 text-foreground disabled:opacity-60";

const fieldLegendBaseClasses = "max-w-full text-foreground";

const fieldLegendVariantClasses: Record<FieldLegendVariant, string> = {
  legend:
    "mb-[var(--dt-space-2)] font-heading text-base font-semibold leading-6",
  label: "mb-[var(--dt-space-2)] text-sm font-medium leading-none",
};

const fieldContentBaseClasses = "grid min-w-0 gap-[var(--dt-space-1-5)]";

const fieldTitleBaseClasses =
  "text-sm font-medium leading-none text-foreground";

function useFieldContext() {
  return useContext(FieldContext);
}

function addUniqueId(ids: string[], id: string) {
  if (ids.includes(id)) {
    return ids;
  }

  return [...ids, id];
}

function removeId(ids: string[], id: string) {
  return ids.filter((registeredId) => registeredId !== id);
}

function mergeIds(...values: Array<string | undefined>) {
  const ids = values
    .flatMap((value) => value?.split(/\s+/) ?? [])
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(ids)).join(" ") || undefined;
}

function setRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

function getChildRef(child: ReactElement<FieldControlSlotProps>) {
  return child.props.ref;
}

function getErrorMessage(error: FieldErrorItem) {
  if (!error) {
    return undefined;
  }

  if (typeof error === "string") {
    return error;
  }

  return error.message;
}

function hasRenderableContent(content: ReactNode) {
  return content !== null && content !== undefined && content !== false;
}

function getDefaultDescriptionId(controlId: string, index: number) {
  return index === 0
    ? `${controlId}-description`
    : `${controlId}-description-${index + 1}`;
}

function getDefaultErrorId(controlId: string, index: number) {
  return index === 0 ? `${controlId}-error` : `${controlId}-error-${index + 1}`;
}

function getErrorContent({
  children,
  errors,
}: Pick<FieldErrorProps, "children" | "errors">) {
  const messages = (errors ?? [])
    .map((error) => getErrorMessage(error))
    .filter(
      (message): message is ReactNode =>
        message !== null && message !== undefined,
    );

  return {
    content:
      children ??
      (messages.length === 0 ? null : messages.length === 1 ? (
        messages[0]
      ) : (
        <ul className="list-disc ps-[var(--dt-space-4)]">
          {messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      )),
    messages,
  };
}

function collectFieldRelationshipIds(children: ReactNode, controlId: string) {
  const descriptionIds: string[] = [];
  const errorIds: string[] = [];
  let descriptionIndex = 0;
  let errorIndex = 0;

  function visit(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (
        !isValidElement<{
          children?: ReactNode;
          errors?: FieldErrorItem[];
          id?: string;
        }>(child)
      ) {
        return;
      }

      if (child.type === FieldDescription) {
        if (hasRenderableContent(child.props.children)) {
          descriptionIds.push(
            child.props.id ??
              getDefaultDescriptionId(controlId, descriptionIndex),
          );
          descriptionIndex += 1;
        }

        return;
      }

      if (child.type === FieldError) {
        if (hasRenderableContent(getErrorContent(child.props).content)) {
          errorIds.push(
            child.props.id ?? getDefaultErrorId(controlId, errorIndex),
          );
          errorIndex += 1;
        }

        return;
      }

      if (child.type !== Field) {
        visit(child.props.children);
      }
    });
  }

  visit(children);

  return {
    descriptionIds,
    errorIds,
  };
}

function mergeIdLists(...lists: string[][]) {
  return lists.reduce<string[]>((mergedIds, ids) => {
    for (const id of ids) {
      if (!mergedIds.includes(id)) {
        mergedIds.push(id);
      }
    }

    return mergedIds;
  }, []);
}

function useRegisteredId({
  id,
  register,
  shouldRegister,
}: {
  id: string;
  register: ((id: string) => () => void) | undefined;
  shouldRegister: boolean;
}) {
  useEffect(() => {
    if (!register || !shouldRegister) {
      return undefined;
    }

    return register(id);
  }, [id, register, shouldRegister]);
}

export function fieldClassNames({
  className,
}: Pick<FieldProps, "className"> = {}) {
  return cn(fieldBaseClasses, className);
}

export function formClassNames({
  className,
  spacing = "md",
}: Pick<FormProps, "className" | "spacing"> = {}) {
  return cn(formBaseClasses, formSpacingClasses[spacing], className);
}

export function fieldLabelClassNames({
  className,
}: Pick<FieldLabelProps, "className"> = {}) {
  return cn(fieldLabelBaseClasses, className);
}

export function fieldControlClassNames({
  className,
}: Pick<FieldControlProps, "className"> = {}) {
  return cn(fieldControlBaseClasses, className);
}

export function fieldDescriptionClassNames({
  className,
}: Pick<FieldDescriptionProps, "className"> = {}) {
  return cn(fieldDescriptionBaseClasses, className);
}

export function fieldErrorClassNames({
  className,
}: Pick<FieldErrorProps, "className"> = {}) {
  return cn(fieldErrorBaseClasses, className);
}

export function fieldGroupClassNames({
  className,
  gap = "md",
}: Pick<FieldGroupProps, "className" | "gap"> = {}) {
  return cn(fieldGroupBaseClasses, fieldGroupGapClasses[gap], className);
}

export function fieldSetClassNames({
  className,
}: Pick<FieldSetProps, "className"> = {}) {
  return cn(fieldSetBaseClasses, className);
}

export function fieldLegendClassNames({
  className,
  variant = "legend",
}: Pick<FieldLegendProps, "className" | "variant"> = {}) {
  return cn(
    fieldLegendBaseClasses,
    fieldLegendVariantClasses[variant],
    className,
  );
}

export function fieldContentClassNames({
  className,
}: Pick<FieldContentProps, "className"> = {}) {
  return cn(fieldContentBaseClasses, className);
}

export function fieldTitleClassNames({
  className,
}: Pick<FieldTitleProps, "className"> = {}) {
  return cn(fieldTitleBaseClasses, className);
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ children, className, spacing = "md", ...props }, ref) => (
    <form
      {...props}
      ref={ref}
      data-slot="form"
      data-spacing={spacing}
      className={formClassNames({ className, spacing })}
    >
      {children}
    </form>
  ),
);

Form.displayName = "Form";

export const Field = forwardRef<HTMLElement, FieldProps>(
  (
    {
      as: Element = "div",
      children,
      className,
      disabled = false,
      id,
      invalid = false,
      orientation = "vertical",
      readOnly = false,
      required = false,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const descriptionIndexRef = useRef(0);
    const errorIndexRef = useRef(0);
    descriptionIndexRef.current = 0;
    errorIndexRef.current = 0;
    const staticRelationshipIds = useMemo(
      () => collectFieldRelationshipIds(children, controlId),
      [children, controlId],
    );
    const [registeredDescriptionIds, setRegisteredDescriptionIds] = useState<
      string[]
    >([]);
    const [registeredErrorIds, setRegisteredErrorIds] = useState<string[]>([]);
    const descriptionIds = useMemo(
      () =>
        mergeIdLists(
          staticRelationshipIds.descriptionIds,
          registeredDescriptionIds,
        ),
      [registeredDescriptionIds, staticRelationshipIds.descriptionIds],
    );
    const errorIds = useMemo(
      () => mergeIdLists(staticRelationshipIds.errorIds, registeredErrorIds),
      [registeredErrorIds, staticRelationshipIds.errorIds],
    );
    const allocateDescriptionId = useCallback(
      (descriptionId: string | undefined, hasContent: boolean) => {
        if (!hasContent) {
          return descriptionId ?? getDefaultDescriptionId(controlId, 0);
        }

        const index = descriptionIndexRef.current;
        descriptionIndexRef.current += 1;

        return descriptionId ?? getDefaultDescriptionId(controlId, index);
      },
      [controlId],
    );
    const allocateErrorId = useCallback(
      (errorId: string | undefined, hasContent: boolean) => {
        if (!hasContent) {
          return errorId ?? getDefaultErrorId(controlId, 0);
        }

        const index = errorIndexRef.current;
        errorIndexRef.current += 1;

        return errorId ?? getDefaultErrorId(controlId, index);
      },
      [controlId],
    );
    const registerDescription = useCallback((descriptionId: string) => {
      setRegisteredDescriptionIds((ids) => addUniqueId(ids, descriptionId));

      return () => {
        setRegisteredDescriptionIds((ids) => removeId(ids, descriptionId));
      };
    }, []);
    const registerError = useCallback((errorId: string) => {
      setRegisteredErrorIds((ids) => addUniqueId(ids, errorId));

      return () => {
        setRegisteredErrorIds((ids) => removeId(ids, errorId));
      };
    }, []);
    const contextValue = useMemo<FieldContextValue>(
      () => ({
        allocateDescriptionId,
        allocateErrorId,
        controlId,
        descriptionIds,
        disabled,
        errorIds,
        invalid,
        orientation,
        readOnly,
        registerDescription,
        registerError,
        required,
      }),
      [
        allocateDescriptionId,
        allocateErrorId,
        controlId,
        descriptionIds,
        disabled,
        errorIds,
        invalid,
        orientation,
        readOnly,
        registerDescription,
        registerError,
        required,
      ],
    );

    return (
      <FieldContext.Provider value={contextValue}>
        {createElement(
          Element,
          {
            ...props,
            ref,
            "data-slot": "field",
            "data-disabled": disabled ? "true" : undefined,
            "data-invalid": invalid ? "true" : undefined,
            "data-orientation": orientation,
            "data-readonly": readOnly ? "true" : undefined,
            "data-required": required ? "true" : undefined,
            className: fieldClassNames({ className }),
          },
          children,
        )}
      </FieldContext.Provider>
    );
  },
);

Field.displayName = "Field";

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ children, className, htmlFor, requiredMarker = "*", ...props }, ref) => {
    const field = useFieldContext();
    const required = field?.required ?? false;

    return (
      <label
        {...props}
        ref={ref}
        htmlFor={htmlFor ?? field?.controlId}
        data-slot="field-label"
        data-disabled={field?.disabled ? "true" : undefined}
        data-invalid={field?.invalid ? "true" : undefined}
        data-required={required ? "true" : undefined}
        className={fieldLabelClassNames({ className })}
      >
        {children}
        {required && requiredMarker !== false ? (
          <span aria-hidden="true" className={fieldRequiredMarkerClasses}>
            {requiredMarker}
          </span>
        ) : null}
      </label>
    );
  },
);

FieldLabel.displayName = "FieldLabel";

export const FieldControl = forwardRef<HTMLElement, FieldControlProps>(
  (
    {
      "aria-describedby": ariaDescribedBy,
      "aria-errormessage": ariaErrorMessage,
      "aria-invalid": ariaInvalid,
      asChild = false,
      children,
      className,
      disabled,
      id,
      readOnly,
      required,
      ...props
    },
    ref,
  ) => {
    const field = useFieldContext();
    const resolvedId = field?.controlId ?? id;
    const resolvedDisabled = Boolean(field?.disabled || disabled);
    const resolvedReadOnly = Boolean(field?.readOnly || readOnly);
    const resolvedRequired = Boolean(field?.required || required);
    const resolvedInvalid = Boolean(field?.invalid);
    const describedBy = mergeIds(
      ariaDescribedBy,
      ...(field?.descriptionIds ?? []),
      ...(resolvedInvalid ? (field?.errorIds ?? []) : []),
    );
    const errorMessage = resolvedInvalid
      ? mergeIds(ariaErrorMessage, ...(field?.errorIds ?? []))
      : ariaErrorMessage;
    const controlProps = {
      ...props,
      ref,
      id: resolvedId,
      "aria-describedby": describedBy,
      "aria-errormessage": errorMessage,
      "aria-invalid": resolvedInvalid ? true : ariaInvalid,
      "data-slot": "field-control",
      "data-disabled": resolvedDisabled ? "true" : undefined,
      "data-invalid": resolvedInvalid ? "true" : undefined,
      "data-readonly": resolvedReadOnly ? "true" : undefined,
      "data-required": resolvedRequired ? "true" : undefined,
      className: fieldControlClassNames({ className }),
    };

    if (asChild) {
      const childArray = Children.toArray(children);
      const child = childArray[0];

      if (
        childArray.length !== 1 ||
        !isValidElement<FieldControlSlotProps>(child)
      ) {
        throw new Error(
          "FieldControl with asChild expects a single React element child.",
        );
      }

      const childDescribedBy = mergeIds(
        child.props["aria-describedby"],
        controlProps["aria-describedby"],
      );
      const childErrorMessage = resolvedInvalid
        ? mergeIds(
            child.props["aria-errormessage"],
            controlProps["aria-errormessage"],
          )
        : mergeIds(child.props["aria-errormessage"], ariaErrorMessage);

      return cloneElement(child, {
        ...controlProps,
        ...child.props,
        ref: composeRefs(ref, getChildRef(child)),
        id: controlProps.id ?? child.props.id,
        "aria-describedby": childDescribedBy,
        "aria-errormessage": childErrorMessage,
        "aria-invalid": resolvedInvalid
          ? true
          : (child.props["aria-invalid"] ?? ariaInvalid),
        "data-slot": "field-control",
        "data-disabled": resolvedDisabled ? "true" : undefined,
        "data-invalid": resolvedInvalid ? "true" : undefined,
        "data-readonly": resolvedReadOnly ? "true" : undefined,
        "data-required": resolvedRequired ? "true" : undefined,
        disabled: resolvedDisabled || child.props.disabled || undefined,
        readOnly: resolvedReadOnly || child.props.readOnly || undefined,
        required: resolvedRequired || child.props.required || undefined,
        className: cn(controlProps.className, child.props.className),
      } as Partial<FieldControlSlotProps>);
    }

    return createElement("div", controlProps, children);
  },
);

FieldControl.displayName = "FieldControl";

export const FieldDescription = forwardRef<HTMLElement, FieldDescriptionProps>(
  ({ as: Element = "p", children, className, id, ...props }, ref) => {
    const field = useFieldContext();
    const generatedId = useId();
    const hasContent = hasRenderableContent(children);
    const resolvedId =
      field?.allocateDescriptionId(id, hasContent) ??
      id ??
      `field-${generatedId}-description`;

    useRegisteredId({
      id: resolvedId,
      register: field?.registerDescription,
      shouldRegister: hasContent,
    });

    if (!hasContent) {
      return null;
    }

    return createElement(
      Element,
      {
        ...props,
        ref,
        id: resolvedId,
        "data-slot": "field-description",
        "data-disabled": field?.disabled ? "true" : undefined,
        className: fieldDescriptionClassNames({ className }),
      },
      children,
    );
  },
);

FieldDescription.displayName = "FieldDescription";

export const FieldError = forwardRef<HTMLElement, FieldErrorProps>(
  ({ as: Element = "div", children, className, errors, id, ...props }, ref) => {
    const field = useFieldContext();
    const generatedId = useId();
    const { content } = getErrorContent({ children, errors });
    const hasContent = hasRenderableContent(content);
    const resolvedId =
      field?.allocateErrorId(id, hasContent) ??
      id ??
      `field-${generatedId}-error`;

    useRegisteredId({
      id: resolvedId,
      register: field?.registerError,
      shouldRegister: hasContent && Boolean(field?.invalid),
    });

    if (!hasContent) {
      return null;
    }

    return createElement(
      Element,
      {
        ...props,
        ref,
        id: resolvedId,
        "data-slot": "field-error",
        "data-invalid": field?.invalid ? "true" : undefined,
        className: fieldErrorClassNames({ className }),
      },
      content,
    );
  },
);

FieldError.displayName = "FieldError";

export const FieldGroup = forwardRef<HTMLElement, FieldGroupProps>(
  ({ as: Element = "div", children, className, gap = "md", ...props }, ref) =>
    createElement(
      Element,
      {
        ...props,
        ref,
        "data-slot": "field-group",
        "data-gap": gap,
        className: fieldGroupClassNames({ className, gap }),
      },
      children,
    ),
);

FieldGroup.displayName = "FieldGroup";

export const FieldSet = forwardRef<HTMLFieldSetElement, FieldSetProps>(
  ({ children, className, disabled, ...props }, ref) => (
    <fieldset
      {...props}
      ref={ref}
      disabled={disabled}
      data-slot="field-set"
      data-disabled={disabled ? "true" : undefined}
      className={fieldSetClassNames({ className })}
    >
      {children}
    </fieldset>
  ),
);

FieldSet.displayName = "FieldSet";

export const FieldLegend = forwardRef<HTMLLegendElement, FieldLegendProps>(
  ({ children, className, variant = "legend", ...props }, ref) => (
    <legend
      {...props}
      ref={ref}
      data-slot="field-legend"
      data-variant={variant}
      className={fieldLegendClassNames({ className, variant })}
    >
      {children}
    </legend>
  ),
);

FieldLegend.displayName = "FieldLegend";

export const FieldContent = forwardRef<HTMLDivElement, FieldContentProps>(
  ({ children, className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="field-content"
      className={fieldContentClassNames({ className })}
    >
      {children}
    </div>
  ),
);

FieldContent.displayName = "FieldContent";

export const FieldTitle = forwardRef<HTMLElement, FieldTitleProps>(
  ({ as: Element = "div", children, className, ...props }, ref) =>
    createElement(
      Element,
      {
        ...props,
        ref,
        "data-slot": "field-title",
        className: fieldTitleClassNames({ className }),
      },
      children,
    ),
);

FieldTitle.displayName = "FieldTitle";
