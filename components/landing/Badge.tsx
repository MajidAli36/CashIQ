"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "glass" | "solid";
  color?: string;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "glass", color = "#00F5D4", children, ...props }, ref) => {
    const variants = {
      default: "",
      glass: "bg-white/[0.04] backdrop-blur-md border border-white/[0.08]",
      solid: "",
    };

    const style = variant === "default" 
      ? {} 
      : variant === "glass"
        ? { background: `${color}15`, borderColor: `${color}30`, color }
        : { background: color, color: "#050816" };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full",
          variants[variant],
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps };