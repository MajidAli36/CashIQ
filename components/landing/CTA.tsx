"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Star } from "lucide-react";
import { Container, Button } from "@/components/landing";

const GRADIENT = "linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)";

const G_TEXT: React.CSSProperties = {
  background: GRADIENT,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export function CTA() {
  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "#020617" }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(0,248,180,0.06) 0%, transparent 55%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(0,196,255,0.05) 0%, transparent 55%)" }} />
      <div className="absolute top-0 left-0 w-full h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,248,180,0.2), transparent)" }} />

      <Container>
        <motion.div
          className="relative rounded-[28px] px-8 py-16 lg:px-20 lg:py-20 text-center overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 0 80px rgba(0,248,180,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Inner glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(0,248,180,0.08) 0%, transparent 65%)" }} />

          <div className="relative z-10">
            {/* Label */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ background: "rgba(0,248,180,0.1)", border: "1px solid rgba(0,248,180,0.2)", color: "#00F8B4" }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Zap size={10} strokeWidth={2.5} />
              Ready to take control?
            </motion.div>

            <h2 className="text-[32px] lg:text-[52px] font-black text-white tracking-[-0.03em] mb-6 leading-[1.08]">
              Your Business Deserves<br />
              <span style={G_TEXT}>Real Financial Clarity</span>
            </h2>

            <p className="text-white/55 text-lg mb-10 max-w-xl mx-auto leading-[1.8] font-light">
              Join 50,000+ Pakistani businesses already using CashIQ to track their finances in real-time.
              No credit card required to start.
            </p>

            {/* CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/dashboard">
                <Button size="lg" glow className="gap-2">
                  Start Free — No Credit Card
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Button>
              </Link>
              <Link href="/phone">
                <button
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-semibold text-white/70 hover:text-white transition-all duration-200 hover:bg-white/[0.07]"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  Sign In
                </button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-[13px]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              {[
                [Shield, "Bank-level security"],
                [Zap, "Setup in 60 seconds"],
                [Star, "4.9★ rated app"],
              ].map(([Icon, label], i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Icon size={13} style={{ color: "#00F8B4" }} />
                  <span className="text-white/60">{label as string}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
