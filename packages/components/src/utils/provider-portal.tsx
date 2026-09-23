import {
  createContext,
  type ForwardedRef,
  type ReactNode,
  type RefCallback,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { UNSAFE_PortalProvider } from "react-aria/PortalProvider";

const providerPortalDefaultClasses = "bg-background font-sans text-foreground";
const providerPortalMirroredAttributes = [
  "data-theme",
  "data-density",
  "dir",
] as const;

export type ProviderPortalMirroredAttribute =
  (typeof providerPortalMirroredAttributes)[number];

export interface ProviderPortalRootOptions<T extends HTMLElement> {
  forwardedRef?: ForwardedRef<T>;
  portalSlot: string;
}

export interface ProviderPortalRootState<T extends HTMLElement> {
  portalContainer: HTMLElement | null;
  rootRef: RefCallback<T>;
}

export interface DethinkPortalProviderProps {
  children?: ReactNode;
  container: HTMLElement | null;
}

const DethinkPortalContext = createContext(false);
const OverlayVisibilityContext = createContext(true);

/** Persistent surfaces can dismiss overlays without unmounting their content. */
export function DethinkOverlayScope({
  visible,
  children,
}: {
  visible: boolean;
  children?: ReactNode;
}) {
  const parentVisible = useContext(OverlayVisibilityContext);
  return (
    <OverlayVisibilityContext.Provider value={visible && parentVisible}>
      {children}
    </OverlayVisibilityContext.Provider>
  );
}

export function useScopedOverlayState({
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}): readonly [boolean, (open: boolean) => void] {
  const visible = useContext(OverlayVisibilityContext);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const requestedOpen = open ?? localOpen;
  const closeRequested = useRef(false);
  const setOpen = useCallback(
    (next: boolean) => {
      if (next && !visible) return;
      if (open === undefined) setLocalOpen(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange, visible],
  );
  useEffect(() => {
    if (visible) closeRequested.current = false;
    else if (requestedOpen && !closeRequested.current) {
      closeRequested.current = true;
      // Synchronize overlay state with the containing surface's lifecycle.
      setOpen(false);
    }
  }, [visible, requestedOpen, setOpen]);
  return [visible && requestedOpen, setOpen];
}

function assignForwardedRef<T>(
  ref: ForwardedRef<T> | undefined,
  value: T | null,
) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function fallbackProviderAttribute(name: ProviderPortalMirroredAttribute) {
  if (typeof document === "undefined") {
    return null;
  }

  if (name === "data-density") {
    return "default";
  }

  if (name === "data-theme") {
    return document.documentElement.getAttribute(name) ?? "system";
  }

  return document.documentElement.getAttribute("dir") ?? document.dir ?? "ltr";
}

export function syncDethinkPortalContainer({
  container,
  portalSlot,
  provider,
}: {
  container: HTMLElement;
  portalSlot: string;
  provider: HTMLElement | null;
}) {
  const source =
    provider ??
    (typeof document === "undefined" ? null : document.documentElement);

  container.setAttribute("data-slot", portalSlot);
  container.setAttribute("data-dethink-provider", "");
  container.className = provider?.className || providerPortalDefaultClasses;
  container.style.cssText = provider?.getAttribute("style") ?? "";
  container.style.display = "contents";

  for (const attribute of providerPortalMirroredAttributes) {
    const value =
      source?.getAttribute(attribute) ?? fallbackProviderAttribute(attribute);

    if (value) {
      container.setAttribute(attribute, value);
    } else {
      container.removeAttribute(attribute);
    }
  }
}

export function useProviderPortalRoot<T extends HTMLElement>({
  forwardedRef,
  portalSlot,
}: ProviderPortalRootOptions<T>): ProviderPortalRootState<T> {
  const [portalContainer] = useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") {
      return null;
    }

    return document.createElement("div");
  });
  const [rootElement, setRootElement] = useState<T | null>(null);

  const rootRef = useCallback(
    (node: T | null) => {
      setRootElement(node);
      assignForwardedRef(forwardedRef, node);

      if (node && portalContainer && typeof document !== "undefined") {
        const provider =
          node.closest<HTMLElement>("[data-dethink-provider]") ?? null;

        syncDethinkPortalContainer({
          container: portalContainer,
          portalSlot,
          provider,
        });

        if (!portalContainer.isConnected) {
          document.body.appendChild(portalContainer);
        }
      }
    },
    [forwardedRef, portalContainer, portalSlot],
  );

  useEffect(() => {
    if (!portalContainer || typeof document === "undefined") {
      return undefined;
    }

    const provider =
      rootElement?.closest<HTMLElement>("[data-dethink-provider]") ?? null;
    const syncContainer = () => {
      syncDethinkPortalContainer({
        container: portalContainer,
        portalSlot,
        provider,
      });
    };

    syncContainer();
    document.body.appendChild(portalContainer);

    const observerTarget = provider ?? document.documentElement;
    const observer = new MutationObserver(syncContainer);
    observer.observe(observerTarget, {
      attributeFilter: ["class", "data-density", "data-theme", "dir", "style"],
      attributes: true,
    });

    return () => {
      observer.disconnect();
      portalContainer.remove();
    };
  }, [portalContainer, portalSlot, rootElement]);

  return {
    portalContainer,
    rootRef,
  };
}

export function DethinkPortalProvider({
  children,
  container,
}: DethinkPortalProviderProps) {
  const hasDethinkPortalParent = useContext(DethinkPortalContext);
  const content = hasDethinkPortalParent ? (
    children
  ) : (
    <UNSAFE_PortalProvider getContainer={() => container}>
      {children}
    </UNSAFE_PortalProvider>
  );

  return (
    <DethinkPortalContext.Provider value>
      {content}
    </DethinkPortalContext.Provider>
  );
}
