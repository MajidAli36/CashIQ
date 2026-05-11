"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Container, Badge } from "@/components/landing";

const TESTIMONIALS = [
  {
    name: "Ahmed Raza",
    role: "Owner · Tech Solutions PK",
    content: "The cheque tracking alone saved me 4 hours every week. I know which payments are coming before they even arrive. This app paid for itself in week one.",
    rating: 5,
    avatar: "AR",
    accent: "#00F8B4",
  },
  {
    name: "Fatima Khan",
    role: "Founder · Fashion Hub (3 branches)",
    content: "Managing 3 stores felt impossible before CashIQ. Now I see all three branches in real time from my phone. Sales, balances, expenses — all in one place.",
    rating: 5,
    avatar: "FK",
    accent: "#00C4FF",
  },
  {
    name: "Usman Chaudhry",
    role: "CEO · Wholesale Mart",
    content: "We have 1,000+ customers. CashIQ tracks every single one — balances, history, overdue amounts. It's like having a full-time accountant at zero cost.",
    rating: 5,
    avatar: "UC",
    accent: "#A78BFA",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 lg:py-32" style={{ background: "#F6F8FC" }}>
      {/* Top edge */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)" }} />

      <Container>
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Badge color="#A78BFA">Testimonials</Badge>
          <h2 className="text-[34px] lg:text-[46px] font-black text-[#0B1120] tracking-[-0.03em] leading-[1.1] mb-5 mt-4">
            Loved by Pakistani Businesses
          </h2>
          <p className="text-[#64748B] text-lg leading-[1.8] font-light">
            Join thousands of business owners who have transformed their financial management with CashIQ.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className="p-6 rounded-2xl border h-full flex flex-col transition-all duration-300 group"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${t.accent}18, 0 2px 8px rgba(0,0,0,0.07)`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${t.accent}30`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.07)";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                }}
              >
                {/* Quote icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${t.accent}12` }}
                >
                  <Quote size={14} style={{ color: t.accent }} />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-[#374151] text-sm leading-relaxed flex-1 mb-6">
                  "{t.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.accent} 0%, #00C4FF 100%)` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[#0F172A] font-semibold text-sm leading-tight">{t.name}</p>
                    <p className="text-[#64748B] text-xs mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof bar */}
        <motion.div
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {[
            { val: "50,000+", label: "Business owners" },
            { val: "4.9/5", label: "Average rating" },
            { val: "2M+", label: "Transactions tracked" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="text-[#0B1120] font-black text-2xl tracking-tight">{val}</p>
              <p className="text-[#94A3B8] text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
