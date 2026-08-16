"use client";

import { useEffect, useState, useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import {
  PageHeader,
  LoadingSkeleton,
} from "@/components/shared/page-components";
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
import { Plus, Search, Eye, Users, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { SURVEY_STATUSES } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";

interface Household {
  id: string;
  surveyId: string;
  houseNumber: string;
  headOfFamily: string;
  address: string;
  totalMembers: number;
  surveyStatus: string;
  phone: string | null;
  createdAt: string;
  ward: { name: string; wardNumber: number };
  area: { name: string } | null;
  street: { name: string } | null;
  _count: { familyMembers: number };
}

interface Ward {
  id: string;
  name: string;
  wardNumber: number;
}

interface Street {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  VERIFIED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function HouseholdsPage() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Add Household Drawer State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [houseNumber, setHouseNumber] = useState("");
  const [headOfFamily, setHeadOfFamily] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [wardId, setWardId] = useState("");
  const [streetId, setStreetId] = useState("");

  // 2-Step Verification Delete State
  const [deletingHousehold, setDeletingHousehold] = useState<Household | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHouseholds = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (wardFilter) params.set("wardId", wardFilter);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/households?${params}`);
      const data = await res.json();
      if (data.success) setHouseholds(data.data);
    } catch {
      toast.error("Failed to fetch households");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, wardFilter, statusFilter]);

  useEffect(() => {
    fetch("/api/wards")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setWards(d.data);
      });
    fetch("/api/streets")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStreets(d.data);
      });
  }, []);

  useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  const handleOpenAdd = () => {
    setHouseNumber("");
    setHeadOfFamily("");
    setAddress("");
    setPhone("");
    setWardId("");
    setStreetId("");
    setIsSheetOpen(true);
  };

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNumber || !headOfFamily || !address || !wardId) {
      toast.error("House #, Head of Family name, address, and ward are required");
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
          phone: phone || null,
          wardId,
          streetId: streetId || null,
          familyMembers: [
            {
              fullName: headOfFamily,
              relationship: "Head of Family",
              gender: "MALE",
              dateOfBirth: "1985-01-01",
              phone: phone || null,
              educationLevel: "GRADUATE",
              employmentStatus: "EMPLOYED",
              isLivingAbroad: false,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create household");

      toast.success(`Household created with Survey ID: ${data.data?.surveyId || "New"}`);
      setIsSheetOpen(false);
      fetchHouseholds();
    } catch (err: any) {
      toast.error(err.message || "Failed to create household");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingHousehold || deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm 2-step verification.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/households?id=${deletingHousehold.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete household");

      toast.success(`Household ${deletingHousehold.surveyId} deleted successfully`);
      setDeletingHousehold(null);
      setDeleteConfirmText("");
      fetchHouseholds();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete household");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Household>[] = [
    {
      accessorKey: "surveyId",
      header: "Survey ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-primary">{row.original.surveyId}</span>
      ),
    },
    {
      accessorKey: "headOfFamily",
      header: "Head of Family",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.headOfFamily}</span>
      ),
    },
    {
      accessorKey: "houseNumber",
      header: "House #",
    },
    {
      id: "ward",
      header: "Ward",
      cell: ({ row }) => (
        <span>
          W{row.original.ward.wardNumber} - {row.original.ward.name}
        </span>
      ),
    },
    {
      id: "members",
      header: "Members",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono">
          {row.original._count.familyMembers}
        </Badge>
      ),
    },
    {
      accessorKey: "surveyStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.surveyStatus] || ""}>
          {row.original.surveyStatus.replace("_", " ")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1 items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View Details">
            <Link href={`/admin/households/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Family Members">
            <Link href={`/admin/households/${row.original.id}/members`}>
              <Users className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Delete Household"
            onClick={() => {
              setDeletingHousehold(row.original);
              setDeleteConfirmText("");
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Households"
        description={`${households.length} households registered`}
      >
        <Button
          onClick={handleOpenAdd}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Household
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={wardFilter} onValueChange={(v) => setWardFilter(v ?? "")}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="All Wards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Wards</SelectItem>
            {wards.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                W{w.wardNumber} - {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "")}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Status</SelectItem>
            {SURVEY_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSkeleton count={5} className="lg:grid-cols-1" />
      ) : (
        <DataTable columns={columns} data={households} pageSize={20} />
      )}

      {/* Add Household Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Household</SheetTitle>
            <SheetDescription>
              Create a new household record and assign a unique Survey ID automatically.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateHousehold} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-hh-ward">Select Municipal Ward *</Label>
              <Select value={wardId} onValueChange={(v) => setWardId(v ?? "")} required>
                <SelectTrigger id="add-hh-ward">
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
              <Label htmlFor="add-hh-house">House / Flat Number *</Label>
              <Input
                id="add-hh-house"
                placeholder="e.g. Flat #204, Building B"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-hh-head">Head of Household Full Name *</Label>
              <Input
                id="add-hh-head"
                placeholder="e.g. Mulla Ibrahim"
                value={headOfFamily}
                onChange={(e) => setHeadOfFamily(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-hh-phone">Contact Phone Number</Label>
              <Input
                id="add-hh-phone"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-hh-address">Full Physical Address *</Label>
              <Input
                id="add-hh-address"
                placeholder="Street, Landmark, Near Bus Stand..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-hh-street">Street / Road (Optional)</Label>
              <Select value={streetId} onValueChange={(v) => setStreetId(v ?? "")}>
                <SelectTrigger id="add-hh-street">
                  <SelectValue placeholder="Select Street..." />
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

            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Household"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 2-Step Verification Delete Dialog */}
      <Dialog open={Boolean(deletingHousehold)} onOpenChange={(open) => !open && setDeletingHousehold(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
              <ShieldAlert className="h-6 w-6" /> 2-Step Verification: Delete Household
            </div>
            <DialogDescription className="pt-2 text-sm">
              You are about to delete Household <span className="font-mono text-primary font-bold">{deletingHousehold?.surveyId}</span> (Head: {deletingHousehold?.headOfFamily}).
              This will also soft-delete all registered family members.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 border-y border-border/40">
            <Label htmlFor="confirm-delete-hh" className="text-xs font-semibold">
              Step 2: Type <span className="font-mono text-destructive uppercase">DELETE</span> below to confirm permanent deletion:
            </Label>
            <Input
              id="confirm-delete-hh"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="font-mono"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingHousehold(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete Household"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
