import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export type LiveRegionPoliteness = "polite" | "assertive";

export interface AnnounceOptions {
  politeness?: LiveRegionPoliteness;
  debounceMs?: number;
  coalesceKey?: string;
}

export interface AnnouncerApi {
  announce: (message: string, options?: AnnounceOptions) => void;
  announcePolite: (message: string, options?: Omit<AnnounceOptions, "politeness">) => void;
  announceAssertive: (
    message: string,
    options?: Omit<AnnounceOptions, "politeness">,
  ) => void;
  clear: (politeness?: LiveRegionPoliteness) => void;
}

export interface LiveRegionProviderProps {
  children?: ReactNode;
  renderRegions?: boolean;
  politeClassName?: string;
  assertiveClassName?: string;
}

export interface LiveRegionProps extends HTMLAttributes<HTMLDivElement> {
  politeness?: LiveRegionPoliteness;
  atomic?: boolean;
  relevant?: "additions" | "removals" | "text" | "all" | "additions text";
  visuallyHidden?: boolean;
  slotName?: string;
}

export interface AnnouncerProps {
  message?: string;
  politeness?: LiveRegionPoliteness;
  debounceMs?: number;
  coalesceKey?: string;
  clearOnUnmount?: boolean;
}

type LiveRegionMessages = Record<LiveRegionPoliteness, string>;

const emptyMessages: LiveRegionMessages = {
  assertive: "",
  polite: "",
};

const noopAnnouncer: AnnouncerApi = {
  announce: () => undefined,
  announceAssertive: () => undefined,
  announcePolite: () => undefined,
  clear: () => undefined,
};

const LiveRegionContext = createContext<AnnouncerApi>(noopAnnouncer);

const liveRegionBaseClasses =
  "text-sm leading-5 text-foreground";

const liveRegionHiddenClasses =
  "sr-only";

export function liveRegionClassNames({
  className,
  visuallyHidden = true,
}: Pick<LiveRegionProps, "className" | "visuallyHidden"> = {}) {
  return cn(liveRegionBaseClasses, visuallyHidden ? liveRegionHiddenClasses : undefined, className);
}

export const LiveRegion = forwardRef<HTMLDivElement, LiveRegionProps>(
  (
    {
      atomic = true,
      children,
      className,
      politeness = "polite",
      relevant = "additions text",
      role,
      slotName = "live-region",
      visuallyHidden = true,
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      aria-atomic={atomic}
      aria-live={politeness}
      aria-relevant={relevant}
      role={role}
      data-slot={slotName}
      data-politeness={politeness}
      className={liveRegionClassNames({ className, visuallyHidden })}
    >
      {children}
    </div>
  ),
);

LiveRegion.displayName = "LiveRegion";

export function LiveRegionProvider({
  assertiveClassName,
  children,
  politeClassName,
  renderRegions = true,
}: LiveRegionProviderProps) {
  const [messages, setMessages] = useState<LiveRegionMessages>(emptyMessages);
  const lastMessagesRef = useRef<LiveRegionMessages>(emptyMessages);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const clearTimer = useCallback((key: string) => {
    const timer = timersRef.current.get(key);

    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(key);
    }
  }, []);

  const setChannelMessage = useCallback(
    (politeness: LiveRegionPoliteness, message: string) => {
      const previous = lastMessagesRef.current[politeness];

      if (previous === message && message.length > 0) {
        setMessages((current) => ({ ...current, [politeness]: "" }));
        window.setTimeout(() => {
          lastMessagesRef.current = {
            ...lastMessagesRef.current,
            [politeness]: message,
          };
          setMessages((current) => ({ ...current, [politeness]: message }));
        }, 10);
        return;
      }

      lastMessagesRef.current = {
        ...lastMessagesRef.current,
        [politeness]: message,
      };
      setMessages((current) => ({ ...current, [politeness]: message }));
    },
    [],
  );

  const clear = useCallback(
    (politeness?: LiveRegionPoliteness) => {
      if (politeness) {
        setChannelMessage(politeness, "");
        return;
      }

      lastMessagesRef.current = emptyMessages;
      setMessages(emptyMessages);
    },
    [setChannelMessage],
  );

  const announce = useCallback(
    (message: string, options: AnnounceOptions = {}) => {
      const politeness = options.politeness ?? "polite";
      const key = `${politeness}:${options.coalesceKey ?? "default"}`;
      const run = () => {
        timersRef.current.delete(key);
        setChannelMessage(politeness, message);
      };

      clearTimer(key);

      if ((options.debounceMs ?? 0) > 0) {
        timersRef.current.set(key, setTimeout(run, options.debounceMs));
        return;
      }

      run();
    },
    [clearTimer, setChannelMessage],
  );

  const value = useMemo<AnnouncerApi>(
    () => ({
      announce,
      announceAssertive: (message, options) =>
        announce(message, { ...options, politeness: "assertive" }),
      announcePolite: (message, options) =>
        announce(message, { ...options, politeness: "polite" }),
      clear,
    }),
    [announce, clear],
  );

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    },
    [],
  );

  return (
    <LiveRegionContext.Provider value={value}>
      {children}
      {renderRegions ? (
        <>
          <LiveRegion
            politeness="polite"
            slotName="live-region-polite"
            className={politeClassName}
          >
            {messages.polite}
          </LiveRegion>
          <LiveRegion
            politeness="assertive"
            role="alert"
            slotName="live-region-assertive"
            className={assertiveClassName}
          >
            {messages.assertive}
          </LiveRegion>
        </>
      ) : null}
    </LiveRegionContext.Provider>
  );
}

export function useAnnouncer() {
  return useContext(LiveRegionContext);
}

export function Announcer({
  clearOnUnmount = false,
  coalesceKey,
  debounceMs,
  message,
  politeness = "polite",
}: AnnouncerProps) {
  const announcer = useAnnouncer();

  useEffect(() => {
    if (message) {
      announcer.announce(message, {
        coalesceKey,
        debounceMs,
        politeness,
      });
    }
  }, [announcer, coalesceKey, debounceMs, message, politeness]);

  useEffect(
    () => () => {
      if (clearOnUnmount) {
        announcer.clear(politeness);
      }
    },
    [announcer, clearOnUnmount, politeness],
  );

  return null;
}
