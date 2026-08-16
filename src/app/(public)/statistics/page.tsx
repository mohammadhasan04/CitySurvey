"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Home,
  UserCheck,
  GraduationCap,
  Briefcase,
  Globe,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";
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
  Legend,
} from "recharts";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard, LoadingSkeleton } from "@/components/shared/page-components";
import type { CityStatistics } from "@/types";

const PIE_COLORS = [
  "oklch(0.555 0.195 250)",
  "oklch(0.625 0.19 165)",
  "oklch(0.72 0.17 55)",
  "oklch(0.625 0.22 310)",
  "oklch(0.66 0.2 25)",
];

export default function StatisticsPage() {
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
      <div className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton count={8} className="lg:grid-cols-4" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const genderData = [
    { name: "Male", value: stats.totalMale },
    { name: "Female", value: stats.totalFemale },
    { name: "Other", value: stats.totalOther },
  ].filter((d) => d.value > 0);

  const ageData = [
    { name: "Children (0-14)", value: stats.totalChildren },
    { name: "Adults (15-59)", value: stats.totalAdults },
    { name: "Seniors (60+)", value: stats.totalSeniors },
  ];

  const employmentData = [
    { name: "Working", value: stats.totalWorking },
    { name: "Students", value: stats.totalStudents },
    { name: "Unemployed", value: stats.totalUnemployed },
    {
      name: "Others",
      value:
        stats.totalPopulation -
        stats.totalWorking -
        stats.totalStudents -
        stats.totalUnemployed,
    },
  ].filter((d) => d.value > 0);

  const surveyData = [
    { name: "Completed", value: stats.totalSurveyCompleted },
    { name: "Pending", value: stats.totalSurveyPending },
  ];

  const statCards = [
    { title: "Total Population", value: stats.totalPopulation, icon: "Users", color: "primary" },
    { title: "Total Households", value: stats.totalHouseholds, icon: "Home", color: "blue" },
    { title: "Male Population", value: stats.totalMale, icon: "UserCheck", color: "teal" },
    { title: "Female Population", value: stats.totalFemale, icon: "UserCheck", color: "rose" },
    { title: "Children (0-14)", value: stats.totalChildren, icon: "Users", color: "amber" },
    { title: "Students", value: stats.totalStudents, icon: "GraduationCap", color: "green" },
    { title: "Working People", value: stats.totalWorking, icon: "Briefcase", color: "purple" },
    { title: "Living Abroad", value: stats.totalLivingAbroad, icon: "Globe", color: "cyan" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-hero text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">
            City Statistics
          </h1>
          <p className="mt-3 text-lg text-white/75 max-w-xl">
            Real-time demographic data and insights for our city.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <StatCard key={card.title} {...card} animationDelay={i} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Gender Distribution">
              <div className="h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                    >
                      {genderData.map((_, index) => (
                        <Cell
                          key={`gender-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Age Distribution">
              <div className="h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="oklch(0.555 0.195 250)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Employment Status">
              <div className="h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={employmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                    >
                      {employmentData.map((_, index) => (
                        <Cell
                          key={`emp-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Survey Progress">
              <div className="h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={surveyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="oklch(0.625 0.19 165)"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </div>
      </section>
    </div>
  );
}
