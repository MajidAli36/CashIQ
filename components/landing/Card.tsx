"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "glass" | "solid" | "-border";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "glass", hover = false, children, ...props }, ref) => {
    const variants = {
      glass: "bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08]",
      solid: "bg-[#1F2937] border border-white/10",
      border: "bg-transparent border border-white/10",
    };

    const hoverStyles = hover
      ? "hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300"
      : "";

    return (
      <motion.div
        ref={ref}
        className={cn("rounded-2xl", variants[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps };