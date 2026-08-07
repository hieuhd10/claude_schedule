import type { ComponentType, ReactNode } from "react";

// The bundle reads a global `React`, so the shim has to be evaluated first.
import "./react-global";
import "./lift-tailux/_ds_bundle.js";
import "./lift-tailux/styles.css";

export type DsColor = "neutral" | "primary" | "secondary" | "info" | "success" | "warning" | "error";

interface BundleError {
  path: string;
  error: string;
}

interface LiftTailuxNamespace {
  __errors: BundleError[];
  [component: string]: unknown;
}

const namespace = (globalThis as unknown as Record<string, LiftTailuxNamespace | undefined>)
  .LIFTTailuxDesignSystem_19bb17;

if (!namespace) {
  throw new Error("LIFT Tailux bundle did not register its global namespace.");
}
if (namespace.__errors.length > 0) {
  // Individual components are wrapped in try/catch by the bundle, so a partial
  // failure is silent otherwise.
  console.error("LIFT Tailux components failed to load:", namespace.__errors);
}

function component<P>(name: string): ComponentType<P> {
  const resolved = namespace![name];
  if (!resolved) {
    throw new Error(`LIFT Tailux component "${name}" is missing from the bundle.`);
  }
  return resolved as ComponentType<P>;
}

/*
 * Prop contracts below mirror the bundle implementations
 * (`components/{core,data-display,forms}/*.jsx` in the design system package).
 * Extra props are forwarded to the rendered element.
 */

type Common = { className?: string; style?: React.CSSProperties; children?: ReactNode };

export interface ButtonProps extends Common, React.ButtonHTMLAttributes<HTMLButtonElement> {
  component?: string;
  color?: DsColor;
  variant?: "filled" | "soft" | "outlined" | "flat";
  isIcon?: boolean;
  isGlow?: boolean;
  unstyled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export interface CardProps extends Common {
  component?: string;
  skin?: "shadow" | "bordered" | "none";
}

export interface BadgeProps extends Common {
  component?: string;
  variant?: "filled" | "soft" | "outlined";
  color?: DsColor;
  isGlow?: boolean;
}

export interface TagProps extends Common {
  component?: string;
  variant?: "filled" | "soft";
  color?: DsColor;
  href?: string;
  target?: string;
  rel?: string;
}

export interface AvatarProps extends Common {
  component?: string;
  name?: string;
  /** Rendered size in 0.25rem units, matching the bundle (size 8 → 2rem). */
  size?: number;
  initialColor?: DsColor | "auto";
  initialVariant?: "filled" | "soft" | "outlined";
}

export interface ProgressProps extends Common {
  value?: number;
  color?: DsColor;
  variant?: "default" | "soft";
  showRail?: boolean;
  isActive?: boolean;
  isIndeterminate?: boolean;
}

export interface TimelineProps extends Common {
  variant?: "filled" | "soft" | "outlined";
  lineSpace?: boolean;
  pointSize?: string;
  lineWidth?: string;
}

export interface TimelineItemProps extends Common {
  title?: ReactNode;
  time?: ReactNode;
  point?: ReactNode;
  color?: DsColor;
  variant?: "filled" | "soft" | "outlined";
  isPing?: boolean;
}

export interface TableProps extends Common {
  component?: string;
  hoverable?: boolean;
  zebra?: boolean;
  dense?: boolean;
  sticky?: boolean;
}

export interface TableCellProps extends Common {
  component?: string;
  colSpan?: number;
  scope?: string;
}

export const Button = component<ButtonProps>("Button");
export const Card = component<CardProps>("Card");
export const Badge = component<BadgeProps>("Badge");
export const Tag = component<TagProps>("Tag");
export const Avatar = component<AvatarProps>("Avatar");
export const Progress = component<ProgressProps>("Progress");
export const Timeline = component<TimelineProps>("Timeline");
export const TimelineItem = component<TimelineItemProps>("TimelineItem");
export const Table = component<TableProps>("Table");
export const THead = component<Common>("THead");
export const TBody = component<Common>("TBody");
export const Tr = component<Common>("Tr");
export const Th = component<TableCellProps>("Th");
export const Td = component<TableCellProps>("Td");
