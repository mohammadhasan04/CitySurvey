"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, SectionCard, LoadingSkeleton } from "@/components/shared/page-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  MapPin,
  Phone,
  User,
  Calendar,
  Briefcase,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  FileSpreadsheet,
  Globe,
  ClipboardCheck,
} from "lucide-react";
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
  address: string;
  phone: string | null;
  email: string | null;
  totalMembers: number;
  totalLivingHere: number;
  totalLivingAbroad: number;
  surveyStatus: string;
  createdAt: string;
  ward: { name: string; wardNumber: number };
  area: { name: string } | null;
  street: { name: string } | null;
  building: { name: string } | null;
  familyMembers: FamilyMember[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  VERIFIED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function HouseholdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
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
          toast.error(data.error || "Household not found");
        }
      })
      .catch((err) => {
        console.error("Failed to load household details", err);
        toast.error("Failed to load household details");
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/households/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      toast.success(`Survey status updated to ${newStatus}`);
      setHousehold((prev) => (prev ? { ...prev, surveyStatus: newStatus } : null));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={t("Household Details")} description={t("common.loading")} />
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  if (!household) {
    return (
      <div className="text-center py-12">
        <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-xl font-bold font-heading mb-2">Household Not Found</h2>
        <p className="text-sm text-muted-foreground mb-4">The requested household record could not be found.</p>
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
        title={`Household: ${household.surveyId}`}
        description={`Head of Household: ${household.headOfFamily}`}
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/households">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to List
            </Link>
          </Button>

          {household.surveyStatus !== "VERIFIED" && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => updateStatus("VERIFIED")}
            >
              <CheckCircle className="h-4 w-4" /> Mark Verified
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Household Overview */}
        <Card className="animate-fade-in border-primary/20 shadow-md">
          <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" /> Location & Ward
            </CardTitle>
            <Badge className={statusColors[household.surveyStatus] || ""}>
              {household.surveyStatus.replace("_", " ")}
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Municipal Ward</p>
              <p className="font-semibold">
                W{household.ward.wardNumber} - {household.ward.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">House / Flat #</p>
              <p className="font-semibold">{household.houseNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Full Physical Address</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">{household.address}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Area / Locality</p>
              <p className="font-medium">{household.area?.name || "Bhatkal"}</p>
            </div>
            {household.street && (
              <div>
                <p className="text-xs text-muted-foreground">Street / Road</p>
                <p className="font-medium">{household.street.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Head of Household & Contact */}
        <Card className="animate-fade-in border-primary/20 shadow-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Head of Household
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-semibold text-base text-primary">{household.headOfFamily}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contact Phone</p>
              <p className="font-medium">{household.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="font-medium">{household.email || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Survey Registered On</p>
              <p className="font-medium">{new Date(household.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Member Demographics */}
        <Card className="animate-fade-in border-primary/20 shadow-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Population Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-xs text-muted-foreground">Total Family Members</span>
              <Badge variant="secondary" className="font-mono text-sm">{household.totalMembers}</Badge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-xs text-muted-foreground">Living in Household</span>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-sm">
                {household.totalLivingHere}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-muted-foreground">Living Abroad</span>
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-mono text-sm">
                {household.totalLivingAbroad}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Family Members Detail Table */}
      <SectionCard title={`Registered Family Members (${household.familyMembers.length})`}>
        {household.familyMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No family members registered for this household.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/40">
                <tr>
                  <th className="px-4 py-3">Member Name</th>
                  <th className="px-4 py-3">Relationship</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Date of Birth</th>
                  <th className="px-4 py-3">Education</th>
                  <th className="px-4 py-3">Employment</th>
                  <th className="px-4 py-3">Living Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {household.familyMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold">{member.fullName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize text-xs">
                        {member.relationship}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 capitalize">{member.gender.toLowerCase()}</td>
                    <td className="px-4 py-3">{new Date(member.dateOfBirth).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">{member.educationStatus || "N/A"}</td>
                    <td className="px-4 py-3">{member.employmentStatus?.replace("_", " ") || "N/A"}</td>
                    <td className="px-4 py-3">
                      {member.livingAbroad ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                          Abroad ({member.country || "Overseas"})
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                          Resident
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
