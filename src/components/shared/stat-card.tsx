"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/config";
import {
  type LucideIcon,
  TrendingUp,
  TrendingDown,
  Users,
  Home,
  UserCheck,
  GraduationCap,
  Briefcase,
  Globe,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Users,
  Home,
  UserCheck,
  GraduationCap,
  Briefcase,
  Globe,
  BarChart3,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
};

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  className?: string;
  animationDelay?: number;
}

export function StatCard({
  title,
  value,
  description,
  icon = "BarChart3",
  trend,
  color = "primary",
  className,
  animationDelay = 0,
}: StatCardProps) {
  const { t } = useI18n();
  const Icon = iconMap[icon] || BarChart3;

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    primary: {
      bg: "bg-primary/8",
      text: "text-primary",
      border: "border-primary/15",
    },
    blue: {
      bg: "bg-blue-500/8",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/15",
    },
    green: {
      bg: "bg-emerald-500/8",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/15",
    },
    amber: {
      bg: "bg-amber-500/8",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/15",
    },
    purple: {
      bg: "bg-purple-500/8",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-500/15",
    },
    rose: {
      bg: "bg-rose-500/8",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/15",
    },
    teal: {
      bg: "bg-teal-500/8",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-500/15",
    },
    cyan: {
      bg: "bg-cyan-500/8",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/15",
    },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <Card
      className={cn(
        "stat-card border animate-fade-in overflow-hidden",
        colors.border,
        className
      )}
      style={{ animationDelay: `${animationDelay * 0.08}s` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t(title)}
            </p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
              {typeof value === "number" ? value.toLocaleString("en-IN") : value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{t(description)}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              colors.bg
            )}
          >
            <Icon className={cn("h-5 w-5", colors.text)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
