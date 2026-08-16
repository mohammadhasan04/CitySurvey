"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/page-components";
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react";
import type { WardStatistics } from "@/types";

export default function SurveyProgressPage() {
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
          <LoadingSkeleton count={6} className="lg:grid-cols-1" />
        </div>
      </div>
    );
  }

  const totalCompleted = wards.reduce((s, w) => s + w.totalSurveyCompleted, 0);
  const totalPending = wards.reduce((s, w) => s + w.totalSurveyPending, 0);
  const totalSurveys = totalCompleted + totalPending;
  const overallProgress = totalSurveys > 0 ? Math.round((totalCompleted / totalSurveys) * 100) : 0;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-hero text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">
            Survey Progress
          </h1>
          <p className="mt-3 text-lg text-white/75 max-w-xl">
            Track the household survey completion status across all wards.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Overall Progress */}
          <Card className="animate-fade-in border-primary/15">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold font-heading">
                    Overall Progress
                  </h2>
                  <div className="mt-3 flex items-center gap-4">
                    <Progress value={overallProgress} className="h-3 flex-1" />
                    <span className="text-2xl font-bold text-primary">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {totalCompleted.toLocaleString("en-IN")} Completed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-500" />
                      {totalPending.toLocaleString("en-IN")} Pending
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ward Progress */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold font-heading">
              Ward-wise Progress
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {wards.map((ward, i) => {
                const total = ward.totalSurveyCompleted + ward.totalSurveyPending;
                const progress = total > 0 ? Math.round((ward.totalSurveyCompleted / total) * 100) : 0;

                return (
                  <Card
                    key={ward.wardId}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 sm:w-48 shrink-0">
                          <Badge
                            variant={progress >= 80 ? "default" : progress >= 50 ? "secondary" : "outline"}
                            className="font-mono"
                          >
                            W{ward.wardNumber}
                          </Badge>
                          <h3 className="font-semibold text-sm">
                            {ward.wardName}
                          </h3>
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <Progress value={progress} className="h-2.5 flex-1" />
                          <span className="text-sm font-semibold w-12 text-right">
                            {progress}%
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground shrink-0">
                          <span>{ward.totalSurveyCompleted} done</span>
                          <span>{ward.totalSurveyPending} pending</span>
                          <span>{ward.totalPopulation} people</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
