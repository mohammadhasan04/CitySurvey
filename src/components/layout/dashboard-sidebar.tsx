"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
  LayoutDashboard,
  Home,
  Users,
  FileEdit,
  Bell,
  UserCircle,
  Map,
  MapPin,
  Navigation,
  Building2 as BuildingIcon,
  ClipboardList,
  FileBarChart,
  BarChart3,
  UserCog,
  Search,
  Shield,
  Key,
  Lock,
  Database,
  ScrollText,
  Settings,
  Palette,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/i18n/config";
import {
  SUPER_ADMIN_NAV_SECTIONS,
  CITY_ADMIN_NAV_SECTIONS,
  RESIDENT_NAV_SECTIONS,
} from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Home,
  Users,
  FileEdit,
  Bell,
  UserCircle,
  Map,
  MapPin,
  Navigation,
  Building2: BuildingIcon,
  ClipboardList,
  FileBarChart,
  BarChart3,
  UserCog,
  Search,
  Shield,
  Key,
  Lock,
  Database,
  ScrollText,
  Settings,
  Palette,
  Mail,
};

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();
  const role = session?.user?.role;

  const sections =
    role === "SUPER_ADMIN"
      ? SUPER_ADMIN_NAV_SECTIONS
      : role === "CITY_ADMIN"
        ? CITY_ADMIN_NAV_SECTIONS
        : RESIDENT_NAV_SECTIONS;

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/resident" || href === "/super-admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-17" : "w-65"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-4 border-b border-sidebar-border shrink-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary shadow-md">
            <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="text-sm font-bold tracking-tight font-heading">
                City Survey
              </p>
              <p className="text-[10px] text-sidebar-foreground/60">
                {role === "SUPER_ADMIN"
                  ? t("Super Admin")
                  : role === "CITY_ADMIN"
                    ? t("City Admin")
                    : t("Resident")}
              </p>
            </div>
          )}
        </div>

        {/* Sectional Grouped Navigation */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-sidebar-border">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">
                  {t(section.title)}
                </p>
              )}
              <nav className="flex flex-col gap-0.5">
                {section.items.map((route) => {
                  const Icon = iconMap[route.icon] || LayoutDashboard;
                  const active = isActive(route.href);
                  const translatedLabel = t(route.label);

                  if (collapsed) {
                    return (
                      <Tooltip key={route.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={route.href}
                            className={cn(
                              "flex h-9 w-9 mx-auto items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 active:scale-95",
                              active
                                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {translatedLabel}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200 hover:translate-x-0.5 active:scale-[0.98]",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20 font-semibold"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{translatedLabel}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Toggle */}
        <div className="border-t border-sidebar-border p-3 shrink-0 flex items-center justify-between">
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("auth.logout")}</span>
            </button>
          )}
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors ml-auto text-sidebar-foreground/70"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
