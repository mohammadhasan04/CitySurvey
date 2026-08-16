"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader, LoadingSkeleton } from "@/components/shared/page-components";
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
import { toast } from "sonner";
import { Plus, Trash2, ShieldAlert, UserPlus, Search } from "lucide-react";
import { calculateAge } from "@/lib/utils";
import { RELATIONSHIPS, GENDERS, EDUCATION_LEVELS, EMPLOYMENT_STATUSES, WORLD_COUNTRIES } from "@/lib/constants";

interface Household {
  id: string;
  surveyId: string;
  headOfFamily: string;
  houseNumber: string;
}

interface Resident {
  id: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phone: string | null;
  relationship: string;
  educationStatus: string | null;
  employmentStatus: string | null;
  livingAbroad: boolean;
  household: { surveyId: string; houseNumber: string };
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Resident Modal State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [householdSearch, setHouseholdSearch] = useState("");
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("Son");
  const [gender, setGender] = useState("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [educationLevel, setEducationLevel] = useState("GRADUATE");
  const [employmentStatus, setEmploymentStatus] = useState("EMPLOYED");
  const [isLivingAbroad, setIsLivingAbroad] = useState(false);
  const [country, setCountry] = useState("Saudi Arabia");

  // 2-Step Verification Delete State
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResidents = () => {
    setLoading(true);
    fetch("/api/residents")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setResidents(data.data);
      })
      .catch(() => toast.error("Failed to fetch residents"))
      .finally(() => setLoading(false));
  };

  const fetchHouseholds = () => {
    fetch("/api/households")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHouseholds(data.data);
      });
  };

  useEffect(() => {
    fetchResidents();
    fetchHouseholds();
  }, []);

  const handleOpenAdd = () => {
    setSelectedHouseholdId("");
    setHouseholdSearch("");
    setFullName("");
    setRelationship("Son");
    setGender("MALE");
    setDateOfBirth("");
    setPhone("");
    setEducationLevel("GRADUATE");
    setEmploymentStatus("EMPLOYED");
    setIsLivingAbroad(false);
    setIsSheetOpen(true);
  };

  const handleCreateResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouseholdId || !fullName || !dateOfBirth) {
      toast.error("Please select a household, enter full name and date of birth.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdId: selectedHouseholdId,
          fullName,
          relationship,
          gender,
          dateOfBirth,
          phone: phone || null,
          educationLevel,
          employmentStatus,
          isLivingAbroad,
          country: isLivingAbroad ? country : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add resident");

      toast.success(`Resident "${fullName}" added successfully!`);
      setIsSheetOpen(false);
      fetchResidents();
    } catch (err: any) {
      toast.error(err.message || "Failed to add resident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingResident || deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm 2-step verification.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/residents?id=${deletingResident.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete resident");

      toast.success(`Resident "${deletingResident.fullName}" removed successfully`);
      setDeletingResident(null);
      setDeleteConfirmText("");
      fetchResidents();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete resident");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredHouseholds = households.filter((h) => {
    const q = householdSearch.toLowerCase().trim();
    return (
      !q ||
      h.surveyId.toLowerCase().includes(q) ||
      h.headOfFamily.toLowerCase().includes(q) ||
      h.houseNumber.toLowerCase().includes(q)
    );
  });

  const computedAge = dateOfBirth ? calculateAge(dateOfBirth) : null;

  const columns: ColumnDef<Resident>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => <span className="font-semibold">{row.original.fullName}</span>,
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => <Badge variant="secondary">{row.original.gender}</Badge>,
    },
    {
      accessorKey: "dateOfBirth",
      header: "Age",
      cell: ({ row }) => {
        const age = calculateAge(row.original.dateOfBirth);
        return (
          <span className="font-mono text-xs font-medium">
            {age} yrs
          </span>
        );
      },
    },
    {
      accessorKey: "relationship",
      header: "Relationship",
      cell: ({ row }) => row.original.relationship.replace(/_/g, " "),
    },
    {
      id: "household",
      header: "Household ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-primary">
          {row.original.household?.surveyId}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "—",
    },
    {
      accessorKey: "employmentStatus",
      header: "Employment",
      cell: ({ row }) => row.original.employmentStatus?.replace(/_/g, " ") || "—",
    },
    {
      accessorKey: "livingAbroad",
      header: "Abroad",
      cell: ({ row }) =>
        row.original.livingAbroad ? (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
            Living Abroad
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Resident</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => {
            setDeletingResident(row.original);
            setDeleteConfirmText("");
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Residents" description={`${residents.length} registered residents`}>
        <Button
          onClick={handleOpenAdd}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <UserPlus className="h-4 w-4" /> Add Resident
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingSkeleton count={5} className="lg:grid-cols-1" />
      ) : (
        <DataTable
          columns={columns}
          data={residents}
          searchKey="fullName"
          searchPlaceholder="Search residents by name..."
        />
      )}

      {/* Add Resident Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Resident to Household</SheetTitle>
            <SheetDescription>
              Search a household by Survey ID or Head Name (e.g. Mulla) and add a family member.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateResident} className="space-y-4 py-4">
            {/* Household Picker with Search */}
            <div className="space-y-2">
              <Label htmlFor="res-hh-search">Find Household (ID or Head Name) *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="res-hh-search"
                  placeholder="e.g. SRV-8K92P or Mulla"
                  value={householdSearch}
                  onChange={(e) => setHouseholdSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={selectedHouseholdId}
                onValueChange={(val) => setSelectedHouseholdId(val ?? "")}
                required
              >
                <SelectTrigger id="res-hh-select">
                  <SelectValue placeholder="Select Target Household..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredHouseholds.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.surveyId} — {h.headOfFamily} ({h.houseNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="res-name">Full Name *</Label>
              <Input
                id="res-name"
                placeholder="Resident full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="res-rel">Relationship *</Label>
                <Select value={relationship} onValueChange={(v) => setRelationship(v ?? "Son")}>
                  <SelectTrigger id="res-rel">
                    <SelectValue />
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
                <Label htmlFor="res-gender">Gender *</Label>
                <Select value={gender} onValueChange={(v) => setGender(v ?? "MALE")}>
                  <SelectTrigger id="res-gender">
                    <SelectValue />
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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="res-dob">Date of Birth *</Label>
                {computedAge !== null && (
                  <span className="text-xs font-bold text-primary font-mono">
                    Auto Age: {computedAge} years
                  </span>
                )}
              </div>
              <Input
                id="res-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="res-phone">Contact Phone Number</Label>
              <Input
                id="res-phone"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="res-edu">Education</Label>
                <Select value={educationLevel} onValueChange={(v) => setEducationLevel(v ?? "GRADUATE")}>
                  <SelectTrigger id="res-edu">
                    <SelectValue />
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

              <div className="space-y-2">
                <Label htmlFor="res-emp">Employment</Label>
                <Select value={employmentStatus} onValueChange={(v) => setEmploymentStatus(v ?? "EMPLOYED")}>
                  <SelectTrigger id="res-emp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_STATUSES.map((em) => (
                      <SelectItem key={em.value} value={em.value}>
                        {em.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <input
                  id="res-abroad"
                  type="checkbox"
                  checked={isLivingAbroad}
                  onChange={(e) => setIsLivingAbroad(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="res-abroad" className="text-xs cursor-pointer font-semibold">
                  Currently living or studying abroad
                </Label>
              </div>

              {isLivingAbroad && (
                <div className="space-y-1.5 pt-2 animate-fade-in">
                  <Label htmlFor="res-country" className="text-xs font-semibold text-primary">
                    Select Country of Residence *
                  </Label>
                  <Select value={country} onValueChange={(val) => setCountry(val ?? "Saudi Arabia")}>
                    <SelectTrigger id="res-country" className="h-9">
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

            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Resident"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 2-Step Verification Delete Dialog */}
      <Dialog open={Boolean(deletingResident)} onOpenChange={(open) => !open && setDeletingResident(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
              <ShieldAlert className="h-6 w-6" /> 2-Step Verification: Delete Resident
            </div>
            <DialogDescription className="pt-2 text-sm">
              You are about to remove resident <span className="font-semibold text-foreground">{deletingResident?.fullName}</span> from Household <span className="font-mono text-primary font-bold">{deletingResident?.household?.surveyId}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 border-y border-border/40">
            <Label htmlFor="confirm-delete-resident" className="text-xs font-semibold">
              Step 2: Type <span className="font-mono text-destructive uppercase">DELETE</span> below to confirm permanent removal:
            </Label>
            <Input
              id="confirm-delete-resident"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="font-mono"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingResident(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Removing..." : "Permanently Remove Resident"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
