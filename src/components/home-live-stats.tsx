"use client";

import { useEffect, useState } from "react";
import { Users, Building2, Map, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/config";

interface CityStats {
  totalPopulation: number;
  totalHouseholds: number;
  totalSurveyCompleted: number;
  totalSurveyPending: number;
}

export function HomeLiveStats() {
  const { t } = useI18n();
  const [stats, setStats] = useState<CityStats>({
    totalPopulation: 0,
    totalHouseholds: 0,
    totalSurveyCompleted: 0,
    totalSurveyPending: 0,
  });
  const [wardCount, setWardCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = () => {
      Promise.all([
        fetch("/api/statistics").then((res) => res.json()),
        fetch("/api/statistics/ward").then((res) => res.json()),
      ])
        .then(([statsRes, wardRes]) => {
          if (isMounted) {
            if (statsRes.success) setStats(statsRes.data);
            if (wardRes.success && Array.isArray(wardRes.data)) {
              setWardCount(wardRes.data.length);
            }
          }
        })
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalSurveys = stats.totalSurveyCompleted + stats.totalSurveyPending;
  const completionRate =
    totalSurveys > 0
      ? ((stats.totalSurveyCompleted / totalSurveys) * 100).toFixed(1)
      : "100";

  const statItems = [
    {
      value: stats.totalPopulation > 0 ? `${stats.totalPopulation.toLocaleString()}+` : "0",
      label: t("Citizens Surveyed"),
      icon: Users,
      color: "from-blue-600 to-cyan-500",
    },
    {
      value: stats.totalHouseholds > 0 ? `${stats.totalHouseholds.toLocaleString()}+` : "0",
      label: t("Registered Households"),
      icon: Building2,
      color: "from-emerald-600 to-teal-500",
    },
    {
      value: wardCount > 0 ? `${wardCount}` : "5",
      label: t("Municipal Wards Covered"),
      icon: Map,
      color: "from-violet-600 to-purple-500",
    },
    {
      value: `${completionRate}%`,
      label: t("Survey Completion Rate"),
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <Card
          key={stat.label}
          className="glass border border-border/50 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center text-white shadow-md shrink-0`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight font-heading">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
