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
import { toast } from "sonner";
import { Plus, Shield, ShieldCheck, ShieldX, Trash2, Power } from "lucide-react";

interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CityAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const fetchAdmins = () => {
    setLoading(true);
    fetch("/api/users?role=CITY_ADMIN")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAdmins(data.data);
      })
      .catch(() => toast.error("Failed to fetch admins"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: "CITY_ADMIN",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");

      toast.success(`City Admin ${name} created successfully!`);
      setIsSheetOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: Admin) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: admin.id,
          isActive: !admin.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      toast.success(
        `Admin ${admin.name} is now ${!admin.isActive ? "Active" : "Inactive"}`
      );
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    if (!confirm(`Are you sure you want to remove City Admin "${admin.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${admin.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete admin");

      toast.success(`City Admin "${admin.name}" removed successfully`);
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete admin");
    }
  };

  const columns: ColumnDef<Admin>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
            <Shield className="h-4 w-4 text-blue-500" />
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "—",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? (
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <ShieldX className="h-3 w-3" /> Inactive
            </span>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-IN"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => handleToggleStatus(admin)}
            >
              <Power className="h-3.5 w-3.5" />
              {admin.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => handleDeleteAdmin(admin)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="City Admins" description="Manage city administrator accounts">
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </PageHeader>

      {loading ? (
        <LoadingSkeleton count={5} className="lg:grid-cols-1" />
      ) : (
        <DataTable
          columns={columns}
          data={admins}
          searchKey="name"
          searchPlaceholder="Search admins..."
        />
      )}

      {/* Add City Admin Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add City Administrator</SheetTitle>
            <SheetDescription>
              Create a new City Admin account with full ward management permissions.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateAdmin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name *</Label>
              <Input
                id="admin-name"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address *</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="e.g. rahul.sharma@citysurvey.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-phone">Phone Number</Label>
              <Input
                id="admin-phone"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Initial Password *</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                {isSubmitting ? "Creating..." : "Create City Admin"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
