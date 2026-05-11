"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Globe, Award, Check } from "lucide-react";
import { Container, Badge } from "@/components/landing";

const SECURITY_ITEMS = [
  {
    icon: Shield,
    title: "256-bit SSL Encryption",
    description: "All data in transit and at rest is military-grade encrypted. Same standard as global banks.",
    accent: "#00F8B4",
  },
  {
    icon: Lock,
    title: "Privacy by Design",
    description: "We never sell, share, or analyze your business data. It belongs to you — period.",
    accent: "#00C4FF",
  },
  {
    icon: Globe,
    title: "Local Data Residency",
    description: "Your data stays in Pakistan. No overseas servers. No foreign exposure. Full compliance.",
    accent: "#A78BFA",
  },
  {
    icon: Award,
    title: "SOC 2 Certified",
    description: "Independently audited for security, availability, and confidentiality every year.",
    accent: "#F59E0B",
  },
];

const CHECKS = [
  "Military-grade 256-bit encryption",
  "SOC 2 Type II certified",
  "100% local data residency in Pakistan",
  "Regular third-party security audits",
];

const GRADIENT = "linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)";

export function Security() {
  return (
    <section
      id="security"
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "#060E1C" }}
    >
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,196,255,0.12), transparent)" }} />
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-y-1/2"
        style={{ background: "radial-gradient(circle, rgba(0,248,180,0.04) 0%, transparent 65%)" }} />

      <Container>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — Security grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {SECURITY_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  className="p-5 rounded-2xl border group transition-all duration-300 cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${item.accent}08`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${item.accent}30`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${item.accent}15`, border: `1px solid ${item.accent}30` }}
                  >
                    <item.icon size={18} strokeWidth={1.75} style={{ color: item.accent }} />
                  </div>
                  <p className="text-white font-semibold text-sm mb-1.5 leading-snug">{item.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge>
              <Shield size={11} /> Enterprise Security
            </Badge>
            <h2 className="text-[34px] lg:text-[44px] font-black text-white tracking-[-0.03em] mb-5 leading-[1.1] mt-4">
              Bank-Level Security,<br />Always Protected
            </h2>
            <p className="text-white/55 text-lg leading-[1.8] mb-9 font-light">
              Your financial data is protected by the same encryption standards used by global banks. We take security seriously — because your business depends on it.
            </p>

            <div className="space-y-4">
              {CHECKS.map((check, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -12 }}
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
                  <span className="text-white/80 text-sm font-medium">{check}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust badge */}
            <motion.div
              className="mt-10 flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: "rgba(0,248,180,0.06)", border: "1px solid rgba(0,248,180,0.15)" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-[13px] flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,248,180,0.12)" }}>
                <Shield size={22} className="text-[#00F8B4]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Trusted by 50,000+ businesses</p>
                <p className="text-white/45 text-xs mt-0.5">Zero data breaches since launch · 99.9% uptime</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
