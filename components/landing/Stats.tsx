"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/landing";

const STATS = [
  { value: 50000, suffix: "+", label: "Businesses Active", prefix: "" },
  { value: 2000000, suffix: "+", label: "Transactions Tracked", prefix: "" },
  { value: 10, suffix: "B+", label: "Revenue Managed", prefix: "₨" },
  { value: 4.9, suffix: " ★", label: "App Store Rating", prefix: "", decimals: 1 },
];

const GRADIENT = "linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)";

export function Stats() {
  return (
    <section style={{ background: "#020B1A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="text-center px-6 py-8 relative"
                style={{
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                {/* Mobile: hide right border on even items in 2-col grid */}
                <p
                  className="text-[26px] lg:text-[32px] font-black mb-1.5 tracking-tight"
                  style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  {stat.prefix}
                  <AnimatedCounter
                    end={stat.value}
                    duration={2000}
                    suffix={stat.suffix}
                    decimals={stat.decimals || 0}
                  />
                </p>
                <p className="text-white/50 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
