"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard, LoadingSkeleton } from "@/components/shared/page-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Home,
  MapPin,
  Phone,
  User,
  Hash,
  Plus,
  Trash2,
  CheckCircle,
  Users,
  Calendar,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  RELATIONSHIPS,
  GENDERS,
  EDUCATION_LEVELS,
  EMPLOYMENT_STATUSES,
  WORLD_COUNTRIES,
} from "@/lib/constants";

interface Ward {
  id: string;
  name: string;
  wardNumber: number;
}

interface Area {
  id: string;
  name: string;
}

interface Street {
  id: string;
  name: string;
}

interface DraftMember {
  fullName: string;
  relationship: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  educationLevel: string;
  employmentStatus: string;
  isLivingAbroad: boolean;
}

interface HouseholdDetail {
  id: string;
  surveyId: string;
  houseNumber: string;
  headOfFamily: string;
  address: string;
  phone: string | null;
  totalMembers: number;
  surveyStatus: string;
  ward: { name: string; wardNumber: number };
  area: { name: string } | null;
  street: { name: string } | null;
  building: { name: string } | null;
  familyMembers?: {
    id: string;
    fullName: string;
    relationship: string;
    gender: string;
    dateOfBirth: string;
    phone: string | null;
    educationLevel: string | null;
    employmentStatus: string | null;
    isLivingAbroad: boolean;
  }[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  VERIFIED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function ResidentHouseholdPage() {
  const { data: session, update } = useSession();
  const [household, setHousehold] = useState<HouseholdDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Infrastructure Options
  const [wards, setWards] = useState<Ward[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);

  // Household Details State
  const [wardId, setWardId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [streetId, setStreetId] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [headOfFamily, setHeadOfFamily] = useState(session?.user?.name || "");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Dynamic Family Members Draft List
  const [familyMembers, setFamilyMembers] = useState<DraftMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHousehold = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/households");
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setHousehold(data.data[0]);
      }
    } catch (err) {
      console.error("Failed to load household", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInfrastructure = async () => {
    fetch("/api/wards")
      .then((r) => r.json())
      .then((d) => { if (d.success) setWards(d.data); });
    fetch("/api/areas")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAreas(d.data); });
    fetch("/api/streets")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStreets(d.data); });
  };

  useEffect(() => {
    fetchHousehold();
    fetchInfrastructure();
  }, []);

  // Auto-initialize Member #1 if list is empty
  useEffect(() => {
    if (!household && familyMembers.length === 0 && headOfFamily) {
      setFamilyMembers([
        {
          fullName: headOfFamily,
          relationship: "Head of Family",
          gender: "MALE",
          dateOfBirth: "",
          phone: phone,
          educationLevel: "GRADUATE",
          employmentStatus: "EMPLOYED",
          isLivingAbroad: false,
        },
      ]);
    }
  }, [household, headOfFamily]);

  const handleHeadNameChange = (name: string) => {
    setHeadOfFamily(name);
    if (familyMembers.length > 0 && (familyMembers[0].relationship === "Head of Family" || familyMembers[0].relationship === "HEAD")) {
      const updated = [...familyMembers];
      updated[0].fullName = name;
      setFamilyMembers(updated);
    }
  };

  const handleHeadPhoneChange = (val: string) => {
    setPhone(val);
    if (familyMembers.length > 0 && (familyMembers[0].relationship === "Head of Family" || familyMembers[0].relationship === "HEAD")) {
      const updated = [...familyMembers];
      updated[0].phone = val;
      setFamilyMembers(updated);
    }
  };

  const addFamilyMemberRow = () => {
    setFamilyMembers([
      ...familyMembers,
      {
        fullName: "",
        relationship: "Spouse",
        gender: "FEMALE",
        dateOfBirth: "",
        phone: "",
        educationLevel: "",
        employmentStatus: "",
        isLivingAbroad: false,
      },
    ]);
  };

  const removeFamilyMemberRow = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMemberField = (
    index: number,
    field: keyof DraftMember,
    value: any
  ) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const handleFullSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNumber || !address || !wardId) {
      toast.error("House number, physical address, and municipal ward are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/households/full-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          houseNumber,
          headOfFamily,
          address,
          phone,
          wardId,
          areaId: areaId || null,
          streetId: streetId || null,
          familyMembers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit household information");

      toast.success(
        `Household and ${familyMembers.length} family member(s) submitted successfully!`
      );
      await update();
      fetchHousehold();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit household");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAge = (dob: string) => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  if (loading)
    return (
      <div>
        <PageHeader title="My Household" description="" />
        <LoadingSkeleton count={4} />
      </div>
    );

  // Unlinked State -> All-in-One Household & Family Members Registration Wizard
  if (!household) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Complete Household & Family Registration"
          description="Register your household details and add all your family members in one submission"
        />

        <form onSubmit={handleFullSubmission} className="space-y-6">
          {/* Step 1: Household Details */}
          <Card className="animate-fade-in border-primary/20 shadow-md">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" /> Step 1: Household Location & Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-ward">Select Municipal Ward *</Label>
                  <Select
                    value={wardId}
                    onValueChange={(val) => setWardId(val ?? "")}
                    required
                  >
                    <SelectTrigger id="reg-ward">
                      <SelectValue placeholder="Choose Ward..." />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          W{w.wardNumber} - {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-house">House / Flat / Plot Number *</Label>
                  <Input
                    id="reg-house"
                    placeholder="e.g. House #42-B, Block C"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-head">Head of Household Full Name *</Label>
                  <Input
                    id="reg-head"
                    placeholder="Full name of household head"
                    value={headOfFamily}
                    onChange={(e) => handleHeadNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Contact Phone Number</Label>
                  <Input
                    id="reg-phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => handleHeadPhoneChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-address">Full Physical Address *</Label>
                <Input
                  id="reg-address"
                  placeholder="Street name, landmark, near bus stand, locality details"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-street">Street / Road (Optional)</Label>
                <Select
                  value={streetId}
                  onValueChange={(val) => setStreetId(val ?? "")}
                >
                  <SelectTrigger id="reg-street">
                    <SelectValue placeholder="Select Street / Road..." />
                  </SelectTrigger>
                  <SelectContent>
                    {streets.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Family Members List */}
          <Card className="animate-fade-in border-primary/20 shadow-md">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Step 2: Family Members ({familyMembers.length})
              </CardTitle>
              <Button
                type="button"
                onClick={addFamilyMemberRow}
                className="gradient-primary border-0 text-white gap-1.5 size-sm text-xs"
              >
                <Plus className="h-4 w-4" /> Add Family Member
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {familyMembers.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
                  <p className="font-semibold text-sm">No family members added yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Click the button below to add your spouse, children, parents, or relatives to this household.
                  </p>
                  <Button
                    type="button"
                    onClick={addFamilyMemberRow}
                    className="gradient-primary border-0 text-white gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Add Member Details
                  </Button>
                </div>
              ) : (
                familyMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-border/80 p-4 bg-card shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="font-bold text-xs text-primary uppercase tracking-wider">
                        Member #{idx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-destructive hover:bg-destructive/10 gap-1 text-xs"
                        onClick={() => removeFamilyMemberRow(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Member
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`mem-name-${idx}`}>Full Name *</Label>
                        <Input
                          id={`mem-name-${idx}`}
                          placeholder="e.g. Amina Sharma"
                          value={member.fullName}
                          onChange={(e) =>
                            updateFamilyMemberField(idx, "fullName", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`mem-rel-${idx}`}>Relationship *</Label>
                        <Select
                          value={member.relationship}
                          onValueChange={(val) =>
                            updateFamilyMemberField(idx, "relationship", val ?? "")
                          }
                          required
                        >
                          <SelectTrigger id={`mem-rel-${idx}`}>
                            <SelectValue placeholder="Relationship..." />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIPS.map((r) => (
                              <SelectItem key={r.value} value={r.label}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`mem-gender-${idx}`}>Gender *</Label>
                        <Select
                          value={member.gender}
                          onValueChange={(val) =>
                            updateFamilyMemberField(idx, "gender", val ?? "")
                          }
                          required
                        >
                          <SelectTrigger id={`mem-gender-${idx}`}>
                            <SelectValue placeholder="Gender..." />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDERS.map((g) => (
                              <SelectItem key={g.value} value={g.value}>
                                {g.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`mem-dob-${idx}`}>Date of Birth *</Label>
                        <Input
                          id={`mem-dob-${idx}`}
                          type="date"
                          value={member.dateOfBirth}
                          onChange={(e) =>
                            updateFamilyMemberField(idx, "dateOfBirth", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`mem-phone-${idx}`}>Phone Number</Label>
                        <Input
                          id={`mem-phone-${idx}`}
                          placeholder="+91 XXXXX XXXXX"
                          value={member.phone}
                          onChange={(e) =>
                            updateFamilyMemberField(idx, "phone", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`mem-edu-${idx}`}>Education Level</Label>
                        <Select
                          value={member.educationLevel}
                          onValueChange={(val) =>
                            updateFamilyMemberField(idx, "educationLevel", val ?? "")
                          }
                        >
                          <SelectTrigger id={`mem-edu-${idx}`}>
                            <SelectValue placeholder="Select Level..." />
                          </SelectTrigger>
                          <SelectContent>
                            {EDUCATION_LEVELS.map((e) => (
                              <SelectItem key={e.value} value={e.value}>
                                {e.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`mem-emp-${idx}`}>Employment Status</Label>
                        <Select
                          value={member.employmentStatus}
                          onValueChange={(val) =>
                            updateFamilyMemberField(idx, "employmentStatus", val ?? "")
                          }
                        >
                          <SelectTrigger id={`mem-emp-${idx}`}>
                            <SelectValue placeholder="Select Status..." />
                          </SelectTrigger>
                          <SelectContent>
                            {EMPLOYMENT_STATUSES.map((emp) => (
                              <SelectItem key={emp.value} value={emp.value}>
                                {emp.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`mem-abroad-${idx}`}
                            checked={member.isLivingAbroad}
                            onChange={(e) =>
                              updateFamilyMemberField(
                                idx,
                                "isLivingAbroad",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label
                            htmlFor={`mem-abroad-${idx}`}
                            className="text-xs cursor-pointer font-semibold"
                          >
                            Currently living or studying abroad
                          </Label>
                        </div>

                        {member.isLivingAbroad && (
                          <div className="space-y-1.5 pt-2 animate-fade-in">
                            <Label htmlFor={`mem-country-${idx}`} className="text-xs font-semibold text-primary">
                              Select Country of Residence *
                            </Label>
                            <Select
                              value={(member as any).country || "Saudi Arabia"}
                              onValueChange={(val) =>
                                updateFamilyMemberField(idx, "country" as any, val ?? "Saudi Arabia")
                              }
                            >
                              <SelectTrigger id={`mem-country-${idx}`} className="h-9">
                                <SelectValue placeholder="Choose Country..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {WORLD_COUNTRIES.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Submit Entire Household */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gradient-primary border-0 text-white shadow-lg shadow-primary/25 gap-2 h-12 px-8 text-base font-semibold w-full sm:w-auto"
            >
              <CheckCircle className="h-5 w-5" />
              {isSubmitting
                ? "Submitting Complete Household..."
                : `Submit Complete Household (${familyMembers.length + 1} Total Person Records)`}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Linked State -> Display Household Summary & Family Members
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Household"
        description={`Survey ID: ${household.surveyId}`}
      />

      <SectionCard
        title="Household Details"
        actions={
          <Badge className={statusColors[household.surveyStatus]}>
            {household.surveyStatus.replace("_", " ")}
          </Badge>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Hash, label: "Survey ID", value: household.surveyId },
            { icon: Home, label: "House Number", value: household.houseNumber },
            { icon: User, label: "Head of Family", value: household.headOfFamily },
            { icon: Phone, label: "Phone", value: household.phone || "Not recorded" },
            {
              icon: MapPin,
              label: "Ward",
              value: household.ward
                ? `W${household.ward.wardNumber} - ${household.ward.name}`
                : "Unassigned",
            },
            { icon: MapPin, label: "Address", value: household.address },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
            >
              <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-medium text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Location Details">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Area / Locality</p>
            <p className="font-medium">{household.area?.name || "Bhatkal"}</p>
          </div>
            {household.street && (
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Street</p>
                <p className="font-medium">{household.street.name}</p>
              </div>
            )}
            {household.building && (
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Building</p>
                <p className="font-medium">{household.building.name}</p>
              </div>
            )}
          </div>
        </SectionCard>

      {/* Linked Family Members */}
      {household.familyMembers && (
        <SectionCard
          title={`Registered Family Members (${household.familyMembers.length})`}
          icon={<Users className="h-5 w-5 text-primary" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {household.familyMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-border bg-card/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{member.fullName}</h4>
                    <p className="text-xs text-muted-foreground">{member.relationship}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {member.gender.toLowerCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                  <span>Age: {getAge(member.dateOfBirth)} years</span>
                  <span>Phone: {member.phone || "—"}</span>
                  <span className="capitalize">Edu: {member.educationLevel?.replace(/_/g, " ").toLowerCase() || "—"}</span>
                  <span className="capitalize">Emp: {member.employmentStatus?.replace(/_/g, " ").toLowerCase() || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
