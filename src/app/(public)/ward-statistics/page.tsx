"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SectionCard, LoadingSkeleton } from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WardStatistics } from "@/types";

export default function WardStatisticsPage() {
  const [wards, setWards] = useState<WardStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchWards = () => {
      fetch("/api/statistics/ward")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && isMounted) setWards(data.data);
        })
        .catch(console.error)
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchWards();
    const interval = setInterval(fetchWards, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton count={5} className="lg:grid-cols-1" />
        </div>
      </div>
    );
  }

  const chartData = wards.map((w) => ({
    name: `Ward ${w.wardNumber}`,
    Population: w.totalPopulation,
    Households: w.totalHouseholds,
    Male: w.totalMale,
    Female: w.totalFemale,
  }));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-hero text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">
            Ward Statistics
          </h1>
          <p className="mt-3 text-lg text-white/75 max-w-xl">
            Demographic breakdown across all wards in the city.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Comparison Chart */}
          <SectionCard title="Population by Ward">
            <div className="h-100">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Population" fill="oklch(0.555 0.195 250)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Households" fill="oklch(0.625 0.19 165)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* Ward Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wards.map((ward, i) => (
              <Card
                key={ward.wardId}
                className="animate-fade-in hover:border-primary/25 transition-all"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold font-heading">
                      {ward.wardName}
                    </h3>
                    <Badge variant="secondary">
                      Ward {ward.wardNumber}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Population</p>
                      <p className="font-semibold text-lg">
                        {ward.totalPopulation.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Households</p>
                      <p className="font-semibold text-lg">
                        {ward.totalHouseholds.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Male</p>
                      <p className="font-medium">{ward.totalMale}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Female</p>
                      <p className="font-medium">{ward.totalFemale}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Students</p>
                      <p className="font-medium">{ward.totalStudents}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Working</p>
                      <p className="font-medium">{ward.totalWorking}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-accent"
                        style={{
                          width: `${
                            ward.totalHouseholds > 0
                              ? (ward.totalSurveyCompleted /
                                  (ward.totalSurveyCompleted +
                                    ward.totalSurveyPending)) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {ward.totalHouseholds > 0
                        ? Math.round(
                            (ward.totalSurveyCompleted /
                              (ward.totalSurveyCompleted +
                                ward.totalSurveyPending)) *
                              100
                          )
                        : 0}
                      % surveyed
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
