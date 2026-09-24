"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useRef,
  useState,
  version as reactVersion,
  type HTMLAttributes,
  type Ref,
  type MutableRefObject,
} from "react";
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import { cn } from "../../utils/cn";
const inertAttribute = (
  Number.parseInt(reactVersion, 10) < 19 ? "" : true
) as true;

const OrientationContext = createContext<"horizontal" | "vertical">(
  "horizontal",
);
export type ResizablePanelGroupProps = GroupProps;
export type ResizablePanelProps = PanelProps;
export type ResizableHandleProps = SeparatorProps & { withHandle?: boolean };
export type {
  GroupImperativeHandle as ResizableGroupHandle,
  PanelImperativeHandle as ResizablePanelHandle,
  Layout as ResizableLayout,
} from "react-resizable-panels";

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as MutableRefObject<T>).current = value;
}

export const ResizablePanelGroup = forwardRef<
  HTMLDivElement,
  ResizablePanelGroupProps
>(function ResizablePanelGroup(
  {
    className,
    orientation = "horizontal",
    resizeTargetMinimumSize = { coarse: 44, fine: 12 },
    elementRef,
    onPointerCancel,
    ...props
  },
  ref,
) {
  return (
    <OrientationContext.Provider value={orientation}>
      <Group
        {...props}
        orientation={orientation}
        resizeTargetMinimumSize={resizeTargetMinimumSize}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          // Engine 4.13 listens for pointerup but not pointercancel. Complete
          // only an active resize in this group, retaining its latest size.
          // Dispatch on the document so pane content does not receive a fake up.
          if (event.currentTarget.querySelector('[data-separator="active"]')) {
            event.currentTarget.ownerDocument.dispatchEvent(
              new PointerEvent("pointerup", {
                pointerId: event.pointerId,
                pointerType: event.pointerType,
                clientX: event.clientX,
                clientY: event.clientY,
                button: 0,
              }),
            );
          }
        }}
        elementRef={(node) => {
          assignRef(ref, node);
          assignRef(elementRef, node);
        }}
        data-slot="resizable-group"
        data-orientation={orientation}
        className={cn("min-h-0 min-w-0", className)}
      />
    </OrientationContext.Provider>
  );
});

export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  function ResizablePanel(
    { className, children, panelRef, elementRef, onResize, ...props },
    ref,
  ) {
    const handle = useRef<PanelImperativeHandle | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    return (
      <Panel
        {...props}
        elementRef={(node) => {
          assignRef(ref, node);
          assignRef(elementRef, node);
        }}
        panelRef={(value) => {
          handle.current = value;
          assignRef(panelRef, value);
        }}
        onResize={(size, id, previous) => {
          setCollapsed(handle.current?.isCollapsed() ?? false);
          onResize?.(size, id, previous);
        }}
        data-slot="resizable-panel"
        data-collapsed={collapsed || undefined}
        className={cn(
          "bg-background text-foreground flex min-h-0 min-w-0 flex-col",
          className,
        )}
      >
        <div
          {...{
            inert: collapsed && props.collapsible ? inertAttribute : undefined,
          }}
          aria-hidden={(collapsed && props.collapsible) || undefined}
          className="flex min-h-0 flex-1 flex-col"
        >
          {children}
        </div>
      </Panel>
    );
  },
);

export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(
  function ResizableHandle(
    { className, withHandle = true, children, elementRef, ...props },
    ref,
  ) {
    const vertical = useContext(OrientationContext) === "vertical";
    return (
      <Separator
        {...props}
        elementRef={(node) => {
          assignRef(ref, node);
          assignRef(elementRef, node);
        }}
        data-slot="resizable-handle"
        className={cn(
          "bg-border data-[separator=hover]:bg-primary/50 data-[separator=active]:bg-primary data-[separator=focus]:bg-primary focus-visible:ring-ring focus-visible:ring-offset-background relative z-10 flex shrink-0 touch-none items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-offset-2 forced-colors:bg-[ButtonBorder]",
          vertical ? "h-px w-full" : "h-full w-px",
          className,
        )}
      >
        {children ??
          (withHandle && (
            <span
              aria-hidden="true"
              className={cn(
                "border-border bg-background text-muted-foreground pointer-events-none flex items-center justify-center rounded-full border shadow-sm",
                vertical ? "h-3 w-7" : "h-7 w-3",
              )}
            >
              <span
                className={cn(
                  "rounded-full bg-current",
                  vertical ? "h-0.5 w-3" : "h-3 w-0.5",
                )}
              />
            </span>
          ))}
      </Separator>
    );
  },
);

export const ResizablePanelHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function ResizablePanelHeader({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="resizable-panel-header"
      className={cn(
        "border-border flex min-h-12 shrink-0 items-center justify-between gap-3 border-b px-[calc(var(--dt-density-gap)+var(--dt-space-2))] py-[var(--dt-density-gap)] text-sm font-medium",
        className,
      )}
    />
  );
});
export const ResizablePanelBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function ResizablePanelBody({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="resizable-panel-body"
      tabIndex={props.tabIndex ?? 0}
      className={cn(
        "focus-visible:ring-ring min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain p-[calc(var(--dt-density-gap)+var(--dt-space-2))] outline-none focus-visible:ring-2 focus-visible:ring-inset",
        className,
      )}
    />
  );
});
export const ResizablePanelFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function ResizablePanelFooter({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      data-slot="resizable-panel-footer"
      className={cn(
        "border-border text-muted-foreground flex shrink-0 items-center justify-between gap-3 border-t px-[calc(var(--dt-density-gap)+var(--dt-space-2))] py-2 text-xs",
        className,
      )}
    />
  );
});
