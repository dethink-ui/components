"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatActionResult } from "./types";

/** One acknowledgement at a time; failed callbacks never silently look successful. */
export function useChatAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const busy = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const perform = useCallback(
    async (action: () => ChatActionResult, success = "") => {
      if (busy.current) return false;
      busy.current = true;
      setPending(true);
      setError("");
      setNotice("");
      try {
        if ((await action()) === false)
          throw new Error("The action was not accepted. Please try again.");
        if (alive.current) setNotice(success);
        return true;
      } catch (reason) {
        if (alive.current)
          setError(
            reason instanceof Error
              ? reason.message
              : "Something went wrong. Please try again.",
          );
        return false;
      } finally {
        busy.current = false;
        if (alive.current) setPending(false);
      }
    },
    [],
  );
  return { pending, error, notice, perform };
}
