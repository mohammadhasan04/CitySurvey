"use client";

import { useEffect, useState, use } from "react";
import { PageHeader, SectionCard, LoadingSkeleton } from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, User, Globe } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useI18n } from "@/i18n/config";

interface FamilyMember {
  id: string;
  fullName: string;
  relationship: string;
  gender: string;
  dateOfBirth: string;
  phone: string | null;
  educationStatus: string | null;
  employmentStatus: string | null;
  livingHere: boolean;
  livingAbroad: boolean;
  country: string | null;
}

interface HouseholdDetail {
  id: string;
  surveyId: string;
  houseNumber: string;
  headOfFamily: string;
  ward: { name: string; wardNumber: number };
  familyMembers: FamilyMember[];
}

export default function HouseholdMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { t } = useI18n();
  const [household, setHousehold] = useState<HouseholdDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/households/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHousehold(data.data);
        } else {
          toast.error(data.error || "Household members not found");
        }
      })
      .catch((err) => {
        console.error("Failed to load family members", err);
        toast.error("Failed to load family members");
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div>
        <PageHeader title={t("Family Members")} description={t("common.loading")} />
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!household) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-xl font-bold font-heading mb-2">Household Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/admin/households">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Households
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Family Members: ${household.headOfFamily}`}
        description={`Survey ID: ${household.surveyId} | Ward ${household.ward.wardNumber} - ${household.ward.name}`}
      >
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/households/${household.id}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Household Overview
          </Link>
        </Button>
      </PageHeader>

      <SectionCard title={`Registered Family Members (${household.familyMembers.length})`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {household.familyMembers.map((member) => (
            <Card key={member.id} className="animate-fade-in border-border/40 hover:border-primary/30 transition-all">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {member.fullName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">{member.fullName}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{member.relationship}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {member.gender.toLowerCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Date of Birth: </span>
                    <span className="font-medium">{new Date(member.dateOfBirth).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-medium">{member.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Education: </span>
                    <span className="font-medium">{member.educationStatus || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employment: </span>
                    <span className="font-medium">{member.employmentStatus?.replace("_", " ") || "N/A"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/30 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Living Status:</span>
                  {member.livingAbroad ? (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <Globe className="h-3 w-3 mr-1" /> Living Abroad ({member.country || "Overseas"})
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Resident in Household
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
