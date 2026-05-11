"use client";

import Link from "next/link";
import { Sparkles, Linkedin, Mail, Phone, MessageCircle, Camera, Globe, Share2 } from "lucide-react";
import { Container } from "@/components/landing";

const GRADIENT = "linear-gradient(135deg, #00F8B4 0%, #00C4FF 100%)";

const G_TEXT: React.CSSProperties = {
  background: GRADIENT,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "Security", "API"],
  Company: ["About", "Blog", "Careers", "Press"],
  Support: ["Help Center", "Contact", "Status", "Privacy"],
  Legal: ["Terms", "Privacy", "Cookies", "License"],
};

const SOCIALS = [
  { icon: Share2, href: "#", label: "X / Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Globe, href: "#", label: "Facebook" },
  { icon: Camera, href: "#", label: "Instagram" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
];

export function Footer() {
  return (
    <footer
      className="relative"
      style={{ background: "#010610" }}
    >
      {/* Top border */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      <Container>
        <div className="py-16 lg:py-20 grid lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: GRADIENT, boxShadow: "0 2px 12px rgba(0,196,255,0.2)" }}
              >
                <Sparkles size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-black text-[20px] tracking-tight text-white leading-none">
                Cash<span style={G_TEXT}>IQ</span>
              </span>
            </Link>

            <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs">
              Pakistan's leading business management app. Track your finances, customers, and growth — all in one place.
            </p>

            {/* Contact */}
            <div className="space-y-2.5 mb-6">
              <a href="mailto:support@cashiq.tech"
                className="flex items-center gap-2 text-white/40 hover:text-white/75 text-sm transition-colors">
                <Mail size={13} style={{ color: "#00F8B4" }} />
                support@cashiq.tech
              </a>
              <a href="tel:+92XXXXXXXXXX"
                className="flex items-center gap-2 text-white/40 hover:text-white/75 text-sm transition-colors">
                <Phone size={13} style={{ color: "#00C4FF" }} />
                +92-XXX-XXXXXXX
              </a>
            </div>

            {/* Socials */}
            <div className="flex gap-2">
              {SOCIALS.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="text-white font-semibold text-sm mb-4">{category}</p>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-white/40 hover:text-white/80 text-sm transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/35 text-sm">
            © 2025 CashIQ. All rights reserved.{" "}
            <span className="text-white/20">·</span>{" "}
            <span className="text-white/25">Powered by SyncOps</span>
          </p>
          <div className="flex items-center gap-5 text-white/30 text-xs">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(item => (
              <a key={item} href="#" className="hover:text-white/60 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
