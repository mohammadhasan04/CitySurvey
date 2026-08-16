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

interface Street {
  id: string;
  name: string;
}

interface Building {
  id: string;
  name: string;
  houseNumber: string;
  description: string | null;
  street: { id: string; name: string };
  _count: { households: number };
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [streetId, setStreetId] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [description, setDescription] = useState("");

  const fetchBuildings = () => {
    setLoading(true);
    fetch("/api/buildings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBuildings(data.data);
      })
      .catch(() => toast.error("Failed to fetch buildings"))
      .finally(() => setLoading(false));
  };

  const fetchStreets = () => {
    fetch("/api/streets")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStreets(data.data);
      });
  };

  useEffect(() => {
    fetchBuildings();
    fetchStreets();
  }, []);

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !streetId) {
      toast.error("Building name and street selection are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, streetId, houseNumber, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create building");

      toast.success(`Building "${name}" added successfully!`);
      setIsSheetOpen(false);
      setName("");
      setStreetId("");
      setHouseNumber("");
      setDescription("");
      fetchBuildings();
    } catch (err: any) {
      toast.error(err.message || "Failed to add building");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBuilding = async (building: Building) => {
    if (!confirm(`Are you sure you want to delete "${building.name}"?`)) return;

    try {
      const res = await fetch(`/api/buildings?id=${building.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete building");

      toast.success(`Building "${building.name}" removed successfully`);
      fetchBuildings();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete building");
    }
  };

  const columns: ColumnDef<Building>[] = [
    {
      accessorKey: "name",
      header: "Building Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "houseNumber",
      header: "House / Plot #",
      cell: ({ row }) => row.original.houseNumber || "—",
    },
    {
      id: "street",
      header: "Street",
      cell: ({ row }) => row.original.street?.name || "—",
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
          onClick={() => handleDeleteBuilding(row.original)}
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
        title="Buildings"
        description={`${buildings.length} buildings registered`}
      >
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Building
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingSkeleton count={5} className="lg:grid-cols-1" />
      ) : (
        <DataTable
          columns={columns}
          data={buildings}
          searchKey="name"
          searchPlaceholder="Search buildings..."
        />
      )}

      {/* Add Building Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add Building / Structure</SheetTitle>
            <SheetDescription>
              Add a new building structure under a street road.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateBuilding} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="building-street">Select Street *</Label>
              <Select
                value={streetId}
                onValueChange={(val) => setStreetId(val ?? "")}
                required
              >
                <SelectTrigger id="building-street">
                  <SelectValue placeholder="Choose Street..." />
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

            <div className="space-y-2">
              <Label htmlFor="building-name">Building / Apartment Name *</Label>
              <Input
                id="building-name"
                placeholder="e.g. Royal Heights Apartments"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="building-num">Plot / House Number</Label>
              <Input
                id="building-num"
                placeholder="e.g. Plot #42-B"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="building-desc">Description</Label>
              <Input
                id="building-desc"
                placeholder="e.g. Commercial plaza or residential tower"
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
                {isSubmitting ? "Creating..." : "Save Building"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
