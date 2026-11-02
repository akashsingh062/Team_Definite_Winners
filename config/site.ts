export const siteConfig = {
  name: "CareerBridge AI",
  shortName: "CareerBridge",
  description:
    "AI-powered campus-to-employment opportunity matcher prioritizing explainable recommendations, accessibility, and fairness for students.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/careerbridge-ai",
  },
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Opportunities", href: "/opportunities" },
    { title: "Dashboard", href: "/dashboard" },
    { title: "My Profile", href: "/profile" },
    { title: "Fairness & Ethics", href: "/#fairness" },
  ],
  studentNav: [
    { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "Smart Matches", href: "/dashboard/recommendations", icon: "Sparkles" },
    { title: "My Applications", href: "/dashboard/applications", icon: "ClipboardList" },
    { title: "Skill Gap Analyzer", href: "/dashboard/skill-gap", icon: "Target" },
    { title: "AI Learning Roadmap", href: "/dashboard/roadmap", icon: "Compass" },
    { title: "Browse Opportunities", href: "/opportunities", icon: "Briefcase" },
    { title: "AI Resume Analyzer", href: "/dashboard/resume", icon: "FileText" },
    { title: "Profile Management", href: "/profile", icon: "User" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
