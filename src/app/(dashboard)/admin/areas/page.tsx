"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader, LoadingSkeleton } from "@/components/shared/page-components";
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
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Ward {
  id: string;
  name: string;
  wardNumber: number;
}

interface Area {
  id: string;
  name: string;
  description: string | null;
  ward: { id: string; name: string; wardNumber: number };
  _count: { streets: number; households: number };
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [wardId, setWardId] = useState("");
  const [description, setDescription] = useState("");

  const fetchAreas = () => {
    setLoading(true);
    fetch("/api/areas")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAreas(data.data);
      })
      .catch(() => toast.error("Failed to fetch areas"))
      .finally(() => setLoading(false));
  };

  const fetchWards = () => {
    fetch("/api/wards")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setWards(data.data);
      });
  };

  useEffect(() => {
    fetchAreas();
    fetchWards();
  }, []);

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !wardId) {
      toast.error("Area name and ward selection are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, wardId, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create area");

      toast.success(`Area "${name}" added successfully!`);
      setIsSheetOpen(false);
      setName("");
      setWardId("");
      setDescription("");
      fetchAreas();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to add area");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArea = async (area: Area) => {
    if (!confirm(`Are you sure you want to delete "${area.name}"?`)) return;

    try {
      const res = await fetch(`/api/areas?id=${area.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete area");

      toast.success(`Area "${area.name}" removed successfully`);
      fetchAreas();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to delete area");
    }
  };

  const columns: ColumnDef<Area>[] = [
    {
      accessorKey: "name",
      header: "Area Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      id: "ward",
      header: "Ward",
      cell: ({ row }) =>
        row.original.ward
          ? `W${row.original.ward.wardNumber} - ${row.original.ward.name}`
          : "—",
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
      id: "streets",
      header: "Streets",
      cell: ({ row }) => row.original._count?.streets ?? 0,
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
        <Button
          variant="destructive"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => handleDeleteArea(row.original)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Areas"
        description={`${areas.length} locality areas registered`}
      >
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Area
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingSkeleton count={5} className="lg:grid-cols-1" />
      ) : (
        <DataTable
          columns={columns}
          data={areas}
          searchKey="name"
          searchPlaceholder="Search areas..."
        />
      )}

      {/* Add Area Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add Locality Area</SheetTitle>
            <SheetDescription>
              Add a new geographical area under a designated municipal ward.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateArea} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="area-ward">Select Ward *</Label>
              <Select value={wardId} onValueChange={(val) => setWardId(val ?? "")} required>
                <SelectTrigger id="area-ward">
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
              <Label htmlFor="area-name">Area Name *</Label>
              <Input
                id="area-name"
                placeholder="e.g. Market Square East"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area-desc">Description</Label>
              <Input
                id="area-desc"
                placeholder="Neighborhood details or notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Save Area"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
