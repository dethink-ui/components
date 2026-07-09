import type { AvatarGroupMember } from "@dethink/components";

export const avatarImagePaths = {
  eli: "/avatars/showcase/eli-engineering.png",
  leo: "/avatars/showcase/leo-product.png",
  mira: "/avatars/showcase/mira-ops.png",
  noah: "/avatars/showcase/noah-design.png",
} as const;

export const avatarMembers: AvatarGroupMember[] = [
  {
    id: "noah",
    metadata: "Design systems",
    name: "Noah Reyes",
    loading: "lazy",
    sizes: "40px",
    src: avatarImagePaths.noah,
    tone: "primary",
  },
  {
    id: "eli",
    metadata: "Frontend",
    name: "Eli Morgan",
    loading: "lazy",
    sizes: "40px",
    src: avatarImagePaths.eli,
    tone: "info",
  },
  {
    id: "mira",
    metadata: "Operations",
    name: "Mira Patel",
    loading: "lazy",
    sizes: "40px",
    src: avatarImagePaths.mira,
    tone: "success",
  },
  {
    id: "leo",
    metadata: "Product",
    name: "Leo Novak",
    loading: "lazy",
    sizes: "40px",
    src: avatarImagePaths.leo,
    tone: "warning",
  },
  {
    id: "sam",
    metadata: "QA",
    name: "Sam Rivera",
    tone: "destructive",
  },
  {
    id: "june",
    metadata: "Security",
    name: "June Okafor",
    tone: "neutral",
  },
];
