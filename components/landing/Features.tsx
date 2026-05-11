"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, Building2, CreditCard, Users, BarChart3, Shield, ChevronRight, Zap, ArrowRight } from "lucide-react";
import { Container, Badge, Button } from "@/components/landing";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Real-Time Cash Flow",
    description: "Every rupee tracked the moment it moves — cash, bank, JazzCash, EasyPaisa — auto-categorized in one unified ledger.",
    accent: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.2)",
  },
  {
    icon: Building2,
    title: "Multi-Business Hub",
    description: "Separate books for each business, one unified dashboard. Built for entrepreneurs running multiple shops simultaneously.",
    accent: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    icon: CreditCard,
    title: "PDC & Cheque Tracker",
    description: "Track every post-dated cheque with auto-alerts before due dates. No paper piles, no nasty surprises, ever.",
    accent: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    icon: Users,
    title: "Customer Ledger",
    description: "Full transaction history per customer with live outstanding balances. Know exactly who owes you and since when.",
    accent: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    icon: BarChart3,
    title: "Instant P&L Reports",
    description: "Profit & loss, expense breakdowns, category insights — generated in seconds. No accountant. No month-end panic.",
    accent: "#EC4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.2)",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "256-bit encryption, SOC 2 compliance, and local data residency. Your data stays private — always, no exceptions.",
    accent: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.2)",
  },
];

const container = { animate: { transition: { staggerChildren: 0.08 } } };
const item = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function Features() {
  return (
    <section
      id="features"
      className="py-24 lg:py-32"
      style={{ background: "#FFFFFF" }}
    >
      {/* Top edge: smooth transition from dark stats */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)" }} />

      <Container>
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Badge color="#8B5CF6">
            <Zap size={11} strokeWidth={2.5} /> Core Features
          </Badge>
          <h2 className="text-[34px] lg:text-[46px] font-black text-[#0B1120] tracking-[-0.03em] leading-[1.1] mb-5 mt-4">
            Everything Your Business Needs,{" "}
            <span style={{
              background: "linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>in One App</span>
          </h2>
          <p className="text-[#64748B] text-lg leading-[1.8] font-light">
            Stop juggling spreadsheets, WhatsApp notes, and paper ledgers. Your entire financial operation — one screen, always live.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {FEATURES.map((feature, i) => (
            <motion.div key={i} variants={item}>
              <div
                className="group p-7 rounded-2xl border transition-all duration-300 cursor-pointer h-full hover:-translate-y-1"
                style={{
                  background: "#FAFBFD",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${feature.accent}18, 0 2px 8px rgba(0,0,0,0.08)`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${feature.accent}35`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.07)";
                }}
              >
                <div
                  className="w-11 h-11 rounded-[13px] flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: feature.bg, border: `1px solid ${feature.border}` }}
                >
                  <feature.icon size={19} strokeWidth={2} style={{ color: feature.accent }} />
                </div>
                <h3 className="text-[#0F172A] font-bold text-[15px] mb-2.5 leading-snug tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[#64748B] text-sm leading-[1.75] font-light">
                  {feature.description}
                </p>
                <div
                  className="flex items-center gap-1 mt-5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{ color: feature.accent }}
                >
                  <span>Learn more</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/dashboard">
            <Button className="gap-2">
              Try All Features Free <ArrowRight size={15} strokeWidth={2.5} />
            </Button>
          </Link>
          <p className="text-[#94A3B8] text-sm mt-3">
            No credit card · Free forever plan · Setup in 60 seconds
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
