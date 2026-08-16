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
import { Plus, Trash2, Edit3, AlertTriangle, ShieldAlert } from "lucide-react";

interface Ward {
  id: string;
  name: string;
  wardNumber: number;
  description: string | null;
  _count: { areas: number; households: number };
}

export default function WardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  // Form & Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [description, setDescription] = useState("");

  // 2-Step Verification Delete State
  const [deletingWard, setDeletingWard] = useState<Ward | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWards = () => {
    setLoading(true);
    fetch("/api/wards")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWards(data.data);
      })
      .catch(() => toast.error("Failed to fetch wards"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const handleOpenAdd = () => {
    setEditingWard(null);
    setName("");
    setWardNumber("");
    setDescription("");
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (ward: Ward) => {
    setEditingWard(ward);
    setName(ward.name);
    setWardNumber(ward.wardNumber.toString());
    setDescription(ward.description || "");
    setIsSheetOpen(true);
  };

  const handleSaveWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !wardNumber) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = Boolean(editingWard);
      const url = "/api/wards";
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit
        ? { id: editingWard!.id, name, wardNumber, description }
        : { name, wardNumber, description };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} ward`);

      toast.success(`Ward ${name} ${isEdit ? "updated" : "added"} successfully!`);
      setIsSheetOpen(false);
      fetchWards();
    } catch (err: any) {
      toast.error(err.message || "Failed to save ward");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingWard || deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm 2-step verification.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/wards?id=${deletingWard.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete ward");

      toast.success(`Ward "${deletingWard.name}" removed successfully`);
      setDeletingWard(null);
      setDeleteConfirmText("");
      fetchWards();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ward");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Ward>[] = [
    {
      accessorKey: "wardNumber",
      header: "Ward #",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono">
          W{row.original.wardNumber}
        </Badge>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.description || "—"}
        </span>
      ),
    },
    {
      id: "households",
      header: "Households",
      cell: ({ row }) => row.original._count?.households ?? 0,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => handleOpenEdit(row.original)}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => {
              setDeletingWard(row.original);
              setDeleteConfirmText("");
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Wards"
        description={`${wards.length} administrative wards registered`}
      >
        <Button
          onClick={handleOpenAdd}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Ward
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingSkeleton count={5} className="lg:grid-cols-1" />
      ) : (
        <DataTable
          columns={columns}
          data={wards}
          searchKey="name"
          searchPlaceholder="Search wards..."
        />
      )}

      {/* Add / Edit Ward Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingWard ? "Edit Municipal Ward" : "Add Municipal Ward"}</SheetTitle>
            <SheetDescription>
              {editingWard
                ? "Update ward details and boundaries."
                : "Register a new administrative ward for the city."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSaveWard} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ward-number">Ward Number *</Label>
              <Input
                id="ward-number"
                type="number"
                placeholder="e.g. 1"
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ward-name">Ward Name *</Label>
              <Input
                id="ward-name"
                placeholder="e.g. Bunder / Sea Shore"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ward-desc">Description</Label>
              <Input
                id="ward-desc"
                placeholder="Key landmarks or notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingWard ? "Update Ward" : "Save Ward"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 2-Step Verification Delete Dialog */}
      <Dialog open={Boolean(deletingWard)} onOpenChange={(open) => !open && setDeletingWard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
              <ShieldAlert className="h-6 w-6" /> 2-Step Verification: Delete Ward
            </div>
            <DialogDescription className="pt-2 text-sm">
              You are about to delete <span className="font-semibold text-foreground">W{deletingWard?.wardNumber} - {deletingWard?.name}</span>.
              This will also soft-delete associated streets and household records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 border-y border-border/40">
            <Label htmlFor="confirm-delete-ward" className="text-xs font-semibold">
              Step 2: Type <span className="font-mono text-destructive uppercase">DELETE</span> below to confirm permanent deletion:
            </Label>
            <Input
              id="confirm-delete-ward"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="font-mono"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingWard(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete Ward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
