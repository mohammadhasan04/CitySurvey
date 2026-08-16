"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader, SectionCard, LoadingSkeleton } from "@/components/shared/page-components";
import { useI18n } from "@/i18n/config";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CityStatistics } from "@/types";

const PIE_COLORS = [
  "oklch(0.555 0.195 250)",
  "oklch(0.625 0.19 165)",
  "oklch(0.72 0.17 55)",
  "oklch(0.625 0.22 310)",
];

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState<CityStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = () => {
      fetch("/api/statistics")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && isMounted) setStats(data.data);
        })
        .catch(console.error)
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title={t("Admin Dashboard")} description={t("Overview of the city survey system")} />
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { title: t("TOTAL POPULATION"), value: stats.totalPopulation, icon: "Users", color: "primary" as const },
    { title: t("HOUSEHOLDS"), value: stats.totalHouseholds, icon: "Home", color: "blue" as const },
    { title: t("MALE"), value: stats.totalMale, icon: "UserCheck", color: "teal" as const },
    { title: t("FEMALE"), value: stats.totalFemale, icon: "UserCheck", color: "rose" as const },
    { title: t("STUDENTS"), value: stats.totalStudents, icon: "GraduationCap", color: "green" as const },
    { title: t("WORKING"), value: stats.totalWorking, icon: "Briefcase", color: "purple" as const },
    { title: t("LIVING ABROAD"), value: stats.totalLivingAbroad, icon: "Globe", color: "cyan" as const },
    { title: t("SURVEYS DONE"), value: stats.totalSurveyCompleted, icon: "ClipboardCheck", color: "amber" as const },
  ];

  const genderData = [
    { name: t("MALE"), value: stats.totalMale },
    { name: t("FEMALE"), value: stats.totalFemale },
    { name: "Other", value: stats.totalOther },
  ].filter((d) => d.value > 0);

  const ageData = [
    { name: "Children", value: stats.totalChildren },
    { name: "Adults", value: stats.totalAdults },
    { name: "Seniors", value: stats.totalSeniors },
  ];

  return (
    <div>
      <PageHeader
        title={t("Admin Dashboard")}
        description={t("Overview of the city survey system")}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <StatCard key={card.title} {...card} animationDelay={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Gender Distribution">
          <div className="h-70">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {genderData.map((_, i) => (
                    <Cell key={`g-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Age Distribution">
          <div className="h-70">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.555 0.195 250)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
