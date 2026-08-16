"use client";

import { useEffect, useState } from "react";
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
import { PageHeader, SectionCard, LoadingSkeleton } from "@/components/shared/page-components";
import { StatCard } from "@/components/shared/stat-card";
import type { CityStatistics, WardStatistics } from "@/types";

const PIE_COLORS = [
  "oklch(0.555 0.195 250)",
  "oklch(0.625 0.19 165)",
  "oklch(0.72 0.17 55)",
  "oklch(0.625 0.22 310)",
  "oklch(0.66 0.2 25)",
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<CityStatistics | null>(null);
  const [wards, setWards] = useState<WardStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/statistics").then((r) => r.json()),
      fetch("/api/statistics/ward").then((r) => r.json()),
    ])
      .then(([statsData, wardData]) => {
        if (statsData.success) setStats(statsData.data);
        if (wardData.success) setWards(wardData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics" description="Detailed data analysis" />
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  if (!stats) return null;

  const educationData = [
    { name: "Primary", value: 15 },
    { name: "Secondary", value: 25 },
    { name: "Higher Sec", value: 20 },
    { name: "Graduate", value: 22 },
    { name: "Post Grad", value: 12 },
    { name: "Other", value: 6 },
  ];

  const wardComparisonData = wards.map((w) => ({
    name: `W${w.wardNumber}`,
    population: w.totalPopulation,
    households: w.totalHouseholds,
    students: w.totalStudents,
    working: w.totalWorking,
  }));

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

  return (
    <div>
      <PageHeader title="Analytics" description="Comprehensive data analysis and visualizations" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Population" value={stats.totalPopulation} icon="Users" color="primary" animationDelay={0} />
        <StatCard title="Avg. Family Size" value={stats.totalHouseholds > 0 ? (stats.totalPopulation / stats.totalHouseholds).toFixed(1) : "0"} icon="Home" color="blue" animationDelay={1} />
        <StatCard title="Male:Female Ratio" value={stats.totalFemale > 0 ? (stats.totalMale / stats.totalFemale).toFixed(2) : "N/A"} icon="Users" color="teal" animationDelay={2} />
        <StatCard title="Employment Rate" value={stats.totalPopulation > 0 ? `${Math.round((stats.totalWorking / stats.totalPopulation) * 100)}%` : "0%"} icon="Briefcase" color="green" animationDelay={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Gender Distribution">
          <div className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {genderData.map((_, i) => (<Cell key={`g-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
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
                <Bar dataKey="value" fill="oklch(0.555 0.195 250)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Ward Comparison — Population & Households">
          <div className="h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardComparisonData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="population" name="Population" fill="oklch(0.555 0.195 250)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="households" name="Households" fill="oklch(0.625 0.19 165)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Education Levels (Sample)">
          <div className="h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={educationData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {educationData.map((_, i) => (<Cell key={`e-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
