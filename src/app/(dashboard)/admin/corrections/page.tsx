"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader, LoadingSkeleton } from "@/components/shared/page-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, XCircle, FileEdit } from "lucide-react";

interface CorrectionRequest {
  id: string;
  description: string;
  response: string | null;
  status: string;
  createdAt: string;
  household: { surveyId: string; headOfFamily: string };
  user: { name: string; email: string };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminCorrectionsPage() {
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCorrections = () => {
    setLoading(true);
    fetch("/api/corrections")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCorrections(data.data || []);
      })
      .catch(() => toast.error("Failed to fetch correction requests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/corrections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      toast.success(`Request ${status.toLowerCase()} successfully!`);
      fetchCorrections();
    } catch (err: any) {
      toast.error(err.message || "Failed to update request");
    }
  };

  const columns: ColumnDef<CorrectionRequest>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("en-IN"),
    },
    {
      id: "household",
      header: "Household / Resident",
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-sm">
            {row.original.household?.headOfFamily || row.original.user?.name || "Resident"}
          </span>
          <p className="text-xs text-muted-foreground font-mono">
            {row.original.household?.surveyId || row.original.user?.email || "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Request Details",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge className={statusColors[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        row.original.status === "PENDING" ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-green-600 hover:text-green-700 hover:bg-green-50 gap-1"
              onClick={() => handleUpdateStatus(row.original.id, "APPROVED")}
            >
              <CheckCircle className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
              onClick={() => handleUpdateStatus(row.original.id, "REJECTED")}
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground font-medium">Resolved</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Correction & Verification Requests"
        description="Review, approve, and accept data correction requests submitted by residents"
      />

      {loading ? (
        <LoadingSkeleton count={5} className="lg:grid-cols-1" />
      ) : corrections.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="p-8 text-center">
            <FileEdit className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
            <p className="text-sm text-muted-foreground">
              Data correction requests submitted by residents will appear here for review and approval.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={columns} data={corrections} searchKey="description" searchPlaceholder="Search requests..." />
      )}
    </div>
  );
}
