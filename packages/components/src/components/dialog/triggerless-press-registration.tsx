import { usePress } from "react-aria";

/**
 * React Aria's `DialogTrigger` wraps its children in a press responder and
 * warns ("A PressResponder was rendered without a pressable child") when no
 * pressable registers with it. A dialog that can open without a trigger
 * (controlled, or `defaultOpen`) legitimately has none, so the root renders
 * this to register on its behalf. It renders nothing and passes no ref, so a
 * real trigger alongside it still gets the trigger props, its `aria-expanded`
 * and focus restoration.
 */
export function TriggerlessPressRegistration() {
  usePress({});
  return null;
}

/** Whether a dialog root can open without a trigger, and so registers one itself. */
export function canOpenWithoutTrigger(
  open: boolean | undefined,
  defaultOpen: boolean | undefined,
) {
  return open !== undefined || defaultOpen === true;
}
