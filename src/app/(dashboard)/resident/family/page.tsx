"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PageHeader, LoadingSkeleton } from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Calendar, Phone, Briefcase, GraduationCap, MapPin, Plus, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/config";
import { calculateAge } from "@/lib/utils";
import { RELATIONSHIPS, GENDERS, EDUCATION_LEVELS, EMPLOYMENT_STATUSES } from "@/lib/constants";

interface FamilyMember {
  id: string;
  fullName: string;
  relationship: string;
  gender: string;
  dateOfBirth: string;
  phone: string | null;
  educationStatus?: string | null;
  educationLevel?: string | null;
  employmentStatus: string | null;
  livingAbroad?: boolean;
  isLivingAbroad?: boolean;
}

export default function ResidentFamilyPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [isLivingAbroad, setIsLivingAbroad] = useState(false);

  // 2-Step Verification Delete State
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMembers = () => {
    setLoading(true);
    fetch("/api/residents")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMembers(data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !relationship || !gender || !dateOfBirth) {
      toast.error("Full name, relationship, gender, and date of birth are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          relationship,
          gender,
          dateOfBirth,
          phone: phone || null,
          educationLevel: educationLevel || null,
          employmentStatus: employmentStatus || null,
          isLivingAbroad,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add family member");

      toast.success(`Family member "${fullName}" added successfully!`);
      setIsSheetOpen(false);
      setFullName("");
      setRelationship("");
      setGender("");
      setDateOfBirth("");
      setPhone("");
      setEducationLevel("");
      setEmploymentStatus("");
      setIsLivingAbroad(false);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to add family member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember || deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm 2-step verification.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/residents?id=${deletingMember.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete member");

      toast.success(`Family member "${deletingMember.fullName}" removed successfully`);
      setDeletingMember(null);
      setDeleteConfirmText("");
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete member");
    } finally {
      setIsDeleting(false);
    }
  };

  const computedAge = dateOfBirth ? calculateAge(dateOfBirth) : null;

  if (loading) {
    return (
      <div>
        <PageHeader title={t("Family Members")} description={t("View and manage your household members")} />
        <LoadingSkeleton count={4} className="lg:grid-cols-2" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("Family Members")}
        description={`${members.length} ${t("members registered in your household")}`}
      >
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <Plus className="h-4 w-4" /> {t("Add Family Member")}
        </Button>
      </PageHeader>

      {members.length === 0 ? (
        <Card className="animate-fade-in border-border/50">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t("No Family Members Found")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("Click below to add your family members to your household record.")}
            </p>
            <Button onClick={() => setIsSheetOpen(true)} className="gradient-primary border-0 text-white gap-1.5">
              <Plus className="h-4 w-4" /> {t("Add First Family Member")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member, i) => {
            const abroad = member.livingAbroad ?? member.isLivingAbroad;
            const edu = member.educationStatus ?? member.educationLevel;
            const age = calculateAge(member.dateOfBirth);
            return (
              <Card
                key={member.id}
                className="animate-fade-in hover:border-primary/20 transition-all shadow-sm relative group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold font-heading text-base">
                        {member.fullName}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {t(member.relationship)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="capitalize">{t(member.gender)}</Badge>
                      {abroad && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                          <MapPin className="h-3 w-3 mr-1" /> {t("ABROAD")}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        title="Remove Member"
                        onClick={() => {
                          setDeletingMember(member);
                          setDeleteConfirmText("");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-foreground">{age} years old</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {edu && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        <span className="capitalize">{t(edu.replace(/_/g, " "))}</span>
                      </div>
                    )}
                    {member.employmentStatus && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5 text-primary" />
                        <span className="capitalize">{t(member.employmentStatus.replace(/_/g, " "))}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Family Member Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("Add Family Member")}</SheetTitle>
            <SheetDescription>
              {t("Enter member details to include them in your household survey record.")}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleAddMember} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mem-name">{t("common.name")} *</Label>
              <Input
                id="mem-name"
                placeholder="e.g. Amina Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mem-rel">Relationship *</Label>
                <Select value={relationship} onValueChange={(val) => setRelationship(val ?? "")} required>
                  <SelectTrigger id="mem-rel">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => (
                      <SelectItem key={r.value} value={r.label}>
                        {t(r.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mem-gender">Gender *</Label>
                <Select value={gender} onValueChange={(val) => setGender(val ?? "")} required>
                  <SelectTrigger id="mem-gender">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {t(g.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="mem-dob">Date of Birth *</Label>
                {computedAge !== null && (
                  <span className="text-xs font-bold text-primary font-mono">
                    Auto Age: {computedAge} years
                  </span>
                )}
              </div>
              <Input
                id="mem-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mem-phone">{t("common.phone")}</Label>
              <Input
                id="mem-phone"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mem-edu">Education Level</Label>
              <Select value={educationLevel} onValueChange={(val) => setEducationLevel(val ?? "")}>
                <SelectTrigger id="mem-edu">
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {t(e.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mem-emp">Employment Status</Label>
              <Select value={employmentStatus} onValueChange={(val) => setEmploymentStatus(val ?? "")}>
                <SelectTrigger id="mem-emp">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_STATUSES.map((emp) => (
                    <SelectItem key={emp.value} value={emp.value}>
                      {t(emp.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="mem-abroad"
                checked={isLivingAbroad}
                onChange={(e) => setIsLivingAbroad(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="mem-abroad" className="text-xs cursor-pointer">
                {t("Currently living or studying abroad")}
              </Label>
            </div>

            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("common.loading") : t("common.save")}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 2-Step Verification Delete Dialog */}
      <Dialog open={Boolean(deletingMember)} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
              <ShieldAlert className="h-6 w-6" /> 2-Step Verification: Delete Family Member
            </div>
            <DialogDescription className="pt-2 text-sm">
              You are about to remove family member <span className="font-semibold text-foreground">{deletingMember?.fullName}</span> from your household.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 border-y border-border/40">
            <Label htmlFor="confirm-delete-member" className="text-xs font-semibold">
              Step 2: Type <span className="font-mono text-destructive uppercase">DELETE</span> below to confirm permanent deletion:
            </Label>
            <Input
              id="confirm-delete-member"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="font-mono"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingMember(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
