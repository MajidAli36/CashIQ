"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

export function useAnimatedCounter(
  end: number,
  duration: number = 2000,
  prefix: string = "",
  suffix: string = ""
) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const startAnimation = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(startAnimation);
      }
    };

    animationFrame = requestAnimationFrame(startAnimation);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return `${prefix}${count.toLocaleString()}${suffix}`;
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const float = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(0, 245, 176, 0.3)",
      "0 0 40px rgba(0, 245, 176, 0.5)",
      "0 0 20px rgba(0, 245, 176, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const shimmer = {
  initial: { backgroundPosition: "-200% 0" },
  animate: { backgroundPosition: "200% 0" },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "linear",
  },
};