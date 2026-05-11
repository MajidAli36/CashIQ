"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Brain, Globe2, BarChart3, FileText, Users,
  TrendingUp, Zap, Shield, Star, Play, DollarSign,
} from "lucide-react";
import { Button } from "@/components/landing";

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADIENT = "linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)";
const G: React.CSSProperties = {
  background: GRADIENT,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

// Fixed particle positions — no Math.random() to avoid hydration mismatch
const PARTICLES = [
  { x: 8, y: 20, s: 2, c: "#00F8B4", delay: 0, dur: 5 },
  { x: 85, y: 10, s: 1.5, c: "#00C4FF", delay: 1.2, dur: 4 },
  { x: 72, y: 68, s: 2.5, c: "#A78BFA", delay: 0.8, dur: 6 },
  { x: 15, y: 85, s: 1.5, c: "#00F8B4", delay: 2, dur: 5 },
  { x: 45, y: 8, s: 2, c: "#00C4FF", delay: 0.5, dur: 4.5 },
  { x: 92, y: 45, s: 1, c: "#A78BFA", delay: 1.5, dur: 5.5 },
  { x: 30, y: 55, s: 1.5, c: "#00F8B4", delay: 2.5, dur: 4 },
  { x: 60, y: 90, s: 2, c: "#00C4FF", delay: 0.3, dur: 6 },
  { x: 10, y: 50, s: 1, c: "#A78BFA", delay: 1.8, dur: 5 },
  { x: 78, y: 35, s: 2, c: "#00F8B4", delay: 0.9, dur: 4.5 },
  { x: 52, y: 28, s: 1.5, c: "#00C4FF", delay: 2.2, dur: 5 },
  { x: 25, y: 72, s: 1, c: "#A78BFA", delay: 0.6, dur: 4 },
  { x: 95, y: 75, s: 1.5, c: "#00F8B4", delay: 3, dur: 5.5 },
  { x: 40, y: 48, s: 1, c: "#00C4FF", delay: 1.1, dur: 4.5 },
];

// ─── Background ───────────────────────────────────────────────────────────────

function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial glows */}
      <div className="absolute -top-48 -left-48 w-[900px] h-[900px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,248,180,0.07) 0%, transparent 65%)" }} />
      <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,196,255,0.06) 0%, transparent 65%)" }} />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%)" }} />

      {/* Subtle grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }} />

      {/* Particle dots */}
      {PARTICLES.map((p, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: p.c, opacity: 0.4 }}
          animate={{ y: [0, -18, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48"
        style={{ background: "linear-gradient(to top, #020617, transparent)" }} />
    </div>
  );
}

// ─── Widget: AI Copilot ───────────────────────────────────────────────────────

function WidgetAI() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* User message */}
      <div className="flex justify-end">
        <div className="px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-xs font-medium text-white max-w-[85%]"
          style={{ background: "rgba(0,248,180,0.12)", border: "1px solid rgba(0,248,180,0.2)" }}>
          What's my current burn rate and runway?
        </div>
      </div>

      {/* AI response */}
      <div className="flex gap-2.5 items-start">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg, #7C3AED, #00C4FF)" }}>
          <Brain size={11} className="text-white" />
        </div>
        <div className="flex-1">
          {step === 0 ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl rounded-tl-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
              <span className="text-[11px] text-white/35">Analyzing financials...</span>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="px-3 py-2.5 rounded-2xl rounded-tl-sm text-xs text-white/80 leading-relaxed"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              Your burn rate is <span className="text-[#00F8B4] font-bold">$28,400 / month</span>.
              {step >= 2 && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  {" "}At this rate, your runway is <span className="text-[#00C4FF] font-bold">14.2 months</span>. Consider optimizing cloud & payroll spend.
                </motion.span>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div className="grid grid-cols-2 gap-2 mt-1"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            {[
              { label: "Burn Rate", value: "$28.4K/mo", color: "#F59E0B" },
              { label: "Runway", value: "14.2 months", color: "#00F8B4" },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-3 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] text-white/35 mb-0.5">{label}</p>
                <p className="text-xs font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Widget: Revenue Analytics ────────────────────────────────────────────────

function WidgetRevenue() {
  const bars = [38, 55, 48, 70, 63, 85, 100];

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[11px] text-white/40 mb-1 uppercase tracking-wider">Quarterly Revenue</p>
          <p className="text-3xl font-black text-white tracking-tight">$1.84M</p>
        </div>
        <div className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: "rgba(0,248,180,0.12)", color: "#00F8B4", border: "1px solid rgba(0,248,180,0.2)" }}>
          ▲ +23.4%
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-20 mb-2">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full">
            <motion.div
              className="w-full rounded-t-[4px]"
              style={{ background: i === 6 ? GRADIENT : "rgba(255,255,255,0.1)" }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/25 mb-4">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
        style={{ background: "rgba(0,248,180,0.06)", border: "1px solid rgba(0,248,180,0.12)" }}>
        <span className="text-[11px] text-white/50">AI Forecast — Next Quarter</span>
        <span className="text-[11px] font-bold text-[#00F8B4]">$2.1M projected ↗</span>
      </div>
    </div>
  );
}

// ─── Widget: Global Payments ──────────────────────────────────────────────────

function WidgetPayments() {
  const payments = [
    { flag1: "🇺🇸", flag2: "🇬🇧", label: "USD → GBP", amount: "$12,450", converted: "£9,823", done: true },
    { flag1: "🇪🇺", flag2: "🇦🇪", label: "EUR → AED", amount: "€8,234", converted: "د.إ32.1K", done: false },
    { flag1: "🇯🇵", flag2: "🇺🇸", label: "JPY → USD", amount: "¥1.2M", converted: "$8,100", done: true },
  ];

  return (
    <div>
      <div className="space-y-2.5 mb-4">
        {payments.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-lg">{p.flag1}</span>
            <div className="flex-1 flex items-center gap-1.5">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(0,248,180,0.4), rgba(0,196,255,0.4))" }} />
              <motion.div className="w-2 h-2 rounded-full bg-[#00F8B4]"
                animate={{ x: [-6, 6, -6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(0,196,255,0.4), rgba(0,248,180,0.4))" }} />
            </div>
            <span className="text-lg">{p.flag2}</span>
            <div className="text-right flex-shrink-0">
              <p className="text-[11px] font-bold text-white">{p.amount}</p>
              <p className="text-[10px] text-white/40">{p.converted}</p>
            </div>
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: p.done ? "#00F8B4" : "#F59E0B" }} />
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
        style={{ background: "rgba(0,196,255,0.06)", border: "1px solid rgba(0,196,255,0.12)" }}>
        <span className="text-[11px] text-white/50">48 transactions · 12 currencies</span>
        <span className="text-[11px] font-bold" style={G}>$94.8K processed</span>
      </div>
    </div>
  );
}

// ─── Widget: Invoice Automation ───────────────────────────────────────────────

function WidgetInvoice() {
  const invoices = [
    { id: "INV-2847", client: "Acme Corp", amount: "$4,500", status: "paid" },
    { id: "INV-2848", client: "TechFlow Inc", amount: "$12,200", status: "processing" },
    { id: "INV-2849", client: "Global Ltd", amount: "$8,750", status: "sent" },
    { id: "INV-2850", client: "Startup Co", amount: "$3,200", status: "draft" },
  ];

  const statusStyle: Record<string, { color: string; label: string }> = {
    paid: { color: "#00F8B4", label: "Paid" },
    processing: { color: "#F59E0B", label: "Processing" },
    sent: { color: "#00C4FF", label: "Sent" },
    draft: { color: "rgba(255,255,255,0.3)", label: "Draft" },
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {invoices.map((inv, i) => (
          <motion.div key={inv.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <FileText size={12} className="text-white/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white truncate">{inv.id} · {inv.client}</p>
              <p className="text-[10px] text-white/40">{inv.amount}</p>
            </div>
            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
              style={{
                background: `${statusStyle[inv.status].color}18`,
                color: statusStyle[inv.status].color,
                border: `1px solid ${statusStyle[inv.status].color}35`,
              }}>
              {statusStyle[inv.status].label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
        style={{ background: "rgba(0,248,180,0.06)", border: "1px solid rgba(0,248,180,0.12)" }}>
        <span className="text-[11px] text-white/50">AI auto-matched 12 invoices</span>
        <span className="text-[11px] font-bold text-[#00F8B4]">Saved 4.5h ✓</span>
      </div>
    </div>
  );
}

// ─── Widget: Cashflow Forecast ────────────────────────────────────────────────

function WidgetForecast() {
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Next 30 Days · AI Forecast</p>
          <p className="text-3xl font-black text-white tracking-tight">+$124,500</p>
          <p className="text-[11px] text-[#00F8B4] font-semibold mt-0.5">94% confidence interval</p>
        </div>
        <div className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold"
          style={{ background: "rgba(167,139,250,0.12)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.2)" }}>
          AI Predicted
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl overflow-hidden mb-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <svg viewBox="0 0 400 70" className="w-full" style={{ height: 80 }}>
          <defs>
            <linearGradient id="fgActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F8B4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00F8B4" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <path d="M0,60 C50,55 100,45 150,38 C200,31 250,24 300,18 L300,70 L0,70 Z"
            fill="url(#fgActual)" />
          {/* Actual line */}
          <motion.path d="M0,60 C50,55 100,45 150,38 C200,31 250,24 300,18"
            stroke="#00F8B4" strokeWidth="2" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
          {/* Forecast dashed */}
          <motion.path d="M300,18 C330,14 360,10 400,6"
            stroke="#A78BFA" strokeWidth="2" fill="none" strokeDasharray="5 3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }} />
          {/* Divider */}
          <line x1="300" y1="4" x2="300" y2="68" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Projected Inflow", val: "+$284K", color: "#00F8B4" },
          { label: "Projected Outflow", val: "-$159K", color: "#F87171" },
        ].map(({ label, val, color }) => (
          <div key={label} className="px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] text-white/35 mb-0.5">{label}</p>
            <p className="text-sm font-bold" style={{ color }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Widget: Team Activity ────────────────────────────────────────────────────

function WidgetTeam() {
  const activities = [
    { initials: "SC", name: "Sarah Chen", action: "approved $4,500 expense", time: "2m", color: "#00F8B4" },
    { initials: "AK", name: "Alex Kumar", action: "created 3 invoices · $28K", time: "8m", color: "#00C4FF" },
    { initials: "MT", name: "Mike Torres", action: "filed Q4 expense report", time: "15m", color: "#A78BFA" },
    { initials: "EW", name: "Emma Walsh", action: "ran payroll · 24 staff", time: "1h", color: "#F59E0B" },
  ];

  return (
    <div>
      <div className="space-y-3 mb-4">
        {activities.map((a, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
              style={{ background: a.color, color: "#020617" }}>
              {a.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white/90 leading-tight">{a.name}</p>
              <p className="text-[10px] text-white/45 truncate">{a.action}</p>
            </div>
            <span className="text-[10px] text-white/25 flex-shrink-0">{a.time} ago</span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: "rgba(0,196,255,0.06)", border: "1px solid rgba(0,196,255,0.12)" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-[#00F8B4] animate-pulse" />
        <span className="text-[11px] text-white/50">24 actions in the last hour</span>
      </div>
    </div>
  );
}

// ─── Widget Config ────────────────────────────────────────────────────────────

type WidgetEntry = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
  Component: React.ComponentType;
};

const WIDGETS: WidgetEntry[] = [
  { id: "ai", label: "AI Copilot", icon: Brain, accent: "#A78BFA", Component: WidgetAI },
  { id: "revenue", label: "Revenue", icon: BarChart3, accent: "#00F8B4", Component: WidgetRevenue },
  { id: "payments", label: "Payments", icon: Globe2, accent: "#00C4FF", Component: WidgetPayments },
  { id: "invoice", label: "Invoices", icon: FileText, accent: "#F59E0B", Component: WidgetInvoice },
  { id: "forecast", label: "Forecast", icon: TrendingUp, accent: "#A78BFA", Component: WidgetForecast },
  { id: "team", label: "Team", icon: Users, accent: "#00C4FF", Component: WidgetTeam },
];

// ─── AI Workspace (Right Panel) ───────────────────────────────────────────────

function AIWorkspace() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % WIDGETS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const active = WIDGETS[activeIdx];

  return (
    <div className="relative">
      {/* Main panel */}
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(8,14,36,0.92)",
          border: "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 48px 96px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <span className="text-[11px] text-white/25 font-mono">cashiq.ai — workspace</span>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-[#00F8B4]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[10px] text-[#00F8B4] font-semibold">AI Active</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-none border-b border-white/[0.05]">
          {WIDGETS.map((w, i) => (
            <button key={w.id} onClick={() => setActiveIdx(i)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex-shrink-0"
              style={i === activeIdx ? {
                background: `${w.accent}18`,
                color: w.accent,
                border: `1px solid ${w.accent}35`,
              } : {
                color: "rgba(255,255,255,0.3)",
                border: "1px solid transparent",
              }}>
              <w.icon size={11} />
              {w.label}
            </button>
          ))}
        </div>

        {/* Widget content */}
        <div className="p-5" style={{ minHeight: 300 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <active.Component />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Auto-advance progress bar */}
        <div className="px-5 pb-4">
          <div className="h-[2px] w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: active.accent }}
              key={`progress-${activeIdx}`}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Floating card — top right */}
      <motion.div
        className="absolute -top-5 -right-4 xl:-right-16 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 z-10"
        style={{
          background: "rgba(8,14,36,0.96)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
        }}
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(0,248,180,0.14)", border: "1px solid rgba(0,248,180,0.2)" }}>
          <DollarSign size={14} className="text-[#00F8B4]" />
        </div>
        <div>
          <p className="text-white font-black text-[13px] leading-tight">$8.4M</p>
          <p className="text-[#00F8B4] text-[10px] font-semibold">MRR ▲ 34%</p>
        </div>
      </motion.div>

      {/* Floating card — bottom left */}
      <motion.div
        className="absolute -bottom-5 -left-4 xl:-left-16 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 z-10"
        style={{
          background: "rgba(8,14,36,0.96)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
        }}
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
      >
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(167,139,250,0.14)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <Brain size={14} className="text-[#A78BFA]" />
        </div>
        <div>
          <p className="text-white text-[12px] font-bold leading-tight">AI Saved</p>
          <p className="text-[#A78BFA] text-[10px] font-semibold">42h this week</p>
        </div>
      </motion.div>

      {/* Floating chip — mid right */}
      <motion.div
        className="absolute top-1/2 -right-2 xl:-right-10 -translate-y-1/2 rounded-xl px-3 py-2 flex items-center gap-2 z-10"
        style={{
          background: "rgba(8,14,36,0.96)",
          border: "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
        animate={{ x: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1, ease: "easeInOut" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#00F8B4] animate-pulse" />
        <div>
          <p className="text-white text-[11px] font-bold leading-tight">24 Countries</p>
          <p className="text-white/35 text-[10px]">Live now</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Trust features ───────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: Shield, label: "SOC 2 Certified" },
  { icon: Zap, label: "60s Setup" },
  { icon: Globe2, label: "24 Countries" },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center py-16 lg:py-0 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #020617 0%, #071226 55%, #020817 100%)" }}
    >
      <Background />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center min-h-screen lg:min-h-0 py-12 lg:py-24">

          {/* ── Left ── */}
          <div>
            {/* AI badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[12px] font-semibold"
              style={{
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.28)",
                color: "#C4B5FD",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Brain size={12} />
              Powered by Advanced AI
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="font-black text-white leading-[1.05] tracking-[-0.035em] mb-7"
              style={{ fontSize: "clamp(40px,5.5vw,64px)" }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
            >
              Your Business.<br />
              One Intelligent<br />
              <span style={G}>Financial OS.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-white/55 leading-[1.78] mb-9 font-light max-w-[500px]"
              style={{ fontSize: "clamp(16px,1.2vw,19px)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
            >
              CashIQ combines finance, analytics, invoicing, payments, and AI automation into one modern operating system for growing businesses worldwide.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 mb-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
            >
              <Link href="/dashboard">
                <Button size="lg" glow className="gap-2.5 text-base">
                  Start for Free
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Button>
              </Link>
              <button
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-[15px] font-semibold text-white/65 hover:text-white transition-all duration-200 border border-white/[0.12] hover:border-white/25 hover:bg-white/[0.05]"
              >
                <Play size={13} className="fill-current" />
                Watch Demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.44 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex -space-x-2">
                  {[
                    { init: "SC", color: "#00F8B4" },
                    { init: "AK", color: "#00C4FF" },
                    { init: "MT", color: "#A78BFA" },
                    { init: "EW", color: "#F59E0B" },
                  ].map((a, i) => (
                    <div key={i}
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-black"
                      style={{ background: a.color, borderColor: "#020617", color: "#020617" }}>
                      {a.init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/40 text-[12px]">
                    <span className="text-white/75 font-semibold">10,000+</span> businesses worldwide
                  </p>
                </div>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-white/40 text-[13px]">
                    <Icon size={12} style={{ color: "#00F8B4" }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right ── */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25 }}
          >
            <AIWorkspace />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
