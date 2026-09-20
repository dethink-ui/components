import {
  forwardRef,
  useState,
  type FocusEventHandler,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import {
  motion as motionElement,
  useReducedMotion,
  type HTMLMotionProps,
  type TargetAndTransition,
} from "motion/react";
import { cn } from "../../utils/cn";
import { useHydrated } from "../../utils/use-hydrated";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarTone =
  "neutral" | "primary" | "success" | "warning" | "destructive" | "info";
export type AvatarRing = "none" | "border" | "ring";
export type AvatarMotion = "none" | "subtle" | "standard";
export type AvatarImageState = "image" | "fallback" | "failed";

export type AvatarImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  | "aria-hidden"
  | "aria-label"
  | "aria-labelledby"
  | "alt"
  | "children"
  | "className"
  | "crossOrigin"
  | "decoding"
  | "fetchPriority"
  | "height"
  | "loading"
  | "onError"
  | "onLoad"
  | "referrerPolicy"
  | "role"
  | "sizes"
  | "src"
  | "srcSet"
  | "style"
  | "width"
>;

export interface AvatarProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "aria-label" | "aria-labelledby" | "children" | "role"
> {
  alt?: string;
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
  decorative?: boolean;
  fallbackIcon?: ReactNode;
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>["fetchPriority"];
  imageProps?: AvatarImageProps;
  initials?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  motion?: AvatarMotion;
  name?: string;
  onImageError?: ImgHTMLAttributes<HTMLImageElement>["onError"];
  onImageLoad?: ImgHTMLAttributes<HTMLImageElement>["onLoad"];
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  reducedMotion?: boolean;
  ring?: AvatarRing;
  shape?: AvatarShape;
  size?: AvatarSize;
  sizes?: string;
  src?: string;
  srcSet?: string;
  tone?: AvatarTone;
}

const avatarBaseClasses =
  "relative inline-flex aspect-square shrink-0 select-none items-center justify-center overflow-hidden border align-middle font-semibold leading-none outline-none [rotate:0deg] [scale:1] [translate:0_0] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[reduced-motion=true]:will-change-auto";

const avatarSizeClasses: Record<AvatarSize, string> = {
  xs: "[--avatar-icon-size:calc(var(--avatar-size)*0.48)] [--avatar-size:calc(var(--dt-density-control)*0.65)] size-[var(--avatar-size)] text-[0.625rem]",
  sm: "[--avatar-icon-size:calc(var(--avatar-size)*0.48)] [--avatar-size:calc(var(--dt-density-control)*0.8)] size-[var(--avatar-size)] text-xs",
  md: "[--avatar-icon-size:calc(var(--avatar-size)*0.48)] [--avatar-size:var(--dt-density-control)] size-[var(--avatar-size)] text-sm",
  lg: "[--avatar-icon-size:calc(var(--avatar-size)*0.48)] [--avatar-size:calc(var(--dt-density-control)*1.2)] size-[var(--avatar-size)] text-base",
  xl: "[--avatar-icon-size:calc(var(--avatar-size)*0.46)] [--avatar-size:calc(var(--dt-density-control)*1.45)] size-[var(--avatar-size)] text-lg",
  "2xl":
    "[--avatar-icon-size:calc(var(--avatar-size)*0.44)] [--avatar-size:calc(var(--dt-density-control)*1.75)] size-[var(--avatar-size)] text-xl",
};

const avatarShapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-md",
  square: "rounded-none",
};

const avatarToneClasses: Record<AvatarTone, string> = {
  neutral: "bg-muted text-foreground",
  primary: "bg-primary/10 text-foreground",
  success: "bg-success/10 text-foreground",
  warning: "bg-warning/15 text-foreground",
  destructive: "bg-destructive/10 text-foreground",
  info: "bg-info/10 text-foreground",
};

const avatarRingClasses: Record<AvatarRing, string> = {
  none: "border-transparent",
  border: "border-border contrast-more:border-current",
  ring: "border-background ring-2 ring-ring/35 ring-offset-2 ring-offset-background contrast-more:border-current contrast-more:ring-current",
};

const avatarImageClasses = "absolute inset-0 size-full object-cover";

const avatarFallbackClasses =
  "absolute inset-0 flex size-full items-center justify-center text-center";

const avatarInitialsClasses =
  "max-w-full truncate px-[var(--dt-space-0-5)] uppercase";

const avatarIconClasses =
  "inline-flex size-[var(--avatar-icon-size)] items-center justify-center opacity-85 [&>svg]:size-full [&>svg]:shrink-0";

const avatarMotionTargets: Record<
  Exclude<AvatarMotion, "none">,
  TargetAndTransition
> = {
  subtle: {
    opacity: 0.96,
    scale: 1.015,
    transition: { type: "spring", stiffness: 420, damping: 36, mass: 0.8 },
  },
  standard: {
    opacity: 0.94,
    scale: 1.035,
    transition: { type: "spring", stiffness: 480, damping: 34, mass: 0.75 },
  },
};

const reducedMotionTarget: TargetAndTransition = {
  opacity: 0.96,
  transition: { duration: 0 },
};

export function avatarClassNames({
  className,
  ring = "none",
  shape = "circle",
  size = "md",
  tone = "neutral",
}: Pick<AvatarProps, "className" | "ring" | "shape" | "size" | "tone"> = {}) {
  return cn(
    avatarBaseClasses,
    avatarSizeClasses[size],
    avatarShapeClasses[shape],
    avatarToneClasses[tone],
    avatarRingClasses[ring],
    "contrast-more:bg-background contrast-more:text-foreground",
    className,
  );
}

export function getAvatarInitials(name: string, maxInitials = 2) {
  if (!Number.isFinite(maxInitials)) {
    maxInitials = 2;
  }

  const count = Math.min(Math.floor(maxInitials), 3);

  if (count <= 0) {
    return "";
  }

  const tokens = name
    .trim()
    .replace(/['’]/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/u)
    .filter(Boolean);

  if (tokens.length === 0) {
    return "";
  }

  const selected =
    tokens.length === 1
      ? Array.from(tokens[0]).slice(0, count)
      : count === 1
        ? [Array.from(tokens[0])[0]]
        : count === 2 || tokens.length === 2
          ? [Array.from(tokens[0])[0], Array.from(tokens[tokens.length - 1])[0]]
          : [
              Array.from(tokens[0])[0],
              Array.from(tokens[1])[0],
              Array.from(tokens[tokens.length - 1])[0],
            ];

  return selected.join("").toUpperCase();
}

function normalizeInitials(initials: string) {
  return Array.from(initials.trim().replace(/\s+/gu, ""))
    .slice(0, 3)
    .join("")
    .toUpperCase();
}

function DefaultAvatarIcon() {
  return (
    <svg aria-hidden="true" fill="none" focusable="false" viewBox="0 0 24 24">
      <path
        d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm7.25 7.5a7.25 7.25 0 0 0-14.5 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function getMotionTarget({
  motion,
  reducedMotion,
}: {
  motion: AvatarMotion;
  reducedMotion: boolean;
}) {
  if (motion === "none") {
    return undefined;
  }

  if (reducedMotion) {
    return reducedMotionTarget;
  }

  return avatarMotionTargets[motion];
}

function getMotionBehavior({
  motion,
  reducedMotion,
}: {
  motion: AvatarMotion;
  reducedMotion: boolean;
}) {
  if (motion === "none") {
    return "disabled";
  }

  return reducedMotion ? "opacity" : "transform-opacity";
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      alt,
      className,
      crossOrigin,
      decoding,
      decorative = false,
      fallbackIcon,
      fetchPriority,
      imageProps,
      initials,
      loading,
      motion = "standard",
      name,
      onBlur,
      onFocus,
      onImageError,
      onImageLoad,
      onMouseEnter,
      onMouseLeave,
      onPointerEnter,
      onPointerLeave,
      referrerPolicy,
      reducedMotion: reducedMotionProp,
      ring = "none",
      shape = "circle",
      size = "md",
      sizes,
      src,
      srcSet,
      tone = "neutral",
      ...props
    },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const hasHydrated = useHydrated();
    const reducedMotion =
      motion === "none" ||
      reducedMotionProp === true ||
      (hasHydrated && prefersReducedMotion === true);
    const [imageResult, setImageResult] = useState({ src, failed: false });
    const imageFailed = imageResult.src === src && imageResult.failed;
    if (imageResult.src !== src) {
      setImageResult({ src, failed: false });
    }
    const [motionActive, setMotionActive] = useState(false);
    const hasImage = Boolean(src);
    const showImage = hasImage && !imageFailed;
    const imageState: AvatarImageState = showImage
      ? "image"
      : imageFailed
        ? "failed"
        : "fallback";
    const isDecorative = decorative || alt === "";
    const normalizedInitials =
      initials !== undefined ? normalizeInitials(initials) : undefined;
    const generatedInitials =
      normalizedInitials === undefined && !fallbackIcon && name
        ? getAvatarInitials(name)
        : "";
    const fallbackInitials = normalizedInitials ?? generatedInitials;
    const accessibleLabel = isDecorative
      ? undefined
      : alt || name || fallbackInitials || undefined;
    const imageAlt = isDecorative
      ? ""
      : (alt ?? name ?? fallbackInitials ?? "");
    const rootRole = !showImage && accessibleLabel ? "img" : undefined;
    const motionTarget = getMotionTarget({ motion, reducedMotion });
    const motionBehavior = getMotionBehavior({ motion, reducedMotion });

    const handleImageError: ImgHTMLAttributes<HTMLImageElement>["onError"] = (
      event,
    ) => {
      setImageResult({ src, failed: true });
      onImageError?.(event);
    };

    const handleImageLoad: ImgHTMLAttributes<HTMLImageElement>["onLoad"] = (
      event,
    ) => {
      onImageLoad?.(event);
    };

    const handlePointerEnter: PointerEventHandler<HTMLSpanElement> = (
      event,
    ) => {
      if (event.pointerType !== "touch") {
        setMotionActive(true);
      }

      onPointerEnter?.(event);
    };

    const handlePointerLeave: PointerEventHandler<HTMLSpanElement> = (
      event,
    ) => {
      setMotionActive(false);
      onPointerLeave?.(event);
    };

    const handleMouseEnter: MouseEventHandler<HTMLSpanElement> = (event) => {
      setMotionActive(true);
      onMouseEnter?.(event);
    };

    const handleMouseLeave: MouseEventHandler<HTMLSpanElement> = (event) => {
      setMotionActive(false);
      onMouseLeave?.(event);
    };

    const handleFocus: FocusEventHandler<HTMLSpanElement> = (event) => {
      setMotionActive(true);
      onFocus?.(event);
    };

    const handleBlur: FocusEventHandler<HTMLSpanElement> = (event) => {
      setMotionActive(false);
      onBlur?.(event);
    };

    return (
      <motionElement.span
        {...(props as HTMLMotionProps<"span">)}
        ref={ref}
        aria-hidden={isDecorative ? true : undefined}
        aria-label={rootRole ? accessibleLabel : undefined}
        data-slot="avatar"
        data-size={size}
        data-shape={shape}
        data-tone={tone}
        data-ring={ring}
        data-motion={motion}
        data-motion-behavior={motionBehavior}
        data-motion-state={motionActive ? "active" : "idle"}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        data-state={imageState}
        role={rootRole}
        className={avatarClassNames({ className, ring, shape, size, tone })}
        initial={false}
        whileFocus={motionTarget}
        whileHover={motionTarget}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <span
          aria-hidden="true"
          data-slot="avatar-fallback"
          className={avatarFallbackClasses}
        >
          {fallbackInitials ? (
            <span data-slot="avatar-initials" className={avatarInitialsClasses}>
              {fallbackInitials}
            </span>
          ) : (
            <span data-slot="avatar-icon" className={avatarIconClasses}>
              {fallbackIcon ?? <DefaultAvatarIcon />}
            </span>
          )}
        </span>
        {showImage ? (
          <img
            {...imageProps}
            alt={imageAlt}
            className={avatarImageClasses}
            crossOrigin={crossOrigin}
            data-slot="avatar-image"
            decoding={decoding}
            fetchPriority={fetchPriority}
            loading={loading}
            onError={handleImageError}
            onLoad={handleImageLoad}
            referrerPolicy={referrerPolicy}
            sizes={sizes}
            src={src}
            srcSet={srcSet}
          />
        ) : null}
      </motionElement.span>
    );
  },
);

Avatar.displayName = "Avatar";
