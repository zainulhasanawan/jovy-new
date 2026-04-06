import {
  Brain,
  FileText,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Search,
  TrendingUp,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  id: string;
};

export type PainPoint = {
  icon: LucideIcon;
  title: string;
  desc: string;
  iconColor: string;
  iconBg: string;
  cardBg: string;
  border: string;
};

export type FeatureCard = {
  icon: LucideIcon;
  title: string;
  desc: string;
  iconColor: string;
  iconBg: string;
  features: string[];
};

export type FaqItemData = {
  q: string;
  a: string;
};

export type CtaStep = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const navLinks: NavLink[] = [
  { label: "Features", id: "features" },
  { label: "Pricing", id: "pricing" },
];

export const heroHighlights = [
  "Free forever",
  "All vendors in one place",
  "AI-powered insights",
];

export const painPoints: PainPoint[] = [
  {
    icon: FileText,
    title: "Quote Chaos",
    desc: "Every vendor formats quotes differently. You end up with a spreadsheet mess and no real way to compare apples to apples.",
    iconColor: "text-[#D4847A]",
    iconBg: "bg-[#D4847A1A]",
    cardBg: "bg-[#D4847A14]",
    border: "border-[#D4847A33]",
  },
  {
    icon: Users,
    title: "Vendor Limbo",
    desc: "Who did you email? What did they say? Vendor conversations get lost across texts, inboxes, and sticky notes.",
    iconColor: "text-[#9B8FA8]",
    iconBg: "bg-[#9B8FA81A]",
    cardBg: "bg-[#9B8FA81A]",
    border: "border-[#9B8FA833]",
  },
  {
    icon: Search,
    title: "Hidden Costs",
    desc: "That venue quote looks great until linens, bar, and valet are not included. Jovy helps you see the real number early.",
    iconColor: "text-[#8BA888]",
    iconBg: "bg-[#8BA8881A]",
    cardBg: "bg-[#8BA8881A]",
    border: "border-[#8BA88833]",
  },
];

export const featureCards: FeatureCard[] = [
  {
    icon: Brain,
    title: "Quote Intelligence",
    desc: "Upload PDFs, emails, screenshots, or typed notes. Jovy extracts pricing, inclusions, extras, and missing items.",
    iconColor: "text-[#9B8FA8]",
    iconBg: "bg-[#9B8FA81F]",
    features: [
      "Automatic price extraction",
      "Service gap detection",
      "Multi-event coverage tracking",
    ],
  },
  {
    icon: MessageSquare,
    title: "Comms Center",
    desc: "Track each vendor from first inquiry to signed contract with notes and communication history in one place.",
    iconColor: "text-[#D4847A]",
    iconBg: "bg-[#D4847A1A]",
    features: [
      "Vendor contact status flow",
      "AI-drafted inquiry emails",
      "Form vs. email toggle",
    ],
  },
  {
    icon: LayoutGrid,
    title: "Options Builder",
    desc: "Build complete wedding packages and compare side-by-side so decisions are based on real totals.",
    iconColor: "text-[#8BA888]",
    iconBg: "bg-[#8BA8881F]",
    features: [
      "Side-by-side package views",
      "True cost totals",
      "Budget vs. actual tracking",
    ],
  },
  {
    icon: TrendingUp,
    title: "Coverage Analysis",
    desc: "See exactly which services are covered by event and where gaps remain before you commit.",
    iconColor: "text-[#C4918A]",
    iconBg: "bg-[#C4918A1A]",
    features: [
      "Per-event gap breakdown",
      "Coverage percentage scores",
      "13 vendor categories",
    ],
  },
  {
    icon: ListChecks,
    title: "Planning Checklist",
    desc: "Stay ahead of every milestone from deposits to final count with date-aware planning reminders.",
    iconColor: "text-[#9B8FA8]",
    iconBg: "bg-[#9B8FA814]",
    features: [
      "Date-aware task timeline",
      "Vendor milestone tracking",
      "Custom checklist items",
    ],
  },
  {
    icon: TrendingUp,
    title: "True Cost Analysis",
    desc: "Real totals include confirmed costs plus estimated coverage gaps so your budget is predictable.",
    iconColor: "text-[#8BA888]",
    iconBg: "bg-[#8BA88814]",
    features: [
      "Gap cost estimation",
      "Multi-currency support",
      "Per-guest cost breakdown",
    ],
  },
];

export const faqItems: FaqItemData[] = [
  {
    q: "What is Jovy?",
    a: "Jovy is an AI-powered wedding planning platform that helps couples compare vendor quotes, track outreach, analyze coverage gaps, and build complete options.",
  },
  {
    q: "How does Jovy compare wedding vendors?",
    a: "Jovy extracts pricing, inclusions, and services from uploaded quotes, then computes true total cost using confirmed and estimated values.",
  },
  {
    q: "Is Jovy free to use?",
    a: "Jovy offers a free trial and multiple paid plans including monthly and lifetime options.",
  },
  {
    q: "Can I track vendor communications?",
    a: "Yes. The Comms Center tracks contact status, history, notes, and helps draft outreach quickly.",
  },
];

export const foundingLifetimeFeatures = [
  "Lifetime access",
  "Unlimited quote uploads",
  "AI vendor comparison",
  "All future updates",
];

export const lifetimeFeatures = [
  "Lifetime access",
  "Unlimited quote uploads",
  "AI vendor comparison",
  "All future updates",
];

export const monthlyFeatures = [
  "All core features",
  "Unlimited quote uploads",
  "AI vendor comparison",
  "Cancel anytime",
];

export const ctaSteps: CtaStep[] = [
  {
    icon: Upload,
    title: "Upload a Quote",
    desc: "PDF, email, or manual entry",
  },
  {
    icon: MessageSquare,
    title: "Contact a Vendor",
    desc: "AI-draft your first inquiry",
  },
  {
    icon: ListChecks,
    title: "Start Your Checklist",
    desc: "Never miss a deadline",
  },
];

export const footerLinks = ["Privacy", "Terms", "Contact"];
