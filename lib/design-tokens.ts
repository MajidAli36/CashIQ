export const COLORS = {
  background: {
    primary: "#050816",
    secondary: "#0B1020",
    tertiary: "#111827",
  },
  accent: {
    cyan: "#00F5D4",
    blue: "#00C2FF",
    purple: "#7C4DFF",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#9CA3AF",
    muted: "#6B7280",
  },
  surface: {
    DEFAULT: "#1F2937",
    glass: "rgba(255, 255, 255, 0.04)",
    glassBorder: "rgba(255, 255, 255, 0.08)",
  },
  gradient: {
    primary: "linear-gradient(135deg, #00F5D4 0%, #00C2FF 100%)",
    secondary: "linear-gradient(135deg, #7C4DFF 0%, #00C2FF 100%)",
    hero: "linear-gradient(160deg, #050816 0%, #0B1020 60%, #111827 100%)",
  },
} as const;

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const GRADIENT_TEXT_STYLE = {
  background: "linear-gradient(135deg, #00F5D4 0%, #00C2FF 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

export const GLASS_STYLE = {
  background: "rgba(255, 255, 255, 0.04)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
} as const;

export const GLOW_EFFECTS = {
  cyan: "0 0 40px rgba(0, 245, 212, 0.3)",
  blue: "0 0 40px rgba(0, 194, 255, 0.3)",
  purple: "0 0 40px rgba(124, 77, 255, 0.3)",
} as const;

export const FEATURES = [
  {
    icon: "TrendingUp",
    title: "Real-Time Cash Flow",
    description: "Every rupee tracked the moment it moves — cash, bank, JazzCash, EasyPaisa — auto-categorized in one unified ledger.",
    accent: "#00C2FF",
  },
  {
    icon: "Building2",
    title: "Multi-Business Hub",
    description: "Separate books for each business, one unified dashboard. Built for entrepreneurs running multiple shops simultaneously.",
    accent: "#7C4DFF",
  },
  {
    icon: "CreditCard",
    title: "PDC & Cheque Tracker",
    description: "Track every post-dated cheque with auto-alerts before due dates. No paper piles, no nasty surprises, ever.",
    accent: "#F59E0B",
  },
  {
    icon: "Users",
    title: "Customer Ledger",
    description: "Full transaction history per customer with live outstanding balances. Know exactly who owes you and since when.",
    accent: "#00F5D4",
  },
  {
    icon: "BarChart3",
    title: "Instant P&L Reports",
    description: "Profit & loss, expense breakdowns, category insights — generated in seconds. No accountant. No month-end panic.",
    accent: "#EC4899",
  },
  {
    icon: "Shield",
    title: "Bank-Level Security",
    description: "256-bit encryption, SOC 2 compliance, and local data residency. Your data stays private — always, no exceptions.",
    accent: "#00C2FF",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Ahmed Raza",
    role: "Owner · Tech Solutions PK",
    content: "The cheque tracking alone saved me 4 hours every week. I know which payments are coming before they even arrive. This app paid for itself in week one.",
    rating: 5,
    avatar: "AR",
    color: "#00F5D4",
  },
  {
    name: "Fatima Khan",
    role: "Founder · Fashion Hub (3 branches)",
    content: "Managing 3 stores felt impossible before CashIQ. Now I see all three branches in real time from my phone. Sales, balances, expenses — all in one place.",
    rating: 5,
    avatar: "FK",
    color: "#00C2FF",
  },
  {
    name: "Usman Chaudhry",
    role: "CEO · Wholesale Mart",
    content: "We have 1,000+ customers. CashIQ tracks every single one — balances, history, overdue amounts. It's like having a full-time accountant at zero cost.",
    rating: 5,
    avatar: "UC",
    color: "#7C4DFF",
  },
] as const;

export const INTEGRATIONS = [
  { name: "JazzCash", icon: "Wallet" },
  { name: "EasyPaisa", icon: "Smartphone" },
  { name: "Bank of Punjab", icon: "Building2" },
  { name: "UBL", icon: "landmark" },
  { name: "MCB", icon: "Building" },
  { name: "HBL", icon: "landmark" },
] as const;

export const STATS = [
  { value: 50000, suffix: "+", label: "Businesses Active", prefix: "" },
  { value: 2, suffix: "M+", label: "Transactions Tracked", prefix: "" },
  { value: 10, prefix: "₨", suffix: "B+", label: "Revenue Managed" },
  { value: 4.9, suffix: " ★", label: "App Store Rating", prefix: "" },
] as const;

export const SECURITY_ITEMS = [
  {
    icon: "Shield",
    title: "256-bit SSL Encryption",
    description: "All data in transit and at rest is military-grade encrypted. Same standard as global banks.",
  },
  {
    icon: "Lock",
    title: "Privacy by Design",
    description: "We never sell, share, or analyze your business data. It belongs to you — period.",
  },
  {
    icon: "Globe",
    title: "Local Data Residency",
    description: "Your data stays in Pakistan. No overseas servers. No foreign exposure. Full compliance.",
  },
  {
    icon: "Award",
    title: "SOC 2 Certified",
    description: "Independently audited for security, availability, and confidentiality every year.",
  },
] as const;