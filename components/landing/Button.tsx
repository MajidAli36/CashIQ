"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { motion, HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", glow = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-gradient-to-r from-[#00F5D4] to-[#00C2FF] text-[#050816] hover:shadow-[0_0_30px_rgba(0,245,212,0.4)] hover:scale-[1.02] active:scale-[0.98]",
      secondary: "bg-[#1F2937] text-white hover:bg-[#374151] border border-white/10",
      ghost: "text-white/70 hover:text-white hover:bg-white/5",
      outline: "border border-white/20 text-white hover:bg-white/5",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const glowStyles = glow
      ? "shadow-[0_0_20px_rgba(0,245,212,0.3)] hover:shadow-[0_0_40px_rgba(0,245,212,0.5)]"
      : "";

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], glowStyles, className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant };