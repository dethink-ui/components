import {
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  forwardRef,
  useId,
  useRef,
  useState,
} from "react";
import {
  Button as AriaButton,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList as AriaTagList,
  type Key,
} from "react-aria-components";
import { cn } from "../../utils/cn";

export type TagInputValue = string;
export type TagInputControlSize = "sm" | "md" | "lg";
export type TagInputValidationResult = ReactNode | null | undefined | false;

export interface TagInputProps {
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  "data-slot"?: string;
  className?: string;
  clearErrorOnInput?: boolean;
  controlSize?: TagInputControlSize;
  defaultInputValue?: string;
  defaultValue?: TagInputValue[];
  delimiters?: string[];
  description?: ReactNode;
  disabled?: boolean;
  errorMessage?: ReactNode;
  inputValue?: string;
  invalid?: boolean;
  label?: ReactNode;
  maxTagLength?: number;
  maxTags?: number;
  name?: string;
  normalizeTag?: (value: string) => string;
  onInputValueChange?: (value: string) => void;
  onValueChange?: (value: TagInputValue[]) => void;
  placeholder?: string;
  readOnly?: boolean;
  removeLabel?: string;
  required?: boolean;
  validateTag?: (
    value: string,
    existingValues: TagInputValue[],
  ) => TagInputValidationResult;
  value?: TagInputValue[];
}

type TagInputComponent = ((
  props: TagInputProps & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };

const tagInputRootClasses =
  "grid w-full min-w-0 gap-[var(--dt-space-2)] text-foreground";

const tagInputLabelClasses =
  "text-sm font-medium leading-none text-foreground data-[disabled=true]:opacity-60 data-[invalid=true]:text-destructive";

const tagInputControlBaseClasses =
  "flex w-full min-w-0 flex-wrap items-center gap-[var(--dt-space-1-5)] rounded-md border border-input bg-background text-foreground shadow-sm outline-none motion-safe:transition-[background-color,border-color,box-shadow,color] motion-safe:duration-150 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15 data-[readonly=true]:bg-muted/40 data-[readonly=true]:text-muted-foreground";

const tagInputControlSizeClasses: Record<TagInputControlSize, string> = {
  sm: "min-h-8 px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-base sm:text-sm",
  md: "min-h-density-control px-[var(--dt-space-2-5)] py-[var(--dt-space-1-5)] text-base sm:text-sm",
  lg: "min-h-11 px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-base",
};

const tagInputListClasses =
  "contents outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring";

const tagInputTagClasses =
  "inline-flex min-w-0 max-w-full items-center gap-[var(--dt-space-1)] rounded-full border border-border bg-muted px-[var(--dt-space-2)] py-[var(--dt-space-0-5)] text-xs font-medium text-foreground outline-none motion-safe:transition-[background-color,border-color,color,box-shadow] motion-safe:duration-150 data-[disabled]:opacity-60 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[hovered]:bg-muted/80";

const tagInputTagTextClasses = "min-w-0 truncate";

const tagInputRemoveClasses =
  "ms-[var(--dt-space-0-5)] inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none motion-safe:transition-[background-color,color] motion-safe:duration-150 hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

const tagInputInputClasses =
  "min-w-24 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 read-only:text-muted-foreground";

const tagInputHelpClasses = "text-xs leading-5 text-muted-foreground";

const tagInputErrorClasses = "text-xs font-medium leading-5 text-destructive";

const defaultDelimiters = [","];

function isAriaInvalid(value: TagInputProps["aria-invalid"]) {
  return value === true || value === "true" || value === "grammar" || value === "spelling";
}

function defaultNormalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitInputValue(value: string, delimiters: string[]) {
  const delimiterPattern = [
    ...delimiters.filter(Boolean).map(escapeRegExp),
    "\\r?\\n",
  ].join("|");

  return value.split(new RegExp(delimiterPattern, "g"));
}

function normalizeInitialTags(
  values: TagInputValue[] | undefined,
  normalizeTag: (value: string) => string,
) {
  const seen = new Set<string>();
  const normalizedValues: TagInputValue[] = [];

  for (const value of values ?? []) {
    const normalizedValue = normalizeTag(value);
    const duplicateKey = normalizedValue.toLocaleLowerCase();

    if (normalizedValue && !seen.has(duplicateKey)) {
      seen.add(duplicateKey);
      normalizedValues.push(normalizedValue);
    }
  }

  return normalizedValues;
}

function validationMessageToNode(result: TagInputValidationResult) {
  return result === false || result === null || result === undefined
    ? null
    : result;
}

function XIcon() {
  return (
    <svg aria-hidden="true" className="size-3" fill="none" viewBox="0 0 16 16">
      <path
        d="m4.5 4.5 7 7m0-7-7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function tagInputClassNames({
  className,
}: Pick<TagInputProps, "className"> = {}) {
  return cn(tagInputRootClasses, className);
}

function TagInputRoot(
  {
    "aria-invalid": ariaInvalid,
    "data-slot": dataSlot,
    className,
    clearErrorOnInput = true,
    controlSize = "md",
    defaultInputValue = "",
    defaultValue,
    delimiters = defaultDelimiters,
    description,
    disabled = false,
    errorMessage,
    inputValue,
    invalid = false,
    label,
    maxTagLength,
    maxTags,
    name,
    normalizeTag = defaultNormalizeTag,
    onInputValueChange,
    onValueChange,
    placeholder = "Add tag",
    readOnly = false,
    removeLabel = "Remove",
    required = false,
    validateTag,
    value,
  }: TagInputProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const labelId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const valueControlled = value !== undefined;
  const inputControlled = inputValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    normalizeInitialTags(defaultValue, normalizeTag),
  );
  const [uncontrolledInputValue, setUncontrolledInputValue] =
    useState(defaultInputValue);
  const [entryError, setEntryError] = useState<ReactNode>(null);
  const resolvedValue = valueControlled
    ? normalizeInitialTags(value, normalizeTag)
    : uncontrolledValue;
  const resolvedInputValue = inputValue ?? uncontrolledInputValue;
  const resolvedInvalid = invalid || Boolean(entryError) || isAriaInvalid(ariaInvalid);
  const visibleError =
    entryError ?? (resolvedInvalid && errorMessage ? errorMessage : null);
  const disabledOrReadOnly = disabled || readOnly;
  const describedBy = [
    description ? descriptionId : null,
    visibleError ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const setInputValue = (nextValue: string) => {
    if (!inputControlled) {
      setUncontrolledInputValue(nextValue);
    }

    if (clearErrorOnInput) {
      setEntryError(null);
    }

    onInputValueChange?.(nextValue);
  };

  const updateValue = (nextValue: TagInputValue[]) => {
    if (!valueControlled) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const addTags = (rawValues: string[]) => {
    if (disabledOrReadOnly) {
      return false;
    }

    let nextValue = [...resolvedValue];
    const seen = new Set(nextValue.map((tag) => tag.toLocaleLowerCase()));

    for (const rawValue of rawValues) {
      const normalizedValue = normalizeTag(rawValue);

      if (!normalizedValue) {
        continue;
      }

      if (maxTags !== undefined && nextValue.length >= maxTags) {
        setEntryError(`Add no more than ${maxTags} tags.`);
        return false;
      }

      if (maxTagLength !== undefined && normalizedValue.length > maxTagLength) {
        setEntryError(`Keep tags to ${maxTagLength} characters or fewer.`);
        return false;
      }

      const duplicateKey = normalizedValue.toLocaleLowerCase();

      if (seen.has(duplicateKey)) {
        setEntryError(`${normalizedValue} is already added.`);
        return false;
      }

      const validationMessage = validationMessageToNode(
        validateTag?.(normalizedValue, nextValue),
      );

      if (validationMessage) {
        setEntryError(validationMessage);
        return false;
      }

      seen.add(duplicateKey);
      nextValue = [...nextValue, normalizedValue];
    }

    if (nextValue.length === resolvedValue.length) {
      return false;
    }

    setEntryError(null);
    updateValue(nextValue);
    return true;
  };

  const commitInputValue = () => {
    const nextTags = splitInputValue(resolvedInputValue, delimiters);

    if (addTags(nextTags)) {
      setInputValue("");
      return true;
    }

    return false;
  };

  const removeTags = (keys: Set<Key>) => {
    if (disabledOrReadOnly) {
      return;
    }

    const removeKeys = new Set(Array.from(keys, String));
    updateValue(resolvedValue.filter((tag) => !removeKeys.has(tag)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabledOrReadOnly) {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === "Tab" ||
      delimiters.includes(event.key)
    ) {
      if (resolvedInputValue.trim()) {
        event.preventDefault();
        commitInputValue();
      }

      return;
    }

    if (event.key === "Backspace" && !resolvedInputValue && resolvedValue.length > 0) {
      event.preventDefault();
      updateValue(resolvedValue.slice(0, -1));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (disabledOrReadOnly) {
      return;
    }

    const pastedText = event.clipboardData.getData("text");
    const pastedTags = splitInputValue(pastedText, delimiters);

    if (pastedTags.length <= 1) {
      return;
    }

    event.preventDefault();
    addTags(pastedTags);
    setInputValue("");
  };

  const tagItems = resolvedValue.map((tag) => ({
    id: tag,
    value: tag,
  }));

  return (
    <AriaTagGroup
      ref={ref}
      aria-describedby={describedBy}
      aria-invalid={resolvedInvalid ? true : ariaInvalid}
      aria-labelledby={label ? labelId : undefined}
      data-slot={dataSlot ?? "tag-input"}
      data-size={controlSize}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={resolvedInvalid ? "true" : undefined}
      data-readonly={readOnly ? "true" : undefined}
      data-required={required ? "true" : undefined}
      onRemove={removeTags}
      className={tagInputClassNames({ className })}
    >
      {label ? (
        <span
          id={labelId}
          data-slot="tag-input-label"
          data-disabled={disabled ? "true" : undefined}
          data-invalid={resolvedInvalid ? "true" : undefined}
          data-required={required ? "true" : undefined}
          className={tagInputLabelClasses}
        >
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </span>
      ) : null}
      <div
        aria-invalid={resolvedInvalid ? true : ariaInvalid}
        data-slot="tag-input-control"
        data-size={controlSize}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={resolvedInvalid ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-required={required ? "true" : undefined}
        className={cn(
          tagInputControlBaseClasses,
          tagInputControlSizeClasses[controlSize],
        )}
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        <AriaTagList
          items={tagItems}
          data-slot="tag-input-list"
          className={tagInputListClasses}
        >
          {(item) => (
            <AriaTag
              id={item.id}
              textValue={item.value}
              data-slot="tag-input-tag"
              isDisabled={disabled}
              className={tagInputTagClasses}
            >
              <span data-slot="tag-input-tag-text" className={tagInputTagTextClasses}>
                {item.value}
              </span>
              <AriaButton
                aria-label={removeLabel}
                data-slot="tag-input-tag-remove"
                slot="remove"
                className={tagInputRemoveClasses}
                isDisabled={disabledOrReadOnly}
              >
                <XIcon />
              </AriaButton>
            </AriaTag>
          )}
        </AriaTagList>
        <input
          ref={inputRef}
          aria-describedby={describedBy}
          aria-invalid={resolvedInvalid ? true : ariaInvalid}
          aria-labelledby={label ? labelId : undefined}
          aria-required={required || undefined}
          data-slot="tag-input-field"
          data-size={controlSize}
          disabled={disabled}
          onChange={(event) => {
            setInputValue(event.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={resolvedValue.length > 0 ? undefined : placeholder}
          readOnly={readOnly}
          type="text"
          value={resolvedInputValue}
          className={tagInputInputClasses}
        />
      </div>
      {name && !disabled ? (
        resolvedValue.map((tag) => (
          <input key={tag} name={name} type="hidden" value={tag} />
        ))
      ) : null}
      {description ? (
        <p
          id={descriptionId}
          data-slot="tag-input-description"
          data-disabled={disabled ? "true" : undefined}
          className={tagInputHelpClasses}
        >
          {description}
        </p>
      ) : null}
      {visibleError ? (
        <p
          id={errorId}
          role="alert"
          data-slot="tag-input-error"
          className={tagInputErrorClasses}
        >
          {visibleError}
        </p>
      ) : null}
    </AriaTagGroup>
  );
}

export const TagInput = forwardRef(TagInputRoot) as TagInputComponent;

TagInput.displayName = "TagInput";
