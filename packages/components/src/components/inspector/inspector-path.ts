export type InspectorValue = Record<string, unknown>;

const unsafeKeys = new Set(["__proto__", "constructor", "prototype"]);

function toPathKeys(path: string) {
  const keys = path.split(".").filter(Boolean);

  for (const key of keys) {
    if (unsafeKeys.has(key)) {
      throw new Error(`Inspector path "${path}" uses a reserved key.`);
    }
  }

  return keys;
}

function isContainer(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

/** Reads a dot-notation path such as `layout.width` or `points.0.x`. */
export function getInspectorValue(source: unknown, path: string): unknown {
  let current = source;

  for (const key of toPathKeys(path)) {
    if (!isContainer(current)) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

function setAtKeys(source: unknown, keys: string[], value: unknown): unknown {
  const [key, ...rest] = keys;

  if (key === undefined) {
    return value;
  }

  const container = isContainer(source) ? source : {};
  const current = container[key];
  const next = setAtKeys(current, rest, value);

  if (isContainer(source) && Object.is(current, next)) {
    return source;
  }

  if (Array.isArray(container)) {
    const copy = [...container];
    copy[Number(key)] = next;
    return copy;
  }

  return { ...container, [key]: next };
}

/**
 * Returns a copy of `source` with `value` written at a dot-notation path.
 * Untouched branches keep their identity; missing branches become objects.
 */
export function setInspectorValue<T extends InspectorValue>(
  source: T,
  path: string,
  value: unknown,
): T {
  const keys = toPathKeys(path);

  if (keys.length === 0) {
    return source;
  }

  return setAtKeys(source, keys, value) as T;
}
