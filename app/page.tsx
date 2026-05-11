"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  Navbar,
  Hero,
  Stats,
  Features,
  Benefits,
  Security,
  Testimonials,
  Integrations,
  CTA,
  Footer,
} from "@/components/landing";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen" style={{ background: "#020617" }}>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Benefits />
      <Security />
      <Testimonials />
      <Integrations />
      <CTA />
      <Footer />
    </main>
  );
}