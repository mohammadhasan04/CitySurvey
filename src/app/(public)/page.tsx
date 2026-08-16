"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  BarChart3,
  Globe,
  ClipboardCheck,
  CheckCircle2,
  ShieldCheck,
  FileSpreadsheet,
  Award,
  Sparkles,
  PhoneCall,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HomeLiveStats } from "@/components/home-live-stats";
import { useI18n } from "@/i18n/config";

export default function HomePage() {
  const { t } = useI18n();

  const features = [
    {
      icon: ClipboardCheck,
      title: t("Digital Survey Collection"),
      description: t("Modern paperless survey entry system for field officers with offline caching and instant cloud synchronization."),
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: BarChart3,
      title: t("Real-Time Ward Analytics"),
      description: t("Granular demographic analysis by ward, locality, street, and building for evidence-based resource allocation."),
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: ShieldCheck,
      title: t("Enterprise Data Security"),
      description: t("Role-based access control (RBAC), bcrypt password hashing, and real-time Supabase audit trail logging."),
      color: "text-purple-500",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Globe,
      title: t("Multilingual Citizen Access"),
      description: t("Accessible in English, ಕನ್ನಡ (Kannada), and हिन्दी (Hindi) for seamless resident engagement."),
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: Users,
      title: t("Resident Self-Service"),
      description: t("Citizens can review household profiles, request data corrections, and view official ward statistics online."),
      color: "text-teal-500",
      bg: "bg-teal-500/10 border-teal-500/20",
    },
    {
      icon: FileSpreadsheet,
      title: t("1-Click PDF & Excel Reports"),
      description: t("Export population breakdowns, age demographics, and employment indices for municipal reporting."),
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: t("Resident & Household Entry"),
      description: t("City survey officers or residents enter household members, age, education, and occupation details."),
    },
    {
      step: "02",
      title: t("Ward Officer Verification"),
      description: t("Designated City Admins review and verify survey entries for geographical precision."),
    },
    {
      step: "03",
      title: t("Instant Analytics & Policy"),
      description: t("Municipal leaders utilize real-time demographic reports for city planning and development."),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Top Notification Bar ──────────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold">
              {t("LIVE PORTAL 2026")}
            </Badge>
            <span>{t("Official City Household & Population Survey Digital Portal")}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <PhoneCall className="h-3 w-3 text-primary" /> {t("Toll-Free Helpline: 1800-11-2026")}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" /> {t("Hours: Mon–Sat 9:00 AM – 6:00 PM")}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="relative overflow-hidden gradient-hero py-20 sm:py-28 lg:py-36 text-white">
        {/* Glowing Orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs text-white/90 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span>{t("Next-Gen Smart Governance Platform")}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-heading leading-[1.1]">
                {t("City Population &")}{" "}
                <span className="bg-linear-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                  {t("Household Survey")}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl font-light">
                {t("A unified digital infrastructure empowering city administrators and citizens with real-time demographic analytics, household registration, ward mapping, and transparent governance.")}
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-black/20 h-12 px-7 text-sm font-semibold rounded-xl"
                >
                  <Link href="/register">
                    <UserPlusIcon className="mr-2 h-4 w-4 text-primary" />
                    {t("Register Household")}
                  </Link>
                </Button>

                <Button
                  size="lg"
                  asChild
                  className="bg-slate-900/90 hover:bg-slate-950 text-white border border-white/25 shadow-xl h-12 px-7 text-sm font-semibold rounded-xl backdrop-blur-md transition-all"
                >
                  <Link href="/statistics">
                    <BarChart3 className="mr-2 h-4 w-4 text-cyan-400" />
                    <span className="text-white font-semibold">{t("Explore City Data")}</span>
                  </Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{t("100% Encrypted")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{t("Ward Audit Logged")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{t("ISO Standards")}</span>
                </div>
              </div>
            </div>

            {/* Right Card Column */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/30 flex items-center justify-center border border-white/20">
                      <Building2 className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white">{t("City Operations Dashboard")}</h3>
                      <p className="text-xs text-white/60">{t("Live Municipal Metrics")}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{t("Active")}</Badge>
                </div>

                {/* Card Live Metrics */}
                <div className="grid grid-cols-2 gap-3 text-white">
                  <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
                    <p className="text-xs text-white/60">{t("Wards Monitored")}</p>
                    <p className="text-2xl font-bold font-heading text-cyan-300 mt-1">5 / 5</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
                    <p className="text-xs text-white/60">{t("Verification Rate")}</p>
                    <p className="text-2xl font-bold font-heading text-emerald-300 mt-1">100%</p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/60 p-4 border border-white/10 text-xs text-white/80 space-y-2">
                  <div className="flex justify-between">
                    <span>{t("Recent Survey Batch")}</span>
                    <span className="font-semibold text-cyan-300">+142 {t("Records")}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-linear-to-r from-cyan-400 to-emerald-400 w-full" />
                  </div>
                  <p className="text-[11px] text-white/50 pt-1">{t("Survey batch verified by Ward Admin Officer")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dynamic City Stats Cards ─────────────────── */}
      <section className="relative -mt-10 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeLiveStats />
        </div>
      </section>

      {/* ─── Portal Capabilities Grid ─────────────────── */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary border-primary/20 bg-primary/5">
              {t("Enterprise Features")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading">
              {t("Built for Municipal Scale & Accuracy")}
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              {t("A robust feature set engineered for city administration, field survey teams, and public transparency.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
              >
                <CardContent className="p-6 space-y-3">
                  <div className={`h-11 w-11 rounded-xl border ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-base font-semibold font-heading">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works (3 Steps) ───────────────────── */}
      <section className="py-20 bg-slate-950 text-white border-t border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <Badge variant="outline" className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
              {t("Workflow Guide")}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              {t("How the City Survey System Works")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-linear-to-r from-primary to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold font-heading">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Call to Action ───────────────────────────── */}
      <section className="py-20 gradient-hero text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Award className="h-12 w-12 mx-auto mb-4 text-cyan-300" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading">
            {t("Empower Your City Governance Today")}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl mx-auto font-light">
            {t("Access live population statistics or sign in with your municipal admin credentials.")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-slate-950 hover:bg-slate-100 h-11 px-7 text-sm font-semibold rounded-xl shadow-lg"
            >
              <Link href="/login">{t("Access Portal Sign In")}</Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-slate-900/90 hover:bg-slate-950 text-white border border-white/25 shadow-xl h-11 px-7 text-sm font-semibold rounded-xl backdrop-blur-md transition-all"
            >
              <Link href="/contact">{t("Contact Support")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function UserPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}
