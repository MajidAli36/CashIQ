"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, TrendingUp, CreditCard, Smartphone, BarChart3 } from "lucide-react";
import { Container, Badge, Button } from "@/components/landing";

const STEPS = [
  {
    n: "01",
    icon: Smartphone,
    title: "Add Your Business in 60 Seconds",
    description: "Enter your shop name, pick your category, connect your accounts. No paperwork, no tech skills required.",
    accent: "#00F8B4",
  },
  {
    n: "02",
    icon: CreditCard,
    title: "Record Any Transaction Instantly",
    description: "Sale, expense, loan, cheque — add it in 3 taps. The app auto-categorizes and learns your patterns.",
    accent: "#00C4FF",
  },
  {
    n: "03",
    icon: BarChart3,
    title: "See Your Numbers in Real Time",
    description: "Profit, balances, daily cash position — all live on your dashboard. No more guessing.",
    accent: "#A78BFA",
  },
];

const BENEFITS = [
  "Real-time balance across all payment methods",
  "Auto-categorization of income & expenses",
  "Cheque bounce alerts and PDC tracking",
  "Instant PDF statements for any date range",
];

const GRADIENT = "linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)";

export function Benefits() {
  return (
    <section
      id="how-it-works"
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "#030B19" }}
    >
      {/* Ambient */}
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,248,180,0.15), transparent)" }} />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-y-1/2"
        style={{ background: "radial-gradient(circle, rgba(0,196,255,0.04) 0%, transparent 65%)" }} />

      <Container>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge>
              <TrendingUp size={11} /> How It Works
            </Badge>
            <h2 className="text-[34px] lg:text-[44px] font-black text-white tracking-[-0.03em] mb-5 leading-[1.1] mt-4">
              Get Started in<br />Three Simple Steps
            </h2>
            <p className="text-white/55 text-lg leading-[1.8] mb-10 font-light">
              Stop drowning in paperwork. Start running your business from your phone with complete financial clarity in real-time.
            </p>

            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  className="flex gap-4 p-4 rounded-2xl border transition-all duration-300 group cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${step.accent}08`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${step.accent}30`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ background: GRADIENT }}
                  >
                    <span className="text-[#020617] font-black text-sm">{step.n}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1 leading-snug">{step.title}</p>
                    <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/dashboard" className="inline-block mt-9">
              <Button className="gap-2">
                Start Free <ArrowRight size={15} strokeWidth={2.5} />
              </Button>
            </Link>
          </motion.div>

          {/* Right — Why CashIQ card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="p-8 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3 className="text-white font-bold text-xl mb-2">Why CashIQ?</h3>
              <p className="text-white/45 text-sm mb-8">Built specifically for Pakistani businesses</p>
              <div className="space-y-4">
                {BENEFITS.map((benefit, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3.5"
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: GRADIENT }}
                    >
                      <Check size={10} className="text-[#020617]" strokeWidth={3} />
                    </div>
                    <span className="text-white/75 text-sm font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats row */}
              <div className="mt-8 pt-7 border-t border-white/[0.07] grid grid-cols-2 gap-4">
                {[
                  { value: "60 sec", label: "Setup time" },
                  { value: "50K+", label: "Active users" },
                  { value: "Free", label: "Forever plan" },
                  { value: "4.9★", label: "App rating" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-black text-xl text-white leading-none mb-0.5"
                      style={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {value}
                    </p>
                    <p className="text-white/40 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
