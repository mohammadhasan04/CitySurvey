"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/shared/stat-card";
import {
  PageHeader,
  SectionCard,
} from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, FileEdit, Users, Home } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/config";

interface HouseholdSummary {
  id: string;
  surveyId: string;
  houseNumber: string;
  address: string;
  totalMembers: number;
  surveyStatus: string;
  ward: { name: string };
}

export default function ResidentDashboard() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [household, setHousehold] = useState<HouseholdSummary | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHousehold = () => {
      if (session?.user?.householdId) {
        fetch(`/api/households/${session.user.householdId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && isMounted) setHousehold(data.data);
          })
          .catch(console.error);
      }
    };

    fetchHousehold();
    const interval = setInterval(fetchHousehold, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [session]);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    VERIFIED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  return (
    <div>
      <PageHeader
        title={`${t("Welcome")}, ${session?.user?.name || t("Resident")}`}
        description={t("Your household survey dashboard")}
      />

      {!household ? (
        <Card className="animate-fade-in">
          <CardContent className="p-8 text-center">
            <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold font-heading mb-2">
              {t("No Household Linked")}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("Your account is not yet linked to a household. Please contact a city administrator to get your household assigned.")}
            </p>
            <Button asChild>
              <Link href="/contact">{t("Contact Admin")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t("Family Members")}
              value={household.totalMembers}
              icon="Users"
              color="primary"
              animationDelay={0}
            />
            <StatCard
              title={t("Survey Status")}
              value={household.surveyStatus.replace("_", " ")}
              icon="ClipboardCheck"
              color={household.surveyStatus === "COMPLETED" || household.surveyStatus === "VERIFIED" ? "green" : "amber"}
              animationDelay={1}
            />
            <StatCard
              title={t("Survey ID")}
              value={household.surveyId}
              icon="BarChart3"
              color="blue"
              animationDelay={2}
            />
            <StatCard
              title={t("Wards")}
              value={household.ward.name}
              icon="Home"
              color="teal"
              animationDelay={3}
            />
          </div>

          {/* Household Info */}
          <SectionCard
            title={t("Household Information")}
            actions={
              <Badge className={statusColors[household.surveyStatus] || ""}>
                {household.surveyStatus.replace("_", " ")}
              </Badge>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t("House Number")}</p>
                <p className="font-medium">{household.houseNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("Survey ID")}</p>
                <p className="font-medium font-mono">{household.surveyId}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">{t("Address")}</p>
                <p className="font-medium">{household.address}</p>
              </div>
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="animate-fade-in stagger-1 hover:border-primary/25 transition-all cursor-pointer">
              <Link href="/resident/family">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t("Family Members")}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t("View & manage members")}
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="animate-fade-in stagger-2 hover:border-primary/25 transition-all cursor-pointer">
              <Link href="/resident/corrections">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/8">
                    <FileEdit className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t("Corrections")}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Request data changes")}
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="animate-fade-in stagger-3 hover:border-primary/25 transition-all cursor-pointer">
              <Link href="/resident/notifications">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/8">
                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t("Notifications")}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t("View messages & alerts")}
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
