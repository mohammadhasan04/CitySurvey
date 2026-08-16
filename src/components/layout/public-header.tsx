"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Menu,
  X,
  BarChart3,
  Users,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { PUBLIC_ROUTES } from "@/lib/constants";

export function PublicHeader() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navIcons: Record<string, React.ReactNode> = {
    "/": null,
    "/statistics": <BarChart3 className="h-4 w-4" />,
    "/ward-statistics": <Users className="h-4 w-4" />,
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold tracking-tight font-heading">
                City Survey
              </p>
              <p className="text-[10px] text-muted-foreground -mt-0.5">
                Population & Household
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {PUBLIC_ROUTES.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  "hover:bg-primary/8 hover:text-primary",
                  pathname === route.href
                    ? "text-primary bg-primary/8 font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <span className="flex items-center gap-1.5">
                  {navIcons[route.href]}
                  {t(route.label)}
                </span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <Button variant="ghost" size="sm" asChild className="gap-1.5">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  {t("auth.login")}
                </Link>
              </Button>
              <Button size="sm" asChild className="gap-1.5 gradient-primary border-0 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all">
                <Link href="/register">
                  <UserPlus className="h-4 w-4" />
                  {t("auth.register")}
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border/40 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {PUBLIC_ROUTES.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === route.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t(route.label)}
                </Link>
              ))}
              <div className="flex gap-2 pt-3 border-t border-border/40">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    {t("auth.login")}
                  </Link>
                </Button>
                <Button size="sm" className="flex-1 gradient-primary border-0 text-white" asChild>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    {t("auth.register")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
