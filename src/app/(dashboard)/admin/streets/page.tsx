"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader, LoadingSkeleton } from "@/components/shared/page-components";
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
import { Plus, Trash2, Edit3, ShieldAlert } from "lucide-react";

interface Street {
  id: string;
  name: string;
  description: string | null;
  area: { id: string; name: string } | null;
  _count: { households: number };
}

export default function StreetsPage() {
  const [streets, setStreets] = useState<Street[]>([]);
  const [loading, setLoading] = useState(true);

  // Form & Sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStreet, setEditingStreet] = useState<Street | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // 2-Step Verification Delete State
  const [deletingStreet, setDeletingStreet] = useState<Street | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStreets = () => {
    setLoading(true);
    fetch("/api/streets")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStreets(data.data);
      })
      .catch(() => toast.error("Failed to fetch streets"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStreets();
  }, []);

  const handleOpenAdd = () => {
    setEditingStreet(null);
    setName("");
    setDescription("");
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (street: Street) => {
    setEditingStreet(street);
    setName(street.name);
    setDescription(street.description || "");
    setIsSheetOpen(true);
  };

  const handleSaveStreet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Street name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = Boolean(editingStreet);
      const url = "/api/streets";
      const method = isEdit ? "PATCH" : "POST";

      // If areaId is omitted, pass default area
      const payload = isEdit
        ? { id: editingStreet!.id, name, description }
        : { name, description };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} street`);

      toast.success(`Street "${name}" ${isEdit ? "updated" : "added"} successfully!`);
      setIsSheetOpen(false);
      fetchStreets();
    } catch (err: any) {
      toast.error(err.message || "Failed to save street");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStreet || deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm 2-step verification.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/streets?id=${deletingStreet.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete street");

      toast.success(`Street "${deletingStreet.name}" removed successfully`);
      setDeletingStreet(null);
      setDeleteConfirmText("");
      fetchStreets();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete street");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Street>[] = [
    {
      accessorKey: "name",
      header: "Street Name",
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
              setDeletingStreet(row.original);
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
      <PageHeader title="Streets" description={`${streets.length} city streets registered`}>
        <Button
          onClick={handleOpenAdd}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Street
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingSkeleton count={5} className="lg:grid-cols-1" />
      ) : (
        <DataTable
          columns={columns}
          data={streets}
          searchKey="name"
          searchPlaceholder="Search streets..."
        />
      )}

      {/* Add / Edit Street Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingStreet ? "Edit Street / Road" : "Add City Street / Road"}</SheetTitle>
            <SheetDescription>
              {editingStreet ? "Update street details." : "Add a new street or road to the city."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSaveStreet} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="street-name">Street / Road Name *</Label>
              <Input
                id="street-name"
                placeholder="e.g. MG Road, Block B"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street-desc">Description</Label>
              <Input
                id="street-desc"
                placeholder="e.g. Near Bus Depot or Main Market"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingStreet ? "Update Street" : "Save Street"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* 2-Step Verification Delete Dialog */}
      <Dialog open={Boolean(deletingStreet)} onOpenChange={(open) => !open && setDeletingStreet(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
              <ShieldAlert className="h-6 w-6" /> 2-Step Verification: Delete Street
            </div>
            <DialogDescription className="pt-2 text-sm">
              You are about to delete street <span className="font-semibold text-foreground">{deletingStreet?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 border-y border-border/40">
            <Label htmlFor="confirm-delete-street" className="text-xs font-semibold">
              Step 2: Type <span className="font-mono text-destructive uppercase">DELETE</span> below to confirm permanent deletion:
            </Label>
            <Input
              id="confirm-delete-street"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="font-mono"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingStreet(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete Street"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
