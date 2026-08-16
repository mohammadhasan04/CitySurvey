"use client";

import Link from "next/link";
import { Building2, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/i18n/config";

export function PublicFooter() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/20">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold font-heading">
                  City Survey System
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Population & Household
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("app.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold font-heading">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/", label: t("nav.home") },
                { href: "/about", label: t("nav.about") },
                { href: "/statistics", label: t("nav.statistics") },
                { href: "/ward-statistics", label: t("nav.wardStatistics") },
                { href: "/survey-progress", label: t("nav.surveyProgress") },
                { href: "/contact", label: t("nav.contact") },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold font-heading">
              Services
            </h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/login", label: t("auth.login") },
                { href: "/register", label: t("auth.register") },
                { href: "/contact", label: t("nav.contact") },
                { href: "/statistics", label: t("nav.statistics") },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {link.label}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold font-heading">
              {t("nav.contact")}
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                <span>City Municipal Corporation, Main Office, Smart City</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                <span>+91 1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary/70" />
                <span>support@citysurvey.local</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {currentYear} City Survey System. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
