"use client";

import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { motion, HTMLMotionProps } from "framer-motion";

interface SectionProps extends HTMLMotionProps<"section"> {
  dark?: boolean;
  children: ReactNode;
  id?: string;
}

export function Section({ 
  className, 
  dark = true, 
  children, 
  id,
  ...props 
}: SectionProps) {
  return (
    <motion.section
      id={id}
      className={cn(
        "py-20 lg:py-32",
        dark ? "bg-[#050816]" : "bg-[#F5F6FA]",
        className
      )}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div 
      className={cn("max-w-7xl mx-auto px-6 lg:px-10", className)} 
      {...props}
    >
      {children}
    </div>
  );
}