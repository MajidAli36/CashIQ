"use client";

import { motion } from "framer-motion";
import { Container, Badge } from "@/components/landing";
import { Building2, Smartphone, Wallet, Landmark, Building } from "lucide-react";

const INTEGRATIONS = [
  { name: "JazzCash", icon: Wallet, color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
  { name: "EasyPaisa", icon: Smartphone, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { name: "Bank of Punjab", icon: Building2, color: "#059669", bg: "rgba(5,150,105,0.1)" },
  { name: "UBL", icon: Landmark, color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  { name: "MCB", icon: Building, color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
  { name: "HBL", icon: Landmark, color: "#9333EA", bg: "rgba(147,51,234,0.1)" },
  { name: "Askari Bank", icon: Building2, color: "#0D9488", bg: "rgba(13,148,136,0.1)" },
  { name: "Standard Chartered", icon: Landmark, color: "#1D4ED8", bg: "rgba(29,78,216,0.1)" },
];

export function Integrations() {
  return (
    <section
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "#030B19" }}
    >
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,248,180,0.12), transparent)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(0,196,255,0.04) 0%, transparent 60%)" }} />

      <Container>
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Badge>Integrations</Badge>
          <h2 className="text-[34px] lg:text-[44px] font-black text-white tracking-[-0.03em] leading-[1.1] mb-5 mt-4">
            Works With Your{" "}
            <span style={{
              background: "linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Favorite Services</span>
          </h2>
          <p className="text-white/55 text-lg leading-[1.8] font-light">
            Connect your bank accounts, mobile wallets, and payment services for a unified financial dashboard.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INTEGRATIONS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div
                className="p-5 rounded-2xl border flex items-center justify-center gap-3 transition-all duration-300 cursor-default group"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = item.bg;
                  (e.currentTarget as HTMLElement).style.borderColor = `${item.color}35`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${item.color}15`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <item.icon size={20} style={{ color: item.color }} />
                <span className="text-white/80 font-medium text-sm">{item.name}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-white/30 text-sm mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          More integrations coming soon · We support all major Pakistani banks and wallets
        </motion.p>
      </Container>
    </section>
  );
}
