"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/config";
import Link from "next/link";
import {
  Shield,
  Settings,
  Database,
  ScrollText,
  Lock,
  Palette,
} from "lucide-react";
import type { CityStatistics } from "@/types";

export default function SuperAdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState<CityStatistics | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = () => {
      fetch("/api/statistics")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && isMounted) setStats(data.data);
        })
        .catch(console.error);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const quickActions = [
    { href: "/super-admin/city-admins", label: t("Manage City Admins"), icon: Shield, color: "bg-purple-500/8 text-purple-600 dark:text-purple-400" },
    { href: "/super-admin/audit-logs", label: t("View Audit Logs"), icon: ScrollText, color: "bg-amber-500/8 text-amber-600 dark:text-amber-400" },
    { href: "/super-admin/security", label: t("Security Settings"), icon: Lock, color: "bg-red-500/8 text-red-600 dark:text-red-400" },
    { href: "/super-admin/backup", label: t("Backup & Restore"), icon: Database, color: "bg-blue-500/8 text-blue-600 dark:text-blue-400" },
    { href: "/super-admin/settings", label: t("System Settings"), icon: Settings, color: "bg-teal-500/8 text-teal-600 dark:text-teal-400" },
    { href: "/super-admin/branding", label: t("Branding"), icon: Palette, color: "bg-rose-500/8 text-rose-600 dark:text-rose-400" },
  ];

  return (
    <div>
      <PageHeader
        title={t("Super Admin Dashboard")}
        description={t("System-wide overview and management")}
      />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title={t("TOTAL POPULATION")} value={stats.totalPopulation} icon="Users" color="primary" animationDelay={0} />
          <StatCard title={t("HOUSEHOLDS")} value={stats.totalHouseholds} icon="Home" color="blue" animationDelay={1} />
          <StatCard title={t("SURVEYS DONE")} value={stats.totalSurveyCompleted} icon="ClipboardCheck" color="green" animationDelay={2} />
          <StatCard title={t("Surveys Pending")} value={stats.totalSurveyPending} icon="BarChart3" color="amber" animationDelay={3} />
        </div>
      )}

      <SectionCard title={t("Quick Actions")} description={t("System administration tools")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link key={action.href} href={action.href}>
              <Card
                className="hover:border-primary/25 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color.split(" ")[0]}`}>
                    <action.icon className={`h-5 w-5 ${action.color.split(" ").slice(1).join(" ")}`} />
                  </div>
                  <h3 className="font-semibold text-sm">{action.label}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
